import { CountUp } from '@/components/motion/CountUp';
import { Stagger, StaggerItem } from '@/components/motion/Stagger';
import { MARQUEE, STATS } from './data';

/** Chiffres clés en compteurs, puis bande défilante des moyens de paiement et garanties. */
export function TrustBar() {
  return (
    <section aria-label="Chiffres clés" className="border-y border-f-line bg-f-surface/70 py-12 backdrop-blur">
      <Stagger className="mx-auto grid max-w-6xl grid-cols-2 gap-y-8 px-4 text-center sm:px-6 md:grid-cols-4">
        {STATS.map((s, i) => (
          <StaggerItem key={s.label}>
            <strong className={`block font-display text-[clamp(1.9rem,3.6vw,2.7rem)] leading-none ${i % 2 ? 'text-f-text' : 'text-f-ink-accent'}`}>
              <CountUp
                to={s.to}
                decimals={'decimals' in s ? s.decimals : 0}
                prefix={'prefix' in s ? s.prefix : ''}
                suffix={'suffix' in s ? s.suffix : ''}
              />
            </strong>
            <span className="mt-2 block text-[13.5px] text-f-muted">{s.label}</span>
          </StaggerItem>
        ))}
      </Stagger>

      <div className="marquee mt-10" aria-label="Moyens de paiement et garanties">
        <ul className="marquee-track gap-3 pr-3">
          {[...MARQUEE, ...MARQUEE].map((m, i) => (
            <li
              key={`${m.label}-${i}`}
              aria-hidden={i >= MARQUEE.length ? true : undefined}
              className={`flex shrink-0 items-center gap-2.5 rounded-full border border-f-line bg-f-card px-5 py-2.5 text-[14px] font-semibold shadow-f-soft ${
                i >= MARQUEE.length ? 'marquee-dup' : ''
              }`}
            >
              <span className="size-2.5 rounded-full" style={{ background: m.dot }} />
              {m.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
