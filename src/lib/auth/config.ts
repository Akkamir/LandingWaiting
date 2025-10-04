// Configuration d'authentification
export const AUTH_CONFIG = {
  // Durées d'expiration (en secondes)
  MAGIC_LINK_EXPIRY: 3600, // 1 heure
  OTP_EXPIRY: 300, // 5 minutes
  SESSION_EXPIRY: 86400, // 24 heures
  REFRESH_TOKEN_EXPIRY: 604800, // 7 jours
  
  // Limites de sécurité
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900, // 15 minutes
  RATE_LIMIT_WINDOW: 60, // 1 minute
  RATE_LIMIT_MAX: 10, // 10 tentatives par minute
  
  // Configuration OAuth
  OAUTH_PROVIDERS: {
    google: {
      enabled: true,
      scopes: ['email', 'profile'],
    },
    github: {
      enabled: true,
      scopes: ['user:email'],
    },
  },
  
  // Politiques de mot de passe
  PASSWORD_POLICY: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSymbols: true,
    maxLength: 128,
  },
  
  // Configuration des cookies
  COOKIE_CONFIG: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 86400, // 24 heures
  },
  
  // URLs de redirection
  REDIRECT_URLS: {
    login: '/login',
    dashboard: '/generate',
    profile: '/profile',
    callback: '/auth/callback',
  },
} as const;

export type AuthConfig = typeof AUTH_CONFIG;
