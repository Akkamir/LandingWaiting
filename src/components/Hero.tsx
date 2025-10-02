"use client";
import { useEffect, useRef } from "react";
import lottie from "lottie-web";

type HeroProps = {
  email: string;
  status: "idle" | "loading" | "success" | "error";
  message: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function Hero({ email, status, message, onEmailChange, onSubmit }: HeroProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const animation = lottie.loadAnimation({
      container: containerRef.current,
      renderer: "svg",
      loop: true,
      autoplay: true,
      path: "/Bouncing Square.json",
      rendererSettings: {
        preserveAspectRatio: "xMidYMid meet",
        progressiveLoad: true,
        hideOnTransparent: true,
      },
    });
    return () => {
      animation?.destroy();
    };
  }, []);
  return (
    <section id="hero" className="container py-20 md:py-28">
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            ChroniQuest
          </h1>
          <p className="mt-4 text-white/70 max-w-prose">
            Construis de meilleures habitudes de focus avec une app simple et élégante.
          </p>
          <form className="input-bar mt-6" onSubmit={onSubmit}>
            <input
              type="email"
              className="input-ghost"
              placeholder="Ton email pour la liste d’attente"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              disabled={status === "loading"}
              aria-label="Adresse e-mail"
              required
            />
            <button
              type="submit"
              className="btn-primary btn-lg"
              disabled={status === "loading"}
            >
              {status === "loading" ? "Inscription…" : "Rejoindre la liste"}
            </button>
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
        <div className="relative aspect-video rounded-xl bg-white/[0.04] ring-1 ring-white/10 card flex items-center justify-center overflow-hidden" aria-hidden>
          <div ref={containerRef} className="w-full h-full" />
        </div>
      </div>
    </section>
  );
}


