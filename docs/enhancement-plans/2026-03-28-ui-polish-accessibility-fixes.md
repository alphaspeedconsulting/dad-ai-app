# Enhancement Plan: UI Polish & Accessibility Fixes

**Created:** 2026-03-28
**Status:** Complete
**Author:** Claude
**Related Files:**
- `dad-alpha/src/app/(app)/layout.tsx`
- `dad-alpha/src/app/(app)/settings/page.tsx`
- `dad-alpha/src/app/(app)/agents/page.tsx`
- `dad-alpha/src/app/(app)/checklists/page.tsx`
- `dad-alpha/src/app/(app)/dashboard/page.tsx`
- `dad-alpha/src/app/(app)/expenses/page.tsx`
- `dad-alpha/src/app/(app)/household-ops/page.tsx`
- `dad-alpha/src/components/chat/AgentChatClient.tsx`
- `dad-alpha/src/components/shared/BottomNav.tsx`
- `dad-alpha/src/components/shared/Skeleton.tsx`
- `dad-alpha/src/styles/dad-alpha.css`

---

## Source Audits

This plan addresses all findings from two consecutive audits run on 2026-03-28:

- **UI Consistency Review** (`/ui-consistency-review`) — CSS Zen Garden compliance check
- **UI/UX Analysis** (`/analyze-ui-ux`) — WCAG 2.1, responsive design, UX flows

Issues are classified by severity:

| Severity | Count | Description |
|----------|-------|-------------|
| P0 — Blocking | 4 | WCAG A failures, broken interactive elements |
| P1 — High | 5 | UX trust issues, form accessibility, heading structure |
| P2 — Medium | 4 | Loading states, padding bugs, touch targets |
| P3 — Low / Debt | 2 | Icon token scale, empty state CTAs |

---

## 1. Enhancement Breakdown

### P0 — Blocking Issues

#### P0-A: `.dad-toggle` divs are non-interactive
**File:** `settings/page.tsx:195, 202`
**Problem:** "Partner Sync Digest" and "Quiet Hours" toggles are rendered as `<div className="dad-toggle" />` with no click handler, no `role`, and no keyboard support. They appear interactive but do nothing when tapped. This is a WCAG 4.1.2 violation and a trust-breaking UX bug.
**Change:** Convert to `<button role="switch">` with `aria-checked`, `aria-label`, and wired state. Requires adding two state variables to `SettingsPage` and backing them with localStorage or the user store.

#### P0-B: Icon-only buttons missing `aria-label`
**Files:** `AgentChatClient.tsx:188, 205`, `household-ops/page.tsx` (tab buttons, close buttons)
**Problem:** Back button, clear-chat button, and several household-ops icon actions contain only a Material Symbol span — no accessible name. Screen readers announce them as "button" with no context.
**Change:** Add `aria-label` to every icon-only `<button>` and `<Link>`. No logic changes.

#### P0-C: No skip navigation in app routes
**File:** `(app)/layout.tsx`
**Problem:** Keyboard-only users must tab through the fixed header and all 5 nav items on every page before reaching content. The marketing page has a skip link; the app does not.
**Change:** Add a single skip-nav anchor to `(app)/layout.tsx` and `id="main-content"` to each page's `<main>` element.

#### P0-D: Destructive delete actions have no confirmation
**File:** `household-ops/page.tsx:326, 516, 704, 887`
**Problem:** `deleteVehicle`, `deleteProject`, `deleteTrip`, and `deleteRoutine` fire immediately on single tap. Data entered by the user (photos, service records, project notes) is permanently destroyed with zero friction.
**Change:** Add a local `confirmDeleteId: string | null` state per tab section. On first tap: set `confirmDeleteId = item.id` and render a two-step confirm UI (or inline "Confirm?" row). On second tap: fire the delete. Auto-reset on blur/navigation.

---

### P1 — High Priority

#### P1-A: Heading hierarchy skip (agents page)
**File:** `agents/page.tsx:11, 29`
**Problem:** Page uses `<h1>` for the page title then jumps directly to `<h3>` for agent names — skipping `<h2>`. Screen reader users navigating by headings encounter a broken outline.
**Change:** Change agent name `<h3>` → `<h2>`. One-line change.

