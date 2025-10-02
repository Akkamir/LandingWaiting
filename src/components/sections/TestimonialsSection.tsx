const testimonials = [
  {
    name: "Sarah M.",
    role: "Créatrice de contenu",
    avatar: "👩‍💼",
    content: "J'ai transformé mes photos de profil en 30 secondes. L'IA a automatiquement amélioré l'éclairage et retiré l'arrière-plan. Incroyable !",
    rating: 5,
    verified: true
  },
  {
    name: "Marc L.",
    role: "E-commerçant",
    avatar: "👨‍💻",
    content: "Mes photos produits sont maintenant professionnelles. Plus besoin de photographe, l'IA fait tout. ROI immédiat !",
    rating: 5,
    verified: true
  },
  {
    name: "Emma K.",
    role: "Influenceuse",
    avatar: "👩‍🎨",
    content: "Les styles prédéfinis sont parfaits pour Instagram. Mes stories ont un look professionnel maintenant.",
    rating: 5,
    verified: true
  }
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="container py-20">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Ce que disent nos utilisateurs
        </h2>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Plus de 2,800 créateurs nous font confiance pour transformer leurs photos
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <article 
            key={index}
            className="card p-6 hover:ring-2 hover:ring-blue-500/20 transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">{testimonial.avatar}</div>
              <div>
                <div className="font-semibold text-white">{testimonial.name}</div>
                <div className="text-sm text-white/60">{testimonial.role}</div>
              </div>
              {testimonial.verified && (
                <div className="ml-auto">
                  <span className="text-green-400 text-xs">✓ Vérifié</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1 mb-3">
              {[...Array(testimonial.rating)].map((_, i) => (
                <span key={i} className="text-yellow-400">★</span>
              ))}
            </div>
            
            <blockquote className="text-white/80 italic">
              "{testimonial.content}"
            </blockquote>
          </article>
        ))}
      </div>
      
      {/* Badge de confiance */}
      <div className="mt-12 text-center">
        <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 rounded-full px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-green-400">🔒</span>
            <span className="text-sm text-white/80">Données sécurisées</span>
          </div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="flex items-center gap-2">
            <span className="text-blue-400">⚡</span>
            <span className="text-sm text-white/80">Traitement rapide</span>
          </div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">🎯</span>
            <span className="text-sm text-white/80">Résultats garantis</span>
          </div>
        </div>
      </div>
    </section>
  );
}