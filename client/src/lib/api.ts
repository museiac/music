import { toDisplayMessage } from "./errors";
import type {
  AdminPingResponse,
  LoginPayload,
  LoginResponse,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
  ResendOtpPayload,
  ResendOtpResponse,
  VerifyEmailPayload,
  VerifyEmailResponse,
} from "@/types/auth";
import type { CreatePlanPayload, Plan, UpdatePlanPayload } from "@/types/plan";
import type { CreateProfilePayload, CreateProfileResponse } from "@/types/profile";
import type { AdminUserRow } from "@/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
  signal?: AbortSignal;
}

/**
 * Single place every HTTP call to the backend goes through. Attaches the
 * bearer token when one is supplied, normalizes error responses into
 * ApiError with a user-safe message, and never invents a success response —
 * every function in this file performs a real fetch.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, token, signal } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch {
    throw new ApiError(toDisplayMessage(0), 0, null);
  }

  const text = await res.text();
  let data: { message?: string; success?: boolean } | null = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    throw new ApiError(toDisplayMessage(res.status, data?.message), res.status, data);
  }

  return data as T;
}

/**
 * Auth endpoints. register/login/verifyEmail are wired to the real,
 * currently-live backend routes in backend/src/modules/auth/auth.routes.ts.
 *
 * resendOtp and me are NOT implemented on the backend yet (auth.routes.ts
 * only registers POST /register, POST /login and POST /verify-email) —
 * calling them today will fail with a 404. They call the exact paths/bodies
 * this project's contract specifies so hooking them up later is purely a
 * backend change; nothing in the frontend needs to move. There is no
 * "complete profile" route under /auth at all — see profileApi.create below
 * for the real one, under /api/profile.
 */
export const authApi = {
  register: (payload: RegisterPayload) =>
    request<RegisterResponse>("/auth/register", { method: "POST", body: payload }),

  login: (payload: LoginPayload) =>
    request<LoginResponse>("/auth/login", { method: "POST", body: payload }),

  verifyEmail: (payload: VerifyEmailPayload) =>
    request<VerifyEmailResponse>("/auth/verify-email", { method: "POST", body: payload }),

  // NOT YET IMPLEMENTED ON THE BACKEND — see note above.
  resendOtp: (payload: ResendOtpPayload) =>
    request<ResendOtpResponse>("/auth/resend-otp", { method: "POST", body: payload }),

  // NOT YET IMPLEMENTED ON THE BACKEND — see note above.
  me: (token: string) => request<MeResponse>("/auth/me", { method: "GET", token }),

  // The backend does not expose POST /api/auth/logout. Sign-out is handled
  // entirely on the frontend (clear stored token/user) — see
  // lib/auth-context.tsx. Nothing to call here.
};

/**
 * Admin endpoints. ping() hits the real, currently-live
 * GET /api/admin/test route (backend/src/modules/admin/admin.routes.ts),
 * protected by `authenticate` + `requireAdmin`. listUsers() targets
 * GET /api/admin/users, which the backend does not implement yet — only
 * /api/admin/test exists today.
 */
export const adminApi = {
  ping: (token: string) => request<AdminPingResponse>("/admin/test", { method: "GET", token }),

  // NOT YET IMPLEMENTED ON THE BACKEND — see note above.
  listUsers: (token: string) =>
    request<{ success: true; users: AdminUserRow[] }>("/admin/users", {
      method: "GET",
      token,
    }),
};

/**
 * Profile endpoint — real and live, backend/src/modules/profile/. There is
 * only a create; no GET or update exists, and Profile only stores `name`.
 * Creating one flips the user's profileCompleted flag server-side, but the
 * response doesn't echo the updated user, so callers patch that locally.
 */
export const profileApi = {
  create: (payload: CreateProfilePayload, token: string) =>
    request<CreateProfileResponse>("/profile", { method: "POST", body: payload, token }),
};

/**
 * Plan endpoints — real and live, backend/src/modules/plan/. listActive()
 * is public (no auth). Everything under /admin requires an ADMIN bearer
 * token.
 *
 * Two backend response quirks to know about (not fixed here, see
 * plan.controller.ts): getActivePlanController and updatePlanController
 * both call their service function without `await`, so `plans`/`plan` in
 * those two responses can come back as `{}` instead of real data — this
 * file's callers treat that defensively (see `/complete-profile` and
 * `/admin/plans/[id]/edit`) rather than trusting those two response bodies.
 *
 * There is also no subscription-creation route yet (the Subscription model
 * in schema.prisma has no controller/route at all), so choosing a plan
 * can't actually be persisted server-side today — see `subscribe` below.
 */
export const planApi = {
  listActive: () => request<{ success: true; plans: Plan[] }>("/plan", { method: "GET" }),

  listAll: (token: string) =>
    request<{ success: true; plans: Plan[] }>("/plan/admin", { method: "GET", token }),

  getById: (id: number, token: string) =>
    request<{ success: true; plan: Plan }>(`/plan/admin/${id}`, { method: "GET", token }),

  create: (payload: CreatePlanPayload, token: string) =>
    request<{ success: true; message: string; plan: Plan }>("/plan/admin", {
      method: "POST",
      body: payload,
      token,
    }),

  update: (id: number, payload: UpdatePlanPayload, token: string) =>
    request<{ success: true; message: string; plan: Plan }>(`/plan/admin/${id}`, {
      method: "PATCH",
      body: payload,
      token,
    }),

  updateStatus: (id: number, status: Plan["status"], token: string) =>
    request<{ success: true; message: string; plan: Plan }>(`/plan/admin/${id}/status`, {
      method: "PATCH",
      body: { status },
      token,
    }),

  // NOT YET IMPLEMENTED ON THE BACKEND — see note above. Attempted from the
  // plan-selection step of /complete-profile; failing here never blocks
  // onboarding since there's nothing the frontend can do about a missing
  // backend route.
  subscribe: (payload: { planId: number | null }, token: string) =>
    request<{ success: true; message: string }>("/plan/subscribe", {
      method: "POST",
      body: payload,
      token,
    }),
};
