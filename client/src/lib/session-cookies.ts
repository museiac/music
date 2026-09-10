import type { User } from "@/types/user";

/**
 * middleware.ts runs on the server/edge and cannot read localStorage, so it
 * cannot know whether a browser is signed in. These three small cookies
 * mirror non-sensitive flags from the backend's own login/verify response
 * purely so middleware can redirect instantly (no flash of protected
 * content, no redirect loops).
 *
 * They are NOT the source of authorization truth and never hold the JWT
 * itself: every real API call still sends the actual bearer token, and the
 * backend verifies it independently on every request. Client components
 * (see components/auth/ProtectedRoute.tsx) re-check the same conditions
 * against the real auth state as a second line of defense.
 */
export const AUTH_COOKIE = "museiac_auth";
export const PROFILE_COOKIE = "museiac_profile_completed";
export const ROLE_COOKIE = "museiac_role";

function setCookie(name: string, value: string, days = 7): void {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function clearCookie(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

export function setRoutingCookies(user: Pick<User, "profileCompleted" | "role">): void {
  setCookie(AUTH_COOKIE, "1");
  setCookie(PROFILE_COOKIE, String(user.profileCompleted));
  setCookie(ROLE_COOKIE, user.role);
}

export function clearRoutingCookies(): void {
  clearCookie(AUTH_COOKIE);
  clearCookie(PROFILE_COOKIE);
  clearCookie(ROLE_COOKIE);
}
