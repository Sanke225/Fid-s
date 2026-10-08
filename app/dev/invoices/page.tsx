'use client';

import React, { useState } from 'react';
import { useRecette } from '@/lib/context';
import { DownloadIcon, InvoiceIcon } from '@/components/Icons';
import { InvoiceModal } from '@/components/InvoiceModal';
import { Project } from '@/lib/types';

export default function DevInvoicesPage() {
  const { state } = useRecette();
  const deliveredProjects = state.projects.filter(p => p.status === 'delivered');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(16px, 2.5vw, 32px)', maxWidth: '1100px', margin: '0 auto' }}>
      <div>
        <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>
          Comptabilité & Justificatifs
        </span>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '32px', margin: '4px 0 0' }}>
          Factures des livraisons terminées
        </h1>
      </div>

      <div style={{ padding: '24px', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {deliveredProjects.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>
            Aucune facture émise pour l'instant. Les factures sont générées automatiquement lors de la passation post-paiement.
          </div>
        ) : (
          deliveredProjects.map(p => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                padding: '16px 20px',
                borderRadius: '20px',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-divider)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'var(--grad)',
                    color: '#fff',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  <InvoiceIcon size={18} color="#fff" />
                </span>
                <div>
                  <strong style={{ fontSize: '15px', display: 'block' }}>{p.name}</strong>
                  <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    Client : {p.client.name} · Numéro : <strong style={{ fontFamily: 'var(--mono)' }}>{p.invoiceNumber || 'RCT-2026-000001'}</strong>
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <strong style={{ fontSize: '17px', color: 'var(--color-accent-800)' }}>
                  {(p.amountXof || 0).toLocaleString('fr-FR')} FCFA
                </strong>
                <button
                  onClick={() => setSelectedProject(p)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <DownloadIcon size={14} /> Aperçu / Imprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedProject && (
        <InvoiceModal project={selectedProject} onClose={() => setSelectedProject(null)} />
      )}
    </div>
  );
}
