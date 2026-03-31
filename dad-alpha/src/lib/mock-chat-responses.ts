/**
 * Mock chat responses for offline/mock-mode development.
 * Each agent returns rich markdown with quick actions to exercise the full chat UX.
 *
 * Responses are keyword-matched against the user's message so the mock UX
 * feels contextual rather than purely round-robin.
 */
import type { AgentType, ChatResponse, IntentType, QuickAction } from "@/types/api-contracts";

interface MockResponse {
  content: string;
  intent_type: IntentType;
  quick_actions: QuickAction[];
  /** Keywords that, if found in the user's message, prefer this response. */
  keywords: string[];
}

// ─── Calendar Whiz ───────────────────────────────────────────────────────────

const CALENDAR_RESPONSES: MockResponse[] = [
  {
    keywords: ["today", "schedule", "what's on", "whats on", "morning", "afternoon", "evening"],
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
    keywords: ["week", "weekly", "upcoming", "look like", "plan"],
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
  {
    keywords: ["conflict", "overlap", "resolve", "clash"],
    content: `**Schedule conflicts detected:**

| Date | Event A | Event B | Issue |
|------|---------|---------|-------|
| Thu 4:00 PM | Sofia's Soccer | Liam's Swim Class | Both need a parent driver |
| Fri 3:00 PM | Piano Lesson | Dentist (You) | 30-min overlap |

**Suggestion:** Ask your partner to handle soccer drop-off Thursday so you can take Liam to swim.`,
    intent_type: "calendar_crud",
    quick_actions: [
      { label: "Assign to partner", action: "create_event", payload: { title: "Partner handles soccer drop-off" } },
      { label: "Reschedule dentist", action: "reschedule_event", payload: { event_id: "mock-dentist" } },
    ],
  },
  {
    keywords: ["sync", "google", "import", "connect"],
    content: `**Calendar sync complete!**

- **12 events** imported from Google Calendar
- **3 new events** added to your family schedule
- **1 conflict** detected with existing events

Everything is up to date.`,
    intent_type: "calendar_crud",
    quick_actions: [
      { label: "View conflicts", action: "view_conflicts" },
      { label: "View this week", action: "view_week" },
    ],
  },
  {
    keywords: ["vehicle", "service", "oil", "car", "maintenance"],
    content: `**Vehicle service status:**

| Vehicle | Service | Status | Due |
|---------|---------|--------|-----|
| Honda Civic | Oil change | ⚠️ 3,200 mi overdue | ASAP |
| Honda Civic | Tire rotation | ✅ OK | May 2026 |
| Minivan | Oil change | ✅ OK | April 15 |
| Minivan | Brake inspection | ⏳ Coming up | April 20 |

The Honda Civic oil change is overdue. Want me to schedule it?`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Schedule oil change", action: "create_event", payload: { title: "Oil change — Honda Civic" } },
    ],
  },
  {
    keywords: ["help", "what can", "do"],
    content: `I'm **Schedule Sync** — your family calendar assistant. I can:

- **View your schedule** — today, this week, or any date
- **Detect conflicts** between family members' events
- **Sync Google Calendar** to keep everything in one place
- **Track vehicle service** due dates
- **Plan around school schedules**

What would you like to check?`,
    intent_type: "status_query",
    quick_actions: [
      { label: "What's on today?", action: "view_today" },
      { label: "Check for conflicts", action: "view_conflicts" },
      { label: "Sync calendars", action: "sync_google" },
    ],
  },
];

// ─── School Hub ──────────────────────────────────────────────────────────────

