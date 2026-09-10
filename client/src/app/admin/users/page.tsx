"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { adminApi, ApiError } from "@/lib/api";
import type { AdminUserRow } from "@/types/user";

export default function AdminUsersPage() {
  const { token, logout } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<AdminUserRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function load() {
      try {
        // GET /api/admin/users is protected by authenticate + requireAdmin.
        const result = await adminApi.listUsers(token as string);
        if (!cancelled) setUsers(result.users);
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          logout();
          router.replace("/login");
          return;
        }
        setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, logout, router]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Users</h1>
        <p className="mt-1 text-sm text-gray-500">All accounts registered with Museiac.</p>
      </div>

      <Card className="p-0 sm:p-0">
        {isLoading ? (
          <div className="p-6">
            <FullPageSpinner label="Loading users…" />
          </div>
        ) : error ? (
          <div className="p-6">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : !users || users.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Role</th>
                  <th className="px-4 py-3 font-medium">Verified</th>
                  <th className="px-4 py-3 font-medium">Profile</th>
                  <th className="px-4 py-3 font-medium">Created at</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((row) => (
                  <tr key={row.id}>
                    <td className="px-4 py-3 text-gray-500">{row.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.name}</td>
                    <td className="px-4 py-3 text-gray-600">{row.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={row.role === "ADMIN" ? "info" : "neutral"}>{row.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={row.verified ? "success" : "warning"}>
                        {row.verified ? "Yes" : "No"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={row.profileCompleted ? "success" : "warning"}>
                        {row.profileCompleted ? "Complete" : "Incomplete"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(row.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
