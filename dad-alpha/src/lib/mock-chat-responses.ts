/**
 * Mock chat responses for offline/mock-mode development.
 * Each agent returns rich markdown with quick actions to exercise the full chat UX.
 */
import type { AgentType, ChatResponse, IntentType, QuickAction } from "@/types/api-contracts";

interface MockResponse {
  content: string;
  intent_type: IntentType;
  quick_actions: QuickAction[];
}

const CALENDAR_RESPONSES: MockResponse[] = [
  {
    content: `Here's your schedule for **today**:

| Time | Event | Who |
|------|-------|-----|
| 8:30 AM | School drop-off | Kids |
| 10:00 AM | Team standup | You |
| 3:15 PM | Soccer practice | Emma |
| 5:30 PM | Dentist appointment | You |

> **Heads up:** Soccer practice and the dentist overlap by 15 minutes. You may need to arrange pickup.`,
    intent_type: "calendar_crud",
    quick_actions: [
      { label: "View conflicts", action: "view_conflicts" },
      { label: "Reschedule dentist", action: "reschedule_event", payload: { event_id: "mock-dentist" } },
      { label: "Sync Google Calendar", action: "sync_google" },
    ],
  },
  {
    content: `**This week at a glance:**

- **Mon:** School drop-off, team standup, grocery run
- **Tue:** Parent-teacher conference (3 PM), soccer practice
- **Wed:** Oil change due (Honda Civic — 3,200 mi overdue)
- **Thu:** Emma's birthday party prep
- **Fri:** Family movie night

No major conflicts detected this week.`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Schedule oil change", action: "create_event", payload: { title: "Oil change — Honda Civic" } },
      { label: "Check vehicle service", action: "view_vehicle_service" },
    ],
  },
];

const SCHOOL_RESPONSES: MockResponse[] = [
  {
    content: `**Pending permission slips:**

1. **Field trip to Science Museum** — Due: April 2
   - Fee: $15.00
   - Status: ⏳ Unsigned
2. **Spring Concert participation** — Due: April 5
   - Fee: None
   - Status: ⏳ Unsigned

Both need your signature before the deadlines.`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Sign field trip slip", action: "sign_slip", payload: { slip_id: "mock-field-trip" } },
      { label: "Sign concert slip", action: "sign_slip", payload: { slip_id: "mock-concert" } },
    ],
  },
  {
    content: `**School events this week:**

| Date | Event | Notes |
|------|-------|-------|
| Mon Apr 1 | No school — Teacher PD day | Plan childcare |
| Wed Apr 3 | Book fair starts | Runs through Friday |
| Thu Apr 4 | Parent-teacher conference | 3:00 PM — Ms. Rodriguez |
| Fri Apr 5 | Spirit Day — Pajama Day | |

Don't forget the parent-teacher conference on Thursday!`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Add to calendar", action: "create_event", payload: { title: "Parent-teacher conference" } },
      { label: "Check deadlines", action: "view_school_events" },
    ],
  },
];

const BUDGET_RESPONSES: MockResponse[] = [
  {
    content: `**March spending summary:**

| Category | Spent | Budget | Status |
|----------|------:|-------:|--------|
| Groceries | $487 | $600 | ✅ On track |
| Dining out | $215 | $200 | ⚠️ Over budget |
| Gas | $142 | $150 | ✅ On track |
| Kids activities | $180 | $200 | ✅ On track |
| Home project | $340 | $500 | ✅ Under budget |

**Total:** $1,364 of $1,650 budget (83%)

Dining out is $15 over budget. Consider cooking in this weekend to balance it out.`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Upload receipt", action: "upload_receipt" },
      { label: "View full breakdown", action: "view_budget" },
      { label: "Compare to last month", action: "view_expenses" },
    ],
  },
  {
    content: `**Receipt scanned successfully!**

- **Store:** Target
- **Date:** March 28, 2026
- **Total:** $67.43
- **Category:** Auto-categorized as *Groceries*

Items detected:
- Milk, eggs, bread — $12.47
- Chicken breasts — $9.99
- Cleaning supplies — $18.50
- Snacks — $26.47`,
    intent_type: "list_crud",
    quick_actions: [
      { label: "Change category", action: "view_expenses" },
      { label: "Scan another", action: "upload_receipt" },
    ],
  },
];

const GROCERY_RESPONSES: MockResponse[] = [
  {
    content: `**Current grocery list:**

- [ ] Milk (2%)
- [ ] Eggs (1 dozen)
- [ ] Bread (whole wheat)
- [ ] Chicken breasts (2 lbs)
- [ ] Broccoli
- [ ] Rice (jasmine)
- [ ] Pasta sauce
- [x] ~~Bananas~~ — already picked up
- [x] ~~Apples~~ — already picked up

**8 items remaining** — estimated total: ~$45`,
    intent_type: "list_crud",
    quick_actions: [
      { label: "Add item", action: "add_to_list" },
      { label: "Clear checked items", action: "toggle_item" },
      { label: "Plan meals", action: "plan_meals" },
    ],
  },
  {
    content: `**Meal plan for the week:**

### Monday
- **Dinner:** Chicken stir-fry with rice and broccoli

### Tuesday
- **Dinner:** Spaghetti with meat sauce and salad

### Wednesday
- **Dinner:** Taco night (ground beef, lettuce, tomato, cheese)

### Thursday
- **Dinner:** Grilled salmon with roasted veggies

### Friday
- **Dinner:** Pizza night (homemade dough)

Added **12 items** to your grocery list based on this plan.`,
    intent_type: "list_crud",
    quick_actions: [
      { label: "View updated list", action: "view_list" },
      { label: "Swap a meal", action: "suggest_recipe" },
    ],
  },
];

const AGENT_RESPONSES: Record<string, MockResponse[]> = {
  calendar_whiz: CALENDAR_RESPONSES,
  school_event_hub: SCHOOL_RESPONSES,
  budget_buddy: BUDGET_RESPONSES,
  grocery_guru: GROCERY_RESPONSES,
};

let callCount: Record<string, number> = {};

export function getMockChatResponse(agentType: AgentType, _message: string): ChatResponse {
  const responses = AGENT_RESPONSES[agentType] ?? CALENDAR_RESPONSES;
  const count = callCount[agentType] ?? 0;
  const response = responses[count % responses.length];
  callCount[agentType] = count + 1;

  return {
    message_id: `mock_${Date.now()}`,
    agent_type: agentType,
    content: response.content,
    intent_type: response.intent_type,
    model_used: "mock",
    tokens_used: null,
    quick_actions: response.quick_actions,
  };
}
