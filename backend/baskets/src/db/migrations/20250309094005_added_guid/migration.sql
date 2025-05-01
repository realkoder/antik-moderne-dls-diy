-- AlterTable
ALTER TABLE "baskets" ADD COLUMN     "guid" TEXT,
ALTER COLUMN "user_id" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "baskets_guid_idx" ON "baskets"("guid");
