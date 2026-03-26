/**
 * API Contract Types — Dad.alpha
 *
 * Shared with Mom.alpha — both frontends hit the same backend.
 * This file is the single source of truth for all request/response shapes.
 */

// Common Types
export type AgentType =
  | "calendar_whiz"
  | "grocery_guru"
  | "budget_buddy"
  | "school_event_hub"
  | "tutor_finder"
  | "health_hub"
  | "sleep_tracker"
  | "self_care_reminder";

export type SubscriptionTier = "trial" | "family" | "family_pro";
export type ParentBrand = "mom" | "dad" | "neutral";
export type HouseholdRole = "admin" | "member";
export type HouseholdMembershipStatus = "none" | "pending_invite" | "active";

export type IntentType =
  | "calendar_crud"
  | "list_crud"
  | "reminder_set"
  | "status_query"
  | "streak_log"
  | "payment_query"
  | "filter_search"
  | "intelligent";

export type TaskStatus = "pending" | "in_progress" | "completed" | "failed";
export type ConsentDocumentType = "terms_of_service" | "privacy_policy" | "ai_disclosure";
export type CalendarSource = "internal" | "google" | "apple" | "school";

// Auth
export interface JWTClaims {
  sub: string;
  household_id: string;
  tier: SubscriptionTier;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export interface AuthGoogleRequest { id_token: string; }
export interface AuthEmailRequest { email: string; password: string; }

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: {
    id: string;
    email: string;
    name: string;
    household_id: string | null;
    tier: SubscriptionTier;
    consent_current: boolean;
    parent_brand?: ParentBrand;
    household_role?: HouseholdRole | null;
    household_membership_status?: HouseholdMembershipStatus;
  };
}

// Consent
export interface ConsentRequest {
  consents: Array<{
    document_type: ConsentDocumentType;
    document_version: string;
    document_hash: string;
  }>;
}
export interface ConsentResponse { recorded: number; all_accepted: boolean; }
export interface ConsentStatusResponse {
  documents: Array<{
    document_type: ConsentDocumentType;
    current_version: string;
    user_accepted_version: string | null;
    needs_acceptance: boolean;
  }>;
}

// Chat
export interface ChatRequest {
  household_id: string;
  agent_type: AgentType;
  message: string;
  media_urls?: string[];
}
export interface ChatResponse {
  message_id: string;
  agent_type: AgentType;
  content: string;
  intent_type: IntentType;
  model_used: string | null;
  tokens_used: number | null;
  quick_actions?: QuickAction[];
  task_id?: string;
}
export interface QuickAction {
  label: string;
  action: string;
  payload?: Record<string, unknown>;
}

// Budget
export interface BudgetResponse {
  household_id: string;
  used: number;
  limit: number;
  remaining: number;
  period_start: string;
  period_end: string;
  is_over_budget: boolean;
  tier: SubscriptionTier;
}

// Calendar
export interface CalendarEvent {
  id: string;
  household_id: string;
  member_id: string | null;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string;
  all_day: boolean;
  source: CalendarSource;
  external_id: string | null;
  member_name: string | null;
  member_color: string | null;
  metadata: Record<string, unknown>;
}
export interface CalendarEventCreateRequest {
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  all_day?: boolean;
  member_id?: string;
}
export interface CalendarEventUpdateRequest {
  title?: string;
  description?: string;
  start_at?: string;
  end_at?: string;
  all_day?: boolean;
  member_id?: string;
}
export interface CalendarEventsResponse { events: CalendarEvent[]; total: number; }

// Agent Marketplace
export interface AgentCard {
  agent_type: AgentType;
  name: string;
  description: string;
  category: string;
  icon: string;
  is_active: boolean;
  is_available: boolean;
  required_tier: SubscriptionTier;
  capabilities: string[];
}
export interface AgentToggleRequest { agent_type: AgentType; is_active: boolean; }
export interface AgentListResponse { agents: AgentCard[]; }

// Tasks
export interface TaskItem {
  id: string;
  household_id: string;
  agent_type: AgentType;
  title: string | null;
  status: TaskStatus;
  progress_pct: number;
  steps: TaskStep[];
  created_at: string;
  updated_at: string;
}
export interface TaskStep { label: string; status: "pending" | "in_progress" | "completed"; }
export interface TaskListResponse { tasks: TaskItem[]; active_count: number; completed_today: number; }

