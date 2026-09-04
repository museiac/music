"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { PlanForm, type PlanFormValues } from "@/components/plan/PlanForm";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, planApi } from "@/lib/api";
import type { CreatePlanPayload, Plan, PlanStatus } from "@/types/plan";

const STATUS_OPTIONS: PlanStatus[] = ["ACTIVE", "INACTIVE", "ARCHIVED"];

export default function EditPlanPage() {
  const { token } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const planId = Number(params.id);

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [statusValue, setStatusValue] = useState<PlanStatus>("ACTIVE");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    if (!token || !Number.isFinite(planId)) return;

    let cancelled = false;
    async function load() {
      try {
        const result = await planApi.getById(planId, token as string);
        if (cancelled) return;
        setPlan(result.plan);
        setStatusValue(result.plan.status);
      } catch (error) {
        if (cancelled) return;
        setLoadError(error instanceof ApiError ? error.message : "Couldn't load this plan.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, planId]);

  async function handleUpdate(payload: CreatePlanPayload) {
    if (!token) throw new Error("You must be logged in.");
    // PATCH /api/plan/admin/:id has a backend bug — updatePlanController
    // calls updatePlan() without awaiting it, so the `plan` in its response
    // isn't trustworthy. The redirect back to the list re-fetches from
    // GET /api/plan/admin (which is properly awaited) instead of relying on
    // this call's response body.
    await planApi.update(planId, payload, token);
    router.push("/admin/plans");
  }

  async function handleStatusUpdate() {
    if (!token || isUpdatingStatus) return;
    setStatusMessage(null);
    setStatusError(null);
    setIsUpdatingStatus(true);
    try {
      const result = await planApi.updateStatus(planId, statusValue, token);
      setStatusMessage(result.message);
      setPlan((p) => (p ? { ...p, status: statusValue } : p));
    } catch (error) {
      setStatusError(error instanceof ApiError ? error.message : "Couldn't update plan status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  const initialValues: Partial<PlanFormValues> | undefined = plan
    ? {
        name: plan.name,
        description: plan.description ?? "",
        price: plan.price,
        currency: plan.currency,
        duration: String(plan.duration),
        featuresText: plan.features.join("\n"),
      }
    : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/plans" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Back to plans
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-gray-900">Edit plan</h1>
          {plan && <Badge variant={plan.status === "ACTIVE" ? "success" : "neutral"}>{plan.status}</Badge>}
        </div>
      </div>

      {isLoading ? (
        <Card>
          <FullPageSpinner label="Loading plan…" />
        </Card>
      ) : loadError ? (
        <Card>
          <Alert variant="error">{loadError}</Alert>
        </Card>
      ) : (
        <>
          <Card className="max-w-xl">
            <PlanForm key={plan?.id} initialValues={initialValues} submitLabel="Save changes" onSubmit={handleUpdate} />
          </Card>

          <Card className="max-w-xl">
            <h2 className="text-base font-semibold text-gray-900">Status</h2>
            <p className="mt-1 text-sm text-gray-500">
              Active plans are shown to users at /complete-profile. Inactive and archived plans are
              hidden from them but stay editable here.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="plan-status" className="text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="plan-status"
                  value={statusValue}
                  onChange={(e) => setStatusValue(e.target.value as PlanStatus)}
                  className="rounded-md border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                type="button"
                variant="outline"
                className="w-auto px-4"
                isLoading={isUpdatingStatus}
                onClick={handleStatusUpdate}
              >
                {isUpdatingStatus ? "Updating…" : "Update status"}
              </Button>
            </div>
            {statusMessage && (
              <Alert variant="success" className="mt-4">
                {statusMessage}
              </Alert>
            )}
            {statusError && (
              <Alert variant="error" className="mt-4">
                {statusError}
              </Alert>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
