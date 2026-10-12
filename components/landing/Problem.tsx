import { Reveal } from '@/components/motion/Reveal';
import { BRAND } from './data';
import { SectionHeading } from './SectionHeading';

const SIDES = [
  {
    tag: 'DEV',
    who: 'Le développeur freelance',
    sub: 'A codé pendant trois semaines',
    quote: '« Je te donne le code et les accès dès que tu as versé le solde. »',
    risk: 'Travailler pour rien si le client disparaît après la démo.',
    x: -48,
  },
  {
    tag: 'CLIENT',
    who: 'Le client donneur d’ordre',
    sub: 'Veut tester avant de payer',
    quote: '« Je paie le solde quand je vois que ça marche pour mon équipe. »',
    risk: 'Payer à l’aveugle et recevoir un zip incomplet ou inutilisable.',
    x: 48,
  },
] as const;

/** Le dilemme en miroir : les deux cartes arrivent des deux côtés. */
export function Problem() {
  return (
    <section aria-labelledby="probleme-titre" className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
      <SectionHeading id="probleme-titre" eyebrow="Le problème" title="L’impasse de la fin de mission">
        Celui qui fait confiance en premier perd : le dev ne touche jamais son solde, ou le client paie
        et ne reçoit jamais son application.
      </SectionHeading>

      <div className="relative mt-16 grid gap-6 md:grid-cols-2">
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 z-10 hidden size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-f-line bg-f-bg font-display text-[15px] shadow-f-float md:grid"
        >
          vs
        </span>
        {SIDES.map((s, i) => (
          <Reveal key={s.tag} x={s.x} y={0} delay={i * 0.12}>
            <article className="h-full rounded-[28px] border border-f-line bg-f-card p-7 shadow-f-soft sm:p-9">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-f-surface text-[11px] font-extrabold tracking-wider text-f-ink-accent">
                  {s.tag}
                </span>
                <div>
                  <h3 className="heading-sans text-[17px]">{s.who}</h3>
                  <p className="text-[13.5px] text-f-muted">{s.sub}</p>
                </div>
              </div>
              <blockquote className="mt-6 font-display text-[21px] leading-snug">{s.quote}</blockquote>
              <p className="mt-6 rounded-2xl bg-[var(--danger-100)] px-4 py-3 text-[14px] text-[var(--danger-800)]">
                <strong>Risque :</strong> {s.risk}
              </p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal className="mx-auto mt-14 max-w-3xl text-center" delay={0.1}>
        <p className="text-[12.5px] font-bold uppercase tracking-[.14em] text-f-ink-accent">La promesse {BRAND}</p>
        <p className="mt-4 font-display text-[clamp(1.4rem,2.8vw,2.1rem)] leading-snug">
          Nous ne gardons jamais l’argent : il va directement sur le compte Mobile Money du développeur.
          Ce que nous gardons jusqu’au paiement, <span className="text-grad">c’est l’application.</span>
        </p>
      </Reveal>
    </section>
  );
}
