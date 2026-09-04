"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { PlanPickerCard } from "@/components/plan/PlanPickerCard";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { FullPageSpinner } from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";
import { ApiError, planApi } from "@/lib/api";
import { completeProfileSchema } from "@/lib/validation";
import type { Plan } from "@/types/plan";

type Step = "name" | "plan";

function StepHeader({ step, title }: { step: 1 | 2; title: string }) {
  return (
    <div className="text-center">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-600">Step {step} of 2</p>
      <h1 className="mt-1 text-2xl font-semibold text-gray-900">{title}</h1>
    </div>
  );
}

function CompleteProfileWizard() {
  const router = useRouter();
  const { user, token, completeProfile } = useAuth();

  // A profile created earlier (profileCompleted already true when this page
  // is opened) skips straight to plan selection instead of asking for a
  // name again. This is captured once on mount, not re-derived on every
  // render — completeProfile() below flips profileCompleted to true after
  // step 1, and this page should stay on step 2 when that happens, not jump
  // back to step 1.
  const [step, setStep] = useState<Step>(() => (user?.profileCompleted ? "plan" : "name"));

  // --- Step 1: name → POST /api/profile ---
  const [name, setName] = useState(user?.name ?? "");
  const [nameError, setNameError] = useState<string | undefined>();
  const [nameFormError, setNameFormError] = useState<string | null>(null);
  const [isSavingName, setIsSavingName] = useState(false);

  async function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSavingName) return;

    setNameFormError(null);

    const parsed = completeProfileSchema.safeParse({ name });
    if (!parsed.success) {
      setNameError(parsed.error.issues[0]?.message);
      return;
    }
    setNameError(undefined);
    setIsSavingName(true);

    try {
      await completeProfile(parsed.data);
      setStep("plan");
    } catch (error) {
      // "Profile already exist" (backend/src/modules/profile/profile.service.ts)
      // means this account already finished this step — move on instead of
      // showing an error for something that isn't actually a problem.
      if (error instanceof ApiError && /already exist/i.test(error.message)) {
        setStep("plan");
        return;
      }
      setNameFormError(
        error instanceof ApiError ? error.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsSavingName(false);
    }
  }

  // --- Step 2: plan → GET /api/plan (real, public) ---
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  useEffect(() => {
    if (step !== "plan" || plans !== null) return;

    let cancelled = false;

    async function loadPlans() {
      try {
        const result = await planApi.listActive();
        // GET /api/plan has a backend bug — plan.controller.ts's
        // getActivePlanController calls getActivePlans() without awaiting
        // it, so `plans` can come back as `{}` instead of an array. Fall
        // back to an empty list rather than crash the wizard over it.
        if (!cancelled) setPlans(Array.isArray(result.plans) ? result.plans : []);
      } catch (error) {
        if (cancelled) return;
        setPlansError(
          error instanceof ApiError ? error.message : "Couldn't load plans. Please try again."
        );
        setPlans([]);
      }
    }

    loadPlans();
    return () => {
      cancelled = true;
    };
  }, [step, plans]);

  async function finish(planId: number | null) {
    if (isFinishing) return;
    setIsFinishing(true);

    // There is no subscription-creation route on the backend yet — the
    // Subscription model in schema.prisma has no controller or route at
    // all. This call is real (not faked) but expected to 404 today; it
    // never blocks onboarding either way, since a missing backend route
    // isn't something the user can act on.
    if (token) {
      try {
        await planApi.subscribe({ planId }, token);
      } catch {
        // ignore — see note above
      }
    }

    router.push("/dashboard");
  }

  if (step === "name") {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <StepHeader step={1} title="What should we call you?" />
        <Card>
          <form onSubmit={handleNameSubmit} noValidate className="flex flex-col gap-5">
            {nameFormError && <Alert variant="error">{nameFormError}</Alert>}

            <Input
              label="Name"
              value={name}
              error={nameError}
              disabled={isSavingName}
              onChange={(e) => setName(e.target.value)}
            />

            <Button type="submit" isLoading={isSavingName}>
              {isSavingName ? "Saving…" : "Next"}
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <StepHeader step={2} title="Choose your plan" />

      {plansError && <Alert variant="error">{plansError}</Alert>}

      {plans === null ? (
        <Card>
          <FullPageSpinner label="Loading plans…" />
        </Card>
      ) : plans.length === 0 ? (
        <Card>
          <p className="text-center text-sm text-gray-500">No plans are available right now.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <PlanPickerCard
              key={plan.id}
              plan={plan}
              selected={selectedPlanId === plan.id}
              onSelect={() => setSelectedPlanId(plan.id)}
            />
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          isLoading={isFinishing}
          disabled={selectedPlanId === null}
          onClick={() => finish(selectedPlanId)}
        >
          {isFinishing ? "Setting up…" : "Continue with selected plan"}
        </Button>
        <Button type="button" variant="outline" isLoading={isFinishing} onClick={() => finish(null)}>
          Try for free
        </Button>
      </div>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <ProtectedRoute profileGate="none">
      <CompleteProfileWizard />
    </ProtectedRoute>
  );
}
