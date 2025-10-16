'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    (async () => {
      const supabase = createBrowserSupabase()
      const href = typeof window !== 'undefined' ? window.location.href : null
      const code = href ? new URL(href).searchParams.get('code') : null
      try {
        // 1) Si la session est déjà présente (middleware ou retour OAuth), ne pas ré-échanger
        const { data: s1, error: sErr } = await supabase.auth.getSession()
        if (sErr) {
          console.error('[CALLBACK] getSession error:', sErr.message)
          router.replace('/login?error=callback_error')
          return
        }
        if (!s1?.session && code) {
          // 2) Pas de session et présence d'un code => échanger une seule fois
          const { error } = await supabase.auth.exchangeCodeForSession(href!)
          if (error) {
            console.error('[CALLBACK] exchangeCode error:', error.message)
            router.replace('/login?error=callback_error')
            return
          }
        }
        const href = typeof window !== 'undefined' ? window.location.href : null
        const sp = href ? new URL(href).searchParams : null
        const intended = sp?.get('redirectedFrom') || (typeof window !== 'undefined' ? localStorage.getItem('post_auth_redirect') : null) || '/generate'
        if (typeof window !== 'undefined') localStorage.removeItem('post_auth_redirect')
        router.replace(intended)
      } catch (error) {
        console.error('[AUTH-CALLBACK] ❌ Unexpected error:', error)
        router.replace('/login?error=callback_error')
      }
    })()
  }, [router])

  return (
    <div className="min-h-screen grid place-items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white/70">Connexion en cours...</p>
      </div>
    </div>
  )
}
