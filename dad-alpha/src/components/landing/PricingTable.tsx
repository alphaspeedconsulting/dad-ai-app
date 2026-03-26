"use client";

import Link from "next/link";
import { useState } from "react";
import { PRICING_TIERS } from "./landing-content";
import { BillingToggle } from "./BillingToggle";

export function PricingTable() {
  const [yearly, setYearly] = useState(false);

  return (
    <section id="pricing" className="scroll-mt-24 px-4 py-12 sm:py-16 sm:px-6" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-5xl">
        <h2 id="pricing-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          Simple, honest pricing
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-alphaai-sm text-muted-foreground">
          Mirrors Mom.alpha family tiers. Final charges follow Stripe checkout and your region — &quot;Get Early Access&quot; goes to signup.
        </p>

        <BillingToggle yearly={yearly} onToggle={setYearly} />

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {PRICING_TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-3xl border p-8 ${
                tier.badge
                  ? "border-brand bg-surface-elevated shadow-xl ring-2 ring-brand/20"
                  : "border-border-subtle/30 bg-surface"
              }`}
            >
              {/* Popular badge — inline ribbon treatment */}
              {tier.badge ? (
                <div className="absolute inset-x-0 top-0 flex justify-center">
                  <span className="-translate-y-1/2 rounded-full bg-brand px-4 py-1 text-alphaai-2xs font-bold uppercase tracking-wide text-on-primary shadow-md">
                    {tier.badge}
                  </span>
                </div>
              ) : null}

              <h3 className={`font-headline text-alphaai-2xl font-bold text-foreground ${tier.badge ? "mt-2" : ""}`}>
                {tier.name}
              </h3>

              {/* Price display — toggle between monthly/yearly */}
              <div className="mt-2">
                <p className="font-headline text-alphaai-xl font-semibold text-brand">
                  {yearly ? tier.yearly.split(" ")[0] : tier.monthly}
                </p>
                {yearly ? (
                  <p className="text-alphaai-xs text-secondary font-medium">
                    {tier.yearly.split(" ").slice(1).join(" ")}
                  </p>
                ) : (
                  <p className="text-alphaai-xs text-muted-foreground">or {tier.yearly}</p>
                )}
              </div>

              <Link href="/login?mode=signup" className="dad-btn-primary mt-6 w-full text-center !py-3">
                {tier.cta}
              </Link>

              <ul className="mt-6 flex-1 space-y-3">
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
