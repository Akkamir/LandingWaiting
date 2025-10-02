"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { TestimonialsSection } from "@/components/sections/TestimonialsSection";
import { PricingSection } from "@/components/sections/PricingSection";
import { FAQSection } from "@/components/sections/FAQSection";
import { Toast } from "@/components/ui/Toast";
import { Lightbox } from "@/components/ui/Lightbox";
import Hero from "@/components/Hero";
import { useOptimizedAnimations } from "@/components/OptimizedAnimations";
import { useWaitlistForm } from "@/hooks/useWaitlistForm";
import { usePerformance } from "@/hooks/usePerformance";

export default function Home() {
  const [lightbox, setLightbox] = useState<{ open: boolean; src?: string }>({ open: false });
  
  // Hooks personnalisés
  useOptimizedAnimations();
  usePerformance();
  const waitlistForm = useWaitlistForm();

  // Toast auto-hide
  useEffect(() => {
    if (!waitlistForm.showToast) return;
    const t = setTimeout(() => waitlistForm.setShowToast(false), 2600);
    return () => clearTimeout(t);
  }, [waitlistForm.showToast]);

  // Lightbox ESC to close
  useEffect(() => {
    if (!lightbox.open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setLightbox({ open: false }); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox.open]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Hero
          email={waitlistForm.email}
          status={waitlistForm.status}
          message={waitlistForm.message}
          onEmailChange={waitlistForm.setEmail}
          onSubmit={waitlistForm.handleJoin}
        />

                    <FeaturesSection />

                    <div className="container"><div className="divider" /></div>

                    <HowItWorksSection />

                    <div className="container"><div className="divider" /></div>

                    <TestimonialsSection />

                    <div className="container"><div className="divider" /></div>

        <div className="container"><div className="divider" /></div>

        <PricingSection />

        <FAQSection />
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
