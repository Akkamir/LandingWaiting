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

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[SUPABASE] ⚠️ Variables d'environnement Supabase manquantes. Créez un fichier .env.local avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

console.log("[SUPABASE] 📦 Creating Supabase client with config", {
  url: supabaseUrl || "https://placeholder.supabase.co",
  keyLength: (supabaseAnonKey || "placeholder-key").length,
  authConfig: {
    persistSession: true,
    autoRefreshToken: true
  },
  globalHeaders: { "X-Client-Info": "imageai-browser" }
});

export const supabaseBrowser = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key",
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
  clientUrl: supabaseBrowser.supabaseUrl,
  isConnected: !!supabaseBrowser,
  hasAuth: !!supabaseBrowser.auth,
  hasStorage: !!supabaseBrowser.storage,
  hasFrom: !!supabaseBrowser.from,
  timestamp: new Date().toISOString()
});


