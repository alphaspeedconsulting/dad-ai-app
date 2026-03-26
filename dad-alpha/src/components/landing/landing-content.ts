/** Static marketing copy — Alpha.Dad MVP scope (4 agents, PWA, shared backend with Mom.alpha). */

export const PRODUCT_SHOWCASE_ITEMS = [
  {
    title: "Partner sync",
    subtitle: "Dashboard",
    lines: [
      { label: "Digest", value: "From co-parent · 8:02 AM", highlight: true },
      { label: "This week", value: "Soccer, dentist, field trip" },
      { label: "Conflicts", value: "None — calendars aligned" },
    ],
    icon: "sync" as const,
  },
  {
    title: "Garage",
    subtitle: "Family Pro",
    lines: [
      { label: "Family SUV", value: "Oil change due Jun 1", highlight: true },
      { label: "Mileage", value: "34,200 mi · next at 36k" },
      { label: "Expense", value: "Logged to Budget Buddy" },
    ],
    icon: "directions_car" as const,
  },
  {
    title: "Trip planner",
    subtitle: "Family Pro",
    lines: [
      { label: "Beach Week", value: "Jul 12–19 · Outer Banks", highlight: true },
      { label: "Budget", value: "$2,200 est." },
      { label: "Packing list", value: "Checklist started — 8 items" },
    ],
    icon: "flight_takeoff" as const,
  },
  {
    title: "Expenses & lists",
    subtitle: "Money & gear",
    lines: [
      { label: "Last trip", value: "Groceries $94 / $120" },
      { label: "Checklist", value: "Camp packing — 12/14" },
      { label: "Receipt", value: "Categorized · Budget Buddy" },
    ],
    icon: "receipt_long" as const,
  },
] as const;

export const DAY_TIMELINE = [
  {
    time: "7:00 AM",
    icon: "wb_sunny",
    title: "Morning brief",
    body: "Today’s schedule, partner digest, and one priority for the kids — before coffee gets cold.",
    agent: "Schedule Sync",
  },
  {
    time: "8:30 AM",
    icon: "school",
    title: "School alert",
    body: "Field trip form due Friday. School Hub surfaced it from your inbox while you got ready.",
    agent: "School Hub",
  },
  {
    time: "12:15 PM",
    icon: "photo_camera",
    title: "Receipt capture",
    body: "Snap lunch receipt — Expense Tracker categorizes it and updates your weekly totals.",
    agent: "Expense Tracker",
  },
  {
    time: "3:00 PM",
    icon: "event_busy",
    title: "Calendar conflict",
    body: "Soccer overlaps a dentist block. Schedule Sync suggests a one-tap move to Thursday.",
    agent: "Schedule Sync",
  },
  {
    time: "6:30 PM",
    icon: "restaurant",
    title: "Dinner plan",
    body: "Grocery Planner builds tonight’s meal from pantry notes and allergy-safe swaps.",
    agent: "Grocery Planner",
  },
  {
    time: "9:00 PM",
    icon: "bedtime",
    title: "Handoff note",
    body: "Quick summary for your partner: expenses logged, tomorrow’s pickup time confirmed.",
    agent: "Alpha.Dad",
  },
] as const;

export const FEATURE_DEEP_DIVES = [
  {
    id: "partner-sync",
    icon: "sync_alt",
    title: "Partner & calendar alignment",
    lead: "See your co-parent’s context in one place.",
    bullets: [
      "Digest and weekly view on the dashboard",
      "Conflict hints when calendars collide",
      "Built for Google Calendar workflows (more sources over time)",
    ],
  },
  {
    id: "household-ops",
    icon: "home_repair_service",
    title: "Household Ops (Family Pro)",
    lead: "Run the house like a project, not a stack of sticky notes.",
    bullets: [
      "Garage: track vehicles, maintenance schedules, and service due dates",
      "Home & yard: log projects with status, area, and budget link",
      "Trips: itinerary drafts, date blocks, packing checklist, and trip budget",
      "Routines: named sequences of reminders and checklist steps",
    ],
  },
  {
    id: "google-calendar",
    icon: "event_sync",
    title: "Works with Google Calendar",
    lead: "Connect once, keep everything in sync.",
    bullets: [
      "OAuth connect in Settings — no manual export",
      "Maintenance due dates and trip windows create calendar events automatically",
      "Google first; more calendar sources on the roadmap",
    ],
  },
  {
    id: "ai-chat",
    icon: "chat",
    title: "AI-powered chat",
    lead: "Fast for simple jobs — smart when it matters.",
    bullets: [
      "Quick tasks feel instant in the app",
      "Longer asks route through the right agent",
      "Same four agents — Schedule Sync and Expense Tracker now cover household ops too",
    ],
  },
  {
    id: "expenses",
    icon: "account_balance_wallet",
    title: "Expenses & receipts",
    lead: "Track spending without a spreadsheet habit.",
    bullets: [
      "Dedicated expenses view in the PWA",
      "Categories and weekly cues from Expense Tracker",
      "Car, home project, and trip costs tracked alongside everyday spending",
    ],
  },
  {
    id: "school",
    icon: "school",
    title: "School logistics",
    lead: "Fewer missed deadlines in the rush.",
    bullets: [
      "School Hub chat for slips and events",
      "Works with your existing email workflows as the backend supports them",
      "Keeps school noise out of your head — and on the record",
    ],
  },
] as const;

