# Dev Environment Tips

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
- **`POST /orders` behavior**: trusts only `productId`/`quantity` from the client — looks up real prices server-side (never trusts a client-sent price), rejects unknown product ids (400) and insufficient stock (409), decrements `Product.stock` (flips `inStock` to `false` at 0) and creates the `Order` + `OrderItem` rows inside a single `prisma.$transaction`. `GET /orders` and `GET /orders/:id` scope results to `request.user.sub`; `GET /orders/:id` additionally allows `role === 'ADMIN'` to view any order (403 otherwise).
- **Admin section (planned)**: a role-gated `/admin` route inside this same app (not a separate site) — reuses the existing seller-dashboard pattern (`SellerDashboard.jsx`/`SellerProductForm.jsx`) but backed by the real API and requiring `role === 'ADMIN'`, for uploading/managing the official product catalog.

### Frontend ↔ backend integration status
- **Already wired, works automatically once `VITE_API_URL` is set and the API is reachable**: `src/services/productService.js` checks `VITE_API_URL` and switches `fetchProducts`/`fetchProductById`/`fetchRelatedProducts`/`fetchFeaturedProducts`/`fetchCategories` from local mock data to real `api.get(...)` calls — no code changes needed for read-only product/category browsing.
- **Not wired yet (needs real frontend work, not just env config)**:
  - **Auth**: there is no login/register UI anywhere in `src/` and `src/services/api.js` has no request interceptor to attach a `Bearer` token — `/auth/register`, `/auth/login`, `/auth/me` exist on the backend but nothing on the frontend calls them yet. Needed before any authenticated route (seller product CRUD, orders) can work end-to-end: a login/register page, somewhere to persist the JWT (e.g. a new `AuthContext`, mirroring `CartContext`'s `localStorage`-backed pattern), and an axios request interceptor in `api.js` adding `Authorization: Bearer <token>`.
  - **Checkout/Orders**: `useCheckoutLogic.js` and `Orders.jsx` still read/write `creaciones_orders` in `localStorage` directly — `POST/GET /orders` exist on the backend but checkout doesn't call them.
  - **Seller module**: `SellerDashboard.jsx`/`SellerProductForm.jsx`/`useSellerProducts`/`useSellerProductForm` still go through `src/data/sellerProducts.js` (`localStorage` + IndexedDB via `imageStore.js`) — `POST/PUT/DELETE /products` exist on the backend (and already require the auth token that doesn't exist client-side yet) but the seller UI doesn't call them.
- **Not yet done on the backend itself**: order status transitions (`PENDING → PAID → SHIPPED → DELIVERED/CANCELLED` — no route updates `status` yet), the admin `/admin` route, and real image upload (currently seed data reuses the mock catalog's external image URLs).

## 📁 Key Directories
- `src/components/`: Reusable, mostly presentational UI components (Header, Footer, ProductCard, QuickView, SellerProductCard, ImageDropzone, TrustBadges, etc.).
- `src/context/`: Global state providers + hooks (`CartContext`/`useCart`, `WishlistContext`/`useWishlist`, `ToastContext`/`useToast`).
- `src/data/`: Data-access layer — `products.js` (static mock catalog), `sellerProducts.js` (localStorage/IndexedDB-backed seller listings CRUD), `testimonials.js`.
- `src/hooks/`: Business-logic layer, one hook per page/complex component (see above).
- `src/services/`: `api.js` (axios instance), `productService.js` (mock-vs-API switch, the thing pages should actually import).
- `src/utils/`: `imageStore.js` (IndexedDB image blobs), `analytics.js` (local event log, inspect via `__creacionesAnalytics()` in the browser console; wire real GA by adding `gtag.js` to `index.html`), `currency.js`, `referral.js`, `recentlyViewed.js`, `recentSearches.js`, `socialProof.js`.
- `src/pages/`: Route-level views, all lazy-loaded except `Home`.
- `AGENTS.md` — this file (dev standards, always keep current).
- `ANALISIS.md` — architecture deep-dive in Spanish (hooks table, folder structure rationale).
- `SKILLS.md` — Clean Code / design-pattern / Tailwind / Stitch rules referenced above.
