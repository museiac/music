"use client";

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
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Museiac</h1>
        <p className="mt-1 text-gray-600">Welcome, {user.name}</p>
      </div>

      <Card className="flex flex-col gap-5">
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
