'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';
import { BrandLogo } from '@/components/Brand';
import { ArrowLeftIcon, MoonIcon, ShieldIcon, SunIcon } from '@/components/Icons';
import { PROVIDERS, PROVIDER_NAME, ProviderLogo } from '@/components/payments/ProviderLogo';

const H2: React.CSSProperties = { fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' };
const P: React.CSSProperties = { margin: '0 0 12px' };
const P0: React.CSSProperties = { margin: 0 };
const LIST: React.CSSProperties = { margin: 0, paddingLeft: '22px', display: 'flex', flexDirection: 'column', gap: '6px' };
// Tailwind remet les listes à zéro : numéros et puces rétablis explicitement.
const OL: React.CSSProperties = { ...LIST, listStyle: 'decimal' };
const UL: React.CSSProperties = { ...LIST, listStyle: 'disc' };

/** Moyens de paiement prévus (docs/decisions.md). */
const PROVIDERS_CF = PROVIDERS.map(p => ({ name: PROVIDER_NAME[p], icon: <ProviderLogo provider={p} size={44} className="rounded-xl" /> }));

export default function CfPage() {
  const { isDark, setTheme } = useTheme();

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
              <BrandLogo height={30} />
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
            <span>Paiements & Livraison</span>
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
            Paiement direct au développeur · Mobile Money · Version 2026.2 · Mise à jour le 11 octobre 2026
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
          {PROVIDERS_CF.map(p => (
            <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {p.icon}
              <div>
                <strong style={{ display: 'block', fontSize: '15px' }}>{p.name}</strong>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Paiement direct au développeur</span>
              </div>
            </div>
          ))}
        </div>

        {/* Articles des CF : conformes à docs/decisions.md (Fid’s ne détient jamais les fonds) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', lineHeight: 1.7, fontSize: '15px' }}>
          <section>
            <h2 style={H2}>Article 1 · Fid’s ne détient jamais le paiement du développeur</h2>
            <p style={P}>
              Le client paie le développeur <strong>directement</strong>, sur l’un des numéros Mobile Money que le développeur a enregistrés dans son espace.
              Fid’s n’est ni une banque, ni un établissement de paiement, ni un compte séquestre : <strong>le paiement destiné au développeur ne transite jamais par Fid’s</strong>, ni par Systalink, ni par l’administration de la plateforme.
            </p>
            <p style={P0}>
              Seuls les frais de service de Fid’s (article 2), dus par le client, sont versés à Fid’s, pour son propre compte. Ce que Fid’s garde jusqu’au règlement complet, c’est l’application : le code source et les accès restent chiffrés et ne sont remis au client qu’à la fin du parcours décrit à l’article 3.
            </p>
          </section>

          <section>
            <h2 style={H2}>Article 2 · Tarification : 0 % pour le développeur</h2>
            <p style={P}>
              Le développeur ne paie rien : il reçoit <strong>100 % du montant convenu</strong>, directement sur son numéro. Le client règle à Fid’s des <strong>frais de service de 5 %</strong> du montant de la livraison (100 FCFA minimum, arrondis au franc supérieur), au moment de recevoir son application.
            </p>
            <div style={{ padding: '16px 20px', borderRadius: '18px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)', margin: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}>
                <span>Montant convenu (exemple) :</span>
                <strong>500 000 FCFA</strong>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}>
                <span>Reçu par le développeur :</span>
                <strong>500 000 FCFA (100 %)</strong>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px' }}>
                <span>Frais de service Fid’s, payés par le client (5 %) :</span>
                <strong>25 000 FCFA</strong>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '8px', color: 'var(--muted)', fontSize: '13px' }}>
                <span>Total payé par le client :</span>
                <span>525 000 FCFA, en deux paiements</span>
              </div>
            </div>
            <p style={P0}>
              Aucun abonnement. Les frais propres à chaque opérateur Mobile Money (envoi, retrait) restent régis par les conditions de l’opérateur concerné.
            </p>
          </section>

          <section>
            <h2 style={H2}>Article 3 · Paiement et déblocage de la livraison</h2>
            <ol style={OL}>
              <li>Le client teste l’application sur la démo hébergée, accessible par le lien de livraison.</li>
              <li>S’il est satisfait, il paie le montant convenu au numéro Mobile Money du développeur de son choix, puis <strong>déclare son paiement</strong> en saisissant la référence de la transaction reçue par SMS.</li>
              <li>Le développeur vérifie la réception sur son compte et clique sur <strong>« Dépôt confirmé »</strong>. La démo reste alors consultable, mais rien n’est encore remis.</li>
              <li>Le client règle les <strong>frais de service de 5 %</strong> sur l’un des numéros de Fid’s indiqués sur sa page, depuis le même appareil, et déclare la référence de la transaction.</li>
              <li>Dès que Fid’s a confirmé la réception des frais, la livraison est débloquée : l’application passe au nom du client, sur sa propre adresse, avec ses accès et, si prévu, le code source.</li>
            </ol>
            <p style={{ ...P0, marginTop: '12px' }}>
              Les montants faisant foi sont toujours ceux affichés par Fid’s sur la page de livraison. Le simple retour depuis l’application de l’opérateur ne débloque rien : seules les confirmations du développeur et de Fid’s, ou une décision de l’administration prévue à l’article 5, le permettent.
            </p>
          </section>

          <section>
            <h2 style={H2}>Article 4 · Essai et expiration de la démo</h2>
            <p style={P}>
              La démo reste accessible jusqu’à la date d’expiration indiquée sur la page de livraison. Le client n’a rien à payer tant qu’il n’a pas décidé de garder l’application.
            </p>
            <p style={P0}>
              Sans paiement confirmé à l’expiration, la démo et le code déposé sont supprimés : le développeur conserve son travail et le client ne reçoit rien. Aucune passation n’a lieu tant que le paiement au développeur et les frais de service ne sont pas confirmés.
            </p>
          </section>

          <section>
            <h2 style={H2}>Article 5 · Paiement contesté</h2>
            <p style={P}>Si le développeur indique n’avoir rien reçu, ou ne traite pas un paiement déclaré :</p>
            <ul style={UL}>
              <li>un paiement déclaré et non traité <strong>expire au bout de 48 heures</strong> ;</li>
              <li>le client peut alors ouvrir un <strong>ticket</strong> en joignant ses preuves (référence, capture du SMS de l’opérateur) ;</li>
              <li>le développeur est relancé pour répondre ;</li>
              <li>à défaut de réponse, l’administration de Fid’s peut <strong>confirmer le paiement</strong> à la place du développeur. Cette action est journalisée.</li>
            </ul>
            <p style={{ ...P0, marginTop: '12px' }}>
              Si Fid’s ne constate pas la réception des frais de service, la déclaration est refusée avec un motif et le client peut déclarer à nouveau, avec la bonne référence. L’administration ne manipule jamais le paiement destiné au développeur : elle ne peut ni l’encaisser, ni le reverser, ni le rembourser.
            </p>
          </section>

          <section>
            <h2 style={H2}>Article 6 · Remboursements</h2>
            <p style={P0}>
              Fid’s ne détenant pas le paiement destiné au développeur, elle ne peut pas le rembourser : toute restitution de cette somme se règle directement entre le client et le développeur. Les frais de service ne sont exigibles qu’au moment où l’application est remise au client. Les journaux de la livraison (déclarations, confirmations, tickets) peuvent être fournis aux parties à titre de preuve.
            </p>
          </section>

          <section>
            <h2 style={H2}>Article 7 · Factures</h2>
            <p style={P0}>
              À la passation, Fid’s émet une facture numérotée au nom du développeur (vendeur) et du client (acheteur) pour le montant de la livraison, ainsi qu’un reçu pour les frais de service perçus par Fid’s. Les deux documents sont téléchargeables en PDF dans l’espace client, la facture également dans l’espace développeur.
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
            <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>Prêt à livrer en confiance ?</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
              Créez votre compte : votre client teste, vous paie directement, et l’application passe à son nom.
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
          <div>© 2026 Fid’s · Opéré par Systalink</div>
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
