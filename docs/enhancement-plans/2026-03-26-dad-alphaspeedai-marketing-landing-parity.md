# Enhancement Plan: Dad.alphaspeedai.com — Marketing Landing Parity with Mom.alpha

**Created:** 2026-03-26  
**Status:** Draft  
**Author:** Claude  
**Related Files:**
- `dad-alpha/src/app/page.tsx` — current minimal landing (replace/extend)
- `dad-alpha/src/app/layout.tsx` — site metadata, OG URL `https://dad.alphaspeedai.com`
- `dad-alpha/src/app/(app)/agents/page.tsx` — canonical dad agent names, icons, capabilities (source for marketing copy)
- `dad-alpha/src/styles/` — design tokens and Dad brand styles
- Reference experience: [Mom.alpha marketing site](https://mom.alphaspeedai.com/) (section structure, pricing tiers, privacy claims, FAQ pattern)

---

## 1. Enhancement Breakdown

### Request: Public marketing site at `dad.alphaspeedai.com` comparable to Mom.alpha’s landing experience

| Area | What is added or changed | Affected services / agents / workflows | Why this approach |
|------|---------------------------|----------------------------------------|-------------------|
| **Hero + primary CTA** | Full-width hero with headline, subcopy, “Start Free Trial” / “Meet Your Team” (or Dad-equivalent), optional “Launching Soon” badge if GTM matches Mom | **Frontend only** (`dad-alpha`). No agent or LangGraph change. | Parity with Mom’s above-the-fold value prop; reuses existing routes `/login?mode=signup` and in-page anchors. |
| **Product mockups** | Scrollable or stacked phone-style cards showing Dad.alpha UI themes: e.g. Partner Sync, Weekly Plan, Expense/Checklist — aligned with existing app screens (`dashboard`, `expenses`, `checklists`) | **Frontend only**. Copy should reflect **actual** MVP features to avoid `.cursorrules` “no placeholders” policy in production claims. | Visual parity with Mom’s device mock section; builds trust without inventing backend features. |
| **“Meet Your Team”** | Four agent cards (matching `DAD_AGENTS` / agents page): Schedule Sync, School Hub, Expense Tracker, Grocery Planner — with Material icons and capability bullets | **Agent Overlay**: same logical agents as in-app; **no new agent nodes**. Marketing is a **read-only mirror** of `agents` definitions. | Single source of truth: extend or import shared config from `agents/page.tsx` pattern to avoid drift. |
| **“A Day With Dad.alpha”** | Timeline of dad-persona moments (morning digest, school alert, expense capture, conflict resolution, evening handoff) | **Frontend only**. Narrative only; optional future tie-in to real digest jobs is out of scope for landing. | Matches Mom’s day-in-the-life pattern; different story beats for co-parent / logistics focus. |
| **“How It Works”** | 3–4 feature deep-dives: e.g. partner sync, calendar alignment, AI chat routing, receipt/expense capture — with checkmark bullets | **Frontend only**. Descriptions must match real product behavior (mock vs live called out in FAQ if needed). | Educational parity with Mom’s “Smart Calendar / AI Chat / Receipt / School” blocks. |
| **Privacy & trust** | Section mirroring Mom: PII stripping, no training, encryption, export/delete — **only if** shared backend policy matches; otherwise soften to “designed for” + link to legal | **Compliance**: coordinate copy with authoritative `docs/` or legal pages; **no new workflow**. | Same family vertical; avoid over-claiming vs backend reality. |
| **Pricing** | Two tiers analogous to Mom (Family / Family Pro) with Dad-appropriate agent counts (e.g. 4 core vs full roadmap) and interaction limits **if** same Stripe products; else “Get Early Access” only | **Service layer** only if wiring to Stripe Checkout or billing API; can be **static** with external links initially. | Minimizes workflow engine changes; static pricing table is lowest regression risk. |
| **FAQ** | Accordion FAQ: product definition, AI behavior, data safety, calendars, cancel, devices/PWA, tier differences | **Frontend only**. | SEO + conversion parity with Mom. |
| **Footer + legal** | Terms, Privacy, AI Disclosure, Contact — links to real routes or `https://alphaspeedai.com` policy pages as applicable | **Frontend only**. | Legal parity and crawlability. |
| **Global nav / sticky CTA** | Top nav: Agents, Features, Pricing, FAQ, primary CTA | **Frontend only**. | Matches Mom IA; internal anchors on `/` keep static export simple. |

**Architectural alignment (Agent Overlay + service-based + LangGraph):**

- **Landing page** is **static marketing UI** served by the existing Next.js static export. It does **not** invoke LangGraph or agent workflows.
- **Agent Overlay** is reflected **consistently** in copy and icons by reusing the same agent identifiers and names as the in-app `AgentType` roster — no new agent types for marketing alone.
- **Workflow engine**: **No new graphs, nodes, or state machines** for this enhancement unless a **waitlist** or **newsletter** endpoint is added; that would be a small **optional** FastAPI surface (see Open Questions).

---

## 2. Reuse vs New Code Analysis

| Asset | Reuse as-is | Extend | Net-new | Justification for new code |
|-------|-------------|--------|---------|----------------------------|
| Typography, colors, `dad-btn-*`, gradients | Yes — `globals.css`, existing layout fonts | Minor tokens for section spacing/section backgrounds | Some layout primitives (e.g. `Section`, `Container`) if not present | Keeps visual family consistency with dashboard |
| Agent list | Mirror data from `agents/page.tsx` | Centralize in `src/config/agents.ts` or similar; import in both agents page and landing | Shared config file | Eliminates duplicate strings and satisfies “reuse over new code” |
| Auth redirect on `/` | Current `localStorage` check for logged-in users | Keep behavior: authenticated users → `/dashboard` | None | Preserves existing UX |
| SEO metadata | `layout.tsx` OG/Twitter | Add `openGraph.images`, canonical for `dad.alphaspeedai.com`, FAQ JSON-LD | Optional `sitemap` / `robots` if missing | Discoverability parity |
| Mom.alpha React components | N/A (not in repo) | Use as **design reference only** — do not copy proprietary assets | Dad-themed sections implemented in this repo | Legal and maintainability; Mom code may live in another package |
| Pricing / Stripe | N/A until product decision | Env-based CTA links (`NEXT_PUBLIC_STRIPE_*` or marketing URLs) | None if links are config-only | Avoids billing workflow changes in phase 1 |

**Justification for any net-new UI modules:** Mom’s landing is long-form and componentized; splitting `page.tsx` into `components/landing/*` improves maintainability and testing without changing backend architecture.

---

## 3. Workflow Impact Analysis

| Item | Impact |
|------|--------|
| **Workflow steps** | None for core scope (static marketing). Optional waitlist POST → new **async** step: validate email → store → respond — **only if** product requires it. |
| **State transitions** | Unauthenticated visitors: unchanged (`/` → login/signup). Authenticated: still redirect to `/dashboard`. |
| **Side effects** | None on agent execution, household APIs, or LangGraph. Service worker continues to cache static assets; verify cache bust on deploy after large HTML/CSS changes. |
| **Regression risk** | **Low** for copy-only + component refactor if E2E smoke covers `/`, `/login`, `/dashboard`. **Medium** if new JS changes redirect logic or bundle size harms LCP. |
| **Mitigation** | (1) Keep authenticated redirect logic isolated in a small hook or unchanged `useEffect`. (2) Lazy-load below-fold sections if needed. (3) Visual snapshot or Playwright smoke for “landing loads + CTA navigates to signup”. (4) Align legal/privacy bullets with legal review before launch. |

---

## 4. Implementation Phases

### Phase 1: Information architecture & content (1–2 days)

**Tasks:**
- Audit [Mom.alpha](https://mom.alphaspeedai.com/) section order and map each to Dad-specific copy (co-parent sync, logistics, expenses, checklists).
- Extract agent names/capabilities from `dad-alpha/src/app/(app)/agents/page.tsx` into shared config; update agents page to import shared config.
- Draft FAQ and privacy bullets; flag any claim requiring legal/backend confirmation.

**Dependencies:** None technical; optional stakeholder sign-off on pricing and “launching soon” vs live trial.

**Success criteria:**
- ✅ Done when: Written outline (section headings + bullet copy) is approved for implementation.
- ✅ Verified by: Review checklist against in-app features (no false capabilities).
- ✅ Risk level: **Low**

---

### Phase 2: Landing UI components & `/` assembly (3–5 days)

**Tasks:**
- Add `components/landing/` sections: `MarketingNav`, `Hero`, `ProductShowcase`, `AgentGrid`, `DayTimeline`, `FeatureDeepDives`, `PrivacyTrust`, `PricingTable`, `FaqAccordion`, `MarketingFooter`, `StickyCta` (as needed).
- Rebuild `src/app/page.tsx` to compose sections; preserve existing auth redirect behavior.
- Ensure responsive behavior and Material Symbols alignment with existing app.
- Add internal anchor `id`s for nav links (`#agents`, `#features`, `#pricing`, `#faq`).

**Dependencies:** Phase 1 copy approved; shared agent config from Phase 1.

**Success criteria:**
- ✅ Done when: `/` visually and structurally aligns with Mom’s major sections; Dad branding is distinct; all CTAs route correctly.
- ✅ Verified by: Manual responsive check; `npm run build` static export succeeds; no console errors.
- ✅ Risk level: **Medium** (bundle size and layout bugs)

---

### Phase 3: SEO, a11y, and structured data (1 day)

**Tasks:**
- Extend `metadata` in `layout.tsx` or `page.tsx` with canonical URL, OG image (if asset available), FAQ JSON-LD.
- Audit heading order, focus order, accordion keyboard behavior.
- Add `alt` text for mockup imagery.

**Dependencies:** Phase 2 complete.

**Success criteria:**
- ✅ Done when: Lighthouse SEO ≥ 90 (typical static page target); no critical a11y violations in automated scan.
- ✅ Verified by: Lighthouse / axe in CI or manual run.
- ✅ Risk level: **Low**

---

### Phase 4: Optional integrations & deployment (1–2 days)

**Tasks:**
- If required: wire “Get Early Access” to email capture (Formspare, Resend API, or shared backend endpoint) — **follow `.cursorrules`**: no hardcoded secrets; env vars only; full error handling.
- Configure hosting (e.g. Render) for `dad.alphaspeedai.com` to serve `out/` — confirm DNS and HTTPS; **no change** to LangGraph deployment.

**Dependencies:** Product decision on waitlist; Phase 2–3 complete.

**Success criteria:**
- ✅ Done when: Production URL serves new landing; forms (if any) return structured success/error states.
- ✅ Verified by: Smoke test on production; rollback = redeploy previous static build artifact.
- ✅ Risk level: **Medium** if new backend endpoint; **Low** if static links only.

---

## 5. Testing Strategy

| Layer | Scope |
|-------|--------|
| **Unit** | Shared agent config: snapshot or simple tests ensuring 4 agents and slugs match `AgentType` / `generateStaticParams` for chat routes. |
| **Component** | FAQ accordion open/close; optional: section render with mock props. |
| **Integration** | Build passes; no broken imports after extracting `agents` config. |
| **E2E** | Playwright (or existing harness): visit `/` → click primary CTA → land on `/login` or signup query. Authenticated fixture: landing redirects to `/dashboard`. |
| **Regression** | Run existing tests touching `agents` and `layout`. |
| **Test data** | None for static landing; for waitlist API: valid/invalid email fixtures. |

---

## 6. Open Questions / Risks

| Topic | Notes |
|-------|--------|
| **Pricing accuracy** | Mom lists $7.99 / $14.99 and Stripe messaging — confirm Dad.alpha uses **identical** SKUs or adjust copy. |
| **Feature parity claims** | Mom mentions 8 agents; Dad MVP has **4** — marketing must not imply 8 agents on Dad without clear tier labeling. |
| **Legal copy** | Privacy section must match actual backend + policy docs; involve stakeholder review. |
| **OG image** | Need branded asset for social sharing; without it, Twitter/OG cards stay text-only. |
| **Architectural risk** | Confusing “marketing agents” with new LangGraph nodes — **mitigate** via shared config and documentation in PR. |
| **Deployment** | Static export: confirm `basePath` / asset paths if not deployed at domain root. Rollback: keep previous `out/` artifact. |

---

## Summary

| Phase | Focus | Est. effort |
|-------|--------|-------------|
| 1 | IA + copy + shared agent config | 1–2 days |
| 2 | Landing components + `/` page | 3–5 days |
| 3 | SEO + a11y + JSON-LD | 1 day |
| 4 | Optional waitlist + prod deploy | 1–2 days |

**Total (rough):** 6–10 engineering days, plus legal/pricing review time.

This plan delivers **dad.alphaspeedai.com** as a **Mom-comparable marketing experience** while keeping **backend, LangGraph, and household workflows unchanged**, honoring **reuse-first** principles and **Agent Overlay** consistency through shared agent definitions.
