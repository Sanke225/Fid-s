'use client';

import { motion } from 'motion/react';
import { CheckIcon, DatabaseIcon, LockIcon, ServerIcon, UnlockIcon, WaveIcon } from '@/components/Icons';
import { EASE } from '@/components/motion/easing';
import { DOMAIN } from './data';

const pop = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, ease: EASE, delay },
});

/** Illustration de chaque étape du parcours (décorative). */
export function StepVisual({ index }: { index: number }) {
  return (
    <div aria-hidden className="flex size-full flex-col justify-center gap-3 p-6 sm:p-8">
      {index === 0 && (
        <>
          <motion.div {...pop(0)} className="flex items-center gap-3 rounded-2xl border border-f-line bg-f-card p-4">
            <span className="grid size-11 place-items-center rounded-xl bg-f-surface text-[11px] font-extrabold text-f-ink-accent">ZIP</span>
            <div className="flex-1">
              <div className="text-[14px] font-bold">kanaga-caisse.zip</div>
              <div className="text-[12px] text-f-muted">18,4 Mo · Next.js + PostgreSQL</div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-f-surface">
                <motion.div className="h-full origin-left rounded-full bg-[var(--color-accent)]" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 1.4, ease: EASE, delay: 0.2 }} />
              </div>
            </div>
          </motion.div>
          <motion.div {...pop(0.25)} className="flex items-center gap-2 self-start rounded-full bg-[var(--success-100)] px-3 py-1.5 text-[12.5px] font-semibold text-f-success-ink">
            <LockIcon size={13} /> Chiffré en AES-256-GCM
          </motion.div>
          <motion.div {...pop(0.4)} className="rounded-2xl border border-f-line bg-f-card p-4">
            <div className="text-[12px] text-f-muted">Montant de la livraison</div>
            <div className="font-display text-[28px]">450 000 FCFA</div>
          </motion.div>
        </>
      )}

      {index === 1 && (
        <motion.div {...pop(0)} className="overflow-hidden rounded-2xl bg-[#140C07] font-mono text-[12.5px] text-[#F7EFE7] shadow-f-float">
          <div className="flex gap-1.5 border-b border-white/10 px-4 py-3">
            <span className="size-2.5 rounded-full bg-[#FF6F5B]" />
            <span className="size-2.5 rounded-full bg-[#FFB547]" />
            <span className="size-2.5 rounded-full bg-[#2F8A4A]" />
          </div>
          <div className="space-y-2 p-4">
            {[
              ['conteneur', 'isolé, sans privilège'],
              ['réseau', 'privé'],
              ['postgres', 'base dédiée créée'],
              ['santé', 'HTTP 200 en 14 ms'],
            ].map(([k, v], i) => (
              <motion.div key={k} {...pop(0.15 + i * 0.14)} className="flex gap-2">
                <span className="flex items-center gap-1.5 text-[#FFB27A]"><CheckIcon size={13} /> {k}</span>
                <span className="text-white/70">{v}</span>
              </motion.div>
            ))}
            <motion.div {...pop(0.8)} className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5">
              <ServerIcon size={13} /> d-kanaga26.demo.{DOMAIN}
            </motion.div>
          </div>
        </motion.div>
      )}

      {index === 2 && (
        <motion.div {...pop(0)} className="mx-auto w-52 rounded-[30px] bg-[var(--device)] p-2 shadow-f-float">
          <div className="overflow-hidden rounded-[24px] bg-f-bg">
            <div className="bg-f-surface px-3 pb-2 pt-5 text-center">
              <span className="rounded-full bg-[var(--warning-100)] px-2 py-0.5 text-[9.5px] font-bold uppercase text-[var(--warning-800)]">Démo</span>
              <div className="mt-1 text-[12px] font-bold">Boutique Kanaga</div>
            </div>
            <div className="space-y-2 p-3">
              {['Robe Wax Étoile', 'Chemise Lin Kente', 'Sac Bogolan'].map((n, i) => (
                <motion.div key={n} {...pop(0.2 + i * 0.12)} className="rounded-lg border border-f-line bg-f-card px-2.5 py-2 text-[11px] font-semibold">
                  {n}
                </motion.div>
              ))}
              <motion.div
                className="mx-auto mt-1 size-7 rounded-full border-2 border-[var(--color-accent)]"
                animate={{ scale: [1, 0.8, 1], opacity: [0.9, 0.5, 0.9] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {index === 3 && (
        <>
          <div className="flex items-center justify-between gap-3">
            <motion.div {...pop(0)} className="flex-1 rounded-2xl border border-f-line bg-f-card p-4 text-center">
              <div className="text-[12px] text-f-muted">Client</div>
              <div className="mt-1 text-[14px] font-bold">Mariam K.</div>
            </motion.div>
            <div className="relative h-0.5 w-16 overflow-hidden rounded bg-f-line">
              <motion.span className="absolute inset-y-0 w-6 rounded bg-[var(--color-accent)]" animate={{ x: [-24, 64] }} transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut' }} />
            </div>
            <motion.div {...pop(0.15)} className="flex-1 rounded-2xl border border-f-line bg-f-card p-4 text-center">
              <div className="text-[12px] text-f-muted">Développeur</div>
              <div className="mt-1 text-[14px] font-bold">Yannick K.</div>
            </motion.div>
          </div>
          <motion.div {...pop(0.3)} className="flex items-center gap-3 rounded-2xl border border-f-line bg-f-card p-4">
            <WaveIcon size={28} />
            <div className="flex-1">
              <div className="text-[14px] font-bold">450 000 FCFA envoyés</div>
              <div className="text-[12px] text-f-muted">Réf. WV-8F3K-21 saisie par le client</div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.7 }}
            className="cta-primary justify-center rounded-full py-3 text-[14px]"
          >
            <CheckIcon size={15} /> Dépôt confirmé par le dev
          </motion.div>
        </>
      )}

      {index === 4 && (
        <motion.div {...pop(0)} className="overflow-hidden rounded-2xl border border-f-line bg-f-card shadow-f-float">
          <div className="flex items-center gap-2 border-b border-f-line bg-f-surface px-4 py-2.5">
            <span className="flex gap-1">
              <span className="size-2 rounded-full bg-f-line" />
              <span className="size-2 rounded-full bg-f-line" />
              <span className="size-2 rounded-full bg-f-line" />
            </span>
            <span className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-f-card px-3 py-1 text-[11.5px] text-f-muted"><LockIcon size={11} /> kanaga.app.{DOMAIN}</span>
          </div>
          <div className="space-y-2.5 p-5">
            {[
              { icon: <UnlockIcon size={14} />, t: 'Application au nom du client' },
              { icon: <DatabaseIcon size={14} />, t: 'Base PostgreSQL et accès admin' },
              { icon: <LockIcon size={14} />, t: 'Code source et sauvegarde chiffrée' },
            ].map((r, i) => (
              <motion.div key={r.t} {...pop(0.2 + i * 0.14)} className="flex items-center gap-3 rounded-xl bg-f-surface px-3 py-2.5 text-[13px] font-semibold">
                <span className="text-f-ink-accent">{r.icon}</span>
                {r.t}
                <CheckIcon size={14} className="ml-auto text-[var(--success)]" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