#### P1-B: Form inputs lack programmatic labels
**Files:** `settings/page.tsx`, `expenses/page.tsx`, `checklists/page.tsx`, `household-ops/page.tsx`
**Problem:** All form inputs use only `placeholder="..."` as their visible label. Once a user types, the label disappears. Screen readers without aria-label fallback announce inputs as unlabeled. The `<select>` in household-ops has no label at all.
**Change:** Add `aria-label` to all inputs that don't already have a visible `<label>` element. For the household-ops `<select>`, add `aria-label="Project area"`. Inputs that already have an adjacent `<label>` element (checklists checkboxes) are already correct.

#### P1-C: clearChat fires without confirmation
**File:** `AgentChatClient.tsx:203`
**Problem:** The clear-chat button (trash icon) permanently deletes the entire conversation on a single tap. A parent mid-conversation could lose context accidentally.
**Change:** Add a `confirmClear: boolean` local state. First tap shows a brief inline "Clear history?" confirmation row with Confirm/Cancel. Auto-cancels after 4 seconds.

#### P1-D: Settings `<main>` has only `pb-4`
**File:** `settings/page.tsx:153`
**Problem:** `<main className="... pb-4">` — 16px of bottom padding. The "Sign Out" section at the bottom clips under the bottom nav on mobile (nav is ~52px + safe area). Other pages use `pb-24`.
**Change:** Change `pb-4` to `pb-24` to match all other app pages.

#### P1-E: Bottom padding double-stack
**Files:** `(app)/layout.tsx`, all page `<main>` elements
**Problem:** After the production fix, the layout wrapper applies `pb-[calc(5rem+env(safe-area-inset-bottom))]` AND each page `<main>` applies `pb-24` (96px). This creates ~176px of dead space at the bottom on non-iOS devices.
**Change:** Remove the layout-level bottom padding. Each page's `<main pb-24>` is already sufficient for nav clearance. The safe-area-inset is already handled by the nav's own `padding-bottom: env(safe-area-inset-bottom)`. The `pb-24` (96px) provides ample clearance beyond the nav's ~52px rendered height.

---

### P2 — Medium Priority

#### P2-A: No loading states on agents, checklists, expenses pages
**Files:** `agents/page.tsx`, `checklists/page.tsx`, `expenses/page.tsx`
**Problem:** All three pages fetch remote data but render blank content while loading. `dashboard/page.tsx` correctly uses `CardSkeleton`. Users see an empty screen with no feedback.
**Change:** Import `CardSkeleton` from `@/components/shared/Skeleton` and render it while `isLoading` is true. Pattern already established in `dashboard/page.tsx`.

#### P2-B: Touch target "Copy token" button too small
**File:** `settings/page.tsx:304`
**Problem:** `<button className="dad-btn-outline text-alphaai-3xs py-1 px-3">` renders at ~28px height — below the 44px minimum for touch targets (WCAG 2.5.5 / Apple HIG).
**Change:** Change to `py-2 px-4` to reach ~40px, or `py-2.5` to reach 44px.

#### P2-C: Material Symbols icon scale tokens missing
**File:** `dad-alpha/src/styles/dad-alpha.css`
**Problem:** 40+ instances of `text-[16px]`, `text-[18px]`, `text-[20px]`, `text-[22px]`, `text-[24px]`, `text-[28px]`, `text-[32px]`, `text-[40px]` for icon sizing. No shared vocabulary; any future icon size change requires a global find-and-replace.
**Change:** Add `.dad-icon-xs` through `.dad-icon-2xl` utility classes to `dad-alpha.css`. Then do a sweep replacing arbitrary `text-[Xpx]` on `material-symbols-outlined` spans with the corresponding class.

#### P2-D: `<main>` elements missing `id="main-content"` (dependency of P0-C)
**Files:** All `(app)/**` pages
**Problem:** Required for the skip-nav anchor added in P0-C to work correctly.
**Change:** Add `id="main-content"` to the `<main>` in every app route page.

---

### P3 — Low Priority / Tech Debt

