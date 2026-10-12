import { z } from "zod";
import { Id, Phone } from "./common";

export const UserRole = z.enum(["dev", "client", "admin"]);
export type UserRole = z.infer<typeof UserRole>;

export const User = z.object({
  id: Id,
  name: z.string(),
  // Nul pour un compte créé par un dev sans e-mail, tant que le client n'a pas ajouté et confirmé le sien.
  email: z.email().nullable(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  // Nul tant que l'utilisateur n'a pas choisi (cas d'un compte Google tout neuf).
  role: UserRole.nullable(),
  phone: z.string().nullable(),
  businessName: z.string().nullable(),
  username: z.string().nullable(),
  // Compte créé par un dev : le mot de passe provisoire doit être remplacé avant toute autre action.
  mustChangePassword: z.boolean(),
});
export type User = z.infer<typeof User>;

// POST /api/v1/me/role — une seule fois, juste après l'inscription. admin n'est jamais accepté ici.
export const ChooseRoleInput = z.object({
  role: z.enum(["dev", "client"]),
  // Case « J'accepte les CGU » cochée à l'inscription par e-mail : l'acceptation est enregistrée en même temps.
  acceptTerms: z.boolean().optional(),
});
export type ChooseRoleInput = z.infer<typeof ChooseRoleInput>;

// PATCH /api/v1/me
export const UpdateMeInput = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: Phone.optional(),
  businessName: z.string().trim().max(100).optional(),
});
export type UpdateMeInput = z.infer<typeof UpdateMeInput>;

// POST /api/v1/me/password — remplace le mot de passe (obligatoire après un compte créé par un dev).
export const ChangePasswordInput = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(8).max(128),
});
export type ChangePasswordInput = z.infer<typeof ChangePasswordInput>;

// POST /api/auth/change-email (Better Auth) : l'adresse n'est remplacée qu'au clic sur le lien de vérification.
export const AddEmailInput = z.object({ newEmail: z.email() });

// GET /api/v1/me/terms — version des CGU acceptée par le compte et version en vigueur.
export const TermsStatus = z.object({
  currentVersion: z.string(),
  acceptedVersion: z.string().nullable(),
  acceptedAt: z.iso.datetime({ offset: true }).nullable(),
});
export type TermsStatus = z.infer<typeof TermsStatus>;

// POST /api/v1/me/terms — accepte la version affichée (refusé si elle n'est plus en vigueur).
export const AcceptTermsInput = z.object({ version: z.string().min(1).max(32) });
export type AcceptTermsInput = z.infer<typeof AcceptTermsInput>;

// DELETE /api/v1/me — suppression du compte (anonymisation). Mot de passe exigé si le compte en a un.
export const DeleteAccountInput = z.object({
  confirmation: z.literal("SUPPRIMER"),
  password: z.string().min(1).max(200).optional(),
});
export type DeleteAccountInput = z.infer<typeof DeleteAccountInput>;
