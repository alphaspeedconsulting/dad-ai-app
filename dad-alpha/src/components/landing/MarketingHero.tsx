import Link from "next/link";

export function MarketingHero() {
  return (
    <section
      className="dad-tactical-grid relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pb-24 sm:pt-32"
      aria-labelledby="hero-heading"
    >
      {/* Background ambient orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/10 blur-[120px]" />
        <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-brand/5 blur-[110px]" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-secondary/5 blur-[80px]" />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        {/* Tactical status pill */}
        <p className="dad-status-pill mb-4">
          Launching soon
        </p>

        <h1
          id="hero-heading"
          className="font-headline text-balance text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl"
        >
          Stay steady.{" "}
          <span className="bg-gradient-to-r from-brand via-brand-dim to-brand-glow bg-clip-text text-transparent">
            We&apos;ll handle the logistics.
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-pretty text-alphaai-lg text-muted-foreground">
          Four AI agents built for co-parenting: calendars, school, expenses, and groceries — in one PWA. Share
          context with your partner without chasing threads.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/login?mode=signup"
            className="dad-btn-primary !px-10 !py-4 text-alphaai-md transition-all hover:scale-[1.03] hover:shadow-xl"
          >
            Start free trial
          </Link>
          <a
            href="#agents"
            className="dad-btn-outline !px-10 !py-4 text-alphaai-md transition-all hover:scale-[1.02]"
          >
            Meet your team
          </a>
        </div>

        {/* Trust micro-copy */}
        <div className="mt-6 flex flex-col items-center gap-1.5">
          <p className="text-alphaai-xs text-muted-foreground">7-day free trial where offered. No credit card for trial signup.</p>
          <div className="flex items-center gap-1.5 text-alphaai-xs text-muted-foreground">
            <span className="material-symbols-outlined text-[14px] text-brand">shield</span>
            Built by parents, for parents
          </div>
        </div>
      </div>
    </section>
  );
}
