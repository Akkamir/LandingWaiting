'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    (async () => {
      console.log('[AUTH-CALLBACK] 🔄 Processing magic link callback')
      
      const supabase = createClientComponentClient()
      
      try {
        const { error } = await supabase.auth.getSession() // avale le hash ou échange le code
        if (error) console.error('[CALLBACK] getSession error:', error.message)
        router.replace('/generate') // URL propre
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
