import type { Notification, UserRole } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/lib/generated/prisma/client";

const BRAND = "Fid’s";
const fcfa = (n: unknown) => (typeof n === "number" ? `${n.toLocaleString("fr-FR")} FCFA` : "");

type Ctx = {
  deliveryId: string;
  projectId: string;
  projectName: string;
  clientName: string;
  devName: string;
  payload: Record<string, unknown>;
};
type Builder = (c: Ctx) => { title: string; body: string; href: string };

/** Pour chaque rôle : les événements qui le concernent et la façon de les dire. */
const BUILDERS: Record<UserRole, Record<string, Builder>> = {
  dev: {
    "payment.declared": (c) => ({ title: "Paiement déclaré", body: `${c.clientName} a déclaré ${fcfa(c.payload.amountXof)} pour ${c.projectName}. Vérifiez puis confirmez.`, href: `/dev/project/${c.projectId}` }),
    "ticket.opened": (c) => ({ title: "Litige ouvert", body: `${c.clientName} conteste un paiement sur ${c.projectName}. Répondez sous 48 h.`, href: `/dev/disputes` }),
    "ticket.resolved": (c) => ({ title: "Litige tranché", body: `Le litige sur ${c.projectName} est clos.`, href: `/dev/disputes` }),
    "payment.confirmed": (c) => ({ title: "Paiement confirmé par l’administration", body: `Après examen, le paiement sur ${c.projectName} a été reconnu.`, href: `/dev/project/${c.projectId}` }),
    "fee.confirmed": (c) => ({ title: "Le client a tout réglé", body: `Frais ${BRAND} réglés pour ${c.projectName} : la remise de l’application va démarrer.`, href: `/dev/project/${c.projectId}` }),
    "delivery.claimed": (c) => ({ title: "Livraison suivie par le client", body: `${c.clientName} a ajouté ${c.projectName} à son espace.`, href: `/dev/project/${c.projectId}` }),
    "handover.succeeded": (c) => ({ title: "Application remise", body: `${c.projectName} est désormais au nom de ${c.clientName}.`, href: `/dev/project/${c.projectId}` }),
  },
  client: {
    "payment.confirmed": (c) => ({ title: "Paiement confirmé", body: `${c.devName} a bien reçu votre paiement pour ${c.projectName}. Réglez les frais ${BRAND} pour recevoir l’application.`, href: `/client/deliveries/${c.deliveryId}` }),
    "payment.rejected": (c) => ({ title: "Paiement non reçu", body: `${c.devName} indique n’avoir rien reçu pour ${c.projectName}. Vous pouvez ouvrir un litige.`, href: `/client/deliveries/${c.deliveryId}` }),
    "fee.confirmed": (c) => ({ title: "Frais confirmés", body: `Tout est réglé pour ${c.projectName} : l’installation à votre nom démarre.`, href: `/client/deliveries/${c.deliveryId}` }),
    "fee.rejected": (c) => ({ title: "Frais non reçus", body: `${BRAND} n’a pas reçu vos frais pour ${c.projectName}. Vérifiez la référence et déclarez à nouveau.`, href: `/client/deliveries/${c.deliveryId}` }),
    "ticket.answered": (c) => ({ title: "Réponse à votre litige", body: `${c.devName} a répondu sur ${c.projectName}. L’équipe ${BRAND} va trancher.`, href: `/client/disputes` }),
    "ticket.resolved": (c) => ({ title: "Litige tranché", body: `Une décision a été prise sur ${c.projectName}.`, href: `/client/disputes` }),
    "handover.succeeded": (c) => ({ title: "Votre application est prête", body: `${c.projectName} est à votre nom : accès et facture disponibles.`, href: `/client/deliveries/${c.deliveryId}` }),
  },
  admin: {
    "fee.declared": (c) => ({ title: "Frais à confirmer", body: `${fcfa(c.payload.amountXof)} déclarés pour ${c.projectName}. Vérifiez le compte ${BRAND}.`, href: `/admin/fees` }),
    "ticket.opened": (c) => ({ title: "Nouveau litige", body: `${c.clientName} conteste un paiement à ${c.devName} (${c.projectName}).`, href: `/admin/disputes` }),
    "ticket.answered": (c) => ({ title: "Litige à trancher", body: `${c.devName} a répondu sur ${c.projectName} : votre décision est attendue.`, href: `/admin/disputes` }),
  },
};

/** Les 30 dernières notifications du compte, et le nombre de non lues (depuis sa dernière ouverture de la cloche). */
export async function notificationsFor(user: { id: string; role: UserRole }, seenAt: Date | null) {
  const builders = BUILDERS[user.role];
  const scope: Prisma.DeliveryWhereInput =
    user.role === "dev" ? { project: { ownerId: user.id } } : user.role === "client" ? { clientUserId: user.id } : {};

  const events = await prisma.event.findMany({
    where: {
      type: { in: Object.keys(builders) },
      delivery: scope,
      // Jamais ses propres actions.
      NOT: { actor: { in: [`user:${user.id}`, `admin:${user.id}`] } },
    },
    orderBy: { occurredAt: "desc" },
    take: 30,
    include: {
      delivery: { select: { id: true, projectId: true, clientName: true, project: { select: { name: true, owner: { select: { name: true } } } } } },
    },
  });

  const items: Notification[] = events.map((e) => {
    const text = builders[e.type]({
      deliveryId: e.delivery.id,
      projectId: e.delivery.projectId,
      projectName: e.delivery.project.name,
      clientName: e.delivery.clientName,
      devName: e.delivery.project.owner.name,
      payload: (e.payload ?? {}) as Record<string, unknown>,
    });
    return { id: e.id, type: e.type, ...text, occurredAt: e.occurredAt.toISOString(), unread: !seenAt || e.occurredAt > seenAt };
  });
  return { items, unreadCount: items.filter((n) => n.unread).length };
}
