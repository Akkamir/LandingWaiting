import { useEffect } from 'react';

// Analytics tracking pour UX optimization
export function useAnalytics() {
  useEffect(() => {
    // Initialize analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        custom_map: {
          'custom_parameter_1': 'prompt_length',
          'custom_parameter_2': 'file_size',
          'custom_parameter_3': 'generation_time',
          'custom_parameter_4': 'error_type'
        }
      });
    }
  }, []);

  // Track key UX metrics
  const trackUploadToGenerate = (timeToGenerate: number, fileSize: number, promptLength: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'upload_to_generate', {
        event_category: 'conversion',
        event_label: 'time_to_first_export',
        value: timeToGenerate,
        custom_parameter_1: promptLength,
        custom_parameter_2: fileSize
      });
    }
  };

  const trackGenerationError = (errorType: string, retryCount: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'generation_error', {
        event_category: 'quality',
        event_label: errorType,
        value: retryCount
      });
    }
  };

  const trackPresetUsage = (preset: string, category: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'preset_used', {
        event_category: 'engagement',
        event_label: `${category}_${preset}`,
        value: 1
      });
    }
  };

  const trackRegeneration = (seed: string, reason: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'regeneration', {
        event_category: 'quality',
        event_label: reason,
        value: 1
      });
    }
  };

  const trackUndo = (historyLength: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'undo_action', {
        event_category: 'engagement',
        event_label: 'user_correction',
        value: historyLength
      });
    }
  };

  const trackDownload = (format: string, size: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'download', {
        event_category: 'conversion',
        event_label: `${format}_${size}`,
        value: 1
      });
    }
  };

  const trackBatchGeneration = (variantCount: number, platformSizes: string[]) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'batch_generation', {
        event_category: 'cro',
        event_label: `${variantCount}_variants_${platformSizes.length}_sizes`,
        value: variantCount * platformSizes.length
      });
    }
  };

  const trackPromptAssist = (action: string, promptLength: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'prompt_assist', {
        event_category: 'engagement',
        event_label: action,
        value: promptLength
      });
    }
  };

  const trackPrivacyClick = (source: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'privacy_click', {
        event_category: 'trust',
        event_label: source,
        value: 1
      });
    }
  };

  return {
    trackUploadToGenerate,
    trackGenerationError,
    trackPresetUsage,
    trackRegeneration,
    trackUndo,
    trackDownload,
    trackBatchGeneration,
    trackPromptAssist,
    trackPrivacyClick
  };
}

// A/B Testing utilities
export function useABTesting() {
  useEffect(() => {
    // A/B test for button text
    const buttonVariants = [
      "Generate Now",
      "Transform Image", 
      "Create Magic"
    ];
    
    const selectedVariant = buttonVariants[Math.floor(Math.random() * buttonVariants.length)];
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('button_variant', selectedVariant);
      
      if (window.gtag) {
        window.gtag('event', 'ab_test_assignment', {
          event_category: 'experiment',
          event_label: `button_text_${selectedVariant}`,
          value: 1
        });
      }
    }
    
    return selectedVariant;
  }, []);
}

// Performance tracking
export function usePerformanceTracking() {
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Track Core Web Vitals
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        window.gtag('event', 'web_vitals', {
          event_category: 'performance',
          event_label: 'LCP',
          value: Math.round(lastEntry.startTime)
        });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Track First Input Delay
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

      // Track Cumulative Layout Shift
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