const SCHOOL_RESPONSES: MockResponse[] = [
  {
    keywords: ["permission", "slip", "sign", "unsigned"],
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
    keywords: ["event", "week", "calendar", "upcoming", "school"],
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
  {
    keywords: ["deadline", "due", "fee", "pay", "owe"],
    content: `**Upcoming deadlines:**

| Item | Due | Amount | Status |
|------|-----|--------|--------|
| Science Museum slip | April 2 | $15.00 | ⏳ Unsigned |
| Spring Concert slip | April 5 | Free | ⏳ Unsigned |
| Book fair money | April 3 | $20 suggested | 💵 Optional |
| Class photo order | April 10 | $25 | Not yet ordered |

**Total due this month:** $60.00`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Sign field trip slip", action: "sign_slip", payload: { slip_id: "mock-field-trip" } },
      { label: "View all events", action: "view_school_events" },
    ],
  },
  {
    keywords: ["help", "what can", "do"],
    content: `I'm **School Hub** — I keep track of everything school-related. I can:

- **Track permission slips** and their deadlines
- **Monitor school events** and conferences
- **Check fees and deadlines** so nothing falls through the cracks
- **Scan school emails** for important updates

What would you like to check?`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Pending permission slips", action: "view_slips" },
      { label: "School events this week", action: "view_school_events" },
      { label: "Check deadlines", action: "view_deadlines" },
    ],
  },
];

// ─── Budget Buddy ────────────────────────────────────────────────────────────

const BUDGET_RESPONSES: MockResponse[] = [
  {
    keywords: ["spend", "summary", "budget", "month", "how much", "how's", "track"],
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
    keywords: ["receipt", "scan", "upload", "photo"],
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
  {
    keywords: ["bill", "recurring", "subscription", "auto"],
    content: `**Recurring bills this month:**

| Bill | Amount | Due | Status |
|------|-------:|-----|--------|
| Mortgage | $2,150 | Apr 1 | ⏳ Upcoming |
| Car insurance | $185 | Apr 5 | ⏳ Upcoming |
| Netflix | $15.49 | Apr 8 | Auto-pay |
| Gym membership | $49 | Apr 10 | Auto-pay |
| Electric bill | ~$120 | Apr 15 | Estimated |

**Total recurring:** ~$2,519/month`,
    intent_type: "status_query",
    quick_actions: [
      { label: "View budget", action: "view_budget" },
      { label: "Upload receipt", action: "upload_receipt" },
    ],
  },
  {
    keywords: ["grocery", "groceries", "food"],
    content: `**Grocery spending breakdown:**

| Week | Amount | Store |
|------|-------:|-------|
| Mar 1–7 | $127.50 | Costco |
| Mar 8–14 | $89.30 | Target, Trader Joe's |
| Mar 15–21 | $142.20 | Costco, Safeway |
| Mar 22–28 | $128.00 | Target |

**Total groceries:** $487 of $600 budget (81%)

You're on track this month. Costco trips tend to be your biggest spend.`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Upload receipt", action: "upload_receipt" },
      { label: "View full budget", action: "view_budget" },
    ],
  },
  {
    keywords: ["home", "project", "repair", "cost"],
    content: `**Home project costs:**

| Project | Spent | Budget | Status |
|---------|------:|-------:|--------|
| Deck repair | $280 | $500 | In progress |
| Bathroom paint | $60 | $80 | Completed |

**Total home projects:** $340 of $580 budgeted

The deck repair is on track. Need to pick up more stain ($45 estimate).`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Log expense", action: "upload_receipt" },
      { label: "View all expenses", action: "view_expenses" },
    ],
  },
  {
    keywords: ["help", "what can", "do"],
    content: `I'm **Expense Tracker** — I help you stay on top of family finances. I can:

- **Track spending** across categories
- **Scan receipts** and auto-categorize them
- **Monitor your budget** and alert you when you're over
- **Track recurring bills** and subscriptions
- **Log car and home project costs**

What would you like to check?`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Monthly spending", action: "view_budget" },
      { label: "Scan a receipt", action: "upload_receipt" },
      { label: "Recurring bills", action: "view_bills" },
    ],
  },
];

// ─── Grocery Guru ────────────────────────────────────────────────────────────

