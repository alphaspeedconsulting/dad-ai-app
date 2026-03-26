# Dad.alpha — AI Family Co-Pilot

PWA frontend for Dad.AI. Shares a backend with Mom.alpha.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment config (mock mode enabled by default)
cp .env.local.example .env.local

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Mock Mode

With `NEXT_PUBLIC_MOCK_MODE=true` (default), the app works fully offline:
- Login/signup returns mock user data
- Dashboard shows mock sync digest, weekly plan, and activity feed
- Checklists and expenses use local state
- Chat agents work but need a live backend for responses

## Connecting to Live Backend

Set in `.env.local`:
```
NEXT_PUBLIC_MOCK_MODE=false
NEXT_PUBLIC_API_URL=http://localhost:8000
```

The backend is shared with Mom.alpha — both frontends hit the same FastAPI server.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login / signup with consent flow |
| `/dashboard` | Partner sync, weekly plan, conflicts, quick actions |
| `/agents` | 4 dad-branded AI agents |
| `/chat/[agent]` | Chat with an agent |
| `/checklists` | Gear and packing lists |
| `/expenses` | Family expense tracking |
| `/settings` | Profile, notifications, subscription, household |

## Tech Stack

- Next.js 16.2 (App Router, static export)
- React 19
- Tailwind CSS v4
- Zustand (state management)
- PWA (manifest, service worker, offline support)

## Build

```bash
npm run build   # Static export to out/
npm run start   # Serve production build
```
