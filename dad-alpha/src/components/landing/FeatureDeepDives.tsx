import { FEATURE_DEEP_DIVES } from "./landing-content";

/** Per-feature accent colors for visual variety — cycled from design token palette. */
const FEATURE_ACCENTS = [
  { iconBg: "bg-brand-glow/25", iconColor: "text-brand", stripe: "from-brand/10 to-transparent" },
  { iconBg: "bg-secondary-container/60", iconColor: "text-secondary", stripe: "from-secondary/10 to-transparent" },
  { iconBg: "bg-tertiary-container", iconColor: "text-tertiary", stripe: "from-tertiary/10 to-transparent" },
  { iconBg: "bg-brand-glow/20", iconColor: "text-brand", stripe: "from-brand/8 to-transparent" },
] as const;

export function FeatureDeepDives() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-12 sm:py-16 sm:px-6" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="features-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-alphaai-sm text-muted-foreground">
          Deep dives aligned with the dashboard, agents, and PWA screens you already have.
        </p>
        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {FEATURE_DEEP_DIVES.map((f, i) => {
            const accent = FEATURE_ACCENTS[i % FEATURE_ACCENTS.length];
            return (
              <article
                key={f.id}
                className="dad-card-elevated relative overflow-hidden flex flex-col gap-4 p-6 sm:flex-row sm:items-start"
                aria-labelledby={`feat-${f.id}`}
              >
                {/* Subtle top accent gradient stripe */}
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent.stripe}`}
                  aria-hidden="true"
                />

                {/* Icon */}
                <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${accent.iconBg}`}>
                  <span className={`material-symbols-outlined text-[28px] ${accent.iconColor}`}>{f.icon}</span>
                </div>

                <div>
                  <h3 id={`feat-${f.id}`} className="font-headline text-alphaai-xl font-bold text-foreground">
                    {f.title}
                  </h3>
                  <p className="mt-1 text-alphaai-sm font-medium text-muted-foreground">{f.lead}</p>
                  <ul className="mt-4 space-y-2">
                    {f.bullets.map((b) => (
                      <li key={b} className="flex gap-2 text-alphaai-sm text-foreground/90">
                        <span className={`material-symbols-outlined mt-0.5 flex-shrink-0 text-[18px] ${accent.iconColor}`}>
                          check_circle
                        </span>
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
