# Projects Pipeline — Reference Guide

**madebyjoao.fr** — how project data flows from `projects.js` to the screen,
and the exact migration path to an API when the time comes.

Every section carries its *why*. Skim the code, read the reasons.

---

## Part I — The pipeline as built

### 1. The big picture

```
projects.js ──import──▶ HomeWork.vue      (grid of cards)
     │
     └────import──▶ ProjectView.vue       (one case study, found by slug)

Card click ──▶ RouterLink { name:'project', params:{ slug } }
          ──▶ URL /work/:slug
          ──▶ router renders ProjectView inside PublicLayout
          ──▶ ProjectView reads route.params.slug ──▶ .find() in projects.js
```

One file, two consumers, and a slug that makes a round trip:
**data → link → URL → lookup → same data.**

Why this shape: *single source of truth.* The grid and the detail page can never
disagree about a project, because there is nothing to disagree about — one truth,
two readers. Adding a project = adding one object. Nothing else changes.

---

### 2. The data file — `src/data/projects.js`

```js
export const projects = [
  {
    slug: 'madebyjoao',            // URL identity — readable, shareable, SEO
    title: 'madebyjoao.fr',
    client: 'Projet personnel',
    year: 2026,
    summary: "Le site que vous êtes en train de lire — conçu, développé et hébergé de A à Z.",
    services: ['design sur mesure', 'développement', 'hébergement'],
    stack: ['vue 3', 'tailwind 4', 'node'],
    story: {
      contexte: "…",
      besoin:   "…",
      approche: "…",
      resultat: "…",
    },
    link: 'https://madebyjoao.fr',
  },
]
```

**Field-by-field, with reasons:**

| Field | Why it exists |
|---|---|
| `slug` | The project's *identity in the URL*. Readable slugs (`/work/madebyjoao`, not `/work/3`) are shareable, indexable, and on-brand — an engineer's URLs are legible. Never change a slug after publishing: it's the public address. |
| `title` | Display name everywhere. |
| `client` | Speaks to the audience: French SMB owners read "who was this for", not "what framework". |
| `year` | Cheap credibility + sorting key later. |
| `summary` | The card's one-liner. Written for a non-technical reader. |
| `services` | Client-vocabulary tags (`site vitrine · hébergement`). Mirrors the services section — the offer and the proof speak the same language. |
| `stack` | Dev-vocabulary, deliberately demoted to a mono microlabel. Texture for the occasional technical reader; invisible weight for everyone else. |
| `story` | The case-study body in four beats — *contexte → besoin → approche → résultat*. The universal shape of a convincing case study: what they had, what they needed, what you did, what changed. Written as a client story a prospect can read themselves into. |
| `link` | Live URL, opens in a new tab. |

**Killed fields and why:** `role` (assumes team projects — noise for a solo
full-service dev).

**Build-time consequence:** because `projects.js` is an ES module, Vite bakes the
data *into the JS bundle*. Zero loading states, zero network failures, zero
latency — the data exists before the first render. This is a real architectural
property, not a primitive workaround. You give it up *knowingly* when migrating.

---

### 3. The route — `src/router/index.js`

```js
{
  path: 'work/:slug',                 // no leading slash: nested under PublicLayout
  name: 'project',
  component: () => import('../views/ProjectView.vue'),
  meta: { fullHeight: false, title: 'Work' },
},
```

**Why each choice:**

- **`:slug` param** — one route answers *every* project URL. One component,
  N projects; only the data varies.
- **`name: 'project'`** — links navigate by name
  (`:to="{ name: 'project', params: { slug } }"`), never by string-built paths.
  If the path ever changes (`/work/` → `/projets/`), every link in the codebase
  follows automatically. URL structure declared in exactly one place.
- **Lazy import** — a landing visitor who never clicks a project never downloads
  the project page. Note: this is *one* chunk for *all* projects — the component
  is shared, the data is already in the main bundle.
- **`meta.fullHeight: false`** — a case study is a scrolling document, not a
  viewport moment.

**Division of labor with the 404 (important):**
`/work/banana` **matches** this route — the router only checks *shape*
(does the URL fit a pattern?). Whether the slug names real data is an
*existence* question, and existence is the **view's** job. Router owns shape;
view owns existence.

---

### 4. Consumer 1 — `HomeWork.vue` (the grid)

```vue
<script setup>
import { projects } from '@/data/projects'
</script>
```

