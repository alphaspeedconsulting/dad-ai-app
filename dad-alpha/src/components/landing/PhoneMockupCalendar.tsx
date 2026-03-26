/** Calendar mockup — mirrors family calendar view with color-tagged events and AI conflict suggestion. */
export function PhoneMockupCalendar() {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const dates = [17, 18, 19, 20, 21, 22, 23];
  const todayIndex = 2; // Wednesday = today

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-background/80 px-3 py-2.5 flex items-center justify-between border-b border-border-subtle/20 flex-shrink-0">
        <div>
          <p className="font-headline text-alphaai-sm font-bold text-foreground">March 2026</p>
          <p className="text-alphaai-3xs text-muted-foreground">Week 3 · Shared view</p>
        </div>
        <span className="material-symbols-outlined text-[18px] text-muted-foreground">notifications</span>
      </div>

      <div className="flex-1 overflow-hidden px-2.5 py-2 space-y-2">
        {/* Weekly strip */}
        <div className="flex justify-between bg-surface-container-low rounded-xl p-1.5">
          {days.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5">
              <span className="text-alphaai-3xs text-muted-foreground">{day}</span>
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-alphaai-3xs font-semibold ${
                  i === todayIndex
                    ? "bg-brand text-on-primary"
                    : "text-foreground"
                }`}
              >
                {dates[i]}
              </span>
            </div>
          ))}
        </div>

        {/* Today's events */}
        <div className="space-y-1.5">
          <p className="font-headline text-alphaai-3xs font-semibold text-muted-foreground uppercase tracking-wide">Today · Mar 19</p>

          {/* Event 1 - SOFIA */}
          <div className="dad-card p-2 border-l-2 border-brand">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="bg-brand/15 text-brand rounded-full px-1.5 py-0.5 text-alphaai-3xs font-bold">SOFIA</span>
            </div>
            <p className="text-alphaai-xs font-medium text-foreground">Soccer Practice</p>
            <p className="text-alphaai-3xs text-muted-foreground">4:00 – 5:30 PM · Central Park</p>
          </div>

          {/* Event 2 - LIAM with CONFLICT badge */}
          <div className="dad-card p-2 border-l-2 border-secondary">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="bg-secondary/15 text-secondary rounded-full px-1.5 py-0.5 text-alphaai-3xs font-bold">LIAM</span>
              <span className="bg-error/15 text-error rounded-full px-1.5 py-0.5 text-alphaai-3xs font-bold ml-auto">CONFLICT</span>
            </div>
            <p className="text-alphaai-xs font-medium text-foreground">Swim Class</p>
            <p className="text-alphaai-3xs text-muted-foreground">4:00 – 5:00 PM · Rec Center</p>
          </div>
        </div>

        {/* AI Suggestion card */}
        <div className="rounded-xl border border-brand/20 bg-brand-glow/10 p-2">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[12px] text-brand">auto_awesome</span>
            <p className="font-headline text-alphaai-3xs font-semibold text-brand">Schedule Sync</p>
          </div>
          <p className="text-alphaai-3xs text-foreground leading-tight mb-1.5">Found a 4 PM conflict. Move Liam's swim to Thursday?</p>
          <div className="flex gap-1.5">
            <button className="flex-1 bg-brand text-on-primary rounded-full py-1 text-alphaai-3xs font-semibold">Yes, move it</button>
            <button className="flex-1 bg-surface-container text-muted-foreground rounded-full py-1 text-alphaai-3xs font-semibold">Dismiss</button>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-around border-t border-border-subtle/20 bg-background/85 py-1.5 flex-shrink-0">
        {[
          { icon: "home", label: "Home", active: false },
          { icon: "smart_toy", label: "Agents", active: false },
          { icon: "calendar_month", label: "Cal", active: true },
          { icon: "receipt_long", label: "Expenses", active: false },
          { icon: "settings", label: "Settings", active: false },
        ].map((tab) => (
          <div key={tab.label} className={`flex flex-col items-center gap-0.5 ${tab.active ? "text-brand" : "text-muted-foreground"}`}>
            <span
              className="material-symbols-outlined text-[16px]"
              style={{ fontVariationSettings: tab.active ? "'FILL' 1" : "'FILL' 0" }}
              aria-hidden="true"
            >
              {tab.icon}
            </span>
            <span className="text-alphaai-3xs">{tab.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
