"use client";
import { useState, useEffect } from "react";
import { createBrowserSupabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ne s'exécuter que côté client
    if (typeof window === 'undefined') {
      console.log("[AUTH] 🚫 Server-side: skipping auth check");
      setLoading(false);
      return;
    }

    console.log("[AUTH] 🔍 Checking for existing session...");
    
    const supabase = createBrowserSupabase();
    
    console.log("[AUTH] 📋 Session check result:", {
      hasClient: !!supabase,
      hasAuth: !!supabase.auth
    });
    
    // Vérifier la session existante
    supabase.auth.getSession().then(({ data, error }: { data: any, error: any }) => {
      const session = data.session;
      console.log("[AUTH] 📋 Session check result:", {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        error: error?.message
      });
      
      if (error) {
        console.error("[AUTH] ❌ Session check error:", error);
        setLoading(false);
        return;
      }
      
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: any, session: any) => {
        console.log("[AUTH] 🔄 Auth state changed:", {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email
        });
        
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

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  };
}
