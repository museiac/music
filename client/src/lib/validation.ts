import { z } from "zod";

/**
 * Mirrors backend/src/modules/auth/auth.validation.ts exactly (name 2-100
 * chars, valid email, password 8-100 chars, confirmPassword must match) so
 * the frontend rejects bad input with the same rules before it ever reaches
 * the backend.
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z.string().trim().email("Enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(100, "Password must be less than 100 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const otpSchema = z.object({
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

/**
 * Mirrors backend/src/modules/profile/profile.validation.ts exactly. The
 * Profile model only has a `name` column — there is no bio/about field on
 * the backend to save one to.
 */
export const completeProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Profile name must be at least 2 characters")
    .max(100, "Profile name must be less than 100 characters"),
});

export type CompleteProfileFormValues = z.infer<typeof completeProfileSchema>;

/**
 * Mirrors backend/src/modules/plan/plan.validate.ts's createPlanSchema
 * exactly (name 2-100, description optional ≤500, price ≥0, currency
 * exactly 3 chars, duration a positive integer). `updatePlanSchema` on the
 * backend is just `createPlanSchema.partial()`, so the same shape is reused
 * here for both create and edit forms — the edit form just doesn't require
 * every field to be re-entered before submitting.
 */
export const planSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Plan name must be at least 2 characters")
    .max(100, "Plan name is too long"),
  description: z.string().trim().max(500, "Description is too long").optional(),
  price: z.coerce
    .number({ invalid_type_error: "Enter a price" })
    .min(0, "Price cannot be negative"),
  currency: z
    .string()
    .trim()
    .toUpperCase()
    .length(3, "Currency must be a 3-letter code, e.g. INR"),
  duration: z.coerce
    .number({ invalid_type_error: "Enter a duration" })
    .int("Duration must be a whole number of days")
    .positive("Duration must be greater than 0"),
});

export type PlanFormValues = z.infer<typeof planSchema>;

/** Flattens a ZodError into `{ fieldName: firstMessage }` for form display. */
export function fieldErrorsFromZod<T extends Record<string, unknown>>(
  error: z.ZodError<T>
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof T;
    if (key !== undefined && !errors[key]) {
      errors[key] = issue.message;
    }
  }
  return errors;
}
