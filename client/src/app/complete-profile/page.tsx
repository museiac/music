"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import {
  completeProfileSchema,
  fieldErrorsFromZod,
  type CompleteProfileFormValues,
} from "@/lib/validation";

function CompleteProfileForm() {
  const router = useRouter();
  const { user, completeProfile } = useAuth();

  const [values, setValues] = useState<CompleteProfileFormValues>({
    name: user?.name ?? "",
    bio: "",
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof CompleteProfileFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError(null);

    const parsed = completeProfileSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      await completeProfile(parsed.data);
      router.push("/dashboard");
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Complete your profile</h1>
        <p className="mt-1 text-sm text-gray-500">
          Just a couple of details before you get to your dashboard.
        </p>
      </div>
      <Card>
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          {formError && <Alert variant="error">{formError}</Alert>}

          <Input
            label="Name"
            value={values.name}
            error={fieldErrors.name}
            disabled={isSubmitting}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
          />

          <Textarea
            label="About you (optional)"
            value={values.bio}
            error={fieldErrors.bio}
            disabled={isSubmitting}
            placeholder="A short bio…"
            onChange={(e) => setValues((v) => ({ ...v, bio: e.target.value }))}
          />

          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? "Saving…" : "Complete profile"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function CompleteProfilePage() {
  return (
    <ProtectedRoute requireIncompleteProfile>
      <CompleteProfileForm />
    </ProtectedRoute>
  );
}
