#!/usr/bin/env bash
#
# One-shot helper: commits the sales/inventory/finance work in six logical commits
# instead of one giant blob.
#
#   cd /Volumes/WorkDiskDev/DevTools/react_native_projects/CreacionesBaby
#   bash commit-inventory-module.sh
#
# It stages explicit paths only — never `git add -A` — so nothing unexpected gets
# swept in. Nothing is pushed. Delete this file once it has run.
#
set -euo pipefail

cd "$(dirname "$0")"

if [ ! -d .git ]; then
  echo "Not a git repository. Run this from the repo root." >&2
  exit 1
fi

echo "Branch: $(git branch --show-current)"
echo

# Stage only the paths that actually exist, so a missing file is a warning rather
# than an abort halfway through the sequence.
stage() {
  local missing=0
  for path in "$@"; do
    if [ -e "$path" ]; then
      git add -- "$path"
    else
      echo "  ! skipped (not found): $path" >&2
      missing=1
    fi
  done
  return 0
}

# Commit only if something is actually staged — makes the script safe to re-run.
commit() {
  local message="$1"
  if git diff --cached --quiet; then
    echo "  · nothing staged, skipping"
    return 0
  fi
  git commit --quiet -m "$message"
  echo "  ✓ $(git log -1 --format='%h %s')"
}

TRAILERS="

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01GdfaBBRgy46uNkiyXnMZHc"


# ---------------------------------------------------------------------------
echo "1/6  Pending work from the previous session"
# ---------------------------------------------------------------------------
# Not part of the inventory module — the seller-portal design pass, the admin
# seeding scripts and the Stitch config templates were already sitting
# uncommitted in the working tree. Separated out so the module's diff is readable.
stage \
  .gitignore \
  .mcp.json.example \
  backend/.env.example \
  backend/prisma/listUsers.js \
  backend/prisma/seedAdmin.js \
  seller-portal/.mcp.json.example \
  seller-portal/src/components/AuthLayout.jsx \
  seller-portal/src/components/ProductRow.jsx \
  seller-portal/src/pages/Configuracion.jsx \
  seller-portal/src/pages/Login.jsx \
  seller-portal/src/pages/Products.jsx \
  seller-portal/src/pages/Register.jsx
commit "chore: check in pending seller-portal and tooling work

Was already uncommitted in the working tree before the inventory module:
the seller-portal design pass (AuthLayout split-panel login/register, the
product grid card, the read-only Configuracion page), the admin seeding
and user-listing scripts, the Stitch .mcp.json templates, and the second
dev origin in the backend's CORS example.

Committed separately so the inventory module that follows has a diff you
can actually read.${TRAILERS}"


# ---------------------------------------------------------------------------
echo "2/6  Backend: sales, finance, stock and reports"
# ---------------------------------------------------------------------------
stage \
  backend/prisma/schema.prisma \
  backend/prisma/migrations/20260813120000_sales_inventory_finance \
  backend/src/lib/sales.js \
  backend/src/routes/sales.js \
  backend/src/routes/finance.js \
  backend/src/routes/stock.js \
  backend/src/routes/reports.js \
  backend/src/app.js \
  backend/src/routes/products.js \
  backend/src/routes/orders.js
commit "feat(backend): record sales from any channel, expenses and stock movements

