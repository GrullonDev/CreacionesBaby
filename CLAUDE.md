# CLAUDE.md — start here

Orientation file for an AI assistant (or a new developer) picking this repo up cold.
It exists so nobody has to re-derive the architecture from scratch. It is a **map and a
list of traps**, not a duplicate of the other docs — when something is documented
elsewhere, this file says where.

**Keep this file current.** If you change how the pieces fit together, how to run them,
or one of the invariants below, update it in the same change.

---

## 1. What this is

**Creaciones Baby** — the internal back office for a small Guatemalan baby-clothing
business. Currency **GTQ**, interface in **Spanish**, **one operator**.

It does three things: **inventory control**, **sales tracking**, and **reporting**.

| Part | Path | Port | What it is |
| :-- | :-- | :-- | :-- |
| Admin app | `admin/` | 5173 | React 19 + Vite 8. The entire user interface. |
| API | `backend/` | 4000 | Fastify 5 + Prisma 6 + PostgreSQL. |

Two `package.json` files, two `npm install`s, two terminals. Not a monorepo.

**There is no storefront.** Selling happens on a separate, external platform; its sales
get recorded here like any other channel. The repo used to contain a customer-facing shop
— it was removed, and it's in git history if anyone ever needs it. Nothing here has a
public surface: every route except `/health` and `/auth/*` requires a token.

## 2. Which doc answers what

| File | What it's for | When to read it |
| :-- | :-- | :-- |
| **CLAUDE.md** (this file) | Map, how to run, invariants, traps | Always, first |
| **AGENTS.md** | The detailed reference: every route, every schema field, the full module design | Before touching the API or the schema |
| **SKILLS.md** | The *rules* — clean code, patterns, Tailwind/a11y, backend conventions, money & stock integrity, charts | Before writing code, every time |
| **LAUNCH.md** | What's left before this runs in production: blockers, hosting, the ordered plan | Before deploying, or when asked "what's missing?" |
| **ANALISIS.md** | Architecture rationale, in Spanish | When you need the *why* behind a structural choice |
| **README.md** | The front door | Rarely |

`AGENTS.md` is the long one and it's kept accurate — trust it over your assumptions about
the API shape.

## 3. Running it

```bash
# 1. Database (Podman, not a native install)
podman machine start                       # if not already running
podman start creaciones-baby-db            # first time: see AGENTS.md for the `podman run`
podman ps --filter name=creaciones-baby-db # PORTS must read 0.0.0.0:5432->5432/tcp

# 2. API
cd backend
npm install
cp .env.example .env                       # DATABASE_URL, JWT_SECRET, PORT, CORS_ORIGIN
npx prisma migrate deploy && npx prisma generate
npm run seed:admin                         # creates the operator login
npm run dev                                # http://localhost:4000

# 3. Admin app (separate terminal)
cd admin
npm install
cp .env.example .env                       # VITE_API_URL=http://localhost:4000
npm run dev                                # http://localhost:5173
```

- `CORS_ORIGIN` is a single origin now: `http://localhost:5173`.
- **There is no sample-data seed.** `npm run seed` is gone on purpose — this is a real
  inventory, so every product in it should be one you actually own. `seed:admin` stays
  because it's the only way to get a login.
- `POST /auth/register` only accepts `USER|SELLER`, so `npm run seed:admin` is how an
  `ADMIN` account comes into existence.
- The admin app **requires** `VITE_API_URL`. It has no offline mode.

## 4. The 60-second architecture

**Business logic lives in hooks.** `admin/src/hooks/`, one hook per page or complex
component; pages and components stay presentational. This is the most load-bearing
convention in the repo — see `SKILLS.md`.

**Global state is Context + a `useX` hook**: `AuthContext`/`useAuth`,
`ToastContext`/`useToast`. Persistence lives inside the provider, never as scattered
`localStorage` calls in components.

**Styling** is Tailwind v4 via **CDN script** in `admin/index.html`, with the theme tokens
configured inline there (`tailwind.config`) — there is no `tailwind.config.js`. Dark mode
uses the `class` strategy.

**Routing** is `react-router-dom` v7, everything lazy-loaded behind `ProtectedRoute`,
which also supplies the sidebar/topbar `Layout`.

**On the API side**, one file per resource in `backend/src/routes/`, Zod `safeParse` at the
edge, an explicit `toX()` serialiser per resource, and `prisma.$transaction` for anything
that touches more than one table. Shared money/date helpers are in `backend/src/lib/sales.js`.

**Single operator, so there is no scoping.** Whoever is authenticated sees everything.
`Product.sellerId` and `Order.userId` still exist as columns and are still written, but
nothing filters on them — they're there so adding a second person later is a code change
rather than a migration.

## 5. Invariants — do not break these

Decisions that are expensive to undo or that quietly corrupt money data. Full rationale in
`SKILLS.md`.

1. **One table for all sales.** `Order` *is* the sale, discriminated by `channel`
   (WEB / WHATSAPP / PRESENCIAL / FERIA / REDES / OTRO). `WEB` means the **external**
   platform. Never add a parallel `Sale` model.
2. **Never trust client-sent money.** Prices come from the database. `POST /sales` allows
   an explicit `unitPrice` override *by design* — real sales get negotiated — but the total
   is always recomputed server-side.
3. **Stock and its audit trail move together**, inside one `prisma.$transaction`. Every
   change to `Product.stock` writes a `StockMovement`. `VENTA` movements are written **only**
   by the sales routes.
4. **Net quantities per product before checking stock.** Two lines of the same product must
   not each pass a per-line check and jointly oversell. There's a test; it was a real bug.
