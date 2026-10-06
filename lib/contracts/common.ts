import { z } from "zod";

// Conventions communes (cahier des charges, 6.1) : identifiants UUID, dates ISO 8601 en UTC,
// montants en entiers FCFA, champs JSON en camelCase, listes sous { items: [...] }.

export const Id = z.uuid();

export const IsoDate = z.iso.datetime({ offset: true });

// Entier en FCFA, sans décimale. 100 FCFA minimum (montant de la démo).
export const AmountXof = z.int().min(100).max(100_000_000);

// Numéro au format international : +225 0700000000 → "+2250700000000".
export const Phone = z
  .string()
  .trim()
  .transform((value) => value.replace(/[\s.-]/g, ""))
  .pipe(z.string().regex(/^\+[1-9]\d{7,14}$/, "Numéro au format international attendu, ex. +2250700000000"));

export function listOf<T extends z.ZodType>(item: T) {
  return z.object({ items: z.array(item) });
}
