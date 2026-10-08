'use client';

import React, { useState, use } from 'react';
import { useRecette } from '@/lib/context';
import { useToast } from '@/components/Toast';
import { useConfetti } from '@/components/Confetti';
import { InvoiceModal } from '@/components/InvoiceModal';
import {
  CheckIcon,
  CloseIcon,
  DownloadIcon,
  InvoiceIcon,
  LogoIcon,
  OrangeMoneyIcon,
  WalletIcon,
  WaveIcon
} from '@/components/Icons';

export default function ClientDeliveryPage({ params }: { params: Promise<{ token: string }> }) {
  const resolvedParams = use(params);
  const token = resolvedParams.token;
  const { state, getProjectByToken, simulateHandover } = useRecette();
  const { showToast } = useToast();
  const { launchConfetti } = useConfetti();

  const foundProject = getProjectByToken(token) || state.projects.find(p => p.status === 'demo_ready') || state.projects[0];
  const project = foundProject;

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'wave' | 'orange_money'>('wave');
  const [payerPhone, setPayerPhone] = useState(project?.client?.phone || '+225 05 44 12 89 30');

  const [isHandoverInProgress, setIsHandoverInProgress] = useState(false);
  const [handoverStep, setHandoverStep] = useState(0);
  const [handoverTitle, setHandoverTitle] = useState('');
  const [handoverDetail, setHandoverDetail] = useState('');

  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  const isDelivered = project?.status === 'delivered';
  const amountFmt = (project?.amountXof || 450000).toLocaleString('fr-FR') + ' FCFA';

  const handleStartPayment = () => {
    setIsHandoverInProgress(true);
    setHandoverStep(1);
    setHandoverTitle('Vérification de la confirmation Mobile Money...');
    setHandoverDetail('Signature webhook & unicité validées');

    simulateHandover(
      project.id,
      (step, total, title, detail) => {
        setHandoverStep(step);
        setHandoverTitle(title);
        setHandoverDetail(detail);
      },
      () => {
        setTimeout(() => {
          setIsHandoverInProgress(false);
          setPaymentModalOpen(false);
          launchConfetti();
          showToast('Paiement reçu et application livrée !', 'success');
        }, 1200);
      }
    );
  };

  const copyCreds = () => {
    const text = `E-mail: ${project.adminCredentials?.email}\nMot de passe: ${project.adminCredentials?.password}\nURL: ${project.clientUrl}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('Identifiants copiés dans le presse-papier !', 'success');
    });
  };

  const addCartItem = (price: number) => {
    setCartTotal(prev => prev + price);
    showToast(`Article ajouté au panier (${price.toLocaleString('fr-FR')} FCFA)`, 'success');
  };

  const simulateTicket = () => {
    if (cartTotal === 0) {
      showToast('Ajoutez des articles au panier pour tester la caisse', 'info');
    } else {
      showToast(`Ticket validé pour ${cartTotal.toLocaleString('fr-FR')} FCFA !`, 'success');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* BANDEAU FIXE SUPÉRIEUR : MONTANT & STATUT EN TEMPS RÉEL */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          padding: '12px clamp(12px, 2vw, 24px)',
          background: 'var(--glass-strong)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-soft)'
        }}
      >
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--grad)', display: 'grid', placeItems: 'center', color: '#fff' }}>
              <LogoIcon size={16} color="#fff" />
            </span>
            <div>
              <strong style={{ fontSize: '16px', display: 'block' }}>{project.name}</strong>
              <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                Livré par <strong>Yannick Kouassi</strong>
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '999px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', fontSize: '12px' }}>
              <span style={{ color: 'var(--success)' }}>🔒</span>
              <span>Paiement direct au développeur</span>
            </div>

            {!isDelivered ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>Montant à régler :</span>
                  <strong style={{ fontSize: '18px', color: 'var(--color-accent-800)' }}>{amountFmt}</strong>
                </div>
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="btn btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px 22px',
                    borderRadius: '999px',
                    background: 'var(--grad)',
                    color: '#fff',
                    border: 0,
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 6px 18px rgba(255,106,0,.35)',
                    animation: 'pulse 2.5s infinite'
                  }}
                >
                  <WalletIcon size={16} color="#fff" /> Régler et Débloquer
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ padding: '6px 14px', borderRadius: '999px', background: 'var(--success-100)', color: 'var(--success-800)', fontSize: '13px', fontWeight: 700 }}>
                  ✓ Débloqué et Livré
                </span>
                <button
                  onClick={() => setInvoiceModalOpen(true)}
                  className="btn btn-secondary"
                  style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '13px' }}
                >
                  Facture PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CORPS PRINCIPAL : APPLICATION EN DÉMO / ÉTAT LIVRÉ */}
      <main style={{ flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%', padding: 'clamp(16px, 3vw, 32px)', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {isDelivered ? (
          /* ÉCRAN DE SUCCÈS DÉBLOQUÉ */
          <div style={{ padding: 'clamp(28px, 4vw, 48px)', borderRadius: '32px', background: 'var(--card)', boxShadow: 'var(--shadow-float)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '28px', animation: 'rise .4s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
              <span style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success)', color: '#fff', display: 'grid', placeItems: 'center', flex: 'none', boxShadow: '0 8px 24px rgba(47,138,74,.35)' }}>
                <CheckIcon size={36} color="#fff" />
              </span>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--success)' }}>
                  Passation réussie
                </span>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: 'clamp(28px, 3.5vw, 40px)', margin: '2px 0 0' }}>
                  Votre application est désormais en ligne et à votre nom !
                </h1>
              </div>
            </div>

            {/* Bloc adresse définitive & identifiants générés */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '24px', borderRadius: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Adresse web dédiée
                </span>
                <strong style={{ fontFamily: 'var(--mono)', fontSize: '18px', color: 'var(--color-accent)', wordBreak: 'break-all' }}>
                  {project.clientUrl || 'https://kanaga.app.recette.ci'}
                </strong>
                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Certificat SSL Let's Encrypt actif, sauvegarde nocturne programmée.
                </span>
                <a
                  href={project.clientUrl || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-primary"
                  style={{ marginTop: 'auto', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', borderRadius: '999px', background: 'var(--grad)', color: '#fff', fontSize: '14px', fontWeight: 700 }}
                >
                  Ouvrir mon application →
                </a>
              </div>

              <div style={{ padding: '24px', borderRadius: '24px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted)' }}>
                  Accès administrateur générés
                </span>
                <div style={{ fontSize: '13px', background: 'var(--card)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--color-divider)' }}>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '11px' }}>E-mail admin :</span>
                  <strong style={{ fontFamily: 'var(--mono)' }}>{project.adminCredentials?.email || 'admin@kanaga.ci'}</strong>
                </div>
                <div style={{ fontSize: '13px', background: 'var(--card)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--color-divider)' }}>
                  <span style={{ color: 'var(--muted)', display: 'block', fontSize: '11px' }}>Mot de passe temporaire :</span>
                  <strong style={{ fontFamily: 'var(--mono)', color: 'var(--color-accent)' }}>{project.adminCredentials?.password || 'Pass_KNG8899!'}</strong>
                </div>
                <button onClick={copyCreds} className="btn btn-secondary" style={{ padding: '8px', borderRadius: '999px', fontSize: '13px' }}>
                  Copier les identifiants
                </button>
              </div>
            </div>

            {/* Téléchargements */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', borderTop: '1px solid var(--color-divider)', paddingTop: '20px' }}>
              <button
                onClick={() => setInvoiceModalOpen(true)}
                className="btn btn-secondary"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '999px', fontSize: '14px' }}
              >
                <InvoiceIcon size={16} /> Télécharger la Facture PDF ({project.invoiceNumber || 'RCT-2026-000001'})
              </button>
              {project.includeSource && (
                <button
                  onClick={() => showToast('Téléchargement du code source .zip démarré', 'success')}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '999px', fontSize: '14px' }}
                >
                  <DownloadIcon size={16} /> Télécharger le Code Source (.zip)
                </button>
              )}
            </div>
          </div>
        ) : (
          /* CADRE DE L'APPLICATION EN DÉMO DIRECTE */
          <div style={{ borderRadius: '32px', background: 'var(--card)', boxShadow: 'var(--shadow-float)', border: '1px solid var(--color-divider)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Barre d'adresse du navigateur simulé */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: 'var(--color-surface)', borderBottom: '1px solid var(--color-divider)' }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FF5F56' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27C93F' }} />
              </div>
              <div style={{ flex: 1, background: 'var(--card)', padding: '6px 14px', borderRadius: '999px', border: '1px solid var(--color-divider)', fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--success)' }}>🔒</span>
                <span>https://{project.publicToken}.demo.recette.ci</span>
              </div>
              <span style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '999px', background: 'var(--color-accent-100)', color: 'var(--color-accent-800)', fontWeight: 700 }}>
                Mode Démo Isolé
              </span>
            </div>

            {/* Interface de démonstration interactive */}
            <div style={{ padding: '28px', background: 'var(--color-bg)', minHeight: '480px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '24px', margin: 0 }}>
                    Boutique Kanaga — Caisse Enregistreuse
                  </h2>
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Session active : Caisse n°1 (Magasin Bouaké)</span>
                </div>
                <div style={{ padding: '8px 16px', borderRadius: '999px', background: 'var(--card)', border: '1px solid var(--color-divider)', fontWeight: 700, fontSize: '14px' }}>
                  Panier : {cartTotal.toLocaleString('fr-FR')} FCFA
                </div>
              </div>

              {/* Grille d'articles interactifs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[
                  { icon: '👗', name: 'Robe Wax Étoile', price: 15000 },
                  { icon: '👔', name: 'Chemise Lin Kente', price: 22000 },
                  { icon: '👜', name: 'Sac Cuir Artisanal', price: 8500 },
                  { icon: '🧣', name: 'Foulard Soie Baoulé', price: 4500 }
                ].map(item => (
                  <div
                    key={item.name}
                    style={{
                      padding: '16px',
                      borderRadius: '20px',
                      background: 'var(--card)',
                      border: '1px solid var(--color-divider)',
                      boxShadow: 'var(--shadow-soft)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <span style={{ fontSize: '28px' }}>{item.icon}</span>
                    <strong style={{ fontSize: '15px' }}>{item.name}</strong>
                    <span style={{ fontSize: '14px', color: 'var(--color-accent)', fontWeight: 700 }}>
                      {item.price.toLocaleString('fr-FR')} FCFA
                    </span>
                    <button
                      onClick={() => addCartItem(item.price)}
                      className="btn btn-secondary"
                      style={{ marginTop: '8px', padding: '8px', fontSize: '12px', borderRadius: '999px' }}
                    >
                      + Ajouter au panier
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 'auto', padding: '16px 20px', borderRadius: '18px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  ℹ️ Ceci est une application réelle qui tourne sur une base PostgreSQL dédiée.
                </span>
                <button onClick={simulateTicket} className="btn btn-secondary" style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '12px' }}>
                  Simuler un ticket de caisse
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE PAIEMENT MOBILE MONEY & 8 ÉTAPES DE PASSATION */}
      {paymentModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(10,8,6,.7)', backdropFilter: 'blur(14px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: 'var(--card)', color: 'var(--color-text)', borderRadius: '32px', width: '100%', maxWidth: '520px', boxShadow: 'var(--shadow-float)', border: '1px solid var(--color-divider)', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {!isHandoverInProgress ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '24px', margin: 0 }}>
                    Régler {amountFmt}
                  </h3>
                  <button onClick={() => setPaymentModalOpen(false)} style={{ border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted)' }}>
                    <CloseIcon size={20} />
                  </button>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                  L'argent est versé directement sur le numéro marchand du développeur. Recette déclenche immédiatement l'installation de votre application définitive.
                </p>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    Moyen de paiement Mobile Money
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedProvider('wave')}
                      style={{
                        padding: '14px',
                        borderRadius: '18px',
                        border: `2px solid ${selectedProvider === 'wave' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                        background: selectedProvider === 'wave' ? 'var(--color-accent-100)' : 'var(--card)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <WaveIcon size={24} />
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ fontSize: '14px', display: 'block' }}>Wave</strong>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>Sans frais</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedProvider('orange_money')}
                      style={{
                        padding: '14px',
                        borderRadius: '18px',
                        border: `2px solid ${selectedProvider === 'orange_money' ? 'var(--color-accent)' : 'var(--color-divider)'}`,
                        background: selectedProvider === 'orange_money' ? 'var(--color-accent-100)' : 'var(--card)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      <OrangeMoneyIcon size={24} />
                      <div style={{ textAlign: 'left' }}>
                        <strong style={{ fontSize: '14px', display: 'block' }}>Orange Money</strong>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>CI &amp; UEMOA</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                    Votre numéro de téléphone (+225)
                  </label>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={e => setPayerPhone(e.target.value)}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: '16px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', fontSize: '15px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ padding: '12px', borderRadius: '16px', background: 'var(--grad-soft)', fontSize: '12px', color: 'var(--color-text)' }}>
                  ⚡ <strong>Simulation immédiate :</strong> Cliquez sur confirmer pour simuler le push Mobile Money et voir la passation se dérouler en temps réel.
                </div>

                <button
                  onClick={handleStartPayment}
                  className="btn btn-primary"
                  style={{ padding: '16px', borderRadius: '999px', background: 'var(--grad)', color: '#fff', border: 0, font: 'inherit', fontWeight: 700, fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 24px rgba(255,106,0,.35)' }}
                >
                  Confirmer le paiement de {amountFmt} →
                </button>
              </>
            ) : (
              /* LES 8 ÉTAPES TECHNIQUES DE LA PASSATION */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
                <div style={{ width: '54px', height: '54px', borderRadius: '50%', border: '4px solid var(--color-accent-200)', borderTopColor: 'var(--color-accent)', animation: 'spin 1s linear infinite' }} />

                <div>
                  <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--color-accent)' }}>
                    Passation automatique en cours
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '22px', margin: '4px 0 0' }}>
                    {handoverTitle}
                  </h3>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                  {handoverDetail}
                </p>

                <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'var(--color-neutral-300)', overflow: 'hidden' }}>
                  <div style={{ width: `${(handoverStep / 8) * 100}%`, height: '100%', background: 'var(--grad)', transition: 'width .4s ease' }} />
                </div>

                <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                  Étape {handoverStep} sur 8 · Ne fermez pas cette page
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {invoiceModalOpen && (
        <InvoiceModal project={project} onClose={() => setInvoiceModalOpen(false)} />
      )}
    </div>
  );
}
