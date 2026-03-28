# Enhancement Plan: Dad.alpha Agent Skills Upgrade

**Created:** 2026-03-28
**Status:** Complete
**Author:** Claude
**Scope:** Frontend-only (dad-alpha repo) — no backend changes
**Related Files:**
- `src/config/dad-agents.ts` — agent roster (source of truth)
- `src/config/dad-agents.test.ts` — agent roster tests
- `src/components/chat/AgentChatClient.tsx` — chat UI + starter prompts + markdown renderer
- `src/stores/chat-store.ts` — chat state management
- `src/stores/agents-store.ts` — agent list state
- `src/lib/api-client.ts` — all backend endpoints (already wired)
- `src/types/api-contracts.ts` — API types (already defined)
- `src/app/(app)/agents/page.tsx` — agent listing page
- `src/app/(app)/chat/[agent]/page.tsx` — chat route

---

## The Core Problem

The `api-client.ts` already has **30+ backend endpoints wired up** — calendar CRUD, expense tracking, receipt upload, grocery lists, permission slips, vehicle service, home projects, trip planning, analytics, Google Calendar sync. But the agent chat experience doesn't leverage any of it. Every agent interaction funnels through a single `chat.send()` call that returns plain text rendered with a 10-line markdown parser that only handles `**bold**`.

The agents have the plumbing. They're missing the skills.

---

## 1. Enhancement Breakdown

### 1A. Enriched Starter Prompts (all 4 agents)

**Current:** 3 generic prompts per agent hardcoded in `getStarterPrompts()` inside `AgentChatClient.tsx`.

**Upgrade:** Context-aware starter prompts that map to real API capabilities, moved to `dad-agents.ts` as the single source of truth.

| Agent | Current (3) | Upgraded (6-8) |
|-------|------------|----------------|
| **Schedule Sync** | "What's on today?", "Check for conflicts", "Sync calendars" | + "What's my week look like?", "Any vehicle service due soon?", "Plan around the kids' school schedule", "Block time for the home project", "When's our next trip?" |
| **School Hub** | "Pending permission slips", "School events this week", "Check deadlines" | + "Any slips I need to sign?", "What's due this week?", "School calendar for next month", "Are there any fees to pay?", "Remind me about pickup time" |
| **Expense Tracker** | "Monthly spending?", "Scan a receipt", "Recurring bills" | + "How's our budget this month?", "What did we spend on groceries?", "Compare to last month", "Any upcoming bills?", "Log this expense", "How much is the home project costing?" |
| **Grocery Planner** | "Show grocery list", "Plan meals", "Add item" | + "What's on the list?", "Plan meals for the week", "We need stuff for tacos", "What do we need from Costco?", "Anything running low?", "Suggest a quick dinner" |

**Files changed:** `dad-agents.ts` (add `starter_prompts` field), `AgentChatClient.tsx` (read from agent config instead of local function)

### 1B. Smart Quick Actions That Call Real Endpoints

**Current:** `handleQuickAction()` just re-sends `action.label` as a text message to `chat.send()`. Quick actions are indistinguishable from typing.

**Upgrade:** Quick actions dispatch to the correct API endpoint based on `action.action` field.

| Action Type | Current Behavior | Upgraded Behavior |
|-------------|-----------------|-------------------|
| `sign_slip` | Sends "Sign slip" as text | Calls `api.slips.sign(slipId)` → updates UI → confirms |
| `create_event` | Sends "Create event" as text | Calls `api.calendar.create(payload)` → shows event card |
| `add_to_list` | Sends "Add to list" as text | Calls `api.lists.addItem(householdId, agentType, text)` → updates list |
| `sync_google` | Sends "Sync calendars" as text | Calls `api.calendar.syncGoogle()` → shows sync result |
| `upload_receipt` | Sends "Scan a receipt" as text | Opens file picker → calls `api.expenses.uploadReceipt()` → shows parsed expense |
| `view_budget` | Sends "Monthly spending?" as text | Calls `api.budget.get()` + `api.expenses.summary()` → renders inline summary |
| `toggle_item` | N/A | Calls `api.lists.toggleItem()` → checks/unchecks in rendered list |

