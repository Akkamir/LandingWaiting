// Utilitaires de sécurité pour les composants client

// Sanitisation des données utilisateur
export function sanitizeUserInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Supprimer les balises HTML
    .replace(/javascript:/gi, '') // Supprimer les protocoles JavaScript
    .replace(/on\w+=/gi, '') // Supprimer les event handlers
    .trim();
}

// Validation côté client (complémentaire à la validation serveur)
export function validateEmailClient(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePromptClient(prompt: string): boolean {
  return prompt.length >= 8 && prompt.length <= 500 && /^[a-zA-Z0-9\s.,!?\-'àâäéèêëïîôöùûüÿçÀÂÄÉÈÊËÏÎÔÖÙÛÜŸÇ]+$/.test(prompt);
}

// Protection contre les attaques CSRF
export function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// Validation des URLs pour éviter les redirections malveillantes
export function isSafeUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'https:' && 
           (parsedUrl.hostname.endsWith('.supabase.co') || 
            parsedUrl.hostname.endsWith('.replicate.com') ||
            parsedUrl.hostname === window.location.hostname);
  } catch {
    return false;
  }
}

// Rate limiting côté client
class ClientRateLimit {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs = 60000; // 1 minute
  private readonly maxRequests = 10;

  isAllowed(key: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(key) || [];
    
    // Nettoyer les requêtes anciennes
    const validRequests = userRequests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(key, validRequests);
    return true;
  }
}

export const clientRateLimit = new ClientRateLimit();

// Logging sécurisé côté client
export function logSecurityEvent(event: string, details: Record<string, unknown> = {}) {
  if (typeof window !== 'undefined' && window.console) {
    // Éviter les erreurs Sentry en mode développement
    try {
      console.warn(`[SECURITY] ${event}:`, {
        ...details,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
    } catch (error) {
      // Ignorer les erreurs de console (Sentry bloqué, etc.)
      console.log(`[SECURITY] ${event}:`, details);
    }
  }
}
