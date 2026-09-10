import type { Metadata } from "next";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Create account — Museiac" };

export default function RegisterPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Create your account</h1>
        <p className="mt-1 text-sm text-gray-500">Start testing the Museiac backend.</p>
      </div>
      <Card>
        <RegisterForm />
      </Card>
    </div>
  );
}
