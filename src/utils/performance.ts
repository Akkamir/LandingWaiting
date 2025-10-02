// Optimisation: Utilitaires de mesure des performances
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Record<string, number> = {};

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Mesure du LCP (Largest Contentful Paint)
  measureLCP(): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.metrics.lcp = lastEntry.startTime;
      console.log('LCP:', lastEntry.startTime, 'ms');
    });

    observer.observe({ entryTypes: ['largest-contentful-paint'] });
  }

  // Mesure du FID (First Input Delay)
  measureFID(): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        const fidEntry = entry as PerformanceEntry & { processingStart?: number };
        this.metrics.fid = (fidEntry.processingStart || 0) - entry.startTime;
        console.log('FID:', this.metrics.fid, 'ms');
      });
    });

    observer.observe({ entryTypes: ['first-input'] });
  }

  // Mesure du CLS (Cumulative Layout Shift)
  measureCLS(): void {
    if (typeof window === 'undefined') return;

    let clsValue = 0;
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (!(entry as PerformanceEntry & { hadRecentInput?: boolean }).hadRecentInput) {
          clsValue += (entry as PerformanceEntry & { value?: number }).value || 0;
        }
      });
      this.metrics.cls = clsValue;
      console.log('CLS:', clsValue);
    });

    observer.observe({ entryTypes: ['layout-shift'] });
  }

  // Mesure du temps de chargement des ressources
  measureResourceTiming(): void {
    if (typeof window === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name.includes('lottie') || entry.name.includes('Bouncing Square')) {
          console.log('Lottie load time:', entry.duration, 'ms');
          this.metrics.lottieLoadTime = entry.duration;
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  // Initialise toutes les mesures
  init(): void {
    this.measureLCP();
    this.measureFID();
    this.measureCLS();
    this.measureResourceTiming();
  }

  // Retourne les métriques collectées
  getMetrics(): Record<string, number> {
    return { ...this.metrics };
  }
}

// Hook React pour les performances
export function usePerformanceMonitoring() {
  const monitor = PerformanceMonitor.getInstance();
  
  // Initialise le monitoring au montage du composant
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      monitor.init();
    }
  }, [monitor]);
}

// Import React pour le hook
import React from 'react';
