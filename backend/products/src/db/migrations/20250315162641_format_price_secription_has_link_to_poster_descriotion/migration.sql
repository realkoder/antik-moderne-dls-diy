/*
  Warnings:

  - You are about to drop the column `poster_id` on the `format_prices` table. All the data in the column will be lost.
  - Added the required column `poster_id` to the `format_price_descriptions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "format_prices" DROP CONSTRAINT "format_prices_poster_id_fkey";

-- AlterTable
ALTER TABLE "format_price_descriptions" ADD COLUMN     "poster_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "format_prices" DROP COLUMN "poster_id";

-- AddForeignKey
ALTER TABLE "format_price_descriptions" ADD CONSTRAINT "format_price_descriptions_poster_id_fkey" FOREIGN KEY ("poster_id") REFERENCES "poster_descriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
