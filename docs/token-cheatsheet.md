# madebyjoao.fr — Token Cheatsheet

Quick reference while building. Rule zero: **ask what the element's job is, not what color you want.**

---

## 1. Colors (semantic — they flip with the theme toggle automatically)

| Class | Job | Dark mode | Light mode |
|---|---|---|---|
| `bg-surface` | Normal page surface | slate-450 | slate-820 |
| `bg-surface-raised` | Lifted above the page: cards, header, inputs | slate-520 | slate-880 |
| `bg-surface-deep` | Recessed: footer, hero backdrop, code blocks | slate-350 | slate-760 |
| `text-ink` | Body text | slate-930 | slate-280 |
| `text-ink-soft` | Secondary text: summaries, captions, dates | 930 @ 70% | 280 @ 70% |
| `text-heading` | Headings (h1–h4 already get it from base styles) | slate-930 | slate-280 |
| `text-accent` | Brass text — links, the arrow, one highlight | brass | brass (never flips) |
| `bg-accent` | Brass fill — use almost never (a badge, a marker) | brass | brass |
| `border-accent` | Brass border — active states | brass | brass |
| `border-line` | Default hairline | light @ 25% | dark @ 25% |
| `border-line-hover` | Hairline on hover (pair with `hover:`) | @ 50% | @ 50% |

```html
<!-- a project card -->
<article class="bg-surface-raised border border-line hover:border-line-hover rounded-xs p-6">
  <h3>Design system audit</h3>
  <p class="text-ink-soft">Rebuilt a component library on an 8px grid.</p>
  <span class="text-accent">View case →</span>
</article>
```

**Law:** brass (`*-accent`) appears at most 1–2 times per screen.
**Escape hatch (alarm bell — see cheatsheet footer):** raw stops exist as CSS vars only:
`bg-[var(--slate-350)]` — no utility like `bg-slate-350` exists, on purpose.

---

## 2. Spacing (Tailwind default scale: number × 4px)

**Law: even numbers only.** Odd steps (`p-3` = 12px, `p-5` = 20px) are off the 8px grid.

| Class number | Pixels | Our plan name | Typical job |
|---|---|---|---|
| `1` | 4px | space-1 | icon gaps, fine detail (the one legal odd-ish case) |
| `2` | 8px | space-2 | tight gaps: label → value |
| `4` | 16px | space-3 | default gap inside components |
| `6` | 24px | space-4 | card padding |
| `8` | 32px | space-5 | gaps between components |
| `12` | 48px | space-6 | section inner padding |
| `16` | 64px | space-7 | gaps between sections |
| `24`+ | 96px+ | — | hero breathing room (keep to multiples of 8) |

Works with every spacing utility: `p-6` `px-4` `py-12` `m-8` `mt-16` `gap-4` `space-y-8`.

```html
<section class="py-16 px-6">
  <div class="grid gap-8 md:grid-cols-2">…</div>
</section>
```

---

## 3. Text sizes (ratio 1.25, base 16)

| Class | Size | Job |
|---|---|---|
| `text-sm` | 13px | microlabels, captions, metadata |
| `text-base` | 16px | body (default — rarely needs writing) |
| `text-md` | 20px | leads, card titles |
| `text-lg` | 25px | section headings |
| `text-xl` | 31px | page headings |
| `text-2xl` | 39px | hero |

```html
<h1 class="text-2xl">João builds precise things for the web.</h1>
<p class="text-md text-ink-soft">Front-end engineering, last-pixel obsession.</p>
```

---

## 4. Fonts & weights

| Class | What |
|---|---|
| `font-sans` | Space Grotesk (default everywhere — rarely needs writing) |
| `font-mono` | Space Mono — only via its legal roles (see helpers) |
| `font-medium` | weight 500 — **the only bold on the site** (headings have it already) |
| `font-normal` | weight 400 — back to regular |

Never use `font-bold` / `font-semibold` — the files don't exist; the browser would fake them.

---

## 5. Helper classes (hand-written, not Tailwind)

| Class | Job |
|---|---|
| `.microlabel` | Space Mono's role: uppercase, 13px, tracked 0.1em. Indices, metadata, coordinates |
| `.tabular` | equal-width digits — counters, dates, anything numerically aligned |

```html
<span class="microlabel text-accent">// selected work</span>
<span class="microlabel tabular text-ink-soft">01</span>
```

Mono budget: ≈ 5% of what's on screen. Two or three roles, hold the line.

---

## 6. Shape & borders

| Class | What |
|---|---|
| `rounded-xs` | 2px — the site's only radius (machined, not friendly) |
| `border` + `border-line` | the 1px hairline |
| `border-t` / `border-b` + `border-line` | single-edge dividers |

```html
<footer class="border-t border-line bg-surface-deep">…</footer>
```

---

## 7. Motion

| Token / class | What |
|---|---|
| `ease-out-machined` | the house easing curve (utility for `transition-*`) |
| `duration-[var(--dur-fast)]` | 150ms — hovers, small state changes |
| `duration-[var(--dur-base)]` | 220ms — reveals, page transitions |
| `var(--stagger)` | 70ms — per-child delay in reveal sequences (used in CSS/JS, not a class) |

```html
<a class="transition-colors duration-[var(--dur-fast)] ease-out-machined
          text-ink hover:text-accent">Contact</a>
```

Laws: animate only `transform` & `opacity` (+ colors for hovers). Reduced-motion is already
handled — the tokens zero themselves; never hardcode a `duration-200`.

---

## 8. Breakpoints (Tailwind defaults, kept)

| Prefix | Min width | Mental model |
|---|---|---|
| *(none)* | 0 | phone — the default; design mobile-first |
| `sm:` | 640px | large phone |
| `md:` | 768px | tablet — where most layout shifts happen |
| `lg:` | 1024px | laptop |
| `xl:` | 1280px | desktop |

```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">…</div>
```

---

## 9. Common recipes

```html
<!-- Section with microlabel header -->
<section class="py-16 px-6">
  <span class="microlabel text-ink-soft">02 / about</span>
  <h2 class="text-lg mt-4">About</h2>
</section>

<!-- The CTA button -->
<a class="inline-flex items-center gap-2 microlabel text-ink
          border border-line hover:border-line-hover rounded-xs px-4 py-2
          transition-colors duration-[var(--dur-fast)] ease-out-machined">
  View work <span class="text-accent">→</span>
</a>

<!-- Hairline divider -->
<hr class="border-line" />

<!-- Full-viewport hero (route with meta.fullHeight) -->
<section class="min-h-dvh flex flex-col justify-center px-6">…</section>
```

---

## Footer laws (the audit in one breath)

- Even spacing numbers only → 8px grid survives
- Accent countable on one hand per screen
- Mono ≈ 5%, only via `.microlabel` / `.tabular`
- 400 and 500 are the only weights that exist
- Raw slate vars = alarm bell; want a darker section? `bg-surface-deep`.
  Missing a step? Add a semantic role, don't bypass the wall.
