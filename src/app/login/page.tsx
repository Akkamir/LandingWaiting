"use client";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");
    
    console.log("[LOGIN] Starting login process", { email });
    
    // Vérifier si Supabase est configuré
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log("[LOGIN] Environment check", { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseAnonKey,
      urlValue: supabaseUrl,
      isPlaceholder: supabaseUrl?.includes('placeholder')
    });
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      console.error("[LOGIN] Configuration manquante", { supabaseUrl, supabaseAnonKey });
      setStatus("error");
      setMessage("Configuration Supabase manquante. Veuillez configurer NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local");
      return;
    }
    
    try {
      console.log("[LOGIN] Attempting Supabase auth.signInWithOtp", {
        email,
        redirectTo: typeof window !== "undefined" ? `${location.origin}/generate` : undefined,
        supabaseUrl,
        currentOrigin: typeof window !== "undefined" ? location.origin : undefined,
        userAgent: typeof window !== "undefined" ? navigator.userAgent : undefined
      });
      
      // Test de connectivité réseau basique
      if (typeof window !== "undefined") {
        console.log("[LOGIN] Network check", {
          online: navigator.onLine,
          connection: (navigator as any).connection?.effectiveType || 'unknown'
        });
      }
      
      const { data, error } = await supabaseBrowser.auth.signInWithOtp({ 
        email, 
        options: { 
          emailRedirectTo: typeof window !== "undefined" ? `${location.origin}/generate` : undefined 
        } 
      });
      
      console.log("[LOGIN] Supabase response", { data, error });
      
      if (error) {
        console.error("[LOGIN] Supabase auth error", { 
          error: error.message, 
          code: error.status,
          details: error
        });
        setStatus("error");
        setMessage(`Erreur Supabase: ${error.message}`);
        return;
      }
      
      console.log("[LOGIN] Success - OTP sent", { data });
      setStatus("sent");
      setMessage("Lien magique envoyé. Vérifie ta boîte mail.");
      
    } catch (err) {
      console.error("[LOGIN] Unexpected error", { 
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined
      });
      setStatus("error");
      setMessage(`Erreur inattendue: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md card p-6 rounded-2xl border border-white/10 bg-white/5">
        <h1 className="text-2xl font-semibold">Connexion</h1>
        <p className="text-white/70 mt-1">Recevez un lien magique par e‑mail.</p>
        
        {(!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')) && (
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-300 text-sm">
              ⚠️ Configuration Supabase requise. Créez un fichier <code className="bg-black/20 px-1 rounded">.env.local</code> avec vos clés Supabase.
            </p>
          </div>
        )}
        <form onSubmit={handleLogin} className="mt-6 flex flex-col gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full min-h-[48px] bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Votre e‑mail"
          />
          <button disabled={status === "loading"} className="btn-primary btn-xl w-full justify-center min-h-[48px]">
            {status === "loading" ? "Envoi…" : "Envoyer le lien"}
          </button>
        </form>
        {message && (
          <p className={`mt-3 text-sm ${status === "error" ? "text-red-300" : "text-green-300"}`}>{message}</p>
        )}
        <div className="mt-6 text-sm text-white/70">
          <Link className="underline" href="/">← Retour</Link>
        </div>
      </div>
    </div>
  );
}


