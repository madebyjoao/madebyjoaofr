# Layout & Navigation Guide — Heights, Snap, Observers, and the Laws

**madebyjoao.fr** — how the layout owns the viewport, how the snap-home works,
how the SideNav tracks the active section, and the CSS laws this project paid
to learn. Each law is stated once, with the bug that taught it.

---

## 1. The height contract

**The principle: layout owns height, views own arrangement.**
Views and sections never measure the viewport; they measure the space their
parent grants. Only the layout knows how much room the chrome eats.

```
PublicLayout
└─ div  .flex .flex-col  + (fullHeight ? h-dvh overflow-hidden : min-h-dvh)
   ├─ header   fixed (overlay — out of flow)
   ├─ main     .flex-1  + (fullHeight ? min-h-0 flex flex-col …snap… : overflow-y-auto)
   │  └─ RouterView → sections .snap-start .min-h-full
   └─ Footer   (drawer — fixed, mounted OUTSIDE main; see §5)
```

**The chain, link by link:**

- Wrapper claims the viewport **once** (`h-dvh` locked / `min-h-dvh` scrolling).
- `main.flex-1` receives exactly the leftover space.
- `min-h-0` on main — **the flexbox law:** flex children default to
  `min-height: auto` ("I refuse to shrink below my content"), so an
  overflowing main grows past the wrapper and internal scroll never engages.
  `min-h-0` revokes the refusal. The single most-Googled flexbox mystery.
- Sections use `min-h-full` (100% **of main**), never `min-h-dvh`.
- `min-h`, not `h` — the escape valve: on short viewports the section grows
  and scrolls instead of amputating content.

**The meta contract:** routes declare `meta.fullHeight`; the layout consumes it
**reactively**:

```js
const fullHeight = computed(() => route.meta.fullHeight === true)
```

