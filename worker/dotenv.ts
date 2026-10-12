import { readFile } from "node:fs/promises";
import path from "node:path";
import { RESERVED_ENV } from "@/lib/contracts";

// Fichiers .env déposés avec le code : lus par Fid’s comme variables du projet (même ordre de priorité que Next.js,
// le dernier l'emporte), mais jamais copiés dans l'image (.dockerignore). Les variables saisies dans Fid’s priment.
const FILES = [".env", ".env.production", ".env.local", ".env.production.local"];
const NAME = /^[A-Za-z_][A-Za-z0-9_]*$/;

// Format dotenv courant : NOM=valeur, « export » facultatif, guillemets simples ou doubles, commentaires #.
export function parseDotenv(text: string) {
  const out: Record<string, string> = {};
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim().replace(/^export\s+/, "");
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq < 1) continue;
    const name = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (!NAME.test(name)) continue;
    const quote = value[0];
    if ((quote === '"' || quote === "'") && value.endsWith(quote) && value.length >= 2) {
      value = value.slice(1, -1);
      if (quote === '"') value = value.replace(/\\n/g, "\n");
    } else {
      value = value.replace(/\s+#.*$/, "");
    }
    out[name] = value;
  }
  return out;
}

export async function readProjectDotenv(root: string) {
  const vars: Record<string, string> = {};
  const found: string[] = [];
  for (const file of FILES) {
    const text = await readFile(path.join(root, file), "utf8").catch(() => null);
    if (text === null) continue;
    found.push(file);
    Object.assign(vars, parseDotenv(text));
  }
  // Fid’s pose lui-même la base, le port… : celles du poste du dev ne s'appliquent pas à la démo.
  for (const name of Object.keys(vars)) if (RESERVED_ENV.includes(name) || name.startsWith("FIDS_")) delete vars[name];
  return { vars, found };
}
