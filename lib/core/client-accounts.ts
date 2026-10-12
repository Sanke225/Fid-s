import { randomInt } from "node:crypto";
import { HttpError } from "@/lib/api/http";
import { auth } from "@/lib/auth";
import type { Prisma } from "@/lib/generated/prisma/client";
import { PLACEHOLDER_EMAIL_DOMAIN } from "./placeholder-email";

// Compte client créé par un dev : Fid’s choisit l'identifiant et le mot de passe provisoire (jamais le dev),
// et le client doit le remplacer à sa première connexion (mustChangePassword).

// Sans caractères ambigus (0/O, 1/l/I) : le mot de passe est souvent dicté ou recopié depuis WhatsApp.
const PASSWORD_ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function temporaryPassword(length = 10) {
  let out = "";
  for (let i = 0; i < length; i++) out += PASSWORD_ALPHABET[randomInt(PASSWORD_ALPHABET.length)];
  return out;
}

// « Mariam Traoré » → « mariam.traore ». Mêmes caractères que le validateur du plugin username.
function usernameBase(name: string) {
  const base = name
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")
    .slice(0, 20);
  return base.length >= 3 ? base : `client${base}`;
}

async function freeUsername(tx: Prisma.TransactionClient, name: string) {
  const base = usernameBase(name);
  for (let attempt = 0; attempt < 20; attempt++) {
    const candidate = `${base}${randomInt(10, 1000)}`;
    if (!(await tx.user.findUnique({ where: { username: candidate }, select: { id: true } }))) return candidate;
  }
  throw new HttpError(409, "CONFLICT", "Impossible de générer un identifiant libre. Réessayez.");
}

export async function createClientAccount(
  tx: Prisma.TransactionClient,
  input: { name: string; email?: string; phone?: string },
) {
  const email = input.email?.toLowerCase();
  if (email && (await tx.user.findUnique({ where: { email }, select: { id: true } }))) {
    throw new HttpError(409, "CONFLICT", "Un compte existe déjà avec cette adresse e-mail : choisissez « Client existant ».");
  }

  const username = await freeUsername(tx, input.name);
  const password = temporaryPassword();
  // Même fonction de hachage que Better Auth à l'inscription : le client se connecte ensuite normalement.
  const hash = await (await auth.$context).password.hash(password);

  const user = await tx.user.create({
    data: {
      name: input.name,
      email: email ?? `${username}@${PLACEHOLDER_EMAIL_DOMAIN}`,
      username,
      phone: input.phone ?? null,
      role: "client",
      mustChangePassword: true,
    },
  });
  await tx.account.create({
    data: { userId: user.id, providerId: "credential", accountId: user.id, password: hash },
  });

  return { user, credentials: { username, temporaryPassword: password } };
}

// Client existant : par identifiant ou par e-mail. Seuls les comptes client sont acceptés.
export async function findClientAccount(tx: Prisma.TransactionClient, login: string) {
  const value = login.trim().toLowerCase();
  const user = await tx.user.findFirst({
    where: value.includes("@") ? { email: value } : { username: value },
  });
  // Un compte supprimé (anonymisé) ne peut plus être assigné.
  if (!user || user.role !== "client" || user.deletedAt) {
    throw new HttpError(404, "CLIENT_NOT_FOUND", "Aucun compte client ne correspond à cet identifiant ou cet e-mail.");
  }
  return user;
}
