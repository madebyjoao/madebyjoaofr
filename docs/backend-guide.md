# Backend Guide — Node/Express on o2switch

**madebyjoao.fr** — the server side: architecture, the contact/devis endpoint,
the security layers, and deployment. Written before the code exists so the code
can be written against it.

---

## 1. The shape of the deployment

Two artifacts live side by side on o2switch:

```
madebyjoao.fr/           ← static files: the Vite build (dist/)
madebyjoao.fr/api/…      ← Node app (Express), registered via cPanel "Setup Node.js App"
```

**Why same-domain (`/api`) and not `api.madebyjoao.fr`:** same-origin requests
sidestep CORS entirely. CORS is the browser rule that scripts from one origin
can't freely call another — it protects users from malicious pages poking other
sites' APIs with their cookies. Legitimate protection, pure ceremony for us.
Same origin = the whole problem never exists.

**Why Node and not PHP:** every hour spent on a Node endpoint compounds your
existing JavaScript skill; PHP hours are an island. And the backend is planned
to grow (projects API, admin dashboard) — growth wants your language.

**Division of responsibility:**

| Concern | Owner |
|---|---|
| Serving the site | Apache (static files + `.htaccess` rewrite) |
| `/api/*` | Express |
| TLS / HTTPS | o2switch (Let's Encrypt toggle in cPanel) |
| Sending mail | o2switch SMTP, through your own mailbox |

---

## 2. Dev setup — the proxy

```js
// vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000',   // wherever the local Express runs
    },
  },
})
```

**Why:** frontend code calls `/api/contact` — the *same relative URL* in dev and
production. In dev, Vite forwards it to the local Node process; in production,
the server routes it. No environment-dependent URLs sprinkled through
components. Same philosophy as the design tokens: the decision lives in one
place.

---

## 3. The app skeleton

```js
// server/index.js
import express from 'express'
import 'dotenv/config'                    // loads .env before anything reads it

const app = express()

app.use(express.json())                   // parse JSON bodies

// routes
app.use('/api/contact', contactRouter)
app.use('/api/projects', projectsRouter)  // when the pipeline migrates (see projects guide)

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`api on :${port}`))
```

**Laws at this layer:**

- **Secrets live in `.env`, loaded at startup, never in code, never in git.**
  Beyond hygiene: this repo is a portfolio — its code will be *shown to people*.
  A leaked credential reviews worse than any missing feature.
  `.env` goes in `.gitignore`; a committed `.env.example` documents the
  variable *names* with dummy values.
- **`PORT` from the environment** — cPanel's Node runner assigns one; hardcoding
  breaks deployment.

---

## 4. The contact/devis endpoint — a request's journey

Follow one devis from click to inbox. Every checkpoint exists for a reason.

### Stage 1 — the form submits (client side)

- Vue gathers structured fields: *type de projet, budget, délais, description* +
  optional sketch file.
- Files can't ride in JSON (JSON is text). The browser's envelope for mixed
  text-and-binary is **`multipart/form-data`** — build a `FormData` object,
  `fetch()` it.
- Client-side validation exists **for UX only** — fast, kind feedback.
  It protects nothing (anyone can `curl` raw bytes at the endpoint).

> **The law: client-side validation is a courtesy; server-side validation is
> security.** The server re-checks everything as if the frontend didn't exist.

### Stage 2 — the border checkpoint (server side)

```js
import multer from 'multer'
import { fileTypeFromBuffer } from 'file-type'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },      // 10 MB ceiling — sketches don't need more
})

router.post('/', upload.single('sketch'), async (req, res) => {
  // 1. honeypot — hidden field humans never see; bots fill every field
  if (req.body.website) return res.status(200).json({ ok: true })  // silent drop

  // 2. field validation — presence, lengths, email shape
  const { name, email, projectType, budget, message } = req.body
  if (!name || !email || !message /* … */) {
    return res.status(400).json({ error: 'champs manquants' })
  }

  // 3. file validation — by CONTENT, not by name
  if (req.file) {
    const type = await fileTypeFromBuffer(req.file.buffer)
    const allowed = ['image/png', 'image/jpeg', 'application/pdf']
    if (!type || !allowed.includes(type.mime)) {
      return res.status(400).json({ error: 'format de fichier non accepté' })
    }
  }

  // … stage 3: send the mail
})
```

**Why each check:**

- **Honeypot, silently dropped:** an extra input hidden with CSS. Humans never
  see it; bots fill every field. Respond `200` so the bot believes it succeeded
  and doesn't adapt. Beats most drive-by spam for zero user friction.
- **Magic numbers, not filenames:** `file-type` reads the file's actual leading
  bytes. Filenames and claimed MIME types are just strings the sender typed —
  `hack.php` renamed `photo.png` lies in both. Content doesn't.
- **Size ceiling in multer, not after:** the limit applies *while receiving* —
  an oversized upload is cut off, not buffered then rejected.
- **A file upload field is an open door cut into the server.** These ~15 lines
  are the difference between a form and a vulnerability.

### Stage 3 — rate limiting

```js
import rateLimit from 'express-rate-limit'

const contactLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 })
router.use(contactLimiter)
```

**Why:** humans send one inquiry; scripts send four hundred. Five per IP per
hour inconveniences nobody legitimate. CAPTCHAs stay in reserve — they tax
every real client to punish bots; wrong trade for this traffic.

### Stage 4 — the mail leaves

```js
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,        // o2switch SMTP
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,      // joao@madebyjoao.fr
    pass: process.env.SMTP_PASS,
  },
})

await transporter.sendMail({
  from: `"madebyjoao.fr" <${process.env.SMTP_USER}>`,
  to: process.env.SMTP_USER,
  replyTo: email,                     // reply lands with the client, one click
  subject: `Devis — ${projectType} — ${name}`,
  text: formatAsSpecSheet(req.body),  // structured fields → readable spec sheet
  attachments: req.file
    ? [{ filename: `croquis-${Date.now()}.${ext}`, content: req.file.buffer }]
    : [],
})
```

**Why SMTP through your own mailbox, not fire-and-forget:** deliverability.
Mail servers judge mail by whether the sending server is *authorized* for the
domain (SPF/DKIM — o2switch configures these with the mailbox). Send properly →
inbox. Send crookedly → your own devis notifications rot in spam.

**Why `replyTo`:** hitting "répondre" in your mail client addresses the client
directly. Small; saves a copy-paste on every single inquiry forever.

**Why randomized attachment names:** never store or forward a user-chosen
filename — names can carry path tricks and script extensions.

### Stage 5 — the response

- Success: `200` + `{ ok: true }` → the form shows `RECEIVED — 200 OK` (the
  status code as UI copy: the brand, for free).
- Validation failure: `400` + a human-readable French message.
- Server failure (SMTP down): `500` + generic message. **Log the real error
  server-side; never leak internals to the client.**

---

## 5. Security posture — the whole list

| Layer | Mechanism | Costs the user |
|---|---|---|
| Spam | Honeypot (silent drop) | Nothing |
| Flood | Rate limit 5/h/IP | Nothing |
| Malicious files | Magic-number check + type allowlist + 10 MB cap | Nothing |
| Injection-ish | Field validation, lengths, no user data in shell/paths | Nothing |
| Secrets | `.env` + gitignore | Nothing |
| Transport | HTTPS (Let's Encrypt, forced) | Nothing |
| Attack surface | Public API is **read-only + one POST**. Write routes don't exist until auth does. | Nothing |

Every layer is invisible to visitors and legible to any developer reading the
code. Pixel-perfection below the waterline.

---

## 6. Deployment on o2switch

1. **Mailbox first:** create `joao@madebyjoao.fr` in cPanel. Note SMTP host +
   credentials → server `.env`.
2. **HTTPS:** Let's Encrypt toggle in cPanel. Then force it (redirect
   HTTP→HTTPS in `.htaccess`) — browsers mark plain-HTTP forms "Not secure",
   fatal on a page asking for project details.
3. **Frontend:** `npm run build` → upload `dist/` contents to the site root.
4. **The SPA rewrite** (`.htaccess` at the root):

   ```apache
   RewriteEngine On
   # api passes through to the Node app
   RewriteCond %{REQUEST_URI} ^/api [NC]
   RewriteRule ^ - [L]
   # existing files serve normally
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteCond %{REQUEST_FILENAME} !-d
   # everything else → index.html (history-mode routing)
   RewriteRule ^ index.html [L]
   ```

   **Why:** `/work/:slug` exists only inside the app. On refresh or shared
   link, Apache would 404 — this tells it "unknown paths are the app's
   problem." Without it, every deep link is broken.
5. **Node app:** cPanel → *Setup Node.js App* → point at the server folder,
   set the startup file, add env variables, route `/api` to it.
6. **The proof:** send a real devis with attachment from the live site.
   Confirm: lands in inbox (not spam), reply-to works, attachment opens.

---

## 7. Test checklist (server)

- [ ] Empty form → `400`, French message
- [ ] Valid form, no file → mail arrives, spec-sheet formatted
- [ ] Valid form + PNG/JPG/PDF → attachment arrives, randomized name
- [ ] `hack.php` renamed `photo.png` → rejected (magic numbers)
- [ ] 11 MB file → rejected cleanly
- [ ] Honeypot filled → `200`, **no** mail
- [ ] 6th submission in an hour → `429`
- [ ] SMTP creds wrong → `500`, client sees generic message, real error logged
- [ ] Refresh on `/work/:slug` in production → renders (rewrite works)
- [ ] `curl` the endpoint directly, bypassing the form → all checks still hold

---

*The server's job is boring on purpose: validate like the frontend doesn't
exist, send mail like deliverability matters, and refuse everything else.*
