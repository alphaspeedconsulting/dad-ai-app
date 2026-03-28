/**
 * Dad.alpha MVP agent definitions — single source for in-app Agents, chat routes, and marketing.
 * Must stay aligned with backend AgentType contracts (Agent Overlay; no ad-hoc agent IDs).
 */
import type { AgentType, SubscriptionTier } from "@/types/api-contracts";

export interface AgentCapability {
  label: string;
  action: string;
  icon: string;
  tier?: SubscriptionTier;
}

export interface DadAgentDefinition {
  agent_type: AgentType;
  name: string;
  description: string;
  icon: string;
  capabilities: AgentCapability[];
  starter_prompts: string[];
  color: string;
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
      "Manages family schedules, detects conflicts between parent calendars, syncs events, and tracks maintenance due dates and trip windows.",
    icon: "calendar_month",
    color: "brand",
    starter_prompts: [
      "What's on today?",
      "Check for conflicts",
      "Sync calendars",
      "What's my week look like?",
      "Any vehicle service due soon?",
      "Plan around the kids' school schedule",
    ],
    capabilities: [
      { label: "Conflict detection", action: "view_conflicts", icon: "warning" },
      { label: "Calendar sync", action: "sync_google", icon: "sync" },
      { label: "Smart rescheduling", action: "reschedule_event", icon: "event_repeat" },
      { label: "Vehicle service due dates", action: "view_vehicle_service", icon: "directions_car" },
      { label: "Trip date planning", action: "view_trips", icon: "flight_takeoff" },
    ],
  },
  {
    agent_type: "school_event_hub",
    name: "School Hub",
    description:
      "Scans school emails, tracks permission slips, and manages school events and deadlines.",
    icon: "school",
    color: "tertiary",
    starter_prompts: [
      "Pending permission slips",
      "School events this week",
      "Check deadlines",
      "Any slips I need to sign?",
      "What's due this week?",
      "Are there any fees to pay?",
    ],
    capabilities: [
      { label: "Email scanning", action: "scan_emails", icon: "mail" },
      { label: "Permission slips", action: "view_slips", icon: "description" },
      { label: "Event tracking", action: "view_school_events", icon: "event_note" },
    ],
  },
  {
    agent_type: "budget_buddy",
    name: "Expense Tracker",
    description:
      "Tracks family spending, categorizes expenses, finds savings opportunities, and logs car and home project costs.",
    icon: "account_balance_wallet",
    color: "secondary",
    starter_prompts: [
      "Monthly spending?",
      "Scan a receipt",
      "Recurring bills",
      "How's our budget this month?",
      "What did we spend on groceries?",
      "How much is the home project costing?",
    ],
    capabilities: [
      { label: "Receipt scanning", action: "upload_receipt", icon: "receipt_long" },
      { label: "Expense tracking", action: "view_expenses", icon: "payments" },
      { label: "Budget alerts", action: "view_budget", icon: "notifications" },
      { label: "Car & home project costs", action: "view_project_costs", icon: "home_repair_service" },
      { label: "Trip budget tracking", action: "view_trip_budget", icon: "luggage" },
    ],
  },
  {
    agent_type: "grocery_guru",
    name: "Grocery Planner",
    description: "Builds grocery lists, plans meals, and suggests recipes for the family.",
    icon: "shopping_cart",
    color: "brand",
    starter_prompts: [
      "What's on the list?",
      "Plan meals for the week",
      "Add item",
      "We need stuff for tacos",
      "Suggest a quick dinner",
      "Anything running low?",
    ],
    capabilities: [
      { label: "Grocery lists", action: "view_list", icon: "checklist" },
      { label: "Meal planning", action: "plan_meals", icon: "restaurant_menu" },
      { label: "Recipe suggestions", action: "suggest_recipe", icon: "menu_book" },
    ],
  },
];
