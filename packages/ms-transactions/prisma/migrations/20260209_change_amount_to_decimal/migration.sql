-- AlterTable: Change amount from Int to Decimal
-- This migration handles existing data by converting integers to decimal values
ALTER TABLE "transactions" ALTER COLUMN "amount" TYPE DECIMAL(19,2) USING amount::DECIMAL(19,2);
