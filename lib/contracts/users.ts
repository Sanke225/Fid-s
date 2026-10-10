import { z } from "zod";
import { Id, Phone } from "./common";

export const UserRole = z.enum(["dev", "client", "admin"]);
export type UserRole = z.infer<typeof UserRole>;

export const User = z.object({
  id: Id,
  name: z.string(),
  email: z.email(),
  image: z.string().nullable(),
  // Nul tant que l'utilisateur n'a pas choisi (cas d'un compte Google tout neuf).
  role: UserRole.nullable(),
  phone: z.string().nullable(),
  businessName: z.string().nullable(),
});
export type User = z.infer<typeof User>;

// POST /api/v1/me/role — une seule fois, juste après l'inscription. admin n'est jamais accepté ici.
export const ChooseRoleInput = z.object({
  role: z.enum(["dev", "client"]),
});
export type ChooseRoleInput = z.infer<typeof ChooseRoleInput>;

// PATCH /api/v1/me
export const UpdateMeInput = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: Phone.optional(),
  businessName: z.string().trim().max(100).optional(),
});
export type UpdateMeInput = z.infer<typeof UpdateMeInput>;
