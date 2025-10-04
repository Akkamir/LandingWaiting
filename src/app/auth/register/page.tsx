'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-provider';
import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState.user) {
      router.push('/generate');
    }
  }, [authState.user, router]);

  if (authState.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Redirection...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Créer un compte
          </h1>
          <p className="text-white/70">
            Rejoignez-nous et commencez à créer
          </p>
        </div>

        <RegisterForm 
          onSuccess={() => router.push('/generate')}
        />

        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            Déjà un compte ?{' '}
            <Link 
              href="/auth/login"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Se connecter
            </Link>
          </p>
        </div>

        <div className="mt-4 text-center">
          <Link 
            href="/"
            className="text-white/60 hover:text-white text-sm underline"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
