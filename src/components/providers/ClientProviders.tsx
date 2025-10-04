"use client";
import { useEffect, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

// Simple context sans createContext pour éviter les problèmes SSR
let authState: AuthContextType = {
  user: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {}
};

interface ClientProvidersProps {
  children: React.ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    let supabase;
    try {
      supabase = createBrowserSupabase();
    } catch (error) {
      console.error("[AUTH] Failed to create Supabase client:", error);
      setLoading(false);
      return;
    }

    // Vérifier la session existante
    supabase.auth.getSession().then(({ data, error }: { data: any, error: any }) => {
      const session = data.session;
      
      if (error) {
        console.error("[AUTH] Session check error:", error);
        setLoading(false);
        return;
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
      setUser(null);
    } catch (error) {
      console.error("[AUTH] Error signing out:", error);
    }
  };

  // Mise à jour de l'état global
  authState = {
    user,
    loading,
    isAuthenticated: !!user,
    signOut
  };

  return <>{children}</>;
}

// Hook pour utiliser l'auth
export function useAuth() {
  return authState;
}