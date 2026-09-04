import { features } from "node:process";
import { z } from "zod";

export const createPlanSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Plan name must be at least 2 characters")
        .max(100, "Plan name is too long"),
    
    description: z
        .string()
        .trim()
        .max(500, "Description is too long")
        .optional(),
    
    price: z
        .number()
        .min(0, "Price cannot be negative"),

    currency: z
        .string()
        .trim()
        .length(3, "Currency must be 3 characters")
        .default("INR"),

    duration: z
        .number()
        .int()
        .positive("Duration must be greater than 0"),

    features: z
        .array(z.string().trim().min(1))
        .min(1, "At least one feature is required"),
});

export const updatePlanSchema = createPlanSchema.partial();

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;