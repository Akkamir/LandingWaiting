"use client";
import { useEffect, useRef, useState } from "react";
import lottie from "lottie-web";

interface LottieAnimationProps {
  className?: string;
}

export default function LottieAnimation({ className }: LottieAnimationProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Optimisation: Chargement lazy avec Intersection Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isLoaded && !hasError) {
            loadAnimation();
          }
        });
      },
      { 
        rootMargin: "50px", // Commence à charger 50px avant d'être visible
        threshold: 0.1 
      }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [isLoaded, hasError]);

  const loadAnimation = async () => {
    try {
      // Optimisation: Fetch du JSON Lottie (plus robuste en production)
      const response = await fetch("/Bouncing Square.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const animationData = await response.json();
      
      if (containerRef.current) {
        animationRef.current = lottie.loadAnimation({
          container: containerRef.current,
          renderer: "svg", // SVG plus léger que canvas
          loop: true,
          autoplay: true,
          animationData: animationData,
          // Optimisations de performance
          rendererSettings: {
            preserveAspectRatio: "xMidYMid slice",
            progressiveLoad: true, // Chargement progressif
            hideOnTransparent: true
          }
        });

        // Optimisation: will-change seulement pendant l'animation
        containerRef.current.style.willChange = "transform";
        
        animationRef.current.addEventListener("complete", () => {
          if (containerRef.current) {
            containerRef.current.style.willChange = "auto";
          }
        });

        setIsLoaded(true);
      }
    } catch (error) {
      console.error("Erreur de chargement Lottie:", error);
      console.error("URL tentée:", "/Bouncing Square.json");
      setHasError(true);
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`lottie-container ${className || ""}`}
      style={{
        aspectRatio: "16/9",
        contain: "layout style paint", // Optimisation de rendu
        minHeight: "200px" // Prévention CLS
      }}
    >
      {!isLoaded && !hasError && (
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}
      {hasError && (
        <div className="w-full h-full flex items-center justify-center text-white/60">
          <div className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-sm">Animation Lottie</div>
            <div className="text-xs text-white/40 mt-1">Chargement en cours...</div>
          </div>
        </div>
      )}
    </div>
  );
}