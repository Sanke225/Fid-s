import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";

// Une seule instance partagée : en développement, le rechargement à chaud de Next.js
// recréerait sinon un client (et un pool de connexions) à chaque modification.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
  // Transactions interactives : 15 s au lieu de 5 s par défaut. En développement, une compilation à chaud
  // peut suspendre une requête plusieurs secondes ; en production, cela absorbe un pic de charge.
  return new PrismaClient({ adapter, transactionOptions: { timeout: 15_000, maxWait: 5_000 } });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
