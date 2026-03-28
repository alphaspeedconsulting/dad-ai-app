# Enhancement Plan: Watch Reg App Capability Transfer

**Created:** 2026-03-28
**Status:** Complete
**Author:** Claude
**Source:** `/Users/miguelfranco/Watch Reg App` (Swift/iOS collection management app)
**Related Files:**
- `src/app/(app)/household-ops/page.tsx` — household ops UI (garage, home, trips, routines)
- `src/stores/household-ops-store.ts` — household ops state + mock data
- `src/types/api-contracts.ts` — Vehicle, HomeProject, TripPlan types
- `src/lib/api-client.ts` — householdOps endpoints
- `src/app/(app)/dashboard/page.tsx` — main dashboard

---

## What the Watch Reg App Does Well

The Watch Reg App is a Swift/iOS personal inventory manager for watch collectors. It excels at:

1. **Photo-attached items** — every watch, strap, and accessory carries a photo
2. **Service history with provider tracking** — date, notes, AND who did the work
3. **Registry dashboard with stat boxes** — "3 watches, 5 straps, 2 sizes" at a glance
4. **Filter pills** — tap to filter straps by lug width category
5. **Cross-reference compatibility** — "these straps fit this watch" derived from shared attributes

## What Dad.alpha Already Has

Dad.alpha's Household Ops page (`/household-ops`) has 4 tabs: Garage, Home, Trips, Routines. It already supports:

- Vehicle CRUD with service items (service_type, dates, mileage, notes)
- Home projects with status, area, estimated cost
- Trip planning with dates, budget, packing checklist links
- Automation routines with ordered steps
- Expandable vehicle cards showing service history
- Agent cross-links ("Add to calendar", "Log expense")
- Mock data for all entity types

## Gap Analysis: What's Missing

| Watch Reg Capability | Dad.alpha Status | Gap |
|---------------------|-----------------|-----|
| **Photo per item** | Vehicles/projects/trips have no photo field | **Missing** — receipt upload exists for expenses but not household ops |
| **Service provider tracking** | VehicleServiceItem has `notes` but no `serviced_by` field | **Missing** — would need API contract + backend change |
| **Summary dashboard with stats** | Household ops page has no overview — jumps straight to item list | **Missing** — no stat boxes showing total counts, upcoming service, project status breakdown |
| **Filter pills** | No filtering on any household ops tab | **Missing** — projects could filter by status/area, vehicles by service due |
| **General home inventory** | Only tracks vehicles, projects, trips, routines | **Missing** — no way to catalog appliances, electronics, furniture (insurance value) |
| **Cross-reference registry** | No equivalent view | **Low priority** — household items don't have a compatibility dimension like watches/straps |

---

## 1. Enhancement Breakdown

### 1A. Household Ops Summary Dashboard (from Watch Reg's Registry View)

**What:** Add a summary section at the top of the household ops page showing stat boxes before the tab content.

**Stats to show:**
- Total vehicles / service items due soon
- Active home projects / total estimated cost
- Upcoming trips / days until next trip
- Active routines count

**Affected:** `household-ops/page.tsx` (new summary section above tabs)

### 1B. Filter Pills for Household Ops Tabs (from Watch Reg's StrapListView)

**What:** Add horizontal scrolling filter pills to Home and Trips tabs.

- **Home tab:** Filter by status (Planned / In Progress / Completed / On Hold) and area (Interior / Exterior / Yard)
- **Trips tab:** Filter by status (Planning / Booked / Completed)
- **Garage tab:** Filter by "service due" vs "all"

**Affected:** `household-ops/page.tsx` (HomeTab, TripsTab, GarageTab components)

### 1C. Photo Attachment for Household Items (from Watch Reg's photo-per-item pattern)

**What:** Add optional photo attachment to vehicles, home projects, and trips. The expense receipt upload pattern (`api.expenses.uploadReceipt`) already exists — extend it to household ops.

**Use cases:**
- Vehicle: photo of the car, photo of damage, photo of service receipt
- Home project: before/after photos, reference photos
- Trip: destination photos, booking confirmations

**Affected:**
- `api-contracts.ts` — add `photo_url: string | null` to Vehicle, HomeProject, TripPlan (requires backend sync)
- `household-ops-store.ts` — update mock data
- `household-ops/page.tsx` — add photo display + upload button in item cards
- `api-client.ts` — add photo upload endpoints for household ops (if backend supports it)

### 1D. Service Provider Field (from Watch Reg's ServiceRecord.servicedBy)

**What:** Add `serviced_by` field to VehicleServiceItem so users can track which mechanic/shop performed the work.

**Affected:**
- `api-contracts.ts` — add `serviced_by: string | null` to VehicleServiceItem and VehicleServiceItemCreateRequest
- `household-ops-store.ts` — update mock data
- `household-ops/page.tsx` — show provider in service item card, add field in service form

