/**
 * NEXT_PUBLIC_USE_MOCK=false → vraie API (/api/v1). Par défaut : faux backend (données simulées).
 * La valeur est figée au build, la branche inutile disparaît du paquet.
 */
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'
