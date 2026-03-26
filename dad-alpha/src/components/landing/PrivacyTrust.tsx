import { PRIVACY_POINTS } from "./landing-content";

const ICON_ACCENTS = [
  { bg: "bg-brand-glow/25", color: "text-brand" },
  { bg: "bg-tertiary-container", color: "text-tertiary" },
  { bg: "bg-secondary-container/60", color: "text-secondary" },
  { bg: "bg-brand-glow/20", color: "text-brand" },
] as const;

export function PrivacyTrust() {
  return (
    <section
      className="border-y border-border-subtle/10 bg-background px-4 py-12 sm:py-16 sm:px-6"
      aria-labelledby="privacy-heading"
    >
      <div className="mx-auto max-w-6xl">
        <h2 id="privacy-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          Trust starts with clarity
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-alphaai-sm text-muted-foreground">
          We don&apos;t oversell backend guarantees on the marketing page — read the policies you accept in the app.
        </p>
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRIVACY_POINTS.map((p, i) => {
            const accent = ICON_ACCENTS[i % ICON_ACCENTS.length];
            return (
              <li key={p.title} className="dad-card p-5">
                <div className={`w-12 h-12 ${accent.bg} rounded-2xl flex items-center justify-center mb-3`}>
                  <span className={`material-symbols-outlined text-[24px] ${accent.color}`}>{p.icon}</span>
                </div>
                <h3 className="font-headline text-alphaai-base font-semibold text-foreground">{p.title}</h3>
                <p className="mt-2 text-alphaai-sm text-muted-foreground">{p.body}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