**Files changed:** `AgentChatClient.tsx` (new `handleSmartAction()` dispatcher), `chat-store.ts` (add action result handling)

### 1C. Rich Markdown Rendering

**Current:** `renderMarkdown()` is 10 lines — splits on `\n`, parses `**bold**`, renders `<br/>`. Tables, headers, lists, links, and code blocks all render as flat text.

**Upgrade:** Replace with a lightweight markdown renderer that handles what agents actually return.

**Minimum support needed:**
- `**bold**` and `*italic*` (already have bold)
- `- bullet lists` and `1. numbered lists`
- `| table | rows |` (agents return tabular data for schedules, expenses, comparisons)
- `### headers` (section breaks in longer responses)
- `` `inline code` `` (for amounts, dates, times)
- `[links](url)` (for external references)

**Approach:** Use `marked` (12KB gzipped, already CommonMark-compliant) + `DOMPurify` (8KB gzipped) for XSS protection. Render via `dangerouslySetInnerHTML` with sanitized output. This is the standard pattern — not worth hand-rolling.

**Files changed:** `AgentChatClient.tsx` (replace `renderMarkdown`), `package.json` (add `marked`, `dompurify`, `@types/dompurify`)

### 1D. Chat Persistence Across Sessions

**Current:** `useChatStore` uses `create()` without `persist` middleware. Page refresh loses all conversation history.

**Upgrade:** Add Zustand `persist` middleware (same pattern as `useAuthStore`). Key: `"dad-alpha-chat"`. Conversations persist in localStorage per agent.

**Bonus:** Add a "clear chat" button per agent (the store method `clearChat` already exists but has no UI trigger).

**Files changed:** `chat-store.ts` (add `persist` wrapper), `AgentChatClient.tsx` (add clear chat button in header)

### 1E. Mock Mode Chat Responses

**Current:** Mock mode defines `MOCK_AGENTS` with name/icon/description but `chat.send()` still hits `localhost:8000`. In mock mode with no backend, chat is broken.

**Upgrade:** In mock mode, `sendMessage` returns canned responses per agent that demonstrate the agent's full capabilities including quick actions, markdown formatting, and structured content.

**Mock response examples:**
- **calendar_whiz:** Returns a markdown table of today's events + quick actions ["Add event", "Sync Google Calendar"]
- **budget_buddy:** Returns a spending summary with categories + quick actions ["Upload receipt", "View full breakdown"]
- **grocery_guru:** Returns a checklist-style grocery list + quick actions ["Add item", "Clear checked"]
- **school_event_hub:** Returns pending permission slips with due dates + quick actions ["Sign now", "View all"]

**Files changed:** `chat-store.ts` (add mock response generator), possibly new `src/lib/mock-chat-responses.ts`

### 1F. Agent Capability Mapping (Config Upgrade)

**Current:** `DadAgentDefinition` has `capabilities: string[]` — a flat list of marketing labels.

**Upgrade:** Add structured capability metadata that maps to real API methods and enables smarter UI decisions.

```typescript
export interface AgentCapability {
  label: string;           // Display name: "Receipt scanning"
  action: string;          // API action: "upload_receipt"
  icon: string;            // Material symbol: "receipt_long"
  tier?: SubscriptionTier; // Required tier (default: any)
}

export interface DadAgentDefinition {
  agent_type: AgentType;
  name: string;
  description: string;
  icon: string;
  capabilities: AgentCapability[];  // Upgraded from string[]
  starter_prompts: string[];        // Moved from AgentChatClient
  color: string;                    // Agent accent color token
}
```

This enables:
- Agents page shows capability icons + tier badges instead of just text
- Starter prompts live in config (single source of truth)
- Quick actions map to capabilities by action key
- Tier-gated features show lock icon for non-Pro users

**Files changed:** `dad-agents.ts` (new interface + updated definitions), `dad-agents.test.ts` (updated assertions), `agents/page.tsx` (render capability icons), `AgentChatClient.tsx` (consume `starter_prompts` and `color` from config)

---