export const PRIVACY_POINTS = [
  {
    icon: "shield",
    title: "Built for families",
    body: "Alpha.Dad is designed so household data stays within flows you control. Follow your org’s privacy policy and in-app disclosures at signup.",
  },
  {
    icon: "lock",
    title: "No mystery training claim",
    body: "Marketing should match the product: check the privacy policy and AI disclosure you accept in the app for how data is used.",
  },
  {
    icon: "encrypted",
    title: "Industry-typical safeguards",
    body: "Use strong passwords, device locks, and the latest app build. Backend security is shared with Mom.alpha on the same platform.",
  },
  {
    icon: "download",
    title: "Your data, your account",
    body: "Account flows follow the same consent and household model as the rest of AlphaSpeed AI family products.",
  },
] as const;

export const PRICING_TIERS = [
  {
    name: "Family",
    monthly: "$7.99/mo",
    yearly: "$69.99/yr (save 27%)",
    badge: null as string | null,
    cta: "Get Early Access",
    features: [
      "4 core AI agents (Schedule Sync, School Hub, Expense Tracker, Grocery Planner)",
      "Dashboard: partner sync, weekly plan, activity feed",
      "Checklists & expenses in the PWA",
      "1,000 AI interactions/month (when billing is enabled)",
      "7-day free trial where offered",
    ],
  },
  {
    name: "Family Pro",
    monthly: "$14.99/mo",
    yearly: "$129.99/yr (save 28%)",
    badge: "Most Popular",
    cta: "Get Early Access",
    features: [
      "Everything in Family",
      "Household Ops hub: garage & maintenance, home projects, trip planner, routines",
      "Google Calendar sync — maintenance and trip dates create events automatically",
      "Partner digest includes household ops updates (garage, home, trips)",
      "Higher AI interaction limits when enabled on the backend",
      "Priority routing when the platform offers it",
      "7-day free trial where offered",
    ],
  },
] as const;

export const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: "What is Alpha.Dad?",
    answer:
      "Alpha.Dad is a Progressive Web App that helps you run family logistics: stay aligned with your co-parent, manage schedules and school tasks, track expenses, and use four AI agents built for real household work. Family Pro adds Household Ops — garage maintenance, home projects, trip planning, and routines.",
  },
  {
    question: "What is Household Ops?",
    answer:
      "Household Ops is a Family Pro feature that brings four ops categories into one hub: Garage (track vehicles and maintenance schedules), Home (log projects and repairs), Trips (itinerary drafts, dates, budgets, and packing lists), and Routines (named sequences of reminders and checklist steps). No smart-home device control in v1 — it is structured household management, not IoT.",
  },
  {
    question: "How does Google Calendar connect?",
    answer:
      "Connect your Google account once in Settings. Alpha.Dad then creates calendar events for vehicle service due dates and trip windows automatically. Disconnect at any time from the same Settings screen. Google is the first integration; more calendar sources are on the roadmap.",
  },
  {
    question: "How does the AI work?",
    answer:
      "Simple actions in the app stay fast on the client. Longer requests go through the agent chat for the specialist you picked (calendar, school, budget, or groceries). Schedule Sync and Expense Tracker now understand household ops context — car costs, trip dates, and project budgets — so you can ask them naturally.",
  },
  {
    question: "Does my partner see Household Ops updates?",
    answer:
      "Yes, on Family Pro. Garage, home project, and trip updates are included in the Partner Sync digest so your co-parent stays in the loop alongside calendar and expense items.",
  },
  {
    question: "Is my data safe?",
    answer:
      "Use the privacy policy and AI disclosure shown at signup for authoritative terms. Alpha.Dad shares a backend with Mom.alpha — treat it like any sensitive family account: secure device, strong password, and review permissions you grant. Google Calendar tokens are stored server-side with standard OAuth security practices.",
  },
  {
    question: "Which calendars does it support?",
    answer:
      "Google Calendar is the first integration for creating events from maintenance due dates and trip windows. Check in-app Settings after login for what is live for your account.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Billing and cancellation follow Stripe and the terms you accept at purchase. Until billing is connected, you are on trial or mock access as shown in the app.",
  },
  {
    question: "What devices work?",
    answer:
      "Alpha.Dad is a PWA — install from the browser on modern iOS (16.4+), Android, tablets, and desktop. Offline behavior depends on cached assets and mock mode settings.",
  },
  {
    question: "What is the difference between Family and Family Pro?",
    answer:
      "Family includes the four core agents, partner sync, checklists, and expenses. Family Pro adds Household Ops (garage, home projects, trips, routines), Google Calendar sync, household ops in the partner digest, and higher AI usage limits.",
  },
];
