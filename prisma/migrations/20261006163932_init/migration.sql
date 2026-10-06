-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('dev', 'client', 'admin');

-- CreateEnum
CREATE TYPE "delivery_status" AS ENUM ('draft', 'building', 'build_failed', 'demo_ready', 'paid', 'handing_over', 'handover_failed', 'delivered', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "handover_status" AS ENUM ('running', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "backup_kind" AS ENUM ('initial', 'nightly', 'manual');

-- CreateEnum
CREATE TYPE "backup_status" AS ENUM ('running', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "payment_provider" AS ENUM ('wave', 'orange_money', 'moov_money', 'mtn_momo');

-- CreateEnum
CREATE TYPE "payment_status" AS ENUM ('declared', 'confirmed', 'rejected', 'expired');

-- CreateEnum
CREATE TYPE "ticket_status" AS ENUM ('open', 'awaiting_dev', 'resolved_released', 'resolved_rejected');

-- CreateEnum
CREATE TYPE "build_status" AS ENUM ('queued', 'running', 'succeeded', 'failed');

-- CreateEnum
CREATE TYPE "log_stream" AS ENUM ('stdout', 'stderr', 'system');

-- CreateEnum
CREATE TYPE "space_kind" AS ENUM ('demo', 'client');

-- CreateEnum
CREATE TYPE "space_status" AS ENUM ('provisioning', 'running', 'failed', 'destroyed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "role" "user_role",
    "phone" TEXT,
    "business_name" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "token" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "account_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "id_token" TEXT,
    "access_token_expires_at" TIMESTAMPTZ,
    "refresh_token_expires_at" TIMESTAMPTZ,
    "scope" TEXT,
    "password" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verifications" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "public_token" TEXT NOT NULL,
    "status" "delivery_status" NOT NULL DEFAULT 'draft',
    "amount_xof" INTEGER NOT NULL,
    "include_source" BOOLEAN NOT NULL DEFAULT true,
    "client_name" TEXT NOT NULL,
    "client_email" TEXT,
    "client_phone" TEXT,
    "client_user_id" TEXT,
    "client_access_token" TEXT,
    "current_build_id" TEXT,
    "failure_code" TEXT,
    "failure_message" TEXT,
    "expires_at" TIMESTAMPTZ,
    "paid_at" TIMESTAMPTZ,
    "delivered_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL DEFAULT '{}',
    "actor" TEXT NOT NULL,
    "occurred_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dispatched_at" TIMESTAMPTZ,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "handovers" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "status" "handover_status" NOT NULL DEFAULT 'running',
    "current_step" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "admin_password_encrypted" BYTEA,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ,

    CONSTRAINT "handovers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount_xof" INTEGER NOT NULL,
    "seller" JSONB NOT NULL,
    "buyer" JSONB NOT NULL,
    "pdf_path" TEXT NOT NULL,
    "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "backups" (
    "id" TEXT NOT NULL,
    "space_id" TEXT,
    "kind" "backup_kind" NOT NULL,
    "status" "backup_status" NOT NULL DEFAULT 'running',
    "storage_path" TEXT,
    "remote_path" TEXT,
    "size_bytes" BIGINT,
    "sha256" TEXT,
    "started_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finished_at" TIMESTAMPTZ,
    "restore_tested_at" TIMESTAMPTZ,

    CONSTRAINT "backups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payout_methods" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "provider" "payment_provider" NOT NULL,
    "phone" TEXT NOT NULL,
    "label" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "payout_methods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "payout_method_id" TEXT NOT NULL,
    "provider" "payment_provider" NOT NULL,
    "payee_phone" TEXT NOT NULL,
    "amount_xof" INTEGER NOT NULL,
    "status" "payment_status" NOT NULL DEFAULT 'declared',
    "payer_name" TEXT NOT NULL,
    "payer_phone" TEXT NOT NULL,
    "transaction_ref" TEXT NOT NULL,
    "payer_token" TEXT NOT NULL,
    "decided_by_id" TEXT,
    "rejection_reason" TEXT,
    "declared_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decided_at" TIMESTAMPTZ,
    "expires_at" TIMESTAMPTZ NOT NULL,
    "confirmed_for" TEXT,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "payment_id" TEXT NOT NULL,
    "opened_by_id" TEXT,
    "status" "ticket_status" NOT NULL DEFAULT 'open',
    "client_claim" TEXT NOT NULL,
    "client_proofs" TEXT[],
    "dev_answer" TEXT,
    "dev_proofs" TEXT[],
    "dev_due_at" TIMESTAMPTZ,
    "resolved_by_id" TEXT,
    "resolution" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "resolved_at" TIMESTAMPTZ,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "source_archives" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "size_bytes" BIGINT NOT NULL,
    "sha256" TEXT NOT NULL,
    "storage_path" TEXT NOT NULL,
    "wrapped_key" BYTEA NOT NULL,
    "iv" BYTEA NOT NULL,
    "auth_tag" BYTEA NOT NULL,
    "uploaded_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purged_at" TIMESTAMPTZ,

    CONSTRAINT "source_archives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_env_vars" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value_encrypted" BYTEA NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "delivery_env_vars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "builds" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "source_archive_id" TEXT NOT NULL,
    "status" "build_status" NOT NULL DEFAULT 'queued',
    "manifest" JSONB,
    "image_ref" TEXT,
    "failure_stage" TEXT,
    "failure_message" TEXT,
    "queued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "started_at" TIMESTAMPTZ,
    "finished_at" TIMESTAMPTZ,

    CONSTRAINT "builds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "build_logs" (
    "id" TEXT NOT NULL,
    "build_id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "stream" "log_stream" NOT NULL,
    "line" TEXT NOT NULL,
    "at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "build_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "spaces" (
    "id" TEXT NOT NULL,
    "delivery_id" TEXT NOT NULL,
    "kind" "space_kind" NOT NULL,
    "status" "space_status" NOT NULL DEFAULT 'provisioning',
    "hostname" TEXT NOT NULL,
    "image_ref" TEXT NOT NULL,
    "container_name" TEXT NOT NULL,
    "network_name" TEXT NOT NULL,
    "db_name" TEXT NOT NULL,
    "db_user" TEXT NOT NULL,
    "db_password_encrypted" BYTEA NOT NULL,
    "env_encrypted" BYTEA NOT NULL,
    "idempotency_key" TEXT NOT NULL,
    "last_health_at" TIMESTAMPTZ,
    "failure_stage" TEXT,
    "failure_message" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "destroyed_at" TIMESTAMPTZ,

    CONSTRAINT "spaces_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "accounts_user_id_idx" ON "accounts"("user_id");

-- CreateIndex
CREATE INDEX "verifications_identifier_idx" ON "verifications"("identifier");

-- CreateIndex
CREATE INDEX "projects_owner_id_idx" ON "projects"("owner_id");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_public_token_key" ON "deliveries"("public_token");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_client_access_token_key" ON "deliveries"("client_access_token");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_current_build_id_key" ON "deliveries"("current_build_id");

-- CreateIndex
CREATE INDEX "deliveries_project_id_idx" ON "deliveries"("project_id");

-- CreateIndex
CREATE INDEX "deliveries_client_user_id_idx" ON "deliveries"("client_user_id");

-- CreateIndex
CREATE INDEX "deliveries_status_idx" ON "deliveries"("status");

-- CreateIndex
CREATE INDEX "events_delivery_id_occurred_at_idx" ON "events"("delivery_id", "occurred_at");

-- CreateIndex
CREATE INDEX "events_dispatched_at_idx" ON "events"("dispatched_at");

-- CreateIndex
CREATE UNIQUE INDEX "handovers_delivery_id_key" ON "handovers"("delivery_id");

-- CreateIndex
CREATE UNIQUE INDEX "handovers_payment_id_key" ON "handovers"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_delivery_id_key" ON "invoices"("delivery_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_payment_id_key" ON "invoices"("payment_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE INDEX "backups_space_id_idx" ON "backups"("space_id");

-- CreateIndex
CREATE UNIQUE INDEX "payout_methods_user_id_provider_phone_key" ON "payout_methods"("user_id", "provider", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "payments_payer_token_key" ON "payments"("payer_token");

-- CreateIndex
CREATE UNIQUE INDEX "payments_confirmed_for_key" ON "payments"("confirmed_for");

-- CreateIndex
CREATE INDEX "payments_delivery_id_status_idx" ON "payments"("delivery_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "payments_provider_transaction_ref_key" ON "payments"("provider", "transaction_ref");

-- CreateIndex
CREATE INDEX "tickets_delivery_id_idx" ON "tickets"("delivery_id");

-- CreateIndex
CREATE INDEX "tickets_status_idx" ON "tickets"("status");

-- CreateIndex
CREATE INDEX "source_archives_delivery_id_idx" ON "source_archives"("delivery_id");

-- CreateIndex
CREATE UNIQUE INDEX "delivery_env_vars_delivery_id_name_key" ON "delivery_env_vars"("delivery_id", "name");

-- CreateIndex
CREATE INDEX "builds_delivery_id_idx" ON "builds"("delivery_id");

-- CreateIndex
CREATE INDEX "builds_status_idx" ON "builds"("status");

-- CreateIndex
CREATE UNIQUE INDEX "build_logs_build_id_seq_key" ON "build_logs"("build_id", "seq");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_hostname_key" ON "spaces"("hostname");

-- CreateIndex
CREATE UNIQUE INDEX "spaces_idempotency_key_key" ON "spaces"("idempotency_key");

-- CreateIndex
CREATE INDEX "spaces_delivery_id_idx" ON "spaces"("delivery_id");

-- CreateIndex
CREATE INDEX "spaces_kind_status_idx" ON "spaces"("kind", "status");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_client_user_id_fkey" FOREIGN KEY ("client_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_current_build_id_fkey" FOREIGN KEY ("current_build_id") REFERENCES "builds"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handovers" ADD CONSTRAINT "handovers_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "handovers" ADD CONSTRAINT "handovers_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "backups" ADD CONSTRAINT "backups_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payout_methods" ADD CONSTRAINT "payout_methods_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_payout_method_id_fkey" FOREIGN KEY ("payout_method_id") REFERENCES "payout_methods"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_decided_by_id_fkey" FOREIGN KEY ("decided_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_opened_by_id_fkey" FOREIGN KEY ("opened_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "source_archives" ADD CONSTRAINT "source_archives_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "delivery_env_vars" ADD CONSTRAINT "delivery_env_vars_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "builds" ADD CONSTRAINT "builds_source_archive_id_fkey" FOREIGN KEY ("source_archive_id") REFERENCES "source_archives"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "build_logs" ADD CONSTRAINT "build_logs_build_id_fkey" FOREIGN KEY ("build_id") REFERENCES "builds"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "spaces" ADD CONSTRAINT "spaces_delivery_id_fkey" FOREIGN KEY ("delivery_id") REFERENCES "deliveries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
