// Crée la GitHub App de Fid’s en un clic (flux « manifest » de GitHub) et écrit ses clés dans .env.
// Usage : node scripts/github-app-setup.mjs   puis ouvrir http://localhost:3999 et valider sur GitHub.
import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import http from "node:http";

const ENV = ".env";
const env = readFileSync(ENV, "utf8");
const appUrl = (env.match(/^BETTER_AUTH_URL="?([^"\n]+)"?/m)?.[1] ?? "http://localhost:3000").replace(/\/$/, "");
const PORT = 3999;
// Le nom d'une GitHub App est unique sur tout GitHub.
const name = `Fids-${randomBytes(3).toString("hex")}`;

const manifest = {
  name,
  url: appUrl,
  description: "Fid’s : livraison sécurisée de vos applications (lecture seule du code).",
  redirect_url: `http://localhost:${PORT}/retour`,
  callback_urls: [`${appUrl}/api/v1/github/setup`],
  setup_url: `${appUrl}/api/v1/github/setup`,
  request_oauth_on_install: true,
  setup_on_update: true,
  public: true,
  default_permissions: { contents: "read", metadata: "read" },
};
// Webhook « push » (mise à jour automatique, lot 5) : GitHub exige une adresse joignable depuis Internet.
// En local (localhost), on n'en déclare pas ; on l'ajoutera depuis les réglages de l'App avec une adresse publique.
if (!/localhost|127\.0\.0\.1/.test(appUrl)) {
  manifest.hook_attributes = { url: `${appUrl}/api/v1/github/webhook`, active: false };
}

const page = `<!doctype html><meta charset="utf-8"><title>GitHub App Fid’s</title>
<body style="font-family:system-ui;max-width:560px;margin:60px auto">
<h1>Créer la GitHub App de Fid’s</h1><p>Nom : <b>${name}</b> · accès : contenu en lecture seule.</p>
<form action="https://github.com/settings/apps/new" method="post">
<input type="hidden" name="manifest" value='${JSON.stringify(manifest).replace(/'/g, "&#39;")}'>
<button style="padding:12px 20px;font-size:16px">Créer sur GitHub</button></form></body>`;

function setEnv(text, key, value) {
  const line = `${key}="${value.replace(/\n/g, "\\n")}"`;
  return new RegExp(`^${key}=.*$`, "m").test(text) ? text.replace(new RegExp(`^${key}=.*$`, "m"), line) : `${text.trimEnd()}\n${line}\n`;
}

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    if (url.pathname !== "/retour") return res.end(page);
    const code = url.searchParams.get("code");
    const r = await fetch(`https://api.github.com/app-manifests/${code}/conversions`, {
      method: "POST",
      headers: { Accept: "application/vnd.github+json" },
    });
    const app = await r.json();
    if (!r.ok) {
      res.end(`Échec : ${JSON.stringify(app)}`);
      return;
    }
    let text = readFileSync(ENV, "utf8");
    if (!/GitHub App de Fid/.test(text)) text = `${text.trimEnd()}\n\n# GitHub App de Fid’s (créée par scripts/github-app-setup.mjs)\n`;
    for (const [k, v] of Object.entries({
      GITHUB_APP_ID: String(app.id),
      GITHUB_APP_SLUG: app.slug,
      GITHUB_APP_CLIENT_ID: app.client_id,
      GITHUB_APP_CLIENT_SECRET: app.client_secret,
      GITHUB_APP_PRIVATE_KEY: app.pem,
      GITHUB_APP_WEBHOOK_SECRET: app.webhook_secret ?? "",
    })) text = setEnv(text, k, v);
    writeFileSync(ENV, text);
    res.setHeader("content-type", "text/html; charset=utf-8");
    res.end(`<body style="font-family:system-ui;max-width:560px;margin:60px auto"><h1>App « ${app.slug} » créée ✔</h1><p>Clés écrites dans .env. Vous pouvez fermer cet onglet.</p></body>`);
    console.log(`GitHub App créée : ${app.html_url}\nClés écrites dans .env (GITHUB_APP_*).`);
    setTimeout(() => process.exit(0), 500);
  })
  .listen(PORT, () => console.log(`Ouvrez http://localhost:${PORT} et cliquez « Créer sur GitHub ».`));
