import type { User } from "./user";

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

/** POST /api/auth/register response — backend/src/modules/auth/auth.controller.ts */
export interface RegisterResponse {
  success: true;
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    verified: boolean;
    profileCompleted: boolean;
  };
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** POST /api/auth/login when the account has not verified its email yet. */
export interface LoginVerificationRequiredResponse {
  success: true;
  requiresVerification: true;
  message: string;
  userId: number;
  email: string;
}

/** POST /api/auth/login when credentials are valid and the account is verified. */
export interface LoginSuccessResponse {
  success: true;
  message: string;
  accessToken: string;
  user: User;
}

export type LoginResponse =
  | LoginVerificationRequiredResponse
  | LoginSuccessResponse;

export interface VerifyEmailPayload {
  userId: number;
  otp: string;
}

/**
 * POST /api/auth/verify-email response — backend/src/modules/auth/
 * auth.controller.ts. Unlike login, this does NOT return an accessToken or
 * user object: it only flips the account's `verified` flag. There is no
 * session to establish from this response — the frontend sends the user to
 * /login afterward, where the real login call returns a token.
 */
export interface VerifyEmailResponse {
  success: true;
  message: string;
}

/**
 * Everything below this line documents the contract this prompt specified
 * for endpoints that do not exist on the backend yet (verified by reading
 * backend/src/modules/auth/auth.routes.ts, which only wires up /register,
 * /login and /verify-email). The frontend calls these exact paths so wiring
 * them up later is a backend-only change — see the "NOT YET IMPLEMENTED"
 * notes in src/lib/api.ts.
 */

export interface ResendOtpPayload {
  userId: number;
}

export interface ResendOtpResponse {
  success: true;
  message: string;
}

export interface CompleteProfilePayload {
  name: string;
  bio?: string;
}

export interface CompleteProfileResponse {
  success: true;
  message: string;
  user: User;
}

export interface MeResponse {
  success: true;
  user: User;
}

export interface AdminPingResponse {
  success: true;
  message: string;
  userId: number;
}
