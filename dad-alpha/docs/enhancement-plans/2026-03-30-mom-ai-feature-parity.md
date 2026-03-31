# Enhancement Plan: Mom.AI Feature Parity for Dad.AI

**Created:** 2026-03-30
**Status:** Complete
**Author:** Claude
**Related Files:**
- `src/types/api-contracts.ts`
- `src/lib/api-client.ts`
- `src/stores/chat-store.ts`
- `src/app/(app)/dashboard/page.tsx`
- All new stores, pages, hooks, and components listed per phase

---

## Source Material

| Source | What was reviewed |
|--------|-------------------|
| `/Users/miguelfranco/Cowork Basic Plugin Kit/cowork_plugin/platform files/family_platform/` | 35+ backend routers, handlers, AI skills — shared by both apps |
| `/Users/miguelfranco/Cowork Basic Plugin Kit/cowork_plugin/platform files/mom_alpha/` | FastAPI host, confirms which endpoints are live |
| `/Users/miguelfranco/Mom.Ai App/mom-ai-app/mom-alpha/src/` | Full Next.js frontend — stores, pages, hooks, components, contracts |

---

## 1. Enhancement Breakdown

### What Mom.AI has that Dad.AI does not (full inventory)

#### A. API Contract Delta (`api-contracts.ts`)
Mom.AI's `ChatRequest` includes `memory_context` and `chat_history` fields not present in Dad.AI, allowing the backend to personalize responses with family knowledge and prevent re-asking answered questions. `ChatResponse` includes `memory_hints` (backend-extracted facts to save locally). `ApiError` has an `isUpgradeRequired` flag for 402/403 responses. New types also exist for all features below.

| Missing Type | Purpose |
|---|---|
| `MemoryContextItem` | Lightweight memory item sent alongside each chat request |
| `ChatHistoryItem` | Recent conversation turn for multi-turn context |
| `memory_hints` on `ChatResponse` | Backend-extracted family facts to persist locally |
| `isUpgradeRequired` on `ApiError` | Gate tier-locked features cleanly |
| `CoParentBalance` | Weekly task split stats between parents |
| `SharedInboxItem` | Cross-parent task delegation with status tracking |
| `FamilyGoal` | Gamified household goals (savings, meals, exercise) |
| `WeeklyWinSummary` | Shareable family accomplishment summary |
| `VillagePost` / `VillageComment` | Community feed posts and reactions |
| `CaregiverAccess` | Babysitter/grandparent limited permission grant |
| `EmergencyActivateRequest` | "I'm sick" delegation to co-parent |
| `FamilyTemplate` | User-generated routine/meal plan templates |
| `SeasonalPack` | Timely content packs (back-to-school, holidays) |
| `ReferralInfo` | Referral code + reward tracking (viral loop) |
| `ShareLink` | Deep link sharing for lists, events, win cards |
| `VoiceBriefingResponse` | TTS morning briefing content |
| `PromotionValidateResponse` | Stripe promo code validation |

#### B. `lib/` Delta
| Missing File | Purpose |
|---|---|
| `src/lib/memory-store.ts` | IndexedDB wrapper — persists `MemoryItem[]`, `InboxItem[]`, and `PersistedChatMessage[]` on-device |
| `src/lib/memory-extract.ts` | Regex-based insight extraction from agent responses; processes `memory_hints` from backend |

#### C. `stores/` Delta
| Missing Store | Backend Router |
|---|---|
| `memory-store.ts` (Zustand over IndexedDB) | — (local only) |
| `balance-store.ts` | `balance_router.py` |
| `wins-store.ts` | `wins_router.py` |
| `goals-store.ts` | `goals_router.py` |
| `tasks-store.ts` | `tasks_router.py` |
| `calendar-store.ts` | `calendar_router.py` |
| `village-store.ts` | `village_router.py` |
| `referral-store.ts` | `referral_router.py` |
| `templates-store.ts` | `template_router.py` |

#### D. `hooks/` Delta
| Missing Hook | Purpose |
|---|---|
| `use-memory.ts` | Hydrate IndexedDB memory on app mount |
| `use-voice-briefing.ts` | Web Speech Synthesis (TTS) for morning briefing |
| `use-sw-update.ts` | Detect service worker updates → show UpdateBanner |
| `use-push-notifications.ts` | Register push subscription with backend |
| `use-share.ts` | Web Share API for deep link sharing |

