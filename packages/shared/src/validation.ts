import { z } from "zod";

export const identifySchema = z.object({
  id: z.string().optional(),
  email: z.string().email().optional(),
  plan: z.string().optional(),
  role: z.string().optional(),
  traits: z.record(z.unknown()).optional()
});

export const widgetEventSchema = z.object({
  event: z.enum(["view", "open", "dismiss", "click", "cta_click", "subscribe", "tour_start", "tour_complete", "feature_used"]),
  projectId: z.string().min(1),
  entryId: z.string().optional(),
  visitorId: z.string().min(1),
  userId: z.string().optional(),
  pageUrl: z.string().url().optional(),
  payload: z.record(z.unknown()).default({})
});

export type WidgetEventPayload = z.infer<typeof widgetEventSchema>;
