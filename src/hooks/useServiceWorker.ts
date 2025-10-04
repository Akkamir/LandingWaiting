"use client";
import { useEffect } from "react";

export function useServiceWorker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Enregistrer le Service Worker seulement en production
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Service Worker enregistré avec succès:", registration.scope);
        })
        .catch((error) => {
          console.error("[SW] Échec de l'enregistrement du Service Worker:", error);
        });
    }
  }, []);
}
