const steps = [
  {
    number: "01",
    title: "Ajoutez votre photo",
    description: "Glissez-déposez ou sélectionnez votre image. Formats supportés : JPG, PNG, WebP (max 8 Mo).",
    icon: "📸",
    details: "Détection automatique des visages et optimisation de la qualité"
  },
  {
    number: "02", 
    title: "Choisissez un style",
    description: "Sélectionnez un preset intelligent ou décrivez votre transformation. 5 styles optimisés disponibles.",
    icon: "🎨",
    details: "Amélioration visage, Nettoyage arrière-plan, Éclairage portrait, Restauration vintage, Découpe produit"
  },
  {
    number: "03",
    title: "Téléchargez le résultat",
    description: "Récupérez votre image transformée en HD/4K. Formats optimisés pour Instagram, LinkedIn, Marketplaces.",
    icon: "💾",
    details: "Résultats en 10-30 secondes avec prévisualisation en temps réel"
  }
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="container py-20 md:py-28">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Comment ça marche
        </h2>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Transformez vos photos en 3 étapes simples. Aucune compétence technique requise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        {steps.map((step, index) => (
          <div key={index} className="relative">
            {/* Ligne de connexion */}
            {index < steps.length - 1 && (
              <div className="hidden md:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-blue-500/50 to-transparent transform translate-x-6 z-0" />
            )}
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                  {step.number}
                </div>
                <div className="text-4xl">{step.icon}</div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
              </h3>
              
              <p className="text-white/70 leading-relaxed mb-4">
                {step.description}
              </p>
              
              <div className="text-sm text-blue-400 font-medium">
                {step.details}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA après les étapes */}
      <div className="text-center mt-16">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-6 py-3 text-white/80 text-sm">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span>Prêt à transformer vos photos ?</span>
        </div>
      </div>
    </section>
  );
}
