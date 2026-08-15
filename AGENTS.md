# AGENTS.md — development reference

> **New here?** Read [CLAUDE.md](CLAUDE.md) first — the short map, how to run everything, and
> the invariants you must not break. This file is the detail you come to afterwards;
> [SKILLS.md](SKILLS.md) has the rules.

**Creaciones Baby** is the internal back office for a small Guatemalan baby-clothing
business: inventory control, sales tracking, reporting. Currency **GTQ**, UI in **Spanish**,
one operator. There is no storefront — selling happens on an external platform, and those
sales are recorded here like any other channel.

Two parts, run separately:

| Part | Path | Port |
|---|---|---|
| Admin app — React 19, Vite 8, react-router-dom v7 | `admin/` | 5173 |
| API — Fastify 5, Prisma 6, PostgreSQL 16 | `backend/` | 4000 |

---

## 🚀 Getting started

Full sequence in [CLAUDE.md § 3](CLAUDE.md). The short version:

```bash
podman start creaciones-baby-db
cd backend && npm install && cp .env.example .env
npx prisma migrate deploy && npx prisma generate && npm run seed:admin && npm run dev
cd ../admin && npm install && cp .env.example .env && npm run dev
```

**Local database (Podman).** Postgres runs in a container, not installed natively. On this
machine `podman-machine-default` is a `libkrun` VM (macOS), where normal `-p` port publishing
works and forwards to the Mac's `localhost`. First-time setup:

```bash
podman run -d --name creaciones-baby-db -p 5432:5432 \
  -e POSTGRES_USER=creaciones -e POSTGRES_PASSWORD=creaciones_dev_pw \
  -e POSTGRES_DB=creaciones_baby \
  -v creaciones-baby-db-data:/var/lib/postgresql/data \
  docker.io/library/postgres:16-alpine
```

Day to day: `podman start|stop creaciones-baby-db`; data persists in the volume. Sanity-check
with `podman ps` — the `PORTS` column must read `0.0.0.0:5432->5432/tcp`, not just `5432/tcp`.

**Accounts.** `POST /auth/register` only accepts `USER|SELLER` on purpose, so `ADMIN` comes
from `npm run seed:admin` (`admin@creacionesbaby.test` / `admin12345` by default, override
with `ADMIN_EMAIL`/`ADMIN_PASSWORD`; safe to re-run). With one operator the role does not
gate anything today — a token is a token — but the enum and the `requireRole` decorator are
kept so adding a second person is a code change rather than a migration.

**There is no sample-data seed.** `npm run seed` was removed with the storefront: it imported
the shop's mock catalog, and seeding a real inventory with invented products is worse than
starting empty.

---

## 🖥️ API (`backend/`)

**Stack**: Fastify 5, Prisma 6, PostgreSQL, `@fastify/jwt` + `bcryptjs`, `zod` for validation.

**Nothing is public.** Every route except `GET /health` and `POST /auth/*` requires a bearer
token. There is a test asserting the catalog answers 401 anonymously; keep it passing.

**Tests**: `npm test` → `node --test test/*.test.js`. A fake in-memory Prisma
(`test/helpers/fakePrisma.js`) is injected into the **real** route handlers via Fastify
`inject` (`test/helpers/buildTestApp.js`), so auth, Zod validation and all the money/stock
arithmetic run for real and only the database is swapped out. 34 tests, no PostgreSQL needed.
`fakePrisma` supports exactly the query shapes the routes use — if a route starts using a new
filter shape the test fails loudly there, which is intended.

### Routes

| Method and path | Notes |
|---|---|
| `POST /auth/register` · `POST /auth/login` · `GET /auth/me` | JWT. Register is capped at `USER\|SELLER`. |
| `GET /products` · `GET /products/:id` | The internal catalog, including `cost`. `?category=` filters. |
| `POST /products` · `PUT /products/:id` · `DELETE /products/:id` | Creating with stock writes an `ENTRADA` ("Stock inicial"); editing `stock` writes an `AJUSTE`, so the history has no holes where someone corrected a number by hand. |
| `GET /sales` | Every sale. Filters `from`/`to`/`channel`/`status`/`q`, paginated. `totals` cover the whole filtered set, not the page, and exclude cancelled sales. |
| `POST /sales` | Record a sale. See below. |
| `GET /sales/:id` · `PATCH /sales/:id` | Status transitions plus `paymentMethod`/`channel`/`soldAt`/`notes`. No DELETE. |
| `GET /stock-movements` · `POST /stock-movements` | The audit trail. POST accepts only manual types. |
| `GET/POST/PUT/DELETE /finance-entries` | The cash ledger. |
| `GET /reports/summary?from&to` | Every report figure in one round trip. |
| `GET /health` | Public. |

### The sales model

`Order` **is** the sale, whatever channel it came from. There is deliberately no separate
`Sale` model: "all my sales" has to be one query, or every report becomes a union of two
sources that drift apart.

