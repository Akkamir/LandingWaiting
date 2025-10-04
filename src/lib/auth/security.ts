// Fonctions de sécurité pour l'authentification
import { AUTH_CONFIG } from './config';
import { z } from 'zod';

// Schémas de validation
export const emailSchema = z.string().email('Email invalide');
export const passwordSchema = z.string()
  .min(AUTH_CONFIG.PASSWORD_POLICY.minLength, `Minimum ${AUTH_CONFIG.PASSWORD_POLICY.minLength} caractères`)
  .max(AUTH_CONFIG.PASSWORD_POLICY.maxLength, `Maximum ${AUTH_CONFIG.PASSWORD_POLICY.maxLength} caractères`)
  .regex(/[A-Z]/, 'Au moins une majuscule requise')
  .regex(/[a-z]/, 'Au moins une minuscule requise')
  .regex(/[0-9]/, 'Au moins un chiffre requis')
  .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial requis');

export const otpSchema = z.string().length(6, 'Code OTP doit contenir 6 chiffres');
export const nameSchema = z.string().min(2, 'Nom trop court').max(50, 'Nom trop long');

// Validation de la force du mot de passe
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= AUTH_CONFIG.PASSWORD_POLICY.minLength) {
    score += 1;
  } else {
    feedback.push(`Minimum ${AUTH_CONFIG.PASSWORD_POLICY.minLength} caractères`);
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Ajoutez une majuscule');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Ajoutez une minuscule');
  }

  if (/[0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Ajoutez un chiffre');
  }

  if (/[^A-Za-z0-9]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Ajoutez un caractère spécial');
  }

  return {
    isValid: score >= 4,
    score,
    feedback,
  };
}

// Sanitisation des entrées utilisateur
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprime les balises HTML
    .replace(/javascript:/gi, '') // Supprime les protocoles JS
    .replace(/on\w+=/gi, '') // Supprime les event handlers
    .slice(0, 1000); // Limite la longueur
}

// Validation de l'email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Génération de code OTP sécurisé
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validation du code OTP
export function validateOTP(otp: string, expectedOtp: string, expiry: number): boolean {
  if (Date.now() > expiry) {
    return false; // Code expiré
  }
  return otp === expectedOtp;
}

// Rate limiting simple (en mémoire)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function checkRateLimit(identifier: string, maxRequests = AUTH_CONFIG.RATE_LIMIT_MAX): boolean {
  const now = Date.now();
  const windowStart = now - AUTH_CONFIG.RATE_LIMIT_WINDOW * 1000;
  
  const record = rateLimitStore.get(identifier);
  
  if (!record || record.resetTime < windowStart) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
}

// Nettoyage périodique du store de rate limiting
setInterval(() => {
  const now = Date.now();
  const windowStart = now - AUTH_CONFIG.RATE_LIMIT_WINDOW * 1000;
  
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < windowStart) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Nettoyage toutes les minutes

// Validation des headers de sécurité
export function validateSecurityHeaders(headers: Headers): boolean {
  const requiredHeaders = [
    'user-agent',
    'accept',
    'accept-language',
  ];
  
  return requiredHeaders.every(header => headers.get(header));
}

// Détection de tentatives d'attaque
export function detectAttackPatterns(input: string): boolean {
  const attackPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /union\s+select/i,
    /drop\s+table/i,
    /insert\s+into/i,
    /delete\s+from/i,
    /update\s+set/i,
  ];
  
  return attackPatterns.some(pattern => pattern.test(input));
}

// Logging sécurisé (masque les données sensibles)
export function logSecurityEvent(event: string, data: any, level: 'info' | 'warn' | 'error' = 'info') {
  const sanitizedData = {
    ...data,
    password: data.password ? '[REDACTED]' : undefined,
    token: data.token ? '[REDACTED]' : undefined,
    email: data.email ? data.email.replace(/(.{2}).*(@.*)/, '$1***$2') : undefined,
  };
  
  const logMessage = `[AUTH-${level.toUpperCase()}] ${event}`;
  
  try {
    if (level === 'error') {
      console.error(logMessage, sanitizedData);
    } else if (level === 'warn') {
      console.warn(logMessage, sanitizedData);
    } else {
      console.log(logMessage, sanitizedData);
    }
  } catch (err) {
    // Ignore les erreurs de logging (extensions bloquantes)
  }
}
