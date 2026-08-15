# LAUNCH.md — putting the back office into production

What's left before Creaciones Baby can run its real inventory on this system, in the order
it should be done. Every item says *why* it matters, not just *what*.

**Scope:** an internal back office — inventory control, sales tracking and reporting — for a
single operator. There is no storefront; selling happens on an external platform and those
sales are recorded here as another channel. So there's no payment gateway to integrate, no
customer data to protect beyond a name and phone on a sale, and no public attack surface:
every route needs a token.

That makes this launch much smaller than a shop's would be. It comes down to three things:
don't lose the data, don't let anyone else in, and put it somewhere that runs without your
laptop being open.

Anything marked **BLOCKER** should be done before real business data goes in. The rest can
follow.

---

## The one that matters more than all the others

### 🔴 BLOCKER — There are no backups

Right now the entire sales and financial history would live in a Podman volume on one Mac.
If that disk fails, is stolen, or the volume gets pruned by a stray `podman system prune`,
**everything is gone and there is no second copy**. Every other item on this list is
recoverable; this one isn't.

Two parts, and the second is the one people skip:

1. **Automated daily dumps, off the machine.** `pg_dump` on a schedule, written somewhere
   that isn't the same disk — a managed provider's built-in backups (see hosting below), or a
   cron job pushing to cloud storage. Keep at least 30 days.
2. **A restore you have actually performed.** An untested backup is a guess. Restore last
   night's dump into a scratch database and confirm the sales totals match. Do this once now,
   then once a quarter. Put the date you last tested it somewhere visible.

Effort: an afternoon if you pick a host with managed backups; the tested restore is 30 minutes.

---

## Phase 0 — Before real data goes in

### 🔴 BLOCKER — Tokens never expire

`app.jwt.sign({ sub, role })` in `backend/src/routes/auth.js` has no `expiresIn`, so a token
is valid forever. Combined with the token being stored in `localStorage`, one leaked token
(a borrowed laptop, a browser left open at a fair) is permanent access to the business's
finances with no way to revoke it.

Fix: sign with an expiry (`{ expiresIn: '7d' }` is reasonable for a tool you use daily), and
have the frontends send the user back to the login screen on a 401 — the response
interceptors already clear the token, they just need to redirect.

Related, same file: **the role is baked into the token**. If you ever demote an account, the
old token keeps its old role until it expires. With an expiry set this becomes a bounded
problem instead of a permanent one. If you'd rather it be immediate, read the role from the
database in the `authenticate` decorator instead of from the token.

Effort: ~1 hour including the frontend redirect.

### 🔴 BLOCKER — The login endpoint has no rate limiting

`POST /auth/login` will accept unlimited attempts. bcrypt makes each guess slow, but nothing
stops a script from running for a week. There are also no request size limits, so a large
body can tie up the server.

Fix: `@fastify/rate-limit` (strict on `/auth/*`, looser globally) plus Fastify's
`bodyLimit`. Add `@fastify/helmet` for security headers while you're in there.

Effort: ~1 hour.

### 🔴 BLOCKER — Production secrets

`backend/.env.example` ships `JWT_SECRET="change-me"` and the local database password is
`creaciones_dev_pw`. Neither can go to production.

- Generate a real secret: `openssl rand -base64 48`.
- Use a distinct, strong database password.
- Confirm `.env` is gitignored on every app (it is today — keep it that way).
- Change the seeded admin password. `admin@creacionesbaby.test` / `admin12345` is fine for a
  laptop, not for the internet. With one operator this single account **is** the security
  boundary — treat it accordingly.

Effort: 20 minutes.

### 🟠 Two simultaneous sales could oversell the same unit

`POST /sales` reads product stock *before* opening its transaction, then writes the computed
result inside it. Two sales of the last unit at the same moment can both read `stock: 1` and
both succeed, leaving `stock: -1`... or rather, leaving one sale's decrement silently
overwritten by the other's.

For a one-person system this is close to impossible — it needs two saves within
milliseconds. It becomes real the day a second person is added, or the day sales start
arriving automatically from the external platform. The clean fix is an atomic conditional update
(`updateMany({ where: { id, stock: { gte: qty } }, data: { stock: { decrement: qty } } })`)
and treating a zero-row result as the 409, which removes the read-then-write gap entirely.

Effort: ~2 hours including tests.

### 🟠 Reports bucket days in UTC

The daily series buckets with `toISOString()`, which is UTC. Guatemala is UTC-6, so anything
timestamped after 6pm local lands on the next day's figures. Sales you enter by hand carry a
date you picked, so they're fine; this bites any sale whose `soldAt` comes from a timestamp
rather than a date field — which is exactly what a sync from the external platform would
produce.

Fix by bucketing in `America/Guatemala` rather than UTC, and set `TZ=America/Guatemala` on
the server so the logs agree.

Effort: ~1 hour.

---

## Phase 1 — Deploy

### Recommended hosting

For a business this size, the priority is *not thinking about servers*. Suggested stack:

| Piece | Service | Rough cost |
|---|---|---|
| PostgreSQL | **Neon** or **Render Postgres** — managed, with automated backups and point-in-time restore on the paid tier | $0–19/mo |
| API (`backend/`) | **Render** Web Service, or **Railway** | ~$7/mo |
| Admin app | **Cloudflare Pages** or **Netlify** — static build | free |
| Domain + TLS | Your registrar + the platform's automatic certificates | ~$15/yr |

**Total: roughly $10–25/month.** A VPS you manage yourself would be cheaper (~$6/mo) but you
become responsible for patching, TLS renewal and backups — not a good trade when the thing
being protected is your accounting.

