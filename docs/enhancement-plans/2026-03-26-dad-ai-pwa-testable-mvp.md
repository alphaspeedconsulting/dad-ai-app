# Enhancement Plan: Dad.AI PWA — Testable MVP

**Created:** 2026-03-26
**Status:** Complete
**Author:** Claude
**Related Files:**
- Source PRD: `/Users/miguelfranco/Development_agents/projects/dad-ai/prd.md`
- Shared backend plan: `cowork_plugin/docs/enhancement-plans/2026-03-26-shared-household-backend-mom-dad-ai.md`
- Auth/PWA stability plan: `cowork_plugin/docs/enhancement-plans/2026-03-25-local-auth-pwa-stability-and-google-oauth-plan.md`
- Reference app (Mom.AI): `/Users/miguelfranco/Mom.Ai App/mom-ai-app/mom-alpha`
- Dad.AI architecture: `/Users/miguelfranco/Development_agents/projects/dad-ai/architecture-analysis.md`

---

## Context & Strategy

**Goal:** Build a testable Dad.AI PWA that a user can install, sign up, log in, see a personalized dashboard, and interact with core dad-specific features (sync digest, weekly plan, calendar alignment, checklists, expenses). The backend is shared with Mom.AI — both frontends hit the same FastAPI API.

**Key architectural decision:** Fork the Mom.AI frontend (`mom-alpha`) as a starting scaffold, then rebrand and reshape for Dad.AI's persona and feature set. The backend is shared — **no new backend repo**. Dad.AI connects to the same FastAPI server that Mom.AI uses.

**Why fork Mom.AI instead of starting from scratch:**
- Mom.AI already has working auth (JWT + Zustand persist), PWA setup (manifest, service worker, offline store), API client, dashboard shell, agent chat, and Tailwind styling
- ~70% of the frontend infrastructure is identical (auth flow, API client, stores, PWA shell, bottom nav, error boundaries)
- Divergence is in: branding/colors, agent roster (4 dad-focused vs 8 mom-focused), dashboard layout, and default notification preferences

---

## 1. Enhancement Breakdown

### 1A — Project Scaffolding (Fork & Rebrand)

**What changes:** Create the Dad.AI Next.js app by forking Mom.AI's `mom-alpha/` structure into this repo as `dad-alpha/`. Rebrand: colors, app name, PWA manifest, icons, landing copy.

**Affected:**
- `dad-alpha/public/manifest.json` — new name, theme color, icons
- `dad-alpha/src/app/layout.tsx` — root metadata, brand name
- `dad-alpha/src/styles/` — Dad.AI color palette (replace Mom.AI teal `#32695a`)
- `dad-alpha/src/components/landing/` — dad-persona marketing copy
- `dad-alpha/public/icons/` — dad-branded icons (placeholder SVGs for testability)

### 1B — Auth & Household Integration

**What changes:** Auth flow connects to the **same shared backend** as Mom.AI. On signup, the user gets a `parent_brand: "dad"` designation. Household linking (invite/join) uses the shared household membership API from the backend plan.

**Affected:**
- `dad-alpha/src/stores/auth-store.ts` — localStorage key `"dad-alpha-auth"` (distinct from mom)
- `dad-alpha/src/lib/api-client.ts` — same API base URL, same contract types
- `dad-alpha/src/types/api-contracts.ts` — add `parent_brand` field to `User` type
- `dad-alpha/src/app/(app)/onboarding/` — dad-specific onboarding flow (household create or join)

### 1C — Dad-Specific Dashboard

**What changes:** Replace Mom.AI's 8-agent dashboard with a Dad.AI dashboard focused on 5 core features (from PRD FR-1 through FR-5):

1. **Partner Sync Digest** (FR-3) — card showing latest digest from co-parent
2. **Weekly Plan** (FR-2) — upcoming week's family activities
3. **Calendar Alignment** — conflict detection between parent calendars
4. **Quick Actions** — generate checklist (FR-5), track expense
5. **Activity Feed** — recent household events

