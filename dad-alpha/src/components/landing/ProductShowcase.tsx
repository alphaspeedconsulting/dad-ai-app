import type { ReactNode } from "react";
import { PhoneMockupDashboard } from "./PhoneMockupDashboard";
import { PhoneMockupCalendar } from "./PhoneMockupCalendar";
import { PhoneMockupExpenses } from "./PhoneMockupExpenses";
import { PhoneMockupChat } from "./PhoneMockupChat";

interface PhoneFrameProps {
  children: ReactNode;
  label: string;
  /** Makes the center frame slightly larger — for featured/middle screens */
  featured?: boolean;
}

function PhoneFrame({ children, label, featured }: PhoneFrameProps) {
  return (
    <div className="flex flex-col items-center snap-center flex-shrink-0 w-[240px] sm:w-auto">
      <div
        className={`relative w-full rounded-[2rem] border border-border-subtle/40 bg-surface-elevated shadow-xl overflow-hidden transition-transform hover:scale-[1.02] hover:shadow-2xl ${featured ? "ring-2 ring-brand/20" : ""}`}
        style={{ height: "460px" }}
        role="img"
        aria-label={`App preview: ${label}`}
      >
        {/* Notch */}
        <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-border-subtle/50 z-10" aria-hidden="true" />
        {/* Screen content */}
        <div className="absolute inset-0 mt-5 bg-background overflow-hidden rounded-[1.6rem]">
          {children}
        </div>
      </div>
      <p className="mt-3 text-center font-headline text-alphaai-sm font-semibold text-foreground">{label}</p>
    </div>
  );
}

const SCREENS = [
  { label: "Partner sync", component: <PhoneMockupDashboard />, featured: false },
  { label: "Family calendar", component: <PhoneMockupCalendar />, featured: true },
  { label: "Expenses & budget", component: <PhoneMockupExpenses />, featured: false },
  { label: "AI agent chat", component: <PhoneMockupChat />, featured: false },
] as const;

export function ProductShowcase() {
  return (
    <section
      className="border-y border-border-subtle/10 bg-surface-dim/30 px-4 py-12 sm:py-16 sm:px-6"
      aria-labelledby="showcase-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="showcase-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          Built for real days
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-alphaai-sm text-muted-foreground">
          Four screens you&apos;ll actually use — partner sync, family calendar, expense tracking, and AI agent chat.
        </p>

        {/* Mobile: horizontal scroll carousel */}
        <div className="mt-10 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 dad-no-scrollbar sm:hidden px-2">
          {SCREENS.map((screen) => (
            <PhoneFrame key={screen.label} label={screen.label} featured={screen.featured}>
              {screen.component}
            </PhoneFrame>
          ))}
        </div>

        {/* Tablet: 2×2 grid */}
        <div className="mt-10 hidden sm:grid lg:hidden grid-cols-2 gap-6 justify-items-center">
          {SCREENS.map((screen) => (
            <PhoneFrame key={screen.label} label={screen.label} featured={screen.featured}>
              {screen.component}
            </PhoneFrame>
          ))}
        </div>

        {/* Desktop: 4-column */}
        <div className="mt-10 hidden lg:grid grid-cols-4 gap-5">
          {SCREENS.map((screen) => (
            <PhoneFrame key={screen.label} label={screen.label} featured={screen.featured}>
              {screen.component}
            </PhoneFrame>
          ))}
        </div>
      </div>
    </section>
  );
}
