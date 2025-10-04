"use client";
import { useEffect, useRef } from "react";

// Optimisation: Composant Lottie séparé pour lazy loading
export default function LottieAnimation() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Optimisation: Chargement asynchrone de Lottie seulement quand nécessaire
    const loadLottie = async () => {
      if (!containerRef.current) return;
      
      try {
        // Import dynamique de Lottie pour réduire le bundle initial
        const lottie = (await import("lottie-web")).default;
        
        const animation = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg", // SVG plus léger que canvas
          loop: true,
          autoplay: true,
          path: "/Bouncing Square.json",
          rendererSettings: {
            preserveAspectRatio: "xMidYMid meet",
            progressiveLoad: true, // Chargement progressif
            hideOnTransparent: true,
          },
        });

        // Optimisation: Pause l'animation si l'utilisateur préfère moins de mouvement
        const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (prefersReduced) {
          animation.pause();
        }

        return () => {
          animation?.destroy();
        };
      } catch (error) {
        console.warn("Lottie animation failed to load:", error);
        // Fallback: afficher un placeholder si Lottie échoue
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="w-full h-full flex items-center justify-center text-white/60">
              <div class="text-4xl">🎯</div>
            </div>
          `;
        }
      }
    };

    loadLottie();
  }, []);

  return <div ref={containerRef} className="w-full h-full" />;
}