**Affected:**
- `dad-alpha/src/app/(app)/dashboard/page.tsx` — new layout
- `dad-alpha/src/components/dashboard/` — new: `SyncDigestCard`, `WeeklyPlanCard`, `CalendarConflictsCard`, `QuickActionsBar`, `ActivityFeed`
- `dad-alpha/src/stores/dashboard-store.ts` — new Zustand store for dashboard state

### 1D — Agent Pages (Dad's 4 MVP Agents)

**What changes:** Dad.AI surfaces 4 agents (subset of the 8 from Mom.AI, dad-branded):

| Agent ID | Name (Dad brand) | Source |
|----------|------------------|--------|
| `calendar_whiz` | Schedule Sync | Shared |
| `school_event_hub` | School Hub | Shared |
| `budget_buddy` | Expense Tracker | Shared |
| `grocery_guru` | Grocery Planner | Shared |

Each agent page routes to the same chat interface (`/chat/[agent]`) with dad-specific system prompts and UI copy.

**Affected:**
- `dad-alpha/src/app/(app)/agents/page.tsx` — 4 agent cards instead of 8
- `dad-alpha/src/app/(app)/chat/[agent]/page.tsx` — reuse Mom.AI's `AgentChatClient`, adjust system prompt
- `dad-alpha/src/stores/agents-store.ts` — filter to dad's 4 agents
- `dad-alpha/src/lib/mock-data.ts` — dad-branded mock agent responses for offline testing

### 1E — Checklist & Expense Features (FR-5, FR-6)

**What changes:** Two new feature pages unique to Dad.AI's emphasis:

1. **Checklists** (`/checklists`) — generate gear/packing lists for activities. Calls `generate_checklist` backend endpoint.
2. **Expenses** (`/expenses`) — track recurring family expenses. Calls `track_expense` / `get_expenses` backend endpoints.

**Affected:**
- `dad-alpha/src/app/(app)/checklists/page.tsx` — new page
- `dad-alpha/src/app/(app)/expenses/page.tsx` — new page
- `dad-alpha/src/stores/checklists-store.ts` — new Zustand store
- `dad-alpha/src/stores/expenses-store.ts` — new Zustand store
- `dad-alpha/src/types/api-contracts.ts` — add `Checklist` and `Expense` types

### 1F — Notification Settings (FR-10 / UX-2)

**What changes:** Per-parent notification preferences page. Calls `set_notification_prefs` backend endpoint.

**Affected:**
- `dad-alpha/src/app/(app)/settings/notifications/page.tsx` — new page
- `dad-alpha/src/stores/settings-store.ts` — extend with notification prefs

### 1G — PWA & Offline Capabilities

**What changes:** Fork Mom.AI's PWA setup with dad branding. Service worker, offline store, install banner all carry over with minimal changes.

**Affected:**
- `dad-alpha/public/manifest.json` — dad name, colors, icons
- `dad-alpha/public/sw.js` — same logic, dad cache name
- `dad-alpha/public/sw-push.js` — same logic
- `dad-alpha/src/components/shared/InstallBanner.tsx` — dad copy
- `dad-alpha/src/components/shared/OfflineBanner.tsx` — reuse as-is

---

## 2. Reuse vs New Code Analysis

