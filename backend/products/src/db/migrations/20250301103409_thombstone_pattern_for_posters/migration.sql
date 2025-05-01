-- CreateTable
CREATE TABLE "removed_posters" (
    "id" SERIAL NOT NULL,
    "poster_id" INTEGER NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "removed_posters_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_posterId_deletedAt" ON "removed_posters"("poster_id", "deletedAt");

-- AddForeignKey
ALTER TABLE "removed_posters" ADD CONSTRAINT "removed_posters_poster_id_fkey" FOREIGN KEY ("poster_id") REFERENCES "posters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
