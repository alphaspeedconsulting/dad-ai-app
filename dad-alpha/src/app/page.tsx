"use client";

import { useEffect } from "react";
import { LandingPageView } from "@/components/landing/LandingPageView";

export default function LandingPage() {
  useEffect(() => {
    try {
      const raw = localStorage.getItem("dad-alpha-auth");
      if (raw) {
        const parsed = JSON.parse(raw) as { state?: { token?: string } };
        if (parsed?.state?.token) {
          window.location.href = "/dashboard";
        }
      }
    } catch {
      /* ignore malformed storage */
    }
  }, []);

  return <LandingPageView />;
}
