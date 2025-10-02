"use client";

import { useCallback } from 'react';

// Types pour les événements de tracking
export interface AnalyticsEvent {
  event: string;
  category?: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

export function useAnalytics() {
  const trackEvent = useCallback((eventData: AnalyticsEvent) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventData.event, {
        event_category: eventData.category || 'engagement',
        event_label: eventData.label,
        value: eventData.value,
        custom_parameters: eventData.properties
      });
    }

    // Console log pour le développement
    if (process.env.NODE_ENV === 'development') {
      console.log('[ANALYTICS]', eventData);
    }
  }, []);

  const trackPageView = useCallback((page: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: page,
        page_location: window.location.href
      });
    }
  }, []);

  const trackConversion = useCallback((conversionType: string, value?: number) => {
    trackEvent({
      event: 'conversion',
      category: 'conversion',
      label: conversionType,
      value: value,
      properties: {
        conversion_type: conversionType,
        timestamp: Date.now()
      }
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackConversion
  };
}