import { createHmac, timingSafeEqual } from "node:crypto";

// Jetons signés de l'hôte d'aperçu (apercu.<domaine des démos>). Cet hôte ne voit pas le cookie de session
// de Fid’s (autre site) : Fid’s lui passe un jeton court (60 s), échangé contre un cookie propre à l'aperçu (8 h).

type Payload = { u: string; d?: string; k: "handoff" | "session"; exp: number };

const key = () => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET manquant");
  return `${secret}:apercu`;
};

const b64 = (b: Buffer | string) => Buffer.from(b).toString("base64url");
const sign = (body: string) => createHmac("sha256", key()).update(body).digest("base64url");

function issue(payload: Payload) {
  const body = b64(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

function verify(token: string | undefined | null, kind: Payload["k"]): Payload | null {
  if (!token) return null;
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = Buffer.from(sign(body));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  try {
    const p = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Payload;
    return p.k === kind && p.exp > Date.now() ? p : null;
  } catch {
    return null;
  }
}

export const issueHandoff = (userId: string, deliveryId: string) => issue({ u: userId, d: deliveryId, k: "handoff", exp: Date.now() + 60_000 });
export const verifyHandoff = (token: string) => verify(token, "handoff");

export const PREVIEW_SESSION_TTL_S = 8 * 60 * 60;
export const issuePreviewSession = (userId: string) => issue({ u: userId, k: "session", exp: Date.now() + PREVIEW_SESSION_TTL_S * 1000 });
export const verifyPreviewSession = (token: string | undefined) => verify(token, "session");

// En https : préfixe __Host- (ni Domain ni sous-domaine) : une démo voisine ne peut pas poser un faux cookie.
export const previewCookieName = () => (process.env.SPACE_URL_SCHEME === "http" ? "fids_apercu" : "__Host-fids_apercu");
