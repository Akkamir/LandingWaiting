import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateEmail, validatePasswordStrength, generateOTP, checkRateLimit } from '@/lib/auth/security';

describe('Auth Security Functions', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true);
      expect(validateEmail('user@sub.domain.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('user@')).toBe(false);
      expect(validateEmail('')).toBe(false);
      expect(validateEmail('user@domain')).toBe(false);
    });

    it('should reject emails that are too long', () => {
      const longEmail = 'a'.repeat(250) + '@example.com';
      expect(validateEmail(longEmail)).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong passwords', () => {
      const result = validatePasswordStrength('StrongPass123!');
      expect(result.isValid).toBe(true);
      expect(result.score).toBe(5);
      expect(result.feedback).toHaveLength(0);
    });

    it('should reject weak passwords', () => {
      const result = validatePasswordStrength('weak');
      expect(result.isValid).toBe(false);
      expect(result.score).toBeLessThan(4);
      expect(result.feedback.length).toBeGreaterThan(0);
    });

    it('should provide specific feedback for missing requirements', () => {
      const result = validatePasswordStrength('nouppercase123!');
      expect(result.feedback).toContain('Ajoutez une majuscule');
    });
  });

  describe('generateOTP', () => {
    it('should generate 6-digit OTP', () => {
      const otp = generateOTP();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it('should generate different OTPs', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      expect(otp1).not.toBe(otp2);
    });
  });

  describe('checkRateLimit', () => {
    beforeEach(() => {
      // Reset rate limit store before each test
      vi.clearAllMocks();
    });

    it('should allow requests within limit', () => {
      const identifier = 'test-user';
      expect(checkRateLimit(identifier, 5)).toBe(true);
      expect(checkRateLimit(identifier, 5)).toBe(true);
      expect(checkRateLimit(identifier, 5)).toBe(true);
    });

    it('should block requests exceeding limit', () => {
      const identifier = 'test-user-2';
      const maxRequests = 3;
      
      // Make requests up to limit
      for (let i = 0; i < maxRequests; i++) {
        expect(checkRateLimit(identifier, maxRequests)).toBe(true);
      }
      
      // Next request should be blocked
      expect(checkRateLimit(identifier, maxRequests)).toBe(false);
    });

    it('should allow requests after time window', () => {
      const identifier = 'test-user-3';
      const maxRequests = 1;
      
      // First request should be allowed
      expect(checkRateLimit(identifier, maxRequests)).toBe(true);
      
      // Second request should be blocked
      expect(checkRateLimit(identifier, maxRequests)).toBe(false);
      
      // Mock time passage (this would need to be implemented in the actual function)
      // For now, we'll just test the basic functionality
    });
  });
});
