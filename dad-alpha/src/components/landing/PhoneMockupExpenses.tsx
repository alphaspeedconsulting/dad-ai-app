/** Expenses mockup — mirrors the actual /expenses page layout (Budget Buddy style). */
export function PhoneMockupExpenses() {
  const expenses = [
    { icon: "shopping_cart", merchant: "Costco", category: "Groceries", amount: "$127.50", color: "text-brand", bg: "bg-brand-glow/25" },
    { icon: "local_gas_station", merchant: "Shell", category: "Gas", amount: "$47.00", color: "text-secondary", bg: "bg-secondary-container/60" },
    { icon: "restaurant", merchant: "Chipotle", category: "Dining", amount: "$35.99", color: "text-tertiary", bg: "bg-tertiary-container/60" },
    { icon: "school", merchant: "Math Tutor", category: "Education", amount: "$89.00", color: "text-brand", bg: "bg-brand-glow/20" },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-background/80 px-3 py-2.5 flex items-center justify-between border-b border-border-subtle/20 flex-shrink-0">
        <div>
          <p className="font-headline text-alphaai-sm font-bold text-foreground">Expenses</p>
          <p className="text-alphaai-3xs text-muted-foreground">Track family spending</p>
        </div>
        <div className="w-7 h-7 dad-gradient-hero rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-[14px] text-on-primary">add</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-2.5 py-2 space-y-2">
        {/* Monthly summary hero */}
        <div className="dad-gradient-hero rounded-xl p-3 text-on-primary">
          <p className="text-alphaai-3xs opacity-80">This month</p>
          <p className="font-headline text-alphaai-2xl font-bold">$842.49</p>
          <div className="flex gap-3 mt-2">
            {[
              { label: "Groceries", val: "$140" },
              { label: "Gas", val: "$47" },
              { label: "Education", val: "$89" },
            ].map((c) => (
              <div key={c.label} className="text-alphaai-3xs">
                <span className="opacity-70">{c.label}</span>
                <span className="block font-semibold">{c.val}</span>
              </div>
            ))}
          </div>
          {/* Minimal category bar */}
          <div className="mt-2.5 flex gap-0.5 rounded-full overflow-hidden h-1.5">
            <div className="bg-on-primary/60 flex-1" aria-hidden="true" />
            <div className="bg-on-primary/40 w-8" aria-hidden="true" />
            <div className="bg-on-primary/30 w-6" aria-hidden="true" />
            <div className="bg-on-primary/20 flex-1" aria-hidden="true" />
          </div>
        </div>

        {/* Expense list */}
        <div className="space-y-1.5">
          <p className="font-headline text-alphaai-3xs font-semibold text-muted-foreground uppercase tracking-wide">Recent</p>
          {expenses.map((exp) => (
            <div key={exp.merchant} className="dad-card p-2 flex items-center gap-2">
              <div className={`w-8 h-8 ${exp.bg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <span className={`material-symbols-outlined text-[14px] ${exp.color}`}>{exp.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-alphaai-3xs font-medium text-foreground truncate">{exp.merchant}</p>
                <p className="text-alphaai-3xs text-muted-foreground">{exp.category}</p>
              </div>
              <span className="text-alphaai-xs font-semibold text-foreground flex-shrink-0">{exp.amount}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-around border-t border-border-subtle/20 bg-background/85 py-1.5 flex-shrink-0">
        {[
          { icon: "home", label: "Home", active: false },
          { icon: "smart_toy", label: "Agents", active: false },
          { icon: "checklist", label: "Lists", active: false },
          { icon: "receipt_long", label: "Expenses", active: true },
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
