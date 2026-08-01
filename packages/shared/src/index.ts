import { z } from "zod";

export const PRODUCTIVITY_LEVELS = [
  "productive",
  "neutral",
  "distracting",
  "unknown",
] as const;

export const ACTIVITY_CATEGORIES = [
  "Software Development",
  "Communication",
  "Finance",
  "Administration",
  "Research",
  "Documentation",
  "Education",
  "Job Search",
  "Project Management",
  "Design",
  "Entertainment",
  "Social Media",
  "Shopping",
  "News",
  "Other",
  "Sensitive",
] as const;

export const activityInputSchema = z.object({
  clientActivityId: z.string().min(1).max(100),
  sessionId: z.string().min(1),
  url: z.url().optional(),
  domain: z.string().min(1).max(253),
  pageTitle: z.string().max(500).optional(),
  startedAt: z.iso.datetime(),
  endedAt: z.iso.datetime(),
  durationSeconds: z.number().int().nonnegative().max(86_400),
  interactionCount: z.number().int().nonnegative().default(0),
  scrollPercentage: z.number().int().min(0).max(100).default(0),
});

export const analysisResultSchema = z.object({
  category: z.enum(ACTIVITY_CATEGORIES),
  activityName: z.string().min(1).max(120),
  summary: z.string().min(1).max(500),
  applicationName: z.string().min(1).max(100),
  productivityLevel: z.enum(PRODUCTIVITY_LEVELS),
  sensitivityLevel: z.enum(["low", "medium", "high", "unknown"]),
  confidence: z.number().min(0).max(1),
});

export type ActivityInput = z.infer<typeof activityInputSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;

