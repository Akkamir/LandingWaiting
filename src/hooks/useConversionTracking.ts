import { useEffect } from "react";

// Événements de conversion à tracker
export const conversionEvents = {
  // Funnel d'activation
  file_selected: 'file_selected',
  preset_clicked: 'preset_clicked', 
  prompt_submitted: 'prompt_submitted',
  lowres_preview_shown: 'lowres_preview_shown',
  final_render_done: 'final_render_done',
  download_clicked: 'download_clicked',
  
  // Funnel de conversion
  credit_topup_clicked: 'credit_topup_clicked',
  pricing_viewed: 'pricing_viewed',
  examples_viewed: 'examples_viewed',
  
  // Engagement
  before_after_slider_used: 'before_after_slider_used',
  privacy_settings_changed: 'privacy_settings_changed',
  platform_size_selected: 'platform_size_selected'
} as const;

export type ConversionEvent = typeof conversionEvents[keyof typeof conversionEvents];

interface ConversionTrackingOptions {
  event: ConversionEvent;
  properties?: Record<string, any>;
  value?: number;
}

export function useConversionTracking() {
  const trackEvent = (options: ConversionTrackingOptions) => {
    // Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', options.event, {
        event_category: 'conversion',
        event_label: options.event,
        value: options.value,
        custom_parameters: options.properties
      });
    }
    
    // Console log pour debug
    console.log(`[CONVERSION] ${options.event}:`, options.properties);
  };

  // Tracking automatique des interactions importantes
  useEffect(() => {
    const handleFileSelect = () => trackEvent({ event: conversionEvents.file_selected });
    const handlePresetClick = () => trackEvent({ event: conversionEvents.preset_clicked });
    const handlePromptSubmit = () => trackEvent({ event: conversionEvents.prompt_submitted });
    const handleDownload = () => trackEvent({ event: conversionEvents.download_clicked });

    // Écouter les événements DOM
    document.addEventListener('file_selected', handleFileSelect);
    document.addEventListener('preset_clicked', handlePresetClick);
    document.addEventListener('prompt_submitted', handlePromptSubmit);
    document.addEventListener('download_clicked', handleDownload);

    return () => {
      document.removeEventListener('file_selected', handleFileSelect);
      document.removeEventListener('preset_clicked', handlePresetClick);
      document.removeEventListener('prompt_submitted', handlePromptSubmit);
      document.removeEventListener('download_clicked', handleDownload);
    };
  }, []);

  return { trackEvent };
}

// Tests A/B proposés
export const abTests = {
  hero_variants: {
    test_name: 'hero_variants',
    variants: ['restoration', 'social', 'seller'],
    metric: 'conversion_rate'
  },
  cta_text: {
    test_name: 'cta_text', 
    variants: ['Transform Now', 'Enhance Photo', 'Try Free'],
    metric: 'click_through_rate'
  },
  preset_order: {
    test_name: 'preset_order',
    variants: ['enhancement_first', 'social_first', 'product_first'],
    metric: 'preset_click_rate'
  },
  gallery_position: {
    test_name: 'gallery_position',
    variants: ['above_fold', 'below_fold'],
    metric: 'scroll_depth'
  }
} as const;
