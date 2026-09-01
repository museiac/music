"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";

import { GoogleButton } from "./GoogleButton";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { fieldErrorsFromZod, loginSchema, type LoginFormValues } from "@/lib/validation";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  // /verify-email redirects here (with no session — see OtpForm.tsx, the
  // backend's verify-email response carries no token) once the account is
  // verified, so the user still has to log in for real.
  const justVerified = searchParams.get("verified") === "1";
  const prefillEmail = searchParams.get("email") ?? "";

  const [values, setValues] = useState<LoginFormValues>({ email: prefillEmail, password: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>(
    {}
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError(null);

    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const result = await login(parsed.data);

      if (result.requiresVerification && result.userId !== undefined && result.email) {
        router.push(
          `/verify-email?userId=${result.userId}&email=${encodeURIComponent(result.email)}`
        );
        return;
      }

      if (result.user) {
        router.push(result.user.profileCompleted ? "/dashboard" : "/complete-profile");
      }
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {justVerified && !formError && (
        <Alert variant="success">Email verified. Log in to continue.</Alert>
      )}
      {formError && <Alert variant="error">{formError}</Alert>}

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        error={fieldErrors.email}
        disabled={isSubmitting}
        onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        value={values.password}
        error={fieldErrors.password}
        disabled={isSubmitting}
        onChange={(e) => setValues((v) => ({ ...v, password: e.target.value }))}
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? "Logging in…" : "Log in"}
      </Button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        or
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Create one
        </Link>
      </p>
    </form>
  );
}