**Why computed:** the layout *persists* across navigation (that's its point) —
a snapshot at creation would never update. Anything a persistent component
reads from the route must be a live subscription.

### LAW 1 — Percentage heights need a definite parent
`min-height: 100%` against a parent with auto height resolves to nothing;
sections collapse to content height.
*The bug:* home's meta said `fullHeight: false` → main had no definite height →
`min-h-full` sections collapsed into a stacked heap. One boolean starved the
whole apparatus. **Every link in the height chain must be definite.**

### LAW 2 — Viewport units in views double-count the chrome
A `min-h-dvh` section inside a layout = header + full viewport + footer =
taller than the viewport. Hit three separate times in this project. The token
fix where an overlay header is involved: command both sides —
`--header-h` consumed by the header (`h-(--header-h)`) and by any calculation
against it.

---

## 2. The snap-home

```html
<main class="flex-1 no-scrollbar"
      :class="fullHeight
        ? 'min-h-0 flex flex-col overflow-y-auto snap-y snap-mandatory motion-safe:scroll-smooth'
        : 'overflow-y-auto'">
```

```html
<section id="services" class="snap-start min-h-full flex flex-col justify-center px-4 md:px-6">
```

**Decisions and their reasons:**

- **Snap, not click-only:** scrolling is the web's most reliable gesture —
  every human, every device, zero learning. Snap keeps it alive and
  *magnetizes* section boundaries: slide-deck feel, hallway physics.
  (Click-only was built, tested, and rejected by the arbiter — the revert is
  one class: `overflow-hidden` ⇄ `overflow-y-auto`. Useful to know:
  `overflow: hidden` blocks *user* gestures but scripts can still scroll —
  that's what made click-only a one-class feature.)
- **`snap-mandatory` vs `snap-proximity`:** mandatory always settles on a
  stop (confident slide-deck); proximity only snaps near boundaries (gentler).
  Feel both before choosing.
- **No `scroll-pt` with an overlay header:** full-viewport sections +
  scroll-padding = a band of the previous section peeking above each snap.
  Overlay-header worlds want sections to own the full viewport and slide
  under the glass; content is `justify-center`ed so nothing meaningful sits
  in the header zone.
- **Hidden scrollbar = a removed affordance.** The scrollbar tells people
  "there's more below"; hide it and something must replace the signal —
  the SideNav indices are that something (one element, two jobs).
- **`motion-safe:scroll-smooth`:** smooth scrolling IS motion; long animated
  jumps are what make vestibular users ill. The variant honors
  reduced-motion without touching the token file.

**Section anatomy (the shared skeleton):**
`snap-start min-h-full flex flex-col justify-center px-4 md:px-6`, with the
inner `max-w-5xl mx-auto w-full` container — the **alignment law**: header
content, every section, and the footer share one container, so the logo's left
edge and every heading's left edge sit on the same invisible vertical. Visitors
never name it; they feel it.

---

## 3. The SideNav — data-driven, observer-tracked

### Derive, don't duplicate

```js
const sections = ['hero', 'services', 'travaux', 'faq']
const navItems = sections.map((id, i) => ({
  id,
  label: String(i + 1).padStart(2, '0'),
}))
```

Position IS the number. Reorder freely; labels follow. (Known debt: the
sections' own `02 / services` eyebrows are still hand-numbered — the nav
renumbers itself, the eyebrows lie until manually synced. Acceptable at four
sections; automate if it ever bites twice.)

### Active tracking — IntersectionObserver

```js
const activeId = ref(navItems[0].id)   // state that CHANGES → ref
let observer                            // navItems never changes → plain const

onMounted(() => {
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries)
        if (entry.isIntersecting) activeId.value = entry.target.id
    },
    { threshold: 0.5 },
  )
  navItems.forEach(({ id }) => {
    const el = document.getElementById(id)
    if (el) observer.observe(el)
  })
})

onUnmounted(() => observer?.disconnect())
```

**Why an observer, not scroll math:** the browser already knows every
intersection from its own rendering work; the observer pushes the answer for
free instead of recomputing on every scroll event.

**Why `threshold: 0.5` is the whole algorithm:** with full-viewport snap
sections, *at most one* section can be ≥50% visible — "the intersecting one"
and "the active one" are the same thing **by geometry**. No tie-breaking.

**Why cleanup matters here specifically:** the SideNav is `v-if`-gated
(`v-if="fullHeight"` in the layout) — it genuinely unmounts on `/contact`.
Components that subscribe must unsubscribe, or the observer keeps watching
orphaned elements from beyond the grave.

**Why the links are real `<a href="#id">` with `@click.prevent`:**
progressive enhancement — semantics preserved (middle-click, screen readers,
keyboard Tab+Enter), behavior enhanced on top. This is also the accessibility
floor under any reduced-gesture experiments.

**Active styling — the polarity law:** brass = the signal = the ACTIVE item;
inactive items are `text-ink-soft`. Inverted (all-brass, active-muted), the
accent becomes wallpaper and the information becomes silence.
`aria-current` mirrors the brass for assistive tech.

**Why the nav lives in the layout, gated, not inside HomeView:** see LAW 3.

---

## 4. LAW 3 — The containing-block trap

**A transformed ancestor becomes the containing block for `fixed`
descendants.** Any ancestor with `transform`, `filter`, or `backdrop-filter`
re-anchors `position: fixed` to itself instead of the viewport.

*The bug:* the Footer was accidentally mounted inside a leftover button carrying
`-translate-x-1/2`. Its `fixed bottom-0 w-full` became "bottom of the *button*,
full width *of the button*" — a 90px-wide ghost column floating mid-page.
Every weirdness, one ancestor.

**Standing consequences:**
- Fixed overlays (footer drawer, SideNav) mount **directly in the layout**,
  outside `<main>` — outside anything that might one day gain a transform.
- This is *precisely* why they must not live inside the routed page: Phase 4's
  `<Transition>` applies a transform during page changes; a fixed element
  inside the transitioning page re-anchors for 220ms every navigation and
  visibly jumps. The trap is dodged **before** it fires.

---

## 5. The drawer footer

One moving unit — wrapper translates, button rides on its shoulder:

```
div  fixed bottom-0 w-full  z-(--z-overlay)
     translate-y-0 ⇄ translate-y-full   (state: isFooterOpen, private to Footer)
├─ button  absolute -top-12 left-1/2 -translate-x-1/2
│          aria-expanded + chevron rotate-180 when open
└─ footer  bg-inverse border-t border-inverse-line   (mode-stable dark pole)
```

- **State lives in the Footer, fully private** — the lowest point that
  everything needing it can reach. Nothing else knows the drawer exists.
- **`bg-inverse` (mode-stable):** the drawer reads as "another place" — the
  building's basement — and holds still while the theme flips around it.
  A bright panel sliding up in dark mode would be a flashbang; anchored dark
  is a brand-stable signature. (Ghost-glass was prototyped and rejected:
  backdrop blur is only visible over *detail* — blurring a flat slate field
  returns the same flat field.)
- **Button semantics:** `aria-expanded` + `sr-only` name + the 180° chevron
  make the state legible to screen readers and eyes alike. The rotation is
  the free micro-interaction.
- All motion on the tokens: `duration-(--dur-base) ease-out-machined`,
  transform/opacity only.

---

## 6. The laws, on one page

| # | Law | Paid by |
|---|---|---|
| 1 | Percentage heights need a definite parent — every link in the chain | The collapsed-sections heap |
| 2 | Viewport units inside a layout double-count the chrome | Three separate hero/404 bands |
| 3 | Transformed ancestors capture `fixed` descendants | The 90px ghost footer |
| 4 | `min-h-0` on flex children that must scroll | (pre-paid — adopted before it bit) |
| 5 | Persistent components read the route via `computed` | The snapshot that never updated |
| 6 | Subscribers unsubscribe (`onUnmounted` + `disconnect`) | (pre-paid) |
| 7 | `overflow: hidden` blocks gestures, not scripts | (the click-only experiment) |
| 8 | Hidden affordances must be replaced (scrollbar → indices) | Design review |
| 9 | Fixed overlays mount in the layout, outside `<main>` | Law 3, applied forward |

---

*The layout is a contract: it owns the viewport, grants space downward, and
hosts everything that must never move. Views arrange; sections snap; overlays
live outside the flow. Break the chain anywhere and the symptoms appear
somewhere else — which is exactly why the chain is documented.*
