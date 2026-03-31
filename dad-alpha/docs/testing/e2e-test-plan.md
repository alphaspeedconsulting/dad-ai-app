# Dad.alpha — End-to-End Test Plan

**Created:** 2026-03-28
**Updated:** 2026-03-29
**For:** Claude Cowork holistic E2E testing

---

## 0. Test Environments

This plan covers **three** test environments. Every test in this document should be run in at least one, and critical flows in all three.

### Local (Mock Mode)
- **Frontend:** `http://localhost:3000` via `npm run dev`
- **Backend:** None — `NEXT_PUBLIC_MOCK_MODE=true`
- **Purpose:** Verify all UI flows work offline with mock data
- **Start:** `cd dad-alpha && npm run dev`

### Local (Full Stack)
- **Frontend:** `http://localhost:3000` via `npm run dev`
- **Backend:** `http://localhost:8000` (FastAPI from `cowork_plugin/platform files/mom_alpha/`)
- **Config:** Set `NEXT_PUBLIC_MOCK_MODE=false` and `NEXT_PUBLIC_API_URL=http://localhost:8000` in `.env.local`
- **Purpose:** Verify frontend-backend integration before deployment
- **Start:** Backend first (`uvicorn`), then frontend (`npm run dev`)
- **Prerequisite health checks:**
  - `curl http://localhost:8000/health` → `{"status": "ok"}`
  - `curl http://localhost:8000/api/agents` → returns agent list

### Production (GitHub Pages + Render)
- **Frontend:** `https://dad.alphaspeedai.com` (GitHub Pages static export)
- **Backend:** `https://household-alpha-api.onrender.com` (Render)
- **CI/CD:** Push to `main` → GitHub Actions builds → deploys `dad-alpha/out/` to Pages
- **Config:** `NEXT_PUBLIC_API_URL` baked at build time (see `.github/workflows/deploy-pages.yml:42`)
- **Purpose:** Verify the live deployed experience end-to-end
- **Prerequisite health checks:**
  - `curl https://household-alpha-api.onrender.com/health` → `{"status": "ok"}`
  - `curl https://household-alpha-api.onrender.com/api/agents` → returns agent list
  - Use `/render-env-health-check PROD` skill for full backend health assessment (DB connections, LLM calls, polling, errors)
  - Verify `https://dad.alphaspeedai.com` loads (check for `_next/` assets, no 404s)

### Environment Comparison Matrix

| Aspect | Local Mock | Local Full Stack | Production |
|--------|:---------:|:----------------:|:----------:|
| Frontend | localhost:3000 | localhost:3000 | dad.alphaspeedai.com |
| Backend | None (mock) | localhost:8000 | household-alpha-api.onrender.com |
| Auth | Mock login | Real JWT | Real JWT + Google OAuth |
| Agents | Mock responses | Real LLM responses | Real LLM responses |
| Chat persistence | localStorage | localStorage | localStorage |
| Stripe | Not available | Test mode (pk_test_) | Test or live mode |
| Push notifications | Not available | Optional | VAPID key configured |
| Google Calendar | Not available | OAuth flow testable | Full integration |
| Service worker | Not registered in dev | Not registered in dev | Active (PWA) |

### What to Test Where

