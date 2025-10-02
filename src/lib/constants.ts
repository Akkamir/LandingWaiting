// Design tokens
export const COLORS = {
  primary: '#0099ff',
  primaryDark: '#0055ff',
  background: '#0B0B0C',
  foreground: '#ffffff',
  muted: '#c7c7c7',
  card: 'rgba(255,255,255,0.06)',
} as const;

export const SPACING = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  '2xl': '4rem',
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

// Animation configurations
export const ANIMATIONS = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  },
} as const;

// Analytics events
export const ANALYTICS_EVENTS = {
  FORM_VALIDATION_ERROR: 'form_validation_error',
  FORM_SUBMIT_START: 'form_submit_start',
  FORM_SUBMIT_ERROR: 'form_submit_error',
  CONVERSION: 'conversion',
  WEB_VITALS: 'web_vitals',
} as const;
