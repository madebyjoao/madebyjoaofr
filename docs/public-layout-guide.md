# Public Layout with a Per-Route `<main>` Height

> Implementation guide based on the "How to Use Vue Router" PDF (Nested Routes, pp. 13–17; Route Meta Fields, pp. 26–28), mapped onto this project's structure.
>
> **Goal:** one public layout where the header and footer are always present, but the `<main>` sizing changes per route — auto height on the home page (page grows, body scrolls), viewport-locked (`h-screen`-style) on other pages.

---

## 0. Two problems in the current code (worth knowing first)

1. `client/src/App.vue` wraps everything in `<BaseLayout>`, but that component **doesn't exist anywhere and is never imported**. Vue silently renders it as an unknown element, so the app only works by accident.
2. The same file has a bare `<template>` nested inside with no slot directive — it's dead markup.

The plan below replaces this pattern entirely, so both problems disappear naturally.

## 1. The core idea from the PDF: layouts are *parent routes*

The PDF (pp. 13–17) shows that Vue Router layouts aren't a special feature — they're just **nested routes**. A parent route renders a layout component containing a `<router-view />`, and its `children` render *inside* that view:

```
URL "/"                          URL "/contact"
     │                                │
     ▼                                ▼
PublicLayout  ◄── header+footer ──►  PublicLayout   (same instance, NOT re-mounted)
     │                                │
     ▼                                ▼
HomeView renders in            AboutView renders in
its <router-view/>             its <router-view/>
```

**Why this beats putting the header/footer in App.vue** (the current setup):

- App.vue stays a pure shell (`<RouterView/>` only), so later you can add an `AdminLayout` or `AuthLayout` as *sibling* parent routes without touching public pages.
- The layout component is **not destroyed between child navigations** — `ThemeBtn` state, header, etc. persist; only the middle swaps.
- Each page stops needing to remember to include `<main>` / header spacing itself.

## 2. The second idea from the PDF: route `meta` drives the height mode

The PDF (pp. 26–28) shows `meta` as the place for per-route *configuration* the layout can read (`title`, `layout`, etc.). "Auto height on home, locked viewport height elsewhere" is exactly that kind of config:

```js
{ path: '/',        meta: { fullHeight: false } }   // page grows, body scrolls
{ path: '/contact', meta: { fullHeight: true  } }   // viewport-locked, main fills
```

**Why meta instead of styling each view?** The decision lives next to the route definition (one file to scan), the layout enforces it consistently, and a view can't "forget" its sizing. If you instead put `h-screen` inside each view, the header/footer would still push the total page height past the viewport — see §4.

## 3. Target structure

```
client/src/
├── App.vue                        ← becomes just <RouterView />
├── layouts/
│   └── PublicLayout.vue           ← NEW: header + <main> + footer
├── components/public/
│   ├── Navbar.vue                 (unchanged)
│   └── Footer.vue                 ← NEW
├── views/
│   ├── HomeView.vue               (drop its own <main> tag)
│   └── AboutView.vue
└── router/index.js                ← nested routes + meta
```

### `router/index.js`

```js
import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '../layouts/PublicLayout.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: PublicLayout,          // ← the layout is the parent route
      children: [
        {
          path: '',                     // '' = default child → matches "/"
          name: 'home',
          component: HomeView,
          meta: { fullHeight: false },  // auto height, normal page scroll
        },
        {
          path: 'contact',              // ⚠ no leading slash on children
          name: 'contact',
          component: () => import('../views/AboutView.vue'), // lazy, as PDF recommends
          meta: { fullHeight: true },   // viewport-locked
        },
      ],
    },
  ],
})

export default router
```

Two gotchas straight from the PDF's nested-routes section:

- A child `path: ''` is the **default child** — that's how `/` still renders HomeView while PublicLayout owns `/`.
- Child paths **must not start with `/`** — a leading slash makes them root paths and breaks nesting.

### `layouts/PublicLayout.vue`

