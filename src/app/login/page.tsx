"use client";
import { useState, useEffect } from "react";
import { supabaseBrowser } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  // Logs de diagnostic au montage du composant
  useEffect(() => {
    console.log("[LOGIN] Component mounted", {
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? navigator.userAgent : undefined,
      location: typeof window !== "undefined" && typeof location !== "undefined" ? location.href : undefined,
      referrer: typeof window !== "undefined" && typeof document !== "undefined" ? document.referrer : undefined
    });

    // Vérification des variables d'environnement au montage
    console.log("[LOGIN] Environment variables check on mount", {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 10)}...` : undefined,
      NODE_ENV: process.env.NODE_ENV,
      allEnvKeys: Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
    });

    // Test de connectivité réseau
    if (typeof window !== "undefined" && typeof navigator !== "undefined") {
      try {
        console.log("[LOGIN] Network diagnostics", {
          online: navigator.onLine,
          connection: (navigator as any).connection ? {
            effectiveType: (navigator as any).connection.effectiveType,
            downlink: (navigator as any).connection.downlink,
            rtt: (navigator as any).connection.rtt
          } : 'not available',
          cookieEnabled: navigator.cookieEnabled,
          doNotTrack: navigator.doNotTrack
        });
      } catch (err) {
        console.warn("[LOGIN] Network diagnostics failed", err);
      }
    }
  }, []);

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
    
    // Vérifier si Supabase est configuré
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log("[LOGIN] Environment variables detailed check", { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseAnonKey,
      urlValue: supabaseUrl,
      urlLength: supabaseUrl?.length,
      keyLength: supabaseAnonKey?.length,
      keyPrefix: supabaseAnonKey?.substring(0, 10),
      isPlaceholder: supabaseUrl?.includes('placeholder'),
      isHttps: supabaseUrl?.startsWith('https://'),
      allEnvVars: Object.keys(process.env).filter(k => k.includes('SUPABASE'))
    });
    
    if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('placeholder')) {
      console.error("[LOGIN] ❌ CONFIGURATION MANQUANTE", { 
        supabaseUrl, 
        supabaseAnonKey,
        reason: !supabaseUrl ? 'NO_URL' : !supabaseAnonKey ? 'NO_KEY' : 'PLACEHOLDER_URL'
      });
      setStatus("error");
      setMessage("Configuration Supabase manquante. Veuillez configurer NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local");
      return;
    }
    
    try {
      console.log("[LOGIN] ✅ Configuration OK, proceeding with Supabase auth", {
        email,
        supabaseUrl,
        supabaseClientExists: !!supabaseBrowser,
        supabaseClientAuth: !!supabaseBrowser?.auth,
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
      
      // Préparation de la requête
      const redirectTo = typeof window !== "undefined" && typeof location !== "undefined" ? `${location.origin}/generate` : undefined;
      const requestPayload = { 
        email, 
        options: { 
          emailRedirectTo: redirectTo 
        } 
      };
      
      console.log("[LOGIN] 📤 Sending Supabase auth.signInWithOtp request", {
        payload: requestPayload,
        supabaseUrl,
        redirectTo,
        requestTimestamp: new Date().toISOString()
      });
      
      const requestStartTime = Date.now();
      const { data, error } = await supabaseBrowser.auth.signInWithOtp(requestPayload);
      const requestDuration = Date.now() - requestStartTime;
      
      console.log("[LOGIN] 📥 Supabase response received", { 
        data, 
        error,
        requestDuration: `${requestDuration}ms`,
        responseTimestamp: new Date().toISOString(),
        hasData: !!data,
        hasError: !!error,
        errorType: error?.name,
        errorMessage: error?.message,
        errorStatus: error?.status
      });
      
      if (error) {
        console.error("[LOGIN] ❌ SUPABASE AUTH ERROR", { 
          error: error.message, 
          code: error.status,
          name: error.name,
          details: error,
          stack: error.stack,
          requestDuration: `${requestDuration}ms`
        });
        setStatus("error");
        setMessage(`Erreur Supabase: ${error.message}`);
        return;
      }
      
      console.log("[LOGIN] ✅ SUCCESS - OTP sent successfully", { 
        data,
        requestDuration: `${requestDuration}ms`,
        totalDuration: `${Date.now() - startTime}ms`
      });
      setStatus("sent");
      setMessage("Lien magique envoyé. Vérifie ta boîte mail.");
      
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


