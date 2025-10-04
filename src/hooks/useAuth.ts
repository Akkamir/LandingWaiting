"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupérer la session actuelle
    const getSession = async () => {
      try {
        const { data: { session } } = await supabaseBrowser.auth.getSession();
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
