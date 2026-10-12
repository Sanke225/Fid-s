-- CreateEnum
CREATE TYPE "platform_fee_status" AS ENUM ('declared', 'confirmed', 'rejected', 'expired');

-- AlterEnum
ALTER TYPE "delivery_status" ADD VALUE 'fee_pending';

-- CreateTable
CREATE TABLE "platform_fees" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "provider" "payment_provider" NOT NULL,
    "payee_phone" TEXT NOT NULL,
    "amount_xof" INTEGER NOT NULL,
    "status" "platform_fee_status" NOT NULL DEFAULT 'declared',
    "payer_name" TEXT NOT NULL,
    "payer_phone" TEXT NOT NULL,
    "transaction_ref" TEXT NOT NULL,
    "decided_by_id" TEXT,
    "rejection_reason" TEXT,
    "declared_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "confirmed_for" TEXT,

    CONSTRAINT "platform_fees_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_fees_confirmed_for_key" ON "platform_fees"("confirmed_for");

-- CreateIndex
CREATE INDEX "platform_fees_delivery_id_status_idx" ON "platform_fees"("delivery_id", "status");

-- CreateIndex
CREATE INDEX "platform_fees_status_idx" ON "platform_fees"("status");

-- CreateIndex
CREATE UNIQUE INDEX "platform_fees_provider_transaction_ref_key" ON "platform_fees"("provider", "transaction_ref");

-- AddForeignKey
ALTER TABLE "platform_fees" ADD CONSTRAINT "platform_fees_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_fees" ADD CONSTRAINT "platform_fees_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
