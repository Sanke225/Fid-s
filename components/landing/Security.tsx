import { DatabaseIcon, LockIcon, ShieldIcon } from '@/components/Icons';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { SpotlightCard } from '@/components/motion/SpotlightCard';
import { SECURITY } from './data';
import { SectionHeading } from './SectionHeading';

const ICONS = [ShieldIcon, LockIcon, DatabaseIcon];

/** Section sombre quel que soit le thème : grille animée, cartes à halo. */
export function Security() {
  return (
    <section id="securite" aria-labelledby="securite-titre" className="section-ink relative isolate overflow-hidden py-24 lg:py-32">
      <div aria-hidden className="ink-grid absolute inset-0 -z-10" />
      <div aria-hidden className="absolute left-1/2 top-0 -z-10 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,106,0,.28),transparent)] blur-2xl" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading id="securite-titre" eyebrow="Architecture durcie" title="Votre code reste scellé jusqu’au paiement">
          Isolation, chiffrement et sauvegardes : la démo se montre, le code ne sort pas.
        </SectionHeading>

        <Stagger className="mt-16 grid gap-5 md:grid-cols-3" gap={0.12}>
          {SECURITY.map((s, i) => {
            const Icon = ICONS[i];
            return (
              <StaggerItem key={s.title} className="h-full">
                <SpotlightCard className="h-full rounded-[28px] border border-f-line bg-f-card p-7">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[rgba(255,106,0,.14)] text-[#FFB27A]">
                    <Icon size={22} />
                  </span>
                  <h3 className="heading-sans mt-6 text-[18px]">{s.title}</h3>
                  <p className="mt-2 text-[15px] leading-relaxed text-f-muted">{s.text}</p>
                </SpotlightCard>
              </StaggerItem>
            );
          })}
        </Stagger>
      </div>
    </section>
  );
}
