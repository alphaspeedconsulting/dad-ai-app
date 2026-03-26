import Link from "next/link";

export function ClosingCta() {
  return (
    <section className="bg-gradient-to-br from-brand/10 via-background to-tertiary-container/10 px-4 py-16 sm:px-6" aria-labelledby="closing-heading">
      <div className="mx-auto max-w-2xl text-center">
        <h2 id="closing-heading" className="font-headline text-alphaai-3xl font-bold text-foreground">
          Ready when you are
        </h2>
        <p className="mt-3 text-alphaai-sm text-muted-foreground">
          Join the waitlist flow through signup — we&apos;ll route you as soon as your workspace is live.
        </p>
        <Link href="/login?mode=signup" className="dad-btn-primary mt-8 inline-flex !px-10 !py-4 text-alphaai-md">
          Get early access
        </Link>
        <p className="mt-4 text-alphaai-xs text-muted-foreground">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