#### E. `components/` Delta
| Missing Component | Purpose |
|---|---|
| `shared/MemoryHydrator.tsx` | Mount-time IndexedDB hydration (inserted into root layout) |
| `shared/UpdateBanner.tsx` | Service worker update prompt |
| `shared/CelebrationOverlay.tsx` | Full-screen celebration on task/goal completion |
| `shared/Confetti.tsx` | Confetti animation effect |
| `shared/CelebrationToast.tsx` | Lightweight toast for smaller wins |
| `shared/ShareButton.tsx` | Web Share API integration button |
| `shared/QuickCapture.tsx` | Large modal for rapid task/fact capture → memory inbox |
| `dashboard/VoiceBriefing.tsx` | Play/pause TTS morning briefing card |
| `dashboard/DailyBrief.tsx` | Personalized daily summary component |
| `dashboard/WinsTeaser.tsx` | Teaser card linking to /wins |
| `dashboard/BalanceTeaser.tsx` | Co-parent balance quick view |

#### F. Pages (Routes) Delta
| Missing Route | Feature | Backend Dependency |
|---|---|---|
| `/notifications` | Real notification inbox (fixes MED-01 bell icon) | `notifications_router.py` |
| `/memory` | Family second brain — add/search/pin facts | Local IndexedDB + backend sync |
| `/balance` | Co-parent task split tracker | `balance_router.py` |
| `/wins` | Weekly family accomplishment summary | `wins_router.py` |
| `/goals` | Gamified family goals | `goals_router.py` |
| `/emergency` | "I'm sick/traveling" — delegate to co-parent | `emergency_router.py` |
| `/analytics` | Family Pro usage + spending analytics | `analytics_router.py` ✅ already in api-client.ts |
| `/calendar` | Full calendar view (not just chat) | `calendar_router.py` ✅ already in api-client.ts |
| `/referral` | Referral program + rewards | `referral_router.py` |
| `/caregivers` | Invite + manage caregivers | `caregiver_router.py` |
| `/caregiver-view` | Caregiver limited dashboard | `caregiver_router.py` |
| `/seasonal` | Seasonal content packs | `seasonal_router.py` |
| `/templates` | Family routine/meal plan templates marketplace | `template_router.py` |
| `/village` | Community feed (Dad-branded) | `village_router.py` |
| `/share` | Manage shared deep links | `share_router.py` |

---

## 2. Reuse vs New Code Analysis

### What can be reused as-is (copy from Mom.AI, rename DB keys)
- `src/lib/memory-store.ts` — rename `DB_NAME` from `"mom-alpha-memory"` → `"dad-alpha-memory"`, all logic identical
- `src/lib/memory-extract.ts` — fully generic, no Mom.AI-specific logic, copy verbatim
- `src/hooks/use-voice-briefing.ts` — Web Speech Synthesis, no brand dependencies
- `src/hooks/use-sw-update.ts` — generic service worker listener
- `src/hooks/use-memory.ts` — generic IndexedDB hydration
- `src/hooks/use-push-notifications.ts` — generic push subscription
- `src/hooks/use-share.ts` — generic Web Share API
- `src/components/shared/Confetti.tsx` — pure animation, no brand
- `src/components/shared/CelebrationOverlay.tsx` — copy, apply dad theme tokens
- `src/components/shared/CelebrationToast.tsx` — copy, apply dad theme tokens
- `src/components/shared/UpdateBanner.tsx` — generic
- `src/components/shared/MemoryHydrator.tsx` — generic (references `use-memory.ts`)
- `src/components/shared/ShareButton.tsx` — generic
- `src/components/shared/QuickCapture.tsx` — copy, apply dad CSS tokens

