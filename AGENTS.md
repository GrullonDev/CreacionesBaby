# Dev Environment Tips

This repo has **three apps**: the customer-facing storefront (root, this section), the seller-only [seller-portal/](seller-portal/) app (its own Vite project, see its section below), and the shared [backend/](backend/) API both talk to. Run each with its own `npm install`/`npm run dev` in its own terminal.

## 🚀 Getting Started
- Use `npm install` to install all required dependencies.
- Use `npm run dev` to launch the Vite local development server with Hot Module Replacement (HMR).
- Use `npm run build` to produce a production build, `npm run preview` to serve it locally.
- Copy `.env.example` to `.env` and fill in real values (Vite only exposes vars prefixed `VITE_`):
  - `VITE_WHATSAPP_NUMBER` — number for the floating WhatsApp button (international format, no `+`).
  - `VITE_API_URL` — real product API base URL. **If unset, the app runs entirely on local mock/localStorage data** (`src/data/products.js` + `src/data/sellerProducts.js`) via `src/services/productService.js`. This is the default dev setup.

## 🛠️ Tech Stack Overview
- **Framework & Build**: React 19 + Vite 8 (`@vitejs/plugin-react`).
- **Routing**: `react-router-dom` v7, all secondary routes lazy-loaded (`React.lazy` + `Suspense`) in [src/App.jsx](src/App.jsx).
- **Styling**: Tailwind CSS v4 loaded via **CDN script** in [index.html](index.html) (not an npm dependency) — theme tokens (colors, font, radius) are configured inline there via `tailwind.config`, not in a `tailwind.config.js` file. Dark mode uses the `class` strategy (`dark:` prefix).
- **Fonts/Icons**: Manrope (Google Fonts) + Material Symbols Outlined, both loaded via `<link>` tags in `index.html`.
- **HTTP**: `axios` (`src/services/api.js`), only actually used when `VITE_API_URL` is set.
- **State Management**: React Context + `useReducer`, each with a matching `use*` hook that reads via `useContext`:
  - `CartContext` / `useCart` — cart items, quantities, subtotal; persisted to `localStorage` (`creaciones_cart`).
  - `WishlistContext` / `useWishlist` — persisted to `localStorage`.
  - `ToastContext` / `useToast` — global toast notifications (used across the seller flow, checkout, etc.).
- **Design System**: Google Stitch (MCP) synchronization — see `stitch-ui-design-integration` rules in [SKILLS.md](SKILLS.md).

## 🧩 Business Logic: Custom Hooks Layer
UI components/pages stay presentational; business logic lives in `src/hooks/`. See [ANALISIS.md](ANALISIS.md) for the full rationale/table. Current hooks:
- `useHeaderLogic`, `useHomeLogic`, `useProductFilters`, `useProductDetail`, `useProductHelpers`, `useQuickView`, `useCartLogic`, `useCheckoutLogic`, `useStreamingLogic`, `usePageTitle`
- `useSellerProducts` — loads/deletes seller-listed products (used by `SellerDashboard`).
- `useSellerProductForm` — create/edit form state + validation for seller products (used by `SellerProductForm`).

## 🛒 Product Data Model (mock/local vs API)
`src/services/productService.js` is the single entry point pages use to fetch products — it auto-switches based on `VITE_API_URL`:
- **API mode** (`VITE_API_URL` set): calls the real backend via `src/services/api.js`.
- **Local mode** (default): merges two sources — `src/data/products.js` (static catalog mock) and `src/data/sellerProducts.js` (user-generated listings persisted in `localStorage` under `creaciones_seller_products`, with product photos stored as Blobs in IndexedDB via `src/utils/imageStore.js`, not localStorage, to avoid quota limits).

### Seller module ("Panel de Vendedor")
A self-serve flow letting anyone add/edit/delete product listings client-side (no backend required):
- Routes: `/vendedor` (dashboard, list + delete), `/vendedor/nuevo` (create), `/vendedor/:id/editar` (edit) → `src/pages/SellerDashboard.jsx`, `src/pages/SellerProductForm.jsx`.
- Components: `SellerProductCard.jsx`, `ImageDropzone.jsx` (drag/drop + preview, backed by `imageStore.js`).
- Seller products flow into the normal catalog transparently (`isSellerProduct: true` flag) and show up alongside mock products in `Products`, `Home`, `ProductDetail` related items, etc.

