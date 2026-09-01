import type { User } from "@/types/user";

const STORAGE_KEY = "museiac_session";

export interface StoredSession {
  token: string;
  user: User;
}

/**
 * The backend issues a stateless JWT with no cookie and no refresh token
 * (see backend/src/utils/jwt.ts — 15 minute expiry, Authorization: Bearer
 * only). Persisting {token, user} here is what lets the app attach the
 * bearer token to requests and survive a page refresh; it is never used to
 * decide whether a request is *authorized* — the backend does that on every
 * call.
 */
export function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (parsed && typeof parsed.token === "string" && parsed.user) {
      return parsed as StoredSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeStoredSession(session: StoredSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    // Storage can throw in private-browsing modes; auth state simply won't
    // survive a refresh in that case.
  }
}

export function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
