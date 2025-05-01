/*
  Warnings:

  - Added the required column `artistFullName` to the `removed_posters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `posterImageUrl` to the `removed_posters` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `removed_posters` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "removed_posters" DROP CONSTRAINT "removed_posters_poster_id_fkey";

-- AlterTable
ALTER TABLE "removed_posters" ADD COLUMN     "artistFullName" TEXT NOT NULL,
ADD COLUMN     "posterImageUrl" TEXT NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
