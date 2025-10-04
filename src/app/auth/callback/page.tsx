'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserSupabase } from '@/lib/supabaseClient'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    (async () => {
      console.log('[AUTH-CALLBACK] 🔄 Processing magic link callback')
      
      const supabase = createBrowserSupabase()
      
      try {
        const { error } = await supabase.auth.getSession() // avale le hash ou échange le code
        if (error) {
          console.error('[CALLBACK] getSession error:', error.message)
          router.replace('/login?error=callback_error')
          return
        }
        // Redirection vers la page d'accueil - laisse l'utilisateur choisir
        router.replace('/')
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
