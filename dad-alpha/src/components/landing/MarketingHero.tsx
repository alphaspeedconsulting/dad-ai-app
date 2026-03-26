import Link from "next/link";

export function MarketingHero() {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32" aria-labelledby="hero-heading">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-glow/15 blur-[100px]" />
        <div className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-tertiary-container/25 blur-[110px]" />
      </div>
      <div className="relative mx-auto max-w-4xl text-center">
        <p className="mb-4 inline-flex items-center rounded-full border border-border-subtle/40 bg-surface-container-low px-3 py-1 text-alphaai-xs font-semibold uppercase tracking-wider text-brand">
          Launching soon
        </p>
        <h1
          id="hero-heading"
          className="font-headline text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
        >
          Stay steady.{" "}
          <span className="bg-gradient-to-r from-brand to-brand-glow bg-clip-text text-transparent">
            We&apos;ll handle the logistics.
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-pretty text-alphaai-lg text-muted-foreground">
          Four AI agents built for co-parenting: calendars, school, expenses, and groceries — in one PWA. Share
          context with your partner without chasing threads.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link href="/login?mode=signup" className="dad-btn-primary !px-10 !py-4 text-alphaai-md">
            Start free trial
          </Link>
          <a href="#agents" className="dad-btn-outline !px-10 !py-4 text-alphaai-md">
            Meet your team
          </a>
        </div>
        <p className="mt-6 text-alphaai-xs text-muted-foreground">7-day free trial where offered. No credit card for trial signup.</p>
      </div>
    </section>
  );
}
