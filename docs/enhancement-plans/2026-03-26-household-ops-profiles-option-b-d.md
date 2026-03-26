# Enhancement Plan: Household Ops Profiles (Option B + D)

**Created:** 2026-03-26  
**Status:** Frontend Complete — backend phases (1 server, 2, 4) deferred to FastAPI repo
**Author:** Claude  
**Related Files:** `dad-alpha/src/config/dad-agents.ts`, `dad-alpha/src/types/api-contracts.ts`, `dad-alpha/src/lib/api-client.ts`, `dad-alpha/src/stores/household-store.ts`, `dad-alpha/src/app/(app)/dashboard/page.tsx`, `dad-alpha/src/stores/subscription-store.ts`, `dad-alpha/src/app/(app)/` layout & navigation, `dad-alpha/src/components/landing/*`, `dad-alpha/src/components/landing/landing-content.ts`, `dad-alpha/public/manifest.json` (or app manifest source), `dad-alpha/e2e/` landing & app specs, shared Mom.alpha `api-contracts` (sibling repo), FastAPI backend (sibling) — agent workflows and LangGraph graphs as applicable  

**Scope decisions (stakeholder inputs):**

| Input | Decision |
|-------|----------|
| Delivery | **All-at-once** — single coordinated release across domains (internal work may still follow dependency order). |
| Partner visibility | **Yes** — household ops data and digest entries sync to partner / co-parent view. |
| Integrations | **Google first** (Calendar as initial external system; OAuth and event write/read patterns established before other providers). |
| Cross-app contracts | **Yes** — Mom.alpha and Dad.alpha stay aligned on shared `api-contracts` / `AgentType` impacts. |
| Monetization | **Premium** — surface gated to paid tier (recommended: `family_pro` or explicit feature entitlement checked server-side). |

---

## 1. Enhancement Breakdown

### 1.1 Car maintenance + vehicle “garage”

| Item | Add / change | Affected services / agents / workflows | Why this approach |
|------|----------------|------------------------------------------|-------------------|
| **Structured vehicle profiles** | CRUD for vehicles (identifier, VIN optional, mileage, notes, service intervals). | Backend: household domain service + persistence. Frontend: new screens or sections under existing nav. **Agents:** `budget_buddy` for service/repair expenses; `calendar_whiz` for due dates and Google events. **Workflows:** reminder generation LangGraph subgraph or scheduled job emitting digest lines. | Option **D** — state lives in profiles; agents read/write without new `AgentType`. |
| **Maintenance schedule** | Per-vehicle service items (oil, tires, inspection) with next due by date or mileage. | Same service layer; optional link to expenses and calendar. | Reuses calendar + expense patterns already in product. |

### 1.2 House improvements and yard

| Item | Add / change | Affected | Why |
|------|----------------|----------|-----|
| **Home projects** | Projects with status, budget link, checklist link, optional photos metadata. | **Checklists** API already exists (`/checklists`, `generateChecklist`). Extend project entity or tie `activity_type` to home/yard. **Budget:** expenses categorized as home/yard. | Reuse **checklists** + **expenses**; avoid a new agent. |

### 1.3 Vacation planning

| Item | Add / change | Affected | Why |
|------|----------------|----------|-----|
| **Trip drafts** | Itinerary skeleton, dates, destination, packing checklist reference, estimated budget. | **calendar_whiz** for trip dates; **Google Calendar** export/import first; digest items for partner. | Trips are calendar + list + money — fits Option **B** (modes on existing agents). |

### 1.4 Smart home automation

| Item | Add / change | Affected | Why |
|------|----------------|----------|-----|
| **Automation “routines”** | Named routines with steps (time-based reminders, checklist triggers) — **not** deep IoT control in v1. | Reminder/list CRUD; optional `IntentType` extension; digest category. | Avoids brittle third-party device APIs at launch; still valuable as structured household ops. |

### 1.5 Partner Sync digest + premium gating

