import { createClient } from "@supabase/supabase-js";

// Client Supabase pour le navigateur (auth anonyme)
// Assure-toi d'ajouter NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("[SUPABASE] 🔧 Initializing Supabase client", {
  timestamp: new Date().toISOString(),
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValue: supabaseUrl,
  urlLength: supabaseUrl?.length,
  keyLength: supabaseAnonKey?.length,
  keyPrefix: supabaseAnonKey?.substring(0, 15),
  isPlaceholder: supabaseUrl?.includes('placeholder'),
  isHttps: supabaseUrl?.startsWith('https://'),
  isValidUrl: supabaseUrl ? (() => {
    try { new URL(supabaseUrl); return true; } catch { return false; }
  })() : false,
  nodeEnv: process.env.NODE_ENV,
  allSupabaseEnvVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
});

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
  console.error("[SUPABASE] ❌ Variables d'environnement Supabase manquantes ou invalides", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isPlaceholder: supabaseUrl?.includes('placeholder'),
    message: "Créez un fichier .env.local avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY"
  });
  throw new Error("Configuration Supabase manquante. Vérifiez vos variables d'environnement.");
}

console.log("[SUPABASE] 📦 Creating Supabase client with config", {
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

console.log("[SUPABASE] ✅ Client created successfully", {
  clientUrl: supabaseUrl,
  isConnected: !!supabaseBrowser,
  hasAuth: !!supabaseBrowser.auth,
  hasStorage: !!supabaseBrowser.storage,
  hasFrom: !!supabaseBrowser.from,
  timestamp: new Date().toISOString()
});


