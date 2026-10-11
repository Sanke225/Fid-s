// Règle des frais de service Fid’s, sans dépendance serveur : utilisée par l'API ET par l'interface
// (calculateur de la landing, écrans dev) pour que le montant affiché soit toujours celui facturé.

/** 5 % du montant de la livraison, payés par le client. 0 % pour le développeur. */
export const FEE_RATE = 0.05;
/** Plancher : un envoi Mobile Money en dessous de 100 FCFA n'a pas de sens. */
export const FEE_MIN_XOF = 100;

/** Montant des frais : 5 %, arrondi au franc supérieur, 100 FCFA minimum. */
export function computeFee(deliveryAmountXof: number) {
  return Math.max(Math.ceil(deliveryAmountXof * FEE_RATE), FEE_MIN_XOF);
}
