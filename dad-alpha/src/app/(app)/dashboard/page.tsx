"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { VoiceBriefingButton } from "@/components/dashboard/VoiceBriefing";
import { WinsTeaser } from "@/components/dashboard/WinsTeaser";
import { BalanceTeaser } from "@/components/dashboard/BalanceTeaser";
import { ReferralBanner } from "@/components/dashboard/ReferralBanner";
import * as api from "@/lib/api-client";
import type {
  CalendarConflict,
  SyncDigestItem,
  WeeklyPlanDay,
} from "@/types/api-contracts";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

// ─── Mock fallbacks (dev / mock mode only) ───────────────────────────────────

const MOCK_SYNC_ITEMS: SyncDigestItem[] = [
  { id: "d1", category: "calendar", summary: "Sofia has soccer practice moved to 4:30 PM Thursday", created_at: new Date(Date.now() - 7200000).toISOString() },
  { id: "d2", category: "tasks", summary: "Grocery list updated — added snacks for school lunches", created_at: new Date(Date.now() - 10800000).toISOString() },
  { id: "d3", category: "school", summary: "Permission slip for Science Museum due Friday", created_at: new Date(Date.now() - 18000000).toISOString() },
];

const MOCK_WEEKLY_DAYS: WeeklyPlanDay[] = [
  { date: "today", events: [{ time: "3:30 PM", title: "Soccer Practice", who: "Sofia" }, { time: "7:00 PM", title: "Family Game Night", who: "Family" }] },
  { date: "tomorrow", events: [{ time: "4:00 PM", title: "Piano Lesson", who: "Liam" }, { time: "10:00 AM", title: "Dentist", who: "Mom" }] },
  { date: "thursday", events: [{ time: "9:00 AM", title: "Science Fair", who: "Liam" }, { time: "4:00 PM", title: "Swim Class", who: "Sofia" }] },
];