### What needs extension (copy then modify)
- `src/stores/chat-store.ts` — Replace Zustand `persist` (localStorage) with IndexedDB via `memory-store.ts`. Add `memory_context` + `chat_history` fields to `api.chat.send()`. Add `loadHistory()`. Add `processAgentResponse()` call. Add `is_tier_error` handling. Keep `isMockMode` mock path.
- `src/types/api-contracts.ts` — Add new types; keep all existing types (Dad-specific `parent_brand` fields must stay). Sync `ChatRequest` and `ChatResponse` with Mom.AI additions.
- `src/lib/api-client.ts` — Add missing endpoint methods; keep `parent_brand: "dad"` injection on auth. Add `isUpgradeRequired` to `ApiError`.
- `src/app/(app)/dashboard/page.tsx` — Add `VoiceBriefing`, `WinsTeaser`, `BalanceTeaser`, `DailyBrief` components; wire notification bell to `/notifications`.
- Dashboard component copies: `DailyBrief`, `VoiceBriefing`, `WinsTeaser`, `BalanceTeaser` — copy from Mom.AI, swap any mom-specific text/icons for dad equivalents.
- `/memory`, `/wins`, `/balance`, `/goals`, `/emergency` pages — copy page structure, apply dad CSS tokens (`dad-card`, `dad-gradient-hero`, `dad-btn-primary`), keep identical API calls.

### What must be net-new (no Mom.AI equivalent or Dad-specific)
- Nothing requires net-new backend work — all routers already exist in `family_platform/` and are hosted by `mom_alpha/`. Dad.AI is an additional frontend brand only.
- Dad branding adaptations for community page: `/village` should be re-labeled "Dad Community" with dad-appropriate categories (parenting hacks, gear reviews, sports, work/life balance, wins).
- Dad-specific mock responses for new agents (if added in Phase 4+): `tutor_finder`, `health_hub`, `sleep_tracker`, `self_care_reminder` — these exist in `mock-chat-responses.ts` reference but are not in current Dad.AI mock file.

**Justification for net-new mock data:** The existing `AGENT_RESPONSES` map in `mock-chat-responses.ts` only covers the 4 MVP agents. Additional agents require new mock entries before pages can be tested in `MOCK_MODE=true`.

---

## 3. Workflow Impact Analysis

### Workflow steps affected

| Workflow | Impact | Risk |
|---|---|---|
| **Chat message flow** | `chat-store.ts` rewrite: localStorage → IndexedDB persistence; `api.chat.send()` gains 2 new optional fields | Medium — backward compatible (fields are optional) |
| **Dashboard data loading** | `dashboard/page.tsx` gains 2 new `Promise.allSettled` fetches for balance/wins | Low — uses allSettled, failure = empty state |
| **Authentication / Auth Store** | No change to auth-store.ts | None |
| **Household Ops store** | No change | None |
| **Static export (GitHub Pages)** | All new pages must use `"use client"` + no server-side data; no `generateStaticParams` needed for non-dynamic routes | Low — consistent with existing pattern |
| **PWA service worker** | `use-sw-update.ts` adds a `controllerchange` listener — no change to `sw.js` itself | Low |
| **Mock mode** | New pages and stores need mock data guards identical to existing `isMockMode` pattern | Low — well-established pattern |

### State transitions introduced
- `chat-store.ts` gains `loadHistory(agentType)` — called once per agent chat page mount; idempotent.
- `MemoryHydrator` runs once on app root load — writes to IndexedDB, no render blocking.
- `CelebrationOverlay` triggers on task/goal completion state transitions — ephemeral, no persistence.

### Regression risk summary
- **High risk area:** `chat-store.ts` — removing Zustand `persist` middleware and replacing with IndexedDB will clear existing chat history on first deploy. **Mitigation:** Add a one-time migration in `memory-store.ts` that reads from `dad-alpha-chat` localStorage key and imports messages into IndexedDB on first open.
- **Medium risk:** `api-contracts.ts` additions — must stay backward-compatible; new fields are all optional. Adding `isUpgradeRequired` to `ApiError` is additive.
- **Low risk:** All new pages are isolated routes with no impact on existing pages.

---

## 4. Implementation Phases

### Phase 1: Foundation — Memory System + Chat Upgrade (~3 days)

**Purpose:** This phase unlocks every subsequent feature. Agents become smarter (they remember family context), chats persist properly across sessions, and the API contract is fully synced.

