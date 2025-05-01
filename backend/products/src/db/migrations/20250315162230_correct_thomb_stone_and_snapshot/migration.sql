/*
  Warnings:

  - You are about to drop the column `format` on the `format_prices` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `format_prices` table. All the data in the column will be lost.
  - You are about to drop the column `artist_full_name` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `poster_image_url` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `posters` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `removed_format_prices` table. All the data in the column will be lost.
  - You are about to drop the column `format` on the `removed_format_prices` table. All the data in the column will be lost.
  - You are about to drop the column `poster_id` on the `removed_format_prices` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `removed_format_prices` table. All the data in the column will be lost.
  - You are about to drop the column `artistFullName` on the `removed_posters` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `removed_posters` table. All the data in the column will be lost.
  - You are about to drop the column `posterImageUrl` on the `removed_posters` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `removed_posters` table. All the data in the column will be lost.
  - You are about to drop the `poster_snapshots` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[format_price_id]` on the table `removed_format_prices` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[poster_id]` on the table `removed_posters` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `format_price_id` to the `removed_format_prices` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "format_prices" DROP CONSTRAINT "format_prices_poster_id_fkey";

-- AlterTable
ALTER TABLE "format_prices" DROP COLUMN "format",
DROP COLUMN "price";

-- AlterTable
ALTER TABLE "posters" DROP COLUMN "artist_full_name",
DROP COLUMN "created_at",
DROP COLUMN "poster_image_url",
DROP COLUMN "title",
DROP COLUMN "updated_at";

-- AlterTable
ALTER TABLE "removed_format_prices" DROP COLUMN "deletedAt",
DROP COLUMN "format",
DROP COLUMN "poster_id",
DROP COLUMN "price",
ADD COLUMN     "format_price_id" INTEGER NOT NULL,
ADD COLUMN     "removed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "removed_posters" DROP COLUMN "artistFullName",
DROP COLUMN "deletedAt",
DROP COLUMN "posterImageUrl",
DROP COLUMN "title",
ADD COLUMN     "removed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "poster_snapshots";

-- CreateTable
CREATE TABLE "poster_descriptions" (
    "id" SERIAL NOT NULL,
    "poster_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "artist_full_name" TEXT NOT NULL,
    "poster_image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poster_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "format_price_descriptions" (
    "id" SERIAL NOT NULL,
    "format_price_id" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "format" "Format" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "format_price_descriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "removed_format_prices_format_price_id_key" ON "removed_format_prices"("format_price_id");

-- CreateIndex
CREATE UNIQUE INDEX "removed_posters_poster_id_key" ON "removed_posters"("poster_id");

-- AddForeignKey
ALTER TABLE "poster_descriptions" ADD CONSTRAINT "poster_descriptions_poster_id_fkey" FOREIGN KEY ("poster_id") REFERENCES "posters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "removed_posters" ADD CONSTRAINT "removed_posters_poster_id_fkey" FOREIGN KEY ("poster_id") REFERENCES "posters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "format_prices" ADD CONSTRAINT "format_prices_poster_id_fkey" FOREIGN KEY ("poster_id") REFERENCES "poster_descriptions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "format_price_descriptions" ADD CONSTRAINT "format_price_descriptions_format_price_id_fkey" FOREIGN KEY ("format_price_id") REFERENCES "format_prices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "removed_format_prices" ADD CONSTRAINT "removed_format_prices_format_price_id_fkey" FOREIGN KEY ("format_price_id") REFERENCES "format_prices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
