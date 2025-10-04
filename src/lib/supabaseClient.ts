import { createClient } from "@supabase/supabase-js";

// Client Supabase pour le navigateur (auth anonyme)
// Assure-toi d'ajouter NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("[SUPABASE] Initializing client", {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValue: supabaseUrl,
  keyLength: supabaseAnonKey?.length,
  isPlaceholder: supabaseUrl?.includes('placeholder')
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Variables d'environnement Supabase manquantes. Créez un fichier .env.local avec NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

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

console.log("[SUPABASE] Client created", {
  url: supabaseBrowser.supabaseUrl,
  isConnected: !!supabaseBrowser
});


