import { DAY_TIMELINE } from "./landing-content";

/** Color config keyed by agent name — matches the in-app agent identity colors. */
const AGENT_COLORS: Record<string, { icon: string; chip: string; border: string }> = {
  "Schedule Sync": {
    icon: "bg-brand text-on-primary",
    chip: "bg-brand-glow/25 text-brand",
    border: "border-brand/20",
  },
  "School Hub": {
    icon: "bg-tertiary-container text-tertiary",
    chip: "bg-tertiary-container text-tertiary",
    border: "border-tertiary/20",
  },
  "Expense Tracker": {
    icon: "bg-secondary-container text-secondary",
    chip: "bg-secondary-container text-secondary",
    border: "border-secondary/20",
  },
  "Grocery Planner": {
    icon: "bg-brand-glow/40 text-brand",
    chip: "bg-brand-glow/25 text-brand",
    border: "border-brand/15",
  },
  "Dad.alpha": {
    icon: "bg-brand text-on-primary",
    chip: "bg-surface-container text-muted-foreground",
    border: "border-border-subtle/20",
  },
};

export function DayTimeline() {
  return (
    <section
      className="border-y border-border-subtle/10 bg-surface-dim/20 px-4 py-12 sm:py-16 sm:px-6"
      aria-labelledby="day-heading"
    >
      <div className="mx-auto max-w-3xl">
        <h2 id="day-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          A day with Dad.alpha
        </h2>
        <p className="mt-3 text-center text-alphaai-sm text-muted-foreground">
          Six moments where the app quietly handles what would otherwise fall through the cracks.
        </p>

        <ol className="relative mt-12 space-y-4">
          {/* Vertical connecting line */}
          <div
            className="absolute left-[1.1875rem] top-5 bottom-5 w-0.5 bg-gradient-to-b from-brand/40 via-brand/20 to-transparent"
            aria-hidden="true"
          />

          {DAY_TIMELINE.map((item) => {
            const colors = AGENT_COLORS[item.agent] ?? AGENT_COLORS["Dad.alpha"];
            return (
              <li key={item.time} className="relative flex gap-4">
                {/* Icon circle */}
                <span
                  className={`relative z-10 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full ${colors.icon} shadow-md`}
                  aria-hidden="true"
                >
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                </span>

                {/* Card */}
                <div className={`dad-card flex-1 p-4 border ${colors.border} transition-shadow hover:shadow-lg`}>
                  <p className="font-headline text-alphaai-xs font-bold uppercase tracking-wide text-muted-foreground">
                    {item.time}
                  </p>
                  <h3 className="font-headline text-alphaai-base font-semibold text-foreground mt-0.5">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-alphaai-sm text-muted-foreground">{item.body}</p>
                  <span className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-alphaai-2xs font-semibold ${colors.chip}`}>
                    {item.agent}
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
