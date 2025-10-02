const faqItems = [
  {
    question: "Quels formats d'images sont supportés ?",
    answer: "PNG, JPG, WebP jusqu'à 8 Mo. Téléchargement en HD ou 4K selon votre plan."
  },
  {
    question: "Mes images sont-elles sécurisées ?",
    answer: "Absolument. Aucun stockage, aucune réutilisation. Vos créations vous appartiennent."
  },
  {
    question: "Combien de temps prend une transformation ?",
    answer: "Entre 10 et 30 secondes selon la complexité. Vous recevez une notification quand c'est prêt."
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer: "Oui, à tout moment depuis votre compte. Aucun engagement, aucune question."
  }
];

export function FAQSection() {
  return (
    <section id="faq" className="container pb-24">
      <h2 className="text-2xl font-semibold">Questions fréquentes</h2>
      {faqItems.map((item, index) => (
        <details key={index} className="card mt-4 p-4">
          <summary className="cursor-pointer">{item.question}</summary>
          <p className="mt-2 text-sm text-[#8e9bb3]">{item.answer}</p>
        </details>
      ))}
    </section>
  );
}
