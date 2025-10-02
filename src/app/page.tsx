"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import Hero from "@/components/Hero";
import { useOptimizedAnimations, useHoverOptimization } from "@/components/OptimizedAnimations";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [lightbox, setLightbox] = useState<{ open: boolean; src?: string }>({ open: false });
  const testimonialsTrackRef = useRef<HTMLDivElement | null>(null);
  const testimonialsWrapRef = useRef<HTMLDivElement | null>(null);
  const [hoverTestimonials, setHoverTestimonials] = useState(false);

  // Optimisation: Hooks pour animations optimisées
  useOptimizedAnimations();
  const { handleMouseEnter, handleMouseLeave } = useHoverOptimization();

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Email invalide.");
      // Analytics: Track form validation error
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_validation_error', {
          'event_category': 'engagement',
          'event_label': 'waitlist_form'
        });
      }
      return;
    }
    try {
      setStatus("loading");
      setMessage("");
      
      // Analytics: Track form submission start
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit_start', {
          'event_category': 'conversion',
          'event_label': 'waitlist_form'
        });
      }
      
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Erreur inconnue");
      setStatus("success");
      setMessage("Merci, tu es bien inscrit(e) !");
      setShowToast(true);
      setEmail("");
      
      // Analytics: Track successful conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion', {
          'event_category': 'conversion',
          'event_label': 'waitlist_signup',
          'value': 1
        });
      }
    } catch (err: unknown) {
      setStatus("error");
      const fallback = "Une erreur est survenue.";
      if (err instanceof Error) {
        setMessage(err.message || fallback);
      } else {
        setMessage(fallback);
      }
      
      // Analytics: Track form submission error
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'form_submit_error', {
          'event_category': 'error',
          'event_label': 'waitlist_form'
        });
      }
    }
  }

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 2600);
    return () => clearTimeout(t);
  }, [showToast]);

  // Scroll reveal (IntersectionObserver) - Performance optimized
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return; 
    const elements = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
          io.unobserve(entry.target);
        }
      });
    }, { 
      rootMargin: "0px 0px -10% 0px", 
      threshold: 0.15 
    });
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Performance: Track Core Web Vitals
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Track LCP (Largest Contentful Paint)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry && (window as any).gtag) {
        (window as any).gtag('event', 'web_vitals', {
          'event_category': 'performance',
          'event_label': 'LCP',
          'value': Math.round(lastEntry.startTime)
        });
      }
    });
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    
    return () => observer.disconnect();
  }, []);

  // Lightbox ESC to close
  useEffect(() => {
    if (!lightbox.open) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setLightbox({ open: false }); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox.open]);

  // Auto-carousel for testimonials (pause on hover, reduced motion)
  useEffect(() => {
    const prefersReduced = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const track = testimonialsTrackRef.current;
    if (!track || prefersReduced) return;
    let x = 0;
    let raf: number | null = null;
    function step() {
      if (!hoverTestimonials && track) {
        x -= 0.5; // vitesse
        const width = track.scrollWidth / 2; // contenu dupliqué
        if (Math.abs(x) >= width) x = 0;
        track.style.transform = `translateX(${x}px)`;
      }
      raf = requestAnimationFrame(step);
    }
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [hoverTestimonials]);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight" aria-label="ImageAI - Accueil">ImageAI</Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80" role="navigation" aria-label="Navigation principale">
            {[
              { label: 'Produit', href: '#features' },
              { label: 'Prix', href: '#pricing' },
              { label: 'Ressources', href: '#faq' },
              { label: 'Communauté', href: '#testimonials' }
            ].map((item) => (
              <a 
                key={item.label} 
                href={item.href} 
                className="relative group px-1 focus-visible:ring-2 focus-visible:ring-white/40"
                aria-label={`Aller à la section ${item.label}`}
              >
                <span className="group-hover:text-white">{item.label}</span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white/30 transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>
          <a 
            href="/generate" 
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition inline-flex hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40 magnet min-h-[44px] min-w-[44px] items-center justify-center" 
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={(e) => {
            const target = e.currentTarget as HTMLAnchorElement;
            const rect = target.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width/2;
            const relY = e.clientY - rect.top - rect.height/2;
            target.style.transform = `translate(${Math.max(Math.min(relX*0.06,10),-10)}px, ${Math.max(Math.min(relY*0.06,10),-10)}px)`;
            }}
            aria-label="Commencer gratuitement - Transformer mes images"
          >
            <span className="hidden sm:inline">Commencer gratuitement</span>
            <span className="sm:hidden">🚀</span>
          </a>
        </div>
      </header>

      <main className="flex-1">
        <Hero
          email={email}
          status={status}
          message={message}
          onEmailChange={setEmail}
          onSubmit={handleJoin}
        />

        {/* Features */}
        <section id="features" className="container py-20 md:py-28">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi 2,847 créateurs nous font confiance</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">Transforme tes images sans compétences techniques</p>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
            <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition will-change-transform hover:-translate-y-2 hover:ring-[#0099FF]/35">
              <div className="text-4xl mb-4">⚡</div>
              <div className="mb-4 text-xl font-bold tracking-tight text-white">Génération instantanée</div>
              <p className="text-white/70 leading-relaxed">Transforme tes images en quelques secondes. Pas d&apos;attente, pas de complexité.</p>
            </article>
            <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition will-change-transform hover:-translate-y-2 hover:ring-[#0099FF]/35">
              <div className="text-4xl mb-4">🎨</div>
              <div className="mb-4 text-xl font-bold tracking-tight text-white">Styles illimités</div>
              <p className="text-white/70 leading-relaxed">De l&apos;aquarelle au cyberpunk, transforme selon tes envies avec un simple prompt.</p>
            </article>
            <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition will-change-transform hover:-translate-y-2 hover:ring-[#0099FF]/35">
              <div className="text-4xl mb-4">🔒</div>
              <div className="mb-4 text-xl font-bold tracking-tight text-white">Vos images restent privées</div>
              <p className="text-white/70 leading-relaxed">Aucun stockage, aucune réutilisation. Vos créations vous appartiennent.</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>Chiffrement SSL 256-bit</span>
              </div>
            </article>
            <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition will-change-transform hover:-translate-y-2 hover:ring-[#0099FF]/35">
              <div className="text-4xl mb-4">📱</div>
              <div className="mb-4 text-xl font-bold tracking-tight text-white">Tous formats supportés</div>
              <p className="text-white/70 leading-relaxed">PNG, JPG, WebP. Télécharge directement ou partage sur tes réseaux.</p>
            </article>
          </div>
        </section>

        <div className="container"><div className="divider" /></div>

        {/* Testimonials */}
        <section id="testimonials" className="container py-16 md:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ils transforment leurs images</h2>
            <p className="text-lg text-white/70">Découvre comment nos utilisateurs créent des visuels époustouflants</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-sm text-white/60">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>2,847 créateurs actifs</span>
              </span>
              <span>•</span>
              <span>+50,000 images transformées</span>
            </div>
          </div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent" />
            <div className="mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" ref={testimonialsWrapRef} onMouseEnter={()=>setHoverTestimonials(true)} onMouseLeave={()=>setHoverTestimonials(false)}>
            <div className="flex gap-6 will-change-transform" ref={testimonialsTrackRef} style={{ width: "max-content" }}>
              <blockquote className="card p-6 text-sm text-[#c7d2e2] min-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">C</div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">Clara M.</div>
                    <div className="text-xs text-white/60">Product Manager @TechCorp</div>
                  </div>
                </div>
                &quot;Révolutionnaire ! J&apos;ai transformé mes photos de voyage en œuvres d&apos;art. +300% d&apos;engagement sur Instagram !&quot; <span>🎨</span>
              </blockquote>
              <blockquote className="card p-6 text-sm text-[#c7d2e2] min-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">N</div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">Nabil K.</div>
                    <div className="text-xs text-white/60">Développeur Senior</div>
                  </div>
                </div>
                &quot;Simple, rapide, exactement ce qu&apos;il me fallait. Mes visuels de marque sont maintenant professionnels.&quot; <span>⚡️</span>
              </blockquote>
              <blockquote className="card p-6 text-sm text-[#c7d2e2] min-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">J</div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">Jade L.</div>
                    <div className="text-xs text-white/60">Freelance Designer</div>
                  </div>
                </div>
                &quot;J&apos;ai remplacé Photoshop par cet outil. L&apos;interface est intuitive et les résultats bluffants.&quot; <span>🎯</span>
              </blockquote>
              <blockquote className="card p-6 text-sm text-[#c7d2e2] min-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">T</div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">Thomas R.</div>
                    <div className="text-xs text-white/60">CEO @StartupXYZ</div>
                  </div>
                </div>
                &quot;La créativité sans limites. Mon équipe crée des visuels époustouflants en quelques clics.&quot; <span>🚀</span>
              </blockquote>
              {/* duplicate pour boucle parfaite */}
              <blockquote className="card p-6 text-sm text-[#c7d2e2] min-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">C</div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">Clara M.</div>
                    <div className="text-xs text-white/60">Product Manager @TechCorp</div>
                  </div>
                </div>
                &quot;Révolutionnaire ! J&apos;ai transformé mes photos de voyage en œuvres d&apos;art. +300% d&apos;engagement sur Instagram !&quot; <span>🎨</span>
              </blockquote>
              <blockquote className="card p-6 text-sm text-[#c7d2e2] min-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">N</div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">Nabil K.</div>
                    <div className="text-xs text-white/60">Développeur Senior</div>
                  </div>
                </div>
                &quot;Simple, rapide, exactement ce qu&apos;il me fallait. Mes visuels de marque sont maintenant professionnels.&quot; <span>⚡️</span>
              </blockquote>
              <blockquote className="card p-6 text-sm text-[#c7d2e2] min-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-lg">J</div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">Jade L.</div>
                    <div className="text-xs text-white/60">Freelance Designer</div>
                  </div>
                </div>
                &quot;J&apos;ai remplacé Photoshop par cet outil. L&apos;interface est intuitive et les résultats bluffants.&quot; <span>🎯</span>
              </blockquote>
              <blockquote className="card p-6 text-sm text-[#c7d2e2] min-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">T</div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">Thomas R.</div>
                    <div className="text-xs text-white/60">CEO @StartupXYZ</div>
                  </div>
                </div>
                &quot;La créativité sans limites. Mon équipe crée des visuels époustouflants en quelques clics.&quot; <span>🚀</span>
              </blockquote>
            </div>
          </div>
          </div>
        </section>

        <div className="container"><div className="divider" /></div>
        

        {/* Pricing */}
        <section id="pricing" className="container py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Commence gratuitement</h2>
            <p className="text-xl text-white/70">Transforme tes images sans engagement</p>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="card p-8 reveal">
              <h3 className="text-lg font-semibold">Gratuit</h3>
              <p className="mt-2 text-white/70">Pour tester et découvrir les possibilités.</p>
              <div className="mt-6 text-3xl font-semibold">0€</div>
              <ul className="mt-4 text-sm text-white/70 space-y-2">
                <li>5 transformations par jour</li>
                <li>Tous les styles disponibles</li>
                <li>Qualité HD</li>
              </ul>
              <button className="btn-secondary btn-lg mt-6 w-full" onClick={(e)=>{ e.preventDefault(); const form=document.querySelector('form'); (form as HTMLFormElement| null)?.scrollIntoView({behavior:'smooth'}); }}>🚀 Commencer gratuitement</button>
            </div>
            <div className="card p-8 border-gradient reveal">
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-2 text-white/70">Pour les créateurs sérieux.</p>
              <div className="mt-6 text-3xl font-semibold">19€/mo</div>
              <ul className="mt-4 text-sm text-white/70 space-y-2">
                <li>Transformations illimitées</li>
                <li>Qualité 4K</li>
                <li>Styles premium exclusifs</li>
              </ul>
              <button className="btn-primary btn-lg mt-6 w-full" onClick={(e)=>{ e.preventDefault(); const form=document.querySelector('form'); (form as HTMLFormElement| null)?.scrollIntoView({behavior:'smooth'}); }}>💎 Passer Pro</button>
            </div>
            <div className="card p-8 reveal">
              <h3 className="text-lg font-semibold">Business</h3>
              <p className="mt-2 text-white/70">Pour les équipes créatives.</p>
              <div className="mt-6 text-3xl font-semibold">Sur devis</div>
              <ul className="mt-4 text-sm text-white/70 space-y-2">
                <li>API & intégrations</li>
                <li>Support prioritaire</li>
                <li>Brand guidelines personnalisées</li>
              </ul>
              <a className="btn-ghost btn-lg mt-6 w-full" href="#faq">Contacter</a>
            </div>
          </div>
        </section>

        

        {/* FAQ */}
        <section id="faq" className="container pb-24">
          <h2 className="text-2xl font-semibold">Questions fréquentes</h2>
          <details className="card mt-4 p-4">
            <summary className="cursor-pointer">Quels formats d'images sont supportés ?</summary>
            <p className="mt-2 text-sm text-[#8e9bb3]">PNG, JPG, WebP jusqu'à 8 Mo. Téléchargement en HD ou 4K selon votre plan.</p>
          </details>
          <details className="card mt-3 p-4">
            <summary className="cursor-pointer">Mes images sont-elles sécurisées ?</summary>
            <p className="mt-2 text-sm text-[#8e9bb3]">Absolument. Aucun stockage, aucune réutilisation. Vos créations vous appartiennent.</p>
          </details>
          <details className="card mt-3 p-4">
            <summary className="cursor-pointer">Combien de temps prend une transformation ?</summary>
            <p className="mt-2 text-sm text-[#8e9bb3]">Entre 10 et 30 secondes selon la complexité. Vous recevez une notification quand c&apos;est prêt.</p>
          </details>
          <details className="card mt-3 p-4">
            <summary className="cursor-pointer">Puis-je annuler mon abonnement ?</summary>
            <p className="mt-2 text-sm text-[#8e9bb3]">Oui, à tout moment depuis votre compte. Aucun engagement, aucune question.</p>
          </details>
        </section>
      </main>


      {/* Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 card px-4 py-3 text-sm text-white shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
          ✅ Inscription réussie. À très vite !
        </div>
      )}

      {/* Lightbox */}
      {lightbox.open && (
        <button aria-label="Fermer" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" onClick={() => setLightbox({ open: false })}>
          <div className="relative w-[90vw] max-w-3xl aspect-video">
            {lightbox.src && (
              <Image src={lightbox.src} alt="aperçu" fill sizes="90vw" style={{ objectFit: "contain" }} priority />
            )}
          </div>
        </button>
      )}

      <footer className="container py-12 text-center text-sm text-neutral-500">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span>© {new Date().getFullYear()} ImageAI</span>
            <span>•</span>
            <a href="/privacy" className="hover:text-white transition-colors">Confidentialité</a>
            <span>•</span>
            <a href="/terms" className="hover:text-white transition-colors">Conditions</a>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>Service sécurisé</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
