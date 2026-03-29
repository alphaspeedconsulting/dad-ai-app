# Dad.alpha — Household Ops Test Matrix

**Created:** 2026-03-28
**Updated:** 2026-03-29
**For:** Claude Cowork testing of `/household-ops` page
**Tier requirement:** `family_pro` only
**Reference:** `src/app/(app)/household-ops/page.tsx`, `src/stores/household-ops-store.ts`

---

## 1. Access Control

| Test | Persona | Expected |
|------|---------|----------|
| Trial user visits `/household-ops` | trial tier | PremiumGate shown: "Family Pro feature" with upgrade link |
| Family user visits `/household-ops` | family tier | PremiumGate shown |
| Family Pro user visits `/household-ops` | family_pro tier | Full page with stats + tabs |
| No household_id | family_pro, no household | "Set up your household" message with link to /settings |
| Not logged in | No token | Redirect to `/login?mode=signup` |

---

## 2. Summary Dashboard (Stat Boxes)

The summary shows 4 stat boxes above the tab bar. Stats are computed client-side from store data.

| Stat Box | Icon | Value | Label | Computation |
|----------|------|-------|-------|-------------|
| Vehicles | directions_car | Vehicle count | "X service due" or "Vehicles" | Count vehicles; count where any service item `next_due_at <= today` |
| Projects | home_repair_service | Active project count | "$X,XXX" or "Projects" | Filter `status === "planned" or "in_progress"`; sum `estimated_cost` |
| Trips | flight_takeoff | Days to next trip OR trip count | "days to trip" or "Trips" | Find soonest trip where `start_date >= today`; compute days delta |
| Routines | routine | Active routines count | "Routines" | Filter `is_active === true` |

### Summary Tests

| Test | Setup | Expected |
|------|-------|----------|
| Empty state | No items in any category | All stat boxes show "0" |
| Mock data loaded | Default mock data | 1 vehicle, 1 project ($450), 1 trip, 1 routine |
| Service due count | Vehicle with `next_due_at` in the past | Service due count shows, icon turns red (text-error) |
| No service due | All service items in the future | "Vehicles" label (not "X service due"), icon stays blue |
| Project cost sum | 2 active projects with costs | Sum displayed (e.g., "$750") |
| Project cost null | Active project with `estimated_cost: null` | Treated as $0, no NaN |
| Trip countdown | Trip starting in 5 days | "5" with "days to trip" label |
| No upcoming trips | All trips in the past or no trips | Shows trip count with "Trips" label |
| Stats update on add | Add a new vehicle | Vehicle count increments immediately |
| Stats update on delete | Delete a project | Project count decrements immediately |

---

## 3. Tab Navigation

| Test | Expected |
|------|----------|
| Default tab | Garage tab active on first load |
| Tab from URL | `/household-ops?tab=home` → Home tab active |
| Invalid tab in URL | `/household-ops?tab=invalid` → Falls back to Garage |
| Tab switching | Tap each tab → Content changes, active tab highlighted (bg-brand text-white) |
| Inactive tab style | Muted foreground text, no background |
| Tab icons | Filled icon when active (`'FILL' 1`), outlined when inactive |

---

## 4. Garage Tab

### Vehicle CRUD

| Test | Steps | Expected |
|------|-------|----------|
| Empty state | No vehicles | Garage icon + "No vehicles yet" message |
| Add vehicle (minimal) | Tap "Add vehicle" → Enter nickname → Submit | Card appears with nickname, "No details" subtitle |
| Add vehicle (full) | Fill nickname, make, model, year, mileage | Card shows "2021 Honda Pilot · 34,200 mi" |
| Cancel add | Tap "Add vehicle" → Tap "Cancel" | Form dismissed, no vehicle added |
| Validation | Submit with empty nickname | Button disabled, no submission |
| Delete vehicle | Tap expand → "Remove" link | Vehicle disappears, stat updates |
| Photo display | Vehicle with `photo_url` | Photo shown as 10x10 rounded image |
| No photo | Vehicle with `photo_url: null` | Car icon in brand-glow circle |

### Vehicle Expand / Service History

| Test | Steps | Expected |
|------|-------|----------|
| Expand vehicle | Tap vehicle card | Card expands, shows notes + service history |
| Collapse vehicle | Tap expanded vehicle | Card collapses |
| No service items | Expand vehicle with no history | "No service items logged." |
| Service item display | Expand vehicle with service | Shows type, provider ("Oil Change — Bob's Auto Shop") |
| Service due date | Item with `next_due_at` | "Next due: 2026-06-01 or 36,000 mi" |
| Agent cross-links | Expand vehicle | "Add to calendar" links to `/chat/calendar_whiz?context=vehicle:{id}` |
| Log expense link | Expand vehicle | "Log expense" links to `/chat/budget_buddy?context=vehicle:{id}` |
| Calendar context auto-message | Tap "Add to calendar" on vehicle | Chat opens with auto-sent message: "I'm looking at vehicle {id} — what's the upcoming service schedule?" |
| Expense context auto-message | Tap "Log expense" on vehicle | Chat opens with auto-sent message: "Show me expenses for vehicle {id}" |
| Context param in URL | Navigate via vehicle cross-link | URL contains `?context=vehicle:{id}` and agent responds with vehicle-relevant info |

