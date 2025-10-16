"use client";
import { useCallback, useMemo, useState } from "react";
import { createBrowserSupabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

type Mode = "login" | "signup";

function isValidEmail(email: string) {
  return /.+@.+\..+/.test(email);
}

function isStrongPassword(pwd: string) {
  return pwd.length >= 8;
}

export default function AuthForm({ defaultMode = "login" as Mode }: { defaultMode?: Mode }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!isValidEmail(email)) return false;
    if (!isStrongPassword(password)) return false;
    if (mode === "signup" && password !== confirm) return false;
    return true;
  }, [email, password, confirm, mode]);

  const onSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) return;
    setLoading(true);
    try {
      const supabase = createBrowserSupabase();
      // Déterminer la page de redirection post-auth
      const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const intended = urlParams?.get('redirectedFrom') || '/generate';
      if (typeof window !== 'undefined') localStorage.setItem('post_auth_redirect', intended);
      if (mode === "signup") {
        const redirectTo = typeof window !== 'undefined' ? (() => {
          const u = new URL(`${location.origin}/auth/callback`);
          if (urlParams?.get('redirectedFrom')) u.searchParams.set('redirectedFrom', urlParams.get('redirectedFrom')!);
          return u.toString();
        })() : undefined;
        const { error } = await supabase.auth.signUp({ 
          email: email.trim(), 
          password,
          options: { emailRedirectTo: redirectTo }
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
      }
      router.replace(intended);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [mode, email, password, canSubmit, router]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const supabase = createBrowserSupabase();
      const redirectTo = typeof window !== 'undefined' ? (() => {
        const sp = new URLSearchParams(window.location.search);
        const u = new URL(`${location.origin}/auth/callback`);
        if (sp.get('redirectedFrom')) u.searchParams.set('redirectedFrom', sp.get('redirectedFrom')!);
        const intended = sp.get('redirectedFrom') || '/generate';
        localStorage.setItem('post_auth_redirect', intended);
        return u.toString();
      })() : undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: { prompt: 'select_account' }
        }
      });
      if (error) throw error;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="w-full max-w-md card p-6 rounded-2xl border border-white/10 bg-white/5">
      <div className="flex gap-2 mb-4" role="tablist" aria-label="Choisir une action">
        <button
          role="tab"
          aria-selected={mode === "login"}
          className={`btn-sm ${mode === "login" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setMode("login")}
        >
          Connexion
        </button>
        <button
          role="tab"
          aria-selected={mode === "signup"}
          className={`btn-sm ${mode === "signup" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setMode("signup")}
        >
          Inscription
        </button>
      </div>

      {/* Option 1: Continuer avec Google */}
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={loading}
        aria-label="Continuer avec Google"
        className="btn-primary w-full justify-center min-h-[48px] flex items-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5" aria-hidden>
          <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12 s5.373-12,12-12c3.059,0,5.841,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24 s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
          <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.841,1.154,7.961,3.039 l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
          <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36 c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.024C9.505,39.556,16.227,44,24,44z"/>
          <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.793,2.237-2.231,4.166-3.994,5.571 c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.996,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
        </svg>
        Continuer avec Google
      </button>

      {/* Séparateur visuel */}
      <div className="my-4 flex items-center gap-3 text-white/50 text-xs">
        <div className="h-px bg-white/10 flex-1" />
        <span>ou</span>
        <div className="h-px bg-white/10 flex-1" />
      </div>

      {/* Option 2: Email + Mot de passe ou Magic Link existant */}
      <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full min-h-[48px] bg-white/5 rounded-full px-4 py-2 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Votre e‑mail"
          autoComplete="email"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full min-h-[48px] bg-white/5 rounded-full px-4 py-2 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Mot de passe (min. 8 caractères)"
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />
        {mode === "signup" && (
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full min-h-[48px] bg-white/5 rounded-full px-4 py-2 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            placeholder="Confirmer le mot de passe"
            autoComplete="new-password"
          />
        )}

        {error && <div className="text-sm text-red-300">{error}</div>}

        <button disabled={loading || !canSubmit} className="btn-primary btn-xl w-full justify-center min-h-[48px]">
          {loading ? "Chargement…" : mode === "signup" ? "Créer mon compte" : "Se connecter"}
        </button>
      </form>
    </div>
  );
}


