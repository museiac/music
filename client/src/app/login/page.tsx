import type { Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = { title: "Log in — Museiac" };

export default function LoginPage() {
  return (
    <div className="mx-auto grid max-w-5xl items-center gap-12 py-8 lg:grid-cols-[0.9fr_1fr] lg:py-16">
      <div className="hidden rounded-[2rem] bg-[#17221d] p-10 text-[#f4f8ee] lg:block">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#c8f169]">Welcome back</p>
        <h1 className="display-face mt-5 text-5xl leading-none">Your next release starts here.</h1>
        <p className="mt-6 text-sm leading-6 text-[#b7c9ba]">Sign in to pick up your profile, plans, and progress.</p>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col gap-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">Artist workspace</p>
          <h1 className="display-face mt-2 text-4xl text-[#17221d]">Welcome back.</h1>
          <p className="mt-2 text-sm text-[#69766d]">Log in to continue building your Museiac profile.</p>
        </div>
        <Card className="border-[#dce4dc] bg-white/80 shadow-xl shadow-[#17221d]/5">
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}
