"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { auth, consent as consentApi, ApiError } from "@/lib/api-client";
import type { AuthResponse } from "@/types/api-contracts";

type AuthMode = "login" | "signup";

interface ConsentState {
  terms: boolean;
  privacy: boolean;
  ai_disclosure: boolean;
}

interface AuthFormProps {
  initialMode: AuthMode;
  initialPromo: string;
  showModeToggle: boolean;
}

export function AuthForm({ initialMode, initialPromo, showModeToggle }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [inviteCode, setInviteCode] = useState(() => {
    if (initialPromo) return initialPromo;
    if (typeof window !== "undefined") {
      return localStorage.getItem("dad-alpha-promo-code") ?? "";
    }
    return "";
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const [authPending, setAuthPending] = useState<AuthResponse | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";
  const [consent, setConsent] = useState<ConsentState>({
    terms: false,
    privacy: false,
    ai_disclosure: false,
  });

  const login = useAuthStore((s) => s.login);
  const allConsented = consent.terms && consent.privacy && consent.ai_disclosure;

  const googleAvailable = !!googleClientId;

  const handleGoogleLogin = () => {
    if (!googleClientId) {
      setSubmitError("Google login is not available. Use email sign up below.");
      return;
    }
    setSubmitError("Google OAuth flow is coming next. Use email sign up below for local testing.");
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    if (isMockMode) {
      const mockResponse: AuthResponse = {
        access_token: "mock_token_" + Date.now(),
        token_type: "bearer",
        user: {
          id: "mock_user_1",
          email,
          name: name.trim() || "Dad",
          household_id: "mock_household_1",
          tier: "family_pro",
          consent_current: true,
          parent_brand: "dad",
          household_role: "admin",
          household_membership_status: "active",
        },
      };
      setAuthPending(mockResponse);
      setShowConsent(true);
      setIsSubmitting(false);
      return;
    }

    try {
      const response =
        mode === "signup"
          ? await auth.signup({ email, password, name: name.trim() || "Dad", parent_brand: "dad" })
          : await auth.loginEmail({ email, password });
      setAuthPending(response);
      setShowConsent(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setSubmitError(error.detail);
      } else {
        setSubmitError("Could not sign in right now. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConsentSubmit = async () => {
    if (!authPending) return;

    login(authPending.access_token, authPending.user);

    if (inviteCode.trim()) {
      localStorage.setItem("dad-alpha-promo-code", inviteCode.trim().toUpperCase());
    }

    // Persist consent to backend (token is now in localStorage for the request)
    if (!isMockMode) {
      try {
        await consentApi.accept({
          consents: [
            { document_type: "terms_of_service", document_version: "1.0", document_hash: "accepted" },
            { document_type: "privacy_policy", document_version: "1.0", document_hash: "accepted" },
            { document_type: "ai_disclosure", document_version: "1.0", document_hash: "accepted" },
          ],
        });
      } catch {
        // Non-blocking — user can still proceed; consent will be re-prompted if needed
      }
    }

    if (!authPending.user.household_id) {
      window.location.href = "/settings?onboarding=household";
      return;
    }
    window.location.href = "/dashboard";
  };

  if (showConsent) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-glow/20 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-tertiary-container/30 rounded-full blur-[120px]" />
        </div>

        <div className="dad-card p-8 w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-[48px] text-brand mb-4 block">
              verified_user
            </span>
            <h1 className="font-headline text-alphaai-2xl font-bold text-foreground mb-2">
              Almost there!
            </h1>
            <p className="text-alphaai-sm text-muted-foreground">
              Please review and accept our policies to get started.
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.terms}
                onChange={() => setConsent((c) => ({ ...c, terms: !c.terms }))}
                className="mt-1 w-5 h-5 rounded accent-brand flex-shrink-0"
              />
              <span className="text-alphaai-sm text-foreground">
                I agree to the{" "}
                <Link href="/legal/terms" className="text-brand font-medium underline underline-offset-2">
                  Terms of Service
                </Link>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.privacy}
                onChange={() => setConsent((c) => ({ ...c, privacy: !c.privacy }))}
                className="mt-1 w-5 h-5 rounded accent-brand flex-shrink-0"
              />
              <span className="text-alphaai-sm text-foreground">
                I agree to the{" "}
                <Link href="/legal/privacy" className="text-brand font-medium underline underline-offset-2">
                  Privacy Policy
                </Link>
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consent.ai_disclosure}
                onChange={() => setConsent((c) => ({ ...c, ai_disclosure: !c.ai_disclosure }))}
                className="mt-1 w-5 h-5 rounded accent-brand flex-shrink-0"
              />
              <span className="text-alphaai-sm text-foreground">
                I acknowledge the{" "}
                <Link href="/legal/ai-disclosure" className="text-brand font-medium underline underline-offset-2">
                  AI Disclosure
                </Link>{" "}
                — AI suggestions are not professional advice
              </span>
            </label>
          </div>

          <button
            onClick={handleConsentSubmit}
            disabled={!allConsented}
            className="dad-btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Continue — Start 7-Day Free Trial
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-glow/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-tertiary-container/30 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="w-16 h-16 dad-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px] text-on-primary">
              shield_person
            </span>
          </div>
          <h1 className="font-headline text-alphaai-3xl font-extrabold text-foreground">
            Dad.alpha
          </h1>
          <p className="text-alphaai-sm text-muted-foreground mt-1">
            Your AI co-pilot for family logistics.
          </p>
        </div>

        <div className="dad-card p-6">
          <button
            onClick={handleGoogleLogin}
            type="button"
            disabled={!googleAvailable}
            className={`w-full flex items-center justify-center gap-3 border border-border-subtle/20 rounded-full py-3 px-6 font-medium text-alphaai-base transition-colors mb-4 ${
              googleAvailable
                ? "bg-surface-container-low hover:bg-surface-container text-foreground"
                : "bg-surface-container-low/50 text-muted-foreground opacity-50 cursor-not-allowed"
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>
          {!googleAvailable && (
            <p className="text-alphaai-3xs text-muted-foreground text-center -mt-2 mb-2">
              Google sign-in coming soon — use email below
            </p>
          )}

          <div className="flex items-center gap-4 my-4">
            <div className="flex-1 h-px bg-border-subtle/30" />
            <span className="text-alphaai-xs text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border-subtle/30" />
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-3">
            {mode === "signup" && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                required
                className="dad-input"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              required
              className="dad-input"
            />
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                minLength={8}
                className="dad-input pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {mode === "signup" && (
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.trim().toUpperCase())}
                placeholder="Invite code (optional)"
                className="dad-input"
                aria-label="Beta invite code"
              />
            )}
            <button type="submit" disabled={isSubmitting} className="dad-btn-primary w-full disabled:opacity-60">
              {isSubmitting ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account — 7-Day Free Trial"}
            </button>
            {submitError && (
              <p className="text-alphaai-xs text-error text-center">{submitError}</p>
            )}
          </form>

          {showModeToggle && (
            <p className="text-center text-alphaai-sm text-muted-foreground mt-4">
              {mode === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-brand font-medium"
              >
                {mode === "login" ? "Sign Up" : "Sign In"}
              </button>
            </p>
          )}

          {!showModeToggle && (
            <p className="text-center text-alphaai-sm text-muted-foreground mt-4">
              Already have an account?{" "}
              <Link href="/login" className="text-brand font-medium">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
