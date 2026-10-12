'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import { Field, FormAlert } from '@/components/auth/Field';
import { Card, Skeleton } from '@/components/dev/ui';
import { Modal } from '@/components/dev/Modal';
import { DownloadIcon, LockIcon, ShieldIcon } from '@/components/Icons';
import { authClient } from '@/lib/auth-client';
import { errorMessage } from '@/lib/api/client';
import { useDeleteAccount, useDeletionCheck } from '@/lib/queries/account';

/** Profil : télécharger ses données (droit d'accès) et supprimer son compte (droit à l'effacement). */
export function AccountDataCard() {
  const [open, setOpen] = useState(false);
  return (
    <Card className="p-6 text-[14.5px]">
      <h2 className="heading-sans text-[16px]">Mes données</h2>
      <p className="mt-2 text-f-muted">
        Ce que Fid’s garde sur vous et pourquoi : voir la <Link href="/confidentialite" className="font-semibold text-f-ink-accent underline underline-offset-2">politique de confidentialité</Link>.
      </p>
      <a href="/api/v1/me/export" download className="cta-ghost mt-4 inline-flex w-full justify-center rounded-full px-5 py-2.5 text-[14px]">
        <DownloadIcon size={16} /> Télécharger mes données
      </a>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 w-full rounded-full px-5 py-2.5 text-[14px] font-semibold text-[var(--danger-800)] hover:bg-[var(--danger-100)]"
      >
        Supprimer mon compte
      </button>
      <Modal open={open} onClose={() => setOpen(false)} title="Supprimer mon compte">
        {open ? <DeleteAccountForm onCancel={() => setOpen(false)} /> : null}
      </Modal>
    </Card>
  );
}

function DeleteAccountForm({ onCancel }: { onCancel: () => void }) {
  const check = useDeletionCheck(true);
  const remove = useDeleteAccount();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [confirmation, setConfirmation] = useState('');
  const [password, setPassword] = useState('');

  if (check.isPending) return <Skeleton className="h-40" />;
  if (check.error) return <FormAlert message={errorMessage(check.error)} />;
  const { blockers, requiresPassword } = check.data;

  if (blockers.length) {
    return (
      <div className="space-y-4 text-[14.5px]">
        <p>Votre compte ne peut pas encore être supprimé :</p>
        <ul className="list-disc space-y-1.5 pl-5">
          {blockers.map(b => <li key={b}>{b}</li>)}
        </ul>
        <button type="button" onClick={onCancel} className="cta-ghost w-full rounded-full px-5 py-3">Compris</button>
      </div>
    );
  }

  const ready = confirmation === 'SUPPRIMER' && (!requiresPassword || password.length > 0);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    remove.mutate(
      { confirmation: 'SUPPRIMER', password: requiresPassword ? password : undefined },
      // Les sessions sont déjà supprimées côté serveur : on nettoie le navigateur et on quitte l'espace.
      {
        onSuccess: async () => {
          await authClient.signOut().catch(() => undefined);
          queryClient.clear();
          router.push('/');
          router.refresh();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4 text-[14.5px]">
      <p>Cette action est définitive :</p>
      <ul className="list-disc space-y-1.5 pl-5 text-f-muted">
        <li>vos nom, e-mail, téléphone et moyens de connexion sont effacés ;</li>
        <li>vos numéros Mobile Money sont retirés ;</li>
        <li>les paiements et factures passés sont conservés sans votre nom, pour les obligations comptables.</li>
      </ul>
      <p className="text-f-muted">Pensez à <a href="/api/v1/me/export" download className="font-semibold text-f-ink-accent underline underline-offset-2">télécharger vos données</a> avant.</p>
      <FormAlert message={remove.error ? errorMessage(remove.error) : null} />
      <Field
        label="Tapez SUPPRIMER pour confirmer"
        icon={<ShieldIcon size={18} />}
        value={confirmation}
        onChange={e => setConfirmation(e.target.value.toUpperCase())}
        autoComplete="off"
        placeholder="SUPPRIMER"
      />
      {requiresPassword ? (
        <Field label="Mot de passe" icon={<LockIcon size={18} />} type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password" />
      ) : null}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onCancel} className="cta-ghost rounded-full px-5 py-3">Annuler</button>
        <button
          type="submit"
          disabled={!ready || remove.isPending}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[var(--danger)] px-5 py-3 font-semibold text-white disabled:opacity-50"
        >
          {remove.isPending ? <SpinnerIcon /> : null} Supprimer définitivement
        </button>
      </div>
    </form>
  );
}