Whichever you pick, the non-negotiable is that **the database provider does automated backups
you can restore from**. That's the main reason to prefer managed Postgres over running it
yourself.

### What needs building for deployment

Nothing exists for this today — the Podman container is Postgres only, the Fastify app has no
container and no deploy configuration.

- A `Dockerfile` for `backend/` (or a Render/Railway build command — those platforms can run
  a Node service without one).
- Migrations applied on deploy: `npx prisma migrate deploy` as a release step, never
  `migrate dev` in production.
- Environment variables set on the platform, not in a file.
- `CORS_ORIGIN` updated to the real domain. Right now it's `localhost`. **If you forget this,
  the app will silently fail to reach the API.**
- `VITE_API_URL` set at build time.
- Worth considering: put the admin app behind Cloudflare Access, or at least an
  unguessable subdomain. It's an internal tool — there's no reason for it to be discoverable.
- HTTPS everywhere — free and automatic on all the platforms above, but confirm it, because
  a login form over plain HTTP hands the password to anyone on the same wifi.
- A health check pointed at the existing `GET /health`.

Effort: 1–2 days for someone who has deployed a Node app before; longer the first time.

### Access

Decide who gets an account before you deploy, and create them with `npm run seed:admin` or
through the portal's registration. **There is no password reset flow** — if a password is
lost, an admin has to reset it directly in the database. That's acceptable for one or two
people; if the team grows past that, it needs building.

---

## Phase 2 — First weeks of real use

These aren't blockers, but they're what turns "it works" into "I trust it".

- **Load your real catalog, with costs.** There's no sample data and no CSV import yet, so
  this is typing. Until every product has a cost the margin figures are inflated —
  `/inventario` has a "Sin costo registrado" filter to work through them. Highest-value hour
  you can spend after launch. If the catalog is large, build the CSV import first and save
  yourself the typing.
- **Enter a month of history.** The reports only know what's in them. Backdating a few weeks
  of past sales makes the first month's numbers meaningful instead of misleadingly empty.
- **Uptime monitoring.** A free checker (UptimeRobot or similar) hitting `/health` every five
  minutes, alerting to WhatsApp or email. Otherwise you find out the API is down when you're
  standing at a fair trying to record a sale.
- **Log retention.** Fastify logs to stdout; whichever platform you choose will keep them for
  a few days. That's enough for a shop this size.
- **CI.** A GitHub Action running `npm test` and both `oxlint`/`build` passes on every push.
  Cheap to set up, and it stops a broken deploy before it happens.
- **Ask your accountant about electronic invoicing.** Guatemala's SAT requires *Factura
  Electrónica en Línea* (FEL), and the obligation now extends to pequeños contribuyentes.
  This system records sales for your own management — it does **not** issue tax documents, and
  nothing in it should be treated as a substitute for whatever SAT requires of you. Worth
  confirming your situation with an accountant, and worth knowing that FEL integration is a
  substantial piece of work if you later want the two connected. I'm not an accountant and
  this isn't tax advice — please verify it with someone who is.

---

## Known limitations, accepted for now

Documented so nobody rediscovers them as bugs. None of these block launch at this scale.

- **`GET /sales` queries twice** — once for the page, once over the whole filtered set to
  compute totals that don't change as you paginate. Fine for thousands of sales; revisit if
  it ever reaches tens of thousands.
- **Money is summed as JavaScript floats.** Displayed values are rounded to two decimals so
  you'll never see a wrong number, but exact-equality comparisons on totals aren't safe.
  Integer cents would be the rigorous fix.
- **COGS and expenses can double-count** in the net result if a materials purchase is entered
  in Finanzas *and* is also the cost of the products made from it. The UI says so; a real fix
  needs the ledger to know which expenses were capitalised into inventory.
- **No tests on the frontend, and none on the products or auth routes.**
- **Stock is one number per product** — no per-size or per-colour tracking. Deliberate, but it
  means you can't see that you have three smalls and no larges.

---

## Suggested order

| # | Work | Effort | Why now |
|---|---|---|---|
| 1 | Backups + a tested restore | ½ day | Nothing else is recoverable without it |
| 2 | Token expiry, rate limiting, helmet, real secrets | ½ day | Anything on the internet with a login needs these |
| 3 | Deploy: managed Postgres, API, two static builds, domain, HTTPS | 1–2 days | |
| 4 | Fill in product costs, backdate recent sales | ½ day, no code | Makes the reports true |
| 5 | Atomic stock decrement + timezone bucketing | ½ day | Correctness, before volume grows |
| 6 | Uptime monitoring + CI | ½ day | |
| 7 | SKU, reorder points, low-stock alerts, turnover reporting | 2–3 days | The features the current scope actually asks for |
| 8 | CSV product import | ½ day | Do it before item 4 if the catalog is big |

Roughly **three to four days** to be live and safe, plus the catalog entry only you can do,
plus another two to three days for the inventory features in item 7.

I can take on 1, 2, 5, 6, 7 or 8 directly — say which. Item 3 needs credentials and item 4 is
yours by definition.

---

## Sources

- [Portal SAT — Factura Electrónica en Línea](https://portal.sat.gob.gt/portal/efactura/)
- [Gobierno de Guatemala — Pequeños contribuyentes deberán emitir FEL](https://prensa.gob.gt/comunicado/pequenos-contribuyentes-deberan-emitir-fel)
- [FEL Guatemala: guía completa de la Factura Electrónica en Línea (2026)](https://www.koddix.com/blog/fel-guatemala-guia-completa)
