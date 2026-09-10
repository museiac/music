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
    <header className="border-b border-[#dce4dc] bg-[#f5f7f4]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-[#17221d]">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8f169] text-sm">M</span>
          Museiac
        </Link>

        {isLoading ? null : isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-5 text-sm font-bold text-[#69766d] sm:flex">
              <Link href="/dashboard" className="hover:text-[#17221d]">
                Dashboard
              </Link>
              {user.role === "ADMIN" && (
                <Link href="/admin/dashboard" className="hover:text-[#17221d]">
                  Admin
                </Link>
              )}
            </nav>
            <Badge variant={user.role === "ADMIN" ? "info" : "neutral"}>{user.role}</Badge>
            <span className="hidden text-sm font-semibold text-[#17221d] sm:inline">{user.name}</span>
            <Button variant="outline" className="w-auto rounded-full border-[#b9c3ba] px-4 py-1.5" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        ) : (
            <nav className="flex items-center gap-2 text-sm font-bold">
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-[#69766d] hover:bg-white hover:text-[#17221d]"
            >
              Log in
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-[#17221d] px-4 py-2 text-[#f4f8ee] hover:bg-[#344239]"
            >
              Sign up
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}
