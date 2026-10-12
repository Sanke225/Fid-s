'use client';

import { usePathname } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/Toast';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import type { LinkGithubInput } from '@/lib/contracts';
import { useGithubBranches, useGithubRepos } from '@/lib/queries/projects';

export function GithubMark({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38v-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.92-.89-1.17-.89-1.17-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.71 1.22 1.87.87 2.33.66.07-.52.28-.87.5-1.07-1.78-.2-3.65-.89-3.65-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  );
}

/** Lien « Connecter GitHub » : choix des dépôts sur GitHub, puis retour sur la page courante. */
export function ConnectGithubLink({ label = 'Connecter GitHub' }: { label?: string }) {
  const path = usePathname();
  return (
    <a href={`/api/v1/github/install?retour=${encodeURIComponent(path)}`} className="cta-ghost inline-flex rounded-xl px-4 py-2 text-[14px]">
      <GithubMark size={16} /> {label}
    </a>
  );
}

/**
 * Choix d'un dépôt et d'une branche parmi ceux autorisés par le dev.
 * Contrôlé : onChange reçoit la sélection complète (ou null), la page décide quand l'enregistrer.
 */
export function GithubPicker({ value, onChange }: { value: LinkGithubInput | null; onChange: (v: LinkGithubInput | null) => void }) {
  const { data, isPending, error } = useGithubRepos();
  const [query, setQuery] = useState('');
  const repo = data?.items.find(r => r.installationId === value?.installationId && r.fullName === value?.repo) ?? null;
  const { data: branches, isFetching: loadingBranches } = useGithubBranches(repo?.installationId ?? null, repo?.fullName ?? null);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data?.items ?? []).filter(r => !q || r.fullName.toLowerCase().includes(q)).slice(0, 50);
  }, [data, query]);

  if (isPending) return <p className="flex items-center gap-2 text-[14px] text-f-muted"><SpinnerIcon /> Chargement de vos dépôts…</p>;
  if (error) return <p className="text-[14px] text-[var(--danger-800)]">Dépôts GitHub indisponibles pour le moment.</p>;
  if (!data.configured) return <p className="text-[13.5px] text-f-muted">La connexion GitHub n’est pas encore activée sur ce serveur Fid’s.</p>;
  if (data.accounts.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-[13.5px] text-f-muted">Connectez votre compte GitHub et choisissez les dépôts que Fid’s peut lire (lecture seule).</p>
        <ConnectGithubLink />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-[13px] text-f-muted">
        <span className="inline-flex items-center gap-1.5">
          <GithubMark size={14} /> {data.accounts.join(', ')}
        </span>
        <a href={`/api/v1/github/install?retour=${encodeURIComponent(typeof window === 'undefined' ? '/dev/projects' : window.location.pathname)}`} className="font-semibold text-f-ink-accent hover:underline">
          Gérer les dépôts autorisés
        </a>
      </div>
      <input
        type="search"
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Rechercher un dépôt…"
        aria-label="Rechercher un dépôt"
        className="h-11 w-full rounded-xl border border-f-line bg-f-card px-3 text-[14px] outline-none focus:border-[var(--color-accent)]"
      />
      <ul role="listbox" aria-label="Dépôts" className="max-h-56 overflow-auto rounded-xl border border-f-line">
        {visible.length === 0 ? <li className="px-3 py-3 text-[13.5px] text-f-muted">Aucun dépôt autorisé ne correspond.</li> : null}
        {visible.map(r => {
          const selected = repo?.fullName === r.fullName && repo.installationId === r.installationId;
          return (
            <li key={`${r.installationId}:${r.fullName}`}>
              <button
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => onChange(selected ? null : { installationId: r.installationId, repo: r.fullName, branch: r.defaultBranch })}
                className={`flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-[14px] ${selected ? 'bg-[var(--color-accent-100)] font-semibold' : 'hover:bg-f-surface'}`}
              >
                <span className="truncate font-mono text-[13px]">{r.fullName}</span>
                <span className="shrink-0 text-[12px] text-f-muted">{r.private ? 'privé' : 'public'}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {repo && value ? (
        <label className="flex items-center gap-3 text-[14px]">
          <span className="text-f-muted">Branche</span>
          <select
            value={value.branch}
            onChange={e => onChange({ ...value, branch: e.target.value })}
            className="h-10 min-w-40 rounded-xl border border-f-line bg-f-card px-3 text-[14px]"
          >
            {(branches ?? [value.branch]).map(b => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          {loadingBranches ? <SpinnerIcon /> : null}
        </label>
      ) : null}
    </div>
  );
}

const RETURN_MESSAGES: Record<string, [string, 'success' | 'warning' | 'error']> = {
  connecte: ['Compte GitHub connecté : choisissez un dépôt', 'success'],
  aucun: ['Aucune installation de l’App trouvée sur votre compte GitHub', 'warning'],
  incomplet: ['GitHub n’a pas renvoyé d’autorisation : recommencez la connexion', 'warning'],
  refuse: ['Connexion GitHub refusée (lien expiré). Recommencez.', 'error'],
};

/** Message au retour de GitHub (?github=…), puis nettoyage de l'adresse. */
export function GithubReturnNotice() {
  const { showToast } = useToast();
  const qc = useQueryClient();
  useEffect(() => {
    const url = new URL(window.location.href);
    const status = url.searchParams.get('github');
    if (!status) return;
    const msg = RETURN_MESSAGES[status];
    if (msg) showToast(msg[0], msg[1]);
    void qc.invalidateQueries({ queryKey: ['github'] });
    url.searchParams.delete('github');
    window.history.replaceState(null, '', url.pathname + url.search);
  }, [showToast, qc]);
  return null;
}
