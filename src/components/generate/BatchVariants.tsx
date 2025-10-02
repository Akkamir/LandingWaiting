import { useState } from "react";

// Platform sizes basées sur la recherche - CRO & channel needs
const PLATFORM_SIZES = [
  {
    name: "Instagram Post",
    width: 1080,
    height: 1080,
    description: "Square feed post",
    icon: "📸"
  },
  {
    name: "Instagram Story",
    width: 1080,
    height: 1920,
    description: "Vertical story format",
    icon: "📱"
  },
  {
    name: "LinkedIn Post",
    width: 1200,
    height: 627,
    description: "Professional network",
    icon: "💼"
  },
  {
    name: "Twitter/X Post",
    width: 1200,
    height: 675,
    description: "Social media post",
    icon: "🐦"
  },
  {
    name: "Shopify Product",
    width: 800,
    height: 800,
    description: "E-commerce product image",
    icon: "🛒"
  },
  {
    name: "Facebook Ad",
    width: 1200,
    height: 630,
    description: "Social media ad",
    icon: "📢"
  }
];

interface BatchVariantsProps {
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  variantCount: number;
  onVariantCountChange: (count: number) => void;
  onGenerateBatch: () => void;
  isGenerating: boolean;
}

export function BatchVariants({ 
  selectedSizes, 
  onSizeToggle, 
  variantCount, 
  onVariantCountChange,
  onGenerateBatch,
  isGenerating 
}: BatchVariantsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Batch & Variants</h3>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* Variant Count - addresses CRO needs for A/B testing */}
      <div className="space-y-2">
        <label className="block text-sm text-white/80">Number of Variants</label>
        <div className="flex gap-2">
          {[1, 2, 4, 6].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => onVariantCountChange(count)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                variantCount === count
                  ? 'bg-blue-500 text-white'
                  : 'bg-white/10 text-white/70 hover:bg-white/20'
              }`}
            >
              {count}
            </button>
          ))}
        </div>
        <p className="text-xs text-white/60">
          Generate multiple variants for A/B testing and creative exploration
        </p>
      </div>

      {/* Platform Sizes - addresses platform-specific needs */}
      <div className="space-y-2">
        <label className="block text-sm text-white/80">Platform Sizes</label>
        <div className="grid grid-cols-2 gap-2">
          {PLATFORM_SIZES.map((size) => (
            <label
              key={size.name}
              className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                selectedSizes.includes(size.name)
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedSizes.includes(size.name)}
                onChange={() => onSizeToggle(size.name)}
                className="sr-only"
              />
              <span className="text-lg">{size.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{size.name}</div>
                <div className="text-xs text-white/60">{size.description}</div>
                <div className="text-xs text-white/50">{size.width}×{size.height}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="space-y-3 p-3 bg-white/5 rounded-lg">
          <h4 className="text-sm font-medium text-white/80">Advanced Options</h4>
          
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-white/80">Use same seed for consistency</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-white/80">Generate lossless for e-commerce</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm text-white/80">Auto-optimize for web performance</span>
            </label>
          </div>
        </div>
      )}

      {/* Generate Batch Button */}
      <button
        type="button"
        onClick={onGenerateBatch}
        disabled={isGenerating || selectedSizes.length === 0}
        className="w-full btn-primary btn-lg"
      >
        {isGenerating ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Generating {variantCount} variants...
          </span>
        ) : (
          `Generate ${variantCount} variant${variantCount > 1 ? 's' : ''} for ${selectedSizes.length} size${selectedSizes.length > 1 ? 's' : ''}`
        )}
      </button>

      {/* Export Options - addresses fast publishing loops */}
      <div className="text-xs text-white/60 bg-white/5 p-3 rounded-lg">
        <strong>📦 Export Options:</strong> After generation, you'll get a download pack with all sizes 
        and a "Copy to clipboard" option for quick social media posting.
      </div>
    </div>
  );
}
