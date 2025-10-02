// Variants de hero basés sur les jobs utilisateur identifiés

export const heroVariants = {
  restoration: {
    headline: "Redonne vie à vos photos anciennes",
    subheadline: "Restaurez automatiquement vos souvenirs endommagés. Réparation des rayures, amélioration des couleurs, et restauration des détails perdus.",
    cta: "Restaurer mes photos",
    ctaSecondary: "Voir des exemples",
    icon: "📸",
    targetJob: "restoration"
  },
  social: {
    headline: "Transformez vos photos en quelques clics",
    subheadline: "Améliorez vos photos de profil et posts sociaux. Nettoyage d'arrière-plan, éclairage professionnel, et retouches instantanées.",
    cta: "Améliorer mes photos",
    ctaSecondary: "Essayer gratuitement",
    icon: "✨",
    targetJob: "social"
  },
  seller: {
    headline: "Créez des photos produit professionnelles",
    subheadline: "Transformez vos photos produits pour le e-commerce. Arrière-plans nets, éclairage parfait, et formats optimisés pour toutes les plateformes.",
    cta: "Optimiser mes produits",
    ctaSecondary: "Voir les formats",
    icon: "🛍️",
    targetJob: "product"
  }
};

// Microcopy pour les prompts
export const promptExamples = {
  restoration: [
    "Restaure cette photo ancienne, répare les rayures et améliore les couleurs",
    "Améliore la netteté et restaure les détails de ce portrait vintage",
    "Corrige les dommages et restaure l'éclat original de cette photo"
  ],
  social: [
    "Nettoie l'arrière-plan et améliore l'éclairage pour un look professionnel",
    "Améliore la qualité et l'éclairage de ce portrait",
    "Retouche légère pour un look naturel et professionnel"
  ],
  product: [
    "Crée un arrière-plan blanc net pour ce produit e-commerce",
    "Améliore l'éclairage et la netteté de cette photo produit",
    "Optimise cette image pour un marketplace, arrière-plan professionnel"
  ]
};

// États vides avec guidance
export const emptyStates = {
  noImage: {
    title: "Ajoutez votre photo",
    description: "Glissez-déposez une image ou cliquez pour sélectionner",
    action: "Choisir une image"
  },
  noPrompt: {
    title: "Décrivez la transformation",
    description: "Soyez précis : 'Nettoyer l'arrière-plan', 'Améliorer l'éclairage', etc.",
    examples: "Exemples : 'Restaure cette photo ancienne', 'Arrière-plan blanc professionnel'"
  },
  processing: {
    title: "Transformation en cours...",
    description: "Votre image est en cours de traitement. Cela prend généralement 10-30 secondes.",
    progress: "Analyse de l'image..."
  }
};