### Garage Filter Pills

| Test | Steps | Expected |
|------|-------|----------|
| Pills hidden when empty | No vehicles | No filter pills shown |
| "All" pill default | Vehicles exist | "All (N)" selected (brand bg + white text) |
| "Service Due" pill | Vehicle with overdue service | "Service Due (N)" pill visible |
| No due items | All service items in future | "Service Due" pill not shown |
| Filter by service due | Tap "Service Due" | Only vehicles with overdue service shown |
| Back to All | Tap "All" | All vehicles shown |

---

## 5. Home Tab

### Project CRUD

| Test | Steps | Expected |
|------|-------|----------|
| Empty state | No projects | Wrench icon + "No home projects yet" message |
| Add project (minimal) | Tap "Add project" → Enter title → Submit | Card with title, "Planned" status, "Other" area |
| Add project (full) | Title + description + area + cost | All fields displayed on card |
| Area selection | Select "Exterior" from dropdown | Card shows "Exterior" tag |
| Status badge colors | Projects with different statuses | planned=muted, in_progress=brand, completed=tertiary, on_hold=secondary |
| Delete project | Tap X button | Project removed |
| Photo display | Project with `photo_url` | Full-width banner (h-32) at top of card |
| No photo | Project with `photo_url: null` | No banner, card starts with content |
| Checklist link | Card footer | "Checklist" links to `/checklists?context=project:{id}` |
| Log expense link | Card footer | "Log expense" links to `/chat/budget_buddy?context=project:{id}` |
| Project expense context auto-message | Tap "Log expense" on project | Chat opens with auto-sent message: "What are the costs for home project {id}?" |
| Project context param in URL | Navigate via project cross-link | URL contains `?context=project:{id}` and agent responds with project-relevant info |

### Home Filter Pills

| Test | Steps | Expected |
|------|-------|----------|
| Pills hidden when empty | No projects | No filter pills |
| "All" default | Projects exist | "All (N)" selected |
| Filter by Planned | Tap "Planned (N)" | Only planned projects shown |
| Filter by In Progress | Tap "In Progress (N)" | Only in-progress projects shown |
| Zero-count pills hidden | No "completed" projects | "Completed" pill not shown |
| Count accuracy | 2 planned, 1 in-progress | "Planned (2)", "In Progress (1)" |

---

## 6. Trips Tab

### Trip CRUD

| Test | Steps | Expected |
|------|-------|----------|
| Empty state | No trips | Airplane icon + "No trips planned" message |
| Add trip (minimal) | Tap "Plan a trip" → Enter destination → Submit | Card with destination, "Dates TBD" |
| Add trip (full) | Destination + dates + budget + notes | "2026-07-12 – 2026-07-19 · $2,200 budget" |
| Date formatting | Start only | Shows start date only |
| Date formatting | Both dates | Shows "start – end" range |
| Delete trip | Tap X button | Trip removed |
| Photo display | Trip with `photo_url` | Full-width banner at top of card |
| Calendar link | Card footer | "Add to calendar" → `/chat/calendar_whiz?context=trip:{id}` |
| Packing list link | Card footer | "Packing list" → `/checklists?context=trip:{id}` |
| Budget link | Card footer | "Budget" → `/chat/budget_buddy?context=trip:{id}` |
| Trip calendar context auto-message | Tap "Add to calendar" on trip | Chat opens with auto-sent message: "Help me plan dates for trip {id}" |
| Trip budget context auto-message | Tap "Budget" on trip | Chat opens with auto-sent message: "What's the budget for trip {id}?" |
| Trip context param in URL | Navigate via trip cross-link | URL contains `?context=trip:{id}` and agent responds with trip-relevant info |

### Trip Filter Pills

| Test | Steps | Expected |
|------|-------|----------|
| "All" default | Trips exist | "All (N)" selected |
| Filter by Planning | Tap "Planning (N)" | Only planning trips shown |
| Filter by Booked | Tap "Booked (N)" | Only booked trips shown |
| Zero-count pills hidden | No completed trips | "Completed" pill not shown |

---

## 7. Routines Tab

### Routine CRUD

| Test | Steps | Expected |
|------|-------|----------|
| Empty state | No routines | Routine icon + "No routines yet" message |
| Info banner | Always | "Routines are checklist-driven reminders — not connected to smart-home devices" |
| Add routine | Tap "New routine" → Enter name → Submit | Card with name + active dot (green) |
| Steps display | Routine with steps | Ordered list (1, 2, 3...) with labels |
| Step trigger time | Step with `trigger_value: "18:00"` | "@ 18:00" in brand color next to label |
| Active indicator | `is_active: true` | Green dot (bg-brand) |
| Inactive indicator | `is_active: false` | Gray dot (bg-muted-foreground/40) |
| Delete routine | Tap X button | Routine removed |
| Steps note | During add form | "Steps can be added via the agent chat" |

