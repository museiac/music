"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { FullPageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";

type ProfileGate = "require-complete" | "require-incomplete" | "none";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Only allow role === "ADMIN". Always implies profileGate "none". */
  adminOnly?: boolean;
  /**
   * "require-complete" (default, e.g. /dashboard): bounce to /complete-profile
   * until the profile is done. "require-incomplete": only used by nothing
   * today (see profileGate "none" below for why /complete-profile doesn't
   * use it). "none" (e.g. /complete-profile): just requires auth — the page
   * manages its own step flow regardless of profileCompleted, since that
   * flag flips to true partway through the wizard (after the name step,
   * before plan selection) and shouldn't yank the user to /dashboard mid-flow.
   */
  profileGate?: ProfileGate;
}

/**
 * Client-side authority check. middleware.ts already redirects most cases
 * before a protected page ever renders (using lightweight routing cookies),
 * but that is a UX convenience, not the source of truth — this component is
 * the real check against live auth state, and re-runs on every render so a
 * token that expires mid-session (see backend/src/utils/jwt.ts — 15 minute
 * expiry) still gets caught the next time a guarded page is visited.
 */
export function ProtectedRoute({
  children,
  adminOnly = false,
  profileGate = "require-complete",
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const gate: ProfileGate = adminOnly ? "none" : profileGate;
  const forbiddenForRole = adminOnly && user && user.role !== "ADMIN";
  const needsProfileCompletion = gate === "require-complete" && user && !user.profileCompleted;
  const profileAlreadyComplete = gate === "require-incomplete" && user?.profileCompleted;

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }
    if (forbiddenForRole) {
      router.replace("/dashboard");
      return;
    }
    if (profileAlreadyComplete) {
      router.replace("/dashboard");
      return;
    }
    if (needsProfileCompletion) {
      router.replace("/complete-profile");
    }
  }, [isLoading, isAuthenticated, user, forbiddenForRole, profileAlreadyComplete, needsProfileCompletion, router]);

  if (
    isLoading ||
    !isAuthenticated ||
    !user ||
    forbiddenForRole ||
    profileAlreadyComplete ||
    needsProfileCompletion
  ) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
}
