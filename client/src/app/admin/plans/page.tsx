"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, planApi } from "@/lib/api";
import type { Plan, PlanStatus } from "@/types/plan";

const STATUS_VARIANT: Record<PlanStatus, "success" | "warning" | "neutral"> = {
  ACTIVE: "success",
  INACTIVE: "warning",
  ARCHIVED: "neutral",
};

const NEXT_STATUS: Record<PlanStatus, PlanStatus> = {
  ACTIVE: "INACTIVE",
  INACTIVE: "ACTIVE",
  ARCHIVED: "ACTIVE",
};

export default function AdminPlansPage() {
  const { token, logout } = useAuth();
  const router = useRouter();

  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      // GET /api/plan/admin — real, and (unlike GET /api/plan) properly
      // awaited on the backend, so this one reliably returns an array.
      const result = await planApi.listAll(token);
      setPlans(result.plans);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        router.replace("/login");
        return;
      }
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [token, logout, router]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleStatus(plan: Plan) {
    if (!token || updatingId !== null) return;
    setUpdatingId(plan.id);
    setError(null);
    try {
      await planApi.updateStatus(plan.id, NEXT_STATUS[plan.status], token);
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't update plan status.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Plans</h1>
          <p className="mt-1 text-sm text-gray-500">Create and manage subscription plans.</p>
        </div>
        <Link
          href="/admin/plans/new"
          className="shrink-0 rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
        >
          Create plan
        </Link>
      </div>

      <Card className="p-0 sm:p-0">
        {isLoading ? (
          <div className="p-6">
            <FullPageSpinner label="Loading plans…" />
          </div>
        ) : error ? (
          <div className="p-6">
            <Alert variant="error">{error}</Alert>
          </div>
        ) : !plans || plans.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">
            No plans yet. Create the first one.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-400">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Price</th>
                  <th className="px-4 py-3 font-medium">Duration</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-4 py-3 text-gray-500">{plan.id}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{plan.name}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {plan.price} {plan.currency}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{plan.duration} days</td>
                    <td className="px-4 py-3">
                      <Badge variant={STATUS_VARIANT[plan.status]}>{plan.status}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/plans/${plan.id}/edit`}
                          className="font-medium text-brand-600 hover:text-brand-700"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          disabled={updatingId === plan.id}
                          onClick={() => toggleStatus(plan)}
                          className="font-medium text-gray-600 hover:text-gray-900 disabled:text-gray-400"
                        >
                          {updatingId === plan.id
                            ? "Updating…"
                            : plan.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                        </button>
                      </div>
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
