# Dad.alpha — End-to-End Test Plan

**Created:** 2026-03-28
**For:** Claude Cowork holistic E2E testing
**Deploy URL:** `dad.alphaspeedai.com` (GitHub Pages static export)
**Backend:** Shared FastAPI at `NEXT_PUBLIC_API_URL` (same as Mom.alpha)

---

## 1. Architecture Summary

Dad.alpha is a Next.js 16 PWA with `output: "export"` — fully static, no server runtime. All pages prerender to HTML. The app registers a service worker for offline support and ships a PWA manifest.

**Key env vars:**
- `NEXT_PUBLIC_MOCK_MODE` — `true` for offline/demo, `false` for live backend
- `NEXT_PUBLIC_API_URL` — backend base URL (default: `http://localhost:8000`)
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — push notification support

**State:** Zustand stores with `persist` middleware (localStorage):
- `dad-alpha-auth` — user, token, isAuthenticated
- `dad-alpha-chat` — conversation history per agent (50 messages max per agent)

**Reference files to feed Claude Cowork:**
- `CLAUDE.md` — full architecture guide
- `src/types/api-contracts.ts` — all request/response types
- `src/config/dad-agents.ts` — agent roster with capabilities and starter prompts
- `src/lib/api-client.ts` — all backend endpoints
- `src/lib/mock-chat-responses.ts` — expected mock agent outputs

---

## 2. Route Map

| Route | Auth | Tier | Purpose |
|-------|------|------|---------|
| `/` | Public | Any | Landing page — hero, agent grid, pricing, CTA |
| `/login` | Public | Any | Email/Google login with consent flow |
| `/signup` | Public | Any | Dedicated signup page |
| `/dashboard` | Required | Any | Partner sync digest, weekly plan, conflicts, quick actions |
| `/agents` | Required | Any | Agent roster — 4 cards with capabilities |
| `/chat/calendar_whiz` | Required | Any | Chat with Schedule Sync agent |
| `/chat/school_event_hub` | Required | Any | Chat with School Hub agent |
| `/chat/budget_buddy` | Required | Any | Chat with Expense Tracker agent |
| `/chat/grocery_guru` | Required | Any | Chat with Grocery Planner agent |
| `/checklists` | Required | Any | Gear and packing lists |
| `/expenses` | Required | Any | Family expense tracking |
| `/household-ops` | Required | family_pro | Garage, home projects, trips, routines |
| `/settings` | Required | Any | Profile, notifications, subscription management |
| `/profile` | Required | Any | User profile |

---

## 3. Test Personas

### Persona A: New Dad (First Visit)
- **State:** No account, no localStorage
- **Tier:** None
- **Household:** None
- **Test focus:** Landing page, signup flow, consent, onboarding

### Persona B: Trial User
- **State:** Logged in, trial tier
- **Tier:** `trial`
- **Household:** Has `household_id`
- **Test focus:** All 4 agents, dashboard, limited features, upgrade prompts

### Persona C: Family Plan User
- **State:** Logged in, family tier
- **Tier:** `family`
- **Household:** Has household + partner (member role)
- **Test focus:** Full agent access, sync digest, calendar conflicts, partner features

### Persona D: Family Pro User
- **State:** Logged in, family_pro tier
- **Tier:** `family_pro`
- **Household:** Full household with members
- **Test focus:** Household Ops (all 4 tabs), voice input, analytics dashboard, all features

### Persona E: Invited Partner
- **State:** Has invite token, no account yet
- **Tier:** Inherits from household
- **Household:** Joining existing
- **Test focus:** Invite link → signup → join household → shared data visible

---

## 4. Critical User Flows

### Flow 1: First-Time User Signup
```
Landing (/) → "Get Started" CTA → /signup
→ Enter name + email + password → Submit
→ Consent screen (ToS, Privacy, AI disclosure) → Accept all
→ Redirect to /dashboard
→ Dashboard shows greeting with user name
→ Empty state prompts to set up household
```
**Verify:** localStorage has `dad-alpha-auth` with user data. `parent_brand: "dad"` in auth payload.

### Flow 2: Google OAuth Login
```
/login → Click "Sign in with Google"
→ Google OAuth popup → Select account
→ Backend returns AuthResponse with JWT
→ Redirect to /dashboard
```
**Verify:** Token stored, user object populated, household_id present or null.

### Flow 3: Agent Chat Conversation
```
/agents → Tap "Schedule Sync" card → /chat/calendar_whiz
→ See 6 starter prompts displayed
→ Tap "What's on today?" → Message sent
→ Typing indicator (3 dots) appears
→ Agent response with markdown table renders
→ Quick action buttons appear below response
→ Tap "View conflicts" quick action → API called → response inline
→ Tap clear chat button (trash icon) → Chat emptied → Starter prompts return
```
**Verify:** Messages persist on page refresh (localStorage). Markdown tables render with borders. Quick actions call correct endpoints.

