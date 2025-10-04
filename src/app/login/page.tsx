"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

import { createBrowserSupabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");


  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const startTime = Date.now();
    setStatus("loading");
    setMessage("");
    
    console.log("[LOGIN] ===== STARTING LOGIN PROCESS =====", { 
      email,
      timestamp: new Date().toISOString(),
      formData: { email },
      eventType: e.type,
      target: e.target
    });
    
    // Créer le client Supabase
    const supabase = createBrowserSupabase();
    
    if (!supabase || !supabase.auth) {
      console.error("[LOGIN] ❌ SUPABASE CLIENT NOT AVAILABLE", { 
        supabase: !!supabase,
        auth: supabase?.auth ? 'available' : 'missing',
        timestamp: new Date().toISOString()
      });
      setStatus("error");
      setMessage("Client Supabase non disponible. Veuillez recharger la page.");
      return;
    }
    
    try {
      console.log("[LOGIN] ✅ Configuration OK, proceeding with Supabase auth", {
        email,
        supabaseClientExists: !!supabase,
        supabaseClientAuth: !!supabase?.auth,
        timestamp: new Date().toISOString()
      });

      
      // Test de connectivité réseau détaillé
      if (typeof window !== "undefined" && typeof navigator !== "undefined" && typeof location !== "undefined") {
        try {
          console.log("[LOGIN] Network diagnostics before request", {
            online: navigator.onLine,
            connection: (navigator as any).connection ? {
              effectiveType: (navigator as any).connection.effectiveType,
              downlink: (navigator as any).connection.downlink,
              rtt: (navigator as any).connection.rtt,
              saveData: (navigator as any).connection.saveData
            } : 'not available',
            currentOrigin: location.origin,
            protocol: location.protocol,
            hostname: location.hostname,
            port: location.port
          });
        } catch (err) {
          console.warn("[LOGIN] Network diagnostics failed", err);
        }
      }
      
      // Préparation de la requête - rediriger vers le callback
      // ⚠️ En local, évite que ce soit vide et évite les espaces/retours de ligne
      const redirectTo =
        typeof window !== "undefined"
          ? `${location.origin}/auth/callback` // ex: http://localhost:3000/auth/callback
          : undefined;

      console.log('[LOGIN] emailRedirectTo =', redirectTo);

      try {
        console.log('[LOGIN] 🔄 Calling supabase.auth.signInWithOtp...');
        const { data, error } = await supabase.auth.signInWithOtp({
          email: email.trim(),                // évite espaces
          options: { emailRedirectTo: redirectTo },
        });

        if (error) {
          console.error('[LOGIN] ❌ SUPABASE AUTH ERROR', { error });
          setStatus('error');
          setMessage(`Erreur Supabase: ${error.message}`);
          return;
        }

        console.log('[LOGIN] ✅ OTP sent', { data });
        setStatus('sent');
        setMessage('Lien magique envoyé. Vérifie ta boîte mail.');
      } catch (supabaseError) {
        console.error('[LOGIN] ❌ SUPABASE CALL FAILED', supabaseError);
        setStatus('error');
        setMessage(`Erreur de connexion Supabase: ${
          supabaseError instanceof Error ? supabaseError.message : 'Erreur inconnue'
        }`);
        return;
      }
      
    } catch (err) {
      const errorDuration = Date.now() - startTime;
      console.error("[LOGIN] ❌ UNEXPECTED ERROR", { 
        error: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined,
        name: err instanceof Error ? err.name : undefined,
        type: typeof err,
        duration: `${errorDuration}ms`,
        timestamp: new Date().toISOString()
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