5. **Sales are cancelled, never deleted.** Cancelling restores stock and writes
   `DEVOLUCION` movements. There is deliberately no `DELETE /sales/:id`.
6. **`soldAt` is the business date; `createdAt` is the row's.** All reports group by
   `soldAt`. It is backdatable, and rejected if in the future.
7. **Dates are handled in local time on purpose.** `utils/dates.js` never round-trips a
   business date through UTC — a sale entered at 8pm in Guatemala (UTC-6) would otherwise
   file itself under tomorrow.
8. **A missing cost must be visible, not papered over.** A product without `cost`
   contributes 0 COGS and inflates margin. The API returns `inventory.withoutCost` and
   every screen showing a margin caveats it. Never default cost to price to tidy the number.
9. **Nothing is public.** Every route except `/health` and `/auth/*` requires a token.
   There is a test asserting the catalog routes answer 401 anonymously — keep it passing.
10. **Don't fake persistence.** If the backend can't store something yet, use
    `ComingSoon.jsx` and say so — don't back it with `localStorage` as if it saved.

## 6. Before you call anything done

```bash
cd backend && npm test              # 34 tests, no database needed
cd backend && npx prisma validate   # if you touched schema.prisma
cd admin && npm run lint && npm run build
```

- `oxlint` must report **0 warnings, 0 errors** — including no unused imports and no dead files.
- Any change to `prisma/schema.prisma` needs a matching migration in `prisma/migrations/`
  in the same change.
- Anything touching money or stock needs a test in `backend/test/`. That suite injects a
  fake in-memory Prisma into the **real** route handlers via Fastify `inject`, so auth,
  validation and all the arithmetic run for real.
- No test runner on the frontend — verify by hand with `npm run dev`, in **both** light and
  dark mode, and at a phone width.

## 7. Environment traps

Things that will waste an hour if you don't know them. Several are specific to working
through a remote/sandboxed session rather than on the owner's machine.

- **`prisma migrate` / `validate` / `generate` need to download engine binaries.**
  `binaries.prisma.sh` is unreachable from the sandboxes used for this project. Consequence:
  **hand-write migration SQL** in the style of the existing ones and let the owner run
  `prisma migrate deploy` locally. To check the SQL without Prisma, install PostgreSQL in
  the sandbox, apply every migration in order with `psql -v ON_ERROR_STOP=1 -f`, then
  inspect `information_schema` — that's how the current migration was verified.
- **The device shell can lose sight of the repo.** `device_bash` has read the mount as empty
  for whole sessions while the file tools kept working. When that happens you can still
  write files but not run `git`/`npm`/tests — write the commands into a script for the owner
  to run, and say plainly that it's unverified.
- **`device_bash` cannot delete files.** Removals have to go through a script the owner runs.
- **`npm run build` can fail with `EPERM: unlink .../dist/...`** on a mounted volume. Build
  elsewhere: `npx vite build --outDir /tmp/dist --emptyOutDir`.
- **`npm install` rewrites version ranges in `package.json`.** Check `git diff package.json`
  after installing anything and restore ranges you didn't mean to bump.
- **`node --test <dir>` doesn't work** on this Node version; the script uses
  `node --test test/*.test.js`.
- **The Stitch MCP design connection is not reachable from a chat session.** It's a
  project-scoped MCP for Claude Code. From chat, work by hand against the existing tokens.

## 8. Where things stand

**Working:** the product catalog; recording sales from any channel with negotiated prices,
backdating and oversell protection; status transitions with stock restored on cancel; the
stock movement audit trail; the cash ledger for non-sale income and every expense; reports
covering revenue, COGS, margin, expenses by category, net result, inventory value, top
products and sales by channel; CSV exports throughout.

**Not built yet** — and these are the ones the current scope actually asks for, so they're
next rather than someday (details in `LAUNCH.md`):

- **No SKU or barcode** on products. Needed for physical counts and for matching any future
  sync from the external platform.
- **No per-product reorder point.** Low stock is flagged against a hardcoded threshold of 5
  units for every product equally, and there's no alert — just a badge.
- **No inventory turnover, days-of-inventory or dead-stock reporting.**
- **No CSV product import**, so the initial catalog has to be typed in.
- **No sync from the external platform.** Sales from there are entered by hand today.

**Also missing, infrastructure side:** no backups, tokens never expire, no rate limiting, no
deployment. `LAUNCH.md` ranks these — the backup one first, because it's the only item on
the list that isn't recoverable.

**Known limitations, accepted:** `GET /sales` queries twice (once for the page, once for
totals over the whole filtered set); money is summed as JavaScript floats; COGS and expenses
can double-count in the net result if a materials purchase is entered in both places.

## 9. Conventions cheat-sheet

- **Language**: all user-facing copy in **Spanish**; code, comments and docs in English.
- **Money**: always `formatCurrency` from `utils/currency.js` (`es-GT` / `GTQ`).
- **New page**: lazy-load it in `admin/src/App.jsx`, give it `usePageTitle(...)`, put its
  logic in a hook, and add it to `NAV_ITEMS` in `Layout.jsx`.
- **New API route**: one file per resource, `default async function xRoutes(app)`, Zod
  `safeParse`, an explicit serialiser, registered once in `app.js`, auth-gated.
- **Comments** explain *why*, especially where a choice looks odd. The codebase leans on
  this and it's why the invariants above survived. Don't strip them.
- **Chart colours** come from the `--viz-*` CSS custom properties in `admin/src/index.css`.
  Light and dark are separately validated steps; don't hardcode the hexes in components.
- **Empty, loading and error states are required**, not optional polish.
