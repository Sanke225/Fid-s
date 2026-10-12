-- AlterTable
ALTER TABLE "projects" ADD COLUMN     "github_branch" TEXT,
ADD COLUMN     "github_installation_id" TEXT,
ADD COLUMN     "github_repo" TEXT;

-- AlterTable
ALTER TABLE "source_archives" ADD COLUMN     "git_commit_message" TEXT,
ADD COLUMN     "git_commit_sha" TEXT,
ADD COLUMN     "git_repo" TEXT;

-- CreateTable
CREATE TABLE "github_installations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "installation_id" BIGINT NOT NULL,
    "account_login" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "github_installations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "github_installations_installation_id_key" ON "github_installations"("installation_id");

-- CreateIndex
CREATE INDEX "github_installations_user_id_idx" ON "github_installations"("user_id");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_github_installation_id_fkey" FOREIGN KEY ("github_installation_id") REFERENCES "github_installations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "github_installations" ADD CONSTRAINT "github_installations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

