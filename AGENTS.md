# Dev Environment Tips

## 🚀 Getting Started
- Use `npm install` to install all required dependencies and keep the project up to date.
- Use `npm run dev` to launch the Vite local development server with Hot Module Replacement (HMR).

## 🛠️ Tech Stack Overview
- **Framework & Build**: React 19 + Vite 8
- **Routing**: `react-router-dom` v7
- **Styling**: Tailwind CSS v4
- **State Management**: React Context (`CartContext`, `WishlistContext`) with `localStorage` persistence.
- **Design System**: Google Stitch (MCP) synchronization.

## ⚡ Quality & Code Standards
- **Linter**: Use `npx oxlint` (or the configured npm script) for ultra-fast static code analysis before committing changes.
- Ensure all new components are modular and placed in `src/components/`.
- Ensure new page views are mapped in `react-router-dom` within `src/pages/`.

## 📁 Key Directories
- `src/components/`: Reusable UI components (Header, Footer, ProductCard, QuickView, etc.).
- `src/context/`: Global state management (`CartContext.jsx`, `WishlistContext.jsx`).
- `src/data/`: Static mock data (`products.js`).
- `src/pages/`: Main application routes (Home, Products, ProductDetail, Cart, Checkout, Streaming, etc.).