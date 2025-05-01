/*
  Warnings:

  - Changed the type of `poster_id` on the `basket_items` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "basket_items" DROP COLUMN "poster_id",
ADD COLUMN     "poster_id" INTEGER NOT NULL;
