'use client';

import React from 'react';
import { Project } from '@/lib/types';
import { CloseIcon, DownloadIcon, LogoIcon } from './Icons';

interface InvoiceModalProps {
  project: Project | null;
  onClose: () => void;
}

export function InvoiceModal({ project, onClose }: InvoiceModalProps) {
  if (!project) return null;

  const invoiceNumber = project.invoiceNumber || 'RCT-2026-000042';
  const issueDate = new Date().toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  const amountFormatted = (project.amountXof || 450000).toLocaleString('fr-FR') + ' FCFA';
  const platformFee = Math.round((project.amountXof || 450000) * 0.03).toLocaleString('fr-FR') + ' FCFA';
  const netAmount = Math.round((project.amountXof || 450000) * 0.97).toLocaleString('fr-FR') + ' FCFA';

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(10, 8, 6, 0.65)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--card)',
          color: 'var(--color-text)',
          borderRadius: '28px',
          width: '100%',
          maxWidth: '680px',
          boxShadow: 'var(--shadow-float)',
          border: '1px solid var(--color-divider)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Barre d'actions supérieure */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 24px',
            borderBottom: '1px solid var(--color-divider)',
            background: 'var(--color-surface)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 700,
                letterSpacing: '.05em',
                textTransform: 'uppercase',
                padding: '4px 10px',
                borderRadius: '999px',
                background: 'var(--success-100)',
                color: 'var(--success-800)'
              }}
            >
              Payé · Conforme
            </span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--muted)' }}>
              {invoiceNumber}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={handlePrint}
              className="btn btn-secondary"
              style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <DownloadIcon size={15} /> Imprimer / PDF
            </button>
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: 0,
                background: 'transparent',
                color: 'var(--muted)',
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center'
              }}
            >
              <CloseIcon size={20} />
            </button>
          </div>
        </div>

        {/* Corps du document Facture */}
        <div
          id="invoice-printable"
          style={{ padding: 'clamp(18px, 4vw, 36px) clamp(16px, 4vw, 36px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}
        >
          {/* En-tête officiel */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--grad)',
                    display: 'grid',
                    placeItems: 'center',
                    color: '#fff'
                  }}
                >
                  <LogoIcon size={16} color="#fff" />
                </span>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '24px' }}>Recette</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.4 }}>
                Plateforme tiers de confiance · Opéré par Systalink<br />
                Cocody Riviera 3, Abidjan · République de Côte d'Ivoire<br />
                RCCM : CI-ABJ-2024-B-11928 · contact@recette.ci
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <strong style={{ fontSize: '18px', display: 'block' }}>FACTURE OFFICIELLE</strong>
              <span style={{ fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--color-accent)' }}>
                {invoiceNumber}
              </span>
              <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                Date : {issueDate}
              </span>
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--color-divider)' }} />

          {/* Parties prenantes */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                Développeur & Livrable
              </span>
              <strong style={{ display: 'block', fontSize: '15px', marginTop: '4px' }}>Yannick Kouassi</strong>
              <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block' }}>Lagune Digital Studio</span>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>+225 07 08 45 67 12</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                Client Donneur d'Ordre
              </span>
              <strong style={{ display: 'block', fontSize: '15px', marginTop: '4px' }}>{project.client.name}</strong>
              <span style={{ fontSize: '13px', color: 'var(--muted)', display: 'block' }}>{project.client.email || 'Email non renseigné'}</span>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{project.client.phone || ''}</span>
            </div>
          </div>

          {/* Tableau de la prestation */}
          <div style={{ border: '1px solid var(--color-divider)', borderRadius: '16px', overflow: 'hidden' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 16px',
                background: 'var(--color-surface)',
                fontWeight: 600,
                fontSize: '12px',
                textTransform: 'uppercase',
                color: 'var(--muted)'
              }}
            >
              <span>Désignation du logiciel</span>
              <span style={{ textAlign: 'right' }}>Montant</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', padding: '16px', fontSize: '14px' }}>
              <div style={{ maxWidth: '400px' }}>
                <strong>{project.name}</strong>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>
                  Livraison certifiée avec instance dédiée ({project.clientUrl || `${project.publicToken}.app.recette.ci`})
                  {project.includeSource ? ' + Archive du code source complète' : ''}
                </span>
              </div>
              <div style={{ textAlign: 'right', fontWeight: 700 }}>
                {amountFormatted}
              </div>
            </div>
          </div>

          {/* Synthèse des montants */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', width: '100%', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: 'min(100%, 260px)', color: 'var(--muted)' }}>
              <span>Montant HT / Total :</span>
              <strong>{amountFormatted}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: 'min(100%, 260px)', color: 'var(--muted)' }}>
              <span>Commission tiers (3%) :</span>
              <span>{platformFee}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', width: 'min(100%, 260px)', color: 'var(--success)' }}>
              <span>Net versé au développeur :</span>
              <strong>{netAmount}</strong>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: 'min(100%, 260px)',
                borderTop: '2px solid var(--color-divider)',
                paddingTop: '8px',
                fontSize: '16px'
              }}
            >
              <span>Total Réglé :</span>
              <strong style={{ color: 'var(--color-accent-800)' }}>{amountFormatted}</strong>
            </div>
          </div>

          {/* Bloc de certification légale */}
          <div
            style={{
              padding: '14px 18px',
              borderRadius: '16px',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)',
              fontSize: '12px',
              color: 'var(--muted)',
              lineHeight: 1.5
            }}
          >
            🔒 <strong>Certificat de livraison Recette :</strong> Ce document atteste de la passation de l'application logicielle et de la libération immédiate des fonds vers le développeur conformément à la licence convenue.
          </div>
        </div>
      </div>
    </div>
  );
}
