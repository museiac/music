"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { otpSchema } from "@/lib/validation";

const RESEND_COOLDOWN_SECONDS = 60;

export function OtpForm({ userId, email }: { userId: number; email: string }) {
  const router = useRouter();
  const { verifyEmail, resendOtp } = useAuth();

  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>();
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isVerifying) return;

    setFormError(null);
    setSuccessMessage(null);

    const parsed = otpSchema.safeParse({ otp });
    if (!parsed.success) {
      setOtpError(parsed.error.issues[0]?.message);
      return;
    }
    setOtpError(undefined);
    setIsVerifying(true);

    try {
      const message = await verifyEmail({ userId, otp: parsed.data.otp });
      // Verifying does not log the user in — the backend response carries
      // no token (see lib/auth-context.tsx) — so send them to /login next,
      // where a real login call will return the actual session. Leave the
      // form disabled (isVerifying stays true) during the pause so it can't
      // be resubmitted before the redirect happens.
      setSuccessMessage(message || "Email verified.");
      setTimeout(() => {
        router.push(`/login?verified=1&email=${encodeURIComponent(email)}`);
      }, 1200);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
      setIsVerifying(false);
    }
  }

  async function handleResend() {
    if (isResending || cooldown > 0) return;

    setFormError(null);
    setSuccessMessage(null);
    setIsResending(true);

    try {
      const message = await resendOtp({ userId });
      setSuccessMessage(message);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setIsResending(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="text-sm text-gray-500">
        We sent a 6-digit code to <span className="font-medium text-gray-900">{email}</span>. Enter
        it below to verify your email.
      </p>

      {formError && <Alert variant="error">{formError}</Alert>}
      {successMessage && !formError && <Alert variant="success">{successMessage}</Alert>}

      <form onSubmit={handleVerify} noValidate className="flex flex-col gap-5">
        <Input
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="123456"
          value={otp}
          error={otpError}
          disabled={isVerifying}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
        />

        <Button type="submit" isLoading={isVerifying}>
          {isVerifying ? "Verifying…" : "Verify email"}
        </Button>
      </form>

      <Button
        type="button"
        variant="outline"
        isLoading={isResending}
        disabled={cooldown > 0}
        onClick={handleResend}
      >
        {isResending ? "Sending…" : cooldown > 0 ? `Resend code (${cooldown}s)` : "Resend code"}
      </Button>
    </div>
  );
}
