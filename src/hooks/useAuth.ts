"use client";
import { useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  const ctx = useAuthContext();
  return (
    ctx ?? { user: null, loading: false, isAuthenticated: false, signOut: async () => {} }
  );
}
