import { z } from "zod";

export const PLAN_CODES = ["IGNITE", "ELITE", "ALPHA", "MAESTRO"] as const;
export type PlanCode = (typeof PLAN_CODES)[number];
export const createPlanSchema = z.object({
  code: z.enum(PLAN_CODES),
  name: z.string().min(2).max(80),
  pricePaise: z.number().int().min(0),
  interval: z.enum(["MONTHLY", "YEARLY"]).default("YEARLY"),
  artistSlots: z.number().int().min(1).max(100),
  features: z.array(z.string()).default([]),
});
export type CreatePlanInput = z.infer<typeof createPlanSchema>;

export function formatPaise(paise: number): string {
  return `Rs.${(paise / 100).toLocaleString("en-IN")}`;
}