## 🗺️ Routes (src/App.jsx)
`/`, `/products`, `/product/:id`, `/cart`, `/checkout`, `/account`, `/orders`, `/streaming`, `/atencion-al-cliente(/:slug)`, `/legal(/:slug)`, `/vendedor`, `/vendedor/nuevo`, `/vendedor/:id/editar`.

## ⚡ Quality & Code Standards
- **Linter**: `npm run lint` (`oxlint`) — must pass clean (no unused imports/dead code) before committing. **No test runner is configured** — verify changes manually via `npm run dev`.
- Business logic goes in `src/hooks/`, not in components/pages — see [SKILLS.md](SKILLS.md) for the full clean-code/architecture rules (SRP, container/presenter split, a11y, dark mode, Tailwind mobile-first) and for the `backend/` API conventions (Zod validation, ownership/role checks, transactions, migrations).
- Global/shared state goes through Context providers in `src/context/`, synced to `localStorage`/IndexedDB inside the provider or a dedicated `src/utils/` or `src/data/` module — never scattered `localStorage` calls in components.
- New pages must be registered in `src/App.jsx` (lazy-loaded) and in `src/hooks/usePageTitle.js` usage for the document title.

## 🖥️ Backend (`backend/`)
A Fastify + Prisma + PostgreSQL API lives in [backend/](backend/) (branch `feature/backend-api-setup`), matching the REST shape `src/services/api.js` already expects — once it's running, pointing the frontend's `VITE_API_URL` at it is the only frontend change needed.
- **Stack**: Fastify 5, Prisma 6, PostgreSQL, `@fastify/jwt` + `bcryptjs` for auth, `zod` for request validation.
- **Local database (Podman)**: Postgres runs in a Podman container, not installed natively. On this machine `podman-machine-default` is a **`libkrun` VM (macOS)** — normal `-p` port publishing works fine here and forwards to the Mac's `localhost` as expected. (Earlier notes here described a `--network host` workaround for a rootful/WSL2 netavark bug; that doesn't apply to this libkrun setup — `--network host` only exposes the port inside the VM on macOS, not out to the host, which is why the container was unreachable until switched back to `-p`.) Standard setup:
  ```
  podman run -d --name creaciones-baby-db -p 5432:5432 \
    -e POSTGRES_USER=creaciones -e POSTGRES_PASSWORD=creaciones_dev_pw \
    -e POSTGRES_DB=creaciones_baby \
    -v creaciones-baby-db-data:/var/lib/postgresql/data \
    docker.io/library/postgres:16-alpine
  ```
  Start/stop day-to-day with `podman start|stop creaciones-baby-db` (data persists in the `creaciones-baby-db-data` volume). If `podman machine` isn't running, `podman machine start` first. Sanity check the port is actually published with `podman ps --filter name=creaciones-baby-db` — the `PORTS` column should read `0.0.0.0:5432->5432/tcp`, not just `5432/tcp`.
