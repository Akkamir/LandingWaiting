import { useEffect } from 'react';

// Conversion tracking basé sur la recherche - addresses CRO needs
export function useConversionTracking() {
  useEffect(() => {
    // Initialize conversion tracking
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        custom_map: {
          'custom_parameter_1': 'preset_chosen',
          'custom_parameter_2': 'seed_reuse',
          'custom_parameter_3': 'batch_export',
          'custom_parameter_4': 'privacy_click'
        }
      });
    }
  }, []);

  // Track preset selection - addresses quality consistency concerns
  const trackPresetChosen = (preset: string, category: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'preset_chosen', {
        event_category: 'engagement',
        event_label: `${category}_${preset}`,
        value: 1
      });
    }
  };

  // Track seed reuse - addresses repeatability concerns
  const trackSeedReuse = (seed: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'seed_reuse', {
        event_category: 'quality',
        event_label: 'consistency',
        value: 1
      });
    }
  };

  // Track batch export - addresses CRO needs
  const trackBatchExport = (variantCount: number, platformSizes: string[]) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'batch_export', {
        event_category: 'conversion',
        event_label: `${variantCount}_variants_${platformSizes.length}_sizes`,
        value: variantCount * platformSizes.length
      });
    }
  };

  // Track privacy policy clicks - addresses trust concerns
  const trackPrivacyClick = (source: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'privacy_click', {
        event_category: 'trust',
        event_label: source,
        value: 1
      });
    }
  };

  // Track upload to generation rate - key conversion metric
  const trackUploadToGenerate = (timeToGenerate: number, fileSize: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'upload_to_generate', {
        event_category: 'conversion',
        event_label: 'time_to_first_export',
        value: timeToGenerate,
        custom_parameter_1: fileSize
      });
    }
  };

  // Track multi-variant usage - addresses A/B testing needs
  const trackMultiVariantUsage = (variantCount: number, useCase: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'multi_variant_usage', {
        event_category: 'cro',
        event_label: `${variantCount}_variants_${useCase}`,
        value: variantCount
      });
    }
  };

  // Track platform-specific exports - addresses channel needs
  const trackPlatformExport = (platform: string, size: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'platform_export', {
        event_category: 'channel',
        event_label: `${platform}_${size}`,
        value: 1
      });
    }
  };

  // Track error rates - addresses quality consistency
  const trackGenerationError = (errorType: string, retryCount: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generation_error', {
        event_category: 'quality',
        event_label: errorType,
        value: retryCount
      });
    }
  };

  // Track time to first export - key performance metric
  const trackTimeToFirstExport = (timeToExport: number, method: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'time_to_first_export', {
        event_category: 'performance',
        event_label: method,
        value: timeToExport
      });
    }
  };

  return {
    trackPresetChosen,
    trackSeedReuse,
    trackBatchExport,
    trackPrivacyClick,
    trackUploadToGenerate,
    trackMultiVariantUsage,
    trackPlatformExport,
    trackGenerationError,
    trackTimeToFirstExport
  };
}

// A/B Testing for Hero H1 variants
export function useABTesting() {
  useEffect(() => {
    // Simple A/B test for Hero H1
    const variants = [
      "Transform any image into on-brand visuals—in seconds.",
      "From input to stunning, sized-for-social images—no prompt expertise.",
      "Production-ready product photos & social visuals—fast, private, repeatable."
    ];
    
    const variantIndex = Math.floor(Math.random() * variants.length);
    const selectedVariant = variants[variantIndex];
    
    // Store variant for tracking
    if (typeof window !== 'undefined') {
      localStorage.setItem('hero_variant', variantIndex.toString());
      
      // Track variant assignment
      if (window.gtag) {
        window.gtag('event', 'ab_test_assignment', {
          event_category: 'experiment',
          event_label: `hero_h1_variant_${variantIndex}`,
          value: 1
        });
      }
    }
    
    return selectedVariant;
  }, []);
}

// Performance tracking for Core Web Vitals
export function usePerformanceTracking() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Track LCP (Largest Contentful Paint)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        window.gtag('event', 'web_vitals', {
          event_category: 'performance',
          event_label: 'LCP',
          value: Math.round(lastEntry.startTime)
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track FID (First Input Delay)
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          window.gtag('event', 'web_vitals', {
            event_category: 'performance',
            event_label: 'FID',
            value: Math.round(entry.processingStart - entry.startTime)
          });
        });
      }).observe({ entryTypes: ['first-input'] });

      // Track CLS (Cumulative Layout Shift)
      new PerformanceObserver((list) => {
        let clsValue = 0;
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        window.gtag('event', 'web_vitals', {
          event_category: 'performance',
          event_label: 'CLS',
          value: Math.round(clsValue * 1000)
        });
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }, []);
}
