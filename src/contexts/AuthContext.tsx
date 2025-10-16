"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User, AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createBrowserSupabase } from "@/lib/supabaseClient";

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      setLoading(false);
      return;
    }

    const supabase = createBrowserSupabase();

    supabase.auth.getSession().then(({ data }: { data: { session: { user: User } | null } }) => {
      setUser((data.session?.user as User | undefined) ?? null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
      setUser((session?.user as User | undefined) ?? null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    signOut,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  return ctx;
}


