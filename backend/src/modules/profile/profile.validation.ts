import { z } from "zod";

export const profileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Profile Name must be at least 2 charcters")
        .max(100, "Profile Name must less than 100 characters")
});

export type ProfileInput = z.infer<typeof profileSchema>;