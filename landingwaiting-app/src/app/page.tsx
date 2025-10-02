"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import Hero from "@/components/Hero";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "design" | "cms" | "collab">("ai");
  const [lightbox, setLightbox] = useState<{ open: boolean; src?: string }>({ open: false });
  const testimonialsTrackRef = useRef<HTMLDivElement | null>(null);
  const testimonialsWrapRef = useRef<HTMLDivElement | null>(null);
  const [hoverTestimonials, setHoverTestimonials] = useState(false);

  async function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setMessage("Email invalide.");
      return;
    }
    try {
      setStatus("loading");
      setMessage("");
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
    } catch (err: unknown) {
      setStatus("error");
      const fallback = "Une erreur est survenue.";
      if (err && typeof err === "object" && "message" in err && typeof (err as any).message === "string") {
        setMessage((err as { message: string }).message || fallback);
      } else {
        setMessage(fallback);
      }
    }
  }

  useEffect(() => {
    if (!showToast) return;
    const t = setTimeout(() => setShowToast(false), 2600);
    return () => clearTimeout(t);
  }, [showToast]);

  // Scroll reveal (IntersectionObserver)
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
    }, { rootMargin: "0px 0px -10% 0px", threshold: 0.15 });
    elements.forEach((el) => io.observe(el));
    return () => io.disconnect();
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
          <a className="font-semibold tracking-tight">ChroniQuest</a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/80">
            {['Produit','Prix','Ressources','Communauté'].map((l) => (
              <a key={l} href="#" className="relative group px-1 focus-visible:ring-2 focus-visible:ring-white/40">
                <span className="group-hover:text-white">{l}</span>
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white/30 transition-all group-hover:w-full" />
              </a>
            ))}
          </nav>
          <a href="#hero" className="rounded-full border border-white/15 bg-white/10 px-5 py-2 text-sm font-medium text-white/90 transition hidden sm:inline-flex hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40 magnet" onMouseMove={(e) => {
            const target = e.currentTarget as HTMLAnchorElement;
            const rect = target.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width/2;
            const relY = e.clientY - rect.top - rect.height/2;
            target.style.transform = `translate(${Math.max(Math.min(relX*0.06,10),-10)}px, ${Math.max(Math.min(relY*0.06,10),-10)}px)`;
          }} onMouseLeave={(e)=>{ (e.currentTarget as HTMLAnchorElement).style.transform = 'translate(0,0)'; }}>Commencer gratuitement</a>
        </div>
      </header>

      <main className="flex-1">
        <Hero />

        {/* Features */}
        <section id="features" className="container py-20 md:py-28">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4 md:gap-8">
            <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition will-change-transform hover:-translate-y-0.5 hover:ring-[#0099FF]/35">
              <div className="mb-3 text-lg font-semibold tracking-tight text-white">Sessions de focus</div>
              <p className="text-sm md:text-base text-white/70">Planifie, lance, et mesure l’impact de tes sessions.</p>
            </article>
            <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition will-change-transform hover:-translate-y-0.5 hover:ring-[#0099FF]/35">
              <div className="mb-3 text-lg font-semibold tracking-tight text-white">Progression motivante</div>
              <p className="text-sm md:text-base text-white/70">Des objectifs clairs et des paliers pour garder le rythme.</p>
            </article>
            <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition will-change-transform hover:-translate-y-0.5 hover:ring-[#0099FF]/35">
              <div className="mb-3 text-lg font-semibold tracking-tight text-white">Partage & équipes</div>
              <p className="text-sm md:text-base text-white/70">Rejoins un groupe, partage tes avancées, reste accountable.</p>
            </article>
            <article className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition will-change-transform hover:-translate-y-0.5 hover:ring-[#0099FF]/35">
              <div className="mb-3 text-lg font-semibold tracking-tight text-white">Stats & insights</div>
              <p className="text-sm md:text-base text-white/70">Mesure ton temps utile, détecte les tendances, ajuste ton rythme.</p>
            </article>
          </div>
        </section>

        <div className="container"><div className="divider" /></div>

        {/* Testimonials */}
        <section className="container py-16 md:py-24">
          <div className="mb-6 text-center text-xs font-medium uppercase tracking-[0.2em] text-white/60">ILS EN PARLENT</div>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-black to-transparent" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-black to-transparent" />
            <div className="mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" ref={testimonialsWrapRef} onMouseEnter={()=>setHoverTestimonials(true)} onMouseLeave={()=>setHoverTestimonials(false)}>
            <div className="flex gap-4 will-change-transform" ref={testimonialsTrackRef} style={{ width: "max-content" }}>
              <blockquote className="card p-5 text-sm text-[#c7d2e2] min-w-[280px]">“Interface clean, motivation au top, j’ai enfin un rythme.” <span>💙</span><div className="mt-2 text-xs text-[#8e9bb3]">— Clara, PM</div></blockquote>
              <blockquote className="card p-5 text-sm text-[#c7d2e2] min-w-[280px]">“Simple, rapide, exactement ce qu’il me fallait.” <span>⚡️</span><div className="mt-2 text-xs text-[#8e9bb3]">— Nabil, Dev</div></blockquote>
              <blockquote className="card p-5 text-sm text-[#c7d2e2] min-w-[280px]">“J’ai remplacé mes timers par ChroniQuest.” <span>⏱️</span><div className="mt-2 text-xs text-[#8e9bb3]">— Jade, Indé</div></blockquote>
              <blockquote className="card p-5 text-sm text-[#c7d2e2] min-w-[280px]">“La petite dose de gamification qu’il faut.” <span>🏅</span><div className="mt-2 text-xs text-[#8e9bb3]">— Thomas, Founder</div></blockquote>
              {/* duplicate pour boucle parfaite */}
              <blockquote className="card p-5 text-sm text-[#c7d2e2] min-w-[280px]">“Interface clean, motivation au top, j’ai enfin un rythme.” <span>💙</span><div className="mt-2 text-xs text-[#8e9bb3]">— Clara, PM</div></blockquote>
              <blockquote className="card p-5 text-sm text-[#c7d2e2] min-w-[280px]">“Simple, rapide, exactement ce qu’il me fallait.” <span>⚡️</span><div className="mt-2 text-xs text-[#8e9bb3]">— Nabil, Dev</div></blockquote>
              <blockquote className="card p-5 text-sm text-[#c7d2e2] min-w-[280px]">“J’ai remplacé mes timers par ChroniQuest.” <span>⏱️</span><div className="mt-2 text-xs text-[#8e9bb3]">— Jade, Indé</div></blockquote>
              <blockquote className="card p-5 text-sm text-[#c7d2e2] min-w-[280px]">“La petite dose de gamification qu’il faut.” <span>🏅</span><div className="mt-2 text-xs text-[#8e9bb3]">— Thomas, Founder</div></blockquote>
            </div>
          </div>
          </div>
        </section>

        <div className="container"><div className="divider" /></div>

        {/* Tabs section */}
        <section className="container py-20">
          <div className="tabs">
            <button className="tab-pill" aria-selected={activeTab === "ai"} onClick={() => setActiveTab("ai")}>AI</button>
            <button className="tab-pill" aria-selected={activeTab === "design"} onClick={() => setActiveTab("design")}>Design</button>
            <button className="tab-pill" aria-selected={activeTab === "cms"} onClick={() => setActiveTab("cms")}>CMS</button>
            <button className="tab-pill" aria-selected={activeTab === "collab"} onClick={() => setActiveTab("collab")}>Collab</button>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 items-center">
            <div className="card p-8 min-h-64 reveal">
              {activeTab === "ai" && <div className="transition-opacity">Modèles d’IA pour estimer l’effort, suggestions d’objectifs, priorisation.</div>}
              {activeTab === "design" && <div className="transition-opacity">Composants élégants, thèmes sombres/clair, layouts modulaires.</div>}
              {activeTab === "cms" && <div className="transition-opacity">Contenus pilotés, notes, ressources et templates réutilisables.</div>}
              {activeTab === "collab" && <div className="transition-opacity">Groupes privés, suivi partagé, mention et réactions.</div>}
            </div>
            <div className="card aspect-video min-h-64 reveal" />
          </div>
        </section>

        

        {/* Pricing */}
        <section id="pricing" className="container py-20">
          <h2 className="text-2xl font-semibold">Tarifs simples</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="card p-8 reveal">
              <h3 className="text-lg font-semibold">Starter</h3>
              <p className="mt-2 text-white/70">Pour découvrir et installer la routine.</p>
              <div className="mt-6 text-3xl font-semibold">0€</div>
              <ul className="mt-4 text-sm text-white/70 space-y-2">
                <li>Sessions illimitées</li>
                <li>Notes personnelles</li>
                <li>Stats 7 jours</li>
              </ul>
              <button className="btn-secondary btn-lg mt-6 w-full" onClick={(e)=>{ e.preventDefault(); const form=document.querySelector('form'); (form as HTMLFormElement| null)?.scrollIntoView({behavior:'smooth'}); }}>Commencer</button>
            </div>
            <div className="card p-8 border-gradient reveal">
              <h3 className="text-lg font-semibold">Pro</h3>
              <p className="mt-2 text-white/70">Pour progresser vite et rester motivé.</p>
              <div className="mt-6 text-3xl font-semibold">9€/mo</div>
              <ul className="mt-4 text-sm text-white/70 space-y-2">
                <li>Toutes les features Starter</li>
                <li>Objectifs & saisons</li>
                <li>Stats 90 jours</li>
              </ul>
              <button className="btn-primary btn-lg mt-6 w-full" onClick={(e)=>{ e.preventDefault(); const form=document.querySelector('form'); (form as HTMLFormElement| null)?.scrollIntoView({behavior:'smooth'}); }}>Rejoindre Pro</button>
            </div>
            <div className="card p-8 reveal">
              <h3 className="text-lg font-semibold">Business</h3>
              <p className="mt-2 text-white/70">Pour équipes et organisations.</p>
              <div className="mt-6 text-3xl font-semibold">Sur devis</div>
              <ul className="mt-4 text-sm text-white/70 space-y-2">
                <li>Groupes privés & rapports</li>
                <li>Support prioritaire</li>
                <li>Export & intégrations</li>
              </ul>
              <a className="btn-ghost btn-lg mt-6 w-full" href="#faq">Contacter</a>
            </div>
          </div>
        </section>

        

        {/* FAQ */}
        <section id="faq" className="container pb-24">
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <details className="card mt-4 p-4">
            <summary className="cursor-pointer">Quand l’accès sera-t-il disponible ?</summary>
            <p className="mt-2 text-sm text-[#8e9bb3]">Nous ouvrons une alpha privée aux personnes sur la liste d’attente.</p>
          </details>
          <details className="card mt-3 p-4">
            <summary className="cursor-pointer">Le produit sera-t-il gratuit ?</summary>
            <p className="mt-2 text-sm text-[#8e9bb3]">Alpha gratuite, puis plan gratuit + options premium.</p>
          </details>
        </section>
      </main>

      {/* Logos */}
      <section className="container pb-16">
        <div className="text-center text-xs uppercase tracking-widest text-neutral-500">Bientôt compatible avec</div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 opacity-70">
          <div className="card py-4 text-center">Notion</div>
          <div className="card py-4 text-center">Google Calendar</div>
          <div className="card py-4 text-center">Slack</div>
          <div className="card py-4 text-center">Linear</div>
        </div>
      </section>

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
        © {new Date().getFullYear()} ChroniQuest
      </footer>
    </div>
  );
}