#### P3-A: Empty states in household-ops lack action buttons
**File:** `household-ops/page.tsx:233, 475, 861`
**Problem:** Three empty states (vehicles, home projects, routines) show icon + text only. No CTA to start creating. Identified in prior UI consistency audit.
**Change:** Add a CTA button inside each empty state that triggers the corresponding add form (e.g., `onClick={() => setIsAddingVehicle(true)}`).

#### P3-B: Tablet layout undefined
**Files:** All `(app)/**` pages
**Problem:** App routes have zero `md:` breakpoint classes. On tablets (768px+), content renders as a narrow `max-w-lg` centered column — workable but not optimized.
**Change:** Out of scope for this plan — noted as future work for a dedicated tablet layout pass.

---

## 2. Reuse vs New Code Analysis

| Item | Reuse | Extension | Net-New | Justification |
|------|-------|-----------|---------|---------------|
| P0-A toggles | `dad-toggle` CSS | Wire state, change element | `useState` x2 | Toggle CSS exists; only interactivity is missing |
| P0-B aria-labels | All existing buttons | Add attribute only | None | Purely additive |
| P0-C skip nav | Marketing skip nav pattern | Copy pattern to layout | None | Exact same implementation already in `MarketingNav.tsx` |
| P0-D delete confirm | Existing `useState` pattern | Add per-section confirm state | None | 4 instances of same pattern |
| P1-A heading fix | `<h3>` element | Change tag to `<h2>` | None | One character change |
| P1-B aria-labels | Existing inputs | Add attribute only | None | Additive |
| P1-C chat confirm | `useState` pattern | Add `confirmClear` state | Inline confirm UI | ~10 lines of JSX |
| P1-D pb-4 fix | Existing class | Change value | None | One class change |
| P1-E padding fix | Layout class | Remove pb-[calc...] | None | Remove one class |
| P2-A skeletons | `CardSkeleton` already exists | Add `isLoading` branch | None | Reuse `dashboard/page.tsx` pattern exactly |
| P2-B touch target | `dad-btn-outline` | Change padding classes | None | One class change |
| P2-C icon tokens | `dad-alpha.css` | Add utility classes | 6 new CSS classes | No icon scale exists; classes are trivially small |
| P2-D main ids | Existing `<main>` | Add `id` attribute | None | Additive |
| P3-A empty state CTAs | Existing add-form state | Add button + onClick | None | State already exists; button is new JSX |

**Net-new code:** Only 6 CSS utility classes (`.dad-icon-xs` through `.dad-icon-2xl`) and the inline chat confirm UI (~10 lines). Everything else is attribute additions, class changes, or reuse of existing patterns.

---

## 3. Workflow Impact Analysis

| Change | Affected Routes | State Transitions | Regression Risk |
|--------|----------------|-------------------|-----------------|
| P0-A toggle interactivity | `/settings` | New: `partnerDigestEnabled`, `quietHoursEnabled` in component state | Low — isolated to settings page |
| P0-B aria-labels | All app routes | None | None — additive attributes only |
| P0-C skip nav | All `(app)/*` | None | Low — nav helper only |
| P0-D delete confirm | `/household-ops` | New: `confirmDeleteId` state per section | Low — wraps existing delete call |
| P1-C clear chat confirm | `/chat/[agent]` | New: `confirmClear` local state | Low — wraps existing `clearChat` call |
| P1-E remove layout padding | All `(app)/*` | None — visual only | Low — tested visually |
| P2-A loading skeletons | `/agents`, `/checklists`, `/expenses` | Conditional render branch | Low — no logic change |
| P2-C icon token sweep | All app routes | None — CSS class rename | Medium — broad touch, needs visual regression check |

**Highest regression risk: P2-C (icon sweep).** Touching 40+ class names across 6+ files. Mitigation: run Playwright E2E screenshot comparison before/after. Each instance is a mechanical substitution with no logic impact.

---

## 4. Implementation Phases

### Phase 1: P0 Blockers — Accessibility & Trust (~1 day)

**Goal:** Achieve WCAG 2.1 Level A compliance and fix the broken toggles.

