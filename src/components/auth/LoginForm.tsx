'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { LoginMethod } from '@/lib/auth/types';
import { validateEmail } from '@/lib/auth/security';
import { logSecurityEvent } from '@/lib/auth/security';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function LoginForm({ onSuccess, redirectTo = '/generate' }: LoginFormProps) {
  const { login, sendMagicLink, sendOTP, verifyOTP, authState } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [method, setMethod] = useState<LoginMethod['type']>('magic_link');
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!validateEmail(email)) {
      setError('Adresse email invalide');
      return;
    }

    try {
      let result;
      
      if (method === 'magic_link') {
        result = await sendMagicLink(email);
        if (result.success) {
          setMessage('Lien magique envoyé ! Vérifiez votre boîte mail.');
          logSecurityEvent('magic_link_sent', { email });
        }
      } else if (method === 'otp') {
        result = await sendOTP(email);
        if (result.success) {
          setStep('otp');
          setMessage('Code de vérification envoyé par email.');
          logSecurityEvent('otp_sent', { email });
        }
      } else if (method === 'password') {
        if (!password) {
          setError('Mot de passe requis');
          return;
        }
        result = await login({ email, password, method: 'password' });
        if (result.success) {
          onSuccess?.();
          logSecurityEvent('password_login_success', { email });
        }
      }

      if (!result?.success) {
        setError(result?.error || 'Erreur de connexion');
        logSecurityEvent('login_failed', { email, method, error: result?.error }, 'warn');
      }
    } catch (err) {
      setError('Erreur inattendue');
      logSecurityEvent('login_exception', { email, method, error: err }, 'error');
    }
  };

  const handleOTPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!otp || otp.length !== 6) {
      setError('Code OTP invalide (6 chiffres requis)');
      return;
    }

    try {
      const result = await verifyOTP(email, otp);
      if (result.success) {
        setMessage('Connexion réussie !');
        onSuccess?.();
        logSecurityEvent('otp_verification_success', { email });
      } else {
        setError(result.error || 'Code OTP invalide');
        logSecurityEvent('otp_verification_failed', { email, error: result.error }, 'warn');
      }
    } catch (err) {
      setError('Erreur de vérification');
      logSecurityEvent('otp_verification_exception', { email, error: err }, 'error');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!password) {
      setError('Mot de passe requis');
      return;
    }

    try {
      const result = await login({ email, password, method: 'password' });
      if (result.success) {
        setMessage('Connexion réussie !');
        onSuccess?.();
        logSecurityEvent('password_login_success', { email });
      } else {
        setError(result.error || 'Identifiants invalides');
        logSecurityEvent('password_login_failed', { email, error: result.error }, 'warn');
      }
    } catch (err) {
      setError('Erreur de connexion');
      logSecurityEvent('password_login_exception', { email, error: err }, 'error');
    }
  };

  const resetForm = () => {
    setStep('email');
    setOtp('');
    setPassword('');
    setError('');
    setMessage('');
  };

  if (authState.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="ml-3 text-white/70">Connexion en cours...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card p-6 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-2xl font-semibold text-center mb-6">Connexion</h1>
        
        {/* Sélecteur de méthode */}
        {step === 'email' && (
          <div className="mb-6">
            <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
              <button
                type="button"
                onClick={() => setMethod('magic_link')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  method === 'magic_link'
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Lien magique
              </button>
              <button
                type="button"
                onClick={() => setMethod('otp')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  method === 'otp'
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Code OTP
              </button>
              <button
                type="button"
                onClick={() => setMethod('password')}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  method === 'password'
                    ? 'bg-blue-500 text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                Mot de passe
              </button>
            </div>
          </div>
        )}

        {/* Formulaire email */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-[48px] bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                placeholder="votre@email.com"
                required
                autoComplete="email"
              />
            </div>

            {method === 'password' && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                  Mot de passe
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full min-h-[48px] bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Votre mot de passe"
                  required
                  autoComplete="current-password"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authState.loading}
              className="btn-primary btn-xl w-full justify-center min-h-[48px]"
            >
              {authState.loading ? 'Connexion...' : 
               method === 'magic_link' ? 'Envoyer le lien magique' :
               method === 'otp' ? 'Envoyer le code' :
               'Se connecter'}
            </button>
          </form>
        )}

        {/* Formulaire OTP */}
        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="space-y-4">
            <div className="text-center">
              <p className="text-white/70 mb-4">
                Code envoyé à <strong>{email}</strong>
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="text-blue-400 hover:text-blue-300 text-sm underline"
              >
                Changer d'email
              </button>
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-white/90 mb-2">
                Code de vérification (6 chiffres)
              </label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full min-h-[48px] bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center text-2xl tracking-widest"
                placeholder="123456"
                maxLength={6}
                required
                autoComplete="one-time-code"
              />
            </div>

            <button
              type="submit"
              disabled={authState.loading || otp.length !== 6}
              className="btn-primary btn-xl w-full justify-center min-h-[48px]"
            >
              {authState.loading ? 'Vérification...' : 'Vérifier le code'}
            </button>
          </form>
        )}

        {/* Messages */}
        {message && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-300 text-sm">{message}</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Liens utiles */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={resetForm}
            className="text-white/70 hover:text-white text-sm underline"
          >
            ← Retour
          </button>
        </div>
      </div>
    </div>
  );
}
