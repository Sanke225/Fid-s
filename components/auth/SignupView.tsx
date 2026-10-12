'use client';

import { AnimatePresence, motion } from 'motion/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, LockIcon } from '@/components/Icons';
import { EASE } from '@/components/motion/easing';
import type { User as ApiUser } from '@/lib/contracts';
import { authClient } from '@/lib/auth-client';
import { AuthShell, OrDivider, type AuthAside } from './AuthShell';
import { BriefcaseIcon, BuildingIcon, CodeIcon, MailIcon, PhoneIcon, SpinnerIcon, UserRoundIcon } from './AuthIcons';
import {
  authErrorMessage,
  chooseRole,
  failureMessage,
  homeFor,
  normalizePhone,
  passwordScore,
  updateMe,
  type AccountRole,
} from './authApi';
import { Field, FormAlert } from './Field';
import { SocialButtons, type SocialProvider } from './SocialButtons';
import { NetworkScene, type SignupStep } from './NetworkScene';
import { useSyncMockUser } from './useSyncMockUser';

const ROLES: { value: AccountRole; title: string; text: string; icon: ReactNode }[] = [
  {
    value: 'dev',
    title: 'Je suis développeur',
    text: 'Je livre une application et je veux être payé à la livraison.',
    icon: <CodeIcon size={24} />,
  },
  {
    value: 'client',
    title: 'Je suis client',
    text: 'Je commande un logiciel et je veux le tester avant de payer.',
    icon: <BuildingIcon size={24} />,
  },
];