**Tasks:**
1. `settings/page.tsx` — Convert `dad-toggle` divs to `<button role="switch">` with `aria-checked` and `aria-label`; wire `partnerDigestEnabled` + `quietHoursEnabled` state (localStorage or user store)
2. `AgentChatClient.tsx` — Add `aria-label="Go back"` and `aria-label="Clear chat history"` to icon-only buttons
3. `household-ops/page.tsx` — Add `aria-label` to all icon-only tab buttons and action buttons (close, back, add)
4. `(app)/layout.tsx` — Add skip-nav anchor link
5. All `(app)/**` page `<main>` elements — Add `id="main-content"`
6. `household-ops/page.tsx` — Add `confirmDeleteId` state to vehicles, projects, trips, and routines sections; implement two-step delete confirmation

**Dependencies:** None

**Success Criteria:**
- All icon-only buttons have accessible names (verify with browser DevTools accessibility tree)
- Skip link appears on focus and navigates to `#main-content`
- Toggling Partner Sync Digest / Quiet Hours visually updates the toggle state
- Deleting a vehicle/project/trip/routine requires two taps

---

### Phase 2: P1 High — Headings, Forms, Padding (~0.5 days)

**Goal:** Fix semantic HTML, form accessibility, and layout padding bugs.

**Tasks:**
1. `agents/page.tsx` — Change agent card `<h3>` → `<h2>`
2. `settings/page.tsx` — Add `aria-label` to householdName, inviteToken, inviteEmail, promoCode inputs; add `aria-label="Project area"` to `<select>` in household-ops
3. `household-ops/page.tsx` — Add `aria-label` to all unlabeled form inputs in add-vehicle, add-project, add-trip, add-routine forms
4. `expenses/page.tsx` — Add `aria-label` to description and amount inputs
5. `AgentChatClient.tsx` — Add `confirmClear` state; implement 4-second auto-canceling confirm row before clearing chat
6. `settings/page.tsx` — Change `pb-4` → `pb-24` on `<main>`
7. `(app)/layout.tsx` — Remove `pb-[calc(5rem+env(safe-area-inset-bottom))]` from the layout wrapper div

**Dependencies:** Phase 1 complete (skip nav IDs set on `<main>` elements)

**Success Criteria:**
- Settings page content not clipped on a 667px (iPhone SE) viewport
- Heading outline is linear: h1 → h2 → (no h3 on agents roster view)
- All inputs announce their purpose when focused with VoiceOver/screen reader
- Bottom padding renders as a single ~96px gap (not 176px)

---

### Phase 3: P2 Medium — Skeletons, Touch Targets, Icon Tokens (~1 day)

**Goal:** Polish loading experience and fix remaining UX friction.

**Tasks:**
1. `agents/page.tsx` — Add `isLoading` check; render `CardSkeleton` while loading
2. `checklists/page.tsx` — Same pattern
3. `expenses/page.tsx` — Same pattern
4. `settings/page.tsx` — Change "Copy token" button from `py-1 px-3` → `py-2.5 px-4`
5. `dad-alpha.css` — Add `.dad-icon-xs` (16px) through `.dad-icon-2xl` (40px) classes
6. All app route pages — Replace `material-symbols-outlined text-[Xpx]` with `material-symbols-outlined dad-icon-{size}`

**Dependencies:** None (can run parallel to Phase 2)

**Sweep reference table for step 6:**

| Arbitrary class | Replacement |
|----------------|-------------|
| `text-[12px]` | `dad-icon-3xs` (12px) |
| `text-[16px]` | `dad-icon-xs` (16px) |
| `text-[18px]` | `dad-icon-sm` (18px) |
| `text-[20px]` | `dad-icon-md` (20px) |
| `text-[22px]` | `dad-icon-md` (mapped to 20-22px) |
| `text-[24px]` | `dad-icon-lg` (24px) |
| `text-[28px]` | `dad-icon-xl` (28px) |
| `text-[32px]` | `dad-icon-xl` (32px, or add `dad-icon-xl-2`) |
| `text-[40px]` | `dad-icon-2xl` (40px) |

**Success Criteria:**
- Agents, checklists, expenses pages show skeleton cards while fetching
- "Copy token" button has a tap target ≥ 44px tall
- Zero `text-[Xpx]` occurrences on `material-symbols-outlined` elements in codebase
- Visual regression: screenshots before/after Phase 3 are pixel-identical

---

### Phase 4: P3 Low — Empty State CTAs (~0.5 days)

