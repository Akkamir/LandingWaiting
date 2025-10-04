'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabaseBrowser } from '@/lib/auth/supabase';
import { logSecurityEvent } from '@/lib/auth/security';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabaseBrowser.auth.getSession();
        
        if (error) {
          logSecurityEvent('auth_callback_error', { error }, 'error');
          setStatus('error');
          setMessage('Erreur lors de la connexion. Veuillez réessayer.');
          return;
        }

        if (data.session) {
          logSecurityEvent('auth_callback_success', { 
            userId: data.session.user.id,
            email: data.session.user.email 
          });
          setStatus('success');
          setMessage('Connexion réussie ! Redirection...');
          
          // Redirection après un délai
          setTimeout(() => {
            router.push('/generate');
          }, 2000);
        } else {
          setStatus('error');
          setMessage('Aucune session trouvée. Veuillez vous reconnecter.');
        }
      } catch (err) {
        logSecurityEvent('auth_callback_exception', { error: err }, 'error');
        setStatus('error');
        setMessage('Erreur inattendue. Veuillez réessayer.');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="w-full max-w-md text-center">
        <div className="card p-8 rounded-2xl border border-white/10 bg-white/5">
          {status === 'loading' && (
            <>
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6" />
              <h1 className="text-2xl font-semibold text-white mb-4">
                Connexion en cours...
              </h1>
              <p className="text-white/70">
                Veuillez patienter pendant que nous vous connectons.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-4">
                Connexion réussie !
              </h1>
              <p className="text-white/70">
                {message}
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-white mb-4">
                Erreur de connexion
              </h1>
              <p className="text-white/70 mb-6">
                {message}
              </p>
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/auth/login')}
                  className="btn-primary w-full"
                >
                  Réessayer
                </button>
                <button
                  onClick={() => router.push('/')}
                  className="w-full px-4 py-2 text-white/70 hover:text-white transition-colors"
                >
                  Retour à l'accueil
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
