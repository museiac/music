import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
});

export type Pagination = z.infer<typeof paginationSchema>;
export type ApiSuccess<T> = { data: T; meta?: { page: number; perPage: number; total: number } };
export type ApiError = { error: { code: string; message: string; fields?: Record<string, string> } };