- **Setup**: `cd backend`, `npm install`, copy `.env.example` → `.env` (needs `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN` — already done locally, matching the container credentials above), `npm run prisma:migrate` to create/update the schema, `npm run seed` to load the mock catalog (`src/data/products.js`) into the DB, `npm run dev` to start the API (default `http://localhost:4000`).
- **Status**: initial migration applied, DB seeded with the 14 mock products, server verified live against the real database (`/health`, `/categories`, `/products` all return real data). A second migration (`20260805020000_add_order_details`) adding the `Order`/`OrderItem` columns below was authored by hand (no network access to Prisma's engine binaries to run `prisma migrate dev` interactively from the dev sandbox that wrote it) — apply it locally with `npm run prisma:migrate` against the Podman DB; the orders route logic itself was verified with a full mocked-Prisma integration test (fastify `inject` against the real route handlers), separately from a live Postgres run.
- **Schema** ([backend/prisma/schema.prisma](backend/prisma/schema.prisma)): `User` (with `Role`: USER/SELLER/ADMIN), `Product` + `ProductImage`, `Order` + `OrderItem`. `Product.sellerId` nullable — null means official catalog item, set means a seller listing (replaces the client-only `sellerProducts.js`/IndexedDB approach once wired up). `Order` now also carries `discount`/`shipping`/`promoCode` and a flat shipping-address snapshot (`addressName/Email/Line/City/Zip`, not a separate `Address` table — matches the shape `useCheckoutLogic.js` already builds client-side); `OrderItem` carries `selectedColor`/`selectedSize` per line.
- **Routes** (`backend/src/routes/`): `GET/POST/PUT/DELETE /products`, `GET /categories`, `POST /auth/register`, `POST /auth/login`, `GET /auth/me`, and now `POST/GET /orders` + `GET /orders/:id` (all `orders.js` routes require auth). Product responses are serialized to the same shape the frontend already consumes (`image`/`images`, `inStock`, `isSellerProduct`, etc.); order responses match the shape `Orders.jsx`/`useCheckoutLogic.js` already expect (`id`, `date`, `items[]` with `name`/`image`/`price`/`quantity`, `subtotal`, `discount`, `shipping`, `total`, `address`).
- **`GET /products?mine=true`**: added for the seller portal's product dashboard — requires auth (401 without a valid token) and scopes the list to `sellerId === request.user.sub`, unlike the plain public `GET /products` (no auth, returns the whole catalog). Verified with a mocked-Prisma Fastify `inject` test (public listing unaffected, unauthenticated `mine=true` rejected, two different sellers each only see their own products).
- **`CORS_ORIGIN`** now needs both dev origins comma-separated: `http://localhost:5173` (storefront) and `http://localhost:5174` (seller-portal) — already updated in `.env.example`; if your local `backend/.env` predates this, add the second origin by hand.
- **`POST /orders` behavior**: trusts only `productId`/`quantity` from the client — looks up real prices server-side (never trusts a client-sent price), rejects unknown product ids (400) and insufficient stock (409), decrements `Product.stock` (flips `inStock` to `false` at 0) and creates the `Order` + `OrderItem` rows inside a single `prisma.$transaction`. **Auth is optional on this one route** (unlike every other protected route): it calls `request.jwtVerify()` in a try/catch and proceeds as a guest (`userId: null`) if there's no token or it's invalid, or attaches `request.user.sub` if there is one. Deliberate — the storefront has no customer accounts, so checkout is guest-only for now; `Order.userId` is nullable in the schema for exactly this reason (migration `20260805050000_guest_checkout`, FK changed from `ON DELETE CASCADE` to `ON DELETE SET NULL` since deleting a user shouldn't delete their past guest-linked orders). `GET /orders` and `GET /orders/:id` are unchanged — still auth-required, still scope to `request.user.sub` (`role === 'ADMIN'` can view any order); guest orders (`userId: null`) aren't retrievable through these by design, there's no guest account to authenticate as — see the storefront integration note below for how "Mis Pedidos" still works without them.
- **Admin section (planned)**: a role-gated `/admin` route inside this same app (not a separate site) — reuses the existing seller-dashboard pattern (`SellerDashboard.jsx`/`SellerProductForm.jsx`) but backed by the real API and requiring `role === 'ADMIN'`, for uploading/managing the official product catalog.

### Frontend ↔ backend integration status (storefront)
- **Already wired, works automatically once `VITE_API_URL` is set and the API is reachable**: `src/services/productService.js` checks `VITE_API_URL` and switches `fetchProducts`/`fetchProductById`/`fetchRelatedProducts`/`fetchFeaturedProducts`/`fetchCategories` from local mock data to real `api.get(...)` calls — no code changes needed for read-only product/category browsing.
- **Checkout — now wired to the real backend too**: `useCheckoutLogic.js` has the same `USE_API = Boolean(VITE_API_URL)` toggle as `productService.js`. When set, submitting checkout calls `POST /orders` (guest, no login — see backend note above) with `items` mapped to `{productId, quantity, selectedColor, selectedSize}` (`item.id` is the cart item's product id, a real backend id once `VITE_API_URL` is on since the cart was populated from real product data); the server's response — already shaped to match what `Orders.jsx` renders — is what gets used, not a client-computed total. Added `submitting`/`submitError` state to the hook and wired a disabled/spinner button state + inline error into `Checkout.jsx` for the network round-trip (submit handler is now `async`). New `src/utils/apiError.js` (same pattern as `seller-portal/`'s) turns backend Zod/plain errors into a readable message. **`Orders.jsx` ("Mis Pedidos") itself wasn't changed** — it still reads `creaciones_orders` from `localStorage` only, since there's no customer login to look orders up by from the server; `useCheckoutLogic.js` still writes the (now server-confirmed) order into `localStorage` after a successful `POST /orders`, specifically so this keeps working unchanged. In mock mode (`VITE_API_URL` unset) checkout behaves exactly as before this change.
- **Not wired yet (needs real frontend work, not just env config)**:
  - **Auth**: there is no login/register UI anywhere in `src/` and `src/services/api.js` has no request interceptor to attach a `Bearer` token — the storefront doesn't need seller auth (that's what `seller-portal/` is for). It could get its own customer-facing auth eventually (the guest-checkout `POST /orders` already accepts an optional token in anticipation of this), but that's not built and isn't required for checkout to work today.
  - **Old seller module** (`SellerDashboard.jsx`/`SellerProductForm.jsx`/`useSellerProducts`/`useSellerProductForm`, routes `/vendedor*`): still goes through `src/data/sellerProducts.js` (`localStorage` + IndexedDB via `imageStore.js`), fully client-only. **This is now superseded by `seller-portal/`** (see below), which does the same job for real against the backend. The old `/vendedor*` pages haven't been removed yet — that's a deliberate open decision (redirect them to the new app's URL? delete outright? keep as a fallback?), not an oversight.
- **Not yet done on the backend itself**: order status transitions (`PENDING → PAID → SHIPPED → DELIVERED/CANCELLED` — no route updates `status` yet), a way for a guest to look up their own order from a different device/browser (today it only lives in that browser's `localStorage`, plus the server record an ADMIN could pull up — no "look up my order by email + order id" endpoint), linking `Order`/`Product` back to the selling `User` for seller-scoped sales reports (see Reports note below), the admin `/admin` route, and real image upload (currently seed data reuses the mock catalog's external image URLs, and the seller portal's product form only accepts pasted image URLs for the same reason).

## 🧑‍💼 Seller Portal (`seller-portal/`)
A second, independent React app — separate `package.json`, separate `npm run dev` (port **5174**, vs. the storefront's 5173), separate deploy target later. It's where sellers log in and manage their own store; end customers never see it. Shares the same `backend/` API and the same visual design tokens (Tailwind CDN config duplicated in its `index.html`, Manrope + Material Symbols) so it feels like the same product family, but has **no offline/mock mode** — unlike the storefront, it requires `VITE_API_URL` to function at all.
- **Setup**: `cd seller-portal`, `npm install`, copy `.env.example` → `.env` (`VITE_API_URL=http://localhost:4000`), `npm run dev`. Needs `backend/` running (see above) — including `CORS_ORIGIN` including `http://localhost:5174`.
- **Auth** (`src/context/AuthContext.jsx` + `useAuth`): JWT stored in `localStorage` (`creaciones_seller_token`, via `src/services/api.js`'s `getStoredToken`/`setStoredToken`), attached to every request through an axios request interceptor. `/registro` calls `POST /auth/register` with `role: 'SELLER'` hardcoded; `/login` calls `POST /auth/login` and rejects (client-side) any account whose role isn't `SELLER`/`ADMIN`. On load, if a token exists, `GET /auth/me` validates it and hydrates `user`; a 401 anywhere clears the stored token (see `api.js` response interceptor). `ProtectedRoute` (`src/components/ProtectedRoute.jsx`) gates every route except `/login`/`/registro`.
- **Products — fully real, no placeholders**: `src/pages/Products.jsx` (list), `ProductForm.jsx` (create/edit), `useProducts`/`useProductForm` hooks call `GET /products?mine=true`, `POST /products`, `PUT /products/:id`, `DELETE /products/:id` directly. Image field is a repeatable **URL** input (not file upload — matches the backend's current `images: string[]` API; real upload is still a backend gap, see above).
- **Placeholder/partial sections** (per explicit decision to scaffold all navigation now, fill in incrementally later):
  - **`/inventario`** and **`/reportes`**: not fake placeholders — they're real read-views computed client-side from the same `GET /products?mine=true` data (stock table, inventory value, products-by-category breakdown). Both pages also show an inline `ComingSoon` block (`src/components/ComingSoon.jsx`) for the parts that genuinely need backend work: stock alerts/CSV export for inventory, and sales/revenue reports for reports (blocked on `GET /orders` having no seller-scoped filter — an order's items reference `Product.sellerId` today, but the route doesn't join/filter on it).
  - **`/promociones`** and **`/pagos`**: pure `ComingSoon` placeholders, no backend model exists for either yet (no `Promotion` entity; no payout-account field on `User`). Deliberately not persisting anything client-side for these (e.g. not faking it with `localStorage`) since that would misrepresent payout info as saved when it isn't.
- **Structure**: `src/context/` (`AuthContext`, `ToastContext` — same toast pattern as the storefront), `src/services/api.js` (axios + auth interceptor), `src/hooks/` (`useProducts`, `useProductForm`, `usePageTitle`), `src/components/` (`Layout` — sidebar nav + topbar, `ProtectedRoute`, `ProductRow`, `ComingSoon`, `ErrorBoundary`), `src/pages/` (`Login`, `Register`, `Dashboard`, `Products`, `ProductForm`, `Promotions`, `Inventory`, `Reports`, `Payments`), `src/utils/apiError.js` (shared Zod-error → readable-message extraction), `src/utils/currency.js`.
- **Verified**: `npm run build` and `npx oxlint` both pass clean; the new `GET /products?mine=true` backend behavior was checked with a mocked-Prisma Fastify `inject` test (see backend section above). Not yet exercised against a live Postgres end-to-end (same sandbox limitation as the rest of `backend/` — see its Status note).

## 📁 Key Directories
- `src/components/`: Reusable, mostly presentational UI components (Header, Footer, ProductCard, QuickView, SellerProductCard, ImageDropzone, TrustBadges, etc.).
- `src/context/`: Global state providers + hooks (`CartContext`/`useCart`, `WishlistContext`/`useWishlist`, `ToastContext`/`useToast`).
- `src/data/`: Data-access layer — `products.js` (static mock catalog), `sellerProducts.js` (localStorage/IndexedDB-backed seller listings CRUD), `testimonials.js`.
- `src/hooks/`: Business-logic layer, one hook per page/complex component (see above).
- `src/services/`: `api.js` (axios instance), `productService.js` (mock-vs-API switch, the thing pages should actually import).
- `src/utils/`: `imageStore.js` (IndexedDB image blobs), `analytics.js` (local event log, inspect via `__creacionesAnalytics()` in the browser console; wire real GA by adding `gtag.js` to `index.html`), `currency.js`, `referral.js`, `recentlyViewed.js`, `recentSearches.js`, `socialProof.js`.
- `src/pages/`: Route-level views, all lazy-loaded except `Home`.
- `backend/`: Fastify + Prisma + PostgreSQL API shared by both frontends — see its section above.
- `seller-portal/`: independent Vite app for sellers (auth, product CRUD, inventory/reports/promotions/payments) — see its section above.
- `AGENTS.md` — this file (dev standards, always keep current).
- `ANALISIS.md` — architecture deep-dive in Spanish (hooks table, folder structure rationale).
- `SKILLS.md` — Clean Code / design-pattern / Tailwind / Stitch rules referenced above.
