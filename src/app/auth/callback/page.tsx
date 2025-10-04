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
        // Parse le hash (ou gère PKCE) et persiste la session
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('[AUTH-CALLBACK] 📋 Session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          error: error?.message,
          urlHash: window.location.hash,
          urlSearch: window.location.search
        })
        
        if (error) {
          console.error('[AUTH-CALLBACK] ❌ Session error:', error)
          router.replace('/login?error=session_error')
          return
        }
        
        if (session?.user) {
          console.log('[AUTH-CALLBACK] ✅ User authenticated, redirecting to /generate')
          // URL propre + suite de ton flow
          router.replace('/generate')
        } else {
          console.log('[AUTH-CALLBACK] ⚠️ No session found, redirecting to /login')
          router.replace('/login')
        }
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
