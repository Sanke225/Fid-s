import { HttpError, notFound } from "@/lib/api/http";
import type { Prisma } from "@/lib/generated/prisma/client";

// Délai laissé au dev pour répondre à un ticket ; ensuite l'admin peut trancher seul.
export const DEV_ANSWER_DELAY_MS = 48 * 60 * 60 * 1000;

export const UNRESOLVED_TICKET = ["open", "awaiting_dev"] as const;

// Charge un ticket et verrouille sa livraison pour la durée de la transaction.
// where : restreint l'accès (ex. tickets des livraisons du dev). Hors périmètre → 404.
export async function lockTicket(tx: Prisma.TransactionClient, ticketId: string, where: Prisma.TicketWhereInput = {}) {
  const ticket = await tx.ticket.findFirst({ where: { id: ticketId, ...where }, select: { deliveryId: true } });
  if (!ticket) throw notFound("Ticket introuvable.");

  await tx.$queryRaw`SELECT id FROM deliveries WHERE id = ${ticket.deliveryId} FOR UPDATE`;
  const fresh = await tx.ticket.findUniqueOrThrow({ where: { id: ticketId }, include: { payment: true } });
  if (!(UNRESOLVED_TICKET as readonly string[]).includes(fresh.status)) {
    throw new HttpError(409, "TICKET_NOT_OPEN", "Ce ticket est déjà clos.");
  }
  return fresh;
}
