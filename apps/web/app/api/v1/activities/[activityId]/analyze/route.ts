import { classifyScreenshot } from "@/lib/ai/classifier";
import { refreshDailySummary } from "@/lib/daily-summary";
import { getDatabase } from "@/lib/database";
import { authenticateDevice, deviceUnauthorized } from "@/lib/device-auth";
import { mkdirSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = new Map([["image/jpeg", ".jpg"], ["image/png", ".png"], ["image/webp", ".webp"]]);

type Activity = {
  id: string; user_id: string; domain: string; page_title: string | null;
  duration_seconds: number; interaction_count: number; scroll_percentage: number; started_at: string;
};

export async function POST(request: Request, { params }: { params: Promise<{ activityId: string }> }) {
  const device = authenticateDevice(request);
  if (!device) return deviceUnauthorized();
  const { activityId } = await params;
  const database = getDatabase();
  const activity = database.prepare(
    `select id, user_id, domain, page_title, duration_seconds, interaction_count, scroll_percentage, started_at
     from activities where id = ? and device_id = ?`,
  ).get(activityId, device.id) as Activity | undefined;
  if (!activity) return Response.json({ error: "Activity not found." }, { status: 404 });

  const form = await request.formData();
  const screenshot = form.get("screenshot");
  if (!(screenshot instanceof File) || !IMAGE_TYPES.has(screenshot.type)) {
    return Response.json({ error: "A JPEG, PNG, or WebP screenshot is required." }, { status: 415 });
  }
  if (screenshot.size > MAX_IMAGE_BYTES) return Response.json({ error: "Screenshot exceeds the 4 MB limit." }, { status: 413 });
  const buffer = Buffer.from(await screenshot.arrayBuffer());
  const extension = IMAGE_TYPES.get(screenshot.type)!;
  const root = path.resolve(process.cwd(), process.env.SCREENSHOT_DIR ?? "./uploads/screenshots");
  const directory = path.join(root, activity.user_id);
  const screenshotPath = path.join(directory, `${activity.id}${extension}`);
  mkdirSync(directory, { recursive: true });
  writeFileSync(screenshotPath, buffer, { mode: 0o600 });
  database.prepare("update activities set analysis_status = 'processing', screenshot_path = ?, updated_at = ? where id = ?")
    .run(screenshotPath, new Date().toISOString(), activity.id);

  try {
    const analysis = await classifyScreenshot(buffer, {
      domain: activity.domain, pageTitle: activity.page_title, durationSeconds: activity.duration_seconds,
      interactionCount: activity.interaction_count, scrollPercentage: activity.scroll_percentage,
    });
    const settings = database.prepare("select auto_delete_screenshots from user_settings where user_id = ?")
      .get(activity.user_id) as { auto_delete_screenshots: number } | undefined;
    const shouldDelete = settings?.auto_delete_screenshots !== 0 || analysis.result.sensitivityLevel === "high";
    if (shouldDelete) unlinkSync(screenshotPath);
    database.prepare(
      `update activities set category=?, activity_name=?, summary=?, application_name=?, productivity_level=?,
       confidence=?, sensitivity_level=?, analysis_status=?, screenshot_path=?, updated_at=? where id=?`,
    ).run(analysis.result.category, analysis.result.activityName, analysis.result.summary, analysis.result.applicationName,
      analysis.result.productivityLevel, analysis.result.confidence, analysis.result.sensitivityLevel,
      analysis.result.sensitivityLevel === "high" ? "sensitive" : "completed", shouldDelete ? null : screenshotPath,
      new Date().toISOString(), activity.id);
    refreshDailySummary(activity.user_id, activity.started_at.slice(0, 10));
    return Response.json({ ...analysis.result, provider: analysis.provider, screenshotDeleted: shouldDelete });
  } catch (error) {
    try { unlinkSync(screenshotPath); } catch { /* cleanup is best effort */ }
    database.prepare("update activities set analysis_status='failed', screenshot_path=null, updated_at=? where id=?")
      .run(new Date().toISOString(), activity.id);
    return Response.json({ error: error instanceof Error ? error.message : "Analysis failed." }, { status: 500 });
  }
}

