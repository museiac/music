"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { FullPageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Only allow role === "ADMIN". */
  adminOnly?: boolean;
  /** For /complete-profile: only render while the profile is NOT complete yet. */
  requireIncompleteProfile?: boolean;
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
  requireIncompleteProfile = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const needsProfileCompletion = !requireIncompleteProfile && !adminOnly && user && !user.profileCompleted;
  const profileAlreadyComplete = requireIncompleteProfile && user?.profileCompleted;
  const forbiddenForRole = adminOnly && user && user.role !== "ADMIN";

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
