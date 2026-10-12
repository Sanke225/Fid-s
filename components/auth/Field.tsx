'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useId, useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { EyeIcon, EyeOffIcon } from '@/components/Icons';
import { AlertIcon } from './AuthIcons';

interface FieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string;
  icon: ReactNode;
  error?: string;
  hint?: ReactNode;
  optional?: boolean;
}

/** Champ avec icône, libellé visible, erreur annoncée et bascule d'affichage pour les mots de passe. */
export function Field({ label, icon, error, hint, optional, type = 'text', className, ...input }: FieldProps) {
  const id = useId();
  const [reveal, setReveal] = useState(false);
  const isPassword = type === 'password';
  const describedBy = [error ? `${id}-err` : null, hint ? `${id}-hint` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-[13.5px] font-semibold">
        {label}
        {optional ? <span className="text-[12px] font-normal text-f-muted">Facultatif</span> : null}
      </label>
      <div
        className={`group relative flex items-center rounded-2xl border bg-f-card transition-[border-color,box-shadow] duration-300 focus-within:shadow-[0_0_0_4px_color-mix(in_srgb,var(--color-accent)_18%,transparent)] ${
          error ? 'border-[var(--danger)]' : 'border-f-line focus-within:border-[var(--color-accent)]'
        }`}
      >
        <span className={`pointer-events-none pl-4 transition-colors duration-300 ${error ? 'text-[var(--danger)]' : 'text-f-muted group-focus-within:text-f-ink-accent'}`}>
          {icon}
        </span>
        <input
          id={id}
          type={isPassword && reveal ? 'text' : type}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className="h-[52px] w-full min-w-0 bg-transparent px-3 text-[15.5px] text-f-text outline-none placeholder:text-f-muted/70"
          {...input}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setReveal(r => !r)}
            aria-label={reveal ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            aria-pressed={reveal}
            className="mr-2 grid size-9 shrink-0 place-items-center rounded-full text-f-muted transition-colors hover:bg-f-surface hover:text-f-text"
          >
            {reveal ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        ) : null}
      </div>
      {hint ? <div id={`${id}-hint`} className="mt-1.5">{hint}</div> : null}
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            id={`${id}-err`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-1.5 overflow-hidden pt-1.5 text-[13px] font-medium text-[var(--danger-800)]"
          >
            <AlertIcon size={14} /> {error}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/** Bandeau d'erreur de formulaire, lu par les lecteurs d'écran. */
export function FormAlert({ message }: { message: string | null }) {
  return (
    <div aria-live="assertive">
      <AnimatePresence initial={false}>
        {message ? (
          <motion.div
            role="alert"
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-start gap-2.5 rounded-2xl bg-[var(--danger-100)] px-4 py-3 text-[14px] text-[var(--danger-800)]">
              <AlertIcon size={18} className="mt-px shrink-0" />
              {message}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
