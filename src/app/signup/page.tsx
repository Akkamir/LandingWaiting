"use client";
import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4">Créer un compte</h1>
        <AuthForm defaultMode="signup" />
        <div className="mt-4 text-sm text-white/70">
          Déjà un compte ? <Link className="underline" href="/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}


