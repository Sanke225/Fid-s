'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecette } from '@/lib/context';
import { useToast } from '@/components/Toast';
import { InvoiceModal } from '@/components/InvoiceModal';
import { DownloadIcon, ExternalIcon, InvoiceIcon } from '@/components/Icons';
import { Project } from '@/lib/types';

export default function ClientDashboardPage() {
  const router = useRouter();
  const { state, switchRole } = useRecette();
  const { showToast } = useToast();

  const [selectedInvoiceProj, setSelectedInvoiceProj] = useState<Project | null>(null);

  const deliveredApps = state.projects.filter(p => p.status === 'delivered');
  const pendingApps = state.projects.filter(p => p.status === 'demo_ready');

  const copyCreds = (app: Project) => {
    const text = `E-mail: ${app.adminCredentials?.email}\nMot de passe: ${app.adminCredentials?.password}\nURL: ${app.clientUrl}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Identifiants copiés dans le presse-papier !', 'success');
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(16px, 2.5vw, 32px)', maxWidth: '1380px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Portail Client
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(28px, 3vw, 38px)', margin: '4px 0 0' }}>
            Bienvenue, {state.currentUser.fullName}
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              switchRole('dev');
              showToast('Passé en mode Développeur', 'success');
              router.push('/dev/dashboard');
            }}
            className="btn btn-secondary"
            style={{ padding: '10px 18px', borderRadius: '999px', fontSize: '13px' }}
          >
            Passer en mode Développeur
          </button>
        </div>
      </div>

      {/* Applications en attente de règlement */}
      {pendingApps.length > 0 && (
        <div style={{ padding: '22px 24px', borderRadius: '26px', background: 'var(--grad-soft)', border: '1px solid var(--color-accent-200)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-accent-800)', textTransform: 'uppercase' }}>
              Action requise
            </span>
            <strong style={{ display: 'block', fontSize: '18px', marginTop: '2px' }}>
              {pendingApps[0].name} est en attente d'essai
            </strong>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              Essayez la démo avant de régler le solde de {(pendingApps[0].amountXof || 0).toLocaleString('fr-FR')} FCFA.
            </span>
          </div>
          <Link
            href={`/client/delivery/${pendingApps[0].publicToken}`}
            className="btn btn-primary"
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              background: 'var(--grad)',
              color: '#fff',
              border: 0,
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 6px 18px rgba(255,106,0,.35)',
              textDecoration: 'none'
            }}
          >
            Essayer & Payer →
          </Link>
        </div>
      )}

      {/* APPLICATIONS LIVRÉES ET HÉBERGÉES */}
      <div>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '24px', margin: '0 0 16px' }}>
          Mes applications en service ({deliveredApps.length})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {deliveredApps.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--color-divider)', color: 'var(--muted)' }}>
              Vous n'avez pas encore d'application livrée. Vos applications apparaîtront ici dès que le paiement Mobile Money sera validé.
            </div>
          ) : (
            deliveredApps.map(app => (
              <div
                key={app.id}
                style={{
                  padding: '24px',
                  borderRadius: '28px',
                  background: 'var(--card)',
                  boxShadow: 'var(--shadow-soft)',
                  border: '1px solid var(--color-divider)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <strong style={{ fontSize: '17px', display: 'block' }}>{app.name}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      Fournisseur : Lagune Digital Studio
                    </span>
                  </div>
                  <span style={{ padding: '4px 10px', borderRadius: '999px', background: 'var(--success-100)', color: 'var(--success-800)', fontSize: '11px', fontWeight: 700 }}>
                    En ligne ✓
                  </span>
                </div>

                <div style={{ padding: '12px 14px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', fontSize: '13px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Adresse web :</span>
                  <a
                    href={app.clientUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontFamily: 'var(--mono)', color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}
                  >
                    {app.clientUrl || 'https://app.recette.ci'} <ExternalIcon size={13} />
                  </a>
                </div>

                {app.adminCredentials && (
                  <div style={{ padding: '12px 14px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>E-mail admin :</span>
                      <strong>{app.adminCredentials.email}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--muted)' }}>Mot de passe :</span>
                      <strong style={{ fontFamily: 'var(--mono)', color: 'var(--color-accent)' }}>
                        {app.adminCredentials.password}
                      </strong>
                    </div>
                    <button
                      onClick={() => copyCreds(app)}
                      className="btn btn-secondary"
                      style={{ marginTop: '6px', padding: '6px', borderRadius: '999px', fontSize: '11px' }}
                    >
                      Copier les accès
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: 'auto', paddingTop: '8px' }}>
                  <button
                    onClick={() => setSelectedInvoiceProj(app)}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '10px', borderRadius: '999px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <InvoiceIcon size={14} /> Facture PDF
                  </button>
                  {app.includeSource && (
                    <button
                      onClick={() => showToast('Téléchargement du code source .zip démarré', 'success')}
                      className="btn btn-secondary"
                      style={{ flex: 1, padding: '10px', borderRadius: '999px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <DownloadIcon size={14} /> Code source
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedInvoiceProj && (
        <InvoiceModal project={selectedInvoiceProj} onClose={() => setSelectedInvoiceProj(null)} />
      )}
    </div>
  );
}
