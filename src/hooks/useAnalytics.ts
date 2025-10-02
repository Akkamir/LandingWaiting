import { useCallback } from "react";

interface AnalyticsEvent {
  event_category: string;
  event_label: string;
  value?: number;
}

export function useAnalytics() {
  const trackEvent = useCallback((eventName: string, parameters: AnalyticsEvent) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters);
    }
  }, []);

  const trackPageView = useCallback((pagePath: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: pagePath,
      });
    }
  }, []);

  const trackConversion = useCallback((conversionId: string, value?: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        send_to: conversionId,
        value: value,
        currency: 'EUR'
      });
    }
  }, []);

  return {
    trackEvent,
    trackPageView,
    trackConversion
  };
}
