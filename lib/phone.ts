import { Phone } from '@/lib/contracts/common';

/**
 * Normalise un numéro saisi librement (« 07 00 00 00 00 », « 0022507… ») au format attendu par l'API
 * (« +2250700000000 »). Un numéro à 10 chiffres sans indicatif est considéré ivoirien. Null si invalide.
 */
export function normalizePhone(raw: string): string | null {
  let v = raw.replace(/[\s.\-()]/g, '');
  if (v.startsWith('00')) v = `+${v.slice(2)}`;
  if (/^\d{10}$/.test(v)) v = `+225${v}`;
  const parsed = Phone.safeParse(v);
  return parsed.success ? parsed.data : null;
}

/** « +2250700000001 » → « +225 07 00 00 00 01 » ; autres numéros inchangés. */
export function formatPhone(phone: string) {
  const m = phone.match(/^\+225(\d{10})$/);
  return m ? `+225 ${m[1].replace(/(\d{2})(?=\d)/g, '$1 ')}` : phone;
}
