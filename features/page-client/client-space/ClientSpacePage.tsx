'use client'

import { BRAND } from '../lib/brand'
import { cx } from '../lib/cx'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { DownloadIcon, ExternalIcon, EyeIcon, EyeOffIcon, ShieldIcon } from '../components/icons'
import { ButtonLink, Card, CopyButton, Eyebrow, Notice, PhoneShell } from '../components/ui'
import { ApiError } from '../lib/api'
import type { ClientSpace } from '../lib/contracts'
import { formatDateTime } from '../lib/format'
import { api } from '../lib/publicApi'
import { hostOf } from '../delivery/handover'
import { LoadingScreen } from '../delivery/StateScreens'

/** Espace client : /c/:accessToken (G7). Ce que le client reçoit après la passation. */
export function ClientSpacePage({ accessToken }: { accessToken: string }) {
  const { data, error, isPending } = useQuery({
    queryKey: ['client-space', accessToken],
    queryFn: () => api.getClientSpace(accessToken),
    retry: (n, err) => !(err instanceof ApiError && err.status === 403) && n < 2,
  })

  useEffect(() => {
    if (data) document.title = `Mon espace · ${data.projectName}`
  }, [data])

  if (isPending) return <LoadingScreen />
  if (error || !data) {
    const invalid = error instanceof ApiError && error.status === 403
    return (
      <PhoneShell>
        <Card className="mt-6 py-10 text-center">
          <h1 className="text-lg font-bold">{invalid ? "Ce lien d'accès n'est pas valide" : 'Espace momentanément indisponible'}</h1>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-ink-soft">
            {invalid
              ? "Utilisez le lien reçu par e-mail après votre paiement."
              : 'Réessayez dans un instant.'}
          </p>
        </Card>
      </PhoneShell>
    )
  }

  return <ClientSpaceView space={data} />
}

function ClientSpaceView({ space }: { space: ClientSpace }) {
  const running = space.status === 'running'

  return (
    <PhoneShell
      footer={
        <>
          Livrée le {formatDateTime(space.deliveredAt)} par {space.devName}.
          <br />
          Gardez ce lien privé : il donne accès à vos identifiants.
        </>
      }
    >
      <div className="animate-rise pt-1">
        <Eyebrow>Mon espace</Eyebrow>
        <h1 className="mt-1.5 text-[26px] leading-tight font-extrabold tracking-tight text-balance">{space.projectName}</h1>
      </div>

      {/* Application */}
      <Card className="animate-rise [animation-delay:60ms]">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Votre application</h2>
          <span
            className={cx(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
              running ? 'bg-brand-soft text-brand-strong' : 'bg-danger-soft text-danger',
            )}
          >
            <span className={cx('size-1.5 rounded-full', running ? 'bg-brand' : 'bg-danger')} />
            {running ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
        <p className="mt-3 font-mono text-[15px] break-all">{hostOf(space.appUrl)}</p>
        <div className="mt-4 flex gap-2">
          <ButtonLink href={space.appUrl} external className="flex-1">
            Ouvrir <ExternalIcon className="size-4" />
          </ButtonLink>
          <CopyButton value={space.appUrl} label="Copier" />
        </div>
        {!running && (
          <div className="mt-4">
            <Notice tone="danger">L’application ne répond pas. L’équipe {BRAND} est prévenue et intervient.</Notice>
          </div>
        )}
      </Card>

      {/* Accès administrateur */}
      {space.admin && <AdminCard admin={space.admin} />}

      {/* Documents */}
      <Card className="animate-rise [animation-delay:180ms]">
        <h2 className="font-semibold">Documents</h2>
        <ul className="mt-3 divide-y divide-line">
          <DocRow
            title="Facture"
            subtitle={space.invoice.number}
            href={space.invoice.url}
          />
          {space.sourceUrl && <DocRow title="Code source" subtitle="Archive .zip du projet" href={space.sourceUrl} />}
        </ul>
      </Card>

      {/* Sauvegarde */}
      <div className="animate-rise flex items-start gap-3 rounded-2xl px-1 text-sm text-ink-soft [animation-delay:240ms]">
        <ShieldIcon className="mt-0.5 size-5 shrink-0 text-brand" />
        <p className="leading-relaxed">
          {space.lastBackupAt
            ? <>Vos données sont sauvegardées chaque nuit, chiffrées. Dernière sauvegarde : {formatDateTime(space.lastBackupAt)}.</>
            : <>La première sauvegarde de vos données est en cours.</>}
        </p>
      </div>
    </PhoneShell>
  )
}

function AdminCard({ admin }: { admin: NonNullable<ClientSpace['admin']> }) {
  const [visible, setVisible] = useState(false)

  return (
    <Card className="animate-rise [animation-delay:120ms]">
      <h2 className="font-semibold">Accès administrateur</h2>
      <p className="mt-1 text-sm text-ink-soft">Pour vous connecter à votre application en tant qu’administrateur.</p>

      <dl className="mt-4 flex flex-col gap-3">
        <div>
          <dt className="text-xs text-ink-mute">Identifiant</dt>
          <dd className="mt-1 flex items-center justify-between gap-2">
            <span className="font-mono text-[15px] break-all">{admin.email}</span>
            <CopyButton value={admin.email} label="Copier" />
          </dd>
        </div>
        <div>
          <dt className="text-xs text-ink-mute">Mot de passe</dt>
          <dd className="mt-1 flex items-center justify-between gap-2">
            <span className="font-mono text-[15px] tracking-wide break-all" aria-live="polite">
              {visible ? admin.password : '•'.repeat(Math.min(admin.password.length, 14))}
            </span>
            <span className="flex shrink-0 gap-1.5">
              <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="grid size-10 place-items-center rounded-lg text-ink-soft ring-1 ring-line hover:text-ink hover:ring-ink-mute"
              >
                {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
              <CopyButton value={admin.password} label="Copier" />
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-4">
        <Notice tone="warn">
          Changez ce mot de passe à votre première connexion. Il n’est affiché qu’ici, jamais envoyé par e-mail.
        </Notice>
      </div>
    </Card>
  )
}

function DocRow({ title, subtitle, href }: { title: string; subtitle: string; href: string }) {
  return (
    <li>
      <a href={href} className="group flex min-h-14 items-center justify-between gap-3 py-2">
        <span>
          <span className="block font-medium">{title}</span>
          <span className="block font-mono text-xs text-ink-mute">{subtitle}</span>
        </span>
        <span className="grid size-10 place-items-center rounded-lg text-ink-soft ring-1 ring-line transition group-hover:text-brand group-hover:ring-brand">
          <DownloadIcon className="size-4" />
        </span>
      </a>
    </li>
  )
}
