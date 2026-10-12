'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { BrandSymbol } from '@/components/Brand';
import { ArrowLeftIcon, CopyIcon, ExternalIcon } from '@/components/Icons';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import { useToast } from '@/components/Toast';
import { ApiClientError, errorMessage } from '@/lib/api/client';
import type { DemoPreview } from '@/lib/contracts';
import { timeAgo } from '@/lib/delivery-ui';

type Device = 'desktop' | 'mobile';

// Appels à l'API de l'hôte d'aperçu (même origine que la page), avec le format d'erreur commun.
async function call<T>(url: string, method: 'GET' | 'POST' = 'GET'): Promise<T> {
  const res = await fetch(url, { method, credentials: 'same-origin', headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiClientError(res.status, data?.error?.code ?? 'INTERNAL_ERROR', data?.error?.message ?? 'Service momentanément indisponible.');
  return data as T;
}

function usePreview(apiBase: string, deliveryId: string) {
  return useQuery({
    queryKey: ['apercu', deliveryId],
    queryFn: () => call<DemoPreview>(`${apiBase}/${deliveryId}`),
    // Plus fréquent pendant une mise à jour : le cadre se recharge dès que la nouvelle version est en ligne.
    refetchInterval: q => (q.state.data?.updating ? 2_000 : 15_000),
  });
}

function useReset(apiBase: string, deliveryId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => call<{ buildId: string }>(`${apiBase}/${deliveryId}/reset`, 'POST'),
    onSettled: () => qc.invalidateQueries({ queryKey: ['apercu', deliveryId] }),
  });
}

/**
 * « Voir l'application » : bandeau Fid’s (projet, compte de démo, réinitialisation) et l'application dans un cadre.
 * Servie sur apercu.<domaine des démos> : la démo du cadre est « même site », sa connexion fonctionne dans le cadre.
 * Elle ne peut ni naviguer hors du cadre (sandbox) ni lire le cookie de l'aperçu (autre hôte, HttpOnly).
 */
