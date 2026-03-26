const LEGAL_BASE = "https://alphaspeedai.com";

const FOOTER_LINKS = [
  { href: `${LEGAL_BASE}/terms-of-service`, label: "Terms of Service" },
  { href: `${LEGAL_BASE}/privacy-policy`, label: "Privacy Policy" },
  { href: `${LEGAL_BASE}/ai-disclosure`, label: "AI Disclosure" },
  { href: "mailto:support@alphaspeedai.com", label: "Contact" },
] as const;

export function MarketingFooter() {
  return (
    <footer className="border-t border-border-subtle/20 bg-background px-4 py-12 sm:px-6">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
        <div className="text-center sm:text-left">
          <p className="font-headline text-alphaai-lg font-bold text-foreground">Alpha.Dad</p>
          <a
            href="https://alphaspeedai.com"
            rel="noopener noreferrer"
            className="mt-2 inline-flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
            aria-label="Powered by AlphaSpeed AI"
          >
            <span className="text-alphaai-3xs text-muted-foreground">Powered by</span>
            <img
              src="/brand/alphaspeedai-logo.png"
              alt="AlphaSpeed AI"
              className="h-8 w-auto"
            />
          </a>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2" aria-label="Legal">
          {FOOTER_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-alphaai-xs font-medium text-muted-foreground hover:text-foreground"
              rel="noopener noreferrer"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
      <p className="mx-auto mt-8 max-w-6xl text-center text-alphaai-3xs text-muted-foreground">
        © {new Date().getFullYear()} AlphaSpeed AI. All rights reserved.
      </p>
    </footer>
  );
}
