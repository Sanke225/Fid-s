# worker

Processus séparé de Next.js pour les tâches longues : installation, création d'espaces, passation, purge, sauvegardes.
C'est le seul processus qui parle à Docker.

## Lancer en local

```bash
pnpm db:up      # Postgres, tenant-db, Mailpit et le routeur des démos (Traefik, port 8088)
pnpm worker     # prend les installations en file
```

Les démos sont servies sur `http://<app>-xxxx.demo.localhost:8088` (Chrome et Firefox résolvent `*.localhost` tout seuls).

## Ce que fait une installation (`build.ts`)

1. Déchiffre l'archive, la déballe (liens symboliques supprimés), lit `fids.json` ou le déduit de `package.json`.
2. Génère un Dockerfile Fid's (image officielle Node ou nginx sans privilège) et construit l'image (15 min max).
3. Crée une seule fois par livraison : réseau Docker **interne** (aucune sortie vers Internet), base Postgres `sp_…` sur tenant-db.
4. Lance les migrations, puis les données de démo (`seedDemo`) à la première installation.
5. Démarre la nouvelle version (512 Mo, 0,5 CPU, sans privilège), vérifie qu'elle répond via le routeur, puis retire l'ancienne.

## Page d'aperçu

`http://apercu.demo.localhost:8088/<livraison>` est routée par Traefik vers Next.js (`infra/traefik/dynamic.yml`, port **3000**).
Si Fid's tourne sur un autre port, modifiez ce fichier et `BETTER_AUTH_URL`, puis `docker restart infra-edge-1`.
