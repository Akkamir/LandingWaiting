import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log('[MW]', request.nextUrl.pathname)
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Ensures session is loaded/refreshed and stored in HttpOnly cookies
  const { data: sessionData } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname
  const isProtectedPage = pathname.startsWith('/dashboard')
  const isProtectedApi = pathname.startsWith('/api')

  // Protéger pages (rediriger vers /login)
  if (isProtectedPage && !sessionData.session) {
    const url = new URL('/login', request.url)
    url.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(url)
  }

  // Protéger API (401 JSON)
  if (isProtectedApi && !sessionData.session) {
    return new Response(JSON.stringify({ error: 'Non authentifié' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    })
  }

  return supabaseResponse
}

export const config = { 
  matcher: ['/(.*)'] 
}