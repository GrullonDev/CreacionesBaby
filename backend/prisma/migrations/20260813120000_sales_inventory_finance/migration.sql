-- Sales inventory + finance ledger + stock audit trail.
--
-- Hand-authored (same as 20260805020000_add_order_details): the environment that
-- wrote it can't reach the local Postgres to run `prisma migrate dev`
-- interactively. Apply locally with `npm run prisma:migrate` (or
-- `npx prisma migrate deploy`) and then `npx prisma generate`.

-- CreateEnum
CREATE TYPE "SaleChannel" AS ENUM ('WEB', 'WHATSAPP', 'PRESENCIAL', 'FERIA', 'REDES', 'OTRO');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'CONTRA_ENTREGA', 'OTRO');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('ENTRADA', 'SALIDA', 'VENTA', 'DEVOLUCION', 'AJUSTE', 'MERMA');

-- CreateEnum
CREATE TYPE "EntryDirection" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "FinanceCategory" AS ENUM ('MATERIA_PRIMA', 'INVENTARIO', 'ENVIO', 'EMPAQUE', 'PUBLICIDAD', 'SERVICIOS', 'RENTA', 'SALARIOS', 'COMISIONES', 'IMPUESTOS', 'EQUIPO', 'OTRO_EGRESO', 'APORTE_CAPITAL', 'PRESTAMO', 'REEMBOLSO_PROVEEDOR', 'OTRO_INGRESO');

-- AlterTable: unit cost of goods (nullable — existing catalog has none)
ALTER TABLE "Product" ADD COLUMN     "cost" DECIMAL(10,2);

-- AlterTable: an Order is now a *sale* from any channel, not just web checkout
ALTER TABLE "Order" ADD COLUMN     "channel" "SaleChannel" NOT NULL DEFAULT 'WEB',
                    ADD COLUMN     "paymentMethod" "PaymentMethod",
                    ADD COLUMN     "soldAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    ADD COLUMN     "customerPhone" TEXT,
                    ADD COLUMN     "notes" TEXT,
                    ADD COLUMN     "recordedById" TEXT;

-- Backfill soldAt for rows that already existed, so reports don't bucket every
-- historical order into the migration date.
UPDATE "Order" SET "soldAt" = "createdAt";

-- A hand-entered sale (cash at a fair) has no shipping address, so these become
-- optional. Web checkout still requires them at the Zod layer in POST /orders.
ALTER TABLE "Order" ALTER COLUMN "addressName" DROP NOT NULL,
                    ALTER COLUMN "addressEmail" DROP NOT NULL,
                    ALTER COLUMN "addressLine" DROP NOT NULL,
                    ALTER COLUMN "addressCity" DROP NOT NULL,
                    ALTER COLUMN "addressZip" DROP NOT NULL;

-- AlterTable: snapshot unit cost per line so historical margin stays correct
ALTER TABLE "OrderItem" ADD COLUMN     "cost" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "StockMovement" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stockAfter" INTEGER NOT NULL,
    "reason" TEXT,
    "unitCost" DECIMAL(10,2),
    "orderId" TEXT,
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinanceEntry" (
    "id" TEXT NOT NULL,
    "direction" "EntryDirection" NOT NULL,
    "category" "FinanceCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "paymentMethod" "PaymentMethod",
    "counterparty" TEXT,
    "reference" TEXT,
    "receiptUrl" TEXT,
    "notes" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinanceEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Order_channel_idx" ON "Order"("channel");

-- CreateIndex
CREATE INDEX "Order_soldAt_idx" ON "Order"("soldAt");

-- CreateIndex
CREATE INDEX "Order_recordedById_idx" ON "Order"("recordedById");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "StockMovement_productId_idx" ON "StockMovement"("productId");

-- CreateIndex
CREATE INDEX "StockMovement_createdAt_idx" ON "StockMovement"("createdAt");

-- CreateIndex
CREATE INDEX "StockMovement_type_idx" ON "StockMovement"("type");

-- CreateIndex
CREATE INDEX "StockMovement_orderId_idx" ON "StockMovement"("orderId");

-- CreateIndex
CREATE INDEX "FinanceEntry_userId_idx" ON "FinanceEntry"("userId");

-- CreateIndex
CREATE INDEX "FinanceEntry_occurredAt_idx" ON "FinanceEntry"("occurredAt");

-- CreateIndex
CREATE INDEX "FinanceEntry_direction_idx" ON "FinanceEntry"("direction");

-- CreateIndex
CREATE INDEX "FinanceEntry_category_idx" ON "FinanceEntry"("category");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockMovement" ADD CONSTRAINT "StockMovement_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinanceEntry" ADD CONSTRAINT "FinanceEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