// Household
export interface Household {
  id: string;
  name: string;
  tier: SubscriptionTier;
  trial_expires_at: string | null;
  members: FamilyMember[];
}
export interface FamilyMember {
  id: string;
  name: string;
  age: number | null;
  photo_url: string | null;
  tags: string[];
  color: string;
  role?: "parent" | "child";
  parent_brand?: ParentBrand | null;
  household_role?: HouseholdRole | null;
  operator_id?: string | null;
}
export interface HouseholdCreateRequest {
  name: string;
  members: Array<{ name: string; age?: number; tags?: string[]; color?: string; }>;
}
export interface HouseholdInviteRequest {
  email: string;
  parent_brand?: ParentBrand;
  role?: Exclude<HouseholdRole, "admin">;
}
export interface HouseholdInviteResponse {
  household_id: string;
  invite_token: string;
  expires_at: string;
  invited_email: string;
}
export interface JoinHouseholdRequest { invite_token: string; }
export interface HouseholdMember {
  operator_id: string;
  name: string;
  email?: string | null;
  role: HouseholdRole;
  parent_brand?: ParentBrand | null;
  membership_status: HouseholdMembershipStatus;
}
export interface HouseholdMembersResponse { household_id: string; members: HouseholdMember[]; }
export interface SyncDigestItem {
  id: string;
  category: "calendar" | "tasks" | "expenses" | "school" | "general" | "household_ops";
  summary: string;
  source?: "household_ops";
  ops_type?: "garage" | "home" | "trip" | "routine";
  created_at: string;
}
export interface SyncDigestResponse {
  household_id: string;
  generated_at: string;
  items: SyncDigestItem[];
}
export interface HouseholdUsageDashboard {
  household_id: string;
  period: string;
  calls_used: number;
  calls_limit: number;
  usage_pct: number;
  is_soft_capped: boolean;
  model_override: string | null;
  by_agent: Record<string, number>;
  by_model: Record<string, number>;
}

// Expenses
export interface Expense {
  id: string;
  amount: number;
  category: string;
  merchant: string | null;
  date: string;
  receipt_url: string | null;
  source: "manual" | "ocr" | "recurring";
}
export interface ExpenseSummary {
  total_month: number;
  by_category: Record<string, number>;
  recurring_total: number;
  trend: "up" | "down" | "stable";
}

// Notifications
export interface NotificationItem {
  id: string;
  category: string;
  title: string;
  body: string;
  action_type: string | null;
  action_payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}
export interface NotificationsResponse { notifications: NotificationItem[]; unread_count: number; }

// Lists
export interface ListItem { id: string; text: string; checked: boolean; added_at: string; }
export interface GroceryList { id: string; name: string; items: ListItem[]; agent_type: AgentType; updated_at: string; }

// Permission Slips
export interface PermissionSlip {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "signed" | "expired" | "declined";
  due_date: string | null;
  fee_amount: number | null;
  signed_at: string | null;
}

// Wellness
export interface WellnessStreak {
  id: string;
  member_id: string | null;
  member_name: string | null;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  dates: string[];
}

// Sleep
export interface SleepEntry {
  id: string;
  household_id: string;
  member_id: string | null;
  member_name: string | null;
  sleep_at: string;
  wake_at: string;
  quality: "great" | "good" | "fair" | "poor";
  notes: string | null;
  duration_hours: number;
  created_at: string;
}
export interface SleepLogRequest {
  member_id?: string;
  sleep_at: string;
  wake_at: string;
  quality: "great" | "good" | "fair" | "poor";
  notes?: string;
}
export interface SleepHistoryResponse {
  entries: SleepEntry[];
  avg_duration_hours: number;
  avg_quality_score: number;
  weekly_pattern: Record<string, number>;
}

// Self-Care
export interface SelfCareReminder {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  category: "relaxation" | "exercise" | "social" | "hobby" | "rest" | "custom";
  remind_at: string;
  recurring: boolean;
  recurrence_days: number[] | null;
  snoozed_until: string | null;
  completed_at: string | null;
  created_at: string;
}
export interface SelfCareCreateRequest {
  title: string;
  description?: string;
  category: SelfCareReminder["category"];
  remind_at: string;
  recurring?: boolean;
  recurrence_days?: number[];
}
export interface SelfCareListResponse {
  reminders: SelfCareReminder[];
  completed_today: number;
  streak_days: number;
}

