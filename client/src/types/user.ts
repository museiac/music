export type UserRole = "USER" | "ADMIN";

/**
 * Mirrors the safe user object returned by the auth and current-user routes.
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
 * Row shape returned by GET /api/admin/users.
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
