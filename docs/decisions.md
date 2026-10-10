# Décisions

Une entrée par décision : date, décision, raison. Les plus récentes en haut.

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
