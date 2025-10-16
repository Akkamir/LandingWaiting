"use client";
import { useEffect, useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabaseClient'

type SubRow = {
  stripe_price_id: string | null
  status: string | null
  quota_limit: number | null
  quota_used: number | null
}

export function SubscriptionStatus() {
  const [sub, setSub] = useState<SubRow | null>(null)

  useEffect(() => {
    (async () => {
      const supabase = createBrowserSupabase()
      const { data: session } = await supabase.auth.getSession()
      const user = session.session?.user
      if (!user) return
      const { data } = await supabase
        .from('subscriptions')
        .select('stripe_price_id,status,quota_limit,quota_used')
        .eq('user_id', user.id)
        .maybeSingle()
      setSub(data || null)
    })()
  }, [])

  if (!sub) {
    return (
      <div className="rounded-lg border border-white/10 p-3 text-white/70">Aucun abonnement</div>
    )
  }

  const remaining = Math.max(0, (sub.quota_limit || 0) - (sub.quota_used || 0))
  const planLabel = sub.stripe_price_id === process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ID ? 'Plan Pro' : 'Plan Basic'

  return (
    <div className="rounded-lg border border-white/10 p-3 text-white/80">
      {planLabel} - {remaining}/{sub.quota_limit ?? 0} générations restantes ce mois
    </div>
  )
}