> **Note:** This requires a backend schema change in `family_platform/`. The frontend change is trivial — adding one field to the type and one input to the form.

---

## 2. Reuse vs New Code Analysis

### Reuse As-Is

| Component | Why |
|-----------|-----|
| `household-ops/page.tsx` tab structure | Already has 4 tabs with consistent patterns — extend, don't rebuild |
| `household-ops-store.ts` CRUD pattern | Mock mode + real API pattern established — add stats methods |
| `api-client.ts` householdOps namespace | All endpoints wired — extend with photo upload |
| Expense receipt upload pattern | `api.expenses.uploadReceipt()` — same file picker + FormData pattern |
| `dad-card`, `dad-chip`, `dad-btn-*` CSS classes | All UI primitives exist |
| Filter pill pattern | None exists — but the Watch Reg `FilterPill` is simple enough to rewrite in React |

### Needs Extension

| Component | What Changes |
|-----------|-------------|
| `household-ops/page.tsx` | Add summary section (stat boxes) above tabs, add filter pills inside tabs |
| `api-contracts.ts` | Add `photo_url` to 3 types, `serviced_by` to VehicleServiceItem |
| `household-ops-store.ts` | Add `getStats()` computed method, update mock data with photo URLs and provider names |

### Net-New

| Component | Justification |
|-----------|--------------|
| `FilterPill` inline component | ~15 lines — a button with selected/unselected state. Too small for its own file. |
| `StatBox` inline component | ~20 lines — icon, value, label card. Reused 4 times in the summary. |
| Summary stats calculation | Derive from existing store data — no new API endpoint needed (compute client-side from vehicles, projects, trips, routines). |

---

## 3. Workflow Impact Analysis

### Workflow Steps Affected

| Flow | What Changes | Risk |
|------|-------------|------|
| Household ops page load | Adds summary stats computation from store data | **Low** — additive, no API calls |
| Home tab rendering | Adds filter state, filtered list | **Low** — existing items still render |
| Trips tab rendering | Adds filter state, filtered list | **Low** — same pattern |
| Vehicle service display | Shows `serviced_by` if present, graceful fallback if null | **Low** — optional field |
| Photo display | Shows photo if `photo_url` exists, placeholder if null | **Low** — optional field |

### State Changes

- Filter state: local `useState` per tab (not persisted, resets on navigation — same as Watch Reg)
- Stats: computed from existing store data, no new state
- Photos: new field on existing types (nullable, backward compatible)

### Regression Risk

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Filter pills hide items unexpectedly | Low | "All" pill selected by default; always show count |
| Photo fields break existing vehicle/project serialization | Low | Fields are nullable — existing data without photos just shows placeholder |
| `serviced_by` field missing from backend responses | Medium | Frontend must tolerate `null` / undefined — already the pattern for all optional fields |

---

## 4. Implementation Phases

### Phase 1: Summary Dashboard + Stat Boxes (~0.5 days)

**Tasks:**
1. Create `StatBox` inline component (icon, value, label)
2. Add summary section above tabs in `HouseholdOpsContent`:
   - Vehicles count + "X service due" (computed from `next_due_at < today`)
   - Active projects count + total estimated cost
   - Next trip destination + days until departure
   - Active routines count
3. Stats computed client-side from store data — no new API calls
4. Update mock data so stats are meaningful

**Dependencies:** None
**Success Criteria:**
- Summary shows 4 stat boxes above tab bar
- Stats update when items are added/deleted
- Mock mode shows meaningful stats

### Phase 2: Filter Pills for Home + Trips Tabs (~0.5 days)

**Tasks:**
1. Create `FilterPill` inline component (label, isSelected, onClick)
2. **Home tab:** Add horizontal scroll row of pills:
   - Status filters: All | Planned | In Progress | Completed | On Hold
   - Counts shown on each pill: "In Progress (2)"
3. **Trips tab:** Add pills:
   - All | Planning | Booked | Completed
4. **Garage tab:** Add pills:
   - All | Service Due
5. Filter state as `useState<string>("all")` per tab — resets on tab switch

**Dependencies:** None (parallel with Phase 1)
**Success Criteria:**
- Tapping a filter pill shows only matching items
- "All" selected by default
- Counts update when items change
- Horizontal scroll works on mobile

### Phase 3: Photo Attachment (~1 day)

**Tasks:**
1. Add `photo_url: string | null` to Vehicle, HomeProject, TripPlan in `api-contracts.ts`
2. Sync type change to `mom-alpha/src/types/api-contracts.ts`
3. Update mock data with sample photo URLs (or `null`)
4. Add photo display in item cards:
   - Vehicles: circular photo next to car icon (falls back to icon if no photo)
   - Home projects: small thumbnail at top of card
   - Trips: destination photo banner at top of card
