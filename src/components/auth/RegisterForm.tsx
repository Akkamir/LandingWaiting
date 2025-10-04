'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { validateEmail, validatePasswordStrength } from '@/lib/auth/security';
import { logSecurityEvent } from '@/lib/auth/security';

interface RegisterFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export function RegisterForm({ onSuccess, redirectTo = '/generate' }: RegisterFormProps) {
  const { register, authState } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const passwordStrength = validatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    // Validation
    if (!validateEmail(email)) {
      setError('Adresse email invalide');
      return;
    }

    if (!passwordStrength.isValid) {
      setError('Mot de passe trop faible');
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!acceptTerms) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    try {
      const result = await register({
        email,
        password,
        name: name.trim() || undefined,
        acceptTerms,
      });

      if (result.success) {
        setMessage('Compte créé ! Vérifiez votre email pour confirmer votre inscription.');
        logSecurityEvent('register_success', { email });
        onSuccess?.();
      } else {
        setError(result.error || 'Erreur lors de l\'inscription');
        logSecurityEvent('register_failed', { email, error: result.error }, 'warn');
      }
    } catch (err) {
      setError('Erreur inattendue');
      logSecurityEvent('register_exception', { email, error: err }, 'error');
    }
  };

  if (authState.loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <span className="ml-3 text-white/70">Création du compte...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="card p-6 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-2xl font-semibold text-center mb-6">Créer un compte</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-white/90 mb-2">
              Nom (optionnel)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[48px] bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Votre nom"
              maxLength={50}
              autoComplete="name"
            />
          </div>

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
              placeholder="Mot de passe sécurisé"
              required
              autoComplete="new-password"
            />
            
            {/* Indicateur de force du mot de passe */}
            {password && (
              <div className="mt-2">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="flex-1 bg-white/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        passwordStrength.score <= 2 ? 'bg-red-500' :
                        passwordStrength.score <= 3 ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`}
                      style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className={`text-xs ${
                    passwordStrength.score <= 2 ? 'text-red-400' :
                    passwordStrength.score <= 3 ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>
                    {passwordStrength.score}/5
                  </span>
                </div>
                
                {passwordStrength.feedback.length > 0 && (
                  <div className="text-xs text-white/60">
                    {passwordStrength.feedback.map((feedback, index) => (
                      <div key={index} className="flex items-center">
                        <span className="text-red-400 mr-1">•</span>
                        {feedback}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-white/90 mb-2">
              Confirmer le mot de passe
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full min-h-[48px] bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Confirmez votre mot de passe"
              required
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="mt-1 text-xs text-red-400">Les mots de passe ne correspondent pas</p>
            )}
          </div>

          <div className="flex items-start space-x-3">
            <input
              id="acceptTerms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-blue-500 bg-white/5 border-white/20 rounded focus:ring-blue-500/50"
              required
            />
            <label htmlFor="acceptTerms" className="text-sm text-white/70">
              J'accepte les{' '}
              <a href="/terms" className="text-blue-400 hover:text-blue-300 underline">
                conditions d'utilisation
              </a>{' '}
              et la{' '}
              <a href="/privacy" className="text-blue-400 hover:text-blue-300 underline">
                politique de confidentialité
              </a>
            </label>
          </div>

          <button
            type="submit"
            disabled={authState.loading || !passwordStrength.isValid || password !== confirmPassword || !acceptTerms}
            className="btn-primary btn-xl w-full justify-center min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {authState.loading ? 'Création du compte...' : 'Créer mon compte'}
          </button>
        </form>

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

        {/* Lien vers la connexion */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            Déjà un compte ?{' '}
            <button
              type="button"
              onClick={() => window.history.back()}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Se connecter
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
