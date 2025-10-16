import Stripe from 'stripe'

export function getStripe() {
  const secret = process.env.STRIPE_SECRET_KEY
  if (!secret) throw new Error('STRIPE_SECRET_KEY manquant')
  return new Stripe(secret, {
    apiVersion: '2024-06-20',
    appInfo: { name: 'ImageAI', version: '1.0.0' },
  })
}

export const STRIPE_PRICE_LIMITS: Record<string, number> = {
  // Renseigner via variables d'env côté app
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_BASIC_ID || '']: 50,
  [process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ID || '']: 200,
}