function asideFor(step: SignupStep, role: AccountRole | null): AuthAside {
  if (step === 'done')
    return { id: 'done', eyebrow: 'Compte créé', title: 'Le pacte est scellé.', text: 'Votre espace est prêt. Le code, la démo et le paiement circulent désormais en confiance.' };
  if (step === 'infos')
    return role === 'client'
      ? { id: 'infos-client', eyebrow: 'Étape 2 sur 2', title: 'Testez avant de payer.', text: 'Vous essayez l’application sur une vraie démo. Vous ne payez le développeur que si elle vous convient.' }
      : { id: 'infos-dev', eyebrow: 'Étape 2 sur 2', title: 'Votre code, livré en confiance.', text: 'Votre client teste une démo hébergée ; le code ne lui revient qu’une fois votre dépôt confirmé.' };
  return { id: 'role', eyebrow: 'Étape 1 sur 2', title: 'Deux rôles, un seul pacte.', text: 'Le développeur livre, le client paie, Fid’s garantit l’échange. De quel côté êtes-vous ?' };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const STRENGTH = ['', 'Trop court', 'Moyen', 'Bon', 'Excellent'];
const STRENGTH_COLOR = ['', 'var(--danger)', 'var(--warning)', '#7FB04A', 'var(--success)'];

type Errors = Partial<Record<'name' | 'email' | 'phone' | 'password' | 'terms', string>>;

interface SignupViewProps {
  providers: SocialProvider[];
  /** Compte déjà connecté (retour Google) à qui il ne manque que le rôle. */
  pendingUser?: { name: string } | null;
}

export function SignupView({ providers, pendingUser }: SignupViewProps) {
  const router = useRouter();
  const syncMock = useSyncMockUser();
  const resume = Boolean(pendingUser);

  const [step, setStep] = useState<SignupStep>('role');
  const [dir, setDir] = useState(1);
  const [role, setRole] = useState<AccountRole | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [account, setAccount] = useState<ApiUser | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [business, setBusiness] = useState('');
  const [password, setPassword] = useState('');
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const go = (next: SignupStep, d: number) => {
    setDir(d);
    setFormError(null);
    setStep(next);
  };

  const finish = (user: ApiUser) => {
    syncMock(user);
    setAccount(user);
    go('done', 1);
  };

  const continueFromRole = async () => {
    if (!role) {
      setFormError('Choisissez le type de compte qui vous correspond.');
      return;
    }
    if (!resume) return go('infos', 1);
    // Retour Google : le compte existe, il ne manque que le rôle.
    setBusy(true);
    try {
      finish(await chooseRole(role));
    } catch (e) {
      setFormError(failureMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!role) return go('role', -1);
    const normalized = normalizePhone(phone);
    const errs: Errors = {};
    if (name.trim().length < 2) errs.name = 'Indiquez votre nom complet.';
    if (!EMAIL_RE.test(email.trim())) errs.email = 'Saisissez une adresse e-mail valide.';
    if (!normalized) errs.phone = 'Numéro attendu au format 07 00 00 00 00 ou +225…';
    if (password.length < 8) errs.password = 'Au moins 8 caractères.';
    if (!terms) errs.terms = 'Acceptez les conditions pour continuer.';
    setErrors(errs);
    setFormError(null);
    if (Object.keys(errs).length) return;

    setBusy(true);
    const { error } = await authClient.signUp.email({ name: name.trim(), email: email.trim(), password });
    if (error) {
      setBusy(false);
      if (error.code === 'USER_ALREADY_EXISTS' || error.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL') {
        setErrors({ email: 'Un compte existe déjà avec cette adresse. Connectez-vous plutôt.' });
      } else {
        setFormError(authErrorMessage(error));
      }
      return;
    }

    // Le compte existe désormais : un échec ici ne doit pas bloquer l'accès.
    try {
      // Case cochée (vérifiée plus haut) : l’acceptation des CGU est enregistrée avec la date et la version.
      await chooseRole(role, terms);
      finish(await updateMe({ phone: normalized ?? undefined, businessName: business.trim() || undefined }));
    } catch (err) {
      setNotice(`Votre compte est créé, mais une information n’a pas pu être enregistrée (${failureMessage(err)}). Vous pourrez la compléter dans votre profil.`);
      finish({ id: '', name: name.trim(), email: email.trim(), image: null, role, phone: null, businessName: null, username: null, mustChangePassword: false, emailVerified: false });
    } finally {
      setBusy(false);
    }
  };

  const score = passwordScore(password);
  const stepIndex = step === 'role' ? 0 : step === 'infos' ? 1 : 2;

  return (
    <AuthShell scene={<NetworkScene step={step} role={role} busy={busy} />} aside={asideFor(step, role)}>
      {step !== 'done' ? <Progress index={resume ? 0 : stepIndex} total={resume ? 1 : 2} /> : null}

      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          variants={{
            enter: (d: number) => ({ opacity: 0, x: d * 36 }),
            center: { opacity: 1, x: 0 },
            exit: (d: number) => ({ opacity: 0, x: d * -36 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.45, ease: EASE }}
        >
          {step === 'role' && (
            <>
              <h1 className="font-display text-[30px] leading-tight">
                {resume ? `Bienvenue, ${firstName(pendingUser?.name)}` : 'Créer un compte'}
              </h1>
              <p className="mt-1.5 text-[14.5px] text-f-muted">
                {resume ? 'Dernière étape : quel type de compte vous faut-il ?' : 'Choisissez votre profil pour commencer.'}
              </p>

              <fieldset className="mt-7">
                <legend className="sr-only">Type de compte</legend>
                <div className="grid gap-3">
                  {ROLES.map(r => (
                    <RoleCard key={r.value} {...r} checked={role === r.value} onSelect={() => { setRole(r.value); setFormError(null); }} />
                  ))}
                </div>
              </fieldset>

              <div className="mt-5">
                <FormAlert message={formError} />
              </div>

              <button type="button" onClick={continueFromRole} disabled={busy} className="cta-primary group mt-5 h-[54px] w-full rounded-2xl text-[16px]">
                {busy ? <SpinnerIcon /> : null}
                {resume ? 'Terminer' : 'Continuer'}
                {!busy ? <ArrowRightIcon size={18} className="transition-transform duration-300 group-hover:translate-x-1" /> : null}
              </button>

              {!resume ? (
                <p className="mt-6 text-center text-[14.5px] text-f-muted">
                  Déjà inscrit ?{' '}
                  <Link href="/connexion" transitionTypes={['nav-back']} className="font-semibold text-f-ink-accent underline-offset-4 hover:underline">
                    Se connecter
                  </Link>
                </p>
              ) : null}
            </>
          )}

          {step === 'infos' && (
            <>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => go('role', -1)}
                  aria-label="Revenir au choix du profil"
                  className="grid size-10 shrink-0 place-items-center rounded-full border border-f-line bg-f-card transition-colors hover:bg-f-surface"
                >
                  <ArrowLeftIcon size={17} />
                </button>
                <div>
                  <h1 className="font-display text-[26px] leading-tight">Vos informations</h1>
                  <p className="flex items-center gap-1.5 text-[13.5px] text-f-muted">
                    {role === 'dev' ? <CodeIcon size={14} /> : <BuildingIcon size={14} />}
                    Compte {role === 'dev' ? 'développeur' : 'client'}
                  </p>
                </div>
              </div>

              {providers.length ? (
                <>
                  <div className="mt-6">
                    <SocialButtons providers={providers} verb="S’inscrire avec" callbackURL={`/auth/suite?role=${role}`} onError={setFormError} disabled={busy} />
                  </div>
                  <OrDivider />
                </>
              ) : (
                <div className="h-6" />
              )}

              <form onSubmit={submit} noValidate className="space-y-4">
                <FormAlert message={formError} />
                <Field label="Nom complet" icon={<UserRoundIcon size={18} />} name="name" autoComplete="name" placeholder="Awa Koné" value={name} onChange={e => setName(e.target.value)} error={errors.name} disabled={busy} required />
                <Field label="Adresse e-mail" icon={<MailIcon size={18} />} type="email" name="email" autoComplete="email" inputMode="email" placeholder="vous@exemple.ci" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} disabled={busy} required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Téléphone" icon={<PhoneIcon size={18} />} type="tel" name="phone" autoComplete="tel" inputMode="tel" placeholder="07 00 00 00 00" value={phone} onChange={e => setPhone(e.target.value)} error={errors.phone} disabled={busy} required />
                  <Field
                    label={role === 'dev' ? 'Studio' : 'Entreprise'}
                    optional
                    icon={role === 'dev' ? <BriefcaseIcon size={18} /> : <BuildingIcon size={18} />}
                    name="organization"
                    autoComplete="organization"
                    placeholder={role === 'dev' ? 'Nom commercial' : 'Raison sociale'}
                    value={business}
                    onChange={e => setBusiness(e.target.value)}
                    disabled={busy}
                  />
                </div>
                <Field
                  label="Mot de passe"
                  icon={<LockIcon size={18} />}
                  type="password"
                  name="new-password"
                  autoComplete="new-password"
                  placeholder="8 caractères minimum"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  error={errors.password}
                  disabled={busy}
                  required
                  hint={<StrengthMeter score={score} />}
                />

                <TermsCheckbox checked={terms} onChange={setTerms} error={errors.terms} />

                <button type="submit" disabled={busy} className="cta-primary group h-[54px] w-full rounded-2xl text-[16px] disabled:cursor-wait">
                  {busy ? (
                    <>
                      <SpinnerIcon /> Création du compte…
                    </>
                  ) : (
                    <>
                      Créer mon compte
                      <ArrowRightIcon size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                    </>
                  )}
                </button>
              </form>
            </>
          )}

          {step === 'done' && account && (
            <div className="py-2 text-center">
              <SuccessMark />
              <h1 className="mt-6 font-display text-[30px] leading-tight">Bienvenue, {firstName(account.name)}</h1>
              <p className="mt-2 text-[15px] text-f-muted">Votre compte {account.role === 'client' ? 'client' : 'développeur'} est prêt.</p>
              {notice ? <p className="mt-4 rounded-2xl bg-[var(--warning-100)] px-4 py-3 text-left text-[13.5px] text-[var(--warning-800)]">{notice}</p> : null}
              <button type="button" onClick={() => router.push(homeFor(account.role))} className="cta-primary group mt-7 h-[54px] w-full rounded-2xl text-[16px]">
                Accéder à mon espace
                <ArrowRightIcon size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </AuthShell>
  );
}

function firstName(name?: string | null) {
  return (name ?? '').trim().split(/\s+/)[0] || '';
}

function Progress({ index, total }: { index: number; total: number }) {
  return (
    <div className="mb-7" aria-label={`Étape ${index + 1} sur ${total}`} role="group">
      <div className="flex gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-f-line">
            <motion.div
              className="h-full origin-left rounded-full bg-[linear-gradient(90deg,#C84A00,#FF9A3D)]"
              initial={false}
              animate={{ scaleX: i <= index ? 1 : 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function RoleCard({ value, title, text, icon, checked, onSelect }: (typeof ROLES)[number] & { checked: boolean; onSelect: () => void }) {
  return (
    <label
      className={`relative flex cursor-pointer items-start gap-4 rounded-[22px] border p-4 transition-[border-color,background-color,box-shadow,transform] duration-300 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[var(--color-accent)] ${
        checked
          ? 'border-[var(--color-accent)] bg-f-card shadow-[0_12px_32px_-12px_rgba(255,106,0,.45)]'
          : 'border-f-line bg-f-card/60 hover:-translate-y-0.5 hover:border-[var(--color-accent-300)]'
      }`}
    >
      <input type="radio" name="role" value={value} checked={checked} onChange={onSelect} className="sr-only" />
      <span
        className={`grid size-12 shrink-0 place-items-center rounded-2xl transition-colors duration-300 ${
          checked ? 'bg-[linear-gradient(120deg,#A63E00,#FF6A00)] text-white' : 'bg-f-surface text-f-ink-accent'
        }`}
      >
        {icon}
      </span>
      <span className="flex-1 pt-0.5">
        <span className="block text-[16px] font-bold">{title}</span>
        <span className="mt-0.5 block text-[13.5px] leading-snug text-f-muted">{text}</span>
      </span>
      <span
        className={`grid size-6 shrink-0 place-items-center rounded-full border-2 transition-colors duration-300 ${
          checked ? 'border-transparent bg-[#C84A00] text-white' : 'border-f-line'
        }`}
      >
        <AnimatePresence>
          {checked ? (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 20 }}>
              <CheckIcon size={13} />
            </motion.span>
          ) : null}
        </AnimatePresence>
      </span>
    </label>
  );
}

function StrengthMeter({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3" aria-live="polite">
      <div className="flex flex-1 gap-1.5">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-f-line">
            <motion.div
              className="h-full origin-left rounded-full transition-colors duration-300"
              style={{ backgroundColor: STRENGTH_COLOR[score] || undefined }}
              initial={false}
              animate={{ scaleX: score >= i ? 1 : 0 }}
              transition={{ duration: 0.35, ease: EASE }}
            />
          </div>
        ))}
      </div>
      <span className="w-16 text-right text-[12px] font-semibold text-f-muted">{STRENGTH[score]}</span>
    </div>
  );
}

function TermsCheckbox({ checked, onChange, error }: { checked: boolean; onChange: (v: boolean) => void; error?: string }) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 text-[13.5px] leading-snug text-f-muted">
        <input
          type="checkbox"
          checked={checked}
          onChange={e => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden
          className={`mt-px grid size-5 shrink-0 place-items-center rounded-md border-2 transition-colors peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--color-accent)] ${
            checked ? 'border-transparent bg-[#C84A00] text-white' : error ? 'border-[var(--danger)]' : 'border-f-line bg-f-card'
          }`}
        >
          {checked ? <CheckIcon size={12} /> : null}
        </span>
        <span>
          J’accepte les{' '}
          <Link href="/cgu" className="font-semibold text-f-ink-accent underline underline-offset-2">conditions d’utilisation</Link>{' '}
          et les{' '}
          <Link href="/cf" className="font-semibold text-f-ink-accent underline underline-offset-2">conditions financières</Link>, et j’ai lu la{' '}
          <Link href="/confidentialite" className="font-semibold text-f-ink-accent underline underline-offset-2">politique de confidentialité</Link>.
        </span>
      </label>
      {error ? <p className="mt-1.5 pl-8 text-[13px] font-medium text-[var(--danger-800)]">{error}</p> : null}
    </div>
  );
}

function SuccessMark() {
  return (
    <div className="relative mx-auto grid size-24 place-items-center">
      <motion.span
        className="absolute inset-0 rounded-full bg-[var(--success-100)]"
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: [0.3, 1.15, 1], opacity: 1 }}
        transition={{ duration: 0.8, ease: EASE }}
      />
      <svg viewBox="0 0 52 52" className="relative size-20" aria-hidden>
        <motion.circle cx="26" cy="26" r="23" fill="none" stroke="var(--success)" strokeWidth="3" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: EASE }} />
        <motion.path d="M15 27l7 7 15-16" fill="none" stroke="var(--success)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, ease: EASE, delay: 0.5 }} />
      </svg>
    </div>
  );
}
