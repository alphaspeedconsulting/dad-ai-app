import { PhoneStatusBar, PhoneBottomNav } from "./PhoneMockupShared";

/** Calendar mockup — family calendar with color-tagged events and AI conflict suggestion. */
export function PhoneMockupCalendar() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const dates = [17, 18, 19, 20, 21, 22, 23];
  const todayIndex = 2;

  return (
    <div className="flex flex-col h-full bg-background">
      <PhoneStatusBar />

      {/* Header */}
      <div className="px-3 py-2 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="font-headline text-alphaai-sm font-bold text-foreground">March 2026</p>
          <p className="text-alphaai-3xs text-muted-foreground">Week 3 · Shared view</p>
        </div>
        <div className="relative w-7 h-7 rounded-full bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined text-[14px] text-foreground">notifications</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-2.5 space-y-2">
        {/* Weekly date strip */}
        <div className="flex justify-between bg-surface-container-low rounded-xl px-1.5 py-2">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-alphaai-3xs text-muted-foreground">{day}</span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-alphaai-3xs font-bold ${
                  i === todayIndex ? "bg-brand text-on-primary" : "text-foreground"
                }`}
              >
                {dates[i]}
              </span>
            </div>
          ))}
        </div>

        {/* Today label */}
        <p className="font-headline text-alphaai-3xs font-semibold text-muted-foreground uppercase tracking-wide">
          Today · Mar 19
        </p>

        {/* SOFIA event */}
        <div className="dad-card p-2.5 border-l-2 border-brand">
          <div className="flex items-center justify-between mb-1">
            <span className="bg-brand/15 text-brand rounded-full px-2 py-0.5 text-alphaai-3xs font-bold">SOFIA</span>
            <p className="text-alphaai-3xs text-muted-foreground">4:00 – 5:30 PM</p>
          </div>
          <p className="text-alphaai-sm font-semibold text-foreground">Soccer Practice</p>
          <p className="text-alphaai-3xs text-muted-foreground">Central Park</p>
        </div>

        {/* LIAM event with CONFLICT */}
        <div className="dad-card p-2.5 border-l-2 border-secondary">
          <div className="flex items-center justify-between mb-1">
            <span className="bg-secondary/15 text-secondary rounded-full px-2 py-0.5 text-alphaai-3xs font-bold">LIAM</span>
            <span className="bg-error/15 text-error rounded-full px-2 py-0.5 text-alphaai-3xs font-bold">CONFLICT</span>
          </div>
          <p className="text-alphaai-sm font-semibold text-foreground">Swim Class</p>
          <p className="text-alphaai-3xs text-muted-foreground">4:00 – 5:00 PM · Rec Center</p>
        </div>

        {/* AI Suggestion */}
        <div className="rounded-xl border border-brand/20 bg-brand-glow/10 p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="material-symbols-outlined text-[13px] text-brand">auto_awesome</span>
            <p className="font-headline text-alphaai-3xs font-semibold text-brand">Schedule Sync</p>
          </div>
          <p className="text-alphaai-3xs text-foreground leading-snug mb-2">
            4 PM conflict found. Move Liam&apos;s swim to Thursday 6 PM?
          </p>
          <div className="flex gap-1.5">
            <button className="flex-1 bg-brand text-on-primary rounded-full py-1.5 text-alphaai-3xs font-semibold">
              Yes, move it
            </button>
            <button className="flex-1 bg-surface-container text-muted-foreground rounded-full py-1.5 text-alphaai-3xs font-semibold">
              Dismiss
            </button>
          </div>
        </div>
      </div>

      <PhoneBottomNav activeIndex={2} />
    </div>
  );
}
