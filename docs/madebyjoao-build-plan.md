# madebyjoao.fr — Build Plan & Checklist

Everything agreed in our design discussion, ordered so each phase builds on the last.
Check items off as you go. Each step carries a one-line *why* so the reasoning travels with the task.

---

## The design language (reference card)

The decisions everything below implements. If you're ever unsure mid-code, come back here.

| Axis | Decision | Why |
|---|---|---|
| Identity | Precise engineer with a creative streak ("design engineer") | Space Grotesk pick revealed the creative side |
| Palette | One cool hue (~245°, slate), low chroma, mid-tone surfaces | Harmony from one hue; hierarchy from lightness math — no color judgement needed |
| Accent | Brass/gold, high chroma, used 1–2× per screen max | The "one warm signal" — jazz club, instrument panel, Thanos balance |
| Type | Space Grotesk (400, 500) + Space Mono (400) only | Superfamily = zero pairing risk; two weights force hierarchy by size/spacing |
| Grid | Everything a multiple of 8px (4px for fine detail) | Precision that is verifiable by numbers, felt by the eye |
| Corners | 2px radius on controls, 1px hairline borders | Machined, not friendly-product |
| Motion | 150–250ms, ease-out, transform/opacity only, 70ms stagger | Machined swing: tight timing that feels performed, never bouncy |
| Mood board | Blue Note album covers (Reid Miles era) | Proof that minimal + mid-tone + one accent + characterful type = alive, not cold |

---

## Phase 1 — Design tokens (`src/assets/base.css`)

Two layers: **raw** names what things are, **semantic** names what they're for.
Components only ever touch semantic names — that's what makes retheming a one-file edit.

