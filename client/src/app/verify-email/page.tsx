"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

import { OtpForm } from "@/components/auth/OtpForm";
import { Alert } from "@/components/ui/Alert";
import { Card } from "@/components/ui/Card";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get("userId");
  const email = searchParams.get("email");
  const userId = userIdParam ? Number(userIdParam) : NaN;

  const isValid = Number.isFinite(userId) && Boolean(email);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Verify your email</h1>
      </div>
      <Card>
        {isValid ? (
          <OtpForm userId={userId} email={email as string} />
        ) : (
          <div className="flex flex-col gap-4">
            <Alert variant="error">
              We&apos;re missing your account details. Please register or log in again to request a
              new verification code.
            </Alert>
            <div className="flex justify-center gap-4 text-sm">
              <Link href="/register" className="font-medium text-brand-600 hover:text-brand-700">
                Register
              </Link>
              <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
                Log in
              </Link>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
