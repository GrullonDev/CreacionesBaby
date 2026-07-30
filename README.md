# Creaciones Baby — Modern Heritage Babywear

E-commerce platform for baby products, baby gear, streaming subscriptions, and smart tech — built with **React 19**, **Vite 8**, and **Tailwind CSS**.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 |
| Build Tool | Vite 8 |
| Styling | Tailwind CSS 4 (CDN) |
| Routing | react-router-dom v7 |
| Linting | Oxlint 1.75 |
| Design Sync | Google Stitch (MCP) |
| Icons | Material Symbols / Material Icons Outlined |
| Fonts | Manrope (Google Fonts) |

## Project Structure

```
creaciones_baby/
├── public/
├── src/
│   ├── assets/          # Static images (hero.png, icons)
│   ├── components/      # Reusable UI components
│   │   ├── Footer.jsx
│   │   ├── Header.jsx
│   │   ├── ImageCarousel.jsx
│   │   ├── Pagination.jsx
│   │   ├── ProductCard.jsx
│   │   ├── QuickView.jsx
│   │   └── Rating.jsx
│   ├── context/         # React Context providers
│   │   ├── CartContext.jsx     # Cart state + localStorage
│   │   └── WishlistContext.jsx # Wishlist state + localStorage
│   ├── data/
│   │   └── products.js  # Product catalog (static data)
│   ├── pages/           # Route pages
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   ├── ProductDetail.jsx
│   │   ├── Cart.jsx
│   │   ├── Checkout.jsx
│   │   ├── Account.jsx
│   │   ├── Orders.jsx
│   │   └── Streaming.jsx
│   ├── App.jsx          # Root with router + providers
│   ├── App.css
│   ├── index.css        # Global styles + animations
│   └── main.jsx         # Entry point
├── index.html           # HTML shell + Tailwind config
├── vite.config.js
├── .oxlintrc.json       # Linter rules
├── .gitignore
├── .vscode/
│   └── mcp.json         # Stitch MCP config (design sync)
└── package.json
```

## Routes

| Path | Page | Description |
|------|------|-------------|
| `/` | Home | Landing page with featured products |
| `/products` | Products | Full product catalog |
| `/product/:id` | ProductDetail | Single product view |
| `/cart` | Cart | Shopping cart |
| `/checkout` | Checkout | Order checkout |
| `/account` | Account | User account |
| `/orders` | Orders | Order history |
| `/streaming` | Streaming | Streaming subscriptions |

## Setup

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Opens at `http://localhost:5173` with hot module replacement.

### Build

```bash
npm run build
```

Output goes to `dist/`.

### Preview production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

Uses [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) with React rules.

## Features

- **Cart** — Add/remove/update items, persisted to `localStorage`
- **Wishlist** — Toggle favorites, persisted to `localStorage`
- **Dark mode** — Toggle via Tailwind `dark:` classes (set `dark` class on `<html>`)
- **Responsive** — Mobile-first layout with Tailwind
- **Glassmorphism header** — Backdrop blur effect
- **Quick View** — Inline product preview modal
- **Image carousel** — Product image gallery
- **Related products** — Category-based suggestions
- **Streaming subscriptions** — Digital product cards with monthly plans

## Design (Stitch)

Designs are managed in **Google Stitch**. The VS Code MCP server is configured in `.vscode/mcp.json` for direct design-to-code sync.

To connect:

1. Open the project in VS Code
2. The Stitch MCP server auto-connects using the configured API key
3. Access Stitch designs through the MCP integration

## Environment Variables

None required. The project uses static product data and CDN-delivered Tailwind CSS.

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge) — ES module-based build.

## License

Private — All rights reserved.
