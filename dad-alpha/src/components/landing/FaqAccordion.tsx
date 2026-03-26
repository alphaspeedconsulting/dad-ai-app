"use client";

import { useId, useState } from "react";
import { FAQ_ITEMS } from "./landing-content";

export function FaqAccordion() {
  const baseId = useId();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 border-t border-border-subtle/10 bg-surface-dim/15 px-4 py-16 sm:px-6" aria-labelledby="faq-heading">
      <div className="mx-auto max-w-3xl">
        <h2 id="faq-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          Frequently asked questions
        </h2>
        <div className="mt-10 space-y-2">
          {FAQ_ITEMS.map((item, index) => {
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;
            const expanded = openIndex === index;
            return (
              <div key={item.question} className="dad-card overflow-hidden">
                <h3 className="m-0">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={panelId}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-headline text-alphaai-base font-semibold text-foreground transition-colors hover:bg-surface-container-low"
                    onClick={() => setOpenIndex(expanded ? null : index)}
                  >
                    {item.question}
                    <span className="material-symbols-outlined flex-shrink-0 text-brand" aria-hidden>
                      {expanded ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                </h3>
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  hidden={!expanded}
                  className={expanded ? "block" : "hidden"}
                >
                  <p className="border-t border-border-subtle/20 px-5 pb-4 pt-0 text-alphaai-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