const GROCERY_RESPONSES: MockResponse[] = [
  {
    keywords: ["list", "what's on", "whats on", "current", "need", "running low", "stuff"],
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
    keywords: ["meal", "plan", "dinner", "week", "cook"],
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
  {
    keywords: ["add", "item", "pick up", "get"],
    content: `Got it! What would you like to add to the list?

Just tell me the items and I'll add them. You can say things like:
- "Add milk, eggs, and bread"
- "We need stuff for tacos"
- "Add whatever we need for chicken stir-fry"

I'll also suggest quantities based on your family size.`,
    intent_type: "list_crud",
    quick_actions: [
      { label: "View current list", action: "view_list" },
      { label: "Plan meals first", action: "plan_meals" },
    ],
  },
  {
    keywords: ["taco", "recipe", "suggest", "quick", "idea", "swap"],
    content: `**Quick taco night shopping list:**

- [ ] Ground beef (1 lb)
- [ ] Taco shells (box of 12)
- [ ] Shredded cheese (Mexican blend)
- [ ] Lettuce (1 head)
- [ ] Tomatoes (2)
- [ ] Sour cream
- [ ] Salsa

**7 items** added to your list — estimated cost: ~$18

> **Tip:** You already have rice and beans in the pantry, so you're set for sides!`,
    intent_type: "list_crud",
    quick_actions: [
      { label: "View full list", action: "view_list" },
      { label: "Suggest another recipe", action: "suggest_recipe" },
    ],
  },
  {
    keywords: ["help", "what can", "do"],
    content: `I'm **Grocery Planner** — I help keep the family fed. I can:

- **Build grocery lists** — add items by name or by recipe
- **Plan meals** for the week with your preferences
- **Suggest recipes** for quick dinners
- **Track what's running low** based on your shopping patterns

What would you like to do?`,
    intent_type: "list_crud",
    quick_actions: [
      { label: "What's on the list?", action: "view_list" },
      { label: "Plan meals for the week", action: "plan_meals" },
      { label: "Suggest a quick dinner", action: "suggest_recipe" },
    ],
  },
];

// ─── Tutor Finder ────────────────────────────────────────────────────────────

const TUTOR_RESPONSES: MockResponse[] = [
  {
    keywords: ["find", "tutor", "help", "need", "struggling", "math", "reading", "science"],
    content: `**Tutor recommendations for your area:**

| Tutor | Subject | Rate | Availability |
|-------|---------|------|--------------|
| Sarah M. | Math (K–8) | $45/hr | Mon, Wed, Fri |
| James T. | Reading/English | $40/hr | Tue, Thu |
| Lisa R. | Science (4–8) | $50/hr | Weekends |

All tutors are background-checked and have 4.8+ ratings.

What subject does your child need help with?`,
    intent_type: "status_query",
    quick_actions: [
      { label: "View all tutors", action: "view_tutors" },
      { label: "Book a session", action: "book_session" },
    ],
  },
  {
    keywords: ["book", "schedule", "session", "appointment"],
    content: `**Session booking:**

To book a tutoring session, I'll need:
1. **Subject** — what area needs support?
2. **Grade level** — which child and what grade?
3. **Preferred time** — weekday or weekend?

Once I know these, I can match you with the best available tutor and schedule your first session.`,
    intent_type: "calendar_crud",
    quick_actions: [
      { label: "View tutors", action: "view_tutors" },
      { label: "Add to calendar", action: "create_event", payload: { title: "Tutoring session" } },
    ],
  },
  {
    keywords: ["progress", "update", "how is", "doing"],
    content: `**Tutoring progress summary:**

Your child has had **4 sessions** this month with Sarah M. (Math).

- **Pre-assessment:** 62% proficiency
- **Current:** 78% proficiency
- **Goal:** 85% by end of quarter

Sarah notes: *"Great improvement in fractions! Focus area this week: long division."*`,
    intent_type: "status_query",
    quick_actions: [
      { label: "View sessions", action: "view_tutors" },
      { label: "Book next session", action: "book_session" },
    ],
  },
];

// ─── Health Hub ──────────────────────────────────────────────────────────────

const HEALTH_RESPONSES: MockResponse[] = [
  {
    keywords: ["appointment", "checkup", "doctor", "dentist", "well visit", "vaccine"],
    content: `**Upcoming health appointments:**

| Who | Visit | Date | Status |
|-----|-------|------|--------|
| Emma | 9-year well visit | Apr 15 | Scheduled |
| Liam | Dentist cleaning | Apr 22 | Scheduled |
| You | Annual physical | May 3 | Pending confirmation |

**Vaccines due:** Emma is due for Tdap booster at next visit.`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Add to calendar", action: "create_event", payload: { title: "Doctor appointment" } },
      { label: "View health records", action: "view_health_records" },
    ],
  },
  {
    keywords: ["medication", "allergy", "allergies", "prescription"],
    content: `**Family health records:**

**Emma (9):**
- Allergy: Peanuts (carries EpiPen)
- Medication: Cetirizine 5mg (seasonal allergies, as needed)

**Liam (7):**
- No known allergies
- No current medications

**Emergency contacts:** Dr. Peterson (pediatrician) — (555) 234-5678`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Update records", action: "view_health_records" },
      { label: "View appointments", action: "create_event", payload: { title: "Health check" } },
    ],
  },
  {
    keywords: ["help", "what can", "do"],
    content: `I'm **Health Hub** — I keep your family's health organized. I can:

- **Track appointments** — doctor, dentist, specialist visits
- **Manage medications** and allergy records
- **Send reminders** for upcoming checkups
- **Store emergency contacts** and insurance info

What health task can I help with?`,
    intent_type: "status_query",
    quick_actions: [
      { label: "View appointments", action: "view_health_records" },
      { label: "Check vaccinations", action: "view_health_records" },
    ],
  },
];

