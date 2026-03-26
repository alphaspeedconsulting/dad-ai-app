import { PRIVACY_POINTS } from "./landing-content";

export function PrivacyTrust() {
  return (
    <section className="border-y border-border-subtle/10 bg-background px-4 py-16 sm:px-6" aria-labelledby="privacy-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="privacy-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          Trust starts with clarity
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-alphaai-sm text-muted-foreground">
          We don&apos;t oversell backend guarantees on the marketing page — read the policies you accept in the app.
        </p>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2">
          {PRIVACY_POINTS.map((p) => (
            <li key={p.title} className="dad-card p-6">
              <span className="material-symbols-outlined mb-3 text-[32px] text-brand">{p.icon}</span>
              <h3 className="font-headline text-alphaai-lg font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-alphaai-sm text-muted-foreground">{p.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
