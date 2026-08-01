import { analysisResultSchema, type AnalysisResult } from "@neotrace/shared";

type Metadata = {
  domain: string;
  pageTitle?: string | null;
  durationSeconds: number;
  interactionCount: number;
  scrollPercentage: number;
};

const DOMAIN_RULES: Array<[RegExp, AnalysisResult["category"], string, AnalysisResult["productivityLevel"]]> = [
  [/github|gitlab|bitbucket|stackoverflow|localhost/i, "Software Development", "Reviewing software development work", "productive"],
  [/docs|developer|mdn|wikipedia/i, "Documentation", "Reading technical documentation", "productive"],
  [/gmail|outlook|mail|slack|teams/i, "Communication", "Managing work communication", "neutral"],
  [/linkedin|indeed|naukri|wellfound/i, "Job Search", "Reviewing career opportunities", "productive"],
  [/figma|canva|dribbble/i, "Design", "Working on a visual design", "productive"],
  [/youtube|netflix|spotify/i, "Entertainment", "Viewing entertainment content", "neutral"],
  [/instagram|facebook|reddit|twitter|x\.com/i, "Social Media", "Browsing social media", "neutral"],
  [/amazon|flipkart|shop/i, "Shopping", "Reviewing products online", "neutral"],
  [/bank|finance|stripe|paypal/i, "Sensitive", "Sensitive financial page excluded", "unknown"],
];

function fallbackAnalysis(metadata: Metadata): AnalysisResult {
  const match = DOMAIN_RULES.find(([pattern]) => pattern.test(metadata.domain));
  const category = match?.[1] ?? "Other";
  const activityName = match?.[2] ?? "Reviewing a browser page";
  const productivityLevel = match?.[3] ?? "unknown";
  return {
    category,
    activityName,
    summary: category === "Sensitive" ? "A sensitive page was excluded from visual description." : `${activityName} on ${metadata.domain}.`,
    applicationName: metadata.domain.replace(/^www\./, "").split(".")[0] || metadata.domain,
    productivityLevel,
    sensitivityLevel: category === "Sensitive" ? "high" : "low",
    confidence: match ? 0.62 : 0.4,
  };
}

function ollamaPrompt(metadata: Metadata) {
  return `You classify one browser activity. Return only JSON matching the requested schema.
Do not transcribe names, email addresses, messages, passwords, authentication codes, financial values, or other personal data.
If the image is sensitive, set sensitivityLevel to high and give only a generic description.
Domain: ${metadata.domain}
Page title: ${metadata.pageTitle ?? "not stored"}
Duration seconds: ${metadata.durationSeconds}
Interaction count: ${metadata.interactionCount}
Scroll percentage: ${metadata.scrollPercentage}`;
}

export async function classifyScreenshot(image: Buffer, metadata: Metadata): Promise<{ result: AnalysisResult; provider: "ollama" | "local-rules" }> {
  const baseUrl = process.env.OLLAMA_BASE_URL ?? "http://127.0.0.1:11434";
  const model = process.env.OLLAMA_VISION_MODEL ?? "llava:7b";
  try {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      signal: AbortSignal.timeout(45_000),
      body: JSON.stringify({
        model,
        stream: false,
        format: "json",
        messages: [{ role: "user", content: ollamaPrompt(metadata), images: [image.toString("base64")] }],
        options: { temperature: 0.1 },
      }),
    });
    if (!response.ok) throw new Error(`Ollama returned ${response.status}`);
    const payload = await response.json() as { message?: { content?: string } };
    const parsed = analysisResultSchema.safeParse(JSON.parse(payload.message?.content ?? "{}"));
    if (!parsed.success) throw new Error("Ollama returned invalid structured output");
    return { result: parsed.data, provider: "ollama" };
  } catch {
    return { result: fallbackAnalysis(metadata), provider: "local-rules" };
  }
}