// ─── Sleep Tracker ───────────────────────────────────────────────────────────

const SLEEP_RESPONSES: MockResponse[] = [
  {
    keywords: ["sleep", "bedtime", "routine", "tired", "rest", "last night"],
    content: `**Family sleep summary — last 7 days:**

| Who | Avg Bedtime | Avg Wake | Avg Duration | Quality |
|-----|------------|----------|--------------|---------|
| Emma | 9:10 PM | 7:05 AM | 9h 55m | ✅ Great |
| Liam | 8:45 PM | 6:55 AM | 10h 10m | ✅ Great |
| You | 11:35 PM | 6:30 AM | 6h 55m | ⚠️ Low |

**Recommendation:** You're 1h short of the 8-hour target this week. Consider a 10:30 PM cutoff.`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Set bedtime reminder", action: "set_sleep_reminder" },
      { label: "View sleep trends", action: "view_sleep_trends" },
    ],
  },
  {
    keywords: ["reminder", "alarm", "wake", "schedule"],
    content: `**Current sleep schedule:**

- **Kids bedtime:** 9:00 PM reminder ✅
- **Your bedtime:** No reminder set ⚠️
- **Morning alarm:** 6:30 AM ✅

Want me to set a bedtime reminder for you? A consistent sleep schedule improves energy levels significantly.`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Set my bedtime reminder", action: "set_sleep_reminder" },
      { label: "View trends", action: "view_sleep_trends" },
    ],
  },
  {
    keywords: ["help", "what can", "do"],
    content: `I'm **Sleep Tracker** — I monitor and improve your family's sleep. I can:

- **Track sleep patterns** for the whole family
- **Set bedtime reminders** so everyone gets enough rest
- **Identify trends** and flag potential issues
- **Suggest improvements** based on your schedule

What would you like to track?`,
    intent_type: "status_query",
    quick_actions: [
      { label: "View sleep summary", action: "view_sleep_trends" },
      { label: "Set bedtime reminder", action: "set_sleep_reminder" },
    ],
  },
];

// ─── Self-Care Reminder ──────────────────────────────────────────────────────

