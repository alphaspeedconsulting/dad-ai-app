"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { CardSkeleton } from "@/components/shared/Skeleton";

const isMockMode = process.env.NEXT_PUBLIC_MOCK_MODE === "true";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (!token) { router.replace("/login?mode=signup"); }
  }, [isMounted, token, router]);

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
          <Link
            href="/settings"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center"
          >
            <span className="material-symbols-outlined dad-icon-md text-foreground">
              notifications
            </span>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-background" />
          </Link>
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
            <span className="text-alphaai-3xs text-muted-foreground ml-auto">
              Updated 2h ago
            </span>
          </div>
          <div className="space-y-2">
            <Link
              href="/chat/calendar_whiz"
              className="flex items-start gap-2 group hover:bg-surface-container-low rounded-lg px-1 py-0.5 -mx-1 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-brand mt-2 flex-shrink-0" />
              <p className="text-alphaai-sm text-foreground group-hover:text-brand transition-colors">
                Sofia has soccer practice moved to 4:30 PM Thursday
              </p>
            </Link>
            <Link
              href="/chat/grocery_guru"
              className="flex items-start gap-2 group hover:bg-surface-container-low rounded-lg px-1 py-0.5 -mx-1 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 flex-shrink-0" />
              <p className="text-alphaai-sm text-foreground group-hover:text-brand transition-colors">
                Grocery list updated — added snacks for school lunches
              </p>
            </Link>
            <Link
              href="/chat/school_event_hub"
              className="flex items-start gap-2 group hover:bg-surface-container-low rounded-lg px-1 py-0.5 -mx-1 transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-2 flex-shrink-0" />
              <p className="text-alphaai-sm text-foreground group-hover:text-brand transition-colors">
                Permission slip for Science Museum due Friday
              </p>
            </Link>
          </div>
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
          <div className="space-y-2">
            {[
              { day: "Today", items: ["Soccer Practice 3:30 PM", "Family Game Night 7 PM"] },
              { day: "Tomorrow", items: ["Piano Lesson 4 PM", "Dentist (Mom) 10 AM"] },
              { day: "Thursday", items: ["Science Fair 9 AM", "Swim Class 4 PM"] },
            ].map((d) => (
              <div key={d.day} className="flex gap-3">
                <span className="text-alphaai-xs text-muted-foreground w-16 flex-shrink-0 pt-0.5">
                  {d.day}
                </span>
                <div className="flex-1 space-y-1">
                  {d.items.map((item) => (
                    <p key={item} className="text-alphaai-sm text-foreground">{item}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Calendar Conflicts */}
        <section className="dad-card p-4 border-l-4 border-secondary">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined dad-icon-md text-secondary">warning</span>
            <h2 className="font-headline text-alphaai-base font-semibold text-foreground">
              Schedule Conflicts
            </h2>
          </div>
          <p className="text-alphaai-sm text-foreground">
            Thursday 4 PM — Sofia&apos;s Soccer overlaps with Liam&apos;s Swim Class. Both need a parent driver.
          </p>
          <Link
            href="/chat/calendar_whiz"
            className="mt-2 text-alphaai-xs text-brand font-semibold inline-block hover:underline"
          >
            Resolve with Schedule Sync
          </Link>
        </section>

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

        {/* Activity Feed */}
        <section>
          <h2 className="font-headline text-alphaai-md font-semibold text-foreground mb-3">
            Recent Activity
          </h2>
          <div className="space-y-2">
            {[
              { icon: "shopping_cart", text: "Grocery list synced — 12 items", time: "1h ago", color: "text-brand", href: "/chat/grocery_guru" },
              { icon: "receipt_long", text: "$47.50 at Target (groceries)", time: "3h ago", color: "text-secondary", href: "/chat/budget_buddy" },
              { icon: "school", text: "Spring Concert added to calendar", time: "5h ago", color: "text-tertiary", href: "/chat/school_event_hub" },
              { icon: "calendar_month", text: "Weekly plan generated for Mar 24-30", time: "Yesterday", color: "text-brand", href: "/chat/calendar_whiz" },
            ].map((item, i) => (
              <Link key={i} href={item.href} className="dad-card p-3 flex items-center gap-3 hover:bg-surface-container-low transition-colors block">
                <span className={`material-symbols-outlined dad-icon-sm ${item.color}`}>
                  {item.icon}
                </span>
                <p className="text-alphaai-sm text-foreground flex-1">{item.text}</p>
                <span className="text-alphaai-3xs text-muted-foreground flex-shrink-0">{item.time}</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
