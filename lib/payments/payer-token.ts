import { createHash, randomBytes } from "node:crypto";

// Jeton remis au navigateur du client qui a déclaré un paiement (en-tête X-Payer-Token).
// Seule son empreinte est stockée : une fuite de la base ne permet pas de se faire passer pour le payeur.
export function newPayerToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashPayerToken(token) };
}

export function hashPayerToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export function payerTokenFrom(request: Request) {
  const token = request.headers.get("x-payer-token");
  return token ? hashPayerToken(token) : null;
}
