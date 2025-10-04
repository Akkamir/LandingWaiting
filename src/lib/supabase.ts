import { createClient } from '@supabase/supabase-js'

// Validation des variables d'environnement
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[SUPABASE] Variables d\'environnement manquantes. L\'authentification sera désactivée.')
}

// Création du client Supabase avec gestion d'erreur
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null

// Types pour TypeScript
export type Database = {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          user_id: string
          input_url: string
          output_url: string
          prompt: string
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          input_url: string
          output_url: string
          prompt: string
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          input_url?: string
          output_url?: string
          prompt?: string
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      waiting: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
      }
    }
  }
}