```vue
<RouterLink
  v-for="(project, i) in projects"
  :key="project.slug"
  :to="{ name: 'project', params: { slug: project.slug } }"
  class="group block bg-surface-raised border border-line …"
>
```

- `v-for` over the imported array — the grid *is* the data file, rendered.
- `:key="project.slug"` — slugs are unique by construction; the natural key.
- The whole card is the link (`block` on a `RouterLink`) — bigger hit target,
  and the browser treats it as a real link (middle-click, right-click work).
- Index label derived from position (`String(i + 1).padStart(2, '0')`) —
  *derive, don't duplicate*: reorder projects and numbers follow.

---

### 5. Consumer 2 — `ProjectView.vue` (the case study)

The reactive spine — three organs working as one:

```js
// 1. LOOKUP — computed, not a one-time const
const project = computed(() =>
  projects.find((p) => p.slug === route.params.slug),
)

// 2. CONSEQUENCES — re-run whenever the lookup changes
watchEffect(() => {
  if (!project.value) {
    router.replace({ name: 'not-found' })
  } else {
    document.title = `${project.value.title} — madebyjoao`
  }
})
```

```vue
<!-- 3. PROTECTION -->
<article v-if="project" …>
```

**Why `computed` and not `const project = projects.find(…)`:**
navigating `/work/a` → `/work/b` does **not** remount the component — Vue Router
*reuses* it; only `route.params.slug` changes. A one-time lookup at setup would
show project A forever. The computed re-derives on every slug change.
> This is the single most common dynamic-route bug in Vue. Remember it.

**Why `watchEffect`:** it automatically subscribes to whatever reactive values it
reads (here: `project`). Slug changes → computed changes → effect re-runs.
Lookup and consequences stay in sync with zero manual wiring.

**Why `router.replace` and not `push`:** `push` adds the dead URL to history —
the back button would return the visitor to the broken link that just ejected
them. `replace` overwrites it: back goes to where they actually *were*.
Precision extends to history entries.

**Why the `v-if` guard:** between a bad slug arriving and the redirect landing,
there is one render tick where `project` is `undefined`. Without the guard, that
tick throws on `project.title`. The watchEffect decides *where to go*; the
`v-if` keeps the component honest *while going*. They are a pair — never ship
one without the other.

---

### 6. Edge cases handled

| Case | What happens | Owner |
|---|---|---|
| Click a card | Named-route push, client-side render, header/footer never move | Router |
| Direct visit / shared link `/work/madebyjoao` | Server rewrite serves `index.html`, router resolves, view finds slug | `.htaccess` + router |
| `/work/banana` | Route matches (shape ✓), lookup fails (existence ✗) → `replace` to 404 | View |
| Back after 404 redirect | Skips the dead URL (thanks to `replace`) | View |
| `/work/a` → `/work/b` | Component reused, computed re-derives, title updates | View |

### 7. Test loop (run after any change to the pipeline)

1. Home → travaux card visible, numbered, tags rendered
2. Click → case study renders, tab title = `madebyjoao.fr — madebyjoao`
3. Back → home, correct scroll position
4. Type `/work/banana` → branded 404
5. Back from 404 → does **not** revisit `/work/banana`
6. Hard-refresh on `/work/madebyjoao` (production) → renders (rewrite works)

---

## Part II — Migration to an API

### 0. The gate — when to migrate (and when not to)

**Trigger:** *content must change without a redeploy.* Concretely: the day the
admin dashboard lets you add a project from a browser.

**Not triggers:** "APIs are more professional", "hard-coded feels wrong".
For a portfolio updated a few times a year, the file **is** the right backend:
git-versioned, zero latency, zero failure modes. Editing a file and pushing is a
CMS workflow many paid CMSes can't match.

### 1. The iron rule — the schema is the contract

The API returns **exactly the JSON shape of today's objects**. Same fields,
same nesting, same names.

**Why this is the whole migration strategy:** the components only ever consumed
the *shape*. Keep the shape, and templates need **zero changes** — only the
*source* swaps. You have been programming against the API contract since the day
`projects.js` was designed; the server just has to honor it.

### 2. The server side — two routes on the existing Express app

```js
// server — alongside the /api/contact endpoint
import { projects } from './data/projects.js'   // storage v1: same file, moved server-side

app.get('/api/projects', (req, res) => {
  res.json(projects)
})

app.get('/api/projects/:slug', (req, res) => {
  const project = projects.find((p) => p.slug === req.params.slug)
  if (!project) return res.status(404).json({ error: 'not found' })
  res.json(project)
})
```

**Storage evolves behind the routes, invisibly to the frontend:**

