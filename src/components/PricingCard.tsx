"use client";
import { useState } from 'react'
import { createBrowserSupabase } from '@/lib/supabaseClient'

interface PricingCardProps {
  title: string
  priceLabel: string
  description?: string
  features: string[]
  priceId: string
}

export function PricingCard({ title, priceLabel, description, features, priceId }: PricingCardProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubscribe() {
    try {
      setLoading(true)
      const supabase = createBrowserSupabase()
      const { data } = await supabase.auth.getSession()
      const token = data.session?.access_token
      const res = await fetch('/api/create-subscription-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ priceId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || 'Erreur ouverture checkout')
      window.location.href = json.url
    } catch (e) {
      // noop UI basic
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 rounded-2xl border border-white/10 bg-white/5">
      <div className="text-lg font-semibold">{title}</div>
      <div className="text-3xl mt-1">{priceLabel}</div>
      {description && <div className="text-white/60 text-sm mt-1">{description}</div>}
      <ul className="mt-4 space-y-2 text-white/80 text-sm">
        {features.map((f) => (
          <li key={f} className="flex items-center gap-2">
            <span>✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        className="btn-primary mt-6 w-full"
        onClick={handleSubscribe}
        disabled={loading}
      >{loading ? '...' : "S'abonner"}</button>
    </div>
  )
}


