import { PhoneStatusBar, PhoneBottomNav } from "./PhoneMockupShared";

/** Dashboard mockup — mirrors the actual /dashboard page layout. */
export function PhoneMockupDashboard() {
  return (
    <div className="flex flex-col h-full bg-background">
      <PhoneStatusBar />

      {/* Top bar */}
      <div className="px-3 py-1.5 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="text-alphaai-3xs text-muted-foreground">Good morning, Dad</p>
          <p className="font-headline text-alphaai-sm font-bold text-foreground">Alpha.Dad</p>
        </div>
        <div className="relative w-7 h-7 rounded-full bg-surface-container flex items-center justify-center">
          <span className="material-symbols-outlined text-[14px] text-foreground">notifications</span>
          <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-error rounded-full border border-background" aria-hidden="true" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden px-2.5 space-y-2">
        {/* Partner Sync card */}
        <div className="dad-card p-2.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="material-symbols-outlined text-[13px] text-brand">sync</span>
            <p className="font-headline text-alphaai-3xs font-semibold text-foreground">Partner Sync</p>
            <p className="text-alphaai-3xs text-muted-foreground ml-auto">2h ago</p>
          </div>
          <div className="space-y-1.5">
            {[
              { color: "bg-brand", text: "Soccer practice moved to 4:30 PM Thu" },
              { color: "bg-secondary", text: "Grocery list updated — snacks added" },
              { color: "bg-tertiary", text: "Permission slip due Friday" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${item.color} mt-1 flex-shrink-0`} aria-hidden="true" />
                <p className="text-alphaai-3xs text-foreground leading-tight">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Conflict alert */}
        <div className="dad-card p-2 border-l-2 border-secondary flex items-start gap-2">
          <span className="material-symbols-outlined text-[14px] text-secondary flex-shrink-0 mt-0.5">warning</span>
          <div className="min-w-0">
            <p className="font-headline text-alphaai-3xs font-semibold text-foreground">Schedule Conflict</p>
            <p className="text-alphaai-3xs text-foreground leading-tight">Thu 4 PM — Soccer overlaps Swim</p>
            <p className="text-alphaai-3xs text-brand font-semibold mt-0.5">Resolve with Schedule Sync →</p>
          </div>
        </div>

        {/* Quick Actions 2×2 grid */}
        <div>
          <p className="font-headline text-alphaai-3xs font-semibold text-muted-foreground mb-1.5">Quick Actions</p>
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { icon: "checklist", label: "New Checklist", bg: "bg-brand-glow/30", color: "text-brand" },
              { icon: "receipt_long", label: "Track Expense", bg: "bg-secondary-container/60", color: "text-secondary" },
              { icon: "school", label: "School Hub", bg: "bg-tertiary-container/60", color: "text-tertiary" },
              { icon: "home_repair_service", label: "Household Ops", bg: "bg-brand-glow/20", color: "text-brand" },
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

        {/* Recent activity */}
        <div className="space-y-1">
          {[
            { icon: "shopping_cart", text: "Grocery list synced — 12 items", time: "1h ago", color: "text-brand" },
            { icon: "receipt_long", text: "$47.50 at Target · groceries", time: "3h ago", color: "text-secondary" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[14px] ${item.color}`}>{item.icon}</span>
              <p className="text-alphaai-3xs text-foreground flex-1 truncate">{item.text}</p>
              <p className="text-alphaai-3xs text-muted-foreground flex-shrink-0">{item.time}</p>
            </div>
          ))}
        </div>
      </div>

      <PhoneBottomNav activeIndex={0} />
    </div>
  );
}
