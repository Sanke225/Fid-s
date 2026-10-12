-- CreateEnum
CREATE TYPE "project_status" AS ENUM ('unassigned', 'assigned', 'in_progress', 'finished');

-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "assigned_at" TIMESTAMPTZ,
ADD COLUMN     "client_user_id" TEXT,
ADD COLUMN     "finished_at" TIMESTAMPTZ,
ADD COLUMN     "started_at" TIMESTAMPTZ,
ADD COLUMN     "status" "project_status" NOT NULL DEFAULT 'unassigned';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "username" TEXT;

-- CreateIndex
CREATE INDEX "projects_client_user_id_idx" ON "projects"("client_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_client_user_id_fkey" FOREIGN KEY ("client_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Reprise des projets existants : un projet qui a déjà une livraison est assigné ; si sa démo a déjà été
-- montrée au client (demo_ready ou plus loin), il est considéré comme terminé pour ne rien lui retirer.
UPDATE "projects" p SET
  "status" = CASE
    WHEN EXISTS (SELECT 1 FROM "deliveries" d WHERE d."project_id" = p."id"
                 AND d."status" IN ('demo_ready', 'fee_pending', 'paid', 'handing_over', 'handover_failed', 'delivered'))
      THEN 'finished'::"project_status"
    ELSE 'assigned'::"project_status"
  END,
  "assigned_at" = p."created_at",
  "client_user_id" = (SELECT d."client_user_id" FROM "deliveries" d WHERE d."project_id" = p."id"
                      ORDER BY d."created_at" DESC LIMIT 1)
WHERE EXISTS (SELECT 1 FROM "deliveries" d WHERE d."project_id" = p."id");
