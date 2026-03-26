/** Shared chrome components rendered inside every phone mockup. */

export function PhoneStatusBar() {
  return (
    <div className="flex items-center justify-between px-4 pt-2 pb-0.5 flex-shrink-0">
      <span className="text-alphaai-3xs font-semibold text-foreground">9:41</span>
      <div className="flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px] text-foreground" aria-hidden="true">wifi</span>
        <span className="material-symbols-outlined text-[12px] text-foreground" aria-hidden="true">battery_full</span>
      </div>
    </div>
  );
}

const NAV_ICONS = ["home", "smart_toy", "checklist", "receipt_long", "settings"] as const;

/** Icon-only bottom nav — activeIndex 0-4 maps to Home/Agents/Lists/Expenses/Settings. */
export function PhoneBottomNav({ activeIndex }: { activeIndex: 0 | 1 | 2 | 3 | 4 }) {
  return (
    <div className="flex items-center justify-around border-t border-border-subtle/20 bg-background/95 py-2 pb-3 flex-shrink-0">
      {NAV_ICONS.map((icon, i) => {
        const active = i === activeIndex;
        return (
          <div key={icon} className={`flex flex-col items-center gap-0.5 ${active ? "text-brand" : "text-muted-foreground/50"}`}>
            <span
              className="material-symbols-outlined text-[20px]"
              style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              aria-hidden="true"
            >
              {icon}
            </span>
            {active && <span className="w-1 h-1 rounded-full bg-brand" aria-hidden="true" />}
          </div>
        );
      })}
    </div>
  );
}