| Item | Add / change | Affected | Why |
|------|----------------|----------|-----|
| **Digest extension** | `SyncDigestItem.category` (or parallel field) must include household-ops sources so partner sees maintenance, trips, projects, routines. | `SyncDigestResponse`, digest generator workflow, `fetchSyncDigest` consumers, dashboard UI. | Existing Partner Sync card and `household.syncDigest` are the right integration point. |
| **Premium** | Server-side enforcement on household-ops APIs + UI upsell when `tier < family_pro` (or chosen entitlement). | Auth JWT `tier`, Stripe subscription service, settings/subscription copy. | Aligns with stakeholder “premium”; prevents silent free usage. |

### 1.6 Google (first integration)

| Item | Add / change | Affected | Why |
|------|----------------|----------|-----|
| **Google Calendar** | OAuth connect flow, store refresh token securely (backend), create/update events for maintenance due, trip blocks, optional sync read for weekly plan. | Auth service, calendar alignment endpoints, workflow steps that emit calendar events. | Stakeholder chose Google first; establishes pattern for future providers. |

### 1.7 Website updates (marketing / public site)

| Item | Add / change | Affected | Why |
|------|----------------|----------|-----|
| **Landing value prop** | Headlines, subcopy, and CTAs that include **garage & maintenance**, **home & yard**, **trips**, **routines**, and **Partner Sync** for ops — without promising unsupported IoT depth. | `src/components/landing/*`, `landing-content.ts`, hero / feature sections. | Public site must match shipped product; reduces support debt and improves conversion to **Family Pro**. |
| **Product showcase & mockups** | Update phone mockups / `PRODUCT_SHOWCASE_ITEMS` (or equivalent) to show ops-adjacent examples (e.g. oil change due, trip dates, project status) alongside existing Partner Sync. | `PhoneMockupDashboard`, `ProductShowcase`, shared `landing-content`. | Visual continuity with in-app Partner Sync story. |
| **Pricing / premium** | Clear **Family Pro** (or chosen tier) row: household ops + Google Calendar + partner digest as premium bullets; link to `/settings` or signup. | Pricing section components, Stripe CTA alignment with `subscription-store` tiers. | Aligns with stakeholder **premium** decision. |
| **Integrations story** | “Works with Google Calendar” badge or short section; OAuth disclosure in privacy/marketing copy if required. | Landing footer, optional FAQ, `docs` or legal pointers. | Sets expectations for **Google first**; supports trust. |
| **SEO & share** | Page `metadata` / Open Graph / `title` & `description` updates for new keywords; optional FAQ schema if site uses structured data. | `app/` layout or page-level `generateMetadata`. | Discoverability for “family calendar,” “co-parent,” “car maintenance,” etc. |
| **Deploy** | Same **static export** pipeline (`npm run build` → GitHub Pages); verify no broken asset paths after new sections. | `.github/workflows/deploy-pages.yml` unchanged unless build steps need env for public strings only. | No server runtime; must stay compatible with current CI. |

### 1.8 App updates (PWA / authenticated product)

| Item | Add / change | Affected | Why |
|------|----------------|----------|-----|
| **Navigation & IA** | Entry to **Household Ops** from dashboard quick actions and/or bottom nav (if space); deep link pattern for future notifications (`/household-ops?tab=garage`). | `(app)` layout, `dashboard/page.tsx`, optional route segment. | Discoverability without adding four new agents. |
| **Settings** | **Google connection** status (connected / error / disconnect), **premium upsell** for ops when tier insufficient, notification toggles for ops-related digest lines if distinct from global Partner Sync. | `settings/page.tsx`, subscription section, push copy. | Single place for account + integrations + tier. |
| **PWA shell** | Optional updates to **manifest** (`name` / `description` / `screenshots`) if store-style listing or install prompts mention new capabilities; **service worker** — avoid caching authenticated API responses; confirm offline landing still works. | `manifest`, `sw.js` or Next PWA config. | Install experience stays accurate post-release. |
| **Onboarding / empty states** | First-run hints for Household Ops after upgrade or first visit; empty states per tab (no vehicles, no trips). | New hub components, optional post-login modal (flagged). | Reduces drop-off on premium feature. |
| **Accessibility & mobile** | Touch targets, tab order for multi-section hub; contrast per design system tokens. | Shared `dad-card`, AlphaAI tokens. | `.cursorrules` / frontend quality bar. |

---

## 2. Reuse vs New Code Analysis

### 2.1 Reuse as-is (or with minimal wiring)

