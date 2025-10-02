interface SizePreset {
  id: string;
  name: string;
  dimensions: string;
  description: string;
  icon: string;
  width: number;
  height: number;
}

const sizePresets: SizePreset[] = [
  {
    id: 'instagram-pfp',
    name: 'Instagram PFP',
    dimensions: '400×400',
    description: 'Photo de profil Instagram',
    icon: '📸',
    width: 400,
    height: 400
  },
  {
    id: 'linkedin-banner',
    name: 'Bannière LinkedIn',
    dimensions: '1584×396',
    description: 'Bannière LinkedIn professionnelle',
    icon: '💼',
    width: 1584,
    height: 396
  },
  {
    id: 'marketplace-square',
    name: 'Marketplace',
    dimensions: '2000×2000',
    description: 'Carré pour marketplaces',
    icon: '🛍️',
    width: 2000,
    height: 2000
  },
  {
    id: 'facebook-cover',
    name: 'Facebook Cover',
    dimensions: '1200×630',
    description: 'Image de couverture Facebook',
    icon: '📘',
    width: 1200,
    height: 630
  },
  {
    id: 'twitter-header',
    name: 'Twitter Header',
    dimensions: '1500×500',
    description: 'En-tête Twitter',
    icon: '🐦',
    width: 1500,
    height: 500
  }
];

interface PlatformSizePresetsProps {
  onSizeSelect: (preset: SizePreset) => void;
  selectedSize?: string;
  className?: string;
}

export function PlatformSizePresets({ onSizeSelect, selectedSize, className = "" }: PlatformSizePresetsProps) {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="text-sm font-medium text-white/80">
        Ou choisir un format de plateforme :
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {sizePresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => onSizeSelect(preset)}
            className={`p-3 rounded-lg border transition-all duration-200 text-left ${
              selectedSize === preset.id
                ? 'border-blue-500 bg-blue-500/10 shadow-md shadow-blue-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
            aria-label={`Sélectionner le format ${preset.name}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{preset.icon}</span>
              <span className="font-medium text-white text-xs">
                {preset.name}
              </span>
            </div>
            <div className="text-xs text-white/60">
              {preset.dimensions}
            </div>
            <div className="text-xs text-white/50 mt-1">
              {preset.description}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { sizePresets };
export type { SizePreset };
