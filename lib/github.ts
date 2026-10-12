import { createSign } from "node:crypto";
import { HttpError } from "@/lib/api/http";

// Client minimal de l'API GitHub pour la GitHub App de Fid’s (sans dépendance) : lecture seule du contenu.
// Configuration : GITHUB_APP_ID, GITHUB_APP_SLUG, GITHUB_APP_PRIVATE_KEY, GITHUB_APP_CLIENT_ID, GITHUB_APP_CLIENT_SECRET.

const API = "https://api.github.com";
const env = () => ({
  appId: process.env.GITHUB_APP_ID,
  slug: process.env.GITHUB_APP_SLUG,
  // Clé .pem collée sur une ligne (\n échappés) ou telle quelle.
  privateKey: process.env.GITHUB_APP_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  clientId: process.env.GITHUB_APP_CLIENT_ID,
  clientSecret: process.env.GITHUB_APP_CLIENT_SECRET,
});

export const githubConfigured = () => {
  const e = env();
  return Boolean(e.appId && e.slug && e.privateKey && e.clientId && e.clientSecret);
};

function requireConfig() {
  if (!githubConfigured()) throw new HttpError(503, "INTERNAL_ERROR", "La connexion GitHub n’est pas encore configurée sur Fid’s.");
  return env() as { [K in keyof ReturnType<typeof env>]: string };
}

export function installUrl(state: string) {
  return `https://github.com/apps/${requireConfig().slug}/installations/new?state=${encodeURIComponent(state)}`;
}

// JWT de l'App (RS256, 9 min) : sert uniquement à obtenir des jetons d'installation.
function appJwt() {
  const { appId, privateKey } = requireConfig();
  const now = Math.floor(Date.now() / 1000);
  const enc = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const body = `${enc({ alg: "RS256", typ: "JWT" })}.${enc({ iat: now - 60, exp: now + 540, iss: appId })}`;
  return `${body}.${createSign("RSA-SHA256").update(body).sign(privateKey, "base64url")}`;
}

async function gh<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path.startsWith("http") ? path : `${API}${path}`, {
    ...init,
    headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28", Authorization: `Bearer ${token}`, ...init.headers },
    signal: AbortSignal.timeout(20_000),
  });
  if (res.status === 404) throw new HttpError(404, "NOT_FOUND", "Dépôt ou branche introuvable sur GitHub (ou accès retiré).");
  if (!res.ok) {
    console.error(`[github] ${init.method ?? "GET"} ${path} → ${res.status}`, await res.text().catch(() => ""));
    throw new HttpError(502, "INTERNAL_ERROR", "GitHub ne répond pas comme prévu. Réessayez dans un instant.");
  }
  return (await res.json()) as T;
}

// Jeton d'installation (1 h), limité aux dépôts choisis par le dev et en lecture seule.
const tokenCache = new Map<string, { token: string; exp: number }>();
export async function installationToken(installationId: bigint) {
  const key = installationId.toString();
  const cached = tokenCache.get(key);
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;
  const r = await gh<{ token: string; expires_at: string }>(`/app/installations/${key}/access_tokens`, appJwt(), { method: "POST" });
  tokenCache.set(key, { token: r.token, exp: new Date(r.expires_at).getTime() });
  return r.token;
}

// Connexion : le code OAuth (reçu avec l'installation) prouve qui est le compte GitHub du dev.
export async function exchangeUserCode(code: string) {
  const { clientId, clientSecret } = requireConfig();
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    signal: AbortSignal.timeout(20_000),
  });
  const data = (await res.json().catch(() => ({}))) as { access_token?: string };
  if (!data.access_token) throw new HttpError(400, "VALIDATION_ERROR", "Autorisation GitHub refusée ou expirée. Recommencez.");
  return data.access_token;
}

// Installations visibles par ce compte GitHub : seule preuve qu'un numéro d'installation lui appartient.
export async function userInstallations(userToken: string) {
  const r = await gh<{ installations: { id: number; account: { login: string } }[] }>("/user/installations?per_page=100", userToken);
  return r.installations;
}

export type GithubRepo = { fullName: string; private: boolean; defaultBranch: string; pushedAt: string | null };

export async function installationRepos(installationId: bigint): Promise<GithubRepo[]> {
  const token = await installationToken(installationId);
  const repos: GithubRepo[] = [];
  for (let page = 1; page <= 5; page++) {
    const r = await gh<{ repositories: { full_name: string; private: boolean; default_branch: string; pushed_at: string | null }[] }>(
      `/installation/repositories?per_page=100&page=${page}`,
      token,
    );
    repos.push(...r.repositories.map((x) => ({ fullName: x.full_name, private: x.private, defaultBranch: x.default_branch, pushedAt: x.pushed_at })));
    if (r.repositories.length < 100) break;
  }
  return repos;
}

const REPO = /^[\w.-]+\/[\w.-]+$/;
export function assertRepoName(repo: string) {
  if (!REPO.test(repo)) throw new HttpError(422, "VALIDATION_ERROR", "Nom de dépôt invalide.");
}

export async function repoBranches(installationId: bigint, repo: string) {
  assertRepoName(repo);
  const token = await installationToken(installationId);
  const r = await gh<{ name: string }[]>(`/repos/${repo}/branches?per_page=100`, token);
  return r.map((b) => b.name);
}

// Dernier commit d'une branche, puis l'archive .zip de CE commit (jamais « la branche » : elle peut bouger entre-temps).
export async function latestCommit(installationId: bigint, repo: string, branch: string) {
  assertRepoName(repo);
  const token = await installationToken(installationId);
  const c = await gh<{ sha: string; commit: { message: string } }>(`/repos/${repo}/commits/${encodeURIComponent(branch)}`, token);
  return { sha: c.sha, message: c.commit.message.split("\n")[0].slice(0, 300) };
}

export async function downloadZipball(installationId: bigint, repo: string, sha: string, maxBytes: number) {
  assertRepoName(repo);
  const token = await installationToken(installationId);
  const res = await fetch(`${API}/repos/${repo}/zipball/${sha}`, {
    headers: { Authorization: `Bearer ${token}`, "X-GitHub-Api-Version": "2022-11-28" },
    redirect: "follow",
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok || !res.body) throw new HttpError(502, "INTERNAL_ERROR", "Téléchargement du code depuis GitHub impossible.");
  // Lecture plafonnée : un dépôt trop gros est refusé sans tout charger en mémoire.
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    size += chunk.length;
    if (size > maxBytes) throw new HttpError(413, "ARCHIVE_TOO_LARGE", "Le dépôt dépasse 50 Mo une fois archivé.");
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
