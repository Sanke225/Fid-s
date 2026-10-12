# Guide du projet Fid's

Document de référence pour reprendre le projet, à lire en entier avant de coder, ou à donner tel quel à un agent IA.
Mis à jour le 12 octobre 2026. Les décisions datées sont dans `docs/decisions.md`, le planning du concours dans `docs/plan-cadev.md`.

---

## 1. Le produit en bref

Fid's sécurise la livraison d'une application entre un **développeur** et son **client** (Afrique de l'Ouest, paiements Mobile Money).

1. Le dev crée un projet, dépose son code (archive .zip ou dépôt GitHub) et rattache son client.
2. Fid's installe l'application dans un conteneur isolé : le client la **teste sur une démo** sans accès au code.
3. Le client **paie le dev directement** (Wave, Orange Money, Moov Money, MTN MoMo) et déclare la référence de transaction ; le dev confirme le dépôt.
4. Le client paie à Fid's des **frais de service de 5 %** ; un admin de Fid's les confirme.
5. **Passation** : l'application passe au nom du client (adresse, accès admin, base propre, code source si prévu).

Concours : CADEV 2026 de Systalink, rendu le **25 octobre 2026, 17 h GMT**.

## 2. Règles d'or (non négociables)

- **Fid's ne détient jamais l'argent du dev.** Ni la plateforme, ni l'admin. Pas de séquestre. Fid's encaisse seulement ses frais de 5 %, sur ses propres numéros (`FIDS_PAYOUT_*`).
- **Tarif** : 0 % pour le dev, 5 % payés par le client (100 FCFA minimum, arrondi au franc supérieur). Calcul dans `lib/payments/fee-rules.ts`, nulle part ailleurs.
- **Un seul backend** : `/api/v1` + PostgreSQL. Aucun mock, aucune donnée simulée dans le front.
- **Le serveur décide** : montants, statuts et droits viennent toujours de l'API. Masquer un bouton ne protège rien : chaque route vérifie la session et le rôle.
- **Seule `transition()`** (`lib/core/transitions.ts`) écrit `deliveries.status`.
- **Le rôle admin** se donne uniquement par script (`pnpm admin:promote <email>`), jamais depuis l'interface.
- **Textes** : tout en français, ton simple et direct. **Aucun emoji dans l'interface** : des icônes (`components/Icons.tsx`).
- **Secrets** : ne jamais committer `.env`. Copier `.env.example`.
- **Git** : branche principale `master`, protégée (PR + 1 approbation). Dépôt : `github.com/Sanke225/Fid-s`.

## 3. Équipe

| Personne | Rôle actuel |
|---|---|
| Sanke | Back-end, base de données, intégration (a repris le front pendant l'absence d'Ismo) |
| Ismo | Front espace développeur (absent temporairement) |
| Roxane | Front page client ; rédaction des pages légales et de la documentation |

## 4. Stack technique

| Domaine | Outil |
|---|---|
| Framework | **Next.js 16** (App Router), **React 19**, TypeScript 5 |
| Style | **Tailwind CSS v4** (configuration dans `app/globals.css`, pas de `tailwind.config`) |
| Animations | `motion` (ex-Framer Motion), `lenis` (défilement doux) |
| Données côté navigateur | **TanStack React Query 5** |
| Validation | **Zod 4** (contrats partagés front/back dans `lib/contracts/`) |
| Base de données | **PostgreSQL 17** + **Prisma 7** (adaptateur `@prisma/adapter-pg`, client généré dans `lib/generated/prisma`) |
| Authentification | **Better Auth** (e-mail + mot de passe, Google, GitHub, Apple désactivé ; plugin `username`) |
| E-mails | `nodemailer` (Mailpit en local) |
| Démos | Docker, Traefik v3.6, processus `worker` (lancé avec `tsx`) |
| Gestionnaire de paquets | **pnpm** |

## 5. Lancer en local

```bash
pnpm install
cp .env.example .env      # puis remplir (voir commentaires du fichier)
pnpm db:up                # Postgres, tenant-db, Traefik, Mailpit (Docker)
pnpm db:migrate           # applique les migrations
pnpm dev                  # http://localhost:3000 (webpack, 4 Go de mémoire)
pnpm worker               # installations des démos (optionnel pour le front)
```

| Service | Adresse |
|---|---|
| Application | http://localhost:3000 |
| Postgres de la plateforme | localhost:5432 (base, utilisateur : `recette`) |
| Postgres des démos (tenant-db) | localhost:5433 |
| Routeur des démos (Traefik) | http://\<app\>.demo.localhost:8088 |
| Mailpit (e-mails reçus en local) | http://localhost:8025 |
| Prisma Studio (voir/éditer la base) | `pnpm db:studio` → http://localhost:5555 |

Autres scripts : `pnpm lint`, `pnpm db:generate`, `pnpm admin:promote <email>`, `pnpm github:app` (création de la GitHub App).

**Après chaque migration Prisma, redémarrer `pnpm dev`** : le client Prisma est gardé en mémoire (`globalThis`) et ne voit pas les nouvelles colonnes.

Le nom technique historique du projet est « recette » (base, clés localStorage `recette.*`) : ne pas le renommer sans migration.

## 6. Arborescence

```
app/                    Pages (App Router) et routes d'API
  page.tsx              Landing
  connexion/ inscription/ auth/suite/   Authentification (auth/suite = retour Google/GitHub)
  compte/mot-de-passe/  Changement obligatoire du mot de passe provisoire
  dev/                  Espace développeur (layout = garde rôle dev + AppShell)
  client/               Espace client (garde rôle client + AppShell)
  admin/                Espace administration (garde rôle admin + AppShell)
  (client)/l/[token]    Page de livraison publique (sans compte)
  (client)/c/[accessToken]  Espace de la livraison remise
  apercu/ apercu-hote/  Aperçu d'une démo (servi sur l'hôte apercu.<domaine des démos>)
  cgu/ cf/ confidentialite/ cookies/ mentions-legales/ litiges/ regles/ faq/ contact/   Pages légales
  api/auth/[...all]     Better Auth
  api/v1/               API de Fid's (voir §10)
components/
  app/                  AppShell (barre latérale, barre du haut, menu mobile), nav.tsx, NotificationBell
  account/              Profil, carte « Mes données », fenêtre d'acceptation des CGU (TermsGate)
  auth/                 Écrans de connexion/inscription, gardes (guard.ts), chemins (paths.ts)
  dev/ client/ invoices/ payments/ preview/   Composants des espaces
  landing/              Sections de la landing (textes dans landing/data.ts)
  legal/                Mise en page des pages légales (LegalPage)
  motion/               Animations réutilisables (Reveal, SplitText, CountUp, Parallax…)
  Icons.tsx Brand.tsx Toast.tsx   Icônes, logo, notifications toast
features/page-client/   Page de livraison publique : offre, paiement (pay/), frais, grand écran, espace
lib/
  contracts/            Schémas Zod + types partagés (une source de vérité pour l'API)
  api/                  http.ts (handle, HttpError, parseJson), session.ts (requireUser, requireRole), serializers.ts (DTO), client.ts (apiFetch côté navigateur)
  core/                 Logique métier : transitions, événements, projets, comptes, notifications, sources, aperçu
  payments/             Paiements au dev, frais Fid's, tickets, jeton payeur
  queries/              Hooks React Query par domaine + keys.ts
  auth.ts auth-client.ts  Better Auth serveur / navigateur
  db.ts                 Client Prisma unique
  legal.ts              Version des CGU, infos de l'éditeur, liens légaux
  theme.ts theme-script.ts  Thème clair/sombre
  delivery-ui.ts client-ui.ts  Libellés, couleurs et formats des statuts
prisma/schema/          Schéma découpé : auth, deliveries, payments, handover, runtime
prisma/migrations/      Migrations SQL (ne jamais modifier une migration déjà appliquée)
worker/                 Processus des tâches longues (seul à parler à Docker)
infra/                  docker-compose.dev.yml, configuration Traefik
scripts/                promote-admin.sh, github-app-setup.mjs
docs/                   Ce guide, décisions, plan du concours
proxy.ts                Ex-« middleware » de Next 16 : premier filtre des zones protégées et de l'hôte d'aperçu
```

## 7. Modèle de données (Prisma)

| Modèle | Rôle |
|---|---|
| `User` | Compte : nom, e-mail, rôle (`dev` / `client` / `admin`, nul tant que non choisi), téléphone, nom commercial, `username` (client créé par un dev), `mustChangePassword`, `notificationsSeenAt`, `termsVersion` / `termsAcceptedAt`, `deletedAt` |
| `Session`, `Account`, `Verification` | Tables Better Auth (ne pas renommer les champs) |
| `Project` | Projet du dev : statut `unassigned → assigned → in_progress → finished`, client rattaché, dépôt GitHub |
| `Delivery` | Livraison d'un projet : montant, client, jeton public, statut, expiration (30 jours) |
| `PayoutMethod` | Numéros Mobile Money du dev |
| `Payment` | Paiement déclaré par le client au dev (`declared → confirmed / rejected / expired`, expire après 48 h) |
| `PlatformFee` | Frais de 5 % déclarés par le client à Fid's (`declared → confirmed / rejected / expired`) |
| `Ticket` | Litige sur un paiement (`open`, `awaiting_dev`, `resolved_released`, `resolved_rejected`) |
| `Event` | Journal de chaque action (type, acteur, données) : sert de preuve, de notifications et d'historique |
| `SourceArchive`, `Build`, `BuildLog`, `Space`, `DeliveryEnvVar` | Code déposé (chiffré), installations, conteneurs, variables d'environnement (chiffrées) |
| `GithubInstallation` | Liaison GitHub App du dev |
| `Handover`, `Invoice`, `Backup` | Passation, factures, sauvegardes |

Acteur d'un événement : `user:<id>`, `admin:<id>`, `client` (sans compte) ou `system`.

## 8. Logique métier

### 8.1 Statuts d'une livraison (`lib/core/transitions.ts`)

```
draft ─source.submitted→ building ─space.ready→ demo_ready ─payment.confirmed→ fee_pending ─fee.confirmed→ paid
                            └─build.failed / space.failed→ build_failed
paid ─handover.started→ handing_over ─handover.succeeded→ delivered
                                      └─handover.failed→ handover_failed (on peut relancer)
avant paiement : delivery.expired → expired, delivery.cancelled → cancelled
```

Chaque transition enregistre un `Event`. Une transition interdite lève une erreur `INVALID_TRANSITION`.

### 8.2 Paiement du dev

- Le client choisit un numéro du dev, paie hors de Fid's, puis déclare (nom, numéro, référence). L'appareil reçoit un **jeton payeur** (en-tête `X-Payer-Token`, gardé dans `localStorage` sous `recette.payer.<token>`).
- Le dev confirme (`payment.confirmed`) ou refuse avec motif. Sans réponse en 48 h, la déclaration expire.
- Une référence de transaction ne peut servir qu'une fois par opérateur.

### 8.3 Frais de service Fid's (5 %)

- Après confirmation du dev : livraison en `fee_pending`, la démo reste visible, rien n'est remis.
- Le client paie un numéro Fid's (`FIDS_PAYOUT_*`) et déclare. Peut déclarer : l'appareil qui a payé le dev (jeton payeur) **ou** le client connecté propriétaire de la livraison.
- Un admin confirme (`fee.confirmed` → `paid`) ou refuse avec motif (le client redéclare).

### 8.4 Litiges (tickets)

- Le client ouvre un ticket si le dev a refusé son paiement ou n'a pas répondu en 48 h. Un ticket par paiement.
- Le dev a 48 h pour répondre (reconnaître ou maintenir). Pendant ce délai, l'admin ne peut pas trancher (`TICKET_DEV_DELAY_RUNNING`).
- L'admin tranche : **reconnaître le paiement** (confirmé à la place du dev) ou **refuser**. Décision motivée (10 caractères minimum), journalisée.

### 8.5 Cycle du projet et compte client créé par le dev

- Le dev peut rattacher un client existant ou **créer son compte** (identifiant + mot de passe provisoire). Le client doit changer son mot de passe à la première connexion (`mustChangePassword` ; toutes les routes renvoient `PASSWORD_CHANGE_REQUIRED` sauf `/me` et `/me/password`).
- Sans e-mail, le compte reçoit une adresse technique `@clients.fids.invalid`, jamais affichée (`lib/core/placeholder-email.ts`).
- « Début du développement » → aperçu privé pour le dev ; « Terminé » fige la version, le client voit « Voir l'application ».

### 8.6 Démos et aperçu

Le `worker` déballe l'archive, génère un Dockerfile Fid's (jamais celui du dev), crée une base dédiée sur tenant-db, lance le conteneur (512 Mo, 0,5 CPU, sans Internet) derrière Traefik. Détails : `worker/README.md` et `docs/decisions.md`. Périmètre du concours : projets Node.js et sites statiques.

### 8.7 Notifications

Pas de table dédiée : la cloche (`components/app/NotificationBell.tsx`) lit les `Event` récents pertinents pour le rôle (`lib/core/notifications.ts`), hors actions de l'utilisateur lui-même. « Non lu » = plus récent que `users.notifications_seen_at`. Rafraîchie toutes les 30 s.

### 8.8 Comptes, consentement et données personnelles

- **Rôle** : choisi juste après l'inscription via `POST /api/v1/me/role` (e-mail ou Google/GitHub), une seule fois.
- **CGU** : la version en vigueur est `TERMS_VERSION` dans `lib/legal.ts`. L'acceptation (date + version) est enregistrée à l'inscription par e-mail ; sinon la fenêtre `TermsGate` bloque l'entrée des espaces jusqu'à acceptation. **Changer `TERMS_VERSION` quand les CGU ou la politique de confidentialité changent sur le fond** : tout le monde devra réaccepter.
- **Export** : `GET /api/v1/me/export` (JSON, sans secrets).
- **Suppression** : `DELETE /api/v1/me` = anonymisation (`lib/core/account.ts`). Les données personnelles sont effacées, les paiements et factures gardés. Refusée s'il reste des livraisons en cours de paiement, un projet en cours ou un litige ouvert. Un admin ne peut pas se supprimer.

## 9. Rôles et sécurité

| Couche | Ce qu'elle fait |
|---|---|
| `proxy.ts` | Sans cookie de session → redirection vers `/connexion?retour=…` pour `/dev/*`, `/client/*`, `/admin/*`. Isole l'hôte d'aperçu. |
| Layouts `app/{dev,client,admin}/layout.tsx` | `requirePageRole(role)` : session valide **et** bon rôle, sinon redirection |
| Routes d'API | `requireUser(request)` ou `requireRole(request, 'dev'|'client'|'admin')` en première ligne, toujours |
| Données | Chaque requête filtre par propriétaire (ex. livraisons du dev connecté) : hors périmètre → 404 |

Mots de passe hachés par Better Auth, code et variables d'environnement chiffrés par enveloppe (`MASTER_KEY`, `lib/crypto/envelope.ts`).

## 10. API (`/api/v1`)

### Conventions

- Une route = `app/api/v1/.../route.ts`, enveloppée par `handle()` (`lib/api/http.ts`).
- Corps validé par `parseJson(request, SchemaZod)` ; schémas et types dans `lib/contracts/` (exportés par `lib/contracts/index.ts`).
- Erreurs : `throw new HttpError(status, CODE, "message en français")`. Format renvoyé : `{ error: { code, message, details? } }`. Codes autorisés : `lib/contracts/errors.ts` (en ajouter un = l'y déclarer).
- Les objets renvoyés passent par les fonctions `to…Dto` de `lib/api/serializers.ts` (jamais l'objet Prisma brut).
- Côté navigateur : `apiFetch('/chemin')` (`lib/api/client.ts`) lève `ApiClientError` ; `errorMessage(e)` donne le texte à afficher.

### Routes principales

| Groupe | Routes |
|---|---|
| Compte | `GET/PATCH/DELETE /me`, `POST /me/role`, `POST /me/password`, `GET/POST /me/terms`, `GET /me/export`, `GET /me/deletion` |
| Notifications | `GET /notifications`, `POST /notifications/seen` |
| Dev : projets | `GET/POST /projects`, `GET /projects/:id`, `POST /projects/:id/client`, `POST /projects/:id/start`, `POST /projects/:id/finish`, `/projects/:id/github`, `/projects/:id/deliveries` |
| Dev : livraisons | `/deliveries/:id` (+ `cancel`, `events`, `source`, `env`, `preview`, `demo/reset`, `github/import`, `builds/:buildId/logs`) |
| Dev : paiements | `/payout-methods`, `/payments/:id`, `/payments/:id/confirm`, `/payments/:id/reject`, `/invoices`, `/tickets`, `/tickets/:id/answer` |
| GitHub | `/github/install`, `/github/setup`, `/github/repos`, `/github/branches` |
| Client connecté | `/client/deliveries`, `/client/deliveries/claim`, `/client/payments`, `/client/invoices`, `/client/tickets` |
| Public (sans compte) | `/public/deliveries/:token` (+ `payments`, `fee`), `/public/payments/:id` (+ `tickets`) |
| Admin | `/admin/stats`, `/admin/fees` (+ `:id/confirm`, `:id/reject`), `/admin/tickets` (+ `:id`, `:id/resolve`), `/admin/deliveries`, `/admin/users`, `/admin/events` |

## 11. Front

- **Espaces** : `AppShell` (`components/app/AppShell.tsx`) donne la même structure aux trois rôles. Le menu de chaque rôle est déclaré dans `components/app/nav.tsx` (libellés, icônes, badges). La palette de commandes (`CmdPalette`) lit le même menu.
- **Pages par espace** :
  - Dev : tableau de bord, projets, détail projet, nouveau projet, moyens de paiement, factures, clients, litiges, profil.
  - Client : tableau de bord, mes livraisons (+ détail), ajouter une livraison, paiements, factures, litiges, profil.
  - Admin : vue d'ensemble, frais à confirmer, litiges à trancher, livraisons, utilisateurs, journal, profil.
- **Données** : un hook React Query par besoin dans `lib/queries/<domaine>.ts`, clés dans `lib/queries/keys.ts`. Après une action, invalider les clés concernées plutôt que recharger la page.
- **Composants d'espace** (`components/dev/ui.tsx`) : `DevPage`, `PageHeader`, `Card`, `StatusBadge`, `Skeleton`, `ErrorState`, `EmptyState` ; fenêtre `components/dev/Modal.tsx` ; toasts `useToast()`.
- **Page de livraison publique** : `features/page-client/` (offre, `pay/PaymentPanel`, `pay/FeePanel`, grand écran avec QR code). Interroge le serveur régulièrement : seul l'état serveur débloque quelque chose.
- **Formulaires** : champs `components/auth/Field.tsx` (icône obligatoire), erreurs sous le champ, `FormAlert` pour l'erreur globale, champs vides avec placeholder (pas de valeur pré-remplie factice). Numéros normalisés par `lib/phone.ts`.

### Pièges de Next.js 16 (voir `AGENTS.md`)

- `middleware.ts` s'appelle **`proxy.ts`**.
- `params` et `searchParams` sont des **Promise** (`const { id } = await params`).
- Un fichier `page.tsx` n'exporte **que** son composant par défaut (et `metadata`) : mettre les constantes ailleurs (`lib/`).
- Doc de la version installée : `node_modules/next/dist/docs/`.

## 12. Thème et design

- **Couleurs** : variables CSS dans `app/globals.css` (`:root` / `[data-theme="dark"]`). Orange de marque `--color-accent: #FF6A00` (échelle `--color-accent-100` à `900`), fond crème `#FFF8F1` en clair, `#0B0B0F` en sombre. États : `--success`, `--warning`, `--danger`, `--info` (+ `-100` fond, `-800` texte).
- **Utilitaires Tailwind du projet** : `bg-f-bg`, `bg-f-surface`, `bg-f-card`, `text-f-text`, `text-f-muted`, `border-f-line`, `text-f-ink-accent`, `shadow-f-soft`, `shadow-f-float`. Les utiliser plutôt que des couleurs en dur.
- **Polices** : titres **Caprasimo** (`--font-heading`, classe `font-display`), texte **Figtree** (`--font-body`). Dans les espaces, les titres de section utilisent `heading-sans` (Figtree gras) à l'intérieur d'un conteneur `.fd-ui` ou `.landing`.
- **Boutons** : `cta-primary` (dégradé orange), `cta-ghost` (secondaire). Formes arrondies (`rounded-full`, cartes `rounded-3xl`).
- **Thème clair/sombre** : `useTheme()` (`lib/theme.ts`), stocké dans `localStorage` (`fids_theme`), appliqué avant affichage par `THEME_SCRIPT` (pas de flash).
- **Icônes** : `components/Icons.tsx` et `components/auth/AuthIcons.tsx` ; logos des opérateurs : `components/payments/ProviderLogo.tsx`. Pas d'emoji.
- **Animations** : `components/motion/*`, courbe `EASE` ; toujours respecter `prefers-reduced-motion`.
- **Accessibilité** : contraste suffisant en clair et en sombre, `aria-label` sur les boutons icône, focus visible, fenêtres avec `role="dialog"`, cibles tactiles ≥ 40 px, aucun débordement horizontal à 390 px.
- **Textes** : apostrophe typographique `’` dans le JSX, montants « 25 000 FCFA » (`formatXof`), dates en français.

## 13. Pages légales et documentation (Roxane)

- **Réservées à Roxane** (rédaction en cours) : `/confidentialite`, `/cookies`, `/mentions-legales`, `/litiges`, `/regles`, `/faq`, `/contact`. Elles affichent pour l'instant « Réservé pour Roxane » (`components/legal/Reserved.tsx`). Roxane gère aussi la documentation.
- **Déjà rédigées** : `/cgu` et `/cf`.
- Toutes utilisent `components/legal/LegalPage.tsx` (titre, date, sommaire, articles, pied de page commun). Une page = une liste de `sections` `{ id, title, body }` ; le texte reçoit la classe `legal-prose` automatiquement. Exemple complet : `app/cgu/page.tsx`. Pour la FAQ ou le contact, passer `numbered={false}` (pas de « Article 1 · »).
- Les informations de l'entreprise (raison sociale, RCCM, adresse, e-mails, hébergeur…) sont centralisées dans `COMPANY` (`lib/legal.ts`) et valent « (en mode dev) » tant qu'elles ne sont pas connues. Les afficher avec `{COMPANY.name}`, etc., plutôt que de les recopier ; `InfoRow` (dans `LegalPage.tsx`) affiche une ligne « libellé : valeur ».
- La date affichée vient de `LEGAL_UPDATED_AT` ; changer `TERMS_VERSION` si le fond des CGU ou de la confidentialité change (§8.8).
- Ce que les pages doivent couvrir (cadre ivoirien : lois n° 2013-450 données personnelles, 2013-546 transactions électroniques, 2013-451 cybercriminalité ; autorité : ARTCI) :
  - **Mentions légales** : éditeur (raison sociale, forme, RCCM, siège, contact), directeur de la publication, hébergeur.
  - **Confidentialité** : données collectées (voir §7), finalités, bases légales, destinataires, transferts hors du pays (Google, GitHub, hébergeur), durées de conservation, sécurité, droits (export et suppression existent dans le profil, §8.8), contact, recours ARTCI.
  - **Cookies** : uniquement techniques aujourd'hui : cookie de session Better Auth, cookies temporaires de connexion Google/GitHub, cookie de l'aperçu, `localStorage` `fids_theme` et `recette.payer.<token>`.
  - **Litiges** : procédure du §8.4 (48 h, ticket, décision motivée de l'admin).
  - **Règles d'utilisation** : code malveillant interdit, fraude aux paiements, comptes, sanctions, signalement.
  - **FAQ** et **Contact** : questions courantes, moyens de contact et délai de réponse.
- Faire relire les textes par un juriste avant la mise en production.

## 14. Vérifier son travail

Pas encore de tests automatisés. Avant de proposer une modification :

```bash
npx tsc --noEmit     # types (ignorer les erreurs sous .next/ après suppression de routes)
pnpm lint            # ESLint
```

Puis tester le parcours dans le navigateur, en clair et en sombre, sur ordinateur et à 390 px de large. Les e-mails de test arrivent dans Mailpit. Supprimer les comptes de test créés.

## 15. Ce qui reste / ce qui est obsolète

- **Obsolète** : `docs/page-client.md` décrit l'ancien faux backend de la page client (supprimé). `lib/context.tsx`, `lib/store.ts`, `lib/types.ts` et `components/auth/useSyncMockUser.ts` sont des restes de l'ancienne maquette, encore importés par `app/layout.tsx` et `components/InvoiceModal.tsx` : à supprimer.
- **Planning du concours** (`docs/plan-cadev.md`) : paiement Wave (4b), mise à jour automatique (5), nom de domaine (6), passation (7), mise en ligne (8).
- **Autres** : e-mails transactionnels (paiement déclaré, frais confirmés…), connexion Apple (en attente de l'abonnement Apple Developer, interrupteur `APPLE_ENABLED`), rédaction des sept pages légales réservées à Roxane (§13).

## 16. Consignes pour un agent IA

1. Lire ce guide, `docs/decisions.md` et `AGENTS.md` avant toute modification.
2. Respecter les règles d'or (§2), en particulier : pas d'argent du dev chez Fid's, pas de mock, pas d'emoji, textes en français.
3. Imiter le code voisin : mêmes noms, même densité de commentaires (en français), mêmes composants.
4. Toute nouvelle route : `handle()` + `requireUser`/`requireRole` + schéma Zod dans `lib/contracts` + DTO dans `serializers.ts` + hook dans `lib/queries`.
5. Tout changement de statut d'une livraison passe par `transition()`.
6. Changement de schéma : modifier `prisma/schema/*.prisma`, créer une migration, `prisma generate`, puis demander de redémarrer `pnpm dev`.
7. Ne jamais lancer de build, de commit ni de push sans l'accord explicite de la personne qui pilote.
8. Noter toute décision importante dans `docs/decisions.md` (date, décision, raison).