## 2. Reuse vs New Code Analysis

### Reuse As-Is (no changes)

| Component | Why |
|-----------|-----|
| `api-client.ts` | All 30+ endpoints already wired. Not a single new endpoint needed. |
| `api-contracts.ts` | All types already defined (CalendarEvent, Expense, GroceryList, PermissionSlip, etc.) |
| `agents-store.ts` | Fetch/toggle pattern unchanged |
| `auth-store.ts` | No changes |
| `household-store.ts` | No changes |
| `household-ops-store.ts` | Already has mock data for vehicles, projects, trips, routines |

### Extend (small changes to existing files)

| Component | What Changes | Size |
|-----------|-------------|------|
| `dad-agents.ts` | New `AgentCapability` interface, `starter_prompts` field, `color` field | ~60 lines added |
| `dad-agents.test.ts` | Assert new fields, validate capability actions map to real API methods | ~30 lines added |
| `chat-store.ts` | Add `persist` middleware + mock response path | ~50 lines added |
| `AgentChatClient.tsx` | Consume config prompts, smart quick actions, clear chat button | ~40 lines changed |
| `agents/page.tsx` | Render capability icons + tier badges | ~15 lines changed |

### Net-New (justified)

| Component | Why It Can't Be Reused | Size |
|-----------|----------------------|------|
| Markdown rendering (in `AgentChatClient.tsx`) | Current 10-line parser can't handle tables/lists/headers. Replace with `marked` + `DOMPurify`. | ~20 lines (import + sanitize wrapper) |
| `src/lib/mock-chat-responses.ts` | Mock responses per agent don't exist anywhere. Needed for offline dev. | ~120 lines |
| Smart action dispatcher (in `AgentChatClient.tsx`) | Current dispatcher just re-sends text. Need a switch on `action.action` that calls the right API method. | ~60 lines |

**Total new code: ~400 lines across 8 files. No new components, no new pages, no new stores.**

---

## 3. Workflow Impact Analysis

### Workflow Steps Affected

| Flow | What Changes | Risk |
|------|-------------|------|
| **Agent chat** | Richer rendering, smart quick actions, persistence | **Medium** — core UX path, but all changes are additive |
| **Agent listing** | Capability icons, tier badges | **Low** — visual only |
| **Mock mode** | Actually works now (currently broken for chat) | **Low** — fixes a bug |
| **Static export** | No impact — all client-side | **None** |

### State Changes

1. **Chat persistence:** Messages now survive page refresh (Zustand persist). This is a UX improvement with no regression risk — same pattern as auth store.
2. **Quick action dispatch:** Actions call real endpoints instead of re-sending text. Needs error handling for each action type. **Regression risk: medium** — if an endpoint fails, the quick action fails silently unless we handle it.
3. **No new state shapes.** All data types already exist in `api-contracts.ts`.

### Regression Risk Summary

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `marked` XSS in agent responses | **High** | DOMPurify sanitizes all HTML. Test with malicious markdown inputs. |
| Smart actions call wrong endpoint | **Medium** | Type the action dispatcher — each `action.action` string maps to exactly one API method. |
| localStorage quota exceeded | **Low** | Chat persist with `partialize` to limit stored messages per agent (e.g., last 100). |
| Existing tests break | **Low** | Only `dad-agents.test.ts` needs updating (new interface shape). |
| Mock responses drift from real API | **Low** | Mock responses should use the same TypeScript types as real responses. |

---

## 4. Implementation Phases

### Phase 1: Agent Config Upgrade + Starter Prompts (~1 day)

**Tasks:**
1. Define `AgentCapability` interface in `dad-agents.ts`
2. Upgrade all 4 agent definitions with:
   - Structured capabilities (label, action, icon, tier)
   - `starter_prompts` array (6-8 per agent)
   - `color` token for agent accent
3. Move `getStarterPrompts()` out of `AgentChatClient.tsx` — read from agent config
4. Update `dad-agents.test.ts`:
   - Assert capabilities have valid action keys
   - Assert starter_prompts exist and are non-empty
   - Assert color tokens are valid