const SELF_CARE_RESPONSES: MockResponse[] = [
  {
    keywords: ["stress", "tired", "overwhelmed", "break", "rest", "burnout"],
    content: `**Check-in: How are you doing, Dad?**

Based on your recent activity — 18 tasks completed, 7 events managed — you've had a full week.

**Quick wins for today:**
- 🚶 10-minute walk during lunch
- 📱 5-minute phone-free focus time
- 💧 Hit your 8-glass water goal

You can't pour from an empty cup. What's one thing you can do for yourself today?`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Log check-in", action: "log_checkin" },
      { label: "Schedule workout", action: "schedule_workout" },
    ],
  },
  {
    keywords: ["workout", "exercise", "gym", "run", "fitness"],
    content: `**Your activity this week:**

- Mon: 20-min walk ✅
- Tue: Rest day
- Wed: No activity ⚠️
- Thu: 30-min jog ✅
- Fri–Sun: Not yet logged

**Goal:** 3 active days/week — you're at 2/3 for this week. One more to go!

Want me to add a workout reminder for this weekend?`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Schedule workout", action: "schedule_workout" },
      { label: "Add to calendar", action: "create_event", payload: { title: "Workout" } },
    ],
  },
  {
    keywords: ["help", "what can", "do"],
    content: `I'm your **Self-Care Reminder** — I help you take care of yourself so you can show up for your family. I can:

- **Daily check-ins** — quick prompts to stay grounded
- **Activity tracking** — workouts, walks, and movement
- **Stress signals** — flag when you've been overloaded
- **Micro-breaks** — short recharge suggestions

How are you feeling today?`,
    intent_type: "status_query",
    quick_actions: [
      { label: "Log today's check-in", action: "log_checkin" },
      { label: "Schedule a workout", action: "schedule_workout" },
    ],
  },
];

// ─── Response Selection ──────────────────────────────────────────────────────

export const AGENT_RESPONSES: Record<string, MockResponse[]> = {
  calendar_whiz: CALENDAR_RESPONSES,
  school_event_hub: SCHOOL_RESPONSES,
  budget_buddy: BUDGET_RESPONSES,
  grocery_guru: GROCERY_RESPONSES,
  tutor_finder: TUTOR_RESPONSES,
  health_hub: HEALTH_RESPONSES,
  sleep_tracker: SLEEP_RESPONSES,
  self_care_reminder: SELF_CARE_RESPONSES,
};

/**
 * Find the best-matching response for a given message by scoring keyword hits.
 * Falls back to cycling through responses if no keywords match.
 */
let fallbackIndex: Record<string, number> = {};

function findBestResponse(responses: MockResponse[], message: string): MockResponse {
  const lower = message.toLowerCase();

  // Score each response by number of keyword matches
  let bestScore = 0;
  let bestResponse: MockResponse | null = null;

  for (const r of responses) {
    let score = 0;
    for (const kw of r.keywords) {
      if (lower.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      bestResponse = r;
    }
  }

  if (bestResponse && bestScore > 0) return bestResponse;

  // No keyword match — cycle through responses (skip the "help" one for variety)
  const nonHelp = responses.filter((r) => !r.keywords.includes("help"));
  const key = responses === CALENDAR_RESPONSES ? "cal" :
              responses === SCHOOL_RESPONSES ? "sch" :
              responses === BUDGET_RESPONSES ? "bud" : "gro";
  const idx = fallbackIndex[key] ?? 0;
  fallbackIndex[key] = idx + 1;
  return nonHelp[idx % nonHelp.length];
}

export function getMockChatResponse(agentType: AgentType, message: string): ChatResponse {
  const responses = AGENT_RESPONSES[agentType];

  if (!responses) {
    // Unknown agent type — return a clear error instead of wrong-agent content
    return {
      message_id: `mock_${Date.now()}`,
      agent_type: agentType,
      content: `Sorry, I don't have mock responses configured for agent type "${agentType}". This agent may not be available yet.`,
      intent_type: "status_query",
      model_used: "mock",
      tokens_used: null,
      quick_actions: [],
    };
  }

  const response = findBestResponse(responses, message);

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