---

## 8. Mock Mode Behavior

All tabs should work fully in mock mode (`NEXT_PUBLIC_MOCK_MODE=true`):

| Tab | Mock Data | Count |
|-----|-----------|-------|
| Garage | "Family SUV" — 2021 Honda Pilot, 34,200 mi | 1 vehicle |
| Garage Service | "Oil Change" by Bob's Auto Shop, due 2026-06-01 | 1 item |
| Home | "Backyard Fence Repair" — planned, yard, $450 | 1 project |
| Trips | "Beach Week — Outer Banks" — July 12-19, $2,200 | 1 trip |
| Routines | "Sunday Evening Wind-Down" — 2 steps, active | 1 routine |

### Mock CRUD Tests

| Test | Expected |
|------|----------|
| Add vehicle in mock | New vehicle added to local state, no API call |
| Delete vehicle in mock | Removed from local state immediately |
| Add project in mock | `photo_url: null`, `checklist_id: null` defaults applied |
| Add trip in mock | `status: "planning"` default, `photo_url: null` |
| Add service item in mock | `serviced_by: null` default unless provided |

---

## 9. Error States

| Test | Trigger | Expected |
|------|---------|----------|
| API fetch error | Backend returns 500 | Red error card: "{error message}" with "Dismiss" button |
| Dismiss error | Tap "Dismiss" | Error card removed |
| Create fails | API rejects create | Error card shown, item not added |
| Delete fails | API rejects delete | Error card shown, item restored (optimistic rollback for vehicles) |
| Loading state | Slow API response | `isLoading: true` — no empty state flash |

---

## 10. Cross-Feature Integration

### Agent Context Params (added 2026-03-29)

AgentChatClient now reads the `?context=` query param and auto-sends a contextual opening message instead of showing generic starter prompts.

| Context Param | Agent | Auto-sent Message |
|---------------|-------|-------------------|
| `vehicle:{id}` | calendar_whiz | "I'm looking at vehicle {id} — what's the upcoming service schedule?" |
| `vehicle:{id}` | budget_buddy | "Show me expenses for vehicle {id}" |
| `project:{id}` | budget_buddy | "What are the costs for home project {id}?" |
| `trip:{id}` | calendar_whiz | "Help me plan dates for trip {id}" |
| `trip:{id}` | budget_buddy | "What's the budget for trip {id}?" |

### Cross-Link Navigation

| Test | Steps | Expected |
|------|-------|----------|
| Vehicle → Calendar agent | Expand vehicle → "Add to calendar" | Opens calendar_whiz chat; URL has `?context=vehicle:{id}`; context message auto-sent; agent responds with vehicle-relevant info |
| Vehicle → Budget agent | Expand vehicle → "Log expense" | Opens budget_buddy chat; URL has `?context=vehicle:{id}`; context message auto-sent; agent responds with vehicle-relevant info |
| Project → Checklists | Project card → "Checklist" | Opens checklists page with project context |
| Project → Budget agent | Project card → "Log expense" | Opens budget_buddy chat; URL has `?context=project:{id}`; context message auto-sent; agent responds with project-relevant info |
| Trip → Calendar agent | Trip card → "Add to calendar" | Opens calendar_whiz chat; URL has `?context=trip:{id}`; context message auto-sent; agent responds with trip-relevant info |
| Trip → Checklists | Trip card → "Packing list" | Opens checklists page with trip context |
| Trip → Budget agent | Trip card → "Budget" | Opens budget_buddy chat; URL has `?context=trip:{id}`; context message auto-sent; agent responds with trip-relevant info |
| No context param | Navigate to `/chat/calendar_whiz` directly (no `?context=`) | Generic starter prompts shown, no auto-sent message |
| Invalid context param | Navigate to `/chat/calendar_whiz?context=bogus:123` | Graceful fallback — generic starter prompts, no crash |
| Stats → Tab context | See "1 service due" in stats → Switch to Garage → Filter "Service Due" | Same vehicle count as stat box |

### Dashboard Quick Actions (added 2026-03-29)

The dashboard now shows a 6-item quick actions grid linking to all agents and key pages.

| Test | Steps | Expected |
|------|-------|----------|
| All 6 actions visible | Visit `/dashboard` | Grid shows: Schedule Sync, Grocery List, Expenses, School Hub, Checklists, House Ops |
| Schedule Sync link | Tap "Schedule Sync" | Navigates to `/chat/calendar_whiz` |
| Grocery List link | Tap "Grocery List" | Navigates to `/chat/grocery_guru` |
| Expenses link | Tap "Expenses" | Navigates to `/chat/budget_buddy` |
| School Hub link | Tap "School Hub" | Navigates to `/chat/school_event_hub` |
| Checklists link | Tap "Checklists" | Navigates to `/checklists` |
| House Ops link | Tap "House Ops" | Navigates to `/household-ops` |