5. Update `agents/page.tsx` to render capability icons and tier badges

**Dependencies:** None
**Success Criteria:**
- `npm run test` passes (including updated agent tests)
- Agents page shows richer capability display
- Chat shows 6-8 starter prompts instead of 3

### Phase 2: Rich Markdown + Chat Persistence (~1 day)

**Tasks:**
1. Install `marked` + `dompurify` + `@types/dompurify`
2. Replace `renderMarkdown()` in `AgentChatClient.tsx`:
   - Parse with `marked.parse()`
   - Sanitize with `DOMPurify.sanitize()`
   - Render with `dangerouslySetInnerHTML`
   - Style markdown elements with Tailwind (tables, lists, headers, code)
3. Add `persist` middleware to `useChatStore`:
   - Key: `"dad-alpha-chat"`
   - `partialize` to store last 50 messages per agent
4. Add "Clear chat" button in chat header (calls existing `clearChat` method)

**Dependencies:** None (parallel with Phase 1)
**Success Criteria:**
- Agent responses with tables, lists, headers render correctly
- Chat survives page refresh
- Clear chat button works
- No XSS possible (test with `<script>alert(1)</script>` in mock responses)

### Phase 3: Mock Chat Responses (~1 day)

**Tasks:**
1. Create `src/lib/mock-chat-responses.ts`:
   - Per-agent response map keyed by intent keywords
   - Each mock response includes: content (markdown), quick_actions, intent_type
   - calendar_whiz: returns markdown tables of events, conflict alerts
   - budget_buddy: returns expense summaries with categories, budget status
   - grocery_guru: returns checklist-formatted grocery lists, meal plan suggestions
   - school_event_hub: returns permission slip status, upcoming deadlines
2. Update `chat-store.ts` `sendMessage`:
   - When `NEXT_PUBLIC_MOCK_MODE=true`, match input to mock responses instead of calling API
   - Add 500-1000ms delay to simulate network latency
   - Return mock quick actions that exercise the full quick action set

**Dependencies:** Phase 2 (markdown rendering needed to display rich mock responses)
**Success Criteria:**
- `npm run dev` with mock mode shows rich agent conversations
- All 4 agents produce useful mock responses with quick actions
- Mock responses exercise markdown features (tables, lists, bold)

### Phase 4: Smart Quick Action Dispatcher (~1-2 days)

**Tasks:**
1. Create `handleSmartAction()` in `AgentChatClient.tsx`:
   ```
   switch (action.action) {
     case "sign_slip": → api.slips.sign(payload.slipId) → show confirmation
     case "create_event": → api.calendar.create(payload) → show event card
     case "add_to_list": → api.lists.addItem(...) → show updated list
     case "sync_google": → api.calendar.syncGoogle() → show sync count
     case "upload_receipt": → open file picker → api.expenses.uploadReceipt() → show expense
     case "view_budget": → api.budget.get() + api.expenses.summary() → render inline
     case "toggle_item": → api.lists.toggleItem() → update checkbox
     case "view_conflicts": → api.calendar.conflicts() → render conflict cards
     default: → fall back to sendMessage (current behavior)
   }
   ```
2. Each action shows a local success/error message in the chat stream (appended as an agent message)
3. Mock mode: smart actions return mock success responses without hitting API
4. Add haptic feedback on action completion (via `navigator.vibrate` if available)

**Dependencies:** Phases 1-3
**Success Criteria:**
- Quick actions call correct endpoints (verify in Network tab)
- Action results display inline in chat as agent messages
- Errors show friendly message, not raw API error
- Mock mode smart actions work offline
- All quick action types have test coverage

### Phase 5: Testing + Polish (~1 day)

**Tasks:**
1. **Unit tests:**
   - `dad-agents.test.ts` — validate new capability structure, starter prompts, color tokens
   - New test: mock-chat-responses return valid ChatResponse shapes
   - New test: smart action dispatcher handles all action types
2. **E2E tests:**
   - `e2e/agent-chat.spec.ts` — send message, see response, click quick action
   - `e2e/agent-starter-prompts.spec.ts` — verify prompts render, clicking sends message