| Test Category | Local Mock | Local Full Stack | Production |
|--------------|:---------:|:----------------:|:----------:|
| UI rendering, navigation, layout | Required | Optional | Required |
| Starter prompts, markdown, chat UX | Required | Required | Required |
| Agent response quality & relevance | Skip | Required | Required |
| Quick action → real API endpoint | Skip | Required | Required |
| Mock responses format & content | Required | Skip | Skip |
| Auth (email signup/login) | Mock only | Required | Required |
| Auth (Google OAuth) | Skip | Optional | Required |
| Stripe checkout | Skip | Test mode | Required |
| Partner invite & join | Skip | Required | Required |
| Household Ops CRUD | Mock only | Required | Required |
| Calendar sync (Google) | Skip | Required | Required |
| Receipt upload (OCR) | Mock only | Required | Required |
| Push notifications | Skip | Skip | Required |
| PWA install prompt | Skip | Skip | Required |
| Offline support (service worker) | Skip | Skip | Required |
| Performance (load times, TTFB) | Skip | Optional | Required |
| Error states (backend down) | Required | Required | Monitor |

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
→ consentApi.accept() called with ConsentRequest (terms_of_service, privacy_policy, ai_disclosure docs)
→ Redirect to /dashboard
→ Dashboard shows greeting with user name
→ Empty state prompts to set up household
```
**Verify:** localStorage has `dad-alpha-auth` with user data. `parent_brand: "dad"` in auth payload. Network tab shows POST to consent endpoint with proper ConsentRequest body containing `terms_of_service`, `privacy_policy`, and `ai_disclosure` document types.

### Flow 2: Google OAuth Login
```
/login → Click "Sign in with Google"
→ Google OAuth popup → Select account
→ Backend returns AuthResponse with JWT
→ Consent screen → consentApi.accept() called
→ Redirect to /dashboard
```
**Verify:** Token stored, user object populated, household_id present or null.
**Local dev note:** When `GOOGLE_CLIENT_ID` env var is not set, the Google sign-in button is disabled and visually dimmed with hint text explaining it is not configured. Verify the button is not clickable and no confusing error appears on click.

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

**Dashboard quick actions (6 in 3x2 grid):**
- Schedule Sync → `/chat/calendar_whiz`
- Grocery List → `/chat/grocery_guru`
- Expenses → `/expenses`
- School Hub → `/chat/school_event_hub`
- Checklists → `/checklists`
- House Ops → `/household-ops`

**Dashboard links to agent chats:**
- "Resolve with Schedule Sync" button → `/chat/calendar_whiz`
- "Full view" on weekly plan → `/chat/calendar_whiz`
- Partner sync items: soccer practice → `/chat/calendar_whiz`, grocery list → `/chat/grocery_guru`, permission slip → `/chat/school_event_hub`
- Activity feed items link to relevant agent chats

**Context query params:**
```
/chat/calendar_whiz?context=vehicle:123 → Auto-sends contextual opening message about vehicle 123
/chat/grocery_guru?context=trip:456 → Auto-sends contextual opening message about trip 456
```
Links from household-ops and other pages pass `?context=` query params. When present, `AgentChatClient` reads the param and auto-sends a contextual opening message. Verify the message appears in the chat without user action.

**Cross-agent navigation:**
`AgentChatClient` uses `key={agent}` prop to force full remount when navigating between different agent chats, preventing stale state from the previous agent. Test by navigating directly from `/chat/calendar_whiz` to `/chat/grocery_guru` and verifying the chat resets to the correct agent's starter prompts (no leftover messages from the previous agent).

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
→ Tap agent cross-link on a vehicle → /chat/calendar_whiz?context=vehicle:123
→ Chat auto-sends contextual opening message about the vehicle
```
**Verify:** Stats update in real-time. Filter pills show counts. Empty states show when no items. Agent cross-links pass `?context=` query params and the chat page auto-sends the contextual opening message without user action.

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
→ /chat/calendar_whiz → Send message → Keyword-matched mock response with markdown table + quick actions
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
- Consent flow calls `consentApi.accept()` with a `ConsentRequest` containing `terms_of_service`, `privacy_policy`, and `ai_disclosure` document types
- Google OAuth button is disabled and dimmed with hint text when `GOOGLE_CLIENT_ID` is not set (no confusing error on click)

### Responsive Design
- Max container width: `max-w-lg` (32rem / 512px)
- Mobile-first, designed for phone viewports
- Safe area insets for notched phones (`env(safe-area-inset-bottom)`)
- Bottom navigation bar on protected pages

### PWA
- Service worker at `/sw.js`
- Web app manifest for "Add to Home Screen"
- VAPID push notification support
- Branded icons: alpha symbol with cyan gradient on dark background, "DAD" label (icon-192.png, icon-512.png, favicon)

### Mock Mode Response Validation

Mock chat responses use keyword-matched selection (not simple round-robin cycling). Each agent has 5-6 responses with keyword arrays. The `findBestResponse()` function scores keyword hits against the user's message and returns the best match, falling back to cycling through non-help responses if no keywords match.

| Agent | Response Count | Selection Method | Fallback |
|-------|:--------------:|-----------------|----------|
| `calendar_whiz` (Schedule Sync) | 5-6 | Keyword-matched via `findBestResponse()` | Cycle through non-help responses |
| `school_event_hub` (School Hub) | 5-6 | Keyword-matched via `findBestResponse()` | Cycle through non-help responses |
| `budget_buddy` (Expense Tracker) | 5-6 | Keyword-matched via `findBestResponse()` | Cycle through non-help responses |
| `grocery_guru` (Grocery Planner) | 5-6 | Keyword-matched via `findBestResponse()` | Cycle through non-help responses |
| Unknown agent type | N/A | N/A | Clear error message (not calendar fallback) |

**Test scenarios:**
- Send a message with keywords matching a specific response (e.g., "conflict" to calendar_whiz) and verify the keyword-matched response is returned
- Send a generic message with no keyword matches and verify the fallback cycling behavior
- Navigate to an invalid agent URL and verify a clear error message is returned (not calendar responses)

