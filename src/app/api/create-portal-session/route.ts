import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getStripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
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

    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle()

    const stripeCustomerId = sub?.stripe_customer_id
    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'Aucun customer Stripe' }, { status: 400 })
    }

    const stripe = getStripe()
    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
    })

    return NextResponse.json({ url: portal.url })
  } catch (e) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}


