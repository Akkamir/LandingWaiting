const pricingPlans = [
  {
    name: "Gratuit",
    description: "Pour tester et découvrir les possibilités.",
    price: "0€",
    features: [
      "5 transformations par jour",
      "Tous les styles disponibles",
      "Qualité HD"
    ],
    cta: "🚀 Commencer gratuitement",
    ctaClass: "btn-secondary btn-lg mt-6 w-full"
  },
  {
    name: "Pro",
    description: "Pour les créateurs sérieux.",
    price: "19€/mo",
    features: [
      "Transformations illimitées",
      "Qualité 4K",
      "Styles premium exclusifs"
    ],
    cta: "💎 Passer Pro",
    ctaClass: "btn-primary btn-lg mt-6 w-full",
    featured: true
  },
  {
    name: "Business",
    description: "Pour les équipes créatives.",
    price: "Sur devis",
    features: [
      "API & intégrations",
      "Support prioritaire",
      "Brand guidelines personnalisées"
    ],
    cta: "Contacter",
    ctaClass: "btn-ghost btn-lg mt-6 w-full"
  }
];

export function PricingSection() {
  const handleCtaClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const form = document.querySelector('form');
    (form as HTMLFormElement | null)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="pricing" className="container py-20">
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
          <span className="text-blue-400 text-sm font-medium">🎉 Accès prioritaire pour les premiers inscrits</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Commence gratuitement</h2>
        <p className="text-xl text-white/70">Transforme tes images sans engagement. <strong className="text-white">5 transformations gratuites par jour</strong></p>
      </div>
      
      <div className="mt-8 grid gap-6 sm:grid-cols-3">
        {pricingPlans.map((plan, index) => (
          <div 
            key={plan.name}
            className={`card p-8 reveal ${plan.featured ? 'border-gradient' : ''}`}
          >
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="mt-2 text-white/70">{plan.description}</p>
            <div className="mt-6 text-3xl font-semibold">{plan.price}</div>
            <ul className="mt-4 text-sm text-white/70 space-y-2">
              {plan.features.map((feature, featureIndex) => (
                <li key={featureIndex}>{feature}</li>
              ))}
            </ul>
            {plan.name === "Business" ? (
              <a className={plan.ctaClass} href="#faq">{plan.cta}</a>
            ) : (
              <button 
                className={plan.ctaClass} 
                onClick={handleCtaClick}
              >
                {plan.cta}
              </button>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