```vue
<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Navbar from '@/components/public/Navbar.vue'
import Footer from '@/components/public/Footer.vue'

const route = useRoute()
// computed → re-evaluates on every navigation (PDF: "ensures reactivity")
const fullHeight = computed(() => route.meta.fullHeight === true)
</script>

<template>
  <!-- The wrapper decides the strategy; header/footer never change -->
  <div
    class="flex flex-col"
    :class="fullHeight ? 'h-dvh overflow-hidden' : 'min-h-dvh'"
  >
    <header class="shrink-0 flex w-full md:items-center md:justify-around">
      <img alt="Logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
      <Navbar />
    </header>

    <!-- flex-1 = main absorbs all leftover space in BOTH modes -->
    <main class="flex-1" :class="fullHeight ? 'min-h-0 overflow-y-auto' : ''">
      <RouterView />
    </main>

    <footer class="shrink-0">
      <!-- footer content -->
    </footer>
  </div>
</template>
```

### `App.vue` shrinks to a shell

```vue
<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />  <!-- PublicLayout renders here; pages render inside IT -->
</template>
```

And `views/HomeView.vue` should drop its own `<main>` wrapper — the layout owns `<main>` now, and nested `<main>` elements are invalid HTML.

## 4. The whys of the CSS (this is where most people get bitten)

**Why not literally `h-screen` on `<main>`?** Because the header and footer also take height. `header + 100vh main + footer > 100vh`, so you'd *always* get a scrollbar on your "fixed" pages — the opposite of what you want. The correct model is: **lock the wrapper, let `<main>` take the remainder** via `flex-1`.

The two modes, side by side:

```
  AUTO (home)  min-h-dvh              FIXED (contact)  h-dvh + overflow-hidden
┌──────────────────────┐            ┌──────────────────────┐ ─┐
│ header               │            │ header               │  │
├──────────────────────┤            ├──────────────────────┤  │
│ main (flex-1)        │            │ main (flex-1)        │  │ exactly
│  content…            │            │  fills remainder;    │  │ one
│  content…            │            │  scrolls INTERNALLY  │  │ viewport,
│  content…            │  ← body    │  if content overflows│  │ body never
├──────────────────────┤    scrolls ├──────────────────────┤  │ scrolls
│ footer               │    if long │ footer (always       │  │
└──────────────────────┘            │         visible)     │  │
   page grows freely                └──────────────────────┘ ─┘
```

Each class earns its place:

| Class | Mode | Why it's needed |
|---|---|---|
| `min-h-dvh` | auto | Short pages still push the footer to the bottom of the viewport; long pages grow past it and the body scrolls normally. |
| `h-dvh overflow-hidden` | fixed | Hard-caps the layout at one viewport and kills the body scrollbar. |
| `flex-1` on `main` | both | `main` absorbs whatever the header/footer don't use — this is what makes "the main size can be changed" work with one template. |
| `min-h-0` on `main` | fixed | **The classic trap.** Flex children default to `min-height: auto`, so an overflowing `main` stretches the layout instead of scrolling. `min-h-0` lets it actually shrink so `overflow-y-auto` kicks in. |
| `overflow-y-auto` on `main` | fixed | Long content scrolls *inside* main while header/footer stay pinned. Drop this if fixed pages will never overflow. |
| `shrink-0` on header/footer | both | Stops flexbox from squashing them when main's content is tall. |
| `dvh` not `vh`/`screen` | both | `100vh` overshoots on mobile because of the collapsing browser URL bar; `dvh` tracks the *dynamic* viewport. (Tailwind ≥ 3.4; if older, keep `min-h-screen`/`h-screen`.) |

## 5. Adding a page later = 3 lines

```js
{ path: 'projects', name: 'projects',
  component: () => import('../views/ProjectsView.vue'),
  meta: { fullHeight: true } }   // pick the mode per page, done
```

No layout edits, no CSS, no remembering wrapper classes. And if you ever need a *third* mode (say, full-height *and* no main padding), grow the meta into `meta: { layout: 'fixed' | 'auto' | ... }` and map it to classes in the layout — the PDF's `meta.layout` example on pp. 27–28 is that same pattern one level up.

## 6. Multiple layouts: `/` public, `/admin` admin, etc.

The same pattern scales to any number of layouts: **each layout is one top-level parent route**, and pages live in its `children`. The routes array becomes a list of layout "zones":

```
routes array
├── path: '/'        → PublicLayout   ── children: home, contact, projects…
├── path: '/admin'   → AdminLayout    ── children: dashboard, users, settings…
└── path: '/auth'    → AuthLayout     ── children: login, register…   (blank/centered)
```

