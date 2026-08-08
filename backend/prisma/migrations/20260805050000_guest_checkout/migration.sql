-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- AlterTable
-- Orders can now be placed as a guest (no account) — userId becomes optional.
ALTER TABLE "Order" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
-- Changed from ON DELETE CASCADE to ON DELETE SET NULL: deleting a user who
-- placed orders while logged in should not delete their order history.
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
