import Link from "next/link";

/** Mobile-first sticky CTA; harmless on desktop (still usable). */
export function StickyCta() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle/30 bg-background/95 p-3 backdrop-blur-md md:hidden">
      <Link href="/login?mode=signup" className="dad-btn-primary flex w-full justify-center !py-3 text-alphaai-sm">
        Start free trial
      </Link>
    </div>
  );
}
