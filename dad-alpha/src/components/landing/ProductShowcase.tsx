import type { ReactNode } from "react";
import { PRODUCT_SHOWCASE_ITEMS } from "./landing-content";

function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative mx-auto w-full max-w-[280px] rounded-[2rem] border border-border-subtle/40 bg-surface-elevated p-2 shadow-xl"
      role="img"
      aria-label="App preview mockup"
    >
      <div className="absolute left-1/2 top-2 h-1 w-12 -translate-x-1/2 rounded-full bg-border-subtle/60" aria-hidden />
      <div className="mt-4 overflow-hidden rounded-2xl bg-background">{children}</div>
    </div>
  );
}

export function ProductShowcase() {
  return (
    <section className="border-y border-border-subtle/10 bg-surface-dim/30 px-4 py-16 sm:px-6" aria-labelledby="showcase-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="showcase-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          Built for real days
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-alphaai-sm text-muted-foreground">
          Screens you already have in the app — partner sync, weekly plan, expenses and checklists.
        </p>
        <div className="mt-12 grid gap-10 sm:grid-cols-3">
          {PRODUCT_SHOWCASE_ITEMS.map((item) => (
            <div key={item.title} className="flex flex-col items-center">
              <PhoneFrame>
                <div className="border-b border-border-subtle/20 bg-surface-elevated px-4 py-3 text-left">
                  <p className="text-alphaai-3xs font-medium uppercase tracking-wide text-muted-foreground">Dad.alpha</p>
                  <p className="font-headline text-alphaai-sm font-semibold text-foreground">{item.title}</p>
                  <p className="text-alphaai-2xs text-muted-foreground">{item.subtitle}</p>
                </div>
                <div className="space-y-2 px-4 py-4">
                  {item.lines.map((line) => (
                    <div
                      key={line.label}
                      className={`rounded-xl px-3 py-2 text-alphaai-xs ${
                        "highlight" in line && line.highlight
                          ? "bg-brand-glow/15 text-foreground"
                          : "bg-surface-container-low text-muted-foreground"
                      }`}
                    >
                      <span className="font-medium text-foreground/90">{line.label}</span>
                      <span className="text-muted-foreground"> · </span>
                      {line.value}
                    </div>
                  ))}
                </div>
                <div className="flex justify-around border-t border-border-subtle/20 bg-surface-container-low/50 px-2 py-2">
                  {["Home", "Tasks", "Cal", "Me"].map((tab) => (
                    <span key={tab} className="text-alphaai-3xs text-muted-foreground">
                      {tab}
                    </span>
                  ))}
                </div>
              </PhoneFrame>
              <p className="mt-4 text-center font-headline text-alphaai-sm font-semibold text-foreground">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
