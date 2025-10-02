import { useState } from "react";

// Styles presets basés sur la recherche - adoption & demand pour creative/marketing teams
const STYLE_PRESETS = [
  {
    id: "clean-product",
    name: "Clean Product",
    description: "E-commerce ready, white background",
    prompt: "Clean product photography, white background, professional lighting, high quality, commercial style",
    icon: "📦",
    category: "ecommerce"
  },
  {
    id: "studio-portrait",
    name: "Studio Portrait", 
    description: "Professional headshots & portraits",
    prompt: "Studio portrait photography, professional lighting, clean background, high quality, commercial headshot style",
    icon: "👤",
    category: "portrait"
  },
  {
    id: "cinematic",
    name: "Cinematic",
    description: "Dramatic, movie-like visuals",
    prompt: "Cinematic photography, dramatic lighting, film grain, high contrast, movie poster style, professional cinematography",
    icon: "🎬",
    category: "creative"
  },
  {
    id: "minimal-flat",
    name: "Minimal Flat",
    description: "Clean, modern, graphic design",
    prompt: "Minimal flat design, clean lines, simple composition, modern aesthetic, graphic design style, high contrast",
    icon: "🎨",
    category: "design"
  },
  {
    id: "social-viral",
    name: "Social Viral",
    description: "Eye-catching for social media",
    prompt: "Viral social media style, vibrant colors, engaging composition, Instagram-worthy, trending aesthetic, high engagement potential",
    icon: "📱",
    category: "social"
  },
  {
    id: "luxury-brand",
    name: "Luxury Brand",
    description: "Premium, high-end aesthetic",
    prompt: "Luxury brand photography, premium materials, sophisticated lighting, high-end aesthetic, luxury product style, elegant composition",
    icon: "💎",
    category: "luxury"
  }
];

interface StylePresetsProps {
  selectedStyle: string | null;
  onStyleSelect: (style: string | null) => void;
  onPromptUpdate: (prompt: string) => void;
}

export function StylePresets({ selectedStyle, onStyleSelect, onPromptUpdate }: StylePresetsProps) {
  const [showBrandStyle, setShowBrandStyle] = useState(false);
  const [brandColors, setBrandColors] = useState("");
  const [brandFont, setBrandFont] = useState("");

  const handleStyleSelect = (style: typeof STYLE_PRESETS[0]) => {
    onStyleSelect(style.id);
    onPromptUpdate(style.prompt);
  };

  const handleBrandStyle = () => {
    if (brandColors.trim()) {
      const brandPrompt = `Brand style with colors: ${brandColors}${brandFont ? `, typography: ${brandFont}` : ''}, maintain brand consistency, professional brand photography`;
      onPromptUpdate(brandPrompt);
      onStyleSelect('brand-custom');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Style Presets</h3>
        <button
          type="button"
          onClick={() => setShowBrandStyle(!showBrandStyle)}
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          {showBrandStyle ? 'Hide' : 'Add'} Brand Style
        </button>
      </div>

      {/* Brand Style Panel - addresses privacy/training concerns */}
      {showBrandStyle && (
        <div className="card p-4 bg-blue-500/10 border-blue-500/20">
          <h4 className="font-medium text-white mb-3">🎨 Brand Style</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm text-white/80 mb-1">Brand Colors (hex codes)</label>
              <input
                type="text"
                placeholder="#FF6B6B, #4ECDC4"
                value={brandColors}
                onChange={(e) => setBrandColors(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">Typography Style (optional)</label>
              <input
                type="text"
                placeholder="Modern, Sans-serif, Bold"
                value={brandFont}
                onChange={(e) => setBrandFont(e.target.value)}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
            <button
              type="button"
              onClick={handleBrandStyle}
              className="btn-primary btn-sm"
            >
              Apply Brand Style
            </button>
          </div>
        </div>
      )}

      {/* Style Grid - addresses quality consistency concerns */}
      <div className="grid grid-cols-2 gap-3">
        {STYLE_PRESETS.map((style) => (
          <button
            key={style.id}
            type="button"
            onClick={() => handleStyleSelect(style)}
            className={`p-3 rounded-lg border transition-all text-left ${
              selectedStyle === style.id
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{style.icon}</span>
              <span className="font-medium text-white text-sm">{style.name}</span>
            </div>
            <p className="text-xs text-white/60">{style.description}</p>
          </button>
        ))}
      </div>

      {/* Trust & Privacy Badge - addresses privacy concerns */}
      <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 p-2 rounded-lg">
        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
        <span>We don't train on your images • Private by default</span>
        <a href="/privacy" className="underline hover:text-green-300">Policy</a>
      </div>
    </div>
  );
}
