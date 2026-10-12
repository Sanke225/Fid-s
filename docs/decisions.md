# Décisions

Une entrée par décision : date, décision, raison. Les plus récentes en haut.

## 2026-10-12

- **Concours** : Fid's est présenté au CADEV 2026 de Systalink (rendu le 25 octobre, 17 h GMT). Plan dans `docs/plan-cadev.md`.
- **Cycle de vie du projet** : non assigné → assigné → en développement → terminé. Le statut est porté par le projet, la livraison garde la partie paiement et passation.
- **Compte client créé par le dev** : identifiant et mot de passe provisoire générés par Fid's, changement obligatoire à la première connexion.
- **Aperçu** : privé pour le dev pendant le développement (mis à jour à chaque `git push`) ; le client ne voit que la version figée au clic sur « Terminé ».
- **Adresses** : démos sur `<app>.fids.app`, Fid's sur un autre domaine pour isoler les cookies.
- **Base de données** : démo remplie par le `seed` du dev, avec compte de démo affiché et bouton « Réinitialiser » ; à la passation, base propre et compte admin généré.
- **Nom de domaine** : le client doit payer un domaine chez Systalink avant la passation (ou laisser le dev s'en charger). Sans API publique Systalink, paiement déclaré puis confirmé par un admin.
- **Périmètre concours** : projets Node.js et sites statiques uniquement.
- **E-mail des comptes créés par un dev** : facultatif. Sans e-mail, adresse technique en `.invalid` jamais affichée ; le client ajoute la sienne depuis son profil, enregistrée seulement après clic sur le lien de vérification (Better Auth `changeEmail`, envoi par nodemailer).
- **Démos** : Dockerfile toujours généré par Fid's (jamais celui du dev), réseau Docker interne sans accès Internet, 512 Mo / 0,5 CPU, sans privilège, base Postgres dédiée sur tenant-db. Routage par Traefik (labels posés par le worker). Mise à jour sans coupure : la nouvelle version ne reçoit du trafic qu'une fois prête, puis l'ancienne est retirée.
- **Aperçu sur le domaine des démos** : la page « Voir l'application » est servie sur `apercu.<domaine des démos>` (Traefik → Next.js, `proxy.ts` n'y sert que l'aperçu). La démo du cadre est ainsi « même site » que la page : la connexion à l'application fonctionne dans le cadre. Fid's passe la main avec un jeton signé de 60 s, échangé contre un cookie propre à l'aperçu (8 h, `__Host-` en https). La réinitialisation exige l'en-tête Origin de l'aperçu (une démo voisine ne peut pas la déclencher).
- **GitHub** : GitHub App de Fid's (contenu en lecture seule, dépôts choisis par le dev). La liaison d'une installation n'accepte que celles que le compte GitHub du dev voit réellement (code OAuth → `/user/installations`). L'import télécharge l'archive d'un commit précis (SHA), puis suit le même circuit qu'un .zip. Création de l'App en un clic : `pnpm github:app`.
- **Paiement Wave (à venir, lot 4b)** : pas d'agrégateur pour le paiement au dev (Fid's ne détient pas l'argent du dev). Wave Checkout avec le Wave Business du dev s'il en a un, sinon déclaration + confirmation ; frais Fid's via le Wave Business de Fid's ; mode simulation pour la démonstration.
- **Outils ajoutés** : `tsx` (lancer le worker en TypeScript), `nodemailer` (e-mails), image `traefik:v3.6`. Licences MIT / MIT-0.

## 2026-10-11

- **Frais de service** : 0 % pour le développeur, **5 % payés par le client** (100 FCFA minimum, arrondis au franc supérieur), au moment de recevoir l'application. Remplace les « 3 % » de la landing et les « 0 % de commission » des anciennes CF. Raison : le dev choisit l'outil (adoption), le client paie pour ce qui le protège.
- **Déblocage en deux temps** : le dev confirme le dépôt → la livraison passe en `fee_pending` (la démo reste consultable, rien n'est remis) → le client paie les 5 % sur un numéro de Fid's et déclare la référence → un administrateur confirme (`fee.confirmed`) → `paid`, puis passation. Seul l'appareil qui a payé le dev peut déclarer les frais (`X-Payer-Token`).
- **Argent** : Fid's ne détient toujours jamais le paiement destiné au dev. Elle encaisse seulement ses propres frais, sur ses numéros (`FIDS_PAYOUT_*`).
- **Un seul backend** : `/api/v1` + Postgres. Les faux backends (état simulé du front, `lib/fixtures`, faux backend de la page client) sont supprimés au fur et à mesure.

## 2026-10-06

- **Cadre** : Next.js (App Router) pour le front et l'API, au lieu de React + Vite + Fastify (D3, D4). Raison : déjà en place, équipe à l'aise. Un processus `worker` séparé reste nécessaire pour les tâches longues.
- **Branche principale** : `master` (et non `main` comme dans le cahier des charges). Protégée : PR + 1 approbation.
- **Répartition** : back-end et base de données (responsable back), front espace dev (Ismo), front page client (Roxane). Remplace les trois lots de la section 7.
- **Argent** : Recette ne détient jamais de fonds, ni la plateforme ni l'admin. Pas de séquestre. Les mentions « séquestre » de la maquette seront corrigées.
- **Comptes clients** : un client peut créer un compte (connexion, profil, déconnexion). Sans compte, il reçoit un lien qui lui donne accès à sa livraison.
- **Outil de connexion** : Better Auth plutôt que Firebase. Raison : les comptes vivent dans le même Postgres que les livraisons (vraies clés étrangères, une seule source de vérité), rien d'extérieur à Systalink, gratuit.
- **Base de données** : PostgreSQL 17 + Prisma 7, schéma découpé par domaine dans `prisma/schema/`. Gratuits et open source ; seul le serveur coûte.
- **Connexion** : Google, ou e-mail + mot de passe. À l'inscription, l'utilisateur choisit son rôle (dev ou client).
- **Moyens de paiement** : Wave, Orange Money, Moov Money, MTN MoMo (Afrique de l'Ouest).
- **Confirmation du paiement** : le dev enregistre ses numéros et moyens de paiement. Le client choisit l'un d'eux et paie directement le dev. Le dev clique « dépôt confirmé », ce qui débloque la livraison (D12, option a). Les API opérateurs en mode test viendront ensuite.
- **Événement de déblocage** : `payment.confirmed` (confirmation du dev ou de l'admin) remplace `payment.succeeded` du cahier des charges, puisqu'il n'y a pas de notification d'opérateur. Un paiement déclaré non traité expire au bout de 48 h ; le client peut alors ouvrir un ticket.
- **Preuve de paiement** : le client saisit la référence de sa transaction en déclarant son paiement. Si le dev dit n'avoir rien reçu, le client ouvre un ticket avec ses preuves ; le dev est relancé pour répondre ; à défaut, l'admin peut libérer la livraison (action journalisée). L'admin ne touche jamais l'argent.
- **Hébergement des applis** : Docker (démos et espaces clients), sur le serveur Systalink.
- **Maquette** : on garde le cahier des charges comme référence ; la maquette sera ajustée écran par écran.
