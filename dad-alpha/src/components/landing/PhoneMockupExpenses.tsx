import { PhoneStatusBar, PhoneBottomNav } from "./PhoneMockupShared";

/** Expenses mockup — mirrors the actual /expenses page layout. */
export function PhoneMockupExpenses() {
  const expenses = [
    { icon: "shopping_cart", merchant: "Costco", category: "Groceries", amount: "$127.50", color: "text-brand", bg: "bg-brand-glow/25" },
    { icon: "local_gas_station", merchant: "Shell", category: "Gas", amount: "$47.00", color: "text-secondary", bg: "bg-secondary-container/60" },
    { icon: "restaurant", merchant: "Chipotle", category: "Dining", amount: "$35.99", color: "text-tertiary", bg: "bg-tertiary-container/60" },
    { icon: "school", merchant: "Math Tutor", category: "Education", amount: "$89.00", color: "text-brand", bg: "bg-brand-glow/20" },
  ];

  return (
    <div className="flex flex-col h-full bg-background">
      <PhoneStatusBar />

      {/* Header */}
      <div className="px-3 py-1.5 flex items-center justify-between flex-shrink-0">
        <div>
          <p className="font-headline text-alphaai-sm font-bold text-foreground">Expenses</p>
          <p className="text-alphaai-3xs text-muted-foreground">Track family spending</p>
        </div>
        <div className="w-7 h-7 dad-gradient-hero rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-[14px] text-on-primary">add</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-2.5 space-y-2">
        {/* Monthly summary hero */}
        <div className="dad-gradient-hero rounded-2xl p-3.5 text-on-primary">
          <p className="text-alphaai-3xs opacity-80">This month</p>
          <p className="font-headline text-[1.5rem] font-bold leading-tight">$842.49</p>
          <div className="flex gap-4 mt-2">
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
          {/* Category bar */}
          <div className="mt-2.5 flex gap-0.5 rounded-full overflow-hidden h-1.5">
            <div className="bg-on-primary/70 flex-[3]" aria-hidden="true" />
            <div className="bg-on-primary/45 flex-1" aria-hidden="true" />
            <div className="bg-on-primary/30 flex-[2]" aria-hidden="true" />
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
                <p className="text-alphaai-3xs font-semibold text-foreground truncate">{exp.merchant}</p>
                <p className="text-alphaai-3xs text-muted-foreground">{exp.category}</p>
              </div>
              <span className="text-alphaai-xs font-bold text-foreground flex-shrink-0">{exp.amount}</span>
            </div>
          ))}
        </div>
      </div>

      <PhoneBottomNav activeIndex={3} />
    </div>
  );
}
