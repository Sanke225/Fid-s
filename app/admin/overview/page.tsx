'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useRecette } from '@/lib/context';
import { useToast } from '@/components/Toast';
import { CheckIcon, OrangeMoneyIcon, RefreshIcon, WaveIcon } from '@/components/Icons';

export default function AdminOverviewPage() {
  const router = useRouter();
  const { state, updateProjectStatus, switchRole } = useRecette();
  const { showToast } = useToast();

  const telem = state.serverTelemetry;
  const projects = state.projects;
  const blockedHandovers = projects.filter(p => p.status === 'handover_failed');

  const handleRestartHandover = (projectId: string) => {
    updateProjectStatus(projectId, 'demo_ready', {
      failureMessage: undefined,
      failureStage: undefined,
      lastActivity: 'Passation débloquée par l’administrateur'
    });
    showToast('Passation réinitialisée et débloquée avec succès', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: 'clamp(16px, 2.5vw, 32px)', maxWidth: '1380px', margin: '0 auto' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '999px', background: 'var(--grad)', color: '#fff' }}>
              Supervision Systalink
            </span>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Serveur Unique de Production (Abidjan)</span>
          </div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(28px, 3vw, 38px)', margin: '6px 0 0' }}>
            Télémétrie & Back-office
          </h1>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => {
              switchRole('dev');
              showToast('Passé en vue Développeur', 'success');
              router.push('/dev/dashboard');
            }}
            className="btn btn-secondary"
            style={{ padding: '10px 18px', borderRadius: '999px', fontSize: '13px' }}
          >
            Passer en vue Développeur
          </button>
        </div>
      </div>

      {/* 4 JAUGES CIRCULAIRES EN TEMPS RÉEL */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        {/* Jauge CPU */}
        <div style={{ padding: '22px', borderRadius: '26px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Charge Processeur (CPU)</span>
          <div style={{ position: 'relative', width: '96px', height: '96px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-divider)" strokeWidth="3.5" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-accent)" strokeWidth="3.5" strokeDasharray={`${telem.cpuPercent}, 100`} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '18px' }}>
              {telem.cpuPercent}%
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>4 cœurs virtuels nominaux</span>
        </div>

        {/* Jauge RAM */}
        <div style={{ padding: '22px', borderRadius: '26px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Mémoire RAM</span>
          <div style={{ position: 'relative', width: '96px', height: '96px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-divider)" strokeWidth="3.5" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--info)" strokeWidth="3.5" strokeDasharray={`${Math.round((telem.ramUsedGb / telem.ramTotalGb) * 100)}, 100`} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '17px' }}>
              {telem.ramUsedGb} / {telem.ramTotalGb}G
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>53 % alloués</span>
        </div>

        {/* Jauge Disque */}
        <div style={{ padding: '22px', borderRadius: '26px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Stockage Disque NVMe</span>
          <div style={{ position: 'relative', width: '96px', height: '96px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-divider)" strokeWidth="3.5" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--warning)" strokeWidth="3.5" strokeDasharray={`${Math.round((telem.diskUsedGb / telem.diskTotalGb) * 100)}, 100`} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '17px' }}>
              {telem.diskUsedGb} / {telem.diskTotalGb}G
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--muted)' }}>42 % utilisé</span>
        </div>

        {/* Jauge Démos Actives */}
        <div style={{ padding: '22px', borderRadius: '26px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)' }}>Conteneurs Démos Actifs</span>
          <div style={{ position: 'relative', width: '96px', height: '96px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-divider)" strokeWidth="3.5" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--color-accent)" strokeWidth="3.5" strokeDasharray={`${Math.round((telem.activeDemos / telem.maxDemos) * 100)}, 100`} />
            </svg>
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: '18px' }}>
              {telem.activeDemos} / {telem.maxDemos}
            </div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: 600 }}>Capacité nominale OK</span>
        </div>
      </div>

      {/* ALERTES PASSATIONS BLOQUÉES */}
      {blockedHandovers.length > 0 && (
        <div style={{ padding: '24px', borderRadius: '28px', background: 'var(--danger-100)', border: '1px solid var(--danger)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ color: 'var(--danger-800)', fontSize: '16px' }}>
              ⚠️ Passation bloquée ({blockedHandovers.length}) — Intervention requise
            </strong>
          </div>

          {blockedHandovers.map(p => (
            <div
              key={p.id}
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 20px',
                borderRadius: '18px',
                background: 'var(--card)',
                border: '1px solid var(--color-divider)'
              }}
            >
              <div>
                <strong style={{ fontSize: '15px', display: 'block' }}>{p.name}</strong>
                <span style={{ fontSize: '12px', color: 'var(--danger-800)' }}>
                  Étape : {p.failureStage} · {p.failureMessage}
                </span>
              </div>
              <button
                onClick={() => handleRestartHandover(p.id)}
                className="btn btn-primary"
                style={{ padding: '8px 18px', borderRadius: '999px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <RefreshIcon size={14} /> Relancer la passation
              </button>
            </div>
          ))}
        </div>
      )}

      {/* AUDIT DES WEBHOOKS EN DIRECT */}
      <div style={{ padding: '24px', borderRadius: '28px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <strong style={{ fontSize: '18px' }}>Journal d'audit des webhooks Mobile Money</strong>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-divider)', color: 'var(--muted)' }}>
                <th style={{ padding: '10px 12px' }}>Horodatage</th>
                <th style={{ padding: '10px 12px' }}>Fournisseur</th>
                <th style={{ padding: '10px 12px' }}>ID Transaction</th>
                <th style={{ padding: '10px 12px' }}>Montant</th>
                <th style={{ padding: '10px 12px' }}>Signature HMAC</th>
                <th style={{ padding: '10px 12px' }}>Détails</th>
              </tr>
            </thead>
            <tbody>
              {state.webhooksAudit.map(w => (
                <tr key={w.id} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                    {new Date(w.receivedAt).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {w.provider === 'wave' ? <WaveIcon size={16} /> : <OrangeMoneyIcon size={16} />}
                      {w.provider === 'wave' ? 'Wave' : 'Orange Money'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                    {w.transactionId}
                  </td>
                  <td style={{ padding: '12px', fontWeight: 600 }}>
                    {w.amountXof.toLocaleString('fr-FR')} FCFA
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '999px', background: 'var(--success-100)', color: 'var(--success-800)', fontSize: '11px', fontWeight: 700 }}>
                      <CheckIcon size={12} /> Valide
                    </span>
                  </td>
                  <td style={{ padding: '12px', color: 'var(--muted)', fontSize: '12px' }}>
                    {w.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
