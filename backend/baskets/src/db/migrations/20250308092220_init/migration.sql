-- CreateTable
CREATE TABLE "baskets" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "baskets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "basket_items" (
    "id" SERIAL NOT NULL,
    "poster_id" TEXT NOT NULL,
    "basket_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "basket_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "baskets_user_id_idx" ON "baskets"("user_id");

-- AddForeignKey
ALTER TABLE "basket_items" ADD CONSTRAINT "basket_items_basket_id_fkey" FOREIGN KEY ("basket_id") REFERENCES "baskets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
