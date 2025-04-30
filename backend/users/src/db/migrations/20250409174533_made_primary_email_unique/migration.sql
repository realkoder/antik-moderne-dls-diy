/*
  Warnings:

  - A unique constraint covering the columns `[primary_email_address_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "users_primary_email_address_id_key" ON "users"("primary_email_address_id");
