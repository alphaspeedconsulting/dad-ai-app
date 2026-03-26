"use client";

import Link from "next/link";
import type { AgentType } from "@/types/api-contracts";

const DAD_AGENTS: Array<{
  agent_type: AgentType;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
}> = [
  {
    agent_type: "calendar_whiz",
    name: "Schedule Sync",
    description: "Manages family schedules, detects conflicts between parent calendars, and syncs events.",
    icon: "calendar_month",
    capabilities: ["Conflict detection", "Calendar sync", "Smart rescheduling"],
  },
  {
    agent_type: "school_event_hub",
    name: "School Hub",
    description: "Scans school emails, tracks permission slips, and manages school events and deadlines.",
    icon: "school",
    capabilities: ["Email scanning", "Permission slips", "Event tracking"],
  },
  {
    agent_type: "budget_buddy",
    name: "Expense Tracker",
    description: "Tracks family spending, categorizes expenses, and finds savings opportunities.",
    icon: "account_balance_wallet",
    capabilities: ["Receipt scanning", "Expense tracking", "Budget alerts"],
  },
  {
    agent_type: "grocery_guru",
    name: "Grocery Planner",
    description: "Builds grocery lists, plans meals, and suggests recipes for the family.",
    icon: "shopping_cart",
    capabilities: ["Grocery lists", "Meal planning", "Recipe suggestions"],
  },
];

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
                {agent.capabilities.slice(0, 2).map((c) => (
                  <span key={c} className="text-alphaai-3xs bg-brand-glow/20 text-brand px-2 py-0.5 rounded-full">
                    {c}
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
