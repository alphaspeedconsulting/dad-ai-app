"use client";

import Link from "next/link";
import { DAD_AGENTS } from "@/config/dad-agents";

export default function AgentsPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border-subtle/10">
        <div className="max-w-lg mx-auto px-4 py-3">
          <h1 className="font-headline text-alphaai-xl font-bold text-foreground">Agents</h1>
          <p className="text-alphaai-xs text-muted-foreground">Your AI assistants</p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-3">
        {DAD_AGENTS.map((agent) => (
          <Link
            key={agent.agent_type}
            href={`/chat/${agent.agent_type}`}
            className="dad-card p-4 flex items-center gap-4 hover:bg-surface-container-low transition-colors block"
          >
            <div className="dad-agent-avatar bg-brand-glow/30">
              <span className="material-symbols-outlined text-[20px] text-brand">
                {agent.icon}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-headline text-alphaai-base font-semibold text-foreground truncate">
                {agent.name}
              </h3>
              <p className="text-alphaai-xs text-muted-foreground truncate">{agent.description}</p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {agent.capabilities.slice(0, 3).map((c) => (
                  <span key={c.action} className="text-alphaai-3xs bg-brand-glow/20 text-brand px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">{c.icon}</span>
                    {c.label}
                  </span>
                ))}
              </div>
            </div>
            <span className="material-symbols-outlined text-[18px] text-muted-foreground flex-shrink-0">
              chevron_right
            </span>
          </Link>
        ))}
      </main>
    </div>
  );
}
