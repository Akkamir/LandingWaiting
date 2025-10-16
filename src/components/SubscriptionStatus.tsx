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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    const supabase = createBrowserSupabase()

    async function fetchSub() {
      const { data: session } = await supabase.auth.getSession()
      const user = session.session?.user
      if (!user) { if (mounted) setLoading(false); return }
      const { data } = await supabase
        .from('subscriptions')
        .select('stripe_price_id,status,quota_limit,quota_used')
        .eq('user_id', user.id)
        .maybeSingle()
      if (mounted) {
        setSub(data || null)
        setLoading(false)
      }
    }

    fetchSub()

    // Refresh au retour du checkout: si URL contient success, re-fetch plusieurs fois
    if (typeof window !== 'undefined' && window.location.search.includes('success')) {
      const retries = [1000, 2000, 4000]
      retries.forEach((delay) => setTimeout(fetchSub, delay))
    }

    const i = setInterval(fetchSub, 30000)
    return () => { mounted = false; clearInterval(i) }
  }, [])

  if (loading) {
    return (
      <div className="rounded-lg border border-white/10 p-3 text-white/70">Chargement...</div>
    )
  }

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


