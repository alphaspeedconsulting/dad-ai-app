# Dad.alpha — Agent Test Scenarios

**Created:** 2026-03-28
**For:** Claude Cowork agent quality testing
**Agents:** 4 MVP agents defined in `src/config/dad-agents.ts`

---

## Agent Architecture (Frontend Perspective)

Each agent is a chat interface at `/chat/{agent_type}`. The frontend:
1. Shows starter prompts when chat is empty
2. Sends messages via `POST /api/chat` with `{ household_id, agent_type, message }`
3. Receives `ChatResponse` with `content` (markdown), `quick_actions`, `intent_type`
4. Renders markdown via `marked` + `DOMPurify`
5. Quick actions either call real API endpoints (smart dispatch) or fall back to chat

In mock mode, responses come from `src/lib/mock-chat-responses.ts` with 600-1000ms delay.

---

## 1. Schedule Sync (calendar_whiz)

**Description:** Manages family schedules, detects conflicts, syncs events, tracks vehicle service dates and trip windows.

### Starter Prompts (all 6 must render)
1. "What's on today?"
2. "Check for conflicts"
3. "Sync calendars"
4. "What's my week look like?"
5. "Any vehicle service due soon?"
6. "Plan around the kids' school schedule"

### Chat Scenarios

| # | User Input | Expected Response Type | Expected Content | Quick Actions |
|---|-----------|----------------------|-----------------|---------------|
| 1 | "What's on today?" | Markdown table | Schedule table with Time, Event, Who columns | View conflicts, Reschedule, Sync Google Calendar |
| 2 | "Check for conflicts" | Markdown with warning | Conflict list or "no conflicts found" | View conflicts |
| 3 | "Sync calendars" | Confirmation | "X events imported from Google Calendar" | — |
| 4 | "What's my week look like?" | Markdown bullet list | Day-by-day breakdown Mon-Fri | Schedule oil change, Check vehicle service |
| 5 | "Any vehicle service due soon?" | Status message | Service due items with dates/mileage | — |
| 6 | "Create an event for soccer practice Tuesday at 4pm" | Confirmation | Event created confirmation | — |

### Quick Action Tests

| Quick Action | Action Key | Expected API Call | Expected Result |
|-------------|-----------|------------------|-----------------|
| "View conflicts" | `view_conflicts` | `api.calendar.conflicts(householdId)` | Markdown table of conflicts or "all clear" |
| "Sync Google Calendar" | `sync_google` | `api.calendar.syncGoogle()` | "Calendar synced! X events imported" |
| "Reschedule dentist" | `reschedule_event` | Falls back to chat | Agent suggests alternatives |
| "Schedule oil change" | `create_event` | `api.calendar.create(payload)` | "Event created: Oil change — Honda Civic" |

### Capability Badges (Agents Page)
- warning: Conflict detection
- sync: Calendar sync
- event_repeat: Smart rescheduling
- directions_car: Vehicle service due dates
- flight_takeoff: Trip date planning

---

## 2. School Hub (school_event_hub)

**Description:** Scans school emails, tracks permission slips, manages school events and deadlines.

### Starter Prompts (all 6 must render)
1. "Pending permission slips"
2. "School events this week"
3. "Check deadlines"
4. "Any slips I need to sign?"
5. "What's due this week?"
6. "Are there any fees to pay?"

### Chat Scenarios

| # | User Input | Expected Response Type | Expected Content | Quick Actions |
|---|-----------|----------------------|-----------------|---------------|
| 1 | "Pending permission slips" | Numbered list | Slip titles with due dates, fees, status | Sign slip buttons |
| 2 | "School events this week" | Markdown table | Date, Event, Notes columns | Add to calendar |
| 3 | "Check deadlines" | Priority list | Upcoming deadlines sorted by urgency | — |
| 4 | "Any slips I need to sign?" | Status list | Unsigned slips with sign actions | Sign slip buttons |
| 5 | "What's due this week?" | Combined list | Slips + events + fees due this week | — |
| 6 | "Are there any fees to pay?" | Fee summary | Outstanding fees with amounts | — |

