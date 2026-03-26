import { PhoneStatusBar, PhoneBottomNav } from "./PhoneMockupShared";

/** Chat mockup — Schedule Sync agent resolving a calendar conflict. */
export function PhoneMockupChat() {
  return (
    <div className="flex flex-col h-full bg-background">
      <PhoneStatusBar />

      {/* Chat header */}
      <div className="px-3 py-2 border-b border-border-subtle/20 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-muted-foreground">arrow_back</span>
          <div className="w-8 h-8 dad-gradient-hero rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[15px] text-on-primary">calendar_month</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-headline text-alphaai-xs font-bold text-foreground">Schedule Sync</p>
            <p className="text-alphaai-3xs text-brand font-medium">AI AGENT ACTIVE</p>
          </div>
          <span className="material-symbols-outlined text-[16px] text-muted-foreground">more_vert</span>
        </div>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-hidden px-2.5 py-2 flex flex-col gap-2">
        {/* User message */}
        <div className="flex justify-end">
          <div className="dad-chat-user text-alphaai-3xs" style={{ maxWidth: "78%" }}>
            Any conflicts this week?
          </div>
        </div>

        {/* Agent reply + conflict card */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 dad-gradient-hero rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-[10px] text-on-primary">calendar_month</span>
            </div>
            <p className="text-alphaai-3xs text-muted-foreground">Schedule Sync · now</p>
          </div>

          <div className="dad-chat-agent text-alphaai-3xs" style={{ maxWidth: "85%" }}>
            Found one on Thursday! Here&apos;s the conflict:
          </div>

          {/* Inline conflict card */}
          <div className="dad-card p-2.5 border border-secondary/25" style={{ maxWidth: "85%" }}>
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="material-symbols-outlined text-[13px] text-secondary">warning</span>
              <p className="text-alphaai-3xs font-bold text-secondary">Thu Mar 20 · 4:00 PM</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-alphaai-3xs font-semibold text-foreground">⚽ Soccer Practice (Sofia)</p>
              <p className="text-alphaai-3xs font-semibold text-foreground">🏊 Swim Class (Liam)</p>
            </div>
            <p className="text-alphaai-3xs text-muted-foreground mt-1">Both need a parent driver</p>
          </div>

          <div className="dad-chat-agent text-alphaai-3xs" style={{ maxWidth: "85%" }}>
            Move Liam&apos;s swim to Thu 6 PM or Friday?
          </div>

          {/* Quick action pills */}
          <div className="flex flex-wrap gap-1">
            {["Thu 6 PM", "Try Friday", "Keep both"].map((action) => (
              <button
                key={action}
                className="bg-brand-glow/20 border border-brand/25 text-brand rounded-full px-2.5 py-1 text-alphaai-3xs font-semibold"
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input bar */}
      <div className="px-2.5 py-2 border-t border-border-subtle/20 bg-background flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="flex-1 bg-surface-container rounded-full px-3 py-1.5">
            <p className="text-alphaai-3xs text-muted-foreground">Message Schedule Sync…</p>
          </div>
          <div className="w-8 h-8 dad-gradient-hero rounded-full flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[15px] text-on-primary">send</span>
          </div>
        </div>
      </div>

      <PhoneBottomNav activeIndex={1} />
    </div>
  );
}
