"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ne s'exécuter que côté client
    if (typeof window === 'undefined') {
      setLoading(false);
      return;
    }
    // Récupérer la session actuelle
    const getSession = async () => {
      try {
        console.log("[AUTH] 🔍 Checking for existing session...");
        const { data: { session } } = await supabaseBrowser.auth.getSession();
        console.log("[AUTH] 📋 Session check result:", {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          timestamp: new Date().toISOString()
        });
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("[AUTH] Error getting session:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      (event, session) => {
        console.log("[AUTH] Auth state changed:", event, session?.user?.email);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabaseBrowser.auth.signOut();
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
