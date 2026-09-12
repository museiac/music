import { z } from "zod";

export const profileSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Profile Name must be at least 2 characters")
        .max(100, "Profile Name must be less than 100 characters"),

    stageName: z
        .string()
        .trim()
        .min(2, "Stage name must be at least 2 characters")
        .max(100, "Stage name must be less than 100 characters")
        .optional(),

    language: z
        .string()
        .trim()
        .min(2, "Language must be at least 2 characters")
        .max(50, "Language must be less than 50 characters")
        .optional(),

    genre: z
        .string()
        .trim()
        .min(2, "Genre must be at least 2 characters")
        .max(50, "Genre must be less than 50 characters")
        .optional(),

    phone: z
        .string()
        .trim()
        .max(20, "Phone number is too long")
        .optional(),

    socials: z
        .array(
            z.object({
                platform: z.enum([
                    "SPOTIFY",
                    "INSTAGRAM",
                    "YOUTUBE",
                    "SOUNDCLOUD",
                    "APPLE_MUSIC",
                    "FACEBOOK",
                    "X",
                    "TIKTOK",
                    "WEBSITE",
                    "OTHER",
                ]),
                url: z.string().trim().url("Invalid social URL"),
            })
        )
        .optional(),
});

export type ProfileInput = z.infer<typeof profileSchema>;