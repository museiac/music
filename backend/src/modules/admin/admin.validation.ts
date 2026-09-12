import { z } from "zod";

export const updateLeadSchema = z.object({
    status: z
        .enum([
            "NEW",
            "CONTACTED",
            "INTERESTED",
            "FOLLOW_UP",
            "CONVERTED",
            "NOT_INTERESTED",
            "LOST",
        ])
        .optional(),

    notes: z
        .string()
        .trim()
        .max(2000, "Notes are too long")
        .nullable()
        .optional(),

    lastContactedAt: z
        .string()
        .datetime()
        .nullable()
        .optional(),

    nextFollowUpAt: z
        .string()
        .datetime()
        .nullable()
        .optional(),

    convertedAt: z
        .string()
        .datetime()
        .nullable()
        .optional(),
});

export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;

export const adminLeadsQuerySchema = z.object({
    page: z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(10),

    search: z
        .string()
        .trim()
        .optional(),

    status: z
        .enum([
            "NEW",
            "CONTACTED",
            "INTERESTED",
            "FOLLOW_UP",
            "CONVERTED",
            "NOT_INTERESTED",
            "LOST",
        ])
        .optional(),

    source: z
        .enum([
            "WEBSITE",
            "REFERRAL",
            "INSTAGRAM",
            "WHATSAPP",
            "MANUAL",
            "OTHER",
        ])
        .optional(),
});

export type AdminLeadsQuery = z.infer<typeof adminLeadsQuerySchema>;