export function PreviewView({ deliveryId, apiBase, fidsOrigin }: { deliveryId: string; apiBase: string; fidsOrigin: string }) {
  const { showToast } = useToast();
  const { data: p, isPending, error } = usePreview(apiBase, deliveryId);
  const reset = useReset(apiBase, deliveryId);
  const [device, setDevice] = useState<Device>('desktop');
  const [confirmReset, setConfirmReset] = useState(false);

  // Retour vers Fid’s (autre domaine que cette page).
  const back = `${fidsOrigin}${p?.viewer === 'client' ? `/client/deliveries/${deliveryId}` : '/dev/projects'}`;

  const copy = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      showToast(`${label} copié`, 'success');
    } catch {
      showToast('Copie impossible : recopiez-le à la main.', 'warning');
    }
  };

  const doReset = () =>
    reset.mutate(undefined, {
      onSuccess: () => {
        setConfirmReset(false);
        showToast('Réinitialisation lancée : la démo revient à son état de départ', 'success');
      },
      onError: err => showToast(errorMessage(err), 'error'),
    });

  return (
    <div className="fd-ui flex h-svh flex-col bg-f-surface text-f-text">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-f-line bg-f-card px-4 py-2.5 shadow-f-soft">
        <a href={back} className="grid size-9 place-items-center rounded-full text-f-muted hover:bg-f-surface hover:text-f-text" aria-label="Retour">
          <ArrowLeftIcon size={17} />
        </a>
        <BrandSymbol size={26} />
        <div className="min-w-0">
          <p className="truncate text-[15px] font-bold leading-tight">{p?.projectName ?? 'Aperçu'}</p>
          <p className="truncate text-[12px] text-f-muted">
            {p ? `par ${p.devName}` : ''}
            {p?.version ? ` · version du ${timeAgo(p.version.at)}` : ''}
          </p>
        </div>
        <span className="rounded-full bg-[var(--warning-100)] px-2.5 py-1 text-[12px] font-semibold text-[var(--warning-800)]">
          Démo · données fictives
        </span>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {p?.demoLogin ? (
            <div className="flex items-center gap-1 rounded-xl border border-f-line px-2 py-1 text-[12.5px]">
              <span className="text-f-muted">Compte démo :</span>
              <button type="button" onClick={() => copy('Identifiant', p.demoLogin!.login)} className="rounded-md px-1.5 py-0.5 font-mono hover:bg-f-surface" title="Copier l’identifiant">
                {p.demoLogin.login}
              </button>
              <span aria-hidden className="text-f-muted">/</span>
              <button type="button" onClick={() => copy('Mot de passe', p.demoLogin!.password)} className="flex items-center gap-1 rounded-md px-1.5 py-0.5 font-mono hover:bg-f-surface" title="Copier le mot de passe">
                {p.demoLogin.password} <CopyIcon size={12} />
              </button>
            </div>
          ) : null}

          <div role="group" aria-label="Taille d’écran" className="hidden rounded-xl border border-f-line p-0.5 sm:flex">
            {(['desktop', 'mobile'] as const).map(dv => (
              <button
                key={dv}
                type="button"
                aria-pressed={device === dv}
                onClick={() => setDevice(dv)}
                className={`rounded-lg px-2.5 py-1 text-[12.5px] font-semibold ${device === dv ? 'bg-[#C84A00] text-white' : 'text-f-muted hover:text-f-text'}`}
              >
                {dv === 'desktop' ? 'Ordinateur' : 'Mobile'}
              </button>
            ))}
          </div>

          {p?.canReset ? (
            confirmReset ? (
              <span className="flex items-center gap-1.5 text-[12.5px]">
                Effacer les essais ?
                <button type="button" onClick={doReset} disabled={reset.isPending} className="cta-primary rounded-lg px-2.5 py-1 text-[12.5px]">
                  {reset.isPending ? <SpinnerIcon /> : 'Oui'}
                </button>
                <button type="button" onClick={() => setConfirmReset(false)} className="cta-ghost rounded-lg px-2.5 py-1 text-[12.5px]">
                  Non
                </button>
              </span>
            ) : (
              <button type="button" onClick={() => setConfirmReset(true)} className="cta-ghost rounded-xl px-3 py-1.5 text-[13px]" title="Remet la démo dans son état de départ">
                Réinitialiser
              </button>
            )
          ) : null}

          {p?.demoUrl ? (
            <a href={p.demoUrl} target="_blank" rel="noopener noreferrer" className="cta-primary rounded-xl px-3 py-1.5 text-[13px]">
              <ExternalIcon size={14} /> Plein écran
            </a>
          ) : null}
        </div>
      </header>

      <main className="relative flex-1 overflow-hidden">
        {isPending ? (
          <Centered>
            <SpinnerIcon /> Chargement…
          </Centered>
        ) : error ? (
          <Centered>{errorMessage(error)}</Centered>
        ) : !p.demoUrl ? (
          <Centered>
            {p.updating ? (
              <>
                <SpinnerIcon /> L’application est en cours d’installation…
              </>
            ) : p.viewer === 'client' ? (
              `${p.devName} n’a pas encore terminé le projet. Vous pourrez tester l’application ici dès qu’il sera prêt.`
            ) : (
              'Aucune démo en ligne : envoyez le code depuis la page du projet.'
            )}
          </Centered>
        ) : (
          <div className="flex h-full justify-center overflow-auto p-0 sm:p-3">
            <iframe
              // Nouvelle version (ou réinitialisation) : le cadre se recharge tout seul.
              key={p.version?.id ?? 'demo'}
              src={p.demoUrl}
              title={`Application ${p.projectName}`}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
              className={`h-full border-0 bg-white sm:rounded-2xl sm:shadow-f-float ${device === 'mobile' ? 'w-[390px] max-w-full' : 'w-full'}`}
            />
            {p.updating ? (
              <div className="absolute inset-x-0 top-3 mx-auto flex w-fit items-center gap-2 rounded-full bg-f-card px-4 py-2 text-[13px] font-semibold shadow-f-float">
                <SpinnerIcon /> Mise à jour de la démo… elle se rechargera toute seule.
              </div>
            ) : null}
          </div>
        )}
      </main>

      {p?.demoUrl ? (
        <p className="border-t border-f-line bg-f-card px-4 py-1.5 text-center text-[12px] text-f-muted">
          Démo isolée : aucun e-mail ni paiement réel ne part d’ici.
        </p>
      ) : null}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full items-center justify-center gap-2 px-6 text-center text-[15px] text-f-muted">{children}</div>;
}
