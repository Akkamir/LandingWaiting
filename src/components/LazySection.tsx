"use client";
import { useEffect, useRef, useState } from "react";

interface LazySectionProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  className?: string;
}

export default function LazySection({ 
  children, 
  fallback,
  rootMargin = "50px",
  threshold = 0.1,
  className = ""
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
        }
      },
      { 
        rootMargin,
        threshold 
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [rootMargin, threshold, hasLoaded]);

  return (
    <div ref={ref} className={className}>
      {isVisible ? children : (fallback || <SectionSkeleton />)}
    </div>
  );
}

// Skeleton loader optimisé
function SectionSkeleton() {
  return (
    <div className="w-full">
      <div className="skeleton h-8 w-3/4 mb-4 rounded"></div>
      <div className="skeleton h-4 w-full mb-2 rounded"></div>
      <div className="skeleton h-4 w-5/6 mb-4 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="skeleton h-32 rounded"></div>
        <div className="skeleton h-32 rounded"></div>
      </div>
    </div>
  );
}
