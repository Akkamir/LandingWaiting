"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import NoSSR from "./NoSSR";
import Head from "next/head";

// Optimisation: Lazy loading de Lottie pour éviter le blocage du rendu initial
const LottieAnimation = dynamic(() => import("./LottieAnimation"), {
  ssr: false, // Pas de rendu côté serveur pour Lottie
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
    </div>
  ),
});

type HeroProps = {
  email: string;
  status: "idle" | "loading" | "success" | "error";
  message: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function Hero({ email, status, message, onEmailChange, onSubmit }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Optimisation: Intersection Observer pour charger Lottie seulement quand visible
  useEffect(() => {
    // Preload du fichier Lottie seulement quand le composant est monté
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = '/Bouncing Square.json';
    link.as = 'fetch';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const container = document.getElementById("lottie-container");
    if (container) observer.observe(container);

    return () => observer.disconnect();
  }, []);
  return (
    <section id="hero" className="container py-20 md:py-28">
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h1 className="hero-title text-4xl md:text-6xl font-bold tracking-tight">
            Transforme tes images<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
              en quelques secondes.
            </span>
          </h1>
          <p className="hero-subtitle mt-6 text-xl text-white/80 max-w-2xl leading-relaxed">
            L&apos;outil IA qui transforme tes photos avec un simple prompt. 
            <strong className="text-white"> Aucune compétence technique requise</strong>.
          </p>
          <form className="input-bar mt-6" onSubmit={onSubmit} role="form" aria-label="Formulaire d'inscription à la liste d'attente">
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <input
                type="email"
                className="input-ghost flex-1 min-h-[48px]"
                placeholder="Ton email pour accéder en priorité"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                disabled={status === "loading"}
                aria-label="Adresse e-mail"
                aria-describedby="email-help"
                aria-invalid={status === "error"}
                required
                autoComplete="email"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
              />
              <button
                type="submit"
                aria-label="Rejoindre la liste d'attente"
                className="btn-primary btn-xl text-base md:text-lg font-bold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 whitespace-nowrap min-h-[48px] min-w-[48px]"
                disabled={status === "loading"}
                aria-describedby="submit-help"
              >
                {status === "loading" ? (
                  <>
                    <span className="sr-only">Inscription en cours</span>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin mr-2" />
                    Inscription…
                  </>
                ) : (
                  <>
                    🚀 Essayer gratuitement
                    <span className="hidden sm:inline"> </span>
                  </>
                )}
              </button>
            </div>
            <div id="email-help" className="sr-only">
              Saisissez votre adresse e-mail pour rejoindre la liste d'attente
            </div>
            <div id="submit-help" className="sr-only">
              Cliquez pour vous inscrire à la liste d'attente
            </div>
          </form>
          {message && (
            <div
              role="status"
              className={`mt-2 text-sm ${status === "error" ? "text-red-300" : "text-green-300"}`}
            >
              {message}
            </div>
          )}
        </div>
        <div 
          id="lottie-container"
          className="lottie-container relative aspect-video rounded-xl bg-white/[0.04] ring-1 ring-white/10 card flex items-center justify-center overflow-hidden" 
          aria-hidden
        >
          {/* Optimisation: Lazy loading conditionnel de Lottie */}
          <NoSSR>
            {isVisible ? (
              <LottieAnimation />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
              </div>
            )}
          </NoSSR>
        </div>
      </div>
    </section>
  );
}


