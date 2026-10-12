'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ArrowRightIcon } from '@/components/Icons';
import { Field, FormAlert } from '@/components/auth/Field';
import { SpinnerIcon } from '@/components/auth/AuthIcons';
import { Card, DevPage, PageHeader } from '@/components/dev/ui';
import { useToast } from '@/components/Toast';
import { errorMessage } from '@/lib/api/client';
import { useClaimDelivery } from '@/lib/queries/client';

/** Ajouter à son espace une livraison reçue par lien (WhatsApp, e-mail…). */
export default function AddDeliveryPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const claim = useClaimDelivery();
  const [link, setLink] = useState('');
  const [fieldErr, setFieldErr] = useState<string | null>(null);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (link.trim().length < 10) {
      setFieldErr('Collez le lien complet reçu de votre développeur.');
      return;
    }
    claim.mutate(link.trim(), {
      onSuccess: d => {
        showToast('Livraison ajoutée à votre espace', 'success');
        router.push(`/client/deliveries/${d.id}`);
      },
    });
  };

  return (
    <DevPage>
      <PageHeader eyebrow="Vos commandes" title="Ajouter une livraison" />
      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-6">
          <form onSubmit={submit} noValidate className="space-y-4">
            <FormAlert message={claim.error ? errorMessage(claim.error) : null} />
            <Field
              label="Lien de livraison"
              icon={<span aria-hidden className="text-[14px] font-bold">↗</span>}
              placeholder="https://…/l/…"
              autoComplete="off"
              spellCheck={false}
              value={link}
              onChange={e => {
                setLink(e.target.value);
                setFieldErr(null);
              }}
              error={fieldErr ?? undefined}
              required
            />
            <button type="submit" disabled={claim.isPending} className="cta-primary group h-[52px] w-full rounded-2xl text-[15.5px]">
              {claim.isPending ? <SpinnerIcon /> : null} Ajouter à mon espace
              {!claim.isPending ? <ArrowRightIcon size={18} className="transition-transform duration-300 group-hover:translate-x-1" /> : null}
            </button>
          </form>
        </Card>
        <Card className="p-6 text-[14.5px] text-f-muted">
          <h2 className="heading-sans text-[16px] text-f-text">Où trouver ce lien ?</h2>
          <p className="mt-2">Votre développeur vous l’a envoyé par WhatsApp, SMS ou e-mail. Il ressemble à <span className="font-mono">…/l/AbCd…</span>.</p>
          <p className="mt-2">Une fois ajoutée, la livraison reste dans votre espace : démo, paiements, frais et facture au même endroit, depuis n’importe quel appareil.</p>
        </Card>
      </div>
    </DevPage>
  );
}
