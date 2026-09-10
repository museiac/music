import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE, PROFILE_COOKIE, ROLE_COOKIE } from "@/lib/session-cookies";

/**
 * Edge-level redirects for a snappier UX (no flash of protected content).
 * This is a convenience layer only — it reads lightweight cookies the
 * client mirrors from the backend's own login/verify response (see
 * lib/session-cookies.ts), never the JWT itself, and never decides API
 * authorization. Real authorization happens on the backend on every
 * request, and components/auth/ProtectedRoute.tsx re-checks the same
 * conditions client-side against live auth state as a second line of
 * defense.
 */
const PUBLIC_ONLY_ROUTES = ["/login", "/register"];
const PROTECTED_PREFIXES = ["/dashboard", "/complete-profile", "/admin"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAuthed = request.cookies.get(AUTH_COOKIE)?.value === "1";
  const profileCompleted = request.cookies.get(PROFILE_COOKIE)?.value === "true";
  const role = request.cookies.get(ROLE_COOKIE)?.value;

  if (pathname === "/") {
    if (isAuthed) {
      const destination = profileCompleted ? "/dashboard" : "/complete-profile";
      return NextResponse.redirect(new URL(destination, request.url));
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    if (!isAuthed) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    if (pathname.startsWith("/dashboard") && !profileCompleted) {
      return NextResponse.redirect(new URL("/complete-profile", request.url));
    }
    if (pathname.startsWith("/complete-profile") && profileCompleted) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (PUBLIC_ONLY_ROUTES.includes(pathname) && isAuthed) {
    return NextResponse.redirect(
      new URL(profileCompleted ? "/dashboard" : "/complete-profile", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/register", "/dashboard/:path*", "/complete-profile", "/admin/:path*"],
};
