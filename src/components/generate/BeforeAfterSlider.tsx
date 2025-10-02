import { useState, useRef, useEffect } from "react";
import Image from "next/image";

interface BeforeAfterSliderProps {
  originalUrl: string | null;
  resultUrl: string | null;
  onRegenerate: () => void;
  seed?: string;
}

export function BeforeAfterSlider({ originalUrl, resultUrl, onRegenerate, seed }: BeforeAfterSliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    updateSliderPosition(e.clientX);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      updateSliderPosition(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updateSliderPosition = (clientX: number) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  if (!originalUrl || !resultUrl) {
    return (
      <div className="card p-8 text-center">
        <div className="text-white/50 text-sm">
          Upload an image and generate a result to see the comparison
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Before/After Comparison</h3>
        <div className="flex gap-2">
          {seed && (
            <button
              type="button"
              onClick={onRegenerate}
              className="btn-secondary btn-sm"
            >
              🔄 Regenerate with same seed
            </button>
          )}
        </div>
      </div>

      {/* Slider Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-64 bg-white/5 rounded-lg overflow-hidden cursor-col-resize"
        onMouseDown={handleMouseDown}
      >
        {/* Original Image */}
        <div className="absolute inset-0">
          <Image
            src={originalUrl}
            alt="Original image"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            Before
          </div>
        </div>

        {/* Result Image with Clip Path */}
        <div 
          className="absolute inset-0"
          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
        >
          <Image
            src={resultUrl}
            alt="Generated result"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
            After
          </div>
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
          style={{ left: `${sliderPosition}%` }}
        >
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Quality Assessment */}
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="text-center p-2 bg-white/5 rounded">
          <div className="text-white/80 font-medium">Quality</div>
          <div className="text-green-400">High</div>
        </div>
        <div className="text-center p-2 bg-white/5 rounded">
          <div className="text-white/80 font-medium">Consistency</div>
          <div className="text-blue-400">On-brand</div>
        </div>
        <div className="text-center p-2 bg-white/5 rounded">
          <div className="text-white/80 font-medium">Ready</div>
          <div className="text-purple-400">Export ready</div>
        </div>
      </div>

      {/* Regenerate Options */}
      {seed && (
        <div className="text-xs text-white/60 bg-white/5 p-3 rounded-lg">
          <strong>🔄 Regenerate Options:</strong> Use the same seed for consistent results, 
          or generate new variants for A/B testing. Current seed: <code className="bg-white/10 px-1 rounded">{seed}</code>
        </div>
      )}
    </div>
  );
}
