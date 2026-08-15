-- AlterTable
-- Order had zero rows before this feature shipped (no /orders route existed
-- yet), so the new required columns can be added NOT NULL with no default,
-- matching schema.prisma exactly (no drift on next `prisma migrate dev`).
ALTER TABLE "Order" ADD COLUMN     "discount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "shipping" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "promoCode" TEXT,
ADD COLUMN     "addressName" TEXT NOT NULL,
ADD COLUMN     "addressEmail" TEXT NOT NULL,
ADD COLUMN     "addressLine" TEXT NOT NULL,
ADD COLUMN     "addressCity" TEXT NOT NULL,
ADD COLUMN     "addressZip" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "selectedColor" TEXT,
ADD COLUMN     "selectedSize" TEXT;

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
