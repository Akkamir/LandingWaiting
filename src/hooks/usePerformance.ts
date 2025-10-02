import { useEffect } from "react";
import { useAnalytics } from "./useAnalytics";

export function usePerformance() {
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Track LCP (Largest Contentful Paint)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      if (lastEntry) {
        trackEvent('web_vitals', {
          'event_category': 'performance',
          'event_label': 'LCP',
          'value': Math.round(lastEntry.startTime)
        });
      }
    });
    
    observer.observe({ entryTypes: ['largest-contentful-paint'] });
    
    return () => observer.disconnect();
  }, [trackEvent]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Track FID (First Input Delay)
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.entryType === 'first-input') {
          const eventEntry = entry as any; // PerformanceEventTiming
          trackEvent('web_vitals', {
            'event_category': 'performance',
            'event_label': 'FID',
            'value': Math.round(eventEntry.processingStart - eventEntry.startTime)
          });
        }
      });
    });
    
    observer.observe({ entryTypes: ['first-input'] });
    
    return () => observer.disconnect();
  }, [trackEvent]);
}
