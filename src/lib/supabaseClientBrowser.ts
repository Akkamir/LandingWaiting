"use client";
import { createClient } from "@supabase/supabase-js";

// Client Supabase uniquement pour le navigateur
// Ce fichier ne sera jamais importé côté serveur

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("[SUPABASE-BROWSER] 🔧 Initializing browser-only Supabase client", {
  timestamp: new Date().toISOString(),
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValue: supabaseUrl,
  isClient: typeof window !== 'undefined',
  isServer: typeof window === 'undefined'
});

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project')) {
  console.error("[SUPABASE-BROWSER] ❌ Variables d'environnement Supabase manquantes ou invalides", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isPlaceholder: supabaseUrl?.includes('placeholder'),
    isYourProject: supabaseUrl?.includes('your-project'),
    urlValue: supabaseUrl,
    message: "Créez un fichier .env.local avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY"
  });
  throw new Error("Configuration Supabase manquante. Vérifiez vos variables d'environnement.");
}

console.log("[SUPABASE-BROWSER] 📦 Creating browser Supabase client with config", {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length,
  authConfig: {
    persistSession: true,
    autoRefreshToken: true
  },
  globalHeaders: { "X-Client-Info": "imageai-browser" }
});

export const supabaseBrowser = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: { "X-Client-Info": "imageai-browser" },
    },
  }
);

console.log("[SUPABASE-BROWSER] ✅ Browser client created successfully", {
  clientUrl: supabaseUrl,
  isConnected: !!supabaseBrowser,
  hasAuth: !!supabaseBrowser.auth,
  hasStorage: !!supabaseBrowser.storage,
  hasFrom: !!supabaseBrowser.from,
  timestamp: new Date().toISOString()
});