### Quick Action Tests

| Quick Action | Action Key | Expected API Call | Expected Result |
|-------------|-----------|------------------|-----------------|
| "Sign field trip slip" | `sign_slip` | `api.slips.sign(slipId)` | "Permission slip signed! 'Field trip' is now marked as signed" |
| "Sign concert slip" | `sign_slip` | `api.slips.sign(slipId)` | Same pattern, different slip |
| "Add to calendar" | `create_event` | `api.calendar.create(payload)` | "Event created: Parent-teacher conference" |

### Capability Badges (Agents Page)
- mail: Email scanning
- description: Permission slips
- event_note: Event tracking

---

## 3. Expense Tracker (budget_buddy)

**Description:** Tracks family spending, categorizes expenses, finds savings, logs car and home project costs.

### Starter Prompts (all 6 must render)
1. "Monthly spending?"
2. "Scan a receipt"
3. "Recurring bills"
4. "How's our budget this month?"
5. "What did we spend on groceries?"
6. "How much is the home project costing?"

### Chat Scenarios

| # | User Input | Expected Response Type | Expected Content | Quick Actions |
|---|-----------|----------------------|-----------------|---------------|
| 1 | "Monthly spending?" | Markdown table | Category, Spent, Budget, Status columns | Upload receipt, View full breakdown, Compare to last month |
| 2 | "Scan a receipt" | Prompt or file picker | "Tap upload to scan" or receipt parsed result | Upload receipt |
| 3 | "Recurring bills" | List | Recurring expenses with amounts + frequency | — |
| 4 | "How's our budget this month?" | Summary with percentage | Used/limit, percentage, trend | View budget |
| 5 | "What did we spend on groceries?" | Category detail | Grocery transactions list | — |
| 6 | "How much is the home project costing?" | Project cost summary | Linked expenses by project | — |

### Quick Action Tests

| Quick Action | Action Key | Expected API Call | Expected Result |
|-------------|-----------|------------------|-----------------|
| "Upload receipt" | `upload_receipt` | Opens file picker → `api.expenses.uploadReceipt()` | "Receipt uploaded! Amount: $X, Category: Y, Merchant: Z" |
| "View full breakdown" | `view_budget` | `api.budget.get()` + `api.expenses.summary()` | Budget status + trend inline |
| "Compare to last month" | `view_expenses` | `api.expenses.summary()` | Category breakdown table |

### Receipt Upload Flow
1. User taps "Upload receipt" quick action or sends "Scan a receipt"
2. Hidden `<input type="file" accept="image/*">` triggers
3. User selects photo from camera roll
4. File uploaded via FormData to `POST /api/expenses/{householdId}/receipt`
5. Response shows parsed amount, category, merchant, date
6. In mock mode: shows "Receipt scanned! (Mock mode)" message

### Capability Badges (Agents Page)
- receipt_long: Receipt scanning
- payments: Expense tracking
- notifications: Budget alerts
- home_repair_service: Car & home project costs
- luggage: Trip budget tracking

---

## 4. Grocery Planner (grocery_guru)

**Description:** Builds grocery lists, plans meals, suggests recipes for the family.

### Starter Prompts (all 6 must render)
1. "What's on the list?"
2. "Plan meals for the week"
3. "Add item"
4. "We need stuff for tacos"
5. "Suggest a quick dinner"
6. "Anything running low?"

### Chat Scenarios

