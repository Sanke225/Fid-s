import { HttpError } from "@/lib/api/http";
import { toClientStatus, type DemoPreview, type Manifest } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { spaceUrl } from "@/lib/spaces";
import { transition } from "./transitions";

// Aperçu de la démo : le dev du projet, ou le client assigné à la livraison. Personne d'autre (404).
async function loadForViewer(deliveryId: string, user: { id: string; role?: string | null }) {
  const delivery = await prisma.delivery.findUnique({
    where: { id: deliveryId },
    include: {
      project: { select: { name: true, status: true, ownerId: true, owner: { select: { name: true } } } },
      spaces: { where: { kind: "demo", status: "running" }, select: { hostname: true } },
      currentBuild: { select: { id: true, manifest: true, finishedAt: true, sourceArchiveId: true, imageRef: true } },
      builds: { where: { status: { in: ["queued", "running"] } }, select: { id: true }, take: 1 },
    },
  });
  const viewer =
    user.role === "dev" && delivery?.project.ownerId === user.id
      ? "dev"
      : user.role === "client" && delivery?.clientUserId === user.id
        ? "client"
        : null;
  if (!delivery || !viewer) throw new HttpError(404, "DELIVERY_NOT_FOUND", "Livraison introuvable.");
  return { delivery, viewer } as const;
}

export async function previewFor(deliveryId: string, user: { id: string; role?: string | null }): Promise<DemoPreview> {
  const { delivery, viewer } = await loadForViewer(deliveryId, user);
  const demo = delivery.spaces[0];
  // Le client ne voit la démo qu'une fois le projet terminé, jusqu'au règlement des frais (comme sur la page de livraison).
  const clientStatus = toClientStatus(delivery.status, delivery.project.status);
  // Projet terminé + installation en cours = réinitialisation (le code est figé) : la démo reste affichée.
  const resetting = delivery.project.status === "finished" && delivery.status === "building";
  const visible = viewer === "dev" || clientStatus === "demo_ready" || clientStatus === "awaiting_fee" || resetting;
  const updating = delivery.builds.length > 0;
  const manifest = delivery.currentBuild?.manifest as Manifest | null | undefined;

  return {
    deliveryId: delivery.id,
    projectName: delivery.project.name,
    devName: delivery.project.owner.name,
    viewer,
    demoUrl: visible && demo ? spaceUrl(demo.hostname) : null,
    demoLogin: visible ? (manifest?.demoLogin ?? null) : null,
    version:
      visible && delivery.currentBuild?.finishedAt
        ? { id: delivery.currentBuild.id, at: delivery.currentBuild.finishedAt.toISOString() }
        : null,
    updating,
    // Avant paiement seulement : après, la démo n'est plus un terrain d'essai.
    canReset: visible && Boolean(demo) && delivery.status === "demo_ready" && !updating,
  };
}

// « Réinitialiser la démo » : même image, base vidée, données de démo relancées (par le worker).
export async function requestDemoReset(deliveryId: string, user: { id: string; role?: string | null }) {
  const { delivery, viewer } = await loadForViewer(deliveryId, user);
  const preview = await previewFor(deliveryId, user);
  if (!preview.canReset || !delivery.currentBuild?.imageRef) {
    throw new HttpError(409, "DEMO_NOT_READY", "La démo ne peut pas être réinitialisée pour le moment.");
  }
  const current = delivery.currentBuild;
  return prisma.$transaction(async (tx) => {
    const build = await tx.build.create({
      data: {
        deliveryId,
        sourceArchiveId: current.sourceArchiveId,
        resetDemo: true,
        manifest: current.manifest ?? undefined,
        imageRef: current.imageRef,
      },
    });
    await transition(deliveryId, { type: "demo.reset_requested", actor: `user:${user.id}`, payload: { buildId: build.id, by: viewer } }, { tx });
    return build;
  });
}