- `channel` (`SaleChannel`: WEB / WHATSAPP / PRESENCIAL / FERIA / REDES / OTRO). **`WEB` means
  the external selling platform** — this system has no storefront. It's what a future sync
  would write.
- `soldAt` — the **business date**, distinct from `createdAt`. Backdatable (last week's fair
  entered today lands last week), rejected if in the future. **All reports group by `soldAt`.**
- `paymentMethod`, `customerPhone`, `notes`, `recordedById`.
- The `address*` columns are nullable — a cash sale at a fair has no shipping address.
- `OrderItem.cost` snapshots the unit cost at sale time, so historical margin stays correct
  after a product's cost changes. `Product.cost` is the current cost (nullable — much of the
  catalog predates it).

**`POST /sales`** looks prices up server-side, rejects unknown ids (400) and insufficient
stock (409), and in one `prisma.$transaction` creates the `Order` + `OrderItem`s, decrements
stock and writes a `StockMovement` per line. Two things worth knowing: an explicit
`unitPrice` override per line is allowed *by design* (real sales get negotiated), and
quantities are **netted per product** before the stock check, so two lines of the same item
can't each pass and jointly oversell. A `CANCELLED` sale reserves no stock at all.

**`PATCH /sales/:id`** moves a sale through `PENDING → PAID → SHIPPED → DELIVERED/CANCELLED`.
Cancelling **restores stock** and writes `DEVOLUCION` movements; un-cancelling takes it back
out and 409s if it isn't there. Cancelling twice is idempotent. There is no DELETE — a sale
is cancelled, never erased, so the ledger stays auditable.

### Inventory

`StockMovement` records every change to `Product.stock`: `quantity` is a **signed delta**,
`stockAfter` is stored so history reads without replaying. Types: `ENTRADA`, `SALIDA`,
`VENTA`, `DEVOLUCION`, `AJUSTE`, `MERMA`. `POST /stock-movements` accepts only the manual
ones — `VENTA` is written *only* by the sales routes, so a movement and its sale can never
disagree. `AJUSTE` takes an absolute `newStock` and stores the computed delta; an adjustment
that changes nothing is a 400, not a silent no-op. Stock is never allowed to go negative.

### The cash ledger

`FinanceEntry` is for money that is **not** a product sale: expenses of every kind, and
non-sale income (capital, loans, supplier refunds). One table, `direction` (INGRESO/EGRESO)
plus `category`, and the API **enforces that a category belongs to its direction** — an
EGRESO tagged `APORTE_CAPITAL` would silently corrupt every by-category report. `amount` is
always positive; the direction carries the sign. `PUT` re-validates the **merged** entry, not
just the patch, so changing only `category` is still checked against the stored `direction`.

Sales revenue deliberately does not live here. The reports join the two sources at the end.

### Reports

`GET /reports/summary` returns revenue, COGS, gross profit and margin %, average ticket,
other income, expenses by category, net result, inventory value at retail **and** at cost,
top products, sales by channel and a daily series — computed server-side so the browser never
downloads the whole sales history to add it up.

### Migrations

Any change to `prisma/schema.prisma` needs a matching migration in `prisma/migrations/`
before the change is done. If there's no reachable database to run `prisma migrate dev`
interactively, hand-write the SQL in the style of the existing migrations — and then
**actually execute it** against a throwaway PostgreSQL, applying every migration in order,
and compare the result against the schema via `information_schema`. A hand-written migration
that has never been run is a hypothesis, not a migration.

Current migrations: `20260804230028_init`, `20260805020000_add_order_details`,
`20260805050000_guest_checkout`, `20260813120000_sales_inventory_finance`.

---

## 🧑‍💼 Admin app (`admin/`)

Sidebar + topbar shell (`components/Layout.jsx`), everything behind `ProtectedRoute`, all
routes lazy-loaded in `App.jsx`.

| Route | What it does |
|---|---|
| `/dashboard` | Real KPIs from `/reports/summary` for the current month, plus low-stock and top-product panels. |
| `/ventas` | The sales list — filters, inline status change, CSV export. Cards below `md`, table above. |
| `/ventas/nueva`, `/ventas/:id/editar` | The entry form: tabbed (Venta / Productos / Cliente y totales), searchable product picker, catalog price prefilled but editable, oversell warning counting every line of that product, live totals and margin, sticky total on phones, and "Guardar y otra" for entering a batch. |
| `/finanzas` | The ingresos/egresos ledger with a modal create/edit form and CSV export. |
| `/inventario` | "Existencias" (stock table with cost and value) and "Movimientos" (the audit trail), plus an "ajustar stock" action. |
| `/productos`, `/productos/nuevo`, `/productos/:id/editar` | Catalog CRUD. Tab 2 has costo por unidad with a live margin readout. |
| `/reportes` | Period presets, ingresos-vs-egresos chart, ventas por canal, egresos por categoría, top products, inventory value, CSV of the whole summary. |
| `/promociones`, `/pagos` | Honest `ComingSoon` placeholders — no backend model exists for either. |
| `/configuracion` | Account info read-only; `ComingSoon` for editing (no `PATCH /auth/me` yet). |