**Tasks:**
1. `src/types/api-contracts.ts` — Add: `MemoryContextItem`, `ChatHistoryItem`, `memory_hints` on `ChatResponse`, `memory_context` + `chat_history` on `ChatRequest`, `isUpgradeRequired` on `ApiError`. Add all new feature types (balance, goals, wins, village, caregiver, emergency, templates, seasonal, referral, share, voice briefing).
2. `src/lib/api-client.ts` — Add `isUpgradeRequired` to `ApiError`. Add missing endpoint methods: `balance.get()`, `wins.get()`, `goals.list/create/update`, `tasks.list`, `village.*`, `caregiver.*`, `emergency.*`, `templates.*`, `seasonal.*`, `referral.*`, `share.*`, `voiceBrief.get()`, `sharedInbox.*`, `promotions.validate()`. Keep `parent_brand: "dad"` on all auth calls.
3. `src/lib/memory-store.ts` — Copy from Mom.AI, rename `DB_NAME → "dad-alpha-memory"`. IndexedDB stores: `memory_items`, `chat_history`, `inbox`.
4. `src/lib/memory-extract.ts` — Copy from Mom.AI verbatim. Generic regex extraction, no brand dependencies.
5. `src/hooks/use-memory.ts` — Copy from Mom.AI verbatim.
6. `src/stores/chat-store.ts` — Replace Zustand `persist` with IndexedDB. Add `loadHistory()`. Inject `memory_context` + `chat_history` into `api.chat.send()`. Call `processAgentResponse()` after each agent reply. Handle `is_tier_error`. Keep full `isMockMode` mock path.
7. `src/components/shared/MemoryHydrator.tsx` — Copy from Mom.AI. Add to `src/app/(app)/layout.tsx`.
8. Also sync `mom-alpha/src/types/api-contracts.ts` and `mom-alpha/src/lib/api-client.ts` — per CLAUDE.md rule to keep both in sync. (Apply identical contract additions.)

**Dependencies:** None — this phase is foundational.

**Success criteria:**
- `npm run test` still passes (44 tests)
- TypeScript: `npx tsc --noEmit` zero errors
- Mock mode: chat still works, mock responses fire correctly
- Production mode: `api.chat.send()` includes `memory_context` and `chat_history` fields
- IndexedDB: chat history survives page refresh in browser devtools

---

### Phase 2: UX Quality Layer (~3 days)

**Purpose:** Bring Dad.AI UX to parity with Mom.AI — celebration system, voice briefing, PWA polish, notifications, quick capture.

**Tasks:**
1. `src/hooks/use-voice-briefing.ts` — Copy from Mom.AI. Web Speech Synthesis hook.
2. `src/hooks/use-sw-update.ts` — Copy from Mom.AI. Listens for service worker `controllerchange` events.
3. `src/components/shared/UpdateBanner.tsx` — Copy from Mom.AI, apply dad CSS tokens.
4. `src/components/shared/Confetti.tsx` — Copy verbatim.
5. `src/components/shared/CelebrationOverlay.tsx` — Copy, apply `dad-gradient-hero` + dad tokens.
6. `src/components/shared/CelebrationToast.tsx` — Copy, apply dad tokens.
7. `src/components/dashboard/VoiceBriefing.tsx` — Copy from Mom.AI, apply dad tokens. Add to `dashboard/page.tsx`.
8. `src/app/(app)/notifications/page.tsx` — New page. Calls `api.notifications.list()`. Renders `NotificationItem[]` with read/unread state. Fixes MED-01 (previously bell icon linked to /settings).
9. Update `dashboard/page.tsx` — Restore bell `notifications` icon (now correctly links to `/notifications`). Add `VoiceBriefing` card. Add `WinsTeaser` and `BalanceTeaser` stubs (will be wired in Phase 3).
10. `src/components/shared/QuickCapture.tsx` — Copy from Mom.AI, apply dad tokens. Add FAB trigger to bottom nav area.
11. `src/hooks/use-push-notifications.ts` — Copy from Mom.AI (calls `api.notifications.subscribePush()`).

**Dependencies:** Phase 1 (IndexedDB memory store, updated api-client.ts).

**Success criteria:**
- Bell icon on dashboard routes to `/notifications` with real notification list
- Voice briefing play/pause renders in dashboard
- `UpdateBanner` appears when service worker updates (manually trigger in browser)
- Confetti/celebration overlay fires on mock task completion trigger
- `npm run test` passes + TypeScript clean

---

### Phase 3: Co-Parent & Family Coordination (~4 days)

**Purpose:** Core differentiated value — the features that make Dad.AI a real co-parenting tool.

