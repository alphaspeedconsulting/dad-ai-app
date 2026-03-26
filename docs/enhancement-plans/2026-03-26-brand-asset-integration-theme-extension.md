# Enhancement Plan: Brand Asset Integration + Tactical Theme Extension to App

**Created:** 2026-03-26
**Status:** Complete
**Author:** Claude
**Related Files:**
- `dad-alpha/public/manifest.json`
- `dad-alpha/src/app/layout.tsx`
- `dad-alpha/src/styles/index.css`
- `dad-alpha/src/app/(app)/layout.tsx`
- `dad-alpha/src/components/landing/MarketingNav.tsx`
- `dad-alpha/src/components/landing/MarketingFooter.tsx`
- Source assets: `/Users/miguelfranco/Alpha AI Website/alpha-speed-ai-studio/public/favicon.svg`
- Source assets: `/Users/miguelfranco/Alpha AI Website/alpha-speed-ai-studio/src/assets/`

---

## 1. Enhancement Breakdown

### A. Brand Asset Integration (from alpha-speed-ai-studio)
What: Pull shared AlphaSpeed AI brand assets into Dad Alpha:
- `favicon.svg` — AlphaSpeed AI alpha (α) mark, teal on dark — repainted to electric cyan (`#00CCFF`) to match Alpha.Dad's tactical theme
- `bannerlogo.png` / `logo-alphaspeed-ai.png` — displayed in the marketing footer "Powered by AlphaSpeed AI" section replacing the current plain text
- `og-image.jpeg` — referenced as the OG fallback until a dedicated Alpha.Dad OG card is created

What changes:
- Copy two brand assets into `dad-alpha/public/brand/` (favicon SVG + footer logo PNG)
- Replace text-only footer brand attribution with `<img>` logo + "Powered by AlphaSpeed AI" text
- Add favicon, apple-touch-icon, and OG image references to `layout.tsx`
- Update `manifest.json` — name, short_name, background_color, theme_color
- Update `viewport.themeColor` in `layout.tsx` to match tactical cyan

### B. Tactical Dark Theme Extension to App Pages
What: Extend the `.alpha-dad` scoped CSS theme (already on the landing wrapper) to the authenticated app layout so all in-app screens (`/dashboard`, `/agents`, `/chat`, `/expenses`, etc.) use the same dark tactical aesthetic.

What changes:
- Add `alpha-dad` class to `dad-alpha/src/app/(app)/layout.tsx` wrapper
- Update `viewport.themeColor` to `#00CCFF` (cyan, aligned with tactical theme)
- Update manifest `theme_color` and `background_color` to match

**Services/workflows affected:**
- Marketing landing: `LandingPageView.tsx`, `MarketingFooter.tsx`, `MarketingNav.tsx`
- App layout: `(app)/layout.tsx`
- PWA metadata: `manifest.json`, `layout.tsx` viewport/metadata
- Static export — no server runtime impact

---

## 2. Reuse vs New Code Analysis

### Reused as-is
- `.alpha-dad` CSS class in `styles/index.css` — already complete, no changes needed
- `dad-tactical-grid`, `dad-status-pill`, button glow in `styles/dad-alpha.css` — already complete
- All existing landing components — no copy changes
- All app page components — CSS tokens applied via ancestor class, no component edits needed

### Needs extension
- `MarketingFooter.tsx` — add `<img>` tag for AlphaSpeed AI logo (currently text only)
- `layout.tsx` — add `<link rel="icon">`, `<link rel="apple-touch-icon">`, update OG image metadata, update themeColor
- `manifest.json` — update name, short_name, theme_color, background_color
- `(app)/layout.tsx` — add `alpha-dad` class to root wrapper

### Net-new
- `dad-alpha/public/brand/` directory — holds `favicon.svg` (modified) and `alphaspeedai-logo.png` (copied)
- Modified `favicon.svg` — same SVG structure as alpha-speed-ai-studio but background fill changed from `#2dd4bf` to `#00CCFF` (Alpha.Dad tactical cyan)

**Justification for new assets:**
The favicon.svg needs a color update (teal → cyan) to match Alpha.Dad's brand. A new `/public/brand/` subdirectory keeps third-party assets separate from app icons.

---

## 3. Workflow Impact Analysis

| Area | Impact | Risk |
|------|--------|------|
| Static export build | No new pages, no route changes | Low |
| CSS cascade | `alpha-dad` on `(app)/layout.tsx` propagates tokens to all child routes | Low — tokens already defined, no component changes |
| PWA install prompt | manifest name/color update visible on fresh installs | Low — existing installs show old until uninstall+reinstall |
| OG/social sharing | Better 1200×630 OG image replaces 512×512 app icon | Low — positive improvement |
| Favicon | Browser tab icon upgraded from none → branded SVG | Low — purely additive |
| Service worker | No changes — `sw.js` is static asset caching only | None |

**Regression risk: Low.** All changes are additive (new assets, metadata attributes) or cascade-safe (scoped CSS class on layout ancestor).

---

## 4. Implementation Phases

### Phase 1: Brand Assets & Favicon (~0.5 days)
**Tasks:**
1. Create `dad-alpha/public/brand/` directory
2. Write `dad-alpha/public/brand/favicon.svg` — AlphaSpeed AI α mark with `#00CCFF` fill (adapted from alpha-speed-ai-studio)
3. Copy `bannerlogo.png` from alpha-speed-ai-studio → `dad-alpha/public/brand/alphaspeedai-logo.png`
4. Copy `og-image.jpeg` from alpha-speed-ai-studio → `dad-alpha/public/brand/og-image.jpg` (OG fallback)