```js
// router/index.js
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ── Public zone ──────────────────────────────────────────────
    {
      path: '/',
      component: PublicLayout,
      children: [
        { path: '',        name: 'home',    component: HomeView,
          meta: { fullHeight: false } },
        { path: 'contact', name: 'contact',
          component: () => import('../views/AboutView.vue'),
          meta: { fullHeight: true } },
      ],
    },

    // ── Admin zone ───────────────────────────────────────────────
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'), // lazy: admins only
      meta: { requiresAuth: true },     // ← inherited by ALL children
      children: [
        { path: '',      name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue') },
        { path: 'users', name: 'admin-users',
          component: () => import('../views/admin/UsersView.vue') },
      ],
    },

    // ── Auth zone (no header/footer at all) ──────────────────────
    {
      path: '/auth',
      component: () => import('../layouts/AuthLayout.vue'),
      children: [
        { path: 'login', name: 'login',
          component: () => import('../views/auth/LoginView.vue') },
      ],
    },
  ],
})
```

Each layout is just a component with its own chrome around a `<router-view />` — `AdminLayout` might be a sidebar + topbar grid, `AuthLayout` might be nothing but a centered card:

```vue
<!-- layouts/AuthLayout.vue — minimal example -->
<template>
  <div class="min-h-dvh flex items-center justify-center">
    <RouterView />   <!-- login/register card renders here -->
  </div>
</template>
```

Why this structure pays off:

- **Navigation inside a zone never re-mounts the layout** (sidebar scroll position, open menus, theme state all survive); navigation *between* zones swaps the whole layout, which is what you want.
- **`meta` on the parent is inherited by children.** Putting `meta: { requiresAuth: true }` on `/admin` protects every admin page with a single navigation guard (the PDF's meta + guards pattern, pp. 26–28) — no need to repeat it per route:

  ```js
  router.beforeEach((to) => {
    // to.meta merges parent + child meta, so any /admin/* child triggers this
    if (to.meta.requiresAuth && !isLoggedIn()) {
      return { name: 'login' }
    }
  })
  ```

- **Lazy-loading the layout itself** (`() => import('../layouts/AdminLayout.vue')`) keeps the admin bundle — layout, sidebar, charts — out of what public visitors download. The PDF's chunk-grouping tip (pp. 30–32) applies here: give all admin imports the same chunk name if you want one admin.js file.
- The per-route height trick from §2–4 stays a *public-layout concern* — `AdminLayout` can use a completely different strategy (e.g. always-fixed with an internally scrolling content pane) without touching public pages.

One ordering note: if you add a catch-all 404 (`path: '/:pathMatch(.*)*'`, PDF p. 40), register it **last** at the top level so it only matches when no zone claimed the URL.

## 7. Alternative you'll see in the wild (and why it wasn't picked)

The PDF (p. 28) also shows `<component :is="layoutComponent">` in App.vue, selecting a whole layout component from `meta.layout`. It reads nicely, but the nested-routes approach from §6 is better for zone-shaped apps: with `<component :is>` every route must remember to declare its `meta.layout` (forget it and the page renders in the wrong layout), and switching layouts tears down/remounts more aggressively. Nested parents give you the same result with the grouping, meta inheritance, and lazy-loading benefits above. `<component :is>` earns its keep mainly when the *same URL* must switch layouts dynamically (e.g. a preview mode) — rare in practice.

## 8. Practical A→Z example: 2 layouts × 2 pages each

Everything below is a complete, working setup. Copy it file by file and you have:

| URL | Layout | Page | Height mode |
|---|---|---|---|
| `/` | PublicLayout (header + footer) | HomeView | auto — page grows, body scrolls |
| `/contact` | PublicLayout (header + footer) | ContactView | fixed — one viewport, main scrolls inside |
| `/admin` | AdminLayout (sidebar + topbar) | DashboardView | always fixed (admin apps rarely body-scroll) |
| `/admin/users` | AdminLayout (sidebar + topbar) | UsersView | always fixed |

### Step 1 — File tree (7 new files, 2 edited)

```
client/src/
├── main.js                        (unchanged)
├── App.vue                        ✏ EDIT  → shell only
├── router/
│   └── index.js                   ✏ EDIT  → 2 parent routes
├── layouts/
│   ├── PublicLayout.vue           ★ NEW
│   └── AdminLayout.vue            ★ NEW
├── components/public/
│   ├── Navbar.vue                 (unchanged)
│   └── Footer.vue                 ★ NEW
└── views/
    ├── HomeView.vue               ✏ EDIT  → drop its <main>
    ├── ContactView.vue            ★ NEW  (or rename AboutView)
    └── admin/
        ├── DashboardView.vue      ★ NEW
        └── UsersView.vue          ★ NEW
```

### Step 2 — `router/index.js` (the whole map in one file)

```js
import { createRouter, createWebHistory } from 'vue-router'
import PublicLayout from '../layouts/PublicLayout.vue'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ═══ ZONE 1: public ═══════════════════════════════════════
    {
      path: '/',
      component: PublicLayout,          // eager: every visitor needs it
      children: [
        {
          path: '',                     // default child → matches "/"
          name: 'home',
          component: HomeView,          // eager: landing page, no delay
          meta: { fullHeight: false, title: 'Home' },
        },
        {
          path: 'contact',              // no leading slash!
          name: 'contact',
          component: () => import('../views/ContactView.vue'),
          meta: { fullHeight: true, title: 'Contact' },
        },
      ],
    },

    // ═══ ZONE 2: admin ════════════════════════════════════════
    {
      path: '/admin',
      component: () => import('../layouts/AdminLayout.vue'), // lazy zone
      meta: { requiresAuth: true },     // inherited by every child below
      children: [
        {
          path: '',                     // default child → matches "/admin"
          name: 'admin-dashboard',
          component: () => import('../views/admin/DashboardView.vue'),
          meta: { title: 'Dashboard' },
        },
        {
          path: 'users',                // → matches "/admin/users"
          name: 'admin-users',
          component: () => import('../views/admin/UsersView.vue'),
          meta: { title: 'Users' },
        },
      ],
    },
  ],
})

// One guard protects the whole admin zone (meta inherited from parent)
router.beforeEach((to) => {
  const isLoggedIn = true   // TODO: replace with real auth check
  if (to.meta.requiresAuth && !isLoggedIn) {
    return { name: 'home' } // or a future { name: 'login' }
  }
})

// Bonus from the PDF (p. 29): page titles from meta
router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} · madebyjoao`
    : 'madebyjoao'
})

