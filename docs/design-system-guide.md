# Design System Guide — Tokens, Tailwind v4, and the Wall

**madebyjoao.fr** — how the token system works, why it's layered the way it is,
how to extend it safely, and the three real bugs we hit — preserved as case
studies, because a bug already paid for is the cheapest documentation there is.

The quick reference lives in `token-cheatsheet.md`. This is the *why* behind it.

---

## 1. The founding insight

**Design is a decision problem, not a skill problem.** The system exists to
convert taste questions (unanswerable, especially colorblind) into number
questions (checkable):

| Taste question | Number question |
|---|---|
| "Do these colors go together?" | One hue, chroma ≤ 0.04, lightness laddered |
| "Is this readable?" | Contrast ≥ 4.5:1 (WebAIM checker) |
| "Is this spacing right?" | Multiple of 8? |
| "Do these sizes feel consistent?" | base 16 × 1.25ⁿ |
| "Does this animation fit?" | 150–250 ms, ease-out, transform/opacity only |

**The grayscale test** is the master verification: desaturate a screenshot —
if hierarchy survives, the color is right. Structure first, hue last.

---

## 2. The architecture — three layers in `main.css`

```
┌───────────────────────────────────────────────────────────┐
│ RAW LAYER          plain :root vars — --slate-*, --brass  │  what things ARE
│                    deliberately NOT in @theme             │
├───────────────────────────────────────────────────────────┤
│ SEMANTIC LAYER     plain vars, swapped by :root.dark      │  what things are FOR
│                    --color-background, --color-text, …    │
├───────────────────────────────────────────────────────────┤
│ @theme inline      exposes ONLY semantic names to         │  what Tailwind SEES
│                    Tailwind → bg-surface, text-ink, …     │
└───────────────────────────────────────────────────────────┘
```

**Why raws stay OUT of `@theme`:** `@theme` is a utility generator. If
`--slate-450` lived there, `bg-slate-450` would exist, and 2am-you would
eventually type it — punching through the semantic layer. Keep raws as plain
variables and no utility for them can *ever* exist. The two-layer architecture
stops being a convention you follow and becomes **a wall you can't climb**.

**Why the semantic layer is pointers (`--color-background: var(--slate-820)`):**
the theme toggle swaps ~8 pointers and the whole site follows. "Light mode" =
surface points at slate-820; "dark mode" = surface points at slate-450. Same
ladder, different pointer. No component knows or cares.

**Why `@theme inline` (the keyword matters):** `inline` makes generated
utilities carry the live `var()` reference instead of a frozen snapshot —
`bg-surface` follows the theme toggle automatically. Nobody writes
`bg-white dark:bg-black` pairs; the token system does the flipping.

**The dark variant is class-driven, not OS-driven:**

```css
@custom-variant dark (&:where(.dark, .dark *));
```

The toggle (VueUse `useDark`) sets `.dark` on `<html>`; this line re-teaches
Tailwind's `dark:` to follow it instead of `prefers-color-scheme`.

**The wipes — the wall at full strength:**

```css
@theme {
  --color-*: initial;   /* no bg-red-500, no text-zinc-400 — ever */
  --text-*: initial;    /* no off-scale text-6xl sneaking in      */
}
```

The entire universe of expressible colors is nine slates behind a wall and a
handful of semantic names in front of it. A system proves itself by what it
**refuses**.

---

## 3. What earns a token (and what doesn't)

**The test:** does this value *repeat*, or does it *encode identity*?
Yes to either → token. One-off fix for a layout quirk → not a token
(that would be bureaucracy).

The six departments: color ladder · type scale · spacing (8px grid) ·
motion (`--dur-fast/base`, `--ease-out-machined`, `--stagger`) ·
shape (`--radius`, hairlines) · layers (`--z-nav`, `--z-overlay`).

Plus the structural ones added along the way: `--header-h` (both the header's
height AND every calculation against it — *command both sides of the equation*).

---

## 4. Extension recipes

### Adding a semantic color role (case study: the inverse footer)

The situation: the footer wanted to be "another place" — a region that does
NOT flip with the theme. The ladder's roles didn't cover it. **The rule when
that happens: mint a role, don't bypass the wall.**

```css
/* 1. semantic layer — :root only. No .dark override = no flip. That IS the feature. */
--color-inverse-surface: var(--slate-280);
--color-inverse-ink: var(--slate-930);
--color-inverse-line-val: oklch(0.93 0.02 245 / 0.2);

/* 2. @theme inline — expose with DIFFERENT names (see Bug #3 below) */
--color-inverse: var(--color-inverse-surface);
--color-inverse-line: var(--color-inverse-line-val);
```

