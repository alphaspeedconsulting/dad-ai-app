"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { useSubscriptionStore } from "@/stores/subscription-store";
import { useHouseholdStore } from "@/stores/household-store";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import * as api from "@/lib/api-client";
import type { GoogleCalendarConnectionStatus } from "@/types/api-contracts";
import Link from "next/link";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

const IS_BETA = process.env.NEXT_PUBLIC_BETA_MODE === "true";

const MOCK_GOOGLE_STATUS: GoogleCalendarConnectionStatus = {
  connected: false,
  email: null,
  scopes: [],
  connected_at: null,
};

const PRICES = {
  family: { monthly: "$7.99/mo", yearly: "$69.99/yr" },
  family_pro: { monthly: "$14.99/mo", yearly: "$129.99/yr" },
} as const;

const BRAND_LABELS = {
  mom: "Mom",
  dad: "Dad",
  neutral: "Parent",
} as const;

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const updateUser = useAuthStore((s) => s.updateUser);
  const { openPortal, startCheckout } = useSubscriptionStore();
  const {
    members, usage, latestInvite, error: householdError,
    isLoading: isHouseholdLoading,
    createHousehold, joinHousehold, fetchMembers, fetchUsage, inviteCoParent, clearError,
  } = useHouseholdStore();
  const { permission, subscribe } = usePushNotifications();

  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [promoCode, setPromoCode] = useState("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [householdName, setHouseholdName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [googleStatus, setGoogleStatus] = useState<GoogleCalendarConnectionStatus | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.household_id) return;
    fetchMembers(user.household_id);
    fetchUsage(user.household_id);
  }, [user?.household_id, fetchMembers, fetchUsage]);

  useEffect(() => {
    if (isMockMode) {
      setGoogleStatus(MOCK_GOOGLE_STATUS);
      return;
    }
    setIsGoogleLoading(true);
    api.googleCalendar
      .connectionStatus()
      .then((status) => setGoogleStatus(status))
      .catch(() => setGoogleStatus({ connected: false, email: null, scopes: [], connected_at: null }))
      .finally(() => setIsGoogleLoading(false));
  }, []);

  const handleGoogleConnect = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    try {
      const redirectUri = `${window.location.origin}/settings?google_callback=1`;
      const { auth_url } = await api.googleCalendar.connect(redirectUri);
      window.location.href = auth_url;
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "Could not start Google connection.");
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    setIsGoogleLoading(true);
    setGoogleError(null);
    try {
      await api.googleCalendar.disconnect();
      setGoogleStatus({ connected: false, email: null, scopes: [], connected_at: null });
    } catch (err) {
      setGoogleError(err instanceof Error ? err.message : "Could not disconnect Google Calendar.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleUpgrade = async (tier: "family" | "family_pro") => {
    setIsCheckingOut(true);
    try { await startCheckout(tier, billingCycle, promoCode.trim() || undefined); }
    catch { setIsCheckingOut(false); }
  };

  const handleCreateHousehold = async () => {
    if (!householdName.trim()) return;
    const household = await createHousehold(householdName.trim());
    if (!household) return;
    updateUser({ household_id: household.id, household_role: "admin", household_membership_status: "active" });
    await Promise.all([fetchMembers(household.id), fetchUsage(household.id)]);
    setHouseholdName("");
  };

  const handleJoinHousehold = async () => {
    if (!inviteToken.trim()) return;
    const household = await joinHousehold({ invite_token: inviteToken.trim() });
    if (!household) return;
    updateUser({ household_id: household.id, household_role: "member", household_membership_status: "active" });
    await Promise.all([fetchMembers(household.id), fetchUsage(household.id)]);
    setInviteToken("");
  };

  const handleInviteCoParent = async () => {
    if (!user?.household_id || !inviteEmail.trim()) return;
    await inviteCoParent(user.household_id, {
      email: inviteEmail.trim(),
      parent_brand: "mom",
      role: "member",
    });
    setInviteEmail("");
  };

  const handleCopyInviteToken = async () => {
    if (!latestInvite?.invite_token) return;
    try {
      await navigator.clipboard.writeText(latestInvite.invite_token);
      setCopyState("copied");
      window.setTimeout(() => setCopyState("idle"), 2000);
    } catch { setCopyState("idle"); }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-headline text-alphaai-xl font-bold text-foreground">Settings</h1>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-20 pb-4 space-y-6">
        {/* Profile */}
        <section className="dad-card p-4 flex items-center gap-4">
          <div className="w-14 h-14 dad-gradient-hero rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px] text-on-primary">person</span>
          </div>
          <div className="flex-1">
            <p className="font-headline text-alphaai-md font-semibold text-foreground">{user?.name ?? "Dad"}</p>
            <p className="text-alphaai-xs text-muted-foreground">{user?.email}</p>
            <div className="flex gap-2 mt-1">
              <span className="dad-chip text-alphaai-3xs">{user?.tier?.replace("_", " ") ?? "Trial"}</span>
              {user?.parent_brand && (
                <span className="dad-chip text-alphaai-3xs">
                  {BRAND_LABELS[user.parent_brand]} view
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">Notifications</h3>
          <div className="dad-card divide-y divide-border-subtle/10">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-alphaai-sm font-medium text-foreground">Push Notifications</p>
                <p className="text-alphaai-3xs text-muted-foreground">
                  {permission === "granted" ? "Enabled" : "Enable to receive alerts"}
                </p>
              </div>
              {permission !== "granted" ? (
                <button onClick={subscribe} className="dad-btn-primary text-alphaai-xs py-2 px-4">Enable</button>
              ) : (
                <span className="material-symbols-outlined text-[20px] text-brand">check_circle</span>
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-alphaai-sm font-medium text-foreground">Partner Sync Digest</p>
                <p className="text-alphaai-3xs text-muted-foreground">Morning summary at 7:00 AM</p>
              </div>
              <div className="dad-toggle" data-active="true" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-alphaai-sm font-medium text-foreground">Quiet Hours</p>
                <p className="text-alphaai-3xs text-muted-foreground">10:00 PM — 7:00 AM</p>
              </div>
              <div className="dad-toggle" data-active="true" />
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">Subscription</h3>
          <div className="dad-card p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-alphaai-sm font-medium text-foreground">Current Plan</p>
                <p className="text-alphaai-xs text-muted-foreground capitalize">{user?.tier?.replace("_", " ") ?? "Free Trial"}</p>
              </div>
              {user?.tier !== "trial" && (
                <button onClick={openPortal} className="dad-btn-outline text-alphaai-xs py-2 px-4">Manage</button>
              )}
            </div>
            {user?.tier === "trial" && (
              <>
                <div className="flex gap-1 p-1 bg-surface rounded-xl mb-3">
                  <button
                    onClick={() => setBillingCycle("monthly")}
                    className={`flex-1 py-2 rounded-lg text-alphaai-xs font-semibold transition-colors ${
                      billingCycle === "monthly" ? "bg-brand text-white" : "text-muted-foreground"
                    }`}
                  >Monthly</button>
                  <button
                    onClick={() => setBillingCycle("yearly")}
                    className={`flex-1 py-2 rounded-lg text-alphaai-xs font-semibold transition-colors ${
                      billingCycle === "yearly" ? "bg-brand text-white" : "text-muted-foreground"
                    }`}
                  >Yearly <span className="text-alphaai-3xs opacity-80">save 27%</span></button>
                </div>
                <div className="flex gap-2 mb-3">
                  <button onClick={() => handleUpgrade("family")} disabled={isCheckingOut}
                    className="flex-1 dad-btn-primary text-alphaai-xs py-2 disabled:opacity-60">
                    <span className="font-semibold block">Family</span>
                    <span className="text-alphaai-3xs opacity-90 block">{PRICES.family[billingCycle]}</span>
                  </button>
                  <button onClick={() => handleUpgrade("family_pro")} disabled={isCheckingOut}
                    className="flex-1 dad-btn-outline text-alphaai-xs py-2 disabled:opacity-60">
                    <span className="font-semibold block">Family Pro</span>
                    <span className="text-alphaai-3xs opacity-90 block">{PRICES.family_pro[billingCycle]}</span>
                  </button>
                </div>
                {IS_BETA && (
                  <input type="text" value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value.trim().toUpperCase())}
                    placeholder="Beta invite code (optional)"
                    className="w-full bg-surface border border-border-subtle/20 rounded-xl px-4 py-2 text-alphaai-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-brand"
                  />
                )}
              </>
            )}
          </div>
        </section>

        {/* Household */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">Household & Co-Parent</h3>
          <div className="dad-card p-4 space-y-3">
            {!user?.household_id ? (
              <>
                <div className="space-y-2">
                  <label className="text-alphaai-xs text-muted-foreground">Create a household</label>
                  <div className="flex gap-2">
                    <input value={householdName} onChange={(e) => setHouseholdName(e.target.value)}
                      placeholder="Franco Family" className="dad-input flex-1" />
                    <button onClick={handleCreateHousehold}
                      disabled={isHouseholdLoading || !householdName.trim()}
                      className="dad-btn-primary text-alphaai-xs py-2 px-3 disabled:opacity-60">Create</button>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-alphaai-xs text-muted-foreground">Join via invite token</label>
                  <div className="flex gap-2">
                    <input value={inviteToken} onChange={(e) => setInviteToken(e.target.value)}
                      placeholder="Paste invite token" className="dad-input flex-1" />
                    <button onClick={handleJoinHousehold}
                      disabled={isHouseholdLoading || !inviteToken.trim()}
                      className="dad-btn-outline text-alphaai-xs py-2 px-3 disabled:opacity-60">Join</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-alphaai-xs text-muted-foreground">Invite co-parent</label>
                  <div className="flex gap-2">
                    <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="partner@email.com" className="dad-input flex-1" type="email" />
                    <button onClick={handleInviteCoParent}
                      disabled={isHouseholdLoading || !inviteEmail.trim() || user.household_role !== "admin"}
                      className="dad-btn-primary text-alphaai-xs py-2 px-3 disabled:opacity-60">Invite</button>
                  </div>
                </div>
                {latestInvite?.invite_token && (
                  <div className="rounded-xl border border-border-subtle/20 bg-surface p-3 space-y-2">
                    <p className="text-alphaai-3xs text-muted-foreground">Latest invite token</p>
                    <p className="text-alphaai-xs font-mono text-foreground break-all">{latestInvite.invite_token}</p>
                    <button onClick={handleCopyInviteToken} className="dad-btn-outline text-alphaai-3xs py-1 px-3">
                      {copyState === "copied" ? "Copied" : "Copy token"}
                    </button>
                  </div>
                )}
                {members.length > 0 && (
                  <div className="rounded-xl border border-border-subtle/20 divide-y divide-border-subtle/10">
                    {members.map((member) => (
                      <div key={member.operator_id} className="p-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-alphaai-xs font-medium text-foreground">{member.name}</p>
                          <p className="text-alphaai-3xs text-muted-foreground">{member.email ?? "No email"} · {member.role}</p>
                        </div>
                        {member.parent_brand && (
                          <span className="dad-chip text-alphaai-3xs">{BRAND_LABELS[member.parent_brand as keyof typeof BRAND_LABELS]}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {usage && (
                  <div className="rounded-xl border border-border-subtle/20 bg-surface p-3">
                    <p className="text-alphaai-xs text-foreground">
                      Monthly usage: {usage.calls_used} / {usage.calls_limit} calls ({usage.usage_pct}%)
                    </p>
                  </div>
                )}
              </>
            )}
            {householdError && (
              <div className="rounded-xl border border-error/20 bg-error/10 p-3">
                <p className="text-alphaai-xs text-error">{householdError}</p>
                <button onClick={clearError} className="text-alphaai-3xs text-error/80 underline mt-1">Dismiss</button>
              </div>
            )}
          </div>
        </section>

        {/* Connected Accounts */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Connected Accounts
          </h3>
          <div className="dad-card p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px] text-foreground">calendar_month</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-alphaai-sm font-medium text-foreground">Google Calendar</p>
                <p className="text-alphaai-3xs text-muted-foreground">
                  {isGoogleLoading
                    ? "Checking…"
                    : googleStatus?.connected
                    ? `Connected${googleStatus.email ? ` as ${googleStatus.email}` : ""}`
                    : "Not connected"}
                </p>
              </div>
              {!isGoogleLoading && (
                googleStatus?.connected ? (
                  <button
                    onClick={handleGoogleDisconnect}
                    className="dad-btn-outline text-alphaai-xs py-1.5 px-3 flex-shrink-0"
                  >
                    Disconnect
                  </button>
                ) : (
                  <button
                    onClick={handleGoogleConnect}
                    className="dad-btn-primary text-alphaai-xs py-1.5 px-3 flex-shrink-0"
                  >
                    Connect
                  </button>
                )
              )}
            </div>
            {googleError && (
              <p className="text-alphaai-xs text-error">{googleError}</p>
            )}
            {user?.tier !== "family_pro" && (
              <div className="rounded-xl border border-border-subtle/20 bg-surface-container-low/50 p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-muted-foreground">lock</span>
                <p className="text-alphaai-3xs text-muted-foreground">
                  Google Calendar sync with household ops is a{" "}
                  <Link href="/settings" className="text-brand underline">
                    Family Pro
                  </Link>{" "}
                  feature.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Legal */}
        <section>
          <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">Legal & Privacy</h3>
          <div className="dad-card divide-y divide-border-subtle/10">
            <Link href="/legal/terms" className="p-4 flex items-center gap-3">
              <span className="text-alphaai-sm text-foreground flex-1">Terms of Service</span>
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">chevron_right</span>
            </Link>
            <Link href="/legal/privacy" className="p-4 flex items-center gap-3">
              <span className="text-alphaai-sm text-foreground flex-1">Privacy Policy</span>
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">chevron_right</span>
            </Link>
            <Link href="/legal/ai-disclosure" className="p-4 flex items-center gap-3">
              <span className="text-alphaai-sm text-foreground flex-1">AI Disclosure</span>
              <span className="material-symbols-outlined text-[18px] text-muted-foreground">chevron_right</span>
            </Link>
          </div>
        </section>

        {/* Sign out */}
        <section>
          <button onClick={() => { logout(); window.location.href = "/"; }}
            className="w-full dad-card p-4 flex items-center gap-3 hover:bg-error/5 transition-colors">
            <span className="material-symbols-outlined text-[20px] text-error">logout</span>
            <span className="text-alphaai-sm font-medium text-error">Sign Out</span>
          </button>
        </section>
      </main>
    </div>
  );
}
