'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRecette } from '@/lib/context';
import { useToast } from '@/components/Toast';
import { useConfetti } from '@/components/Confetti';
import {
  AppleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  GoogleIcon,
  LogoIcon,
  MoonIcon,
  SunIcon
} from '@/components/Icons';
import { Role } from '@/lib/types';

export default function AuthPage() {
  const router = useRouter();
  const { state, setTheme, switchRole, loginCustomUser } = useRecette();
  const { showToast } = useToast();
  const { launchConfetti } = useConfetti();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  // Login form state
  const [loginId, setLoginId] = useState('yannick@lagune.ci');
  const [loginPw, setLoginPw] = useState('password123');
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup wizard state
  const [signupStep, setSignupStep] = useState(0); // 0: role, 1: infos, 2: otp
  const [selectedRole, setSelectedRole] = useState<Role>('dev');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [terms, setTerms] = useState(true);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [signupLoading, setSignupLoading] = useState(false);
  const [done, setDone] = useState(false);

  const isDark = state.theme === 'dark';

  // OTP resend countdown
  useEffect(() => {
    if (signupStep === 2 && resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [signupStep, resendTimer]);

  // Mot de passe strength calculation
  const calculatePasswordStrength = (val: string) => {
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score++;
    if (/\d/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val) && val.length >= 10) score++;
    return score;
  };
  const pwStrength = calculatePasswordStrength(pw);
  const strengthLabels = ['Trop court', 'Faible', 'Correct', 'Solide', 'Excellent'];
  const strengthColors = ['var(--danger)', 'var(--danger)', 'var(--warning)', 'var(--success)', 'var(--success)'];

  // Connexion de test immédiate (rôles)
  const handleQuickLogin = (role: Role) => {
    switchRole(role);
    if (role === 'dev') {
      showToast('Connecté en tant que Développeur (Yannick Kouassi)', 'success');
      router.push('/dev/dashboard');
    } else if (role === 'client') {
      showToast('Connecté en tant que Client (Mariam Traoré)', 'success');
      router.push('/client/dashboard');
    } else {
      showToast('Connecté en tant qu’Administrateur Systalink', 'success');
      router.push('/admin/overview');
    }
  };

  // Connexion sociale
  const handleSocialLogin = (provider: 'google' | 'apple') => {
    const label = provider === 'google' ? 'Google' : 'Apple';
    showToast(`Connexion via ${label} réussie`, 'success');
    switchRole('dev');
    router.push('/dev/dashboard');
  };

  // Soumission Connexion
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginId.trim() || !loginPw) {
      setLoginError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    setLoginLoading(true);
    setTimeout(() => {
      setLoginLoading(false);
      const lowerId = loginId.toLowerCase();

      if (lowerId.includes('admin') || lowerId.includes('ops') || lowerId.includes('systalink')) {
        switchRole('admin');
        showToast('Connexion Administrateur réussie', 'success');
        router.push('/admin/overview');
      } else if (lowerId.includes('client') || lowerId.includes('mariam') || lowerId.includes('kanaga')) {
        switchRole('client');
        showToast('Connexion Client réussie', 'success');
        router.push('/client/dashboard');
      } else {
        switchRole('dev');
        showToast('Connexion Développeur réussie', 'success');
        router.push('/dev/dashboard');
      }
    }, 600);
  };

  // Soumission Inscription Étape 1
  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !pw) {
      showToast('Veuillez remplir tous les champs.', 'warning');
      return;
    }
    if (!terms) {
      showToast('Veuillez accepter les conditions d’utilisation.', 'warning');
      return;
    }

    setSignupLoading(true);
    setTimeout(() => {
      setSignupLoading(false);
      setSignupStep(2);
      setResendTimer(30);
      showToast('Code SMS envoyé ! Code démo : 123456', 'info');
    }, 500);
  };

  // Gestion du code OTP
  const handleOtpChange = (val: string) => {
    const clean = val.replace(/\D/g, '').slice(0, 6);
    setOtp(clean);
    setOtpError(false);

    if (clean.length === 6) {
      if (clean === '123456') {
        setTimeout(() => {
          loginCustomUser({
            fullName: name,
            email: email,
            phone: `+225 ${phone}`,
            role: selectedRole,
            businessName: selectedRole === 'dev' ? name : `${name} Entreprise`
          });
          setDone(true);
          launchConfetti();
        }, 250);
      } else {
        setOtpError(true);
        showToast('Code SMS incorrect. Code démo : 123456', 'warning');
      }
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 16px',
        background: 'var(--color-bg)',
        color: 'var(--color-text)',
        fontFamily: 'var(--font-body)',
        boxSizing: 'border-box',
        transition: 'background .3s, color .3s'
      }}
    >
      {/* Barre supérieure : retour et thème */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}
      >
        <Link
          href="/"
          style={{
            fontSize: '14px',
            color: 'var(--muted)',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '999px',
            background: 'var(--card)',
            border: '1px solid var(--color-divider)',
            boxShadow: 'var(--shadow-soft)',
            transition: 'all .2s'
          }}
        >
          <ArrowLeftIcon size={14} />
          <span>Retour au site</span>
        </Link>

        <button
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label="Changer de thème"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '1px solid var(--color-divider)',
            background: 'var(--card)',
            color: 'var(--color-text)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-soft)'
          }}
        >
          {isDark ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>
      </div>

      {/* Carte principale de connexion / inscription centrée */}
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--card)',
          borderRadius: '32px',
          padding: 'clamp(28px, 5vw, 40px)',
          border: '1px solid var(--color-divider)',
          boxShadow: 'var(--shadow-float)',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          gap: '22px'
        }}
      >
        {/* En-tête de la carte : Logo Recette centré */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
          <Link
            href="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              textDecoration: 'none',
              color: 'var(--color-text)'
            }}
          >
            <span
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--grad)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 4px 16px rgba(255,106,0,.4)',
                color: '#fff'
              }}
            >
              <LogoIcon size={22} color="#fff" />
            </span>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', letterSpacing: '-0.02em' }}>
              Recette
            </span>
          </Link>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
            Plateforme de livraison et séquestre pour logiciels sur mesure
          </p>
        </div>

        {/* Bascule Connexion / Inscription si pas terminé */}
        {!done && (
          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              padding: '4px',
              borderRadius: '999px',
              background: 'var(--color-neutral-300)'
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: '4px',
                bottom: '4px',
                left: '4px',
                width: 'calc(50% - 4px)',
                borderRadius: '999px',
                background: 'var(--card)',
                boxShadow: 'var(--shadow-soft)',
                transform: mode === 'login' ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform .35s cubic-bezier(.2,.9,.2,1)'
              }}
            />
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setLoginError('');
              }}
              style={{
                position: 'relative',
                minHeight: '42px',
                border: 0,
                background: 'transparent',
                font: 'inherit',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                color: mode === 'login' ? 'var(--color-text)' : 'var(--muted)',
                transition: 'color .25s'
              }}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setSignupStep(0);
              }}
              style={{
                position: 'relative',
                minHeight: '42px',
                border: 0,
                background: 'transparent',
                font: 'inherit',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                color: mode === 'signup' ? 'var(--color-text)' : 'var(--muted)',
                transition: 'color .25s'
              }}
            >
              Inscription
            </button>
          </div>
        )}

        {/* ----------------- VUE CONNEXION ----------------- */}
        {mode === 'login' && !done && (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Boutons Sociaux : GOOGLE & APPLE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                style={{
                  minHeight: '46px',
                  borderRadius: '16px',
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-neutral-100)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background .2s'
                }}
              >
                <GoogleIcon size={18} />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('apple')}
                style={{
                  minHeight: '46px',
                  borderRadius: '16px',
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-neutral-100)',
                  color: 'var(--color-text)',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background .2s'
                }}
              >
                <AppleIcon size={18} color="currentColor" />
                <span>Apple</span>
              </button>
            </div>

            {/* Séparateur */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--muted)', fontSize: '12px', margin: '2px 0' }}>
              <span style={{ flex: 1, height: '1px', background: 'var(--color-divider)' }} />
              <span>ou avec e-mail</span>
              <span style={{ flex: 1, height: '1px', background: 'var(--color-divider)' }} />
            </div>

            {/* Champ E-mail / Téléphone */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label htmlFor="c-login-id" style={{ fontSize: '13px', fontWeight: 600 }}>
                E-mail ou numéro de téléphone
              </label>
              <input
                id="c-login-id"
                type="text"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                placeholder="vous@exemple.ci"
                autoComplete="username"
                required
                style={{
                  width: '100%',
                  minHeight: '48px',
                  padding: '0 16px',
                  borderRadius: '14px',
                  border: '1px solid var(--color-divider)',
                  background: 'var(--color-neutral-100)',
                  color: 'var(--color-text)',
                  fontSize: '15px',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            {/* Champ Mot de passe */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="c-login-pw" style={{ fontSize: '13px', fontWeight: 600 }}>
                  Mot de passe
                </label>
                <a
                  href="#forgot"
                  onClick={e => {
                    e.preventDefault();
                    showToast('Lien de réinitialisation envoyé par SMS/Email.', 'info');
                  }}
                  style={{ fontSize: '12px', color: 'var(--color-accent-700)', textDecoration: 'none' }}
                >
                  Mot de passe oublié ?
                </a>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  id="c-login-pw"
                  type={showLoginPw ? 'text' : 'password'}
                  value={loginPw}
                  onChange={e => setLoginPw(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{
                    width: '100%',
                    minHeight: '48px',
                    padding: '0 46px 0 16px',
                    borderRadius: '14px',
                    border: '1px solid var(--color-divider)',
                    background: 'var(--color-neutral-100)',
                    color: 'var(--color-text)',
                    fontSize: '15px',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box',
                    outline: 'none'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPw(!showLoginPw)}
                  aria-label={showLoginPw ? 'Cacher le mot de passe' : 'Afficher le mot de passe'}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 0,
                    background: 'transparent',
                    color: 'var(--muted)',
                    cursor: 'pointer',
                    display: 'grid',
                    placeItems: 'center'
                  }}
                >
                  {showLoginPw ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                </button>
              </div>
            </div>

            {/* Message d'erreur */}
            {loginError && (
              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '12px',
                  background: 'var(--danger-100)',
                  color: 'var(--danger-800)',
                  fontSize: '13px'
                }}
              >
                {loginError}
              </div>
            )}

            {/* Bouton Se connecter */}
            <button
              type="submit"
              disabled={loginLoading}
              style={{
                minHeight: '50px',
                borderRadius: '999px',
                border: 0,
                background: 'var(--grad)',
                color: '#fff',
                font: 'inherit',
                fontSize: '16px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(255,106,0,.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '4px'
              }}
            >
              {loginLoading ? (
                <span>Connexion en cours…</span>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRightIcon size={18} />
                </>
              )}
            </button>

            {/* Bascule vers Inscription */}
            <p style={{ margin: '6px 0 0', textAlign: 'center', fontSize: '13px', color: 'var(--muted)' }}>
              Pas encore de compte ?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setSignupStep(0);
                }}
                style={{
                  border: 0,
                  background: 'transparent',
                  color: 'var(--color-accent-700)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  font: 'inherit'
                }}
              >
                Créer un compte
              </button>
            </p>
          </form>
        )}

        {/* ----------------- VUE INSCRIPTION (WIZARD CENTRÉ) ----------------- */}
        {mode === 'signup' && !done && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            {/* Progression 1/3, 2/3, 3/3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  style={{
                    flex: 1,
                    height: '5px',
                    borderRadius: '999px',
                    background: i <= signupStep ? 'var(--grad)' : 'var(--color-neutral-300)',
                    transition: 'background .3s'
                  }}
                />
              ))}
              <span style={{ fontSize: '11px', fontFamily: 'var(--mono)', fontWeight: 600, color: 'var(--muted)', marginLeft: '4px' }}>
                {signupStep + 1}/3
              </span>
            </div>

            {/* ÉTAPE 0 : CHOIX DU RÔLE */}
            {signupStep === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600 }}>Vous êtes :</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                    Sélectionnez votre profil d’utilisation
                  </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Développeur */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('dev')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: 0,
                      cursor: 'pointer',
                      font: 'inherit',
                      textAlign: 'left',
                      color: 'var(--color-text)',
                      background: selectedRole === 'dev' ? 'var(--color-accent-100)' : 'var(--color-neutral-100)',
                      boxShadow: selectedRole === 'dev' ? 'inset 0 0 0 2px var(--color-accent)' : 'none',
                      transition: 'all .2s'
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>👨‍💻</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginRight: 'auto' }}>
                      <strong style={{ fontSize: '15px' }}>Développeur</strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Livrer du code et être payé</span>
                    </div>
                    {selectedRole === 'dev' && <CheckIcon size={18} color="var(--color-accent)" />}
                  </button>

                  {/* Client */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('client')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: 0,
                      cursor: 'pointer',
                      font: 'inherit',
                      textAlign: 'left',
                      color: 'var(--color-text)',
                      background: selectedRole === 'client' ? 'var(--color-accent-100)' : 'var(--color-neutral-100)',
                      boxShadow: selectedRole === 'client' ? 'inset 0 0 0 2px var(--color-accent)' : 'none',
                      transition: 'all .2s'
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>🏢</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginRight: 'auto' }}>
                      <strong style={{ fontSize: '15px' }}>Client</strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Tester avant de payer</span>
                    </div>
                    {selectedRole === 'client' && <CheckIcon size={18} color="var(--color-accent)" />}
                  </button>

                  {/* Administrateur */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('admin')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '16px',
                      border: 0,
                      cursor: 'pointer',
                      font: 'inherit',
                      textAlign: 'left',
                      color: 'var(--color-text)',
                      background: selectedRole === 'admin' ? 'var(--color-accent-100)' : 'var(--color-neutral-100)',
                      boxShadow: selectedRole === 'admin' ? 'inset 0 0 0 2px var(--color-accent)' : 'none',
                      transition: 'all .2s'
                    }}
                  >
                    <span style={{ fontSize: '22px' }}>🛡️</span>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginRight: 'auto' }}>
                      <strong style={{ fontSize: '15px' }}>Administrateur</strong>
                      <span style={{ fontSize: '12px', color: 'var(--muted)' }}>Supervision Systalink & séquestre</span>
                    </div>
                    {selectedRole === 'admin' && <CheckIcon size={18} color="var(--color-accent)" />}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setSignupStep(1)}
                  style={{
                    minHeight: '48px',
                    borderRadius: '999px',
                    border: 0,
                    background: 'var(--grad)',
                    color: '#fff',
                    font: 'inherit',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 6px 20px rgba(255,106,0,.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '4px'
                  }}
                >
                  <span>Continuer</span>
                  <ArrowRightIcon size={16} />
                </button>
              </div>
            )}

            {/* ÉTAPE 1 : COORDONNÉES */}
            {signupStep === 1 && (
              <form onSubmit={handleInfoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="sn-name" style={{ fontSize: '13px', fontWeight: 600 }}>
                    {selectedRole === 'dev' ? 'Nom ou studio' : 'Nom complet'}
                  </label>
                  <input
                    id="sn-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder={selectedRole === 'dev' ? 'ex. Lagune Digital Studio' : 'ex. Mariam Traoré'}
                    required
                    style={{
                      width: '100%',
                      minHeight: '46px',
                      padding: '0 14px',
                      borderRadius: '14px',
                      border: '1px solid var(--color-divider)',
                      background: 'var(--color-neutral-100)',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="sn-email" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Adresse e-mail
                  </label>
                  <input
                    id="sn-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="vous@exemple.ci"
                    required
                    style={{
                      width: '100%',
                      minHeight: '46px',
                      padding: '0 14px',
                      borderRadius: '14px',
                      border: '1px solid var(--color-divider)',
                      background: 'var(--color-neutral-100)',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="sn-phone" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Téléphone (+225)
                  </label>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <span
                      style={{
                        display: 'grid',
                        placeItems: 'center',
                        padding: '0 12px',
                        borderRadius: '14px',
                        background: 'var(--color-neutral-300)',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      +225
                    </span>
                    <input
                      id="sn-phone"
                      type="tel"
                      value={phone}
                      onChange={e => {
                        const d = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setPhone((d.match(/.{1,2}/g) || []).join(' '));
                      }}
                      placeholder="07 12 34 56 78"
                      required
                      style={{
                        flex: 1,
                        minHeight: '46px',
                        padding: '0 14px',
                        borderRadius: '14px',
                        border: '1px solid var(--color-divider)',
                        background: 'var(--color-neutral-100)',
                        color: 'var(--color-text)',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="sn-pw" style={{ fontSize: '13px', fontWeight: 600 }}>
                    Mot de passe
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="sn-pw"
                      type={showPw ? 'text' : 'password'}
                      value={pw}
                      onChange={e => setPw(e.target.value)}
                      placeholder="8 caractères min."
                      required
                      style={{
                        width: '100%',
                        minHeight: '46px',
                        padding: '0 44px 0 14px',
                        borderRadius: '14px',
                        border: '1px solid var(--color-divider)',
                        background: 'var(--color-neutral-100)',
                        color: 'var(--color-text)',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      aria-label="Afficher"
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        border: 0,
                        background: 'transparent',
                        color: 'var(--muted)',
                        cursor: 'pointer'
                      }}
                    >
                      {showPw ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                    </button>
                  </div>

                  {/* Force du mot de passe */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', marginTop: '2px' }}>
                    {[0, 1, 2, 3].map(idx => (
                      <span
                        key={idx}
                        style={{
                          height: '4px',
                          borderRadius: '999px',
                          background: idx < pwStrength ? strengthColors[pwStrength] : 'var(--color-neutral-300)'
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: '11px', color: pw ? strengthColors[pwStrength] : 'var(--muted)' }}>
                    {pw ? strengthLabels[pwStrength] : 'Mélangez lettres, chiffres et symboles.'}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => setSignupStep(0)}
                    style={{
                      minHeight: '48px',
                      padding: '0 16px',
                      borderRadius: '999px',
                      border: '1px solid var(--color-divider)',
                      background: 'var(--card)',
                      color: 'var(--color-text)',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={signupLoading}
                    style={{
                      flex: 1,
                      minHeight: '48px',
                      borderRadius: '999px',
                      border: 0,
                      background: 'var(--grad)',
                      color: '#fff',
                      font: 'inherit',
                      fontSize: '15px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 6px 20px rgba(255,106,0,.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    {signupLoading ? 'Envoi...' : 'Recevoir le code SMS'}
                  </button>
                </div>
              </form>
            )}

            {/* ÉTAPE 2 : CODE SMS OTP */}
            {signupStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 600 }}>Code de confirmation</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
                    Code envoyé au +225 {phone || '07 12 34 56 78'} · <strong style={{ color: 'var(--color-accent)' }}>Code démo : 123456</strong>
                  </p>
                </div>

                <label style={{ position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', cursor: 'text' }}>
                  {[0, 1, 2, 3, 4, 5].map(idx => {
                    const ch = otp[idx] || '';
                    const isActive = idx === Math.min(otp.length, 5);
                    return (
                      <span
                        key={idx}
                        style={{
                          aspectRatio: '1/1.1',
                          borderRadius: '12px',
                          background: 'var(--color-neutral-100)',
                          boxShadow: otpError
                            ? 'inset 0 0 0 2px var(--danger)'
                            : isActive
                            ? 'inset 0 0 0 2px var(--color-accent)'
                            : 'inset 0 0 0 1px var(--color-divider)',
                          display: 'grid',
                          placeItems: 'center',
                          fontSize: '22px',
                          fontWeight: 700
                        }}
                      >
                        {ch}
                      </span>
                    );
                  })}
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otp}
                    onChange={e => handleOtpChange(e.target.value)}
                    autoFocus
                    style={{ position: 'absolute', inset: 0, opacity: 0, fontSize: '16px', width: '100%' }}
                  />
                </label>

                {otpError && (
                  <div style={{ padding: '8px 12px', borderRadius: '10px', background: 'var(--danger-100)', color: 'var(--danger-800)', fontSize: '12px' }}>
                    Code invalide. Utilisez 123456 pour valider.
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <button
                    type="button"
                    onClick={() => setSignupStep(1)}
                    style={{ border: 0, background: 'transparent', color: 'var(--muted)', cursor: 'pointer', padding: 0 }}
                  >
                    ← Modifier numéro
                  </button>
                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={() => {
                      setResendTimer(30);
                      setOtp('');
                      showToast('Nouveau code : 123456', 'info');
                    }}
                    style={{
                      border: 0,
                      background: 'transparent',
                      color: resendTimer > 0 ? 'var(--muted)' : 'var(--color-accent-700)',
                      fontWeight: 600,
                      cursor: resendTimer > 0 ? 'default' : 'pointer',
                      padding: 0
                    }}
                  >
                    {resendTimer > 0 ? `Renvoyer (${resendTimer}s)` : 'Renvoyer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ----------------- SUCCÈS INSCRIPTION ----------------- */}
        {done && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '16px' }}>
            <span
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'var(--grad)',
                display: 'grid',
                placeItems: 'center',
                boxShadow: '0 8px 24px rgba(255,106,0,.4)',
                color: '#fff'
              }}
            >
              <CheckIcon size={32} color="#fff" />
            </span>

            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '24px' }}>
                Bienvenue, {name ? name.split(' ')[0] : 'sur Recette'} !
              </h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'var(--muted)' }}>
                Votre compte {selectedRole === 'dev' ? 'Développeur' : selectedRole === 'client' ? 'Client' : 'Administrateur'} est actif.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                if (selectedRole === 'dev') router.push('/dev/dashboard');
                else if (selectedRole === 'client') router.push('/client/dashboard');
                else router.push('/admin/overview');
              }}
              style={{
                width: '100%',
                minHeight: '48px',
                borderRadius: '999px',
                border: 0,
                background: 'var(--grad)',
                color: '#fff',
                font: 'inherit',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(255,106,0,.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>Accéder à mon tableau de bord</span>
              <ArrowRightIcon size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