### Markdown Rendering
- Agent responses rendered via `marked` + `DOMPurify`
- Supports: bold, italic, headers, bullet/numbered lists, tables, code, links, blockquotes
- CSS styles in `.agent-markdown` class (globals.css)
- XSS protection via DOMPurify sanitization

### Chat Persistence
- Messages stored in `dad-alpha-chat` localStorage
- Max 50 messages per agent (oldest trimmed)
- Clear chat button in header resets per-agent
- Cross-agent isolation: `AgentChatClient` uses `key={agent}` to force full remount on agent navigation, preventing stale state bleed between agents

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

| Metric | Target | Environment |
|--------|--------|-------------|
| Landing page load (static) | < 2s on 3G | Production |
| Landing page TTFB | < 500ms (GitHub Pages CDN) | Production |
| Chat message round-trip (mock) | 600-1000ms (simulated delay) | Local Mock |
| Chat message round-trip (live) | < 3s | Local Full Stack + Production |
| Page navigation (client-side) | Instant (SPA routing) | All |
| Build output size | Verify `out/` directory < 5MB | CI/CD |
| Static routes generated | 16 total | CI/CD |
| Render backend cold start | < 10s (starter tier, no sleep) | Production |
| Render backend warm response | < 500ms for `/health` | Production |

---

## 9. Local Environment Setup & Testing

### Prerequisites
```bash
# Frontend
cd dad-alpha
npm ci
cp .env.local.example .env.local  # then edit values
```

### Mock Mode Testing
```bash
# In .env.local, ensure:
NEXT_PUBLIC_MOCK_MODE=true

npm run dev
# Open http://localhost:3000
# All features work offline — no backend needed
```

**Checklist:**
- [ ] Landing page renders at `/`
- [ ] Mock login succeeds (any credentials)
- [ ] Dashboard shows mock greeting
- [ ] All 4 agent chats return keyword-matched mock responses (5-6 per agent)
- [ ] Quick actions work (mock mode falls back to chat)
- [ ] Household Ops loads mock vehicles/projects/trips/routines
- [ ] Chat persists across page refresh
- [ ] Clear chat resets to starter prompts

### Full Stack Testing
```bash
# In .env.local, set:
NEXT_PUBLIC_MOCK_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:8000

# Start backend first (from cowork_plugin repo):
cd cowork_plugin/platform\ files/mom_alpha
uvicorn app.main:app --reload --port 8000

# Then frontend:
cd dad-alpha
npm run dev
```

**Backend health check before testing:**
```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/agents
```

**Checklist:**
- [ ] Backend `/health` returns `{"status": "ok"}`
- [ ] Signup creates real user with `parent_brand: "dad"`
- [ ] Login returns valid JWT
- [ ] Agent list returns all 4 agents from backend
- [ ] Chat returns real LLM responses (not mock)
- [ ] Quick actions call real endpoints (calendar, slips, expenses, lists)
- [ ] Receipt upload processes image via OCR
- [ ] Calendar sync pulls from Google Calendar (if OAuth configured)
- [ ] Household Ops CRUD persists across page refresh (backend state)
- [ ] Partner invite generates token
- [ ] Stripe checkout redirects to test payment page

### Unit & Build Verification
```bash
npm run test      # 42 unit tests must pass
npm run build     # Static export must produce 16 routes
npx tsc --noEmit  # TypeScript must compile clean
```

---

## 10. Production Testing (GitHub Pages + Render)

### Deployment Pipeline
```
Push to main → GitHub Actions → npm ci → npm run build → Upload to Pages → Deploy
```
Build injects: `NEXT_PUBLIC_API_URL=https://household-alpha-api.onrender.com`

### Pre-Test: Backend Health (Render)
Run `/render-env-health-check PROD` skill to verify:
- [ ] Render service is running (not sleeping / crashed)
- [ ] Database connections healthy (no idle-in-transaction)
- [ ] No LLM retry loops or cost amplification
- [ ] No error clustering in logs

Or manually:
```bash
curl https://household-alpha-api.onrender.com/health
curl https://household-alpha-api.onrender.com/api/agents
```

**Render starter tier note:** The backend is on the Render starter plan (not free tier). Cold starts should be minimal, but verify `/health` responds before testing.

### Pre-Test: Frontend Health (GitHub Pages)
```bash
curl -s -o /dev/null -w "%{http_code}" https://dad.alphaspeedai.com
# Expect: 200

curl -s -o /dev/null -w "%{http_code}" https://dad.alphaspeedai.com/_next/static/css/
# Expect: 200 (assets served correctly)
```

