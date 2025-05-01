-- CreateEnum
CREATE TYPE "Format" AS ENUM ('A4', 'Size_30x30_cm', 'Size_30x40_cm', 'Size_50x50', 'Size_50x70_cm', 'Size_70x70_cm', 'Size_70x100_cm', 'Size_100x100_cm', 'Size_100x140_cm');

-- CreateTable
CREATE TABLE "posters" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "artist_full_name" TEXT NOT NULL,
    "poster_image_url" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "posters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "format_prices" (
    "id" SERIAL NOT NULL,
    "format" "Format" NOT NULL,
    "price" INTEGER NOT NULL,
    "poster_id" INTEGER NOT NULL,

    CONSTRAINT "format_prices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "format_prices" ADD CONSTRAINT "format_prices_poster_id_fkey" FOREIGN KEY ("poster_id") REFERENCES "posters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
