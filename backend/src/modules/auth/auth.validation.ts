import { z } from "zod";

export const registerSchema =z
    .object({
        name: z
            .string()
            .trim()
            .min(2, "Name msut be atleast two character")
            .max(100, "Name must be less than 100 characters"),

        email: z
            .string()
            .trim()
            .email("valid email address")
            .toLowerCase(),

        password: z
            .string()
            .min(8, "Password must be at least 8 characters")
            .max(100, "Password must be less than 100 characters"),

        confirmPassword: z.string(),

    })

    .refine((data) => data.password === data.confirmPassword, {
        message: "Password donot match",
        path: ["confirmPassword"],
    });

    export type RegisterInput = z.infer<typeof registerSchema>;

    export const loginSchema = z
     .object({
        email: z
         .string()
         .trim()
         .email("Please enter a valid email address")
         .toLowerCase(),

        password: z
         .string()
         .min(1, "Password is required"),
     });

     export type LoginInput = z.infer<typeof loginSchema>;