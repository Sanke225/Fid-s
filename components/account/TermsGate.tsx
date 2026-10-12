'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useId, useState } from 'react';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import { FormAlert } from '@/components/auth/Field';
import { ShieldIcon } from '@/components/Icons';
import { authClient } from '@/lib/auth-client';
import { errorMessage } from '@/lib/api/client';
import { useAcceptTerms, useTermsStatus } from '@/lib/queries/account';

/**
 * Fenêtre bloquante à l'entrée des espaces : tant que le compte n'a pas accepté la version en vigueur des CGU
 * et de la politique de confidentialité (inscription Google/GitHub, compte créé par un dev, nouvelle version).
 */
export function TermsGate() {
  const { data } = useTermsStatus();
  const accept = useAcceptTerms();
  const [checked, setChecked] = useState(false);
  const titleId = useId();
  const queryClient = useQueryClient();
  const router = useRouter();

  if (!data || data.acceptedVersion === data.currentVersion) return null;
  const isUpdate = data.acceptedVersion !== null;

  return (
    <div className="fixed inset-0 z-[70] grid place-items-end bg-black/45 backdrop-blur-[2px] sm:place-items-center">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fd-ui w-full max-w-lg rounded-t-[28px] border border-f-line bg-f-card p-6 text-f-text shadow-f-float sm:rounded-[28px] sm:p-8"
      >
        <span className="grid size-11 place-items-center rounded-2xl bg-[var(--color-accent-100)] text-f-ink-accent">
          <ShieldIcon size={22} />
        </span>
        <h2 id={titleId} className="heading-sans mt-4 text-[21px] leading-snug">
          {isUpdate ? 'Nos conditions ont été mises à jour' : 'Avant de commencer'}
        </h2>
        <p className="mt-2 text-[14.5px] leading-relaxed text-f-muted">
          {isUpdate
            ? 'Prenez connaissance de la nouvelle version pour continuer à utiliser votre espace.'
            : 'Pour utiliser Fid’s, acceptez nos conditions. Elles expliquent comment se passent les paiements, les livraisons et ce que nous faisons de vos données.'}
        </p>
        <ul className="mt-4 space-y-1.5 text-[14.5px]">
          <li><Link href="/cgu" target="_blank" className="font-semibold text-f-ink-accent underline underline-offset-2">Conditions d’utilisation</Link></li>
          <li><Link href="/cf" target="_blank" className="font-semibold text-f-ink-accent underline underline-offset-2">Conditions financières</Link></li>
          <li><Link href="/confidentialite" target="_blank" className="font-semibold text-f-ink-accent underline underline-offset-2">Politique de confidentialité</Link></li>
        </ul>
        <label className="mt-5 flex cursor-pointer items-start gap-3 text-[14px] leading-snug">
          <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} className="mt-0.5 size-5 shrink-0 accent-[#C84A00]" />
          J’ai lu et j’accepte les conditions d’utilisation, les conditions financières et la politique de confidentialité.
        </label>
        <div className="mt-4">
          <FormAlert message={accept.error ? errorMessage(accept.error) : null} />
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={async () => {
              await authClient.signOut();
              queryClient.clear();
              router.push('/');
              router.refresh();
            }}
            className="cta-ghost rounded-full px-5 py-3 text-[14.5px]"
          >
            Me déconnecter
          </button>
          <button
            type="button"
            disabled={!checked || accept.isPending}
            onClick={() => accept.mutate(data.currentVersion)}
            className="cta-primary rounded-full px-5 py-3 text-[14.5px] disabled:opacity-50"
          >
            {accept.isPending ? <SpinnerIcon /> : null} Accepter et continuer
          </button>
        </div>
      </div>
    </div>
  );
}
