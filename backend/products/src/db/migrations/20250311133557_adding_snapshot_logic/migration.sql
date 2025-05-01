-- CreateTable
CREATE TABLE "poster_snapshots" (
    "id" SERIAL NOT NULL,
    "poster_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "artist_full_name" TEXT NOT NULL,
    "poster_image_url" TEXT NOT NULL,
    "format_prices" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "poster_snapshots_pkey" PRIMARY KEY ("id")
);