5. Add photo upload button (reuse receipt upload file picker pattern):
   - File input with `accept="image/*"`
   - In mock mode: show selected image via `URL.createObjectURL`
   - In real mode: POST to backend (endpoint TBD — may need backend work)

**Dependencies:** Phase 1 (stat boxes should account for photo presence)
**Success Criteria:**
- Items with photos show them
- Items without photos show icon placeholder
- File picker opens on tap
- Mock mode shows selected image inline

### Phase 4: Service Provider Field (~0.5 days)

**Tasks:**
1. Add `serviced_by: string | null` to VehicleServiceItem in `api-contracts.ts`
2. Add `serviced_by?: string` to VehicleServiceItemCreateRequest
3. Sync to `mom-alpha/src/types/api-contracts.ts`
4. Update mock service items with provider names
5. Show provider in service item card: "Oil Change — Bob's Auto · Dec 1, 2025"
6. Add "Service provider" input field in service item creation form (if one exists, or add it to the expanded vehicle card)

**Dependencies:** None (parallel with Phase 3)
**Success Criteria:**
- Service items show provider when present
- Gracefully handles null/missing provider
- Form field is optional

### Phase 5: Testing (~0.5 days)

**Tasks:**
1. Unit test: stat box calculations (vehicles with due service, project cost sums)
2. Unit test: filter logic (status filters return correct subsets)
3. Verify `npm run build` succeeds
4. Manual test: mock mode flows for all new UI elements

**Dependencies:** All previous phases
**Success Criteria:**
- All tests pass
- Build succeeds
- Mock mode exercises all new features

---

## 5. Testing Strategy

### Unit Tests

| Test | What It Validates |
|------|-------------------|
| `household-ops-stats.test.ts` (new) | Stats computation: due service count, active projects, next trip, cost sums |
| `household-ops-filters.test.ts` (new) | Filter logic: "planned" filter returns only planned projects, "service due" returns vehicles with overdue service |

### E2E Tests

| Test | Scenario |
|------|----------|
| `e2e/household-ops.spec.ts` | Load page → see stats → switch tabs → filter by status → verify filtered count |

### Existing Tests to Update

None — household ops currently has no dedicated test files. All new.

---

## 6. Open Questions / Risks

### Assumptions

1. **Backend supports photo_url field.** If not, Phase 3 is mock-mode only until the backend adds the column. Frontend degrades gracefully (shows placeholder).
2. **Backend supports serviced_by field.** Same — frontend tolerates null. Can ship the UI change ahead of the backend migration.
3. **Stats are client-side only.** No new API endpoint for aggregated stats. This works because the store already loads all items for the active tab. If item counts grow large (>100), may need server-side aggregation.

### What Was Deliberately Excluded

| Watch Reg Feature | Why Excluded |
|------------------|-------------|
| **General home inventory** (appliances, electronics, furniture) | New entity type = new backend table + API + types + store + UI page. Too much scope for a transfer plan. Would be its own enhancement. |
| **Cross-reference registry** | Watches have a natural compatibility dimension (lug width). Household items don't — vehicles, projects, trips, and routines are independent entities. Forcing a compatibility matrix adds complexity without value. |
| **Codable + UserDefaults persistence** | Dad.alpha uses Zustand + backend API, not local-only storage. Different architecture, pattern doesn't transfer. |

### Risks

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Photo upload needs backend endpoint | Medium | Ship with mock-mode photo preview; backend endpoint can follow |
| `api-contracts.ts` drift with mom-alpha | Medium | Phase 3 & 4 explicitly include sync task |
| Stats computation performance | Low | Max ~50 items per category at scale — trivial to compute |

---

## Timeline Summary

| Phase | Work | Duration | Parallel? |
|-------|------|----------|-----------|
| Phase 1 | Summary dashboard + stat boxes | 0.5 day | Yes (with Phase 2) |
| Phase 2 | Filter pills for all tabs | 0.5 day | Yes (with Phase 1) |
| Phase 3 | Photo attachment | 1 day | After Phases 1-2 |
| Phase 4 | Service provider field | 0.5 day | Parallel with Phase 3 |
| Phase 5 | Testing | 0.5 day | After all |
| **Total** | | **~2.5 days** | Phases 1+2 parallel, 3+4 parallel |

---

## Appendix: Watch Reg Patterns Worth Noting

The Watch Reg App's best architectural decision is **derived compatibility** — straps compatible with a watch are computed on-the-fly by matching lug widths, not stored as explicit relationships. This is the same pattern Dad.alpha should use for stat boxes: compute "vehicles with service due" by filtering `next_due_at < today`, not by storing a separate "due" flag.

The second strong pattern is **photo-per-item as optional data** — items work perfectly without photos, photos are additive. Dad.alpha should follow this: `photo_url: string | null` with icon fallback.
