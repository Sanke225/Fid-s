'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecette } from '@/lib/context';
import { useToast } from '@/components/Toast';
import { CheckIcon, LockIcon } from '@/components/Icons';

export default function DevWizardPage() {
  const router = useRouter();
  const { addProject, simulateBuildProcess } = useRecette();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const [formData, setFormData] = useState({
    name: 'Boutique Wax Ivoire',
    clientName: 'Mme Awa Koné',
    clientEmail: 'awa@couture.ci',
    clientPhone: '+225 07 44 33 22 11',
    amountXof: 550000,
    includeSource: true,
    filename: 'wax-ivoire-v1.zip',
    type: 'node',
    nodeVersion: '22',
    port: 3000,
    installCmd: 'npm ci',
    buildCmd: 'npm run build',
    startCmd: 'node dist/server.js'
  });

  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [buildLogs, setBuildLogs] = useState<string[]>([]);
  const [buildProgress, setBuildProgress] = useState(0);
  const [isBuildDone, setIsBuildDone] = useState(false);

  const handleNext = () => {
    if (step < 3) {
      setStep(prev => prev + 1);
    } else if (step === 3) {
      // Étape 4 : Lancer la création et la simulation
      const newProj = addProject({
        name: formData.name,
        clientName: formData.clientName,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        amountXof: formData.amountXof,
        includeSource: formData.includeSource,
        filename: formData.filename
      });

      setCreatedProjectId(newProj.id);
      setStep(4);

      simulateBuildProcess(
        newProj.id,
        (current, total, line) => {
          setBuildProgress(Math.round((current / total) * 100));
          setBuildLogs(prev => [...prev, line]);
        },
        () => {
          setIsBuildDone(true);
          showToast('Projet créé et démo installée avec succès !', 'success');
        }
      );
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: 'clamp(16px, 3vw, 36px)' }}>
      {/* En-tête */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
        <div>
          <span style={{ fontSize: '13px', fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--muted)' }}>
            Livraison de logiciel
          </span>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontWeight: 400, fontSize: '32px', margin: '4px 0 0' }}>
            Nouveau projet à livrer
          </h1>
        </div>
        <Link href="/dev/projects" className="btn btn-secondary" style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '14px', textDecoration: 'none' }}>
          Annuler
        </Link>
      </div>

      {/* Stepper horizontal */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '3px', background: 'var(--color-divider)', zIndex: 0, transform: 'translateY(-50%)' }} />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: `${((step - 1) / (totalSteps - 1)) * 100}%`,
            height: '3px',
            background: 'var(--grad)',
            zIndex: 0,
            transform: 'translateY(-50%)',
            transition: 'width .3s ease'
          }}
        />

        {[
          { n: 1, label: 'Infos & Montant' },
          { n: 2, label: 'Code & Archive' },
          { n: 3, label: 'Manifeste & Stack' },
          { n: 4, label: 'Lancement' }
        ].map(s => {
          const isDone = s.n < step;
          const isCur = s.n === step;
          const bg = isDone ? 'var(--success)' : isCur ? 'var(--grad)' : 'var(--card)';
          const color = isDone || isCur ? '#fff' : 'var(--muted)';
          const border = isDone || isCur ? 'transparent' : 'var(--color-divider)';

          return (
            <div key={s.n} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <span
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: bg,
                  color,
                  border: `2px solid ${border}`,
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: '14px',
                  boxShadow: 'var(--shadow-soft)'
                }}
              >
                {isDone ? '✓' : s.n}
              </span>
              <span style={{ fontSize: '12px', fontWeight: isCur ? 700 : 500, color: isCur ? 'var(--color-text)' : 'var(--muted)', whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Contenu de chaque étape */}
      <div style={{ padding: 'clamp(24px, 4vw, 36px)', borderRadius: '32px', background: 'var(--card)', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--color-divider)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {step === 1 && (
          <>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', margin: 0 }}>
                1. Identification du projet & Modalités
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Renseignez le logiciel à livrer et les coordonnées de votre client.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Nom de l'application
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Solde à percevoir (FCFA)
                </label>
                <input
                  type="number"
                  value={formData.amountXof}
                  onChange={e => setFormData({ ...formData, amountXof: Number(e.target.value) })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Nom du client
                </label>
                <input
                  type="text"
                  value={formData.clientName}
                  onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Téléphone du client (pour SMS démo)
                </label>
                <input
                  type="text"
                  value={formData.clientPhone}
                  onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '14px', padding: '12px 16px', borderRadius: '16px', background: 'var(--color-surface)', border: '1px solid var(--color-divider)' }}>
              <input
                type="checkbox"
                checked={formData.includeSource}
                onChange={e => setFormData({ ...formData, includeSource: e.target.checked })}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-accent)' }}
              />
              <span>Inclure le téléchargement de l'archive du code source à la passation</span>
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', margin: 0 }}>
                2. Dépôt de l'archive de code (.zip)
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Votre archive est chiffrée en AES-256-GCM dès la réception et ne sera débloquée qu'après paiement.
              </span>
            </div>

            <div
              style={{
                border: '2px dashed var(--color-accent)',
                borderRadius: '24px',
                padding: '40px 20px',
                textAlign: 'center',
                background: 'var(--color-accent-100)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px'
              }}
            >
              <span style={{ fontSize: '40px' }}>📦</span>
              <strong style={{ fontSize: '16px' }}>Archive sélectionnée : {formData.filename}</strong>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Taille : 18.4 Mo · SHA256 validé · Chiffrement activé
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px', color: 'var(--success)' }}>
              <LockIcon size={18} />
              <span>Garantie de non-divulgation : le code en clair n'est jamais accessible au client avant le paiement.</span>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', margin: 0 }}>
                3. Manifeste d'exécution (recette.json)
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                Paramètres de démarrage de l'application dans le conteneur isolé.
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Version Node.js
                </label>
                <select
                  value={formData.nodeVersion}
                  onChange={e => setFormData({ ...formData, nodeVersion: e.target.value })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
                >
                  <option value="22">Node.js 22 LTS</option>
                  <option value="24">Node.js 24 Current</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Port HTTP d'écoute
                </label>
                <input
                  type="number"
                  value={formData.port}
                  onChange={e => setFormData({ ...formData, port: Number(e.target.value) })}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Commande d'installation
              </label>
              <input
                type="text"
                value={formData.installCmd}
                onChange={e => setFormData({ ...formData, installCmd: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                Commande de démarrage (start)
              </label>
              <input
                type="text"
                value={formData.startCmd}
                onChange={e => setFormData({ ...formData, startCmd: e.target.value })}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '14px', border: '1px solid var(--color-divider)', background: 'var(--color-surface)', font: 'inherit', boxSizing: 'border-box' }}
              />
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <div>
              <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', margin: 0 }}>
                {isBuildDone ? 'Démo en ligne prête !' : 'Installation en cours dans le conteneur...'}
              </h2>
              <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                {isBuildDone
                  ? 'Le conteneur est provisionné et la démo est prête à être testée par votre client.'
                  : 'Veuillez patienter pendant l’exécution des commandes du conteneur sécurisé.'}
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', borderRadius: '999px', background: 'var(--color-neutral-300)', overflow: 'hidden' }}>
              <div style={{ width: `${buildProgress}%`, height: '100%', background: 'var(--grad)', transition: 'width .3s' }} />
            </div>

            {/* Terminal de streaming */}
            <div
              style={{
                background: '#0B0B0F',
                color: '#A9C4F5',
                padding: '16px',
                borderRadius: '18px',
                fontFamily: 'var(--mono)',
                fontSize: '12px',
                height: '200px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              {buildLogs.map((log, idx) => (
                <div key={idx} style={{ opacity: idx === buildLogs.length - 1 ? 1 : 0.8 }}>
                  &gt; {log}
                </div>
              ))}
            </div>

            {isBuildDone && createdProjectId && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  onClick={() => router.push(`/dev/project/${createdProjectId}`)}
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: '999px',
                    fontSize: '15px',
                    fontWeight: 700
                  }}
                >
                  Accéder à la fiche de suivi du projet →
                </button>
              </div>
            )}
          </>
        )}

        {/* Boutons Suivant / Précédent */}
        {step < 4 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', borderTop: '1px solid var(--color-divider)', paddingTop: '20px' }}>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(prev => prev - 1)}
                className="btn btn-secondary"
                style={{ padding: '10px 20px', borderRadius: '999px' }}
              >
                ← Précédent
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              className="btn btn-primary"
              style={{ padding: '12px 28px', borderRadius: '999px', fontSize: '15px', fontWeight: 700 }}
            >
              {step === 3 ? 'Lancer l’installation →' : 'Continuer →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