**A role is a small family, not one color:** a mode-stable dark panel needs its
own ink and its own hairline (the default `border-line` is mode-relative —
invisible on an always-dark surface).

**Name roles by job, not location:** `inverse`, not `footer` — tooltips,
toasts, and code blocks will want the same pole someday.

### Extending the type scale (case study: the hero)

39px was undersized for a display hero; the eye wanted ~60px. The systemic
answer: continue the ratio, don't import arbitrary sizes.

```css
--text-3xl: 3.0625rem;  /* 49px = 39 × 1.25 */
--text-4xl: 3.8125rem;  /* 61px = 49 × 1.25 — the eye's 60px, from the math */
```

When taste and the ratio agree within a pixel, that's the system working
*through* you.

### The escape hatch (and its alarm bell)

Raw vars remain reachable via arbitrary values: `bg-[var(--slate-350)]` /
`bg-(--slate-350)`. **Treat every use as an alarm:** a fixed color must be
right in both modes — you're hand-managing what the system automates. Nine
times out of ten the answer is an existing role; the tenth time, mint one.

---

## 5. Motion tokens — the accessibility contract

```css
@media (prefers-reduced-motion: reduce) {
  :root { --dur-fast: 0ms; --dur-base: 0ms; --stagger: 0ms; }
}
```

**Why zeroing tokens beats disabling animations:** every animation on the site
draws from these variables, so one block switches the *entire* motion system
off. The contract this creates: **never hardcode a duration** (`duration-300`
breaks the promise — it doesn't read the tokens). Always
`duration-(--dur-fast)` / `duration-(--dur-base)`.

Companion rules: JS scrolling uses `scrollIntoView()` **without** a behavior
argument (defers to CSS `scroll-behavior`, which is `motion-safe:` gated) —
passing `{ behavior: 'smooth' }` overrides CSS and forces motion on everyone.

---

## 6. Case studies — the three bugs, preserved

### Bug #1 — the namespace wipe order

**Symptom:** `bg-inverse` (and, silently, *every* semantic color utility)
produced nothing. Classes present, paint absent, no errors.

**Cause:** `--color-*: initial` sat *after* the `@theme inline` registrations.
Tailwind processes theme keys top-to-bottom; the wipe cleared everything as of
its position — defaults AND our semantics. Empty namespace → zero utilities
generated.

**Why it hid for days:** `body` colors came from plain `var()` (unaffected) and
early experiments used arbitrary values (bypass the theme). Every path walked
happened to detour around the crater.

**Law:** **wipe first, register after.** And when CSS "isn't working," grep the
*built* artifact (`dist/assets/*.css`) — it converts "CSS is being weird" into
"this selector does not exist," and the second sentence is always solvable.

### Bug #2 — the unclosed comment

**Symptom:** the site quietly reverted to system fonts; `.font-mono` and
`.text-sm` vanished.

**Cause:** an edit deleted a line that carried a comment's closing `*/`. The
orphaned `/*` swallowed the next three declarations until the next `*/` it
found (inside a `/* 13px */` size annotation).

**Law:** CSS comments fail silently — there is no compiler error for
"you commented out your fonts." After any deletion inside a commented region,
re-read the block; and the build + `grep dist` ritual catches it.

### Bug #3 — the self-referencing theme key

**Near-miss:** exposing a semantic in `@theme inline` under the *same name* as
its source (`--color-inverse-ink: var(--color-inverse-ink)`) emits a variable
that references itself → invalid at computed-value time.

**Law:** `@theme inline` names must **differ** from the semantic-layer names
they point to. Hence the `-val` suffix convention on sources
(`--color-border-val` → theme `--color-line`) or distinct vocabulary
(`--color-background` → theme `--color-surface`).

---

## 7. Vocabulary map (source of the cheatsheet)

| Layer name (main.css) | Tailwind utility | Job |
|---|---|---|
| `--color-background` | `bg-surface` | page surface (flips) |
| `--color-background-soft` | `bg-surface-raised` | cards, header, inputs |
| `--color-background-mute` | `bg-surface-deep` | recessed regions |
| `--color-text` | `text-ink` | body text |
| `--color-text-soft` | `text-ink-soft` | secondary text |
| `--color-accent-val` | `*-accent` | THE warm signal, 1–2×/screen |
| `--color-border-val` | `border-line` | hairlines |
| `--color-inverse-surface` | `bg-inverse` | mode-stable dark pole |

---

*One hue laddered by light, two typefaces in three files, an 8px grid, four
motion numbers, and a wall that refuses everything else. The system is the
style.*
