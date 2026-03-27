"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthForm } from "@/components/auth/AuthForm";

function SignupInner() {
  const searchParams = useSearchParams();
  const promoFromUrl = searchParams.get("promo")?.trim().toUpperCase() ?? "";
  const initialPromo =
    promoFromUrl ||
    (typeof window !== "undefined"
      ? (localStorage.getItem("dad-alpha-promo-code") ?? "")
      : "");

  return (
    <AuthForm
      initialMode="signup"
      initialPromo={initialPromo}
      showModeToggle={false}
    />
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignupInner />
    </Suspense>
  );
}
