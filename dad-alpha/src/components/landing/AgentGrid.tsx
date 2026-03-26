import Link from "next/link";
import { DAD_AGENTS } from "@/config/dad-agents";

export function AgentGrid() {
  return (
    <section id="agents" className="scroll-mt-24 px-4 py-16 sm:px-6" aria-labelledby="agents-heading">
      <div className="mx-auto max-w-6xl">
        <h2 id="agents-heading" className="text-center font-headline text-alphaai-3xl font-bold text-foreground">
          Meet your team
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-alphaai-sm text-muted-foreground">
          Four specialists — same agents as inside the app. No extra roles, no drift from what you chat with.
        </p>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DAD_AGENTS.map((agent) => (
            <li key={agent.agent_type}>
              <div className="dad-card h-full p-5 transition-shadow hover:shadow-lg">
                <div className="dad-agent-avatar mb-4 inline-flex bg-brand-glow/25">
                  <span className="material-symbols-outlined text-[24px] text-brand">{agent.icon}</span>
                </div>
                <h3 className="font-headline text-alphaai-lg font-semibold text-foreground">{agent.name}</h3>
                <p className="mt-2 text-alphaai-sm text-muted-foreground">{agent.description}</p>
                <ul className="mt-3 space-y-1">
                  {agent.capabilities.map((c) => (
                    <li key={c} className="flex items-center gap-2 text-alphaai-xs text-foreground/90">
                      <span className="material-symbols-outlined text-[14px] text-brand">check_circle</span>
                      {c}
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/login?mode=signup`}
                  className="mt-4 inline-block text-alphaai-xs font-semibold text-brand hover:underline"
                >
                  Open in app after signup →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
