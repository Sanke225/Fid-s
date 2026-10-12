import { prisma } from "@/lib/db";
import { transition } from "@/lib/core/transitions";
import { processBuild } from "./build";

// Boucle du worker : prend les installations en file une par une (pnpm worker).
// Plusieurs workers peuvent tourner : SKIP LOCKED garantit qu'une installation n'est prise qu'une fois.

const POLL_MS = 2000;
let stopping = false;

async function claimNext() {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    UPDATE builds SET status = 'running', started_at = now()
    WHERE id = (SELECT id FROM builds WHERE status = 'queued' ORDER BY queued_at FOR UPDATE SKIP LOCKED LIMIT 1)
    RETURNING id`;
  return rows[0]?.id ?? null;
}

// Au démarrage : une installation « en cours » a été interrompue (arrêt, plantage). On la déclare échouée.
async function recoverInterrupted() {
  const stuck = await prisma.build.findMany({ where: { status: "running" }, select: { id: true, deliveryId: true } });
  for (const b of stuck) {
    await prisma.build.update({
      where: { id: b.id },
      data: { status: "failed", failureStage: "build", failureMessage: "Installation interrompue. Renvoyez le code.", finishedAt: new Date() },
    });
    await transition(b.deliveryId, { type: "build.failed", actor: "system", payload: { buildId: b.id, stage: "build", message: "Installation interrompue." } }).catch(() => {});
  }
  if (stuck.length) console.log(`[worker] ${stuck.length} installation(s) interrompue(s) marquée(s) en échec`);
}

async function main() {
  console.log("[worker] démarré");
  await recoverInterrupted();
  while (!stopping) {
    const id = await claimNext().catch((e) => {
      console.error("[worker] file d'attente", e);
      return null;
    });
    if (!id) {
      await new Promise((r) => setTimeout(r, POLL_MS));
      continue;
    }
    console.log(`[worker] installation ${id}`);
    const started = Date.now();
    await processBuild(id);
    console.log(`[worker] installation ${id} terminée en ${Math.round((Date.now() - started) / 1000)} s`);
  }
  await prisma.$disconnect();
}

for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, () => {
    console.log("[worker] arrêt demandé : fin de l'installation en cours puis sortie");
    stopping = true;
  });
}

void main();
