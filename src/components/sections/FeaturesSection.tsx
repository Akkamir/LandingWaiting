const features = [
  {
    icon: "⚡",
    title: "Résultats en 10-30 secondes",
    description: "Transformations instantanées avec prévisualisation en temps réel. Pas d'attente, pas de complexité.",
    benefit: "Gain de temps"
  },
  {
    icon: "🎯",
    title: "Styles prédéfinis intelligents",
    description: "5 styles optimisés : Amélioration visage, Nettoyage arrière-plan, Éclairage portrait, Restauration vintage, Découpe produit.",
    benefit: "Simplicité"
  },
  {
    icon: "🔒",
    title: "Confidentialité garantie",
    description: "Suppression automatique, pas d'entraînement sur vos photos, chiffrement SSL. Vos images vous appartiennent.",
    badge: "Suppression auto",
    benefit: "Confiance"
  },
  {
    icon: "📐",
    title: "Formats plateforme optimisés",
    description: "Instagram, LinkedIn, Marketplaces. Formats automatiques avec recadrage intelligent pour chaque plateforme.",
    benefit: "Polyvalence"
  },
  {
    icon: "💎",
    title: "Qualité professionnelle",
    description: "Résultats HD/4K, détection automatique des visages, préservation des détails importants.",
    benefit: "Qualité"
  },
  {
    icon: "💰",
    title: "Prix transparent",
    description: "1 crédit = 1 transformation HD. Pas de surprise, pas d'engagement. Commencez gratuitement.",
    benefit: "Transparence"
  }
];

export function FeaturesSection() {
  return (
    <section id="features" className="container py-20 md:py-28">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Pourquoi 2,847 créateurs nous font confiance
        </h2>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Transformez vos photos sans compétences techniques. Résultats professionnels en quelques clics.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {features.map((feature, index) => (
          <article 
            key={index}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition will-change-transform hover:-translate-y-2 hover:ring-[#0099FF]/35"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="text-3xl">{feature.icon}</div>
              <div className="flex-1">
                <div className="text-lg font-bold tracking-tight text-white mb-2">
                  {feature.title}
                </div>
                <div className="text-xs text-blue-400 font-medium mb-2">
                  {feature.benefit}
                </div>
              </div>
            </div>
            <p className="text-white/70 leading-relaxed text-sm">
              {feature.description}
            </p>
            {feature.badge && (
              <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                <span>{feature.badge}</span>
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
