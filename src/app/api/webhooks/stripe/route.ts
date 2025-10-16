import { NextRequest, NextResponse } from 'next/server'
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { getStripe, STRIPE_PRICE_LIMITS } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  const stripe = getStripe()
  const sig = req.headers.get('stripe-signature')
  if (!sig) return NextResponse.json({ error: 'Signature manquante' }, { status: 400 })

  const buf = Buffer.from(await req.arrayBuffer())

  let event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Signature invalide' }, { status: 400 })
  }

  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  })

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const subscriptionId = session.subscription as string | undefined
        const priceId = session.metadata?.price_id || session?.line_items?.[0]?.price?.id || null
        const userId = session.metadata?.user_id
        if (!userId || !subscriptionId) break

        const quota = STRIPE_PRICE_LIMITS[priceId || ''] || 50
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: subscriptionId,
          stripe_price_id: priceId || null,
          status: 'active',
          quota_limit: quota,
          quota_used: 0,
        }, { onConflict: 'user_id' })
        break
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const sub = event.data.object as any
        const customerId = sub.customer as string
        const quota = STRIPE_PRICE_LIMITS[sub.items?.data?.[0]?.price?.id || ''] || 50

        // Récupérer user_id depuis le customer Stripe (métadonnées posées à la création)
        let userId: string | null = null
        try {
          const customer = await stripe.customers.retrieve(customerId)
          if (customer && typeof customer === 'object') {
            const meta: any = (customer as any).metadata || {}
            if (meta.user_id && typeof meta.user_id === 'string') userId = meta.user_id
          }
        } catch {}

        // Fallback: tenter de retrouver un user_id existant via stripe_customer_id
        if (!userId) {
          const { data: existing } = await supabase
            .from('subscriptions')
            .select('user_id')
            .eq('stripe_customer_id', customerId)
            .maybeSingle()
          userId = existing?.user_id ?? null
        }

        // Si on n'a toujours pas de user_id (ex: ordre d'événements), ne pas échouer le webhook
        if (!userId) {
          // On attendra 'checkout.session.completed' pour créer la ligne (qui possède metadata.user_id)
          break
        }

        // Upsert en incluant user_id (NOT NULL)
        await supabase.from('subscriptions').upsert({
          user_id: userId as string, // peut être null si non retrouvable; la DB lèvera une erreur et sera catchée
          stripe_subscription_id: sub.id,
          stripe_customer_id: customerId,
          stripe_price_id: sub.items?.data?.[0]?.price?.id || null,
          status: sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          quota_limit: quota,
        }, { onConflict: 'stripe_subscription_id' })
        break
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any
        await supabase.from('subscriptions').update({ status: 'canceled' }).eq('stripe_subscription_id', sub.id)
        break
      }
      case 'invoice.payment_succeeded': {
        const inv = event.data.object as any
        const subId = inv.subscription as string
        if (subId) {
          await supabase.from('subscriptions').update({ quota_used: 0 }).eq('stripe_subscription_id', subId)
        }
        break
      }
    }
  } catch (e) {
    console.error('[stripe webhook] error', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}


