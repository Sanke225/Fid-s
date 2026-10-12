import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

// Chiffrement par enveloppe (AES-256-GCM) : chaque archive a sa propre clé, elle-même chiffrée
// par la clé maîtresse (MASTER_KEY). Changer de clé maîtresse ne demande de rechiffrer que les petites clés.

const ALGO = "aes-256-gcm";

function masterKey() {
  const raw = process.env.MASTER_KEY;
  const key = raw ? Buffer.from(raw, "base64") : null;
  if (!key || key.length !== 32) throw new Error("MASTER_KEY doit contenir 32 octets en base64 (openssl rand -base64 32).");
  return key;
}

function seal(key: Buffer, plain: Buffer) {
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const data = Buffer.concat([cipher.update(plain), cipher.final()]);
  return { iv, data, authTag: cipher.getAuthTag() };
}

function open(key: Buffer, sealed: { iv: Buffer; data: Buffer; authTag: Buffer }) {
  const decipher = createDecipheriv(ALGO, key, sealed.iv);
  decipher.setAuthTag(sealed.authTag);
  return Buffer.concat([decipher.update(sealed.data), decipher.final()]);
}

// wrappedKey = iv (12) + tag (16) + clé chiffrée (32).
function wrap(dataKey: Buffer) {
  const { iv, data, authTag } = seal(masterKey(), dataKey);
  return Buffer.concat([iv, authTag, data]);
}

function unwrap(wrapped: Buffer) {
  return open(masterKey(), { iv: wrapped.subarray(0, 12), authTag: wrapped.subarray(12, 28), data: wrapped.subarray(28) });
}

export function encryptBlob(plain: Buffer) {
  const dataKey = randomBytes(32);
  const { iv, data, authTag } = seal(dataKey, plain);
  return { ciphertext: data, iv, authTag, wrappedKey: wrap(dataKey) };
}

export function decryptBlob(blob: { ciphertext: Buffer; iv: Buffer; authTag: Buffer; wrappedKey: Buffer }) {
  return open(unwrap(blob.wrappedKey), { iv: blob.iv, data: blob.ciphertext, authTag: blob.authTag });
}

// Petites valeurs (mots de passe de base, variables d'environnement) : même enveloppe, en un seul champ.
export function encryptValue(plain: string) {
  const { ciphertext, iv, authTag, wrappedKey } = encryptBlob(Buffer.from(plain, "utf8"));
  return Buffer.concat([wrappedKey, iv, authTag, ciphertext]);
}

export function decryptValue(sealed: Uint8Array) {
  const b = Buffer.from(sealed);
  return decryptBlob({ wrappedKey: b.subarray(0, 60), iv: b.subarray(60, 72), authTag: b.subarray(72, 88), ciphertext: b.subarray(88) }).toString("utf8");
}
