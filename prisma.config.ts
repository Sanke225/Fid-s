import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Un dossier : un fichier .prisma par domaine pour limiter les conflits de fusion.
  schema: "prisma/schema",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // process.env plutôt que env() : `prisma generate` (lancé au postinstall) doit marcher sans .env.
    url: process.env.DATABASE_URL,
  },
});