export default router
```

### Step 3 — `App.vue` (the shell)

```vue
<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <RouterView />
</template>
```

That's the entire file. The top-level `<RouterView/>` renders whichever *layout* matched; each layout's own `<RouterView/>` renders the page.

### Step 4 — `layouts/PublicLayout.vue`

```vue
<script setup>
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import Navbar from '@/components/public/Navbar.vue'
import Footer from '@/components/public/Footer.vue'

const route = useRoute()
const fullHeight = computed(() => route.meta.fullHeight === true)
</script>

<template>
  <div
    class="flex flex-col"
    :class="fullHeight ? 'h-dvh overflow-hidden' : 'min-h-dvh'"
  >
    <header class="shrink-0 flex w-full md:items-center md:justify-around">
      <img alt="Logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />
      <Navbar />
    </header>

    <main class="flex-1" :class="fullHeight ? 'min-h-0 overflow-y-auto' : ''">
      <RouterView />
    </main>

    <Footer />
  </div>
</template>
```

### Step 5 — `layouts/AdminLayout.vue` (different shape entirely: sidebar grid)

```vue
<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <!-- Always viewport-locked: h-dvh + overflow-hidden, no meta needed -->
  <div class="h-dvh overflow-hidden grid grid-cols-[220px_1fr] grid-rows-[auto_1fr]">

    <!-- Sidebar spans both rows -->
    <aside class="row-span-2 flex flex-col gap-2 p-4 bg-zinc-900 text-zinc-100">
      <p class="font-bold mb-4">Admin</p>
      <RouterLink :to="{ name: 'admin-dashboard' }">Dashboard</RouterLink>
      <RouterLink :to="{ name: 'admin-users' }">Users</RouterLink>
      <RouterLink :to="{ name: 'home' }" class="mt-auto">← Back to site</RouterLink>
    </aside>

    <!-- Topbar -->
    <header class="flex items-center justify-end gap-4 px-6 py-3 border-b">
      <span>joao@madebyjoao.fr</span>
    </header>

    <!-- Content pane: THIS scrolls, not the body -->
    <main class="min-h-0 overflow-y-auto p-6">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
