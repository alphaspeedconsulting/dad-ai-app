/** Chat mockup — mirrors the agent chat interface with Schedule Sync conflict resolution. */
export function PhoneMockupChat() {
  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-background/80 px-3 py-2.5 border-b border-border-subtle/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-muted-foreground">arrow_back</span>
          <div className="w-7 h-7 dad-gradient-hero rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[14px] text-on-primary">calendar_month</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline text-alphaai-xs font-semibold text-foreground">Schedule Sync</p>
            <p className="text-alphaai-3xs text-brand">AI AGENT ACTIVE</p>
          </div>
          <span className="material-symbols-outlined text-[16px] text-muted-foreground">more_vert</span>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-hidden px-2.5 py-2 space-y-2">
        <p className="text-center text-alphaai-3xs text-muted-foreground">Today</p>

        {/* User message */}
        <div className="flex justify-end">
          <div className="dad-chat-user text-alphaai-3xs max-w-[75%]">
            Can you check for any conflicts this week?
          </div>
        </div>

        {/* Agent message */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 dad-gradient-hero rounded-md flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[10px] text-on-primary">calendar_month</span>
            </div>
            <p className="text-alphaai-3xs text-muted-foreground">Schedule Sync · now</p>
          </div>
          <div className="dad-chat-agent text-alphaai-3xs max-w-[85%]">
            Found a conflict on Thursday! Here&apos;s what I see:
          </div>

          {/* Inline conflict card */}
          <div className="dad-card p-2 max-w-[85%] border border-secondary/30">
            <div className="flex items-center gap-1 mb-1">
              <span className="material-symbols-outlined text-[11px] text-secondary">warning</span>
              <p className="text-alphaai-3xs font-semibold text-secondary">Thu Mar 20 · 4:00 PM</p>
            </div>
            <p className="text-alphaai-3xs text-foreground font-medium">Soccer Practice</p>
            <p className="text-alphaai-3xs text-foreground font-medium">+ Swim Class</p>
            <p className="text-alphaai-3xs text-muted-foreground mt-0.5">Both need a parent driver</p>
          </div>

          <div className="dad-chat-agent text-alphaai-3xs max-w-[85%]">
            Should I move Liam&apos;s swim to Thursday 6 PM or Friday?
          </div>

          {/* Quick action pills */}
          <div className="flex flex-wrap gap-1 mt-0.5">
            {["Move to Thu 6 PM", "Try Friday", "Keep both"].map((action) => (
              <button
                key={action}
                className="bg-surface-container border border-brand/30 text-brand rounded-full px-2 py-0.5 text-alphaai-3xs font-medium"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="px-2.5 py-2 border-t border-border-subtle/20 bg-background/85 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 bg-surface-container rounded-full px-3 py-1.5">
            <p className="text-alphaai-3xs text-muted-foreground">Message Schedule Sync…</p>
          </div>
          <div className="w-7 h-7 dad-gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[14px] text-on-primary">send</span>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-around border-t border-border-subtle/20 bg-background/85 py-1.5 flex-shrink-0">
        {[
          { icon: "home", label: "Home", active: false },
          { icon: "smart_toy", label: "Agents", active: true },
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
