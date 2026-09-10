"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { adminApi, ApiError } from "@/lib/api";

export default function AdminDashboardPage() {
  const { user, token, logout } = useAuth();
  const router = useRouter();

  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    async function load() {
      try {
        // Calls the real, currently-live GET /api/admin/test route — see
        // backend/src/modules/admin/admin.routes.ts.
        const result = await adminApi.ping(token as string);
        if (!cancelled) setMessage(result.message);
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
        <h1 className="text-2xl font-semibold text-gray-900">Admin dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Signed in as {user?.email}</p>
      </div>

      <Card>
        {isLoading ? (
          <FullPageSpinner label="Calling GET /api/admin/test…" />
        ) : error ? (
          <Alert variant="error">{error}</Alert>
        ) : (
          <Alert variant="success">{message}</Alert>
        )}
      </Card>

      <Link
        href="/admin/users"
        className="text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        Manage users →
      </Link>
    </div>
  );
}
