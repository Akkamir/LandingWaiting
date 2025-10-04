'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/auth-provider';

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
  requireAuth?: boolean;
  roles?: string[];
}

export function AuthGuard({ 
  children, 
  fallback, 
  redirectTo = '/login',
  requireAuth = true,
  roles = []
}: AuthGuardProps) {
  const { authState } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authState.loading) return;

    if (requireAuth && !authState.user) {
      router.push(redirectTo);
      return;
    }

    if (authState.user && roles.length > 0) {
      const userRole = authState.user.role;
      if (!roles.includes(userRole)) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [authState, router, redirectTo, requireAuth, roles]);

  if (authState.loading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/70">Chargement...</p>
        </div>
      </div>
    );
  }

  if (requireAuth && !authState.user) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/70">Redirection vers la connexion...</p>
        </div>
      </div>
    );
  }

  if (authState.user && roles.length > 0) {
    const userRole = authState.user.role;
    if (!roles.includes(userRole)) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Accès refusé</h1>
            <p className="text-white/70 mb-6">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <button
              onClick={() => router.push('/')}
              className="btn-primary"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