### Flow 4: Household Ops Full CRUD
```
/dashboard → Tap "Household Ops" → /household-ops
→ Premium gate shown if not family_pro tier
→ (As Pro user) See 4 stat boxes at top
→ Garage tab active by default
→ Tap "Add vehicle" → Fill form → Submit
→ Vehicle card appears → Stats update
→ Tap "Service Due" filter pill → Filters list
→ Switch to "Home" tab → Add project → Filter by "Planned"
→ Switch to "Trips" tab → Add trip → See date range
→ Switch to "Routines" tab → Create routine
```
**Verify:** Stats update in real-time. Filter pills show counts. Empty states show when no items.

### Flow 5: Expense Tracking
```
/expenses → See expense list
→ Tap "Scan receipt" → File picker opens
→ Select image → Upload → Parsed expense shown
→ Categorized automatically
→ View monthly summary by category
```

### Flow 6: Partner Invite & Join
```
(Admin user) /settings → "Invite partner" → Enter email
→ Invite token generated
(Partner) Receives invite → Opens link → /signup
→ Signs up → Joins household
→ Sees shared dashboard data
```

### Flow 7: Subscription Upgrade
```
/settings → "Upgrade to Family Pro"
→ Stripe checkout page (hosted)
→ Payment → Redirect back
→ Tier updated → Household Ops unlocked
```

### Flow 8: Offline / Mock Mode
```
Set NEXT_PUBLIC_MOCK_MODE=true
→ /login → Mock login succeeds with mock user
→ /dashboard → Mock data displayed
→ /chat/calendar_whiz → Send message → Mock response with markdown table + quick actions
→ /household-ops → Mock vehicles, projects, trips, routines loaded
→ All features functional without backend
```
**Verify:** No network calls to backend. All data from mock stores.

---

## 5. Feature Gate Matrix

| Feature | trial | family | family_pro |
|---------|:-----:|:------:|:----------:|
| Landing page | Yes | Yes | Yes |
| Login / signup | Yes | Yes | Yes |
| Dashboard | Yes | Yes | Yes |
| All 4 agents | Yes | Yes | Yes |
| Chat with quick actions | Yes | Yes | Yes |
| Voice input (mic button) | No | No | Yes |
| Calendar sync | Yes | Yes | Yes |
| Expenses | Yes | Yes | Yes |
| Checklists | Yes | Yes | Yes |
| Household Ops | No | No | Yes |
| Analytics dashboard | No | No | Yes |
| Partner invite | No | Yes | Yes |
| Push notifications | Yes | Yes | Yes |

**How gates work:** `useAuthStore` provides `user.tier`. Components check `tier === "family_pro"` to show/hide features. The `/household-ops` page renders `<PremiumGate />` for non-Pro users.

---

## 6. Cross-Cutting Concerns

### Authentication
- JWT token stored in `dad-alpha-auth` localStorage key
- Token passed as `Authorization: Bearer <token>` header on all API calls
- If no token, protected routes redirect to `/login?mode=signup`
- `parent_brand: "dad"` injected on all auth calls

### Responsive Design
- Max container width: `max-w-lg` (32rem / 512px)
- Mobile-first, designed for phone viewports
- Safe area insets for notched phones (`env(safe-area-inset-bottom)`)
- Bottom navigation bar on protected pages

### PWA
- Service worker at `/sw.js`
- Web app manifest for "Add to Home Screen"
- VAPID push notification support

### Markdown Rendering
- Agent responses rendered via `marked` + `DOMPurify`
- Supports: bold, italic, headers, bullet/numbered lists, tables, code, links, blockquotes
- CSS styles in `.agent-markdown` class (globals.css)
- XSS protection via DOMPurify sanitization

### Chat Persistence
- Messages stored in `dad-alpha-chat` localStorage
- Max 50 messages per agent (oldest trimmed)
- Clear chat button in header resets per-agent

---

## 7. Error States to Test

| Scenario | Expected Behavior |
|----------|-------------------|
| Backend unreachable (mock mode off) | Chat shows "Sorry, I couldn't process that. Please try again." |
| 401 Unauthorized | Redirect to login |
| Quick action API failure | Inline error: "Sorry, that action failed: {detail}" |
| Invalid agent type in URL | Fallback to "smart_toy" icon, generic description |
| Empty household_id | Chat send disabled, starter prompts still visible |
| localStorage cleared | Auth lost, redirect to login. Chat history gone. |
| Very long agent response | Scrollable chat area, markdown renders fully |
| Agent response with `<script>` | DOMPurify strips it, no execution |

---

## 8. Performance Expectations

| Metric | Target |
|--------|--------|
| Landing page load (static) | < 2s on 3G |
| Chat message round-trip (mock) | 600-1000ms (simulated delay) |
| Chat message round-trip (live) | < 3s |
| Page navigation (client-side) | Instant (SPA routing) |
| Build output size | Verify `out/` directory < 5MB |
| Static routes generated | 16 total |
