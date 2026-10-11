'use client';

import React from 'react';
import Link from 'next/link';
import { useTheme } from '@/lib/theme';
import { BrandLogo } from '@/components/Brand';
import { ArrowLeftIcon, MoonIcon, ShieldIcon, SunIcon } from '@/components/Icons';

export default function CguPage() {
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
              href="/cf"
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
              Conditions Financières (CF) →
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
      <main style={{ maxWidth: '860px', margin: '0 auto', padding: 'clamp(24px, 5vw, 48px) clamp(16px, 4vw, 24px) 80px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Titre et métadonnées */}
        <div style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'var(--color-accent-100)',
              color: 'var(--color-accent-800)',
              fontSize: '13px',
              fontWeight: 700,
              marginBottom: '14px'
            }}
          >
            <ShieldIcon size={14} color="var(--color-accent-800)" />
            <span>Cadre légal & contractuel</span>
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
            Conditions Générales d'Utilisation (CGU)
          </h1>
          <p style={{ fontSize: '16px', color: 'var(--muted)', margin: 0 }}>
            Dernière mise à jour : 11 octobre 2026 · Plateforme opérée par Systalink Côte d’Ivoire
          </p>
        </div>

        {/* Note de préambule */}
        <div
          style={{
            padding: '20px 24px',
            borderRadius: '24px',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-divider)',
            marginBottom: '40px',
            lineHeight: 1.6,
            fontSize: '15px'
          }}
        >
          <strong style={{ display: 'block', marginBottom: '6px', color: 'var(--color-accent-900)' }}>
            💡 En résumé :
          </strong>
          Fid’s protège les créateurs de logiciels et leurs clients. Le développeur ne transmet pas son code source avant d'être payé, et le client ne paie pas avant d'avoir testé son application sur notre conteneur sécurisé.
        </div>

        {/* Articles des CGU */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '36px', lineHeight: 1.7, fontSize: '15px' }}>
          
          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 1 · Objet du service
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              La plateforme <strong>Fid’s</strong> est un tiers de confiance technique destiné à sécuriser la livraison de solutions logicielles sur mesure (applications web, mobiles, scripts, APIs) développées pour le compte de clients finaux en Afrique de l’Ouest et à l’international.
            </p>
            <p style={{ margin: 0 }}>
              Fid’s assure l'hébergement temporaire et étanche des démonstrations avant livraison, puis la passation de l’application au client (accès, base de données et, si prévu, code source) dès que le paiement au développeur et les frais de service de Fid’s ont été confirmés. Fid’s ne détient jamais le paiement destiné au développeur : le client paie le développeur directement, et règle à Fid’s des frais de service de 5 % (0 % pour le développeur ; voir les Conditions Financières).
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 2 · Définitions
            </h2>
            <ul style={{ margin: 0, paddingLeft: '22px', listStyle: 'disc', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li><strong>Développeur (Prestataire) :</strong> tout développeur freelance, agence ou studio logiciel créant un projet et déposant son archive technique sur Fid’s.</li>
              <li><strong>Client :</strong> toute personne physique ou morale commanditaire du logiciel, invitée à tester l'application et à en régler le montant.</li>
              <li><strong>Démo Fid’s :</strong> environnement éphémère et cloisonné (conteneur Docker isolé) exécutant l'application pour permettre l'essai fonctionnel sans accès direct au code source.</li>
              <li><strong>Passation (Handover) :</strong> processus technique automatisé transférant l'archive du code source, les variables d'environnement et la redirection DNS vers les accès du client dès confirmation du paiement.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 3 · Création de compte et Vérification
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              L'accès à l’espace développeur ou à l’espace client nécessite la création d'un compte, par adresse e-mail et mot de passe ou par un fournisseur de connexion (Google, GitHub). À l’inscription, l’utilisateur choisit son type de compte : développeur ou client. Un client peut aussi recevoir sa livraison sans compte, par le lien privé qui lui est transmis.
            </p>
            <p style={{ margin: 0 }}>
              Chaque utilisateur s’engage à fournir des informations véridiques. Le développeur enregistre lui-même les numéros Mobile Money (Wave, Orange Money, Moov Money ou MTN MoMo) sur lesquels ses clients le paient ; il est seul responsable de leur exactitude.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 4 · Propriété Intellectuelle et Cession des Droits
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              <strong>Conservation préalable :</strong> Le développeur demeure le propriétaire exclusif de l'intégralité du code source, de la logique logicielle et des éléments graphiques jusqu’à la confirmation définitive du paiement par les services de Fid’s.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Cession immédiate et automatique :</strong> Dès que le développeur a confirmé avoir reçu le paiement intégral (ou, en cas de paiement contesté, dès que l’administration l’a confirmé selon les Conditions Financières) et que Fid’s a confirmé la réception des frais de service, la cession des droits patrimoniaux sur le code source est opérée au profit du client, conformément à l’accord initial entre les parties.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 5 · Engagements et Intégrité du Code
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              Il est strictement interdit de déposer sur Fid’s du code comportant des portes dérobées (backdoors), des logiciels malveillants, des composants de minage ou tout élément attentatoire à la sécurité du client final ou de l’infrastructure cloud de Fid’s.
            </p>
            <p style={{ margin: 0 }}>
              Tout manquement entraîne la suspension immédiate du compte et le signalement aux autorités compétentes.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 6 · Résolution des Litiges & Arbitrage
            </h2>
            <p style={{ margin: '0 0 12px' }}>
              Le client teste l’application <strong>avant</strong> de payer : si la démo ne correspond pas à ce qui était convenu, il ne paie pas et la démo expire, sans engagement. Les désaccords sur un paiement (par exemple, un développeur qui indique n’avoir rien reçu) se traitent par <strong>ticket</strong>, selon la procédure décrite à l’article 5 des Conditions Financières.
            </p>
            <p style={{ margin: 0 }}>
              Le journal de la livraison tenu par Fid’s (déclarations de paiement, confirmations, tickets, décisions de l’administration) peut être produit entre les parties à titre de preuve.
            </p>
          </section>

          <section>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 400, margin: '0 0 12px', color: 'var(--color-accent-800)' }}>
              Article 7 · Droit applicable et Juridiction
            </h2>
            <p style={{ margin: 0 }}>
              Les présentes Conditions Générales d'Utilisation sont régies par le droit en vigueur en République de Côte d'Ivoire et les dispositions applicables au commerce électronique et à la protection des données au sein de l'espace CEDEAO/UEMOA.
            </p>
          </section>

        </div>

        {/* Liens vers Conditions Financières & Auth */}
        <div
          style={{
            marginTop: '60px',
            padding: '28px',
            borderRadius: '28px',
            background: 'var(--card)',
            border: '1px solid var(--color-divider)',
            boxShadow: 'var(--shadow-soft)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px'
          }}
        >
          <div>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px' }}>Consulter les Conditions Financières</h3>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
              0 % pour le développeur, 5 % de frais pour le client, déblocage de la livraison et factures.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Link
              href="/cf"
              className="btn btn-primary"
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
              Lire les CF →
            </Link>
          </div>
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
            <Link href="/cgu" style={{ color: 'var(--color-accent-700)', textDecoration: 'none', fontWeight: 600 }}>CGU</Link>
            <Link href="/cf" style={{ color: 'inherit', textDecoration: 'none' }}>CF</Link>
            <Link href="/auth" style={{ color: 'inherit', textDecoration: 'none' }}>Connexion</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
