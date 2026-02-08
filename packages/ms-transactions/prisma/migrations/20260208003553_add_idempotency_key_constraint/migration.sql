/*
  Warnings:

  - A unique constraint covering the columns `[user_id,idempotency_key]` on the table `transactions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idempotency_key` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "idempotency_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "transactions_user_id_idempotency_key_key" ON "transactions"("user_id", "idempotency_key");
