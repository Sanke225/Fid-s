import type { Manifest } from "@/lib/contracts";

// Dockerfile généré par Fid’s (jamais celui du dev) : images officielles, utilisateur sans privilège.

export const NODE_DEFAULT_PORT = 3000;
// nginx-unprivileged écoute sur 8080 : aucun droit root nécessaire dans le conteneur.
export const STATIC_PORT = 8080;

export function appPort(m: Manifest) {
  return m.type === "static" ? STATIC_PORT : (m.port ?? NODE_DEFAULT_PORT);
}

// Variables du dev (clés d'API…) lues pendant l'installation et la construction via un « secret » BuildKit :
// présentes le temps de la commande, jamais écrites dans l'image ni dans son historique.
// uid=1000 : lisible par l'utilisateur « node » (le build ne tourne pas en root).
// FIDS_ENV_REV change quand les variables changent : le cache Docker ne réutilise pas une construction périmée.
const withEnv = (cmd: string) => `RUN --mount=type=secret,id=fidsenv,uid=1000,mode=0400 set -a && . /run/secrets/fidsenv && set +a && ${cmd}`;

export function dockerfile(m: Manifest) {
  const node = `node:${m.nodeVersion}-alpine`;
  if (m.type === "node") {
    return [
      `FROM ${node}`,
      "WORKDIR /app",
      // WORKDIR crée /app pour root : l'installation (node_modules) doit pouvoir y écrire.
      "RUN chown node:node /app",
      "COPY --chown=node:node . .",
      "USER node",
      "ARG FIDS_ENV_REV",
      m.install ? withEnv(m.install) : null,
      m.build ? withEnv(m.build) : null,
      `ENV NODE_ENV=production PORT=${appPort(m)} HOSTNAME=0.0.0.0 HOST=0.0.0.0`,
      `EXPOSE ${appPort(m)}`,
      `CMD ["sh", "-c", ${JSON.stringify(m.start)}]`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  const out = (m.outputDir ?? ".").replace(/^\.\/?/, "") || ".";
  const needsBuild = Boolean(m.install || m.build);
  return [
    needsBuild ? `FROM ${node} AS build` : null,
    needsBuild ? "WORKDIR /app" : null,
    needsBuild ? "COPY . ." : null,
    needsBuild ? "ARG FIDS_ENV_REV" : null,
    needsBuild && m.install ? withEnv(m.install) : null,
    needsBuild && m.build ? withEnv(m.build) : null,
    "FROM nginxinc/nginx-unprivileged:alpine",
    needsBuild ? `COPY --from=build /app/${out} /usr/share/nginx/html` : `COPY ${out} /usr/share/nginx/html`,
    `EXPOSE ${STATIC_PORT}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export const DOCKERIGNORE = ["node_modules", ".next", ".git", "dist/cache", ".env", ".env.*", "Dockerfile.fids", ".fids"].join("\n");

// Fichier lu par « . » (sh) : chaque valeur entre apostrophes, apostrophes internes échappées.
export function shellEnvFile(vars: Record<string, string>) {
  return Object.entries(vars)
    .map(([k, v]) => `${k}='${v.replace(/'/g, `'\\''`)}'`)
    .join("\n") + "\n";
}
