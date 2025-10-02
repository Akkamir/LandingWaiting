"use client";
import { useEffect, useRef } from "react";

// Optimisation: Hook pour gérer will-change dynamiquement et éviter les reflows
export function useOptimizedAnimations() {
  const elementsRef = useRef<Set<HTMLElement>>(new Set());

  useEffect(() => {
    // Optimisation: Intersection Observer pour les animations
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target as HTMLElement;
          
          if (entry.isIntersecting) {
            // Ajoute will-change seulement quand l'élément devient visible
            element.style.willChange = "transform, opacity";
            elementsRef.current.add(element);
          } else {
            // Retire will-change quand l'élément n'est plus visible
            element.style.willChange = "auto";
            elementsRef.current.delete(element);
          }
        });
      },
      { 
        rootMargin: "0px 0px -10% 0px", 
        threshold: 0.15 
      }
    );

    // Observer tous les éléments avec la classe reveal
    const revealElements = document.querySelectorAll(".reveal");
    revealElements.forEach((el) => observer.observe(el));

    // Cleanup
    return () => {
      observer.disconnect();
      // Retire will-change de tous les éléments observés
      const currentElements = elementsRef.current;
      currentElements.forEach((element) => {
        element.style.willChange = "auto";
      });
    };
  }, []);

  return elementsRef.current;
}

// Optimisation: Hook pour les animations de hover avec will-change temporaire
export function useHoverOptimization() {
  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    target.style.willChange = "transform";
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    const target = e.currentTarget as HTMLElement;
    target.style.willChange = "auto";
  };

  return { handleMouseEnter, handleMouseLeave };
}