const MOCK_CONFLICTS: CalendarConflict[] = [
  {
    id: "c1",
    event_a: { title: "Sofia's Soccer", time: "4:00 PM", parent: "Dad" },
    event_b: { title: "Liam's Swim Class", time: "4:00 PM", parent: "Mom" },
    date: "Thursday",
    severity: "overlap",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

/** Map a SyncDigestItem category to the most relevant agent chat route. */
const CATEGORY_AGENT_LINK: Record<string, string> = {
  calendar: "/chat/calendar_whiz",
  school: "/chat/school_event_hub",
  expenses: "/chat/budget_buddy",
  tasks: "/chat/grocery_guru",
  household_ops: "/household-ops",
  general: "/dashboard",
};

const CATEGORY_DOT_COLOR: Record<string, string> = {
  calendar: "bg-brand",
  school: "bg-tertiary",
  expenses: "bg-secondary",
  tasks: "bg-brand",
  household_ops: "bg-brand",
  general: "bg-muted-foreground",
};

const CATEGORY_ICON: Record<string, string> = {
  calendar: "calendar_month",
  school: "school",
  expenses: "receipt_long",
  tasks: "shopping_cart",
  household_ops: "home_repair_service",
  general: "notifications",
};

const CATEGORY_COLOR_TEXT: Record<string, string> = {
  calendar: "text-brand",
  school: "text-tertiary",
  expenses: "text-secondary",
  tasks: "text-brand",
  household_ops: "text-brand",
  general: "text-muted-foreground",
};

function formatRelativeTime(isoString: string): string {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const h = Math.floor(diffMs / 3600000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return "Yesterday";
}

/** Format a WeeklyPlanDay.date (ISO date or label) into a short display label. */
function formatDayLabel(dateStr: string): string {
  // Dates like "today"/"tomorrow" pass through from mock; real dates are ISO strings
  if (!dateStr.includes("-")) return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  const today = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];
  if (dateStr === today) return "Today";
  if (dateStr === tomorrow) return "Tomorrow";
  return new Date(dateStr).toLocaleDateString("en-US", { weekday: "short" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [isMounted, setIsMounted] = useState(false);

  // Dynamic sections
  const [syncItems, setSyncItems] = useState<SyncDigestItem[]>(isMockMode ? MOCK_SYNC_ITEMS : []);
  const [weeklyDays, setWeeklyDays] = useState<WeeklyPlanDay[]>(isMockMode ? MOCK_WEEKLY_DAYS : []);
  const [conflicts, setConflicts] = useState<CalendarConflict[]>(isMockMode ? MOCK_CONFLICTS : []);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(!isMockMode);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!token) { router.replace("/login?mode=signup"); }
  }, [isMounted, token, router]);

  useEffect(() => {
    if (!isMounted || isMockMode || !user?.household_id) return;
    const { household_id } = user;

    Promise.allSettled([
      api.household.syncDigest(household_id),
      api.household.weeklyPlan(household_id),
      api.calendar.conflicts(household_id),
    ]).then(([digestResult, planResult, conflictsResult]) => {
      if (digestResult.status === "fulfilled") setSyncItems(digestResult.value.items);
      if (planResult.status === "fulfilled") setWeeklyDays(planResult.value.days.slice(0, 3));
      if (conflictsResult.status === "fulfilled") setConflicts(conflictsResult.value);
    }).finally(() => setIsLoadingDashboard(false));
  }, [isMounted, user?.household_id]);

  if (!isMounted || !token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-background border-b border-border-subtle/20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <p className="text-alphaai-xs text-muted-foreground">
              Good {getGreeting()}, {user?.name ?? "there"}
            </p>
            <h1 className="font-headline text-alphaai-xl font-bold text-foreground">
              Dad.alpha
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <VoiceBriefingButton />
            <Link
              href="/notifications"
              aria-label="Notifications"
              className="relative w-10 h-10 rounded-full bg-surface-container flex items-center justify-center"
            >
              <span className="material-symbols-outlined dad-icon-md text-foreground">
                notifications
              </span>
            </Link>
          </div>
        </div>
      </header>

      <main id="main-content" className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-4">
        {/* Partner Sync Digest */}
        <section className="dad-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined dad-icon-md text-brand">sync</span>
            <h2 className="font-headline text-alphaai-base font-semibold text-foreground">
              Partner Sync
            </h2>
            {!isLoadingDashboard && syncItems.length > 0 && (
              <span className="text-alphaai-3xs text-muted-foreground ml-auto">
                {formatRelativeTime(syncItems[0].created_at)}
              </span>
            )}
          </div>
          {isLoadingDashboard ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-4 bg-surface-container rounded animate-pulse" />
              ))}
            </div>
          ) : syncItems.length === 0 ? (
            <p className="text-alphaai-sm text-muted-foreground">No updates yet today.</p>
          ) : (
            <div className="space-y-2">
              {syncItems.map((item) => (
                <Link
                  key={item.id}
                  href={CATEGORY_AGENT_LINK[item.category] ?? "/dashboard"}
                  className="flex items-start gap-2 group hover:bg-surface-container-low rounded-lg px-1 py-0.5 -mx-1 transition-colors"
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 ${CATEGORY_DOT_COLOR[item.category] ?? "bg-muted-foreground"}`} />
                  <p className="text-alphaai-sm text-foreground group-hover:text-brand transition-colors">
                    {item.summary}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Weekly Plan */}
        <section className="dad-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined dad-icon-md text-brand">calendar_month</span>
            <h2 className="font-headline text-alphaai-base font-semibold text-foreground">
              This Week
            </h2>
            <Link href="/chat/calendar_whiz" className="text-alphaai-xs text-brand font-medium ml-auto">
              Full view
            </Link>
          </div>
          {isLoadingDashboard ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-surface-container rounded animate-pulse" />
              ))}
            </div>
          ) : weeklyDays.length === 0 ? (
            <p className="text-alphaai-sm text-muted-foreground">No events this week.</p>
          ) : (
            <div className="space-y-2">
              {weeklyDays.map((d) => (
                <div key={d.date} className="flex gap-3">
                  <span className="text-alphaai-xs text-muted-foreground w-16 flex-shrink-0 pt-0.5">
                    {formatDayLabel(d.date)}
                  </span>
                  <div className="flex-1 space-y-1">
                    {d.events.map((event, i) => (
                      <p key={i} className="text-alphaai-sm text-foreground">
                        {event.title} {event.time}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Calendar Conflicts — only rendered when conflicts exist */}
        {!isLoadingDashboard && conflicts.length > 0 && (
          <section className="dad-card p-4 border-l-4 border-secondary">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-symbols-outlined dad-icon-md text-secondary">warning</span>
              <h2 className="font-headline text-alphaai-base font-semibold text-foreground">
                Schedule Conflicts
              </h2>
            </div>
            <div className="space-y-2">
              {conflicts.map((c) => (
                <p key={c.id} className="text-alphaai-sm text-foreground">
                  {c.date} — {c.event_a.title} overlaps with {c.event_b.title}. Both need a parent driver.
                </p>
              ))}
            </div>
            <Link
              href="/chat/calendar_whiz"
              className="mt-2 text-alphaai-xs text-brand font-semibold inline-block hover:underline"
            >
              Resolve with Schedule Sync
            </Link>
          </section>
        )}

        {/* Quick Actions */}
        <section>
          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <Link
              href="/chat/calendar_whiz"
              className="dad-card p-4 flex flex-col items-center gap-2 hover:bg-surface-container-low transition-colors"
            >
              <div className="w-12 h-12 bg-brand-glow/30 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined dad-icon-lg text-brand">calendar_month</span>
              </div>
              <span className="text-alphaai-xs font-medium text-foreground text-center">Schedule Sync</span>
            </Link>
            <Link
              href="/chat/grocery_guru"
              className="dad-card p-4 flex flex-col items-center gap-2 hover:bg-surface-container-low transition-colors"
            >
              <div className="w-12 h-12 bg-brand-glow/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined dad-icon-lg text-brand">shopping_cart</span>
              </div>
              <span className="text-alphaai-xs font-medium text-foreground text-center">Grocery List</span>
            </Link>
            <Link
              href="/chat/budget_buddy"
              className="dad-card p-4 flex flex-col items-center gap-2 hover:bg-surface-container-low transition-colors"
            >
              <div className="w-12 h-12 bg-secondary-container/50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined dad-icon-lg text-secondary">account_balance_wallet</span>
              </div>
              <span className="text-alphaai-xs font-medium text-foreground text-center">Expenses</span>
            </Link>
            <Link
              href="/chat/school_event_hub"
              className="dad-card p-4 flex flex-col items-center gap-2 hover:bg-surface-container-low transition-colors"
            >
              <div className="w-12 h-12 bg-tertiary-container/50 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined dad-icon-lg text-tertiary">school</span>
              </div>
              <span className="text-alphaai-xs font-medium text-foreground text-center">School Hub</span>
            </Link>
            <Link
              href="/checklists"
              className="dad-card p-4 flex flex-col items-center gap-2 hover:bg-surface-container-low transition-colors"
            >
              <div className="w-12 h-12 bg-brand-glow/30 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined dad-icon-lg text-brand">checklist</span>
              </div>
              <span className="text-alphaai-xs font-medium text-foreground text-center">Checklists</span>
            </Link>
            <Link
              href="/household-ops"
              className="dad-card p-4 flex flex-col items-center gap-2 hover:bg-surface-container-low transition-colors"
            >
              <div className="w-12 h-12 bg-brand-glow/20 rounded-xl flex items-center justify-center">
                <span className="material-symbols-outlined dad-icon-lg text-brand">home_repair_service</span>
              </div>
              <span className="text-alphaai-xs font-medium text-foreground text-center">House Ops</span>
            </Link>
          </div>
        </section>

        {/* Co-parent teasers + referral */}
        <WinsTeaser />
        <BalanceTeaser />
        <ReferralBanner />

        {/* Recent Activity — driven from sync digest */}
        {syncItems.length > 0 && (
          <section>
            <h2 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
              Recent Activity
            </h2>
            {isLoadingDashboard ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 bg-surface-container rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {syncItems.map((item) => (
                  <Link
                    key={item.id}
                    href={CATEGORY_AGENT_LINK[item.category] ?? "/dashboard"}
                    className="dad-card p-3 flex items-center gap-3 hover:bg-surface-container-low transition-colors block"
                  >
                    <span className={`material-symbols-outlined dad-icon-sm ${CATEGORY_COLOR_TEXT[item.category] ?? "text-muted-foreground"}`}>
                      {CATEGORY_ICON[item.category] ?? "notifications"}
                    </span>
                    <p className="text-alphaai-sm text-foreground flex-1">{item.summary}</p>
                    <span className="text-alphaai-3xs text-muted-foreground flex-shrink-0">
                      {formatRelativeTime(item.created_at)}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
