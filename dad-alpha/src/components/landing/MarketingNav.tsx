import Link from "next/link";

const LINKS = [
  { href: "#agents", label: "Agents" },
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

export function MarketingNav() {
  return (
    <>
      {/* Skip-to-content for keyboard navigation */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-on-primary focus:text-alphaai-sm focus:font-semibold"
      >
        Skip to content
      </a>

      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border-subtle/20 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="font-headline text-alphaai-lg font-bold tracking-tight text-foreground">
            Alpha.Dad
          </Link>
          <nav className="hidden items-center gap-6 md:flex" aria-label="Marketing">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-alphaai-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-full px-3 py-2 text-alphaai-sm font-medium text-muted-foreground hover:text-foreground sm:inline"
            >
              Sign in
            </Link>
            <Link href="/login?mode=signup" className="dad-btn-primary !px-4 !py-2.5 text-alphaai-sm">
              Start free trial
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