- **Agent roster:** Keep **four** MVP agents in `DAD_MVP_AGENT_TYPES`; extend **capabilities copy** and in-chat system prompts to describe household-ops modes (Option **B**).
- **Chat routing:** Existing `ChatRequest` / `agent_type` — no new enum values **required** if tools are household-scoped and selected by intent (backend may still extend `AgentType` for analytics — see **Extension**).
- **Checklists:** `household.generateChecklist`, `listChecklists` for packing, home tasks, trip prep.
- **Expenses / budget:** `budget_buddy` + `/api/expenses`, `/api/budget/{householdId}` for car and home costs.
- **Calendar / weekly plan:** `calendar_whiz` + `weeklyPlan`, `calendar-align` conflicts.
- **Household store:** `fetchSyncDigest`, members — extend state for new digest shape and ops summaries.
- **Subscription:** `family_pro` checkout already in `useSubscriptionStore` — use for gating.

### 2.2 Extension (shared contracts)

- **`api-contracts.ts` (Dad + Mom):**  
  - New types: `Vehicle`, `VehicleServiceItem`, `HomeProject`, `TripPlan`, `AutomationRoutine` (or single `HouseholdOps` aggregate with discriminated unions — prefer **normalized resources** for clearer API versioning).  
  - Extend `SyncDigestItem.category` with new literals **or** add `source: "household_ops"` + `ops_type` to avoid breaking existing clients (migration strategy required).  
  - Optional: extend `AgentType` only if backend analytics or usage dashboards need per-mode keys — coordinate with Mom.alpha.
- **`api-client.ts`:** New `householdOps` or nested `household` methods for CRUD + list.
- **Dashboard / settings:** Partner Sync section reads real digest (replace mock if still static); premium gate component.
- **Marketing reuse:** Extend existing landing **patterns** (`landing-content`, showcase cards, `PhoneMockup*`) rather than new standalone microsites — same Tailwind / design tokens.

### 2.3 Net-new (justified)

- **Persistence layer** for vehicles, projects, trips, routines (tables or documents — backend team choice). **Reuse** is insufficient: no existing entity covers multi-vehicle garage or trip drafts.
- **Google OAuth token lifecycle** for Calendar (secure storage, rotation, revoke). Cannot reuse email/password auth alone.
- **Digest generator logic** updates to fold household-ops events into partner-visible items (workflow change).
- **Premium middleware** on new routes if not already pattern-matched from other premium features.
- **Website:** New copy blocks, optional FAQ entries, and metadata strings — content is net-new but components are mostly **composed** from existing landing primitives.

---

## 3. Workflow Impact Analysis

| Workflow | Steps affected | State / side effects | Regression risk | Mitigation |
|----------|----------------|----------------------|-----------------|------------|
| **Partner Sync digest generation** | Adds inputs from household ops + Google-linked events | New digest line types; ordering rules | **Medium** — Mom/Dad digest consumers, caching | Contract tests on `SyncDigestResponse`; feature flag or version digest schema; fallback category `general` if unknown |
| **Chat → tools (LangGraph)** | Tool nodes may call household CRUD | Writes to new tables | **Medium** | Idempotent writes where possible; integration tests on tool contracts |
| **Google Calendar sync** | OAuth → event create/update | External API failures, partial sync | **High** | Retries with backoff; structured errors to client; never swallow exceptions (`.cursorrules`) |
| **Checkout / tier** | Existing Stripe flow unchanged | New routes check `tier` | **Low** | Reuse JWT tier claims; server-side source of truth |
| **Mom.alpha parity** | Same API calls | Drift if contracts not merged | **Medium** | Single shared contract file or codegen; CI contract diff |
| **Marketing deploy** | Landing changes ship with same repo build | Larger JS/CSS bundle; copy errors | **Low** | Lighthouse budget check; `npm run build` + preview; E2E landing spec |
| **PWA install / update** | Users on old SW may see stale shell briefly | Stale cached shell | **Low** | Follow existing SW update strategy; version `cacheName` if project pattern requires it |

**Overall regression risk:** **Medium**, driven by digest shape and Google integration.

---

## 4. Implementation Phases