| Stage | Storage | When |
|---|---|---|
| v1 | The same JS/JSON file, server-side | Day one of the API |
| v2 | SQLite | When the admin dashboard writes data |
| v3 | Postgres/whatever | Probably never — SQLite carries a portfolio forever |

The frontend never knows which stage you're on. That's the point of the
contract.

### 3. The frontend side — one import becomes one composable

```js
// src/composables/useProjects.js
import { ref } from 'vue'

const projects = ref(null)   // module-level = shared cache: fetched once per session
const error = ref(null)

export function useProjects() {
  if (!projects.value && !error.value) {
    fetch('/api/projects')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then((data) => (projects.value = data))
      .catch((e) => (error.value = e))
  }
  return { projects, error }
}
```

**Why the refs live at module level (outside the function):** every component
calling `useProjects()` shares the *same* refs. First caller triggers the fetch;
everyone else gets the cached result. Ten lines standing in for a state library
— the right amount of machinery at this scale.

**Consumer changes:**

```js
// HomeWork.vue + ProjectView.vue
// before
import { projects } from '@/data/projects'

// after
import { useProjects } from '@/composables/useProjects'
const { projects, error } = useProjects()
```

Templates: `v-for="project in projects"` still works (`projects` is now a ref —
Vue unwraps it in templates). Add the guards from §5.

### 4. ⚠️ The subtle bug — "not found" splits into two states

Today, `find()` → `undefined` means **doesn't exist**, and the watchEffect
redirects instantly.

With async data, `undefined` *also* means **hasn't arrived yet**. Migrate
naively and every direct visit to `/work/madebyjoao` bounces to the 404 in the
milliseconds before the fetch lands — the classic migration bug. It's a
*semantics* bug: one value encoding two meanings.

**Fix — redirect only when data has arrived AND the slug isn't in it:**

```js
const project = computed(() =>
  projects.value?.find((p) => p.slug === route.params.slug),
)

watchEffect(() => {
  if (projects.value && !project.value) {
    router.replace({ name: 'not-found' })
  } else if (project.value) {
    document.title = `${project.value.title} — madebyjoao`
  }
})
```

Read the condition out loud: *"the list is here, and it doesn't contain this
slug"* — only then is 404 the truth.

### 5. The UX bill — loading and error states

The bundled version rendered instantly; the fetched version has a gap, and the
gap needs clothes:

- **Loading:** skeleton blocks in the work grid — a few `bg-surface-raised`
  rectangles at reduced opacity. Machined, not spinner-y. On ProjectView,
  the existing `v-if="project"` already covers loading (renders nothing briefly).
- **Error:** visible and honest — `« Impossible de charger les projets. »` —
  because networks fail, and silence reads as breakage.

```vue
<!-- HomeWork.vue, sketch -->
<p v-if="error" class="text-ink-soft">Impossible de charger les projets.</p>
<div v-else-if="!projects" class="grid md:grid-cols-2 gap-8 mt-12">
  <div v-for="n in 2" :key="n" class="bg-surface-raised rounded-xs h-48 opacity-60"></div>
</div>
<div v-else class="grid …"><!-- real cards --></div>
```

### 6. Migration checklist

- [ ] Express: `GET /api/projects` + `GET /api/projects/:slug` returning the exact current shape
- [ ] Vite dev proxy already forwards `/api` → local Node (done in Phase 6)
- [ ] Create `useProjects.js` composable (module-level cache + error ref)
- [ ] Swap imports in `HomeWork.vue` and `ProjectView.vue`
- [ ] Fix the undefined-vs-not-found condition in ProjectView (§4 — do **not** skip)
- [ ] Loading skeletons + error states (§5)
- [ ] Delete `src/data/projects.js` from the client **last**, after everything works (strangler pattern: build alongside, reroute, then remove)
- [ ] Full test loop from Part I §7, plus: throttle to Fast 4G and watch the skeleton actually appear
- [ ] Kill the API locally and confirm the error state renders (unplug test)

### 7. The chapter after — write routes (future, do not build early)

The admin dashboard era adds `POST` / `PUT` / `DELETE /api/projects`. Those
**must** sit behind authentication — sessions vs tokens, login flow, guarding
the admin routes in the Vue router too. That is a full discussion of its own.
Rule until then: **the public API is read-only.** A GET-only API has a fraction
of the attack surface; keep it that way as long as possible.

---

*One truth, two readers, a slug that round-trips, and a contract that outlives
its storage. That's the whole machine.*
