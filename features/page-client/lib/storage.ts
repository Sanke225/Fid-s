/**
 * Accès au stockage du navigateur sans jamais planter :
 * navigation privée, stockage bloqué ou plein → on continue sans.
 */
export function readStorage(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    /* ignoré */
  }
}

export function removeStorage(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    /* ignoré */
  }
}

/** Le jeton payeur prouve que cet appareil a payé : c'est lui qui ouvre l'espace client. */
const payerKey = (deliveryToken: string) => `recette.payer.${deliveryToken}`

export const payerTokenStore = {
  get: (deliveryToken: string) => readStorage(payerKey(deliveryToken)),
  set: (deliveryToken: string, payerToken: string) => writeStorage(payerKey(deliveryToken), payerToken),
}