Stakeholders requested a **single release**; phases below are **dependency-ordered** workstreams that can run in parallel where noted. **All phases complete** before production cutover for the “all-at-once” launch.

### Phase 1: Contracts, persistence, and premium server guardrails (5–7 days)

**Tasks**

- Design normalized schema (vehicles, service items, projects, trips, routines) + migrations; rollback plan documented.
- Implement FastAPI routes with Pydantic models (`extra='forbid'`), consistent error responses, logging without PII.
- Add `family_pro` (or feature flag) checks on all new endpoints.
- Mirror types in `dad-alpha` / `mom-alpha` `api-contracts.ts`; bump version or document breaking vs additive digest changes.
- Extend digest generator to emit new item types; **partner visibility** = same `household_id` scope as today.

**Dependencies:** None (foundation).

**Success criteria**

- ✅ Done when: CRUD works for all five conceptual areas against real DB in staging; premium returns 403 for non-eligible tier.
- ✅ Verified by: API integration tests; migration up/down smoke test.
- ✅ Risk level: Medium.

---

### Phase 2: Google Calendar integration (OAuth + event write) (5–8 days)

**Tasks**

- Google OAuth consent screen + scopes (Calendar read/write minimum for v1).
- Token storage (secret manager / encrypted columns); revoke on disconnect.
- Map maintenance due dates and trip windows to calendar events; idempotency keys to prevent duplicates.
- Structured logging and user-visible error messages on sync failure.

**Dependencies:** Phase 1 entities exist (need IDs to attach external `event_id`).

**Success criteria**

- ✅ Done when: User can connect Google and see created events on their calendar; disconnect clears tokens.
- ✅ Verified by: Integration test against Google API sandbox or recorded mocks; manual QA checklist.
- ✅ Risk level: High (external dependency).

---

### Phase 3: Frontend app + website + Household Ops hub (Option B) (9–13 days)

**Tasks — In-app (PWA)**

- New route(s) under `/(app)/` e.g. `/household-ops` or tabbed sections: Garage, Home, Trips, Routines (static-export compatible — client-only).
- Forms bound to new APIs; loading/error states; empty states.
- Wire **Schedule Sync**, **Expense Tracker**, **Checklists** entry points from each surface (modes, not new bottom-nav agents).
- Dashboard: Partner Sync uses `fetchSyncDigest` with real data; premium upsell for locked sections.
- **Navigation:** quick actions / deep links to ops tabs; **Settings:** Google connection UI + tier upsell for ops.
- **Manifest / PWA:** Update short description if needed; verify SW does not cache private API responses.
- Mock mode: `NEXT_PUBLIC_MOCK_MODE` fixtures for offline dev.

**Tasks — Website (marketing, same Next.js app)**

- **Landing:** Refresh hero, feature grid, and **Product showcase** / phone mockups (`landing-content`, `ProductShowcase`, `PhoneMockup*`) with ops + Partner Sync examples.
- **Pricing:** Family Pro bullets for household ops + Google Calendar; CTA consistent with checkout.
- **SEO:** `metadata` / OG tags; optional FAQ or structured data for new capabilities.
- **Legal/marketing:** Copy alignment for Google OAuth data use (link to privacy as needed).

**Dependencies:** Phase 1 API stable; Phase 2 optional for UI (can stub “Connect Google”).

**Success criteria**

- ✅ Done when: Full CRUD UX for all domains; digest visible on dashboard; premium gate matches server; **landing and pricing reflect shipped features**; installable PWA metadata accurate.
- ✅ Verified by: Vitest for stores/utils; Playwright for **app** critical paths + **landing** smoke (key sections visible); Lighthouse sanity on `/`; manual cross-browser smoke.
- ✅ Risk level: Medium.

---

### Phase 4: Workflows, LangGraph, and partner parity (4–6 days)

**Tasks**

- Update agent tool registries so `calendar_whiz` / `budget_buddy` can reference household ops entities where appropriate.
- Digest ordering and deduplication rules (avoid spamming partner with 10 maintenance lines).
- Mom.alpha: consume updated contracts; adjust any digest/dashboard copy; verify **shared** `AgentType` usage in analytics if extended.
- Load/performance check on digest payload size.

**Dependencies:** Phases 1–3.

