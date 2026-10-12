import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Fichiers de la plateforme (archives chiffrées). STORAGE_DIR en production : un volume sauvegardé.
export const STORAGE_DIR = path.resolve(process.env.STORAGE_DIR ?? "storage");

// Chemins relatifs à STORAGE_DIR en base : on peut déplacer le volume sans réécrire la table.
export async function writeStored(relative: string, data: Buffer) {
  const full = path.join(STORAGE_DIR, relative);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, data, { mode: 0o600 });
}

export const readStored = (relative: string) => readFile(path.join(STORAGE_DIR, relative));
