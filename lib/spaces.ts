// Adresses des espaces (démos, espaces clients). Partagé par l'API et le worker.

// Domaine des démos : en production « fids.app » (→ caisse-kanaga.fids.app), en local « demo.localhost ».
export const DEMO_DOMAIN = process.env.DEMO_DOMAIN ?? `demo.${process.env.BASE_DOMAIN ?? "localhost"}`;

// En local : http et le port du routeur (8088). En production : https, port par défaut.
export function spaceUrl(hostname: string) {
  const scheme = process.env.SPACE_URL_SCHEME ?? "https";
  const port = process.env.SPACE_URL_PORT;
  return `${scheme}://${hostname}${port ? `:${port}` : ""}`;
}

// « Caisse & stock Kanaga » → « caisse-stock-kanaga ».
export function slugify(name: string) {
  return (
    name
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "app"
  );
}

// Hôte de la page « Voir l'application » : sur le domaine des démos, pour que la démo dans le cadre
// soit « même site » que la page (cookies et connexion de l'application fonctionnent dans le cadre).
export const PREVIEW_HOST = `apercu.${DEMO_DOMAIN}`;
export const previewOrigin = () => spaceUrl(PREVIEW_HOST);

// Adresse publique de Fid’s (liens de retour depuis l'aperçu).
export const fidsOrigin = () => (process.env.BETTER_AUTH_URL ?? "http://localhost:3000").replace(/\/$/, "");
