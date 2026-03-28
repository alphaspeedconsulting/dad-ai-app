import Link from "next/link";
import { DAD_AGENTS } from "@/config/dad-agents";
import type { AgentType } from "@/types/api-contracts";

/** Per-agent visual identity — colors match in-app usage on the dashboard quick actions. */
const AGENT_STYLE: Partial<Record<AgentType, { avatarBg: string; iconColor: string; chipBg: string; prompt: string }>> = {
  calendar_whiz: {
    avatarBg: "bg-brand-glow/30",
    iconColor: "text-brand",
    chipBg: "bg-brand-glow/20 text-brand",
    prompt: '"What conflicts do we have this week?"',
  },
  school_event_hub: {
    avatarBg: "bg-tertiary-container",
    iconColor: "text-tertiary",
    chipBg: "bg-tertiary-container text-tertiary",
    prompt: '"Any permission slips due soon?"',
  },
  budget_buddy: {
    avatarBg: "bg-secondary-container/60",
    iconColor: "text-secondary",
    chipBg: "bg-secondary-container text-secondary",
    prompt: '"How much did we spend on groceries?"',
  },
  grocery_guru: {
    avatarBg: "bg-brand-glow/20",
    iconColor: "text-brand",
    chipBg: "bg-brand-glow/15 text-brand",
    prompt: '"Plan meals for the week — nut-free."',
  },
};

export function AgentGrid() {
  return (
    <section id="agents" className="scroll-mt-24 px-4 py-12 sm:py-16 sm:px-6" aria-labelledby="agents-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="agents-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          Meet your team
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-alphaai-sm text-muted-foreground">
          Four specialists — same agents as inside the app. No extra roles, no drift from what you chat with.
        </p>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DAD_AGENTS.map((agent) => {
            const style = AGENT_STYLE[agent.agent_type] ?? {
            avatarBg: "bg-brand-glow/25",
            iconColor: "text-brand",
            chipBg: "bg-brand-glow/15 text-brand",
            prompt: '"How can I help today?"',
          };
            return (
              <li key={agent.agent_type}>
                <div className="dad-card h-full p-5 flex flex-col transition-all hover:shadow-xl hover:-translate-y-0.5">
                  {/* Agent avatar — larger than before, per-agent color */}
                  <div className={`w-14 h-14 ${style.avatarBg} rounded-2xl flex items-center justify-center mb-4 flex-shrink-0`}>
                    <span className={`material-symbols-outlined text-[28px] ${style.iconColor}`}>{agent.icon}</span>
                  </div>

                  <h3 className="font-headline text-alphaai-lg font-semibold text-foreground">{agent.name}</h3>
                  <p className="mt-1.5 text-alphaai-sm text-muted-foreground flex-1">{agent.description}</p>

                  <ul className="mt-3 space-y-1.5">
                    {agent.capabilities.map((c) => (
                      <li key={c.action} className="flex items-center gap-2 text-alphaai-xs text-foreground/90">
                        <span className={`material-symbols-outlined text-[14px] ${style.iconColor}`}>{c.icon}</span>
                        {c.label}
                      </li>
                    ))}
                  </ul>

                  {/* Example prompt chip */}
                  <div className={`mt-3 rounded-xl px-3 py-2 text-alphaai-3xs italic ${style.chipBg}`}>
                    {style.prompt}
                  </div>

                  <Link
                    href="/login?mode=signup"
                    className="dad-btn-primary mt-4 w-full !py-2.5 !text-alphaai-xs text-center"
                  >
                    Try in app
                  </Link>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
