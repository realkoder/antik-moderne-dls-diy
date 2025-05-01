-- CreateTable
CREATE TABLE "removed_format_prices" (
    "id" SERIAL NOT NULL,
    "format" "Format" NOT NULL,
    "price" INTEGER NOT NULL,
    "poster_id" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "removed_format_prices_pkey" PRIMARY KEY ("id")
);
