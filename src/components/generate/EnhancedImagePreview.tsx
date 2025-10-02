import Image from "next/image";
import { useState } from "react";

interface EnhancedImagePreviewProps {
  view: "original" | "result" | "side";
  previewUrl: string | null;
  resultUrl: string | null;
  loading: boolean;
  onViewChange: (view: "original" | "result" | "side") => void;
}

export function EnhancedImagePreview({ 
  view, 
  previewUrl, 
  resultUrl, 
  loading, 
  onViewChange 
}: EnhancedImagePreviewProps) {
  const [imageError, setImageError] = useState(false);

  // Skeleton component pour loading state
  const SkeletonLoader = () => (
    <div className="w-full h-full bg-white/5 rounded-xl animate-pulse">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 bg-white/10 rounded-full mx-auto mb-4 animate-spin"></div>
          <div className="text-white/60 text-sm">Generating your image...</div>
          <div className="text-white/40 text-xs mt-1">This usually takes 6-10 seconds</div>
        </div>
      </div>
    </div>
  );

  // Placeholder quand aucune image
  const EmptyState = () => (
    <div className="w-full h-full bg-white/5 rounded-xl border-2 border-dashed border-white/10">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-6xl mb-4">🖼️</div>
          <div className="text-white/60 text-sm">No image selected</div>
          <div className="text-white/40 text-xs mt-1">Upload an image to see preview</div>
        </div>
      </div>
    </div>
  );

  // Error state
  const ErrorState = () => (
    <div className="w-full h-full bg-red-500/10 rounded-xl border border-red-500/20">
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="text-red-300 text-sm">Failed to load image</div>
          <div className="text-red-200/60 text-xs mt-1">Try uploading again</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* View Tabs avec indicateurs visuels */}
      <div className="flex gap-2">
        <button
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'original'
              ? 'bg-blue-500 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
          onClick={() => onViewChange('original')}
          disabled={!previewUrl}
        >
          Original {previewUrl && '✓'}
        </button>
        <button
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'result'
              ? 'bg-green-500 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
          onClick={() => onViewChange('result')}
          disabled={!resultUrl}
        >
          Result {resultUrl && '✓'}
        </button>
        <button
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            view === 'side'
              ? 'bg-purple-500 text-white'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
          onClick={() => onViewChange('side')}
          disabled={!previewUrl || !resultUrl}
        >
          Compare
        </button>
      </div>

      {/* Preview Container */}
      <div className="card overflow-hidden rounded-2xl w-full h-96 flex items-center justify-center min-h-0">
        {loading ? (
          <SkeletonLoader />
        ) : !previewUrl && !resultUrl ? (
          <EmptyState />
        ) : imageError ? (
          <ErrorState />
        ) : (
          <div className="relative w-full h-full">
            {view === "original" && previewUrl && (
              <Image
                src={previewUrl}
                alt="Original image"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "contain" }}
                onError={() => setImageError(true)}
                className="transition-opacity duration-300"
              />
            )}
            {view === "result" && resultUrl && (
              <Image
                src={resultUrl}
                alt="Generated result"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "contain" }}
                onError={() => setImageError(true)}
                className="transition-opacity duration-300"
              />
            )}
            {view === "side" && previewUrl && resultUrl && (
              <div className="grid grid-cols-2 w-full h-full gap-2">
                <div className="relative">
                  <Image
                    src={previewUrl}
                    alt="Original"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={{ objectFit: "contain" }}
                    className="border-r border-white/10 pr-1"
                  />
                  <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    Before
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src={resultUrl}
                    alt="Result"
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    style={{ objectFit: "contain" }}
                    className="pl-1"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    After
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quality indicators */}
      {resultUrl && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center p-2 bg-white/5 rounded">
            <div className="text-white/80 font-medium">Quality</div>
            <div className="text-green-400">High</div>
          </div>
          <div className="text-center p-2 bg-white/5 rounded">
            <div className="text-white/80 font-medium">Style</div>
            <div className="text-blue-400">On-brand</div>
          </div>
          <div className="text-center p-2 bg-white/5 rounded">
            <div className="text-white/80 font-medium">Ready</div>
            <div className="text-purple-400">Export ready</div>
          </div>
        </div>
      )}
    </div>
  );
}
