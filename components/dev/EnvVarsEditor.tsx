'use client';

import { useState, type FormEvent } from 'react';
import { CloseIcon, LockIcon } from '@/components/Icons';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/lib/api/client';
import { useDeleteEnvVar, useEnvVars, useSetEnvVar } from '@/lib/queries/projects';

const NAME_RE = /^[A-Z_][A-Z0-9_]*$/;

/**
 * Variables d'environnement du projet (clés d'API…). Chiffrées par Fid’s, jamais réaffichées :
 * pour changer une valeur, on la saisit de nouveau. Prises en compte au prochain envoi du code.
 */
export function EnvVarsEditor({ deliveryId, editable }: { deliveryId: string; editable: boolean }) {
  const { showToast } = useToast();
  const { data: vars } = useEnvVars(deliveryId);
  const save = useSetEnvVar(deliveryId);
  const remove = useDeleteEnvVar(deliveryId);
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const n = name.trim().toUpperCase();
    if (!NAME_RE.test(n)) return setError('Nom en majuscules, chiffres et _ (ex. RESEND_API_KEY).');
    setError(null);
    save.mutate(
      { name: n, value },
      {
        onSuccess: () => {
          setName('');
          setValue('');
          showToast(`${n} enregistrée : renvoyez le code pour l’appliquer`, 'success');
        },
        onError: err => setError(errorMessage(err)),
      },
    );
  };

  return (
    <details className="mt-5 rounded-2xl border border-f-line" open={vars ? vars.length > 0 : false}>
      <summary className="cursor-pointer select-none px-4 py-3 text-[14.5px] font-semibold">
        Variables d’environnement {vars?.length ? <span className="font-normal text-f-muted">({vars.length})</span> : null}
      </summary>
      <div className="space-y-3 border-t border-f-line px-4 py-4">
        <p className="flex items-start gap-2 text-[13px] text-f-muted">
          <LockIcon size={14} className="mt-0.5 shrink-0" />
          Clés d’API et réglages de votre .env. Chiffrées, jamais réaffichées, disponibles à la construction et au lancement. La démo n’a pas accès à Internet : une clé factice suffit souvent.
        </p>

        {vars?.length ? (
          <ul className="divide-y divide-[var(--color-divider)] rounded-xl border border-f-line">
            {vars.map(v => (
              <li key={v.name} className="flex items-center justify-between gap-3 px-3 py-2">
                <span className="font-mono text-[13px]">{v.name}</span>
                <span className="flex items-center gap-2 text-[12.5px] text-f-muted">
                  ••••••
                  {editable ? (
                    <button
                      type="button"
                      aria-label={`Supprimer ${v.name}`}
                      onClick={() => remove.mutate(v.name, { onError: err => showToast(errorMessage(err), 'error') })}
                      className="grid size-7 place-items-center rounded-full hover:bg-f-surface hover:text-f-text"
                    >
                      <CloseIcon size={14} />
                    </button>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
        ) : null}

        {editable ? (
          <form onSubmit={submit} noValidate className="grid gap-2 sm:grid-cols-[1fr_1.4fr_auto]">
            <label className="sr-only" htmlFor={`env-name-${deliveryId}`}>Nom</label>
            <input
              id={`env-name-${deliveryId}`}
              value={name}
              onChange={e => setName(e.target.value.toUpperCase())}
              placeholder="RESEND_API_KEY"
              autoComplete="off"
              spellCheck={false}
              className="h-11 rounded-xl border border-f-line bg-f-card px-3 font-mono text-[13px] outline-none focus:border-[var(--color-accent)]"
            />
            <label className="sr-only" htmlFor={`env-value-${deliveryId}`}>Valeur</label>
            <input
              id={`env-value-${deliveryId}`}
              type="password"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Valeur"
              autoComplete="new-password"
              className="h-11 rounded-xl border border-f-line bg-f-card px-3 text-[13px] outline-none focus:border-[var(--color-accent)]"
            />
            <button type="submit" disabled={save.isPending} className="cta-ghost h-11 rounded-xl px-4 text-[13.5px]">
              {save.isPending ? <SpinnerIcon /> : null} Ajouter
            </button>
            {error ? <p className="text-[13px] text-[var(--danger-800)] sm:col-span-3">{error}</p> : null}
          </form>
        ) : null}
      </div>
    </details>
  );
}
