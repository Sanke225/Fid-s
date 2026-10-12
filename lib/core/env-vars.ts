import { HttpError } from "@/lib/api/http";
import { prisma } from "@/lib/db";

// Les variables se modifient tant que la version n'est pas figée (« Terminé ») : elles font partie du code livré.
export async function findEditableDelivery(deliveryId: string, devId: string) {
  const delivery = await prisma.delivery.findFirst({
    where: { id: deliveryId, project: { ownerId: devId } },
    select: { id: true, project: { select: { status: true } } },
  });
  if (!delivery) throw new HttpError(404, "DELIVERY_NOT_FOUND", "Livraison introuvable.");
  return delivery;
}

export function assertEnvEditable(projectStatus: string) {
  if (projectStatus !== "assigned" && projectStatus !== "in_progress") {
    throw new HttpError(409, "INVALID_TRANSITION", "Les variables ne se modifient plus une fois le projet terminé.");
  }
}