- [ ] Delete the Vue starter `--vt-c-*` palette values (keep the two-layer *structure* — it's correct)
- [ ] **Raw layer — the slate ladder** (one hue, chroma ≈ 0.03, only L changes):
  - `--slate-280: oklch(0.28 0.03 245)` → text
  - `--slate-450: oklch(0.45 0.03 245)` → deep surface (dark-mode surface)
  - `--slate-680: oklch(0.68 0.03 245)` → mid surface
  - `--slate-820: oklch(0.82 0.03 245)` → raised / light-mode surface
  - `--slate-930: oklch(0.93 0.02 245)` → light text-on-dark
- [ ] **Raw layer — the accent:** `--brass-720: oklch(0.72 0.12 85)`
- [ ] Optional jazz depth tone (only if needed later): `--slate-350: oklch(0.35 0.04 245)` — same hue family, keeps the math intact
- [ ] **Semantic layer:** `--color-surface`, `--color-surface-raised`, `--color-text`, `--color-text-soft`, `--color-accent`, `--color-border` — each pointing at a raw value
- [ ] Wire the existing theme toggle so "light" = surface→slate-820 and "dark" = surface→slate-450 (mid-tone both ways — the twist that makes it *yours*)
- [ ] **Type scale** (ratio 1.25, base 16): `--text-sm: 13px`, `--text-base: 16px`, `--text-md: 20px`, `--text-lg: 25px`, `--text-xl: 31px`, `--text-2xl: 39px`
- [ ] **Spacing scale:** `--space-1: 4px` `--space-2: 8px` `--space-3: 16px` `--space-4: 24px` `--space-5: 32px` `--space-6: 48px` `--space-7: 64px` — and *never* use a raw px margin/padding outside this scale
- [ ] **Motion tokens:** `--dur-fast: 150ms`, `--dur-base: 220ms`, `--ease-out: cubic-bezier(0.22, 1, 0.36, 1)`, `--stagger: 70ms`
- [ ] **Shape tokens:** `--radius: 2px`, `--hairline: 1px solid var(--color-border)`
- [ ] **Z-index layers:** `--z-nav: 100`, `--z-overlay: 200` (tokenized so there are never z-index wars)
- [ ] Reduced-motion switch — zero the durations through the tokens so the whole system turns off at once:
  ```css
  @media (prefers-reduced-motion: reduce) {
    :root { --dur-fast: 0ms; --dur-base: 0ms; --stagger: 0ms; }
  }
  ```

**Verify:** contrast-check text vs surface at [WebAIM](https://webaim.org/resources/contrastchecker/) — body text needs ≥ 4.5:1. Numbers, not vibes.

---

## Phase 2 — Typography

- [ ] Download woff2 files via google-webfonts-helper: **Space Grotesk 400 + 500, Space Mono 400** — three files only, no italics, no 700 (restraint reads as precision; ~60–80KB total)
- [ ] Place in `src/assets/fonts/`, declare `@font-face` in base.css with `font-display: swap` (self-hosting = faster first paint, no third-party request, RGPD-friendly)
- [ ] Font tokens: `--font-sans: 'Space Grotesk', sans-serif`, `--font-mono: 'Space Mono', monospace`
- [ ] **Role map (write it down as law):**
  - Headings → Grotesk 500
  - Body & UI text → Grotesk 400
  - Microlabels / indices / metadata **only** → Mono 400, uppercase, `letter-spacing: 0.1em`
- [ ] Mono seasoning ratio ≈ 5% of what's on screen — Space Mono is wide/loud; pick 2–3 roles and hold the line
- [ ] `font-variant-numeric: tabular-nums` on anything with aligned or changing numbers (indices, dates, counters)
- [ ] Remove Inter / the Google Fonts link from the starter template

---

## Phase 3 — Layout & routing

- [ ] Fix `App.vue`: remove the nonexistent `<BaseLayout>` wrapper and the dead nested `<template>` — App.vue becomes just the root `<router-view />`
- [ ] Create `PublicLayout.vue`: header + footer always present, inner `<router-view>` in `<main>` between them
- [ ] Register it as a **parent route** with children (layouts in Vue Router are just nested routes):
  - `/` → `HomeView`
  - `/contact` → `ContactView`
  - `/work/:slug` → `ProjectView`
  - `/:pathMatch(.*)*` → `NotFoundView` (catch-all 404)
- [ ] Keep the route `meta.fullHeight` pattern for viewport-locked vs scrolling pages (the hero wants full viewport)
- [ ] Add `scrollBehavior` to the router: return to top on navigation, restore position on back/forward
- [ ] **404 page in the brand voice** — mono type, e.g. `ERROR 404 — COORDINATES UNKNOWN`, link home. A free moment of personality, and a precise site handles its edge cases.

---

## Phase 4 — Motion system

- [ ] Page transitions: wrap the layout's inner `<router-view>` output in `<Transition name="fade" mode="out-in">` via the v-slot pattern; 150ms opacity (+ optional 8px translateY). Header/footer sit *outside* the transition — the site reconfigures, never reloads.
- [ ] Build a `useReveal` composable (or `v-reveal` directive) on **IntersectionObserver** — observer, not scroll listeners (fires once when visible, costs nothing)
- [ ] Reveal style: `opacity 0→1` + `translateY(14px)→0`, `var(--dur-base) var(--ease-out)`
- [ ] Stagger children with `transition-delay: calc(n * var(--stagger))` — the 70ms swing is the whole "dynamism" budget
- [ ] Law: animate **only** `transform` and `opacity` (GPU-composited; animating layout properties = jank, and a pixel-perfect site that stutters contradicts itself)
- [ ] One signature hover micro-interaction (e.g. nav underline drawing left→right in `--dur-fast`), used consistently everywhere — one effect repeated beats ten effects scattered
- [ ] Test with OS reduced-motion enabled — everything should simply appear, already handled by the Phase 1 token switch

---

## Phase 5 — Pages & data

### `src/data/projects.js` — single source of truth
- [ ] One array of project objects. Suggested schema (home grid, detail page and meta tags all feed from it):
  ```js
  {
    slug: 'design-system-audit',   // readable URL, SEO, on-brand
    title: '',
    summary: '',                   // one line, for the home card
    year: 2026,
    stack: [],                     // mono-label chips
    role: '',
    cover: '',                     // image path for the card
    // detail page:
    context: '', problem: '', approach: '', result: '',
    images: [],
    link: ''                       // live URL if public
  }
  ```
- [ ] Adding a project = adding one object. Nothing else changes.

### HomeView — the argument (one scroll)
- [ ] **Hero**: identity ("MADEBYJOAO"), value claim (specific, disagreeable-with — not "welcome"), one CTA. Full viewport via `fullHeight` meta. Gold appears here at most twice.
- [ ] **Selected work**: grid mapped over `projects.js` — **4–6 best only** (twelve projects says you can't tell your best from your rest)
- [ ] Cards: mono index (`01`, `02`…), title, one-line summary, hairline border, 2px radius; click → `/work/:slug`
- [ ] Short **about** section
- [ ] Closing **CTA** → `/contact`
- [ ] Stagger reveals on each section as it scrolls in

### ProjectView — the proof
- [ ] Read `route.params.slug`, find the project in `projects.js`
- [ ] Slug not found → redirect to the 404 view (someone *will* visit `/work/banana`)
- [ ] Layout written once, fed by data: context → problem → approach → result

### ContactView — the conversion
- [ ] Structured like an engineer's intake spec / RFQ: project type, budget range, timeline, description, **optional** file field (sketch for the devis)
- [ ] Client-side validation for kind, fast UX only — it protects nothing (that's Phase 6's job)
- [ ] Submit via `fetch` + `FormData` (files can't ride in JSON) to `/api/contact`
- [ ] Machined feedback states in mono: `SENDING...` → `RECEIVED — 200 OK` / error state
- [ ] Honeypot field: extra input hidden with CSS, humans never see it, bots fill it

---

## Phase 6 — Node backend (`/api`)

- [ ] Small Express app, mounted under the **same domain** — `madebyjoao.fr/api/...` (same-origin = CORS never exists)
- [ ] `POST /api/contact`:
  - [ ] Re-validate **everything** server-side as if the frontend didn't exist (client validation is a courtesy; server validation is security)
  - [ ] `multer` for the multipart upload
  - [ ] File rules: images + PDF only, verified by **magic numbers** (actual leading bytes — filenames and MIME claims are just strings the sender typed), 10MB ceiling, randomized stored filename
  - [ ] Drop silently if the honeypot field is filled
  - [ ] Rate limit: a few submissions per IP per hour (humans send one inquiry; scripts send four hundred)
- [ ] `nodemailer` → o2switch SMTP with the `joao@madebyjoao.fr` mailbox credentials (SPF/DKIM-aligned sending = inbox, not spam folder)
- [ ] Email formats the structured fields as a spec sheet; sketch attached
- [ ] Secrets in `.env`, loaded at startup; `.env` in `.gitignore` — this repo is a portfolio, its code will be *shown to people*
- [ ] Dev proxy in `vite.config.js`: `/api` → local Node port, so components call `/api/contact` identically in dev and prod (decision lives in one place, like a token)

---

## Phase 7 — Deployment (o2switch)

- [ ] Create the mailbox `joao@madebyjoao.fr` in cPanel (replying from your own domain = cheapest professionalism upgrade there is)
- [ ] Enable Let's Encrypt HTTPS in cPanel (browsers flag plain-HTTP forms "Not secure" — fatal on a page asking for project details)
- [ ] `npm run build` → upload `dist/` contents to the site root
- [ ] **`.htaccess` SPA rewrite** at the root: any unknown path serves `index.html` (without it, refreshing or sharing `/work/:slug` links 404s — the classic history-mode trap)
- [ ] Register the Node app via cPanel "Setup Node.js App"; route `/api` to it
- [ ] Add real SMTP credentials to the server's `.env`
- [ ] Send a test devis (with attachment) and confirm it lands in the inbox, not spam

---

## Final QA — the precision audit

- [ ] **Grayscale test**: screenshot the site, desaturate it — hierarchy must survive (if it reads in gray, the color is right; this is your superpower, use it)
- [ ] Contrast: body text ≥ 4.5:1 against its surface, checked numerically
- [ ] Spacing audit: every margin/padding is a `--space-*` token — zero stray values
- [ ] Accent count: gold appearances per screen ≤ one hand
- [ ] Mono ratio still ≈ 5%, still only its 2–3 assigned roles
- [ ] Reduced-motion on → site simply appears, nothing moves
- [ ] Refresh directly on a `/work/:slug` URL in production → page loads (rewrite works)
- [ ] Visit `/work/banana` → branded 404
- [ ] Visit a nonsense path → branded 404
- [ ] Keyboard-tab through the whole site → focus always visible
- [ ] Submit the form empty / oversized file / wrong file type → server rejects all three
- [ ] Lighthouse pass: performance + accessibility (a pixel-perfect site that scores badly contradicts itself)

---

*Slate ladder + brass. One hue, laddered light. Two typefaces, three files. 8px everywhere. 70ms of swing. Perfectly balanced — as all things should be.*
