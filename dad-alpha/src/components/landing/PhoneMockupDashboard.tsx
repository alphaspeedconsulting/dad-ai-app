/** Dashboard mockup — mirrors the actual /dashboard page layout. */
export function PhoneMockupDashboard() {
  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="bg-background/80 px-3 py-2.5 flex items-center justify-between border-b border-border-subtle/20 flex-shrink-0">
        <div>
          <p className="text-alphaai-3xs text-muted-foreground">Good morning, Dad</p>
          <p className="font-headline text-alphaai-sm font-bold text-foreground">Dad.alpha</p>
        </div>
        <div className="relative w-7 h-7 rounded-full bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined text-[14px] text-foreground">notifications</span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border border-background" aria-hidden="true" />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-hidden px-2.5 py-2 space-y-2">
        {/* Partner Sync card */}
        <div className="dad-card p-2.5">
          <div className="flex items-center gap-1.5 mb-2">
            <span className="material-symbols-outlined text-[12px] text-brand">sync</span>
            <p className="font-headline text-alphaai-3xs font-semibold text-foreground">Partner Sync</p>
            <p className="text-alphaai-3xs text-muted-foreground ml-auto">2h ago</p>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-brand mt-1 flex-shrink-0" aria-hidden="true" />
              <p className="text-alphaai-3xs text-foreground leading-tight">Soccer practice moved to 4:30 PM Thu</p>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-1 flex-shrink-0" aria-hidden="true" />
              <p className="text-alphaai-3xs text-foreground leading-tight">Grocery list updated — snacks added</p>
            </div>
            <div className="flex items-start gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary mt-1 flex-shrink-0" aria-hidden="true" />
              <p className="text-alphaai-3xs text-foreground leading-tight">Permission slip due Friday</p>
            </div>
          </div>
        </div>

        {/* Conflict alert */}
        <div className="dad-card p-2.5 border-l-2 border-secondary">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="material-symbols-outlined text-[12px] text-secondary">warning</span>
            <p className="font-headline text-alphaai-3xs font-semibold text-foreground">Schedule Conflict</p>
          </div>
          <p className="text-alphaai-3xs text-foreground leading-tight">Thu 4 PM — Soccer overlaps Swim. Both need a driver.</p>
          <p className="text-alphaai-3xs text-brand font-semibold mt-1">Resolve with Schedule Sync →</p>
        </div>

        {/* Quick Actions 2×2 grid */}
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { icon: "checklist", label: "New Checklist", bg: "bg-brand-glow/30", color: "text-brand" },
            { icon: "receipt_long", label: "Track Expense", bg: "bg-secondary-container/60", color: "text-secondary" },
            { icon: "school", label: "School Hub", bg: "bg-tertiary-container/60", color: "text-tertiary" },
            { icon: "calendar_month", label: "Schedule", bg: "bg-brand-glow/20", color: "text-brand" },
          ].map((a) => (
            <div key={a.label} className="dad-card p-2 flex flex-col items-center gap-1">
              <div className={`w-8 h-8 ${a.bg} rounded-xl flex items-center justify-center`}>
                <span className={`material-symbols-outlined text-[16px] ${a.color}`}>{a.icon}</span>
              </div>
              <p className="text-alphaai-3xs font-medium text-foreground text-center leading-tight">{a.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-around border-t border-border-subtle/20 bg-background/85 py-1.5 flex-shrink-0">
        {[
          { icon: "home", label: "Home", active: true },
          { icon: "smart_toy", label: "Agents", active: false },
          { icon: "checklist", label: "Lists", active: false },
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
