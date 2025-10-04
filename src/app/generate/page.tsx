'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import GenerateScreen from './GenerateScreen';

export default function GeneratePage() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  // No hooks after these conditionals
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  return <GenerateScreen />;
}


