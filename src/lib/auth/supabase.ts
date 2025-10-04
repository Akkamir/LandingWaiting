// Client Supabase sécurisé pour l'authentification
import { createClient } from '@supabase/supabase-js';
import { AUTH_CONFIG } from './config';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validation de la configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Configuration Supabase manquante. Vérifiez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

if (supabaseUrl.includes('placeholder')) {
  throw new Error('URL Supabase placeholder détectée. Configurez vos vraies clés Supabase.');
}

// Client pour le navigateur (auth anonyme)
export const supabaseBrowser = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: { 
      'X-Client-Info': 'imageai-auth-browser',
      'X-Client-Version': '1.0.0',
    },
  },
});

// Client pour le serveur (avec service role key)
export const supabaseServer = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: { 
      'X-Client-Info': 'imageai-auth-server',
      'X-Client-Version': '1.0.0',
    },
  },
});

// Fonction pour obtenir le client approprié selon le contexte
export function getSupabaseClient(isServer = false) {
  return isServer ? supabaseServer : supabaseBrowser;
}

// Fonction pour valider un token JWT
export async function validateToken(token: string): Promise<{ user: any; error: any }> {
  try {
    const { data, error } = await supabaseServer.auth.getUser(token);
    return { user: data.user, error };
  } catch (err) {
    return { user: null, error: err };
  }
}

// Fonction pour créer un utilisateur avec profil
export async function createUserProfile(user: any) {
  const { data, error } = await supabaseServer
    .from('profiles')
    .insert({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.name || user.email?.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  return { data, error };
}

// Fonction pour obtenir le profil utilisateur
export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseServer
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  return { data, error };
}

// Fonction pour mettre à jour le profil utilisateur
export async function updateUserProfile(userId: string, updates: Partial<any>) {
  const { data, error } = await supabaseServer
    .from('profiles')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}
