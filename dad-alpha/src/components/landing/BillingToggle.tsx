"use client";

interface BillingToggleProps {
  yearly: boolean;
  onToggle: (yearly: boolean) => void;
}

export function BillingToggle({ yearly, onToggle }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <button
        type="button"
        onClick={() => onToggle(false)}
        className={`text-alphaai-sm font-medium transition-colors ${!yearly ? "text-foreground" : "text-muted-foreground"}`}
      >
        Monthly
      </button>
      <button
        type="button"
        role="switch"
        aria-checked={yearly}
        onClick={() => onToggle(!yearly)}
        className={`relative h-7 w-14 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand ${yearly ? "bg-brand" : "bg-border-subtle/60"}`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${yearly ? "translate-x-7" : "translate-x-0"}`}
        />
        <span className="sr-only">{yearly ? "Switch to monthly billing" : "Switch to yearly billing"}</span>
      </button>
      <button
        type="button"
        onClick={() => onToggle(true)}
        className={`flex items-center gap-1.5 text-alphaai-sm font-medium transition-colors ${yearly ? "text-foreground" : "text-muted-foreground"}`}
      >
        Yearly
        <span className="rounded-full bg-secondary-container px-2 py-0.5 text-alphaai-3xs font-bold text-secondary">
          Save 27%
        </span>
      </button>
    </div>
  );
}
