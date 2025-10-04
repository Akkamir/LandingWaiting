"use client";
import { useState, useEffect } from "react";
import type { User } from "@supabase/supabase-js";

// Lazy loading du client Supabase - uniquement côté client
let supabaseBrowser: any = null;

const getSupabaseClient = async () => {
  if (typeof window === 'undefined') {
    console.log("[AUTH] 🚫 Server-side: skipping Supabase client creation");
    return null;
  }
  
  if (supabaseBrowser) {
    console.log("[AUTH] ♻️ Reusing existing Supabase client");
    return supabaseBrowser;
  }

  console.log("[AUTH] 🔧 Creating Supabase client (client-side only)");
  
  try {
    const { createClient } = await import("@supabase/supabase-js");
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("[AUTH] 📦 Supabase config", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseAnonKey,
      isClient: typeof window !== 'undefined',
      isServer: typeof window === 'undefined'
    });

    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project')) {
      console.error("[AUTH] ❌ Variables d'environnement Supabase manquantes");
      return null;
    }

    supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        headers: { "X-Client-Info": "imageai-browser" },
      },
    });

    console.log("[AUTH] ✅ Supabase client created successfully");
    return supabaseBrowser;
  } catch (error) {
    console.error("[AUTH] ❌ Failed to create Supabase client", error);
    return null;
  }
};

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
    
    // Lazy loading du client Supabase
    getSupabaseClient().then((client) => {
      if (!client) {
        console.error("[AUTH] ❌ No Supabase client available");
        setLoading(false);
        return;
      }

      console.log("[AUTH] 📋 Session check result:", {
        hasClient: !!client,
        hasAuth: !!client.auth
      });
      
      // Vérifier la session existante
      client.auth.getSession().then(({ data: { session }, error }) => {
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
      const { data: { subscription } } = client.auth.onAuthStateChange(
        async (event, session) => {
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
    });
  }, []);

  const signOut = async () => {
    try {
      const client = await getSupabaseClient();
      if (client) {
        await client.auth.signOut();
        setUser(null);
      }
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
