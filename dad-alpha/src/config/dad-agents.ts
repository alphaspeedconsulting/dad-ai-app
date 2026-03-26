/**
 * Dad.alpha MVP agent definitions — single source for in-app Agents, chat routes, and marketing.
 * Must stay aligned with backend AgentType contracts (Agent Overlay; no ad-hoc agent IDs).
 */
import type { AgentType } from "@/types/api-contracts";

export interface DadAgentDefinition {
  agent_type: AgentType;
  name: string;
  description: string;
  icon: string;
  capabilities: string[];
}

/** Agent types surfaced in Dad.alpha MVP (chat static params, marketing, Agents screen). */
export const DAD_MVP_AGENT_TYPES = [
  "calendar_whiz",
  "school_event_hub",
  "budget_buddy",
  "grocery_guru",
] as const satisfies readonly AgentType[];

export const DAD_AGENTS: readonly DadAgentDefinition[] = [
  {
    agent_type: "calendar_whiz",
    name: "Schedule Sync",
    description:
      "Manages family schedules, detects conflicts between parent calendars, and syncs events.",
    icon: "calendar_month",
    capabilities: ["Conflict detection", "Calendar sync", "Smart rescheduling"],
  },
  {
    agent_type: "school_event_hub",
    name: "School Hub",
    description:
      "Scans school emails, tracks permission slips, and manages school events and deadlines.",
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
