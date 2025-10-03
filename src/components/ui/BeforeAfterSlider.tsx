import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
  className?: string;
}

export function BeforeAfterSlider({ 
  beforeImage, 
  afterImage, 
  beforeLabel = "Avant",
  afterLabel = "Après",
  className = ""
}: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    // Limiter le slider aux limites de l'image (éviter de glisser au-delà)
    const minPosition = 5;  // 5% minimum
    const maxPosition = 95;  // 95% maximum
    setSliderPosition(Math.max(minPosition, Math.min(maxPosition, percentage)));
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;
      
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = (x / rect.width) * 100;
      
      // Limiter le slider aux limites de l'image (éviter de glisser au-delà)
      const minPosition = 5;  // 5% minimum
      const maxPosition = 95;  // 95% maximum
      setSliderPosition(Math.max(minPosition, Math.min(maxPosition, percentage)));
    };

    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging]);

  return (
    // Hauteur responsive et fluide plutôt que des valeurs figées
    <div className={`relative w-full h-[clamp(18rem,40vh,32rem)] md:h-[clamp(20rem,45vh,34rem)] rounded-xl overflow-hidden ${className}`}>
      <div 
        ref={containerRef}
        className="relative w-full h-full cursor-col-resize select-none"
        style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Image "Après" (arrière-plan) */}
        <div className="absolute inset-0 w-full h-full select-none" style={{ userSelect: 'none' }}>
          <Image
            src={afterImage}
            alt="Image transformée"
            fill
            className="pointer-events-none"
            sizes="(max-width: 768px) 100vw, 50vw"
            draggable={false}
            style={{ 
              objectFit: 'contain',
              objectPosition: 'center center'
            }}
          />
        </div>

        {/* Image "Avant" (premier plan avec masque) */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden select-none"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`, userSelect: 'none' }}
        >
          <Image
            src={beforeImage}
            alt="Image originale"
            fill
            className="pointer-events-none"
            sizes="(max-width: 768px) 100vw, 50vw"
            draggable={false}
            style={{ 
              objectFit: 'contain',
              objectPosition: 'center center'
            }}
          />
        </div>

        {/* Curseur de contrôle */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white shadow-lg z-10 select-none pointer-events-none"
          style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)', userSelect: 'none' }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center pointer-events-none">
            <div className="w-4 h-4 bg-gray-800 rounded-full"></div>
          </div>
        </div>

        {/* Labels */}
        <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm font-medium select-none pointer-events-none" style={{ userSelect: 'none' }}>
          {beforeLabel}
        </div>
        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-1 text-white text-sm font-medium select-none pointer-events-none" style={{ userSelect: 'none' }}>
          {afterLabel}
        </div>

        {/* Instructions */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm select-none pointer-events-none" style={{ userSelect: 'none' }}>
          Glissez pour comparer
        </div>
      </div>
    </div>
  );
}
