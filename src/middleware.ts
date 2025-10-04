import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/auth/supabase';
import { logSecurityEvent } from '@/lib/auth/security';

// Routes protégées
const protectedRoutes = ['/generate', '/profile', '/settings'];
const authRoutes = ['/auth/login', '/auth/register'];

// Fonction pour vérifier l'authentification
async function verifyAuth(request: NextRequest): Promise<{ user: any; error: any }> {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { user: null, error: 'No token provided' };
    }

    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    
    if (error) {
      logSecurityEvent('middleware_auth_error', { error, path: request.nextUrl.pathname }, 'warn');
      return { user: null, error };
    }

    return { user, error: null };
  } catch (error) {
    logSecurityEvent('middleware_auth_exception', { error, path: request.nextUrl.pathname }, 'error');
    return { user: null, error };
  }
}

// Fonction pour vérifier les rôles
function checkRole(user: any, requiredRoles: string[]): boolean {
  if (!user || !user.role) return false;
  return requiredRoles.includes(user.role);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

  // Log des requêtes suspectes
  logSecurityEvent('request_received', { 
    path: pathname, 
    ip, 
    userAgent: request.headers.get('user-agent'),
    method: request.method 
  });

  // Vérifier si c'est une route protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const { user, error } = await verifyAuth(request);
    
    if (error || !user) {
      logSecurityEvent('unauthorized_access_attempt', { 
        path: pathname, 
        ip, 
        error: error?.message 
      }, 'warn');
      
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Vérifier les rôles pour certaines routes
    if (pathname.startsWith('/admin') && !checkRole(user, ['admin'])) {
      logSecurityEvent('insufficient_permissions', { 
        path: pathname, 
        ip, 
        userId: user.id,
        userRole: user.role 
      }, 'warn');
      
      return NextResponse.redirect(new URL('/unauthorized', request.url));
    }
  }

  // Redirection si l'utilisateur est déjà connecté et essaie d'accéder aux pages d'auth
  if (isAuthRoute) {
    const { user } = await verifyAuth(request);
    
    if (user) {
      logSecurityEvent('authenticated_user_auth_route', { 
        path: pathname, 
        userId: user.id 
      });
      
      return NextResponse.redirect(new URL('/generate', request.url));
    }
  }

  // Headers de sécurité
  const response = NextResponse.next();
  
  // Headers de sécurité
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP (Content Security Policy)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://*.supabase.in https://api.replicate.com https://*.replicate.delivery",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  // Headers de cache pour les assets statiques
  if (pathname.startsWith('/_next/static/') || pathname.startsWith('/favicon.ico')) {
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // Headers pour les API
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};