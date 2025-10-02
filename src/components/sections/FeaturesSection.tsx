const features = [
  {
    icon: "⚡",
    title: "Génération instantanée",
    description: "Transforme tes images en quelques secondes. Pas d'attente, pas de complexité."
  },
  {
    icon: "🎨",
    title: "Styles illimités",
    description: "De l'aquarelle au cyberpunk, transforme selon tes envies avec un simple prompt."
  },
  {
    icon: "🔒",
    title: "Vos images restent privées",
    description: "Aucun stockage, aucune réutilisation. Vos créations vous appartiennent.",
    badge: "Chiffrement SSL 256-bit"
  },
  {
    icon: "📱",
    title: "Tous formats supportés",
    description: "PNG, JPG, WebP. Télécharge directement ou partage sur tes réseaux."
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
          Transforme tes images sans compétences techniques
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-4">
        {features.map((feature, index) => (
          <article 
            key={index}
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_6px_24px_rgba(0,0,0,0.35)] ring-1 ring-white/5 transition will-change-transform hover:-translate-y-2 hover:ring-[#0099FF]/35"
          >
            <div className="text-4xl mb-4">{feature.icon}</div>
            <div className="mb-4 text-xl font-bold tracking-tight text-white">
              {feature.title}
            </div>
            <p className="text-white/70 leading-relaxed">
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