/* PDF p. 7: Vue Router adds .router-link-active automatically */
aside a.router-link-exact-active {
  font-weight: 700;
}
</style>
```

Note what just happened: the admin zone uses **grid instead of flex, no footer, no `fullHeight` meta** — completely different skeleton — and nothing in the public zone knows or cares. That's the payoff of layouts-as-parent-routes.

### Step 6 — `components/public/Footer.vue`

```vue
<template>
  <footer class="shrink-0 flex items-center justify-center py-4 text-sm">
    <p>© 2026 madebyjoao</p>
  </footer>
</template>
```

### Step 7 — The four views (pages stay dumb on purpose)

```vue
<!-- views/HomeView.vue — auto mode: make it long, the BODY scrolls -->
<script setup>
import TheWelcome from '../components/TheWelcome.vue'
</script>

<template>
  <!-- no <main> wrapper: the layout owns <main> -->
  <TheWelcome />
</template>
```

```vue
<!-- views/ContactView.vue — fixed mode: fills the leftover viewport -->
<template>
  <!-- h-full works because parent <main> has a definite height in fixed mode -->
  <div class="h-full flex items-center justify-center">
    <form class="w-full max-w-md flex flex-col gap-4 p-6">
      <h1 class="text-2xl font-bold">Contact</h1>
      <input class="border p-2" type="email" placeholder="you@example.com" />
      <textarea class="border p-2" rows="5" placeholder="Your message…" />
      <button class="border p-2" type="submit">Send</button>
    </form>
  </div>
</template>
```

```vue
<!-- views/admin/DashboardView.vue -->
<template>
  <h1 class="text-2xl font-bold mb-4">Dashboard</h1>
  <p>Stats, charts, etc.</p>
</template>
```

```vue
<!-- views/admin/UsersView.vue — long list to prove the INNER scroll works -->
<script setup>
const users = Array.from({ length: 60 }, (_, i) => `user-${i + 1}@example.com`)
</script>

<template>
  <h1 class="text-2xl font-bold mb-4">Users</h1>
  <ul class="flex flex-col gap-1">
    <li v-for="u in users" :key="u" class="border-b py-1">{{ u }}</li>
  </ul>
</template>
```

### Step 8 — Point `Navbar.vue` links at named routes

```vue
<!-- components/public/Navbar.vue — swap string paths for names (PDF pp. 22-23:
     rename a URL later and every link keeps working) -->
<RouterLink :to="{ name: 'home' }">Home</RouterLink>
<RouterLink :to="{ name: 'contact' }">Contact</RouterLink>
```

### Step 9 — Verify (what you should see at each URL)

Run `npm run dev` inside `client/` and check:

1. **`/`** — header + footer present. If content is long, the whole page scrolls and the footer sits at the very bottom of the *content*. If short, footer still hugs the bottom of the *viewport* (`min-h-dvh` at work).
2. **`/contact`** — header + footer both visible, **no body scrollbar**, form vertically centered in the leftover space. Shrink the window: the form area shrinks, footer never disappears.
3. **`/` ⇄ `/contact`** — watch the theme button / header: it must **not** flicker or reset, because PublicLayout is never re-mounted (same parent route).
4. **`/admin`** — sidebar + topbar appear, public header/footer are gone. Check the Network tab on first visit: `AdminLayout` + `DashboardView` chunks load *only now* (lazy zone).
5. **`/admin/users`** — the 60-row list scrolls **inside the content pane**; sidebar and topbar stay pinned. The sidebar's "Users" link is bold (`router-link-exact-active`).
6. **Guard test** — flip `isLoggedIn` to `false` in the router: any `/admin/*` URL now bounces to home, including `/admin/users` directly pasted in the address bar (meta inheritance).

---

**TL;DR** — Make `PublicLayout.vue` a parent route with `children` (PDF's nested-routes pattern), reduce App.vue to `<RouterView/>`, and flag each child route with `meta.fullHeight`. The layout reads that flag and toggles between `min-h-dvh` (home: grows, body scrolls) and `h-dvh overflow-hidden` with a `flex-1 min-h-0 overflow-y-auto` main (other pages: viewport-locked, footer always visible). For more zones (admin, auth…), add more parent routes — one layout each, children inside, shared `meta` on the parent. Section 8 has a complete copy-paste example of all of it.
