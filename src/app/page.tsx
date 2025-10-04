"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Toast } from "@/components/ui/Toast";
import { Lightbox } from "@/components/ui/Lightbox";
import Hero from "@/components/Hero";
import LazySection from "@/components/LazySection";
import { useOptimizedAnimations } from "@/components/OptimizedAnimations";
import { useWaitlistForm } from "@/hooks/useWaitlistForm";
import { usePerformance } from "@/hooks/usePerformance";
import { useServiceWorker } from "@/hooks/useServiceWorker";
import LottieTest from "@/components/LottieTest";

// Optimisation: Lazy loading des sections non-critiques
const FeaturesSection = dynamic(() => import("@/components/sections/FeaturesSection").then(mod => ({ default: mod.FeaturesSection })), {
  loading: () => <div className="skeleton h-96 w-full rounded" />
});

const HowItWorksSection = dynamic(() => import("@/components/sections/HowItWorksSection").then(mod => ({ default: mod.HowItWorksSection })), {
  loading: () => <div className="skeleton h-96 w-full rounded" />
});

const TestimonialsSection = dynamic(() => import("@/components/sections/TestimonialsSection").then(mod => ({ default: mod.TestimonialsSection })), {
  loading: () => <div className="skeleton h-96 w-full rounded" />
});

const PricingSection = dynamic(() => import("@/components/sections/PricingSection").then(mod => ({ default: mod.PricingSection })), {
  loading: () => <div className="skeleton h-96 w-full rounded" />
});

const FAQSection = dynamic(() => import("@/components/sections/FAQSection").then(mod => ({ default: mod.FAQSection })), {
  loading: () => <div className="skeleton h-96 w-full rounded" />
});

export default function Home() {
  const [lightbox, setLightbox] = useState<{ open: boolean; src?: string }>({ open: false });
  
  // Hooks personnalisés
  useOptimizedAnimations();
  usePerformance();
  useServiceWorker(); // Service Worker pour le cache des assets
  const waitlistForm = useWaitlistForm();

  // Toast auto-hide
  useEffect(() => {
    if (!waitlistForm.showToast) return;
    const t = setTimeout(() => waitlistForm.setShowToast(false), 2600);
    return () => clearTimeout(t);
  }, [waitlistForm.showToast, waitlistForm.setShowToast, waitlistForm]);

  // Lightbox ESC to close
  useEffect(() => {
    if (!lightbox.open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setLightbox({ open: false }); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox.open]);

  return (
    <div className="min-h-screen flex flex-col">
      <LottieTest />
      <Header />

      <main className="flex-1">
        {/* Section critique - chargée immédiatement */}
        <Hero
          email={waitlistForm.email}
          status={waitlistForm.status}
          message={waitlistForm.message}
          onEmailChange={waitlistForm.setEmail}
          onSubmit={waitlistForm.handleJoin}
        />

        {/* Sections non-critiques - lazy loading avec Intersection Observer */}
        <LazySection rootMargin="100px">
          <FeaturesSection />
        </LazySection>

        <div className="container"><div className="divider" /></div>

        <LazySection rootMargin="100px">
          <HowItWorksSection />
        </LazySection>

        <div className="container"><div className="divider" /></div>

        <LazySection rootMargin="100px">
          <TestimonialsSection />
        </LazySection>

        <div className="container"><div className="divider" /></div>

        <LazySection rootMargin="100px">
          <PricingSection />
        </LazySection>

        <LazySection rootMargin="100px">
          <FAQSection />
        </LazySection>
      </main>

      <Toast 
        show={waitlistForm.showToast} 
        message="✅ Inscription réussie ! Redirection vers le produit..." 
        onClose={() => waitlistForm.setShowToast(false)} 
      />

      <Lightbox 
        open={lightbox.open} 
        src={lightbox.src} 
        onClose={() => setLightbox({ open: false })} 
      />

      <Footer />
    </div>
  );
}
