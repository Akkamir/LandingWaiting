import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { priceId } = await req.json()
    if (!priceId) {
      return NextResponse.json({ error: 'priceId requis' }, { status: 400 })
    }

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )

    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined
    if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const { data: u } = await supabase.auth.getUser(token)
    const user = u?.user
    if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const stripe = getStripe()

    // Récupérer/Créer customer
    let stripeCustomerId: string | null = null
    const { data: subRow } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    stripeCustomerId = subRow?.stripe_customer_id ?? null
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { user_id: user.id },
      })
      stripeCustomerId = customer.id
      await supabase
        .from('subscriptions')
        .upsert({ user_id: user.id, stripe_customer_id: stripeCustomerId }, { onConflict: 'user_id' })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/pricing`,
      allow_promotion_codes: true,
      metadata: { user_id: user.id, price_id: priceId },
    })

    return NextResponse.json({ url: session.url })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


