"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { GoogleButton } from "./GoogleButton";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import {
  fieldErrorsFromZod,
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validation";

const initialValues: RegisterFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function RegisterForm() {
  const router = useRouter();
  const { register } = useAuth();

  const [values, setValues] = useState<RegisterFormValues>(initialValues);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterFormValues, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof RegisterFormValues>(key: K, value: RegisterFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError(null);

    const parsed = registerSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      return;
    }
    setFieldErrors({});
    setIsSubmitting(true);

    try {
      const user = await register(parsed.data);
      router.push(`/verify-email?userId=${user.id}&email=${encodeURIComponent(user.email)}`);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert variant="error">{formError}</Alert>}

      <Input
        label="Full name"
        autoComplete="name"
        value={values.name}
        error={fieldErrors.name}
        disabled={isSubmitting}
        onChange={(e) => updateField("name", e.target.value)}
      />

      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={values.email}
        error={fieldErrors.email}
        disabled={isSubmitting}
        onChange={(e) => updateField("email", e.target.value)}
      />

      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        value={values.password}
        error={fieldErrors.password}
        hint={fieldErrors.password ? undefined : "At least 8 characters."}
        disabled={isSubmitting}
        onChange={(e) => updateField("password", e.target.value)}
      />

      <Input
        label="Confirm password"
        type="password"
        autoComplete="new-password"
        value={values.confirmPassword}
        error={fieldErrors.confirmPassword}
        disabled={isSubmitting}
        onChange={(e) => updateField("confirmPassword", e.target.value)}
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-gray-400">
        <span className="h-px flex-1 bg-gray-200" />
        or
        <span className="h-px flex-1 bg-gray-200" />
      </div>

      <GoogleButton />

      <p className="text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </form>
  );
}
