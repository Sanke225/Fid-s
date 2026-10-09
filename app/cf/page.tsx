'use client';

import React from 'react';
import Link from 'next/link';
import { useRecette } from '@/lib/context';
import { ArrowLeftIcon, LogoIcon, MoonIcon, OrangeMoneyIcon, ShieldIcon, SunIcon, WaveIcon } from '@/components/Icons';

export default function CfPage() {
  const { state, setTheme } = useRecette();
  const isDark = state.theme === 'dark';

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        transition: 'background .3s, color .3s',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header épuré */}
      <header
        style={{
          borderBottom: '1px solid var(--color-divider)',
          background: 'var(--glass-strong)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          position: 'sticky',
          top: 0,
          zIndex: 30
        }}
      >
        <div
          style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link
              href="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                textDecoration: 'none',
                color: 'var(--color-text)'
              }}
            >
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'var(--grad)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  boxShadow: '0 2px 8px rgba(255,106,0,.3)'
                }}
              >
                <LogoIcon size={16} color="#fff" />
              </span>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '20px' }}>Recette</span>
            </Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Link
              href="/cgu"
              className="hidden sm:inline-block"
              style={{
                fontSize: '13px',
                color: 'var(--muted)',
                textDecoration: 'none',
                padding: '6px 12px',
                borderRadius: '999px',
                transition: 'background .2s'
              }}
            >
              ← CGU
            </Link>

            <Link
              href="/"
              style={{
                fontSize: '14px',
                color: 'var(--muted)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '999px',
                border: '1px solid var(--color-divider)',
                background: 'var(--card)'
              }}
            >
              <ArrowLeftIcon size={14} />
              <span>Accueil</span>
            </Link>

            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Changer de thème"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid var(--color-divider)',
                background: 'var(--card)',
                color: 'var(--color-text)',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer'
              }}
            >
              {isDark ? <SunIcon size={16} /> : <MoonIcon size={16} />}
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 20px 80px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Titre et métadonnées */}
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'var(--success-100)',
              color: 'var(--success-800)',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '14px'
            }}
          >
            <ShieldIcon size={14} color="var(--success-800)" />
            <span>Séquestre & Transactions Financières</span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 400,
              fontSize: 'clamp(32px, 4.5vw, 48px)',
              lineHeight: 1.1,
              margin: '0 0 12px'
            }}
          >
            Conditions Financières (CF)
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', margin: 0 }}>
            Protocole de séquestre des paiements · Mobile Money & Cartes bancaires · Version 2026.1
          </p>
        </div>

        {/* Tableau récapitulatif des moyens de versement */}
        <div
          style={{
            padding: '24px',
            borderRadius: '24px',
            background: 'var(--card)',
            border: '1px solid var(--color-divider)',
            boxShadow: 'var(--shadow-soft)',
            marginBottom: '40px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#E6F4FE', display: 'grid', placeItems: 'center' }}>
              <WaveIcon size={24} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>Wave CI / SN</strong>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Instantané · 0% commission dev</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: '#FFF0E6', display: 'grid', placeItems: 'center' }}>
              <OrangeMoneyIcon size={24} />
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>Orange Money</strong>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Validation SMS OTP sécurisée</span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'var(--color-surface)', display: 'grid', placeItems: 'center', fontSize: '20px' }}>
              💳
            </div>
            <div>
              <strong style={{ display: 'block', fontSize: '15px' }}>Cartes VISA / MC</strong>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>International · 3D Secure</span>
            </div>
          </div>
        </div>

        {/* Articles des CF */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', lineHeight: 1.7, fontSize: '15px' }}>
          
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 1 · Mécanisme du Séquestre Garanti
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              Le séquestre Recette garantit la neutralité et la sécurité des transactions entre développeurs et clients. 
              Lorsque le client valide la commande d'une application ou souhaite débloquer le code source définitif, les fonds sont consignés sur un compte de cantonnement sous contrôle de l'établissement financier partenaire de Systalink.
            </p>
            <p style={{ margin: 0 }}>
              Pendant toute la durée de la mise sous séquestre, ni le client ni le développeur ne peuvent retirer unilatéralement les fonds sans que la condition technique de passation ou de résiliation légale ne soit remplie.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 2 · Modèle Tarifaire & 0 % Commission Développeur
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              Afin de soutenir l'écosystème numérique africain et les créateurs indépendants, <strong>Recette n'applique aucune commission retenue sur le montant net perçu par le développeur</strong> pour les projets standards.
            </p>
            <div style={{ padding: '16px 20px', borderRadius: '18px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', margin: '12px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Montant convenu du projet (ex. 500 000 FCFA) :</span>
                <strong>100 % versé au développeur</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--muted)', fontSize: '13px' }}>
                <span>Frais d'hébergement conteneur & passation :</span>
                <span>Inclus ou pris en charge par le client</span>
              </div>
            </div>
            <p style={{ margin: 0 }}>
              Les frais techniques éventuels d'opérateurs télécoms tiers (frais de retrait Mobile Money standard de 1% selon l'opérateur) demeurent à la charge du bénéficiaire selon la tarification en vigueur de son opérateur.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 3 · Validation et Déblocage Instantané
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              Le déblocage des fonds au profit du compte Mobile Money du développeur est déclenché immédiatement dès survenance de l'un des deux événements suivants :
            </p>
            <ol style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li><strong>Validation explicite :</strong> Le client clique sur « Valider et payer » et confirme son paiement Mobile Money.</li>
              <li><strong>Passation automatique :</strong> Les accès au code source, l'archive ZIP certifiée et les clés API sont transférés instantanément au client, et le montant net est crédité sur le solde du développeur.</li>
            </ol>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 4 · Délais d’Essai et Recette Fonctionnelle
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              Le client bénéficie d’une période de recette de <strong>72 heures</strong> (extensible à 7 jours sur accord préalable entre les parties) pour tester l’application sur l'URL de démonstration isolée.
            </p>
            <p style={{ margin: 0 }}>
              Si aucune réclamation documentée n'est soumise durant ce délai et que le client n'a pas manifesté d'opposition motivée, la passation peut être clôturée selon les stipulations du contrat de mission.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 5 · Remboursements et Déconsignation
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              Un remboursement au client peut intervenir exclusivement dans les cas suivants :
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Le développeur ne fournit pas le livrable dans les délais impartis et annule le projet.</li>
              <li>L'application testée s'avère non fonctionnelle ou en totale contradiction avec le cahier des charges, constatée par l'arbitrage technique de Recette Ops.</li>
              <li>Accord amiable mutuel écrit entre le développeur et le client transmis au support.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 6 · Factures & Justificatifs Comptables
            </h2>
            <p style={{ margin: 0 }}>
              Chaque transaction effectuée sur Recette génère automatiquement un reçu électronique horodaté et une facture conforme (téléchargeable au format PDF dans l'espace Développeur et l'espace Client), portant mention du numéro de séquestre unique et des identifiants fiscaux.
            </p>
          </section>

        </div>

        {/* Bloc d'action vers Inscription / Connexion */}
        <div
          style={{
            marginTop: '60px',
            padding: '28px',
            borderRadius: '28px',
            background: 'var(--grad-soft)',
            border: '1px solid var(--color-divider)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>Prêt à sécuriser vos prochains projets ?</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
              Rejoignez des centaines de freelances et d'entreprises qui livrent en toute sérénité.
            </p>
          </div>
          <Link
            href="/auth"
            style={{
              padding: '12px 24px',
              borderRadius: '999px',
              background: 'var(--grad)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(255,106,0,.3)'
            }}
          >
            Créer un compte →
          </Link>
        </div>

      </main>

      {/* Footer minimaliste */}
      <footer
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--color-divider)',
          padding: '24px 20px',
          textAlign: 'center',
          fontSize: '13px',
          color: 'var(--muted)'
        }}
      >
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div>© 2026 Recette · Systalink Cloud & Séquestre</div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Accueil</Link>
            <Link href="/cgu" style={{ color: 'inherit', textDecoration: 'none' }}>CGU</Link>
            <Link href="/cf" style={{ color: 'var(--color-accent-700)', textDecoration: 'none', fontWeight: 600 }}>CF</Link>
            <Link href="/auth" style={{ color: 'inherit', textDecoration: 'none' }}>Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
