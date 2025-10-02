import { BeforeAfterSlider } from "@/components/ui/BeforeAfterSlider";

const examples = [
  {
    id: "portrait-enhancement",
    title: "Amélioration de portrait",
    beforeLabel: "Original",
    afterLabel: "Amélioré",
    beforeImage: "/examples/portrait-before.jpg",
    afterImage: "/examples/portrait-after.jpg",
    description: "Amélioration automatique des détails du visage, éclairage et netteté",
    category: "Portrait"
  },
  {
    id: "background-clean",
    title: "Nettoyage d'arrière-plan",
    beforeLabel: "Arrière-plan encombré",
    afterLabel: "Arrière-plan net",
    beforeImage: "/examples/background-before.jpg", 
    afterImage: "/examples/background-after.jpg",
    description: "Suppression automatique de l'arrière-plan pour un look professionnel",
    category: "E-commerce"
  },
  {
    id: "vintage-restore",
    title: "Restauration vintage",
    beforeLabel: "Photo ancienne",
    afterLabel: "Restaurée",
    beforeImage: "/examples/vintage-before.jpg",
    afterImage: "/examples/vintage-after.jpg", 
    description: "Restauration des couleurs, réparation des rayures et amélioration des détails",
    category: "Restauration"
  },
  {
    id: "product-optimization",
    title: "Optimisation produit",
    beforeLabel: "Photo produit basique",
    afterLabel: "Photo e-commerce",
    beforeImage: "/examples/product-before.jpg",
    afterImage: "/examples/product-after.jpg",
    description: "Arrière-plan professionnel et éclairage optimisé pour les marketplaces",
    category: "E-commerce"
  },
  {
    id: "lighting-enhancement",
    title: "Amélioration éclairage",
    beforeLabel: "Éclairage faible",
    afterLabel: "Éclairage professionnel",
    beforeImage: "/examples/lighting-before.jpg",
    afterImage: "/examples/lighting-after.jpg",
    description: "Correction automatique de l'éclairage et des ombres",
    category: "Portrait"
  }
];

export function ExamplesSection() {
  return (
    <section id="examples" className="container py-20 md:py-28">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Résultats en action
        </h2>
        <p className="text-xl text-white/70 max-w-3xl mx-auto">
          Découvrez comment nos utilisateurs transforment leurs photos. Glissez pour comparer avant/après.
        </p>
      </div>

      <div className="space-y-16">
        {examples.map((example, index) => (
          <div key={example.id} className="group">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white">
                      {example.title}
                    </div>
                    <div className="text-sm text-blue-400 font-medium">
                      {example.category}
                    </div>
                  </div>
                </div>
                
                <p className="text-white/70 leading-relaxed mb-6">
                  {example.description}
                </p>
                
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span>Résultat en 15 secondes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    <span>Qualité HD</span>
                  </div>
                </div>
              </div>
              
              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <BeforeAfterSlider
                  beforeImage={example.beforeImage}
                  afterImage={example.afterImage}
                  beforeLabel={example.beforeLabel}
                  afterLabel={example.afterLabel}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA après les exemples */}
      <div className="text-center mt-16">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-white mb-4">
            Prêt à transformer vos photos ?
          </h3>
          <p className="text-white/70 mb-6">
            Rejoignez 2,847 créateurs qui transforment leurs images quotidiennement
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-primary btn-lg">
              🚀 Essayer gratuitement
            </button>
            <button className="btn-secondary btn-lg">
              📸 Voir plus d'exemples
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
