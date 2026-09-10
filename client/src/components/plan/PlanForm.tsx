"use client";

import { useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { fieldErrorsFromZod, planSchema } from "@/lib/validation";
import type { CreatePlanPayload } from "@/types/plan";

export interface PlanFormValues {
  name: string;
  description: string;
  price: string;
  currency: string;
  duration: string;
  featuresText: string;
}

const EMPTY_VALUES: PlanFormValues = {
  name: "",
  description: "",
  price: "",
  currency: "INR",
  duration: "",
  featuresText: "",
};

export function PlanForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues?: Partial<PlanFormValues>;
  submitLabel: string;
  onSubmit: (payload: CreatePlanPayload) => Promise<void>;
}) {
  const [values, setValues] = useState<PlanFormValues>({ ...EMPTY_VALUES, ...initialValues });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof PlanFormValues, string>>>(
    {}
  );
  const [featuresError, setFeaturesError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField<K extends keyof PlanFormValues>(key: K, value: PlanFormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError(null);

    const parsed = planSchema.safeParse({
      name: values.name,
      description: values.description || undefined,
      price: values.price,
      currency: values.currency,
      duration: values.duration,
    });

    const features = values.featuresText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);

    let hasError = false;
    if (!parsed.success) {
      setFieldErrors(fieldErrorsFromZod(parsed.error));
      hasError = true;
    } else {
      setFieldErrors({});
    }

    if (features.length === 0) {
      setFeaturesError("Add at least one feature, one per line");
      hasError = true;
    } else {
      setFeaturesError(undefined);
    }

    if (hasError || !parsed.success) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ ...parsed.data, features });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {formError && <Alert variant="error">{formError}</Alert>}

      <Input
        label="Plan name"
        value={values.name}
        error={fieldErrors.name}
        disabled={isSubmitting}
        onChange={(e) => updateField("name", e.target.value)}
      />

      <Textarea
        label="Description (optional)"
        value={values.description}
        error={fieldErrors.description}
        disabled={isSubmitting}
        onChange={(e) => updateField("description", e.target.value)}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          type="number"
          min={0}
          step="0.01"
          value={values.price}
          error={fieldErrors.price}
          disabled={isSubmitting}
          onChange={(e) => updateField("price", e.target.value)}
        />
        <Input
          label="Currency"
          maxLength={3}
          hint="3-letter code, e.g. INR"
          value={values.currency}
          error={fieldErrors.currency}
          disabled={isSubmitting}
          onChange={(e) => updateField("currency", e.target.value.toUpperCase())}
        />
      </div>

      <Input
        label="Duration (days)"
        type="number"
        min={1}
        step="1"
        value={values.duration}
        error={fieldErrors.duration}
        disabled={isSubmitting}
        onChange={(e) => updateField("duration", e.target.value)}
      />

      <Textarea
        label="Features"
        hint="One feature per line"
        value={values.featuresText}
        error={featuresError}
        disabled={isSubmitting}
        rows={5}
        onChange={(e) => updateField("featuresText", e.target.value)}
      />

      <Button type="submit" isLoading={isSubmitting}>
        {isSubmitting ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}
