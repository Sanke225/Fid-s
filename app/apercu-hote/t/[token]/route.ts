import { issuePreviewSession, PREVIEW_SESSION_TTL_S, previewCookieName, verifyHandoff } from "@/lib/preview-token";
import { fidsOrigin, previewOrigin } from "@/lib/spaces";

type Context = { params: Promise<{ token: string }> };

// GET apercu.<domaine>/t/<jeton> — échange le jeton de Fid’s (60 s) contre le cookie de l'aperçu, puis ouvre la page.
export async function GET(_request: Request, { params }: Context) {
  const { token } = await params;
  const handoff = verifyHandoff(token);
  if (!handoff?.d) return Response.redirect(`${fidsOrigin()}/connexion`, 303);

  const secure = process.env.SPACE_URL_SCHEME !== "http";
  const cookie = [
    `${previewCookieName()}=${issuePreviewSession(handoff.u)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${PREVIEW_SESSION_TTL_S}`,
    secure ? "Secure" : null,
  ]
    .filter(Boolean)
    .join("; ");

  return new Response(null, {
    status: 303,
    // Le jeton ne reste pas dans l'adresse ni dans l'historique : redirection immédiate.
    headers: { Location: `${previewOrigin()}/${handoff.d}`, "Set-Cookie": cookie, "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" },
  });
}
