"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { authApi, profileApi } from "./api";
import { clearRoutingCookies, setRoutingCookies } from "./session-cookies";
import { clearStoredSession, readStoredSession, writeStoredSession } from "./storage";
import type {
  LoginPayload,
  RegisterPayload,
  ResendOtpPayload,
  VerifyEmailPayload,
} from "@/types/auth";
import type { CreateProfilePayload } from "@/types/profile";
import type { User } from "@/types/user";

export interface LoginResult {
  requiresVerification: boolean;
  userId?: number;
  email?: string;
  user?: User;
}

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<LoginResult>;
  register: (payload: RegisterPayload) => Promise<{ id: number; name: string; email: string }>;
  verifyEmail: (payload: VerifyEmailPayload) => Promise<User>;
  resendOtp: (payload: ResendOtpPayload) => Promise<string>;
  completeProfile: (payload: CreateProfilePayload) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate from localStorage on mount (client-only — see lib/storage.ts).
  useEffect(() => {
    const stored = readStoredSession();
    if (stored) {
      setUser(stored.user);
      setToken(stored.token);
    }
    setIsLoading(false);
  }, []);

  const applySession = useCallback((nextToken: string, nextUser: User) => {
    setToken(nextToken);
    setUser(nextUser);
    writeStoredSession({ token: nextToken, user: nextUser });
    setRoutingCookies(nextUser);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload): Promise<LoginResult> => {
      const result = await authApi.login(payload);

      if ("accessToken" in result) {
        applySession(result.accessToken, result.user);
        return { requiresVerification: false, user: result.user };
      }

      return {
        requiresVerification: true,
        userId: result.userId,
        email: result.email,
      };
    },
    [applySession]
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    // Registration never returns a token (see backend/src/modules/auth/
    // auth.controller.ts) — the account still has to verify its email.
    const result = await authApi.register(payload);
    return result.user;
  }, []);

  const verifyEmail = useCallback(
    async (payload: VerifyEmailPayload) => {
      // POST /api/auth/verify-email returns a real session — same shape as
      // login (see backend/src/modules/auth/auth.controller.ts) — so a
      // verified account is logged straight in.
      const result = await authApi.verifyEmail(payload);
      applySession(result.accessToken, result.user);
      return result.user;
    },
    [applySession]
  );

  const resendOtp = useCallback(async (payload: ResendOtpPayload) => {
    const result = await authApi.resendOtp(payload);
    return result.message ?? "A new code has been sent.";
  }, []);

  const completeProfile = useCallback(
    async (payload: CreateProfilePayload) => {
      if (!token || !user) {
        throw new Error("You must be logged in to complete your profile.");
      }
      // POST /api/profile (backend/src/modules/profile/) is real, but its
      // response only echoes {id, name, userId} for the new Profile row —
      // not the updated User. We know from profile.service.ts that a
      // successful call always flips the user's profileCompleted to true
      // server-side, so that's patched in locally here.
      await profileApi.create(payload, token);
      const nextUser: User = { ...user, name: payload.name, profileCompleted: true };
      setUser(nextUser);
      writeStoredSession({ token, user: nextUser });
      setRoutingCookies(nextUser);
      return nextUser;
    },
    [token, user]
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    clearStoredSession();
    clearRoutingCookies();
    // The backend has no POST /api/auth/logout route today, so there is no
    // request to make — signing out is purely a frontend state reset. If
    // that route is added later, call it here before clearing local state.
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    try {
      const result = await authApi.me(token);
      setUser(result.user);
      writeStoredSession({ token, user: result.user });
      setRoutingCookies(result.user);
    } catch {
      // GET /api/auth/me does not exist on the backend yet; keep whatever
      // user we already have cached rather than surfacing an error here.
    }
  }, [token]);

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: Boolean(user && token),
    isLoading,
    login,
    register,
    verifyEmail,
    resendOtp,
    completeProfile,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