**Structure**: `src/context/` (`AuthContext`, `ToastContext`), `src/services/api.js` (axios +
auth interceptor), `src/hooks/` (one per page — `useSales`, `useSaleForm`, `useFinanceEntries`,
`useStockMovements`, `useReportSummary`, `useProducts`, `useProductForm`, `usePageTitle`),
`src/components/`, `src/pages/`, `src/utils/` (`salesConstants`, `dates`, `csv`, `currency`,
`apiError`).

**Design**: Tailwind v4 via CDN with tokens inline in `index.html` (there is no
`tailwind.config.js`), Manrope + Material Symbols, dark mode on the `class` strategy.

**Chart colours** are CSS custom properties (`--viz-income`, `--viz-expense`, `--viz-neutral`,
`--viz-track`) in `src/index.css`. Light and dark are separately chosen steps, each validated
against the surface it sits on for contrast and colour-vision separation — the comment above
them records the numbers. Don't flip one mode into the other, and don't hardcode the hexes.

---

## ⚠️ Things that will bite you

- **`Product.cost` is optional, so margin can lie.** A product without a cost contributes 0
  COGS, inflating gross profit and margin. The API returns `inventory.withoutCost`, and every
  screen showing a margin renders a caveat when it's non-zero. Don't "fix" this by defaulting
  cost to price.
- **COGS and expenses can double-count.** A fabric purchase entered in Finanzas *and* also
  the cost of goods on the products made from it is counted twice in `netResult`. Flagged in
  UI copy rather than silently deduped — only the owner knows which it was.
- **Dates are business dates.** `admin/src/utils/dates.js` works in **local time** on purpose:
  `toInputDate` never round-trips through UTC, because a sale entered at 8pm in Guatemala
  (UTC-6) would otherwise file itself under tomorrow. The backend's `dateRangeFilter` pushes a
  bare `to=YYYY-MM-DD` to the end of that day so a same-day range matches an afternoon sale.
- **Shipping isn't margin.** Gross profit is `total − shipping − cogs`; shipping charged to
  the customer is a pass-through.
- **Two concurrent sales can oversell.** `POST /sales` reads stock before opening its
  transaction. With one operator this is near-impossible, but it's real — see `LAUNCH.md`.
- **Reports bucket by UTC day.** A sale recorded late in the evening can land on the next
  day's figures. Also in `LAUNCH.md`.

---

## 📁 Key directories

- `admin/src/hooks/` — the business-logic layer. Pages stay presentational.
- `admin/src/components/` — reusable UI (`StatCard`, `Badge`, `Modal`, `DateRangeFilter`,
  `LineItemsEditor`, `MagnitudeBars`, `IncomeExpenseChart`, `Layout`, `ProtectedRoute`,
  `ComingSoon`, `ErrorBoundary`).
- `admin/src/utils/salesConstants.js` — Spanish labels for every backend enum, in one place.
  The `id` values must match `schema.prisma` exactly.
- `backend/src/lib/sales.js` — shared money serialisation and date-range handling.
- `backend/test/` — the `node --test` suite over the real handlers with a fake Prisma.
- `CLAUDE.md` — orientation. **Read first; keep current.**
- `AGENTS.md` — this file.
- `SKILLS.md` — the rules.
- `LAUNCH.md` — what's left before production.
- `ANALISIS.md` — architecture rationale in Spanish.

---

## 🧭 Roadmap

Ranked. The first three are what the current scope explicitly asks for and aren't built yet;
the rest is infrastructure. `LAUNCH.md` has the detail and the effort estimates.

1. **Backups.** Nothing else on this list is unrecoverable. Automated off-machine dumps, and
   a restore you have actually performed.
2. **SKU + per-product reorder point** (one migration), then **low-stock alerts** — a
   dashboard panel and an inventory filter driven by each product's own reorder point instead
   of the hardcoded threshold of 5 that currently applies to everything equally.
3. **Inventory turnover reporting** — turnover ratio, days of inventory, dead stock, stock-out
   frequency. Extends `/reports/summary` rather than adding endpoints.
4. **Auth hardening**: tokens never expire, and `/auth/login` has no rate limiting.
5. **CSV product import**, so the real catalog doesn't have to be typed in.
6. **Deployment**: no Dockerfile, no hosting, no HTTPS, no CI.
7. **Atomic stock decrement** and **timezone-correct day bucketing** (see "Things that will
   bite you").
8. **Sales sync from the external platform.** Manual entry only today. Needs SKU matching and
   idempotency by external order id — which is why SKU is item 2.
9. **Promotions and payout accounts** — no models exist; those pages are honest placeholders.
10. **Cross-cutting**: no frontend tests, none on the products or auth routes, no rate
    limiting, no request size limits.
