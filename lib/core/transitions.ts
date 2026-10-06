import { HttpError } from "@/lib/api/http";
import type { DeliveryStatus } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import type { Delivery, Prisma } from "@/lib/generated/prisma/client";
import { recordEvent } from "./events";

// Machine à états des livraisons (cahier des charges, 5.5). Tout ce qui n'est pas dans ce tableau est interdit :
// rien ne sort de delivered, expired ou cancelled, et une livraison payée ne peut ni expirer ni être annulée.

const DELIVERY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

type Rule = {
  from: readonly DeliveryStatus[];
  to: DeliveryStatus;
  // Champs à mettre à jour en même temps que l'état.
  effects?: (payload: Record<string, unknown>, now: Date) => Prisma.DeliveryUpdateInput;
};

const BEFORE_PAYMENT = ["draft", "build_failed", "demo_ready"] as const;

export const TRANSITIONS = {
  // Le dev dépose une archive. La livraison expire 30 jours après le dernier dépôt.
  "source.submitted": {
    from: BEFORE_PAYMENT,
    to: "building",
    effects: (_, now) => ({
      expiresAt: new Date(now.getTime() + DELIVERY_TTL_MS),
      failureCode: null,
      failureMessage: null,
    }),
  },
  "build.failed": {
    from: ["building"],
    to: "build_failed",
    effects: (payload) => ({
      failureCode: String(payload.stage ?? "build"),
      failureMessage: String(payload.message ?? "L'installation a échoué."),
    }),
  },
  // space.ready / space.failed ne changent l'état que pour une démo : pour un espace client,
  // l'émetteur utilise recordEvent, pas transition.
  "space.failed": {
    from: ["building"],
    to: "build_failed",
    effects: (payload) => ({
      failureCode: String(payload.stage ?? "runtime"),
      failureMessage: String(payload.message ?? "La démo n'a pas pu démarrer."),
    }),
  },
  "space.ready": { from: ["building"], to: "demo_ready" },
  // Le dev (ou l'admin après un ticket) confirme avoir reçu l'argent : c'est le déblocage.
  "payment.confirmed": { from: ["demo_ready"], to: "paid", effects: (_, now) => ({ paidAt: now }) },
  "handover.started": { from: ["paid", "handover_failed"], to: "handing_over" },
  "handover.succeeded": { from: ["handing_over"], to: "delivered", effects: (_, now) => ({ deliveredAt: now }) },
  "handover.failed": { from: ["handing_over"], to: "handover_failed" },
  "delivery.expired": { from: BEFORE_PAYMENT, to: "expired" },
  "delivery.cancelled": { from: BEFORE_PAYMENT, to: "cancelled" },
} satisfies Record<string, Rule>;

export type TransitionEvent = keyof typeof TRANSITIONS;

// Avant paiement : la livraison peut encore être modifiée, annulée ou expirer.
export function isBeforePayment(status: DeliveryStatus) {
  return (BEFORE_PAYMENT as readonly DeliveryStatus[]).includes(status);
}

export function canTransition(status: DeliveryStatus, event: TransitionEvent) {
  return (TRANSITIONS[event].from as readonly DeliveryStatus[]).includes(status);
}

type TransitionInput = {
  type: TransitionEvent;
  actor: string;
  payload?: Record<string, unknown>;
};

// SEUL point d'écriture de deliveries.status. Applique le changement d'état et écrit l'événement
// dans la même transaction (celle de l'appelant si tx est fourni).
// Un événement déjà appliqué (la livraison est déjà dans l'état visé) est ignoré sans erreur :
// les événements peuvent arriver deux fois.
export async function transition(
  deliveryId: string,
  event: TransitionInput,
  opts: { tx?: Prisma.TransactionClient; now?: Date } = {},
): Promise<Delivery> {
  const rule: Rule = TRANSITIONS[event.type];
  const now = opts.now ?? new Date();
  const payload = event.payload ?? {};

  const apply = async (tx: Prisma.TransactionClient) => {
    // Verrou sur la ligne : deux transitions simultanées sur la même livraison s'exécutent l'une après l'autre.
    const locked = await tx.$queryRaw<{ status: DeliveryStatus }[]>`
      SELECT status FROM deliveries WHERE id = ${deliveryId} FOR UPDATE`;
    if (locked.length === 0) {
      throw new HttpError(404, "DELIVERY_NOT_FOUND", "Livraison introuvable.");
    }
    const current = locked[0].status;

    if (current === rule.to) {
      return tx.delivery.findUniqueOrThrow({ where: { id: deliveryId } });
    }
    if (!rule.from.includes(current)) {
      throw new InvalidTransitionError(current, event.type);
    }

    const delivery = await tx.delivery.update({
      where: { id: deliveryId },
      data: { status: rule.to, ...rule.effects?.(payload, now) },
    });
    await recordEvent(tx, {
      deliveryId,
      type: event.type,
      actor: event.actor,
      payload: { ...payload, from: current, to: rule.to } as Prisma.InputJsonValue,
    });
    return delivery;
  };

  try {
    return opts.tx ? await apply(opts.tx) : await prisma.$transaction(apply);
  } catch (error) {
    if (error instanceof InvalidTransitionError) {
      // Hors de la transaction (annulée) : l'alerte doit rester dans l'historique.
      await prisma.event.create({
        data: {
          deliveryId,
          type: "transition.rejected",
          actor: event.actor,
          payload: { event: event.type, from: error.from },
        },
      });
      throw new HttpError(409, "INVALID_TRANSITION", "Cette action n'est pas possible dans l'état actuel de la livraison.", {
        status: error.from,
        event: event.type,
      });
    }
    throw error;
  }
}

class InvalidTransitionError extends Error {
  constructor(
    readonly from: DeliveryStatus,
    readonly event: TransitionEvent,
  ) {
    super(`Transition interdite : ${event} depuis ${from}`);
  }
}