**Tasks:**
1. `src/stores/balance-store.ts` — Zustand store calling `api.balance.get(householdId)`. State: `weeklyBalance`, `categoryBreakdown`, `trend`.
2. `src/app/(app)/balance/page.tsx` — Copy from Mom.AI `/balance` page. Displays weekly task split between parents (who handled what, percentage). Apply dad CSS tokens.
3. `src/stores/wins-store.ts` — Calls `api.wins.get(householdId)`. State: `weeklyWins`, `topAgent`, `streakDays`.
4. `src/app/(app)/wins/page.tsx` — Copy from Mom.AI `/wins` page. Shows weekly accomplishment summary with share button. Celebratory UI. Apply dad tokens.
5. `src/components/dashboard/WinsTeaser.tsx` — Copy from Mom.AI, apply dad tokens. Wire into `dashboard/page.tsx`.
6. `src/components/dashboard/BalanceTeaser.tsx` — Copy from Mom.AI, apply dad tokens. Wire into `dashboard/page.tsx`.
7. `src/stores/goals-store.ts` — Calls `api.goals.list/create/update`. State: `goals[]`, `isLoading`.
8. `src/app/(app)/goals/page.tsx` — Copy from Mom.AI `/goals` page. Gamified goal cards with progress bars. Celebration trigger on completion. Apply dad tokens.
9. `src/app/(app)/emergency/page.tsx` — Copy from Mom.AI `/emergency` page. "I'm sick/traveling" emergency mode. Duration selector, message to partner, task delegation list. Wire to `api.emergency.*`. Apply dad tokens.
10. `src/app/(app)/memory/page.tsx` — New page. Reads from `memory-store.ts` IndexedDB. Lists `MemoryItem[]` with search, category filter, pin toggle. Add item form. Apply dad tokens.
11. Update `BottomNav.tsx` — Review adding `/balance` or `/memory` as a nav shortcut (may replace one existing item or add a 6th). Coordinate with product decision.

**Dependencies:** Phase 1 (memory-store, api-client sync), Phase 2 (celebration system).

**Success criteria:**
- `/balance` shows realistic co-parent task split (mock data in mock mode)
- `/wins` renders weekly summary + share button fires Web Share API
- `/goals` creates a goal and shows progress bar updating
- `/emergency` activates and shows delegated tasks list
- `/memory` lists captured facts, allows add/pin/delete
- Dashboard shows WinsTeaser and BalanceTeaser cards

---

### Phase 4: Pro Features & Growth (~3 days)

**Purpose:** Features that justify the Family Pro tier and drive virality.

**Tasks:**
1. `src/stores/tasks-store.ts` + `src/app/(app)/tasks/page.tsx` — Full task list page. Calls `api.tasks.list()`. Task assignment, completion tracking, celebration on complete.
2. `src/stores/calendar-store.ts` + `src/app/(app)/calendar/page.tsx` — Calendar view (week/month toggle). Calls `api.calendar.list()`. Event creation shortcut. Apply dad tokens.
3. `src/app/(app)/analytics/page.tsx` — Family Pro gating. Calls `api.analytics.dashboard()`. Agent usage chart, spending trend, schedule density. (API method already in api-client.ts.)
4. `src/hooks/use-share.ts` — Copy from Mom.AI. Web Share API integration.
5. `src/components/shared/ShareButton.tsx` — Copy from Mom.AI, apply dad tokens.
6. `src/stores/referral-store.ts` + `src/app/(app)/referral/page.tsx` — Referral code display, copy-to-clipboard, track referred friends. Calls `api.referral.get()`.
7. `src/components/dashboard/ReferralBanner.tsx` — Copy from Mom.AI, apply dad tokens. Conditionally shown when user has no referrals yet.
8. Update `dad-agents.ts` + `mock-chat-responses.ts` — Add mock responses for `tutor_finder`, `health_hub`, `sleep_tracker`, `self_care_reminder` agents (they exist on backend but have no Dad.AI mock responses yet).

**Dependencies:** Phase 1 (api-client sync), Phase 3 (celebration system ready).

**Success criteria:**
- `/tasks` lists tasks + completion triggers celebration toast
- `/calendar` renders week view with events from API
- `/analytics` renders behind Family Pro gate (PremiumGate component)
- `/referral` displays referral code + copy button works
- All 8 agent types have mock responses (run `npm run test`)

---

