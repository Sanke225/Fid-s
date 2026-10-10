'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecette } from '@/lib/context';
import { useToast } from '@/components/Toast';
import { InvoiceModal } from '@/components/InvoiceModal';
import {
  CheckIcon,
  CopyIcon,
  ExternalIcon,
  InvoiceIcon,
  WhatsAppIcon
} from '@/components/Icons';
import { ProjectStatus } from '@/lib/types';

export default function DevProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.id;
  const router = useRouter();
  const { getProjectById, updateProjectStatus } = useRecette();
  const { showToast } = useToast();

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);

  const project = getProjectById(projectId);

  if (!project) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <h2>Projet introuvable</h2>
        <Link href="/dev/projects" className="btn btn-secondary">
          Retour aux projets
        </Link>
      </div>
    );
  }

  const deliveryUrl = typeof window !== 'undefined' ? `${window.location.origin}/client/delivery/${project.publicToken}` : `/client/delivery/${project.publicToken}`;
  const whatsappMsg = encodeURIComponent(
    `Bonjour ${project.client.name}, votre application "${project.name}" est prête ! Vous pouvez l'essayer en toute sécurité sur notre démo Recette : ${deliveryUrl}`
  );
  const whatsappUrl = `https://wa.me/?text=${whatsappMsg}`;

  const STEPS = [
    { key: 'draft', label: '1. Envoi', desc: 'Archive déposée' },
    { key: 'building', label: '2. Installation', desc: 'Build & Conteneur' },
    { key: 'demo_ready', label: '3. Démo en ligne', desc: 'Essai par le client' },
    { key: 'paid', label: '4. Paiement reçu', desc: 'Mobile Money validé' },
    { key: 'delivered', label: '5. Livré', desc: 'Espace client prêt' }
  ];

  function getStepIndex(status: ProjectStatus) {
    if (status === 'draft') return 0;
    if (status === 'building') return 1;
    if (status === 'demo_ready') return 2;
    if (status === 'paid' || status === 'handing_over' || status === 'handover_failed') return 3;
    if (status === 'delivered') return 4;
    return 2;
  }

  const currentStepIdx = getStepIndex(project.status);

  const copyLink = () => {
    navigator.clipboard.writeText(deliveryUrl).then(() => {
      showToast('Lien de livraison copié dans le presse-papier !', 'success');
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(16px, 2.5vw, 32px)', maxWidth: '1380px', margin: '0 auto' }}>
      {/* Barre supérieure */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => router.push('/dev/projects')}
            style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid var(--color-divider)', background: 'var(--card)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
          >
            ←
          </button>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(24px, 2.8vw, 34px)', margin: 0 }}>
                {project.name}
              </h1>
              <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '999px', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', fontWeight: 700 }}>
                {project.status.toUpperCase()}
              </span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Client : {project.client.name} ({project.client.phone || 'Sans téléphone'})
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {project.status === 'delivered' && (
            <button
              onClick={() => setInvoiceModalOpen(true)}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '10px 18px', borderRadius: '999px', fontSize: '14px' }}
            >
              <InvoiceIcon size={16} /> Voir la Facture
            </button>
          )}
          <Link
            href={`/client/delivery/${project.publicToken}`}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '999px',
              background: 'var(--grad)',
              color: '#fff',
              border: 0,
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(255,106,0,.35)',
              textDecoration: 'none'
            }}
          >
            <ExternalIcon size={16} color="#fff" /> Tester la vue client
          </Link>
        </div>
      </div>

      {/* TIMELINE 5 ÉTAPES */}
      <div style={{ padding: 'clamp(16px, 3vw, 24px)', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))', gap: '12px', position: 'relative' }}>
          {STEPS.map((s, idx) => {
            const isDone = idx < currentStepIdx;
            const isCur = idx === currentStepIdx;
            const bg = isDone ? 'var(--success)' : isCur ? 'var(--grad)' : 'var(--color-surface)';
            const color = isDone || isCur ? '#fff' : 'var(--muted)';

            return (
              <div
                key={s.key}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 14px',
                  borderRadius: '18px',
                  background: isCur ? 'var(--color-accent-100)' : 'transparent',
                  border: isCur ? '1px solid var(--color-accent-300)' : '1px solid transparent'
                }}
              >
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: bg,
                    color,
                    display: 'grid',
                    placeItems: 'center',
                    fontWeight: 700,
                    fontSize: '13px',
                    flex: 'none'
                  }}
                >
                  {isDone ? '✓' : idx + 1}
                </span>
                <div>
                  <strong style={{ fontSize: '13px', display: 'block', color: isCur ? 'var(--color-accent-900)' : 'var(--color-text)' }}>
                    {s.label}
                  </strong>
                  <span style={{ fontSize: '11px', color: 'var(--muted)' }}>{s.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* LIEN DE LIVRAISON & ACTIONS DE PARTAGE */}
      <div style={{ padding: 'clamp(18px, 3vw, 24px)', borderRadius: '28px', background: 'var(--grad-soft)', border: '1px solid var(--color-accent-200)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent-800)' }}>
              Lien sécurisé à transmettre au client
            </span>
            <div style={{ fontFamily: 'var(--mono)', fontSize: '15px', color: 'var(--color-text)', marginTop: '4px', wordBreak: 'break-all' }}>
              {deliveryUrl}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={copyLink}
              className="btn btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', borderRadius: '999px', fontSize: '13px' }}
            >
              <CopyIcon size={16} /> Copier le lien
            </button>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '999px',
                background: '#25D366',
                color: '#fff',
                fontSize: '13px',
                textDecoration: 'none'
              }}
            >
              <WhatsAppIcon size={16} /> Envoyer sur WhatsApp
            </a>
          </div>
        </div>

        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
          ✓ Ce lien permet à votre client d’essayer l’application en direct et de débloquer la passation via Wave ou Orange Money.
        </span>
      </div>

      {/* CONSOLE DES LOGS D’INSTALLATION & ARCHITECTURE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
        {/* Terminal logs */}
        <div style={{ padding: 'clamp(18px, 3vw, 24px)', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <strong style={{ fontSize: '16px' }}>Journal d'exécution du conteneur</strong>
          <div
            style={{
              background: '#0B0B0F',
              color: '#A9C4F5',
              padding: '16px',
              borderRadius: '18px',
              fontFamily: 'var(--mono)',
              fontSize: '12px',
              height: '240px',
              overflowY: 'auto',
              overflowX: 'auto',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {(project.logs || []).map((l, idx) => (
              <div key={idx} style={{ opacity: l.stream === 'stderr' ? 1 : 0.85, color: l.stream === 'stderr' ? '#FFAA9F' : '#A9C4F5' }}>
                <span style={{ color: '#6B5D51' }}>[{l.at}]</span> {l.line}
              </div>
            ))}
          </div>
        </div>

        {/* Détails du projet & Manifeste */}
        <div style={{ padding: '24px', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <strong style={{ fontSize: '16px' }}>Spécifications de la livraison</strong>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <span style={{ color: 'var(--muted)' }}>Solde convenu</span>
              <strong>{(project.amountXof || 0).toLocaleString('fr-FR')} FCFA</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <span style={{ color: 'var(--muted)' }}>Code source inclus</span>
              <strong>{project.includeSource ? 'Oui (.zip certifié)' : 'Non (Hébergement seul)'}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <span style={{ color: 'var(--muted)' }}>Stack technique</span>
              <span>{project.stack}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--color-divider)' }}>
              <span style={{ color: 'var(--muted)' }}>Délai de rétractation</span>
              <span>30 jours (reste {project.expiresInDays || 28} jours)</span>
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                updateProjectStatus(project.id, 'cancelled');
                showToast('Livraison annulée et démo purgée', 'info');
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '999px',
                border: '1px solid var(--color-divider)',
                background: 'transparent',
                color: 'var(--danger)',
                cursor: 'pointer',
                fontSize: '13px'
              }}
            >
              Annuler la livraison & Purger
            </button>
          </div>
        </div>
      </div>

      {invoiceModalOpen && (
        <InvoiceModal project={project} onClose={() => setInvoiceModalOpen(false)} />
      )}
    </div>
  );
}
