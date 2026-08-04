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
- Business logic goes in `src/hooks/`, not in components/pages — see [SKILLS.md](SKILLS.md) for the full clean-code/architecture rules (SRP, container/presenter split, a11y, dark mode, Tailwind mobile-first).
- Global/shared state goes through Context providers in `src/context/`, synced to `localStorage`/IndexedDB inside the provider or a dedicated `src/utils/` or `src/data/` module — never scattered `localStorage` calls in components.
- New pages must be registered in `src/App.jsx` (lazy-loaded) and in `src/hooks/usePageTitle.js` usage for the document title.

## 🖥️ Backend (`backend/`)
A Fastify + Prisma + PostgreSQL API is being built in [backend/](backend/) (branch `feature/backend-api-setup`), matching the REST shape `src/services/api.js` already expects — once it's running, pointing the frontend's `VITE_API_URL` at it is the only frontend change needed.
- **Stack**: Fastify 5, Prisma 6, PostgreSQL, `@fastify/jwt` + `bcryptjs` for auth, `zod` for request validation.
- **Setup**: `cd backend`, `npm install`, copy `.env.example` → `.env` (needs `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`), `npm run prisma:migrate` to create the schema, `npm run seed` to load the mock catalog (`src/data/products.js`) into the DB, `npm run dev` to start the API (default `http://localhost:4000`).
- **Schema** ([backend/prisma/schema.prisma](backend/prisma/schema.prisma)): `User` (with `Role`: USER/SELLER/ADMIN), `Product` + `ProductImage`, `Order` + `OrderItem`. `Product.sellerId` nullable — null means official catalog item, set means a seller listing (replaces the client-only `sellerProducts.js`/IndexedDB approach once wired up).
- **Routes** (`backend/src/routes/`): `GET/POST/PUT/DELETE /products`, `GET /categories`, `POST /auth/register`, `POST /auth/login`, `GET /auth/me`. Product responses are serialized to the same shape the frontend already consumes (`image`/`images`, `inStock`, `isSellerProduct`, etc.).
- **Not yet done**: cart/checkout/orders endpoints (frontend still handles these client-side only), wiring the frontend's seller module (`src/data/sellerProducts.js`, `src/hooks/useSellerProducts.js`, `src/hooks/useSellerProductForm.js`) to call this API instead of localStorage/IndexedDB, and real image upload (currently seed data reuses the mock catalog's external image URLs).

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