### Reuse As-Is (from Mom.AI)
| Component | Why |
|-----------|-----|
| `api-client.ts` | Same backend, same auth contract, same fetch wrapper |
| `auth-store.ts` | Same JWT + Zustand persist pattern (change storage key only) |
| `AgentChatClient` component | Same chat UI, same WebSocket contract |
| `ErrorBoundary`, `OfflineBanner`, `SyncStatus` | Generic shared components |
| `offline-store.ts` | Same IndexedDB offline queue pattern |
| `sw.js` / `sw-push.js` | Same service worker logic |
| `api-contracts.ts` | Same type definitions (extend, don't fork) |
| Backend (entire) | Shared — no backend changes in this plan |

### Extend (Modify from Mom.AI)
| Component | Change | Justification |
|-----------|--------|---------------|
| `manifest.json` | New name, theme color, icon paths | Brand differentiation |
| `layout.tsx` | New metadata, color tokens | Root-level branding |
| `BottomNav` | 5 tabs (Home, Agents, Checklists, Expenses, Settings) vs Mom's 5 tabs | Different feature emphasis |
| `agents-store.ts` | Filter to 4 agents, dad-branded names | Subset of shared agent pool |
| `mock-data.ts` | Dad-persona mock responses | Testability without live backend |
| Landing page components | Dad-persona copy, value props | Different target audience |

### Net-New Code
| Component | Why Existing Patterns Can't Cover |
|-----------|-----------------------------------|
| `SyncDigestCard` | Dad.AI-specific dashboard widget — no equivalent in Mom.AI |
| `WeeklyPlanCard` | Dad.AI-specific dashboard layout |
| `CalendarConflictsCard` | Dad.AI-specific — Mom.AI doesn't surface calendar conflicts on dashboard |
| `QuickActionsBar` | Dad's dashboard emphasizes quick actions (checklist, expense) — different UX pattern |
| Checklists page + store | New feature page — Mom.AI has no equivalent standalone checklist UI |
| Expenses page + store | New feature page — Mom.AI budget view is agent-embedded, not standalone |
| `dashboard-store.ts` | Dad's dashboard aggregates different data sources than Mom's |

---

## 3. Workflow Impact Analysis

### Existing Workflows Affected

| Workflow | Impact | Regression Risk |
|----------|--------|----------------|
| Backend auth flow | None — Dad.AI uses same endpoints, adds `parent_brand` field | **Low** — additive field |
| Backend household APIs | None — Dad.AI is a consumer of existing APIs | **Low** |
| Mom.AI frontend | None — separate repo, separate deployment | **None** |

### State Transitions Introduced

1. **Onboarding:** `landing` → `signup` → `onboarding` (household create/join) → `dashboard`
2. **Household linking:** `solo_parent` → `invite_sent` → `household_linked` (co-parent joined)

### Side Effects
- Two PWAs sharing one backend means both parents could be logged in simultaneously — backend must handle concurrent reads/writes (already designed for this in shared backend plan)
- `parent_brand` field in user profile drives which frontend was used for signup — informational only, no access control difference

---

## 4. Implementation Phases

### Phase 1: Scaffold & Rebrand (~1 day)

**Tasks:**
1. Copy Mom.AI `mom-alpha/` structure into `dad-alpha/` in this repo
2. Update `package.json` — name to `dad-alpha`, same dependencies
3. Replace color palette: Mom teal (`#32695a`) → Dad blue (e.g., `#2563eb` / blue-600)
4. Update `manifest.json` — name "Dad.AI", `theme_color`, `background_color`
5. Create placeholder app icons (192x192, 512x512) — simple "D" lettermark
6. Update `layout.tsx` root metadata — title, description, OG tags
7. Change auth store localStorage key to `"dad-alpha-auth"`
8. Verify `npm install && npm run dev` starts cleanly

**Dependencies:** Mom.AI source code accessible

**Success Criteria:**
- `npm run dev` starts without errors
- App loads at `localhost:3000` with Dad.AI branding
- Login page renders with dad color scheme
- PWA manifest serves correct dad metadata

### Phase 2: Auth & Onboarding (~1 day)

**Tasks:**
1. Configure `NEXT_PUBLIC_API_URL` to point at shared backend (default `http://localhost:8000`)
2. Update signup flow to include `parent_brand: "dad"` in registration payload
3. Build dad-specific onboarding page: household create (new family) or join (enter invite code)
4. Add mock auth mode for testing without live backend (`NEXT_PUBLIC_MOCK_MODE=true`)
5. Test: signup → auto-provision household → redirect to dashboard

**Dependencies:** Phase 1 scaffold complete; shared backend running (or mock mode)

**Success Criteria:**
- New user can sign up with email/password
- User is prompted to create or join a household
- After onboarding, user lands on dashboard
- Mock mode works fully offline for testing

### Phase 3: Dashboard & Core Cards (~2 days)

**Tasks:**
1. Create `dashboard-store.ts` — Zustand store aggregating sync digest, weekly plan, calendar conflicts
2. Build `SyncDigestCard` — displays latest partner sync summary (calls `GET /api/household/sync-digest`)
3. Build `WeeklyPlanCard` — displays upcoming week's activities (calls `GET /api/household/weekly-plan`)
4. Build `CalendarConflictsCard` — shows detected scheduling conflicts (calls `GET /api/household/calendar-align`)
5. Build `QuickActionsBar` — "New Checklist" and "Track Expense" buttons
6. Build `ActivityFeed` — recent household events list
7. Compose dashboard page from these 5 components
8. Add mock data for all dashboard cards (for testing without backend)
9. Style with Tailwind — mobile-first, card-based layout

**Dependencies:** Phase 2 auth works (or mock mode)

**Success Criteria:**
- Dashboard renders 5 distinct sections
- Each card shows mock data in mock mode
- Each card fetches from correct API endpoint when backend is live
- Mobile viewport looks clean (375px width)
- Loading and empty states handled gracefully

### Phase 4: Agent Pages & Chat (~1 day)

**Tasks:**
1. Configure 4 dad-branded agents in agents store (calendar_whiz, school_event_hub, budget_buddy, grocery_guru)
2. Create agents grid page with 4 cards
3. Reuse `AgentChatClient` component for `/chat/[agent]` route
4. Add dad-persona system prompt prefixes for each agent
5. Add mock chat responses for testing without backend
6. Update `BottomNav` — Home, Agents, Checklists, Expenses, Settings

**Dependencies:** Phase 1 scaffold (chat component exists from fork)

**Success Criteria:**
- Agents page shows 4 cards with dad branding
- Tapping agent opens chat interface
- Chat sends messages to correct backend endpoint
- Mock mode returns plausible dad-context responses
- Bottom nav navigates correctly between all 5 sections

### Phase 5: Checklists & Expenses Pages (~1.5 days)

**Tasks:**
1. Define `Checklist` and `Expense` TypeScript types in `api-contracts.ts`
2. Build `checklists-store.ts` — CRUD for checklists (calls `POST /api/household/checklist`, `GET /api/household/checklists`)
3. Build Checklists page — list view with "Generate Checklist" action (activity type input → AI-generated list)
4. Build `expenses-store.ts` — CRUD for expenses (calls `POST /api/household/expense`, `GET /api/household/expenses`)
5. Build Expenses page — list view with "Track Expense" form and monthly summary
6. Add mock data for both features
7. Mobile-optimized forms and lists

**Dependencies:** Phase 1 scaffold, Phase 2 auth

**Success Criteria:**
- User can generate a checklist by entering an activity name
- Checklist items render as checkable list
- User can add an expense with amount, category, and recurrence
- Expenses page shows monthly total and category breakdown
- Both work in mock mode

### Phase 6: Settings, Notifications & Polish (~1 day)

**Tasks:**
1. Build notification preferences page (quiet hours, digest frequency, school alerts toggle)
2. Build profile page (name, household info, linked co-parent status)
3. Add settings navigation (Profile, Notifications, About)
4. Polish: consistent loading spinners, error states, empty states across all pages
5. Final PWA check: installable, offline shell loads, service worker caches static assets
6. Add `NEXT_PUBLIC_BETA_MODE=true` banner for testing builds

**Dependencies:** Phases 1-5

**Success Criteria:**
- Notification settings save and persist
- Profile shows household membership and co-parent link status
- App is installable as PWA on mobile Safari / Chrome
- Offline: app shell loads, shows offline banner, queues actions
- No console errors on any page

### Phase 7: Local Testing Harness (~0.5 days)

**Tasks:**
1. Create `scripts/dev-setup.sh` — installs deps, creates `.env.local` from template
2. Create `.env.local.example` with all required env vars documented
3. Create `scripts/mock-backend.sh` — starts a minimal mock API server (or document mock mode flag)
4. Write `README.md` with quickstart: clone → install → run → test
5. Add smoke test script: `scripts/smoke-test.sh` — curls key pages, checks 200 status

**Dependencies:** All prior phases

**Success Criteria:**
- New developer can clone repo and have app running in < 5 minutes
- Mock mode provides complete offline testing experience
- Smoke test passes on fresh setup

---

## 5. Testing Strategy

### Unit Tests Required

| Test File | Tests | Phase |
|-----------|-------|-------|
| `__tests__/stores/auth-store.test.ts` | Login, signup, token persist, logout, household resolution | 2 |
| `__tests__/stores/dashboard-store.test.ts` | Fetch digest, weekly plan, conflicts; loading/error states | 3 |
| `__tests__/stores/checklists-store.test.ts` | Create, list, toggle item, delete checklist | 5 |
| `__tests__/stores/expenses-store.test.ts` | Add expense, list, monthly summary calculation | 5 |
| `__tests__/components/SyncDigestCard.test.tsx` | Renders digest data, handles empty state, handles loading | 3 |
| `__tests__/components/WeeklyPlanCard.test.tsx` | Renders plan items, handles empty week | 3 |
| `__tests__/components/QuickActionsBar.test.tsx` | Button clicks trigger correct store actions | 3 |

### E2E Tests Required

| Scenario | Description | Phase |
|----------|-------------|-------|
| Full signup flow | Landing → signup → onboarding → dashboard with populated cards | 2, 3 |
| Agent chat round-trip | Agents → select agent → send message → receive response | 4 |
| Checklist generation | Dashboard quick action → enter activity → see generated list | 5 |
| Expense tracking | Expenses → add expense → see in list and summary | 5 |
| PWA install | Open in Chrome → install prompt → opens as standalone | 6 |
| Offline resilience | Kill network → app shell loads → shows offline banner → restore → syncs | 6 |

### Existing Tests to Update
- None — this is a new repo. All tests are net-new.

---

## 6. Open Questions / Risks

### Assumptions
1. **Shared backend is running or mock mode suffices.** The shared backend (from the household backend plan) may not be implemented yet. Mock mode must be comprehensive enough to test all Dad.AI features without it.
2. **Mom.AI's frontend is stable enough to fork.** The auth/PWA stability plan (2026-03-25) should land before or alongside this work.
3. **4 agents are a subset of the shared 8.** No dad-exclusive agents in MVP — all 4 exist in the shared backend.
4. **Same backend, same deployment.** Both PWAs point to one FastAPI instance. No BFF (backend-for-frontend) layer needed for MVP.

### Unknowns
1. **Color palette / brand identity:** No Dad.AI brand guide exists yet. Plan uses blue as placeholder — needs design input.
2. **Landing page copy:** Dad persona marketing copy needs product/marketing input. Placeholder in Phase 1.
3. **Push notification VAPID keys:** Shared with Mom.AI or separate? Affects `sw-push.js` config.
4. **Deployment target:** Local testing only for now? Or also Vercel/Render preview? Affects Phase 7 scope.

### Architectural Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Mom.AI fork divergence** | Medium — shared components drift apart over time | Extract shared code into a `packages/shared` workspace or npm package in Phase 2+. For MVP, accept copy. |
| **Backend not ready** | High — dashboard cards and features can't be tested end-to-end | Comprehensive mock mode (Phase 2 task 4) ensures all UI is testable without backend. |
| **Two PWAs, one service worker scope** | Low — only relevant if deployed on same domain | Different domains or subdomains for each PWA. Local dev uses different ports. |
| **Mock mode masking real integration issues** | Medium — tests pass in mock but fail against real backend | Phase 7 smoke test should work in both mock and live modes. Integration tests run against live backend in CI. |

---

## Estimated Total Effort

| Phase | Description | Days | Cumulative |
|-------|-------------|------|------------|
| 1 | Scaffold & Rebrand | 1 | 1 |
| 2 | Auth & Onboarding | 1 | 2 |
| 3 | Dashboard & Core Cards | 2 | 4 |
| 4 | Agent Pages & Chat | 1 | 5 |
| 5 | Checklists & Expenses Pages | 1.5 | 6.5 |
| 6 | Settings, Notifications & Polish | 1 | 7.5 |
| 7 | Local Testing Harness | 0.5 | 8 |
| **Total** | | **~8 working days** | |

Phases 4 and 5 are independent of each other and can run in parallel (~1 day savings), potentially compressing to **~7 working days**.