**Dependencies:** None

**Success criteria:**
- `public/brand/favicon.svg` renders as a cyan α-mark when opened in browser
- `public/brand/alphaspeedai-logo.png` matches source PNG

---

### Phase 2: Metadata & PWA Manifest (~0.5 days)
**Tasks:**
1. Update `layout.tsx` `<head>`:
   - Add `<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml" />`
   - Add `<link rel="icon" href="/icons/icon-192.png" sizes="192x192" />` (PNG fallback)
   - Add `<link rel="apple-touch-icon" href="/icons/icon-512.png" />` (iOS PWA icon)
2. Update `layout.tsx` `metadata.openGraph.images` → point to `/brand/og-image.jpg` (1200×630 capable)
3. Update `layout.tsx` `metadata.twitter.images` → same
4. Update `layout.tsx` `viewport.themeColor` → `#00CCFF`
5. Update `public/manifest.json`:
   - `name` → `"Alpha.Dad — AI Family Co-Pilot"`
   - `short_name` → `"Alpha.Dad"`
   - `theme_color` → `"#00CCFF"`
   - `background_color` → `"#090B14"`

**Dependencies:** Phase 1 (brand assets must exist)

**Success criteria:**
- `npm run build` succeeds with no errors
- Browser tab shows α favicon after build
- `manifest.json` reflects Alpha.Dad naming and tactical colors

---

### Phase 3: Marketing Footer Logo (~0.5 days)
**Tasks:**
1. Update `MarketingFooter.tsx`:
   - Replace plain text `"Powered by AlphaSpeed AI"` with `<img src="/brand/alphaspeedai-logo.png" alt="AlphaSpeed AI" />` + small text label
   - Logo: `h-6` (24px height), `opacity-70 hover:opacity-100 transition-opacity`
   - Wrap in `<a href="https://alphaspeedai.com" rel="noopener noreferrer">` for brand link
2. Ensure logo is visible on the dark tactical background (may need white/inverted version — check contrast at implementation time; `style={{ filter: "invert(1) brightness(0.8)" }}` as fallback if the PNG is dark)

**Dependencies:** Phase 1 (logo PNG in public/brand/)

**Success criteria:**
- Footer shows AlphaSpeed AI logo + "Powered by AlphaSpeed AI" text
- Clickable link to alphaspeedai.com
- Logo legible on dark `#090B14` background

---

### Phase 4: Tactical Theme Extension to App (~0.5 days)
**Tasks:**
1. Read `dad-alpha/src/app/(app)/layout.tsx` to understand current wrapper structure
2. Add `alpha-dad` class to the outermost wrapper div/html ancestor in `(app)/layout.tsx`
   - If `(app)/layout.tsx` renders a `<div>` root, add `alpha-dad` there
   - Do NOT add to `<html>` or `<body>` in root layout (would break non-landing pages if landing is ever separated)
3. Verify key app components use only CSS variable-based colors (no hardcoded hex values that would clash)
4. Quick visual check: `/dashboard`, `/agents`, `/expenses` should inherit dark tactical palette

**Dependencies:** None (CSS tokens already defined, can be applied independently of Phases 1-3)

**Success criteria:**
- `npm run build` succeeds
- App pages render with dark background (`#090B14`) and cyan accent (`#00CCFF`)
- No hardcoded color conflicts visible in component styles

---

## 5. Testing Strategy

### Unit Tests
- No new unit tests required — this is a CSS/asset/metadata change, not logic
- Existing `dad-agents.test.ts` (agent config) is unaffected; must still pass

### E2E Tests
- Update `e2e/landing.spec.ts` if it asserts on:
  - `themeColor` meta tag value
  - Footer text content (if it checks for plain "Powered by AlphaSpeed AI" text)
- Add one Playwright assertion: `expect(page.locator('[rel="icon"]')).toHaveAttribute('href', '/brand/favicon.svg')`

### Regression Checks
- `npm run build` — confirms TypeScript and static export are clean
- `npm run test` — confirms existing unit tests pass
- Visual smoke: landing page dark theme still isolated (light app pages should NOT get dark theme unless Phase 4 is applied)

---

## 6. Open Questions / Risks

| # | Question | Impact | Resolution |
|---|----------|--------|------------|
| 1 | **Logo contrast**: `alphaspeedai-logo.png` may be dark/transparent — will it be legible on `#090B14`? | Medium — footer logo may be invisible | Check at implementation; apply CSS `filter: invert(1) brightness(0.85)` if needed, or use `logo-alphaspeed-ai.png` variant |
| 2 | **Phase 4 scope**: Applying tactical theme to the app is a visible user-facing change — should this be gated behind a feature flag or deployed behind a review? | Medium | Recommend user reviews the dark app in dev before pushing to Pages |
| 3 | **OG image dimensions**: `og-image.jpeg` from alpha-speed-ai-studio is the AlphaSpeed AI corporate OG image, not Alpha.Dad branded. Acceptable as interim? | Low | Plan treats it as interim; a dedicated Alpha.Dad 1200×630 card is a follow-on task |
| 4 | **Favicon PNG fallback**: iOS Safari does not support SVG favicons — `icon-512.png` is the fallback. Acceptable? | Low — current icons are generic; acceptable until custom Alpha.Dad icon is designed | Use existing icon-512.png as apple-touch-icon |
| 5 | **Theme extension ordering**: Phases 1-3 are independent of Phase 4. If user wants to review landing changes before committing to app theme, Phases 1-3 can ship in one PR and Phase 4 in a follow-up. | Low | Phases can be split across commits if desired |