**Goal:** Add action buttons to the three barren empty states in household-ops.

**Tasks:**
1. `household-ops/page.tsx` (vehicles empty state, ~line 233) — Add "Add Vehicle" button that calls `setIsAddingVehicle(true)`
2. `household-ops/page.tsx` (projects empty state, ~line 475) — Add "Add Project" button that calls `setIsAddingProject(true)`
3. `household-ops/page.tsx` (routines empty state, ~line 861) — Add "Create Routine" button that calls `setIsAddingRoutine(true)`

**Dependencies:** Phase 1 complete (delete confirmation state patterns established for reference)

**Success Criteria:**
- First-time user with no data sees a clear path to create their first item
- Tapping the CTA opens the correct add form

---

## 5. Testing Strategy

### Unit Tests

| File | Test Cases |
|------|-----------|
| `settings/page.tsx` | Toggle state updates on click; aria-checked reflects state; disabled state when household role ≠ admin |
| `AgentChatClient.tsx` | Clear-chat confirm: shows confirm UI on first click; cancels after 4s; clears on second click; `aria-label` present on back/clear buttons |
| `household-ops/page.tsx` | Delete confirm: first click sets confirmDeleteId; second click fires deleteVehicle; clicking away resets confirmDeleteId |

### E2E Tests (Playwright)

| Test File | Scenario |
|-----------|---------|
| `e2e/accessibility.spec.ts` (new) | Skip nav: Tab from page load reaches skip link; Enter navigates to `#main-content` |
| `e2e/accessibility.spec.ts` | Keyboard nav: all interactive elements reachable by Tab; no focus traps |
| `e2e/settings.spec.ts` | Toggle: clicking Quiet Hours toggle changes `data-active` attribute; second click reverts |
| `e2e/household-ops.spec.ts` | Delete confirm: single tap shows confirm; ESC or navigation resets; second tap deletes |
| `e2e/chat.spec.ts` | Clear chat confirm: shows confirm UI; auto-cancels at 4s; second tap clears messages |
| `e2e/visual-regression.spec.ts` (existing) | Screenshot each app route before/after Phase 3 icon token sweep |

### Existing Tests to Update
- `e2e/settings.spec.ts` — update any toggle interaction tests to expect two-state behavior
- Unit tests for `useHouseholdStore` — no changes needed (delete functions unchanged)

---

## 6. Open Questions / Risks

### Questions

1. **Toggle persistence:** Should the Partner Sync Digest and Quiet Hours toggles persist across sessions (localStorage) or be ephemeral component state? If they map to backend user preferences, they should call `api.profile.update(...)`. Recommendation: start with localStorage; wire to backend in a separate pass when the backend endpoint exists.

2. **Delete confirmation UX pattern:** Two-step inline confirm vs. toast-with-undo? Inline confirm is simpler and has no timer complexity for destructive actions. Toast-with-undo is friendlier UX but requires a toast system. Recommendation: inline confirm for now; toast system is a separate enhancement.

3. **Icon class naming — `text-[22px]`:** There are instances of both `text-[20px]` and `text-[22px]`. Should both map to `dad-icon-md` (standardize to 20px) or should 22px get its own `dad-icon-md-2` class? Recommendation: standardize to 20px (`dad-icon-md`) — a 2px difference is imperceptible in production.

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Icon sweep causes visual regression | Medium | Low | Visual diff screenshots before/after; revert if any icon appears wrong size |
| Toggle state not persisted to backend | Low | Medium | Document that toggle state is UI-only until backend endpoint added |
| Phase 1 toggle wiring changes settings page layout | Low | Low | Existing CSS (`.dad-toggle`) unchanged; only the element type changes |
| Confirm-delete state leaks between tabs in household-ops | Low | Low | Scope `confirmDeleteId` per tab section, not globally |

### Assumptions

- All 4 app pages (`agents`, `checklists`, `expenses`) already have an `isLoading` boolean available from their respective stores — confirmed for household-ops; needs quick verification for the other three before Phase 3.
- The existing `CardSkeleton` component in `src/components/shared/Skeleton.tsx` is generic enough to use as-is in agents, checklists, and expenses without modification.
- No backend API changes are needed for any item in this plan.