### Production Test Checklist

**Landing & Auth:**
- [ ] `https://dad.alphaspeedai.com` loads — hero section visible, no console errors
- [ ] "Get Started" CTA navigates to `/signup`
- [ ] Agent grid shows all 4 agents with icons and descriptions
- [ ] Pricing section renders tier cards
- [ ] Email signup works — user created, JWT stored, redirect to dashboard
- [ ] Google OAuth login works — popup opens, token returned (button disabled with hint when `GOOGLE_CLIENT_ID` not set)
- [ ] Consent flow displays ToS, Privacy, AI disclosure — all accepted, `consentApi.accept()` called with proper ConsentRequest
- [ ] `parent_brand: "dad"` confirmed in auth request (Network tab)

**Dashboard:**
- [ ] Greeting shows correct time-of-day and user name
- [ ] Sync digest loads (or shows empty state)
- [ ] 6 quick actions in 3x2 grid: Schedule Sync, Grocery List, Expenses, School Hub, Checklists, House Ops
- [ ] Quick action cards link to correct routes (agent chats, /expenses, /checklists, /household-ops)
- [ ] "Resolve with Schedule Sync" links to `/chat/calendar_whiz`
- [ ] "Full view" on weekly plan links to `/chat/calendar_whiz`
- [ ] Partner sync items are clickable Links to correct agent chats
- [ ] Activity feed items are clickable Links to relevant agent chats
- [ ] Logout clears token and redirects to login

**Agent Chat (test each of the 4 agents):**
- [ ] 6 starter prompts render on empty chat
- [ ] Tap starter prompt → message sent → typing indicator → response
- [ ] Response contains markdown (tables, lists, bold) rendered correctly
- [ ] Quick actions appear and call correct API endpoints
- [ ] Chat persists across page refresh
- [ ] Clear chat button works

**Household Ops (Family Pro user):**
- [ ] Non-Pro user sees PremiumGate
- [ ] Pro user sees stat boxes + tab bar
- [ ] All 4 tabs functional (Garage, Home, Trips, Routines)
- [ ] Add/delete items works — persists in backend
- [ ] Filter pills filter correctly
- [ ] Agent cross-links open correct chat routes

**Expenses:**
- [ ] Expense list loads
- [ ] Receipt upload processes and shows parsed expense
- [ ] Monthly summary by category renders

**PWA (Production only):**
- [ ] Service worker registered (`navigator.serviceWorker.controller` exists)
- [ ] "Add to Home Screen" prompt available on mobile
- [ ] App opens in standalone mode from home screen
- [ ] Offline: previously visited pages load from cache
- [ ] PWA icons show branded alpha symbol with cyan gradient and "DAD" label (not blank blue square)
- [ ] Favicon matches branded icon in browser tab

**Push Notifications (Production only):**
- [ ] Push subscription prompt appears
- [ ] Subscribing sends subscription to backend
- [ ] Backend can send push → notification appears

**Performance (Production only):**
- [ ] Landing page: Lighthouse score > 80 (Performance)
- [ ] No render-blocking resources in Network waterfall
- [ ] All static assets served from GitHub Pages CDN
- [ ] API calls go to `household-alpha-api.onrender.com`
- [ ] No CORS errors in console

### Production Smoke Test (Quick — run after every deploy)
A minimal set to confirm the deploy isn't broken:
1. Load `https://dad.alphaspeedai.com` — page renders
2. Navigate to `/agents` — 4 agent cards visible
3. Navigate to `/chat/calendar_whiz` — starter prompts shown
4. Send "What's on today?" — response received with markdown
5. Navigate to `/dashboard` — no errors in console
6. Check Network tab — API calls hit `household-alpha-api.onrender.com`

---

## 11. CI/CD Verification

### GitHub Actions Workflow (`.github/workflows/deploy-pages.yml`)
On every push to `main`:
1. `npm ci` in `dad-alpha/`
2. `npm run build` with `NEXT_PUBLIC_API_URL=https://household-alpha-api.onrender.com`
3. Touches `.nojekyll` (allows `_next/` directory)
4. Uploads `dad-alpha/out/` as Pages artifact
5. Deploys to GitHub Pages

**Verify after deploy:**
- [ ] GitHub Actions workflow completed (green check)
- [ ] Pages deployment succeeded (repo Settings → Pages → last deployment)
- [ ] `https://dad.alphaspeedai.com` serves updated content (check a known change)
- [ ] No 404s for `_next/static/` assets
- [ ] API URL correctly baked: inspect `_next/static/chunks/*.js` for `household-alpha-api.onrender.com`
