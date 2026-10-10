# Page client (branche `front/page-client`)

Ce que voit le client, sans compte : la page de livraison `/l/:token` (P6), le parcours de paiement (G5),
l'écran débloqué et l'espace client `/c/:accessToken` (G7). Pour l'instant, tout tourne sur un **faux backend**
qui respecte les contrats de la section 6 du cahier des charges.

## Lancer

```bash
pnpm install
pnpm dev            # http://localhost:3000/dev liste tous les scénarios
```

## Rejouer la démo (sans backend)

1. Onglet A : `/l/demo-100?ecran=grand` → QR code, montant, « en attente de paiement ».
2. Onglet B : `/l/demo-100` → *Payer 100 FCFA* → nom, numéro, e-mail → page du fournisseur simulé → *Payer*.
3. B montre l'écran débloqué (paiement reçu → installation → prête) ; A bascule en direct.
4. *Accéder à mon espace* → adresse de l'appli, identifiants admin, facture, code source, sauvegarde.

Le bouton *Échouer* du fournisseur simulé montre l'échec et le nouvel essai.
L'état simulé est gardé dans le navigateur (localStorage) ; `/dev` → *Réinitialiser* pour repartir de zéro.

## Où est le code

| Chemin | Rôle |
|---|---|
| `app/(client)/` | Routes Next.js : `l/[token]`, `c/[accessToken]`, et les pages `dev` / `mock/*` (simulation seulement) |
| `features/page-client/lib/contracts.ts` | Types de la section 6.3, à remplacer par le paquet de contrats commun |
| `features/page-client/lib/api.ts` | Interface `PublicApi` + client HTTP vers `/api/v1` (erreurs au format 6.1) |
| `features/page-client/mocks/mockApi.ts` | Faux backend : états, paiement, jeton payeur, passation simulée |
| `features/page-client/delivery/` | Page de livraison : offre, écran débloqué, grand écran, états vides |
| `features/page-client/pay/` | Choix du fournisseur, coordonnées, redirection vers `checkoutUrl` |
| `features/page-client/client-space/` | Espace client |
| `features/page-client/lib/brand.ts` | Nom affiché de la plateforme |

## Brancher le vrai backend (lot 3 / back)

Mettre `NEXT_PUBLIC_USE_MOCK=false` (et `NEXT_PUBLIC_API_BASE` si l'API n'est pas sur `/api/v1`).
Les pages `/dev` et `/mock/*` renvoient alors 404 et les écrans appellent :

- `GET  /public/deliveries/:token` (en-tête `X-Payer-Token` facultatif)
- `POST /public/deliveries/:token/payments` → `{ payment, checkoutUrl, payerToken }`
- `GET  /public/client-space/:accessToken`

Aucun écran n'est à réécrire.

## Règles du cahier des charges appliquées

- Le montant affiché et payé vient toujours du serveur.
- Le retour depuis la page du fournisseur ne débloque rien : seul l'état serveur compte (interrogation toutes les 2 s).
- L'espace client n'est proposé qu'à l'appareil qui a payé (`X-Payer-Token`).
- Expirée, annulée ou inconnue → « cette livraison n'est plus disponible », sans autre détail.
- Mot de passe admin affiché seulement dans l'espace client, masqué par défaut.
- Moyen de paiement non branché → grisé « Bientôt ».
- Le paramètre de retour du fournisseur simulé n'accepte que des chemins internes (pas de redirection ouverte).
