import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Log in — Museiac" };

export default function LoginPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Welcome back</h1>
        <p className="mt-1 text-sm text-gray-500">Log in to your Museiac account.</p>
      </div>
      <Card>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </Card>
    </div>
  );
}