**Success criteria**

- ✅ Done when: End-to-end: create vehicle → digest line → partner account sees same digest; chat tools can query ops state.
- ✅ Verified by: E2E scenario script; workflow unit tests where applicable.
- ✅ Risk level: Medium.

---

### Phase 5: Release hardening (2–4 days)

**Tasks**

- Security review: OAuth, tier bypass attempts, household isolation (no cross-`household_id` reads).
- Documentation: env vars (`GOOGLE_*`), SETUP.md, rollback steps.
- Monitoring: error rate on Google and new APIs.
- **Launch checklist:** Marketing copy proofread; pricing page matches Stripe SKUs; **GitHub Pages** deploy dry-run; announce channel (optional changelog / release notes for users).

**Dependencies:** All prior phases complete.

**Success criteria**

- ✅ Done when: Checklist signed off; feature flags allow instant disable of Google or ops APIs.
- ✅ Verified by: Staging soak; synthetic monitoring on key endpoints.
- ✅ Risk level: Low.

**Total rough effort:** **25–39 engineer-days** (parallelizable across 2+ devs), aligned with **one release train** after Phase 5 — includes **website + app** surface area in Phase 3.

---

## 5. Testing Strategy

### Unit tests

- Pydantic models validation; tier guard helpers; digest item mapping from domain events.
- Frontend: reducers/selectors for digest categories; premium gate helper.

### Integration tests

- API: CRUD per resource; 403 when tier insufficient; 404 cross-household denied.
- Google: mock HTTP layer; token refresh path; event create idempotency.

### E2E / workflow

- Playwright: login as `family_pro` → create vehicle → see digest line → partner user in same household sees digest (requires multi-user test data or API seed).
- **Landing:** `e2e/landing.spec.ts` (or equivalent) — hero, showcase, pricing sections contain expected strings; no console errors on `/`.
- Optional: LangGraph workflow test if tool-calling graph is updated.

### Tests to update

- Any snapshot of `SyncDigestResponse` shape.
- `dad-agents.test.ts` if capabilities strings change.
- **Landing/marketing:** snapshots or selectors when `landing-content` / showcase structure changes; pricing tier copy tests if asserted.
- **App:** new route coverage for `/household-ops` (or final path) when not premium vs premium.

### Test data

- Staging household with two members (simulating co-parents); Stripe test `family_pro` subscription; Google test account for OAuth.

---

## 6. Open Questions / Risks

| Topic | Question / risk | Mitigation |
|-------|------------------|------------|
| **Digest schema** | Extending `category` may break strict clients | Prefer additive fields with defaults; version API or use `general` fallback |
| **AgentType** | Analytics may need new keys | Add optional types only if product requires; else tag usage via metadata |
| **Mom.alpha timeline** | Sibling repo may ship on different cadence | Shared contract PR first; feature-flag Dad UI until Mom ready **or** backend-only launch with Dad UI first (stakeholder call) |
| **Mom marketing site** | If Mom.alpha has parallel landing, parity of **premium** and **Google** claims | Shared copy deck or single marketing owner |
| **“All at once”** | Increases blast radius | Feature flags per subdomain (garage vs trips); still one marketing release |
| **Smart home** | Scope creep into real device control | Keep v1 as **reminders + checklists** only; document roadmap |
| **Deployment** | DB migrations + OAuth secrets | Blue/green or maintenance window; secrets pre-provisioned in prod |

**Deployment considerations**

- Run migrations before app deploy; verify rollback SQL.
- Rollback: disable feature flag; revert app; keep DB columns nullable for forward compatibility.

---

## Confirmation

- **Saved to:** `docs/enhancement-plans/2026-03-26-household-ops-profiles-option-b-d.md`
- **Phases summary:** (1) Schema + API + premium + contracts, **5–7 d** — (2) Google Calendar, **5–8 d** — (3) **App + website** + Household Ops hub + digest + gates, **9–13 d** — (4) Workflows + Mom parity, **4–6 d** — (5) Hardening + launch checklist, **2–4 d**
- **Estimated total:** **25–39 engineer-days** for one coordinated release (includes marketing/PWA updates in Phase 3), with Phase 2 Google work as the critical path for calendar-dependent acceptance tests.
