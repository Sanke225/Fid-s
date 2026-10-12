import { z } from "zod";
import { Id, IsoDate } from "./common";

// Cloche : notifications calculées à partir du journal d'événements des livraisons du compte.
export const Notification = z.object({
  id: Id,
  type: z.string(),
  title: z.string(),
  body: z.string(),
  // Page à ouvrir au clic.
  href: z.string(),
  occurredAt: IsoDate,
  unread: z.boolean(),
});
export type Notification = z.infer<typeof Notification>;

// GET /api/v1/notifications
export const NotificationList = z.object({ items: z.array(Notification), unreadCount: z.int() });
export type NotificationList = z.infer<typeof NotificationList>;
