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
  allSupabaseEnvVars: Object.keys(process.env).filter(k => k.includes('SUPABASE')),
  // Debug: vérifier toutes les variables d'environnement
  allEnvVars: Object.keys(process.env).filter(k => k.includes('NEXT_PUBLIC')),
  // Debug: vérifier si on est côté client ou serveur
  isClient: typeof window !== 'undefined',
  isServer: typeof window === 'undefined'
});

// Créer un client Supabase conditionnel
let supabaseBrowser: any;

// Vérifier si on est côté client
const isClient = typeof window !== 'undefined';

// Ne créer le client que côté client pour éviter les problèmes SSR
if (!isClient) {
  console.log("[SUPABASE] ⚠️ Server-side: creating placeholder client");
  supabaseBrowser = {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithOtp: () => Promise.resolve({ data: null, error: { message: "Server-side client" } }),
      signOut: () => Promise.resolve({ error: null })
    }
  };
} else if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder') || supabaseUrl.includes('your-project')) {
  console.error("[SUPABASE] ❌ Variables d'environnement Supabase manquantes ou invalides", {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    isPlaceholder: supabaseUrl?.includes('placeholder'),
    isYourProject: supabaseUrl?.includes('your-project'),
    urlValue: supabaseUrl,
    message: "Créez un fichier .env.local avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY"
  });
  
  // En mode build, créer un client placeholder pour éviter l'échec du build
  if (process.env.NODE_ENV === 'production' && !isClient) {
    console.warn("[SUPABASE] ⚠️ Build mode: création d'un client placeholder");
    supabaseBrowser = {
      auth: {
        signInWithOtp: () => Promise.resolve({ data: null, error: { message: "Configuration Supabase manquante" } })
      }
    };
  } else {
    throw new Error("Configuration Supabase manquante. Vérifiez vos variables d'environnement.");
  }
} else {
console.log("[SUPABASE] 📦 Creating Supabase client with config", {
  url: supabaseUrl,
  keyLength: supabaseAnonKey.length,
  isClient,
  isServer: !isClient,
  authConfig: {
    persistSession: true,
    autoRefreshToken: true
  },
  globalHeaders: { "X-Client-Info": "imageai-browser" }
});

  supabaseBrowser = createClient(
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
}

export { supabaseBrowser };

console.log("[SUPABASE] ✅ Client created successfully", {
  clientUrl: supabaseUrl,
  isConnected: !!supabaseBrowser,
  hasAuth: !!supabaseBrowser.auth,
  hasStorage: !!supabaseBrowser.storage,
  hasFrom: !!supabaseBrowser.from,
  timestamp: new Date().toISOString()
});


