export type PlanStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

/**
 * Mirrors the Plan model (backend/prisma/schema.prisma) as it comes back
 * from GET /api/plan, /api/plan/admin, etc. Prisma's Decimal (`price`)
 * serializes to a string over JSON, not a number.
 */
export interface Plan {
  id: number;
  name: string;
  description: string | null;
  price: string;
  currency: string;
  duration: number;
  features: string[];
  status: PlanStatus;
  createdAt: string;
  updatedAt: string;
}

/** POST /api/plan/admin body — backend/src/modules/plan/plan.validate.ts */
export interface CreatePlanPayload {
  name: string;
  description?: string;
  price: number;
  currency: string;
  duration: number;
  features: string[];
}

/** PATCH /api/plan/admin/:id body — same shape, every field optional. */
export type UpdatePlanPayload = Partial<CreatePlanPayload>;
