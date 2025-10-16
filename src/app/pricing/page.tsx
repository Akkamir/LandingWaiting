import { PricingCard } from '@/components/PricingCard'

export const dynamic = 'force-static'

export default function PricingPage() {
  const basicId = process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_ID || ''
  const proId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ID || ''

  return (
    <div className="container py-16">
      <h1 className="text-3xl font-semibold text-center">Choisissez votre plan</h1>
      <div className="grid md:grid-cols-2 gap-6 mt-10">
        <PricingCard
          title="Basic"
          priceLabel="10€/mois"
          description="Pour démarrer"
          features={["50 générations / mois", "Support standard"]}
          priceId={basicId}
        />
        <PricingCard
          title="Premium"
          priceLabel="25€/mois"
          description="Pour aller plus loin"
          features={["200 générations / mois", "Support prioritaire"]}
          priceId={proId}
        />
      </div>
    </div>
  )
}


