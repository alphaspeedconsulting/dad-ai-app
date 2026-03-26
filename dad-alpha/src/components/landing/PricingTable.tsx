import Link from "next/link";
import { PRICING_TIERS } from "./landing-content";

export function PricingTable() {
  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-16 sm:px-6" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-5xl">
        <h2 id="pricing-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          Simple, honest pricing
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-alphaai-sm text-muted-foreground">
          Mirrors Mom.alpha family tiers. Final charges follow Stripe checkout and your region — &quot;Get Early Access&quot; goes to signup.
        </p>
        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                tier.badge
                  ? "border-brand bg-surface-elevated shadow-xl ring-2 ring-brand-glow/30"
                  : "border-border-subtle/30 bg-surface"
              }`}
            >
              {tier.badge ? (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand px-3 py-1 text-alphaai-2xs font-bold uppercase tracking-wide text-on-primary">
                  {tier.badge}
                </span>
              ) : null}
              <h3 className="font-headline text-alphaai-2xl font-bold text-foreground">{tier.name}</h3>
              <p className="mt-2 font-headline text-alphaai-xl font-semibold text-brand">{tier.monthly}</p>
              <p className="text-alphaai-sm text-muted-foreground">{tier.yearly}</p>
              <Link href="/login?mode=signup" className="dad-btn-primary mt-8 w-full text-center !py-3">
                {tier.cta}
              </Link>
              <ul className="mt-8 flex-1 space-y-3">
                {tier.features.map((f) => (
                  <li key={f} className="flex gap-2 text-alphaai-sm text-foreground/95">
                    <span className="material-symbols-outlined mt-0.5 flex-shrink-0 text-[18px] text-brand">check</span>
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-alphaai-2xs text-muted-foreground">
                Powered by Stripe when billing is enabled. No app-store tax — web-first.
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
