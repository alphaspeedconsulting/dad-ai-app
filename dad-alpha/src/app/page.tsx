"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LandingPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("dad-alpha-auth");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.state?.token) {
          window.location.href = "/dashboard";
          return;
        }
      }
    } catch {}
    setIsAuthenticated(false);
  }, []);

  if (isAuthenticated === null) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-glow/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-tertiary-container/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-md">
        <div className="w-20 h-20 dad-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-6">
          <span className="material-symbols-outlined text-[40px] text-on-primary">
            shield_person
          </span>
        </div>

        <h1 className="font-headline text-alphaai-display font-extrabold text-foreground mb-3">
          Dad.alpha
        </h1>
        <p className="text-alphaai-lg text-muted-foreground mb-2">
          Your AI co-pilot for family logistics.
        </p>
        <p className="text-alphaai-sm text-muted-foreground mb-10 max-w-sm mx-auto">
          Stay in sync with your partner, manage schedules, track expenses, and never miss a school event.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/login?mode=signup"
            className="dad-btn-primary text-alphaai-md px-8 py-4"
          >
            Get Started Free
          </Link>
          <Link
            href="/login"
            className="dad-btn-outline text-alphaai-md px-8 py-4"
          >
            Sign In
          </Link>
        </div>

        <p className="text-alphaai-xs text-muted-foreground mt-8">
          7-day free trial. No credit card required.
        </p>
      </div>
    </div>
  );
}
