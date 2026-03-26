import { FEATURE_DEEP_DIVES } from "./landing-content";

export function FeatureDeepDives() {
  return (
    <section id="features" className="scroll-mt-24 px-4 py-16 sm:px-6" aria-labelledby="features-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="features-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          How it works
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-alphaai-sm text-muted-foreground">
          Deep dives aligned with the dashboard, agents, and PWA screens you already have.
        </p>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {FEATURE_DEEP_DIVES.map((f) => (
            <article
              key={f.id}
              className="dad-card-elevated flex flex-col gap-4 p-6 sm:flex-row sm:items-start"
              aria-labelledby={`feat-${f.id}`}
            >
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-glow/20">
                <span className="material-symbols-outlined text-[28px] text-brand">{f.icon}</span>
              </div>
              <div>
                <h3 id={`feat-${f.id}`} className="font-headline text-alphaai-xl font-bold text-foreground">
                  {f.title}
                </h3>
                <p className="mt-1 text-alphaai-sm font-medium text-muted-foreground">{f.lead}</p>
                <ul className="mt-4 space-y-2">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-alphaai-sm text-foreground/90">
                      <span className="material-symbols-outlined mt-0.5 flex-shrink-0 text-[18px] text-brand">
                        check_circle
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
