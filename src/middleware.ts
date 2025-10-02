import { NextRequest, NextResponse } from 'next/server';

// Headers de sécurité complets
const securityHeaders = {
  // Content Security Policy - Protection contre XSS
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.replicate.com https://www.google-analytics.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "media-src 'self'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
    "frame-src 'none'"
  ].join('; '),
  
  // HTTP Strict Transport Security - Protection MITM
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // X-Content-Type-Options - Protection MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // X-Frame-Options - Protection clickjacking
  'X-Frame-Options': 'DENY',
  
  // Referrer Policy - Contrôle des informations de référence
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy - Contrôle des APIs du navigateur
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '),
  
  // X-XSS-Protection - Protection XSS legacy
  'X-XSS-Protection': '1; mode=block',
  
  // Cache Control pour les pages sensibles
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// Rate limiting simple (en production, utiliser Redis ou similaire)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requêtes par minute (plus généreux pour le développement)

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(ip);
  
  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  userLimit.count++;
  return true;
}

// Validation des headers de requête suspects
function validateRequestHeaders(request: NextRequest): boolean {
  const userAgent = request.headers.get('user-agent');
  const contentType = request.headers.get('content-type');
  
  // Bloquer les user agents suspects
  if (userAgent && (
    userAgent.includes('sqlmap') ||
    userAgent.includes('nikto') ||
    userAgent.includes('nmap') ||
    userAgent.includes('masscan') ||
    userAgent.length > 1000 // User agent anormalement long
  )) {
    return false;
  }
  
  // Valider le content-type pour les requêtes POST
  if (request.method === 'POST') {
    if (!contentType || (
      !contentType.includes('application/json') &&
      !contentType.includes('multipart/form-data') &&
      !contentType.includes('application/x-www-form-urlencoded')
    )) {
      return false;
    }
  }
  
  return true;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Log des tentatives suspectes
  if (!validateRequestHeaders(request)) {
    console.warn(`[SECURITY] Request blocked from ${ip}:`, {
      userAgent: request.headers.get('user-agent'),
      contentType: request.headers.get('content-type'),
      pathname
    });
    return new NextResponse('Forbidden', { status: 403 });
  }
  
  // Rate limiting pour les API (désactivé en développement)
  if (pathname.startsWith('/api/') && process.env.NODE_ENV === 'production') {
    if (!checkRateLimit(ip)) {
      console.warn(`[SECURITY] Rate limit exceeded for ${ip}`);
      return new NextResponse('Too Many Requests', { status: 429 });
    }
  }
  
  // Redirection HTTPS en production
  if (process.env.NODE_ENV === 'production' && request.headers.get('x-forwarded-proto') !== 'https') {
    return NextResponse.redirect(`https://${request.headers.get('host')}${pathname}`, 301);
  }
  
  // Application des headers de sécurité
  const response = NextResponse.next();
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Headers spécifiques pour les API
  if (pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
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
