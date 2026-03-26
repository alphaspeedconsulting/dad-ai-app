import { DAY_TIMELINE } from "./landing-content";

export function DayTimeline() {
  return (
    <section className="border-y border-border-subtle/10 bg-surface-dim/20 px-4 py-16 sm:px-6" aria-labelledby="day-heading">
      <div className="mx-auto max-w-3xl">
        <h2 id="day-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          A day with Dad.alpha
        </h2>
        <p className="mt-3 text-center text-alphaai-sm text-muted-foreground">
          Illustrative flow — what the product is built to support as your backend and agents go live.
        </p>
        <ol className="relative mt-12 space-y-8 border-l-2 border-brand-glow/40 pl-8">
          {DAY_TIMELINE.map((item) => (
            <li key={item.time} className="relative">
              <span
                className="absolute -left-[2.125rem] flex h-10 w-10 items-center justify-center rounded-full bg-brand text-on-primary shadow-md"
                aria-hidden
              >
                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              </span>
              <p className="font-headline text-alphaai-xs font-bold uppercase tracking-wide text-brand">{item.time}</p>
              <h3 className="font-headline text-alphaai-lg font-semibold text-foreground">{item.title}</h3>
              <p className="mt-1 text-alphaai-sm text-muted-foreground">{item.body}</p>
              <p className="mt-2 text-alphaai-2xs font-medium text-brand/90">{item.agent}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
