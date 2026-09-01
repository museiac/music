export type UserRole = "USER" | "ADMIN";

/**
 * Mirrors the safe user object the backend returns from
 * POST /api/auth/register, POST /api/auth/login and (once implemented)
 * POST /api/auth/verify-email — see backend/src/modules/auth/auth.controller.ts.
 */
export interface User {
  id: number;
  name: string;
  email: string;
  verified: boolean;
  profileCompleted: boolean;
  role: UserRole;
}

/**
 * Row shape expected from GET /api/admin/users. That endpoint is not yet
 * implemented on the backend (only GET /api/admin/test exists today) — see
 * the note in src/lib/api.ts.
 */
export interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  verified: boolean;
  profileCompleted: boolean;
  createdAt: string;
}