### Phase 5: Extended Family & Community (~3 days)

**Purpose:** Caregiver delegation, seasonal content, community features. Lower urgency but high stickiness once households are established.

**Tasks:**
1. `src/app/(app)/caregivers/page.tsx` — Copy from Mom.AI. Invite babysitters/grandparents with permission scopes (calendar, emergency, allergies, routines). Calls `api.caregiver.*`.
2. `src/app/(app)/caregiver-view/page.tsx` — Restricted dashboard view for non-parent household members. Shows today's schedule + emergency contacts only.
3. `src/stores/templates-store.ts` + `src/app/(app)/templates/page.tsx` — Browse + save family templates (routines, meal plans, chore charts). Community-contributed.
4. `src/app/(app)/seasonal/page.tsx` — Copy from Mom.AI. Seasonal packs with timely checklists. `api.seasonal.*`.
5. `src/stores/village-store.ts` + `src/app/(app)/village/page.tsx` — Community feed, re-labeled "Dad Community" with dad-specific categories: `parenting_hacks`, `gear_reviews`, `sports_tips`, `work_life`, `wins`, `questions`. Reactions (fist-bump instead of heart?). Post/comment/react.
6. Update `BottomNav.tsx` — Final nav structure review: Home, Agents, Community (/village), Checklists or Memory, Settings. Coordinate with design.

**Dependencies:** All previous phases for API client completeness.

**Success criteria:**
- Caregiver invite flow works end-to-end in production mode
- `/village` feed loads with category filtering
- `/seasonal` shows active seasonal packs
- `/templates` lists templates with save functionality

---

## 5. Testing Strategy

### Unit tests required per phase

| Phase | Test File | What to test |
|---|---|---|
| 1 | `src/lib/memory-store.test.ts` | IndexedDB open/write/read/clear for all three stores (`memory_items`, `chat_history`, `inbox`) |
| 1 | `src/lib/memory-extract.test.ts` | `extractInsights()` regex patterns against sample agent responses |
| 1 | `src/stores/chat-store.test.ts` | `sendMessage` includes `memory_context`; `loadHistory` hydrates correctly; mock mode still fires |
| 2 | `src/app/(app)/notifications/notifications.test.ts` | Page renders notification list; unread count badge; mark-read interaction |
| 3 | `src/stores/balance-store.test.ts` | Balance fetch, mock fallback, category breakdown calculation |
| 3 | `src/stores/goals-store.test.ts` | Goal creation, progress update, completion flag |
| 4 | `src/lib/mock-chat-responses.test.ts` | Extend existing test: all 8 agent types return valid responses (currently only 4 are tested) |
| 4 | `src/config/dad-agents.test.ts` | Update `DAD_MVP_AGENT_TYPES` test if agent roster expands |
| All | `src/lib/mock-chat-responses.test.ts` | `KNOWN_FALLTHROUGH_ACTIONS` set updated as new quick actions are added |

### E2E tests required (Playwright)

| Phase | Test File | Scenario |
|---|---|---|
| 1 | `e2e/chat-memory.spec.ts` | Chat history persists across page refresh; second chat to same agent shows history |
| 2 | `e2e/notifications.spec.ts` | Bell icon routes to /notifications; notification list renders; mark-read interaction |
| 3 | `e2e/balance.spec.ts` | /balance renders task split with mock data |
| 3 | `e2e/goals.spec.ts` | Create goal → progress bar updates → completion triggers celebration |
| 4 | `e2e/analytics.spec.ts` | /analytics shows PremiumGate for trial tier; shows content for family_pro |

### Existing tests that must be updated

| File | Reason for update |
|---|---|
| `src/lib/mock-chat-responses.test.ts` | `KNOWN_FALLTHROUGH_ACTIONS` list may grow as new mock responses are added in Phase 4 |
| `src/config/dad-agents.test.ts` | If MVP agent roster expands to 8 agents, update `DAD_MVP_AGENT_TYPES` length assertion |
| `e2e/dashboard.spec.ts` (if it exists) | Dashboard now has more sections; snapshot/selector tests may need updating |

---

## 6. Open Questions / Risks

### Critical Decisions Before Phase 1

