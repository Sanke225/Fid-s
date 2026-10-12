# Plan CADEV — du 12 au 25 octobre 2026

Rendu : **samedi 25 octobre, 17 h GMT**. Gel des fonctionnalités le **23 au soir**. Le 24 est réservé au déploiement, aux tests et au dossier.

## Parcours visé

1. Le dev crée un projet : dépôt d'archive **ou** dépôt GitHub. Projet **non assigné**.
2. Il assigne un client existant, ou **crée son compte** (identifiant + mot de passe provisoire). Projet **assigné**, visible chez le client.
3. Il clique « Début du développement ». Projet **en développement**, et le client voit l'obligation **nom de domaine**.
4. Pendant le développement, **aperçu privé** pour le dev, mis à jour à chaque `git push`. Le client ne voit rien.
5. Le dev clique « Terminé » (possible seulement si la dernière version s'installe sans erreur). La version est **figée** et le client voit **« Voir l'application »**.
6. Le circuit actuel reprend : paiement du dev, frais Fid's, puis passation (base propre + compte admin généré). La passation est bloquée tant que le domaine n'est pas payé.

## Chemin critique

Le moteur de démo (dépôt → installation → conteneur → adresse `<app>.fids.app`). Sans lui, ni bouton, ni GitHub, ni passation.

## Planning

| Jours | Lot | Contenu | Qui |
|---|---|---|---|
| 12–13 oct | **1. Données et cycle de vie** ✅ fait le 12 | `Project.status` (unassigned, assigned, in_progress, finished), client rattaché au projet, création du compte client par le dev (plugin `username` de Better Auth, mot de passe provisoire, changement obligatoire), routes `assign`, `start`, `finish`, statut affiché chez le dev et le client | back + front dev |
| 14–17 oct | **2. Moteur de démo** ✅ fait le 12 (Node + statique) | Route de dépôt (taille max, zip/tar), chiffrement par enveloppe (`MASTER_KEY`), worker Node qui lit les `Build` en file d'attente : déballage, lecture de `fids.json`, image Docker (projets **Node.js et sites statiques** seulement pour le concours), base dans `tenant-db`, `migrate` + `seed`, conteneur limité (CPU, mémoire, réseau sortant coupé), routage par Traefik sur `<app>.fids.app`, vérification de santé, puis `space.ready` | back |
| 18 oct | **3. Aperçu** ✅ fait et testé le 12 | Page d'aperçu (bandeau Fid's + cadre + plein écran), identifiants de démo affichés, bouton « Réinitialiser », journaux d'installation pour le dev, bouton « Terminé » qui fige la version | front dev + front client |
| 19–20 oct | **4. GitHub** ✅ codé le 13 (test avec la vraie App en attente) | GitHub App (lecture seule du contenu), connexion du compte, choix du dépôt / branche à la création, bouton « Importer le dernier commit », commit enregistré sur le `Build` | back + front dev |
| 14 oct | **4b. Paiement Wave** | Modèle hybride : bouton « Payer avec Wave » (Wave Checkout) si le dev a connecté son Wave Business, sinon déclaration + confirmation du dev ; frais Fid’s encaissés par le Wave Business de Fid’s avec confirmation automatique ; mode simulation sans clé | back + front |
| 21 oct | **5. Mise à jour automatique** | Webhook `push` signé, une seule installation à la fois (on garde le dernier commit), l'ancienne version reste en ligne jusqu'à la bascule, rafraîchissement en direct de la page (SSE) | back + front dev |
| 22 oct | **6. Nom de domaine** | Écran d'obligation côté client : recherche (catalogue et prix Systalink saisis par l'admin, faute d'API), options, paiement Mobile Money à Systalink déclaré puis confirmé par un admin, bouton « Laisser au dev », passation bloquée tant que ce n'est pas confirmé. Interface prévue pour brancher l'API Systalink plus tard | back + front client |
| 23 oct | **7. Passation** | Retirer les fichiers `.env*` du code remis au client (ils contiennent les clés du dev). Espace client avec base propre, commande `admin` de `fids.json` avec identifiants générés montrés une seule fois. **Gel** | back |
| 24 oct | **8. Mise en ligne** | Serveur Systalink avec Docker, domaines (Fid's + `*.fids.app`), parcours complet testé, comptes jury (admin, dev, client), README, journal IA, audit des licences, vidéo | toute l'équipe |
| 25 oct | **Rendu** | Avant 17 h GMT | |

## Si on prend du retard, on coupe dans cet ordre

1. Mise à jour automatique (lot 5) : on garde le bouton « Importer le dernier commit ».
2. GitHub (lot 4) : on garde le dépôt d'archive.
3. Paiement du domaine (lot 6) : on garde l'écran de choix, avec une confirmation manuelle.

Les lots 1, 2, 3 et 7 ne se coupent pas.

## Fichier `fids.json` (racine du projet du dev)

```json
{
  "install": "npm ci",
  "build": "npm run build",
  "start": "npm start",
  "port": 3000,
  "migrate": "npx prisma migrate deploy",
  "seed": "npm run seed",
  "admin": "node scripts/create-admin.js",
  "demoLogin": { "email": "demo@demo.sn", "password": "demo1234" }
}
```

`seed` et `demoLogin` servent à la démo ; `admin` sert à la passation (Fid's fournit `FIDS_ADMIN_EMAIL` et `FIDS_ADMIN_PASSWORD`).

## À faire hors code

- Écrire à Systalink : accès partenaire à l'API domaines, webhook de paiement, domaines au nom du client.
- Vérifier que `fids.app` est disponible et l'acheter (les `.app` exigent HTTPS).
- Retrouver le règlement CADEV officiel et vérifier les livrables demandés.
- Tenir le journal d'usage de l'IA au fil de l'eau.