3. **Polish:**
   - Markdown table styling (borders, padding, responsive scroll)
   - Quick action loading states (spinner on button while API call in flight)
   - Empty state when agent has no capabilities for user's tier
4. `npm run build` — verify static export works with all changes

**Dependencies:** Phase 4
**Success Criteria:**
- `npm run test` — all unit tests pass
- `npm run test:e2e` — all E2E tests pass
- `npm run build` — static export succeeds
- `npm run lint` — no linting errors

---

## 5. Testing Strategy

### Unit Tests

| Test | What It Validates |
|------|-------------------|
| `dad-agents.test.ts` | Capability structure (label, action, icon), starter_prompts non-empty, color valid, action keys unique |
| `mock-chat-responses.test.ts` (new) | Every agent has responses, responses match ChatResponse type, quick actions have valid action keys |
| `chat-store.test.ts` (new) | Persist middleware saves/loads, mock mode returns responses, clearChat empties messages |

### E2E Tests

| Test | Scenario |
|------|----------|
| `e2e/agent-chat.spec.ts` | Open agent → see starter prompts → tap prompt → see response → see quick actions |
| `e2e/agent-listing.spec.ts` | Agents page shows all 4 agents with capability badges |

### Manual Testing Checklist

- [ ] Mock mode: each agent responds with rich markdown (table, list, bold)
- [ ] Mock mode: quick actions trigger and show inline results
- [ ] Chat persists across page refresh
- [ ] Clear chat empties conversation
- [ ] Markdown tables render with proper alignment on mobile
- [ ] XSS test: `<script>` tags in responses are sanitized
- [ ] Agents page: capability icons render, Pro badge shows on gated features
- [ ] `npm run build` completes without errors

---

## 6. Open Questions / Risks

### Assumptions

1. **Backend returns markdown.** The smart rendering only helps if backend agents return formatted responses. If they return flat text, markdown rendering is wasted effort. Mitigated by mock mode showing what "good" responses look like — sets the target for backend.
2. **Quick action payloads are structured.** The `QuickAction.payload` field (already typed as `Record<string, unknown>`) contains the data needed for API calls (e.g., `slipId` for `sign_slip`). Backend must populate this.
3. **`marked` + `dompurify` don't break static export.** Both are client-side only, no SSR — should be fine with `"use client"`.

### Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| `marked` bundle size (~12KB gz) | Low | Acceptable for the rendering quality gain. Can lazy-load if needed. |
| localStorage quota (5MB limit) | Low | Partialize chat store to last 50 messages per agent. 4 agents × 50 msgs ≈ 200KB. |
| Smart actions diverge from backend expectations | Medium | Type the action dispatcher. If backend changes action names, TypeScript catches it. |
| Mom-alpha drift | Medium | Only `dad-agents.ts` is dad-specific. `api-contracts.ts` and `api-client.ts` are already shared types — no drift risk from these changes. |

### What This Plan Does NOT Cover (intentionally)

- **Backend agent intelligence** — prompt engineering, tool use, LangGraph pipelines → `family_platform/` repo
- **Streaming/SSE** — requires backend SSE endpoint that doesn't exist yet
- **Cross-agent orchestration** — "Plan my week" → requires backend coordinator
- **Agent handoffs** — agent A delegates to agent B → requires backend routing
- **New agents** (tutor_finder, health_hub, etc.) → out of MVP scope

---

## Timeline Summary

| Phase | Work | Duration | Parallel? |
|-------|------|----------|-----------|
| Phase 1 | Agent config + starter prompts | 1 day | Yes (with Phase 2) |
| Phase 2 | Rich markdown + chat persistence | 1 day | Yes (with Phase 1) |
| Phase 3 | Mock chat responses | 1 day | After Phase 2 |
| Phase 4 | Smart quick action dispatcher | 1-2 days | After Phase 3 |
| Phase 5 | Testing + polish | 1 day | After Phase 4 |
| **Total** | | **4-5 days** | Phases 1+2 parallel |

**~400 lines of new/changed code across 8 files. No new pages, no new stores, no new components. Two new npm dependencies.**