| # | User Input | Expected Response Type | Expected Content | Quick Actions |
|---|-----------|----------------------|-----------------|---------------|
| 1 | "What's on the list?" | Checklist format | Items with checkboxes (checked/unchecked) | Add item, Clear checked, Plan meals |
| 2 | "Plan meals for the week" | Structured headers | Day-by-day meal plan with headers (###) | View updated list, Swap a meal |
| 3 | "Add item" | Prompt | "What would you like to add?" or direct add | — |
| 4 | "We need stuff for tacos" | Ingredient list | Taco ingredients added to list | View list |
| 5 | "Suggest a quick dinner" | Recipe suggestion | Recipe with ingredients + time estimate | Add ingredients to list |
| 6 | "Anything running low?" | Inventory check | Low-stock items from pantry tracking | Add to list |

### Quick Action Tests

| Quick Action | Action Key | Expected API Call | Expected Result |
|-------------|-----------|------------------|-----------------|
| "Add item" | `add_to_list` | `api.lists.addItem(householdId, agentType, text)` | "Added to list: {item}" |
| "Clear checked items" | `toggle_item` | `api.lists.toggleItem()` | "Item updated" |
| "Plan meals" | `plan_meals` | Falls back to chat | Agent generates meal plan |
| "View updated list" | `view_list` | Falls back to chat | Agent shows current list |
| "Swap a meal" | `suggest_recipe` | Falls back to chat | Agent suggests alternative |

### Capability Badges (Agents Page)
- checklist: Grocery lists
- restaurant_menu: Meal planning
- menu_book: Recipe suggestions

---

## 5. Cross-Agent Test Scenarios

These test behaviors shared across all agents.

### Markdown Rendering (all agents)
| Content Type | Test | Expected |
|-------------|------|----------|
| `**bold text**` | Send any message | Bold renders as `<strong>` |
| `| table | row |` | Schedule/budget responses | Table with borders, aligned columns |
| `- bullet list` | Capability lists | Disc-style bullets, proper indent |
| `### Header` | Meal plan days | Larger, bold, headline font |
| `` `inline code` `` | Amounts, dates | Monospace with background highlight |
| `> blockquote` | Warnings, tips | Left border, muted color |
| `[link](url)` | References | Branded color, underlined |

### Chat Persistence (all agents)
| Test | Steps | Expected |
|------|-------|----------|
| Refresh persistence | Send message → Refresh page | Messages still visible |
| Cross-agent isolation | Send message in calendar_whiz → Go to budget_buddy | Budget buddy chat is separate |
| Clear chat | Tap trash icon in header | Chat emptied, starter prompts return |
| 50-message limit | Send 55 messages | Oldest 5 trimmed, newest 50 remain |

### Error Handling (all agents)
| Test | Steps | Expected |
|------|-------|----------|
| Backend error | Send message with backend down | "Sorry, I couldn't process that. Please try again." |
| Quick action API failure | Click quick action that fails | "Sorry, that action failed: {detail}" |
| Empty household_id | Log in without household setup | Send button works but message fails gracefully |

### Starter Prompts (all agents)
| Test | Steps | Expected |
|------|-------|----------|
| Display on empty chat | Navigate to agent | 6 prompts displayed as chips |
| Tap sends message | Tap any prompt | Message sent, typing indicator, response |
| Hidden after first message | Send any message | Prompts disappear, chat messages show |
| Return after clear | Clear chat | Prompts reappear |

---

## 6. Mock Mode Response Validation

When `NEXT_PUBLIC_MOCK_MODE=true`, every agent should return rich responses. Validate against `src/lib/mock-chat-responses.ts`:

| Agent | Response 1 | Response 2 |
|-------|-----------|-----------|
| calendar_whiz | Schedule table with 4 events + conflict warning | Week-at-a-glance bullet list + oil change alert |
| school_event_hub | 2 pending permission slips with fees + sign actions | School events table with 4 events |
| budget_buddy | March spending summary table (5 categories) + overage warning | Receipt scan result with itemized list |
| grocery_guru | Current grocery list with checkboxes (8 items) | Meal plan (Mon-Fri) with 12 items added |

**Cycling behavior:** Repeated messages alternate between Response 1 and Response 2 per agent.

---

## 7. Agent Page (Listing) Tests

Route: `/agents`

| Test | Expected |
|------|----------|
| All 4 agents visible | Schedule Sync, School Hub, Expense Tracker, Grocery Planner |
| Capability badges show icons | Each badge has material symbol icon + label text |
| 3 capabilities shown per card | First 3 of each agent's capabilities array |
| Tap card navigates to chat | `/chat/{agent_type}` |
| Agent order matches config | calendar_whiz, school_event_hub, budget_buddy, grocery_guru |
