import { useRef, useState, useEffect } from "react";

const testimonials = [
  {
    id: "clara",
    name: "Clara M.",
    role: "Product Manager @TechCorp",
    avatar: "C",
    gradient: "from-blue-500 to-purple-500",
    quote: "Révolutionnaire ! J'ai transformé mes photos de voyage en œuvres d'art. +300% d'engagement sur Instagram !",
    emoji: "🎨"
  },
  {
    id: "nabil",
    name: "Nabil K.",
    role: "Développeur Senior",
    avatar: "N",
    gradient: "from-green-500 to-blue-500",
    quote: "Simple, rapide, exactement ce qu'il me fallait. Mes visuels de marque sont maintenant professionnels.",
    emoji: "⚡️"
  },
  {
    id: "jade",
    name: "Jade L.",
    role: "Freelance Designer",
    avatar: "J",
    gradient: "from-purple-500 to-pink-500",
    quote: "J'ai remplacé Photoshop par cet outil. L'interface est intuitive et les résultats bluffants.",
    emoji: "🎯"
  },
  {
    id: "thomas",
    name: "Thomas R.",
    role: "CEO @StartupXYZ",
    avatar: "T",
    gradient: "from-orange-500 to-red-500",
    quote: "La créativité sans limites. Mon équipe crée des visuels époustouflants en quelques clics.",
    emoji: "🚀"
  }
];

export function TestimonialsSection() {
  const testimonialsTrackRef = useRef<HTMLDivElement | null>(null);
  const testimonialsWrapRef = useRef<HTMLDivElement | null>(null);
  const [hoverTestimonials, setHoverTestimonials] = useState(false);

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
        <div 
          className="mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]" 
          ref={testimonialsWrapRef} 
          onMouseEnter={() => setHoverTestimonials(true)} 
          onMouseLeave={() => setHoverTestimonials(false)}
        >
          <div className="flex gap-6 will-change-transform" ref={testimonialsTrackRef} style={{ width: "max-content" }}>
            {/* Render testimonials twice for seamless loop */}
            {[...testimonials, ...testimonials].map((testimonial, index) => (
              <blockquote key={`${testimonial.id}-${index}`} className="card p-6 text-sm text-[#c7d2e2] min-w-[350px]">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-white font-bold text-lg`}>
                    {testimonial.avatar}
                  </div>
                  <div className="ml-4">
                    <div className="font-semibold text-white">{testimonial.name}</div>
                    <div className="text-xs text-white/60">{testimonial.role}</div>
                  </div>
                </div>
                &quot;{testimonial.quote}&quot; <span>{testimonial.emoji}</span>
              </blockquote>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