**Q1: Chat history migration strategy**
Dad.AI currently persists chat in localStorage (`dad-alpha-chat` Zustand key). Phase 1 replaces this with IndexedDB. Existing users will lose their chat history on first load after deployment.
- **Option A:** Accept the break — message history is soft-delete anyway (users can regenerate via chat).
- **Option B:** Add a one-time migration in `memory-store.ts` that reads from `dad-alpha-chat` localStorage and imports into IndexedDB on first open. Cleaner but ~20 lines of migration code.
- **Recommendation:** Option B. Migration is low-effort and prevents a "why did my history disappear?" moment.

**Q2: Bottom nav structure**
Currently: Home, Agents, Lists, Expenses, Settings (5 items). Phases 3-5 add: /balance, /memory, /wins, /notifications, /community. Can't fit all in 5-item bottom nav.
- **Option A:** Keep nav as-is; new pages accessible from dashboard cards or settings menu only.
- **Option B:** Replace "Lists" with "Community" (/village) and surface /memory from a FAB (QuickCapture button).
- **Option C:** Add a 6th nav item with a "More" overflow menu (non-standard, avoid).
- **Recommendation:** Decide before Phase 3. Option A is safest for MVP, Option B is the mom-parity path.

**Q3: Village/Community branding for dads**
The Mom.AI village uses mom-centric categories (meal ideas, school hacks, activities, vents). Dad.AI should adapt this. Proposed categories: `parenting_hacks`, `gear_reviews`, `sports_tips`, `work_life_balance`, `wins`, `questions`. The `category` values sent to the backend may need new enum values if they differ from Mom.AI.
- **Risk:** Backend `village_router.py` may have hardcoded category validation. Confirm backend is flexible before Phase 5.

**Q4: Agent roster expansion**
Mom.AI has 8 agents (`tutor_finder`, `health_hub`, `sleep_tracker`, `self_care_reminder` in addition to the 4 Dad.AI MVP agents). Phase 4 adds mock responses for these. Should Dad.AI also show these in the Agents page, or gate them behind a later rollout?
- **Recommendation:** Add mock responses in Phase 4 but keep them hidden from the `/agents` roster until explicitly launched. Use a `visible: false` flag in `dad-agents.ts` config to avoid a code branch.

### Architecture Risks

| Risk | Severity | Mitigation |
|---|---|---|
| `chat-store.ts` rewrite breaks existing chat UX | High | Comprehensive E2E test before deploying; add migration path for localStorage history |
| `api-contracts.ts` drift between Dad.AI and Mom.AI | Medium | CLAUDE.md already mandates keeping both in sync. Phase 1 must touch both files simultaneously. |
| IndexedDB unavailable in some environments (private browsing, storage quota) | Low | `memory-store.ts` from Mom.AI already handles `openDB` failures gracefully; chat falls back to API-only mode |
| Backend family_platform endpoints not all deployed on household-alpha-api | Medium | Verify `/api/balance`, `/api/wins`, `/api/goals`, `/api/emergency` are live before Phase 3. Use `isMockMode` guard in each store until confirmed. |
| Static export + IndexedDB | None | IndexedDB is client-side only; compatible with `output: "export"` |

### Assumptions

1. All `family_platform/` routers listed in Section 1 are deployed and functional on `household-alpha-api` (Render).
2. Mom.AI CSS token system and Dad.AI CSS token system are different (`--mom-*` vs `--dad-*` custom properties or `steady-strong` theme class). Components copied from Mom.AI require token substitution before use.
3. The `parent_brand: "dad"` injection in `api-client.ts` auth calls must never be removed during this work.
4. The existing 44 unit tests must continue passing after every phase before merge.

---

## Effort Summary

| Phase | Description | Estimated Effort |
|---|---|---|
| 1 | Foundation: Memory system + Chat upgrade + Contract sync | ~3 days |
| 2 | UX Quality: Voice briefing, celebrations, notifications, quick capture | ~3 days |
| 3 | Co-parent & coordination: Balance, wins, goals, emergency, memory page | ~4 days |
| 4 | Pro features & growth: Tasks, calendar, analytics, referral, agent expansion | ~3 days |
| 5 | Extended family & community: Caregivers, templates, seasonal, village | ~3 days |
| **Total** | | **~16 days** |

Phases are sequenced by dependency (1 → 2 → 3 → 4 → 5). Phases 4 and 5 are independent of each other and can be parallelized by two contributors.
