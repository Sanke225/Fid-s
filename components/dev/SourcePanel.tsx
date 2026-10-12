'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react';
import { ExternalIcon } from '@/components/Icons';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import { useToast } from '@/components/Toast';
import { Card } from '@/components/dev/ui';
import { EnvVarsEditor } from '@/components/dev/EnvVarsEditor';
import { GithubMark, GithubPicker } from '@/components/dev/GithubPicker';
import { apiFetch, errorMessage } from '@/lib/api/client';
import type { BuildLogLine, Delivery, LinkGithubInput, Project } from '@/lib/contracts';
import { timeAgo } from '@/lib/delivery-ui';
import { queryKeys } from '@/lib/queries/keys';
import { useGithubImport, useLinkGithub, useUploadSource } from '@/lib/queries/projects';

const MAX_MB = 50;

type LogState = { buildId: string; lines: BuildLogLine[]; done: boolean; status: string; failure: { stage: string; message: string } | null };

/** Journal d'une installation, lu par morceaux (after=<seq>) toutes les 1,5 s jusqu'à la fin. */
function useBuildLog(deliveryId: string, buildId: string | null) {
  const qc = useQueryClient();
  const [state, setState] = useState<LogState | null>(null);

  useEffect(() => {
    if (!buildId) return;
    let after = -1;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;

    const tick = async () => {
      try {
        const page = await apiFetch<{ lines: BuildLogLine[]; nextAfter: number; done: boolean; status: string; failure: LogState['failure'] }>(
          `/deliveries/${encodeURIComponent(deliveryId)}/builds/${encodeURIComponent(buildId)}/logs?after=${after}`,
        );
        if (stopped) return;
        after = page.nextAfter;
        // Le journal d'une installation précédente est remplacé, jamais complété.
        setState(s => ({
          buildId,
          lines: [...(s?.buildId === buildId ? s.lines : []), ...page.lines],
          done: page.done,
          status: page.status,
          failure: page.failure,
        }));
        // Fin : la page projet se met à jour (statut, adresse de la démo).
        if (page.done && page.lines.length === 0) {
          void qc.invalidateQueries({ queryKey: queryKeys.projects });
          return;
        }
      } catch {
        // Erreur passagère : on réessaie au prochain tour.
      }
      if (!stopped) timer = setTimeout(tick, 1500);
    };
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [deliveryId, buildId, qc]);

  return state?.buildId === buildId ? state : null;
}

/** Code source et démo d'une livraison, côté dev : envoi du .zip, installation en direct, aperçu privé. */
export function SourcePanel({ delivery: d, project }: { delivery: Delivery; project: Project }) {
  const projectStatus = project.status;
  const { showToast } = useToast();
  const upload = useUploadSource(d.id);
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const build = d.lastBuild;
  const log = useBuildLog(d.id, build?.id ?? null);
  const running = build?.status === 'queued' || build?.status === 'running' || (log !== null && !log.done);
  const canUpload = (projectStatus === 'assigned' || projectStatus === 'in_progress') && !running && !upload.isPending;

  const send = (file: File | undefined) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.zip')) return showToast('Envoyez le projet sous forme d’archive .zip.', 'warning');
    if (file.size > MAX_MB * 1024 * 1024) return showToast(`L’archive dépasse ${MAX_MB} Mo : retirez node_modules et .next.`, 'warning');
    upload.mutate(file, {
      onSuccess: () => {
        setShowLog(true);
        showToast('Code reçu : installation en cours', 'success');
      },
      onError: err => showToast(errorMessage(err), 'error'),
    });
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (canUpload) send(e.dataTransfer.files[0]);
  };

  const failed = !running && (log?.status === 'failed' || build?.status === 'failed');

  return (
    <Card className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="heading-sans text-[16px]">Code et démo</h2>
          <p className="mt-1 text-[13.5px] text-f-muted">
            {projectStatus === 'finished'
              ? 'Version figée : c’est celle que votre client teste.'
              : 'Aperçu privé : votre client ne le voit qu’après « Marquer terminé ».'}
          </p>
        </div>
        {d.demoUrl ? (
          <Link href={`/apercu/${d.id}`} className="cta-primary rounded-2xl px-4 py-2.5 text-[14px]">
            <ExternalIcon size={15} /> Voir l’application
          </Link>
        ) : null}
      </div>

      {projectStatus === 'assigned' || projectStatus === 'in_progress' ? (
        <GithubSource project={project} deliveryId={d.id} disabled={!canUpload} onImported={() => setShowLog(true)} />
      ) : null}

      {projectStatus === 'assigned' || projectStatus === 'in_progress' ? (
        <div
          onDragOver={e => {
            e.preventDefault();
            if (canUpload) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-5 rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${dragging ? 'border-[#C84A00] bg-[var(--color-accent-100)]' : 'border-f-line'}`}
        >
          <input ref={input} type="file" accept=".zip,application/zip" className="sr-only" onChange={(e: ChangeEvent<HTMLInputElement>) => send(e.target.files?.[0])} />
          <p className="text-[14.5px] font-semibold">{d.demoUrl ? 'Envoyer une nouvelle version' : 'Envoyer le code du projet'}</p>
          <p className="mt-1 text-[13px] text-f-muted">
            Archive .zip ({MAX_MB} Mo max), sans node_modules ni .next. Vos fichiers <code>.env</code> sont lus par Fid’s sans être copiés dans la démo ;
            un fichier <code>fids.json</code> règle la base et les données de démo.
          </p>
          <button type="button" disabled={!canUpload} onClick={() => input.current?.click()} className="cta-ghost mt-3 rounded-xl px-4 py-2 text-[14px]">
            {upload.isPending ? <SpinnerIcon /> : null} Choisir l’archive
          </button>
        </div>
      ) : null}

      <EnvVarsEditor deliveryId={d.id} editable={projectStatus === 'assigned' || projectStatus === 'in_progress'} />

      {build ? (
        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[14px]">
            <p className={failed ? 'font-semibold text-[var(--danger-800)]' : running ? 'font-semibold' : 'text-f-muted'}>
              {running ? (
                <span className="inline-flex items-center gap-2">
                  <SpinnerIcon /> Installation en cours…
                </span>
              ) : failed ? (
                `Installation échouée${log?.failure ? ` : ${log.failure.message}` : ''}`
              ) : (
                `Dernière installation réussie, ${timeAgo(build.queuedAt)}`
              )}
            </p>
            {build.commit ? (
              <p className="w-full truncate text-[13px] text-f-muted" title={build.commit.message}>
                <GithubMark size={13} /> <span className="font-mono">{build.commit.sha.slice(0, 7)}</span> · {build.commit.message}
              </p>
            ) : null}
            <button type="button" onClick={() => setShowLog(v => !v)} className="text-[13.5px] font-semibold text-f-ink-accent hover:underline" aria-expanded={showLog || running}>
              {showLog || running ? 'Masquer le journal' : 'Voir le journal'}
            </button>
          </div>
          {(showLog || running) && log ? <LogView lines={log.lines} /> : null}
        </div>
      ) : null}
    </Card>
  );
}

function LogView({ lines }: { lines: BuildLogLine[] }) {
  const box = useRef<HTMLPreElement>(null);
  // Suit la fin du journal, comme un terminal.
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [lines.length]);
  return (
    <pre ref={box} aria-live="polite" className="mt-3 max-h-80 overflow-auto rounded-2xl bg-[#14110f] p-4 text-[12px] leading-relaxed text-[#e8e2dc]">
      {lines.length === 0 ? 'En attente du worker…' : null}
      {lines.map(l => (
        <div key={l.seq} className={l.stream === 'system' ? 'font-semibold text-[#ffb27a]' : l.stream === 'stderr' ? 'text-[#ff9b9b]' : undefined}>
          {l.line}
        </div>
      ))}
    </pre>
  );
}

/** Code depuis GitHub : dépôt relié au projet, et « Importer le dernier commit » de sa branche. */
function GithubSource({ project, deliveryId, disabled, onImported }: { project: Project; deliveryId: string; disabled: boolean; onImported: () => void }) {
  const { showToast } = useToast();
  const link = useLinkGithub(project.id);
  const importer = useGithubImport(deliveryId);
  const [editing, setEditing] = useState(false);
  const [choice, setChoice] = useState<LinkGithubInput | null>(project.github);
  const gh = project.github;

  const save = () =>
    link.mutate(choice, {
      onSuccess: () => {
        setEditing(false);
        showToast(choice ? 'Dépôt relié au projet' : 'Dépôt retiré', 'success');
      },
      onError: err => showToast(errorMessage(err), 'error'),
    });

  const runImport = () =>
    importer.mutate(undefined, {
      onSuccess: r => {
        onImported();
        showToast(`Commit ${r.commit.sha.slice(0, 7)} importé : installation en cours`, 'success');
      },
      onError: err => showToast(errorMessage(err), 'error'),
    });

  return (
    <div className="mt-5 rounded-2xl border border-f-line p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="flex items-center gap-2 text-[14.5px] font-semibold">
          <GithubMark /> Depuis GitHub
        </p>
        {gh && !editing ? (
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={runImport} disabled={disabled || importer.isPending} className="cta-primary rounded-xl px-4 py-2 text-[14px]">
              {importer.isPending ? <SpinnerIcon /> : null} Importer le dernier commit
            </button>
            <button type="button" onClick={() => setEditing(true)} className="cta-ghost rounded-xl px-3 py-2 text-[13.5px]">
              Changer
            </button>
          </div>
        ) : null}
      </div>

      {gh && !editing ? (
        <p className="mt-2 text-[13.5px] text-f-muted">
          <span className="font-mono text-f-text">{gh.repo}</span> · branche <span className="font-mono text-f-text">{gh.branch}</span> ({gh.account})
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <GithubPicker value={choice} onChange={setChoice} />
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={save} disabled={link.isPending || (!choice && !gh)} className="cta-primary rounded-xl px-4 py-2 text-[14px]">
              {link.isPending ? <SpinnerIcon /> : null} {choice ? 'Relier ce dépôt' : 'Retirer le dépôt'}
            </button>
            {gh ? (
              <button type="button" onClick={() => { setChoice(gh); setEditing(false); }} className="cta-ghost rounded-xl px-3 py-2 text-[13.5px]">
                Annuler
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
