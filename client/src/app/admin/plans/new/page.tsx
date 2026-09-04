"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { PlanForm } from "@/components/plan/PlanForm";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/hooks/useAuth";
import { planApi } from "@/lib/api";
import type { CreatePlanPayload } from "@/types/plan";

export default function NewPlanPage() {
  const { token } = useAuth();
  const router = useRouter();

  async function handleCreate(payload: CreatePlanPayload) {
    if (!token) throw new Error("You must be logged in.");
    await planApi.create(payload, token);
    router.push("/admin/plans");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/plans" className="text-sm font-medium text-brand-600 hover:text-brand-700">
          ← Back to plans
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-gray-900">Create plan</h1>
      </div>

      <Card className="max-w-xl">
        <PlanForm submitLabel="Create plan" onSubmit={handleCreate} />
      </Card>
    </div>
  );
}
