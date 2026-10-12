-- Acceptation des CGU (date + version) et suppression de compte par anonymisation.
ALTER TABLE "users" ADD COLUMN "terms_accepted_at" TIMESTAMPTZ,
ADD COLUMN "terms_version" TEXT,
ADD COLUMN "deleted_at" TIMESTAMPTZ;