// Analytics
export interface AnalyticsDashboard {
  period: string;
  agent_usage: Record<AgentType, number>;
  spending_trend: Array<{ date: string; amount: number }>;
  schedule_density: Array<{ date: string; events: number }>;
  top_categories: Array<{ category: string; count: number }>;
  call_budget_usage_pct: number;
}

// WebSocket
export type WSMessageType = "task_update" | "notification" | "budget_change" | "agent_status" | "typing";
export interface WSMessage {
  type: WSMessageType;
  payload: Record<string, unknown>;
  timestamp: string;
}

// Stripe
export interface CheckoutTrialRequest {
  tier: "family" | "family_pro";
  billing_cycle?: "monthly" | "yearly";
  success_url: string;
  cancel_url: string;
  promotion_code?: string;
}
export interface CheckoutTrialResponse { checkout_url: string; session_id: string; }

// LLM Cost
export interface LLMCostReport {
  period: string;
  total_cost: number;
  by_model: Record<string, { calls: number; tokens: number; cost: number }>;
  distribution: { gemini_flash_pct: number; gpt4o_mini_pct: number; gpt4o_pct: number; };
  alert: boolean;
}

// Dad.AI specific — Checklists
export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Checklist {
  id: string;
  household_id: string;
  title: string;
  activity_type: string;
  items: ChecklistItem[];
  created_at: string;
  updated_at: string;
}

// Dad.AI specific — Weekly Plan
export interface WeeklyPlanDay {
  date: string;
  events: Array<{ time: string; title: string; who: string }>;
}

export interface WeeklyPlan {
  household_id: string;
  week_start: string;
  days: WeeklyPlanDay[];
  generated_at: string;
}

// Dad.AI specific — Calendar Conflict
export interface CalendarConflict {
  id: string;
  event_a: { title: string; time: string; parent: string };
  event_b: { title: string; time: string; parent: string };
  date: string;
  severity: "overlap" | "tight" | "logistics";
}

// Household Ops — Vehicle Garage
export interface Vehicle {
  id: string;
  household_id: string;
  nickname: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  current_mileage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
export interface VehicleCreateRequest {
  nickname: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  current_mileage?: number;
  notes?: string;
}
export interface VehicleServiceItem {
  id: string;
  vehicle_id: string;
  service_type: string;
  last_performed_at: string | null;
  last_performed_mileage: number | null;
  next_due_at: string | null;
  next_due_mileage: number | null;
  notes: string | null;
  created_at: string;
}
export interface VehicleServiceItemCreateRequest {
  service_type: string;
  last_performed_at?: string;
  last_performed_mileage?: number;
  next_due_at?: string;
  next_due_mileage?: number;
  notes?: string;
}

// Household Ops — Home Projects
export type HomeProjectStatus = "planned" | "in_progress" | "completed" | "on_hold";
export type HomeProjectArea = "interior" | "exterior" | "yard" | "other";
export interface HomeProject {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  status: HomeProjectStatus;
  estimated_cost: number | null;
  area: HomeProjectArea;
  checklist_id: string | null;
  created_at: string;
  updated_at: string;
}
export interface HomeProjectCreateRequest {
  title: string;
  description?: string;
  status?: HomeProjectStatus;
  estimated_cost?: number;
  area?: HomeProjectArea;
}

// Household Ops — Trip Planning
export type TripStatus = "planning" | "booked" | "completed" | "cancelled";
export interface TripPlan {
  id: string;
  household_id: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  estimated_budget: number | null;
  packing_checklist_id: string | null;
  notes: string | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}
export interface TripPlanCreateRequest {
  destination: string;
  start_date?: string;
  end_date?: string;
  estimated_budget?: number;
  notes?: string;
}

// Household Ops — Automation Routines
export type RoutineTriggerType = "time" | "checklist" | "reminder";
export interface RoutineStep {
  id: string;
  label: string;
  trigger_type: RoutineTriggerType;
  trigger_value: string | null;
  order: number;
}
export interface AutomationRoutine {
  id: string;
  household_id: string;
  name: string;
  steps: RoutineStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export interface AutomationRoutineCreateRequest {
  name: string;
  steps?: Array<{
    label: string;
    trigger_type: RoutineTriggerType;
    trigger_value?: string;
    order: number;
  }>;
}

// Household Ops — Google Calendar connection status
export interface GoogleCalendarConnectionStatus {
  connected: boolean;
  email: string | null;
  scopes: string[];
  connected_at: string | null;
}
