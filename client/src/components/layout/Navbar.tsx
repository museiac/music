"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-gray-900">
          Museiac
        </Link>

        {isLoading ? null : isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-4 text-sm font-medium text-gray-600 sm:flex">
              <Link href="/dashboard" className="hover:text-gray-900">
                Dashboard
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin/dashboard" className="hover:text-gray-900">
                  Admin
                </Link>
              )}
            </nav>
            <Badge variant={user.role === "ADMIN" ? "info" : "neutral"}>{user.role}</Badge>
            <span className="hidden text-sm text-gray-700 sm:inline">{user.name}</span>
            <Button variant="outline" className="w-auto px-3 py-1.5" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        ) : (
          <nav className="flex items-center gap-2 text-sm font-medium">
            <Link
              href="/login"
              className="rounded-md px-3 py-1.5 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
            >
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