An Order is now a *sale* whatever channel it came from, discriminated by
\`channel\` (WEB / WHATSAPP / PRESENCIAL / FERIA / REDES / OTRO), so 'all my
sales' is one query rather than a union of two sources that drift apart.
Adds \`soldAt\` as the backdatable business date that reports group by,
\`paymentMethod\`, \`customerPhone\`, \`notes\` and \`recordedById\`, and makes the
address columns nullable — a cash sale at a fair has no shipping address.
Web checkout still requires them at the Zod layer, so it is unaffected.

New tables: StockMovement (signed delta + resulting level, written in the
same transaction as every stock change) and FinanceEntry (one ledger for
non-sale income and all expenses, with the category validated against its
direction).

New routes: GET/POST /sales, GET/PATCH /sales/:id, GET/POST/PUT/DELETE
/finance-entries, GET/POST /stock-movements, GET /reports/summary.
Sale visibility lives in one place (lib/sales.js) because a seller sees
sales containing their own products — almost every web order is a guest
order, so the buyer id can't be used. Cancelling a sale restores stock and
records DEVOLUCION movements; there is deliberately no DELETE.

Product gains an optional \`cost\`, kept off the public payload by a separate
serialiser, and OrderItem snapshots it so historical margin stays correct.

Also fixes a real bug in POST /orders: quantities are now netted per product
before the stock check, so two cart lines of the same item can no longer each
pass and jointly oversell.

Closes roadmap items 2, 3 and 4 (seller-scoped order list, admin surface,
order status transitions).

The migration SQL is hand-written — this environment can't reach Prisma's
engine downloads — but was applied against a real PostgreSQL 16 and the
resulting columns, enums, indexes and foreign keys verified against the
schema. Run \`npx prisma migrate deploy\` locally to apply it.${TRAILERS}"


# ---------------------------------------------------------------------------
echo "3/6  Backend: test suite"
# ---------------------------------------------------------------------------
stage backend/test backend/package.json
commit "test(backend): cover the money and stock logic

35 tests via \`npm test\`. A fake in-memory Prisma is injected into the real
route handlers through Fastify \`inject\`, so auth, ownership checks, Zod
validation and all the arithmetic run for real and only the database is
swapped out — no PostgreSQL needed, so it runs anywhere.

Covers the places where a bug costs money: totals with a negotiated unit
price, oversell rejection including the two-lines-same-product case, stock
decrement and movement on sale, stock restored on cancel and taken back out
on reopen, seller scoping of GET /sales, ledger category validation, and the
COGS/margin arithmetic in /reports/summary. Also asserts that \`cost\` never
appears on the public product payload.${TRAILERS}"


# ---------------------------------------------------------------------------
echo "4/6  Seller portal: the back office"
# ---------------------------------------------------------------------------
stage \
  seller-portal/src/App.jsx \
  seller-portal/src/index.css \
  seller-portal/src/components/Badge.jsx \
  seller-portal/src/components/DateRangeFilter.jsx \
  seller-portal/src/components/IncomeExpenseChart.jsx \
  seller-portal/src/components/Layout.jsx \
  seller-portal/src/components/LineItemsEditor.jsx \
  seller-portal/src/components/MagnitudeBars.jsx \
  seller-portal/src/components/Modal.jsx \
  seller-portal/src/components/StatCard.jsx \
  seller-portal/src/hooks/useFinanceEntries.js \
  seller-portal/src/hooks/useProductForm.js \
  seller-portal/src/hooks/useReportSummary.js \
  seller-portal/src/hooks/useSaleForm.js \
  seller-portal/src/hooks/useSales.js \
  seller-portal/src/hooks/useStockMovements.js \
  seller-portal/src/pages/Dashboard.jsx \
  seller-portal/src/pages/Finance.jsx \
  seller-portal/src/pages/Inventory.jsx \
  seller-portal/src/pages/ProductForm.jsx \
  seller-portal/src/pages/Reports.jsx \
  seller-portal/src/pages/SaleForm.jsx \
  seller-portal/src/pages/Sales.jsx \
  seller-portal/src/utils/csv.js \
  seller-portal/src/utils/dates.js \
  seller-portal/src/utils/salesConstants.js
commit "feat(seller-portal): sales entry, cash ledger, stock history, real reports

/ventas is the unified list — web and hand-entered together — with period,
channel, status and search filters, inline status changes and CSV export.
/ventas/nueva is the entry form the whole module exists for: searchable
product picker, catalog price prefilled but editable, oversell warning
counting every line of that product, live totals and margin, backdatable
date, and 'Guardar y otra' for entering a batch from one fair.

/finanzas is the ingresos/egresos ledger. /inventario keeps the stock table
and adds a movements tab plus an 'ajustar stock' action. /reportes replaces
its ComingSoon block with real figures from /reports/summary, and the
dashboard shows real KPIs instead of product counts. The product form gains
a cost field with a live per-unit margin.

Cancelling a sale now asks first, since it also returns stock to inventory.

Chart colours are CSS custom properties in index.css; light and dark are
separately chosen steps, each validated against the surface it sits on for
contrast and colour-vision separation. StatCard was extracted from the three
pages that had copy-pasted it.${TRAILERS}"


# ---------------------------------------------------------------------------
echo "5/6  Storefront: role-gated /admin"
# ---------------------------------------------------------------------------
stage \
  src/App.jsx \
  src/index.css \
  src/services/api.js \
  src/components/AdminRoute.jsx \
  src/components/admin \
  src/context/AdminAuthContext.jsx \
  src/context/useAdminAuth.js \
  src/hooks/useFinanceEntries.js \
  src/hooks/useReportSummary.js \
  src/hooks/useSaleForm.js \
  src/hooks/useSales.js \
  src/pages/AdminLogin.jsx \
  src/pages/admin \
  src/utils/csv.js \
  src/utils/dates.js \
  src/utils/salesConstants.js
commit "feat(storefront): role-gated /admin back office; retire /vendedor

The phone surface: register a sale the moment it happens, log an expense
standing at the fabric shop, check the numbers. Same hooks and endpoints as
the seller portal, different layout — one column, customer fields behind a
<details>, sticky total, always-open expense form, bottom tab bar.

App.jsx is now two layout route groups so admin screens render without the
shop's header, footer, WhatsApp button and newsletter popup. Auth is a
SELLER/ADMIN-only context with the token attached by a request interceptor;
public product calls and guest checkout are unaffected.

The old client-only seller module is superseded: /vendedor* redirects to
/admin. Its pages and hooks are now unreferenced and can be removed —
src/data/sellerProducts.js and src/utils/imageStore.js must stay, since
productService.js still uses them for offline mock mode.${TRAILERS}"


# ---------------------------------------------------------------------------
echo "6/6  Documentation"
# ---------------------------------------------------------------------------
stage CLAUDE.md LAUNCH.md SERVIDOR.md AGENTS.md ANALISIS.md SKILLS.md README.md
commit "docs: add CLAUDE.md and document the inventory module

CLAUDE.md is new and is the file to read first: the map of the three apps,
how to run them, the eleven business invariants that must not be broken, the
pre-flight verification commands, the environment traps (Prisma's engine
downloads unreachable, vite build EPERM on a mounted volume, npm quietly
bumping version ranges), and an honest list of what is deliberately not built.

AGENTS.md gains a full section on the sales/inventory/finance module and has
roadmap items 2, 3 and 4 marked done. SKILLS.md gains two rule sets —
sales-inventory-and-money-integrity and data-visualization-and-metrics-ui —
and three stale entries were corrected. ANALISIS.md documents the
architecture decisions in Spanish.

LAUNCH.md is also new: the audited list of what is left before this runs in
production — backups, token expiry, rate limiting, a hosting recommendation
and the ordered plan, blockers first.

README.md was rewritten; it described only the storefront and predated the
backend, the seller portal and this whole module.${TRAILERS}"


# ---------------------------------------------------------------------------
echo
echo "Done. Six commits:"
git log --oneline -6
echo
echo "Still uncommitted (expected — nothing else should appear here):"
git status --short
echo
cat <<'NOTE'
Next, if you want it:

  # the superseded client-only seller module, now unreferenced
  git rm src/pages/SellerDashboard.jsx src/pages/SellerProductForm.jsx \
         src/hooks/useSellerProducts.js src/hooks/useSellerProductForm.js \
         src/components/SellerProductCard.jsx src/components/ImageDropzone.jsx
  git commit -m "chore: remove the superseded client-only seller module"

  # and this helper
  rm commit-inventory-module.sh
NOTE
