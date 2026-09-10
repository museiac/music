"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  if (!user) return null;

  function handleLogout() {
    logout();
    router.push("/login");
  }

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-8 py-4">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-700">Artist workspace</p>
          <h1 className="display-face mt-2 text-5xl leading-none text-[#17221d]">Good to see you, {user.name}.</h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#69766d]">Your profile is the starting point. Keep it current, then choose the right plan for the work ahead.</p>
        </div>
        <Badge variant={user.verified ? "success" : "warning"}>{user.verified ? "Profile active" : "Verify email"}</Badge>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ["Account", user.email],
          ["Role", user.role],
          ["Profile", user.profileCompleted ? "Complete" : "Needs attention"],
        ].map(([label, value]) => (
          <Card key={label} className="border-[#dce4dc] bg-white/70">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#87958a]">{label}</p>
            <p className="mt-3 truncate text-sm font-bold text-[#17221d]">{value}</p>
          </Card>
        ))}
      </div>

      <Card className="border-[#dce4dc] bg-[#17221d] text-[#f4f8ee] shadow-xl shadow-[#17221d]/10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#c8f169]">Your workspace</p>
            <h2 className="display-face mt-2 text-3xl">The next move is yours.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-[#b7c9ba]">Keep your identity clear, your details current, and your release choices intentional.</p>
          </div>
          <Link href="/complete-profile" className="rounded-full bg-[#c8f169] px-5 py-3 text-center text-sm font-bold text-[#17221d] hover:bg-[#d8fb88]">
            Review profile <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </Card>

      <Card className="flex flex-col gap-5 border-[#dce4dc] bg-white/70">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Role</dt>
            <dd className="mt-1">
              <Badge variant={user.role === "ADMIN" ? "info" : "neutral"}>{user.role}</Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Email verification
            </dt>
            <dd className="mt-1">
              <Badge variant={user.verified ? "success" : "warning"}>
                {user.verified ? "Verified" : "Not verified"}
              </Badge>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Profile completion
            </dt>
            <dd className="mt-1">
              <Badge variant={user.profileCompleted ? "success" : "warning"}>
                {user.profileCompleted ? "Complete" : "Incomplete"}
              </Badge>
            </dd>
          </div>
        </dl>

        <div className="border-t border-gray-100 pt-5">
          <Button variant="outline" className="w-auto px-4" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
