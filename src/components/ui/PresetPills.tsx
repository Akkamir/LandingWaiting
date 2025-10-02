interface Preset {
  id: string;
  name: string;
  description: string;
  icon: string;
  prompt: string;
  category: 'restoration' | 'social' | 'product' | 'enhancement';
}

const presets: Preset[] = [
  {
    id: 'enhance-faces',
    name: 'Améliorer les visages',
    description: 'Restaure et améliore les détails du visage',
    icon: '👤',
    prompt: 'Enhance facial features, improve skin texture, restore natural colors, professional portrait quality',
    category: 'enhancement'
  },
  {
    id: 'background-clean',
    name: 'Nettoyer l\'arrière-plan',
    description: 'Supprime ou nettoie l\'arrière-plan',
    icon: '🧹',
    prompt: 'Remove background, clean background, professional studio background, white background',
    category: 'social'
  },
  {
    id: 'portrait-relight',
    name: 'Éclairage portrait',
    description: 'Améliore l\'éclairage des portraits',
    icon: '💡',
    prompt: 'Improve lighting, professional portrait lighting, soft natural light, enhance shadows and highlights',
    category: 'enhancement'
  },
  {
    id: 'vintage-restore',
    name: 'Restauration vintage',
    description: 'Restaure les photos anciennes',
    icon: '📸',
    prompt: 'Restore vintage photo, fix scratches and damage, enhance colors, improve contrast and clarity',
    category: 'restoration'
  },
  {
    id: 'product-cutout',
    name: 'Découpe produit',
    description: 'Prépare les images pour le e-commerce',
    icon: '🛍️',
    prompt: 'Product photography, clean white background, professional e-commerce style, enhance product details',
    category: 'product'
  }
];

interface PresetPillsProps {
  onPresetSelect: (preset: Preset) => void;
  selectedPreset?: string;
  className?: string;
}

export function PresetPills({ onPresetSelect, selectedPreset, className = "" }: PresetPillsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm font-medium text-white/80 mb-3">
        Ou choisir un style prédéfini :
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((preset) => (
          <button
            key={preset.id}
            type="button"
            onClick={() => onPresetSelect(preset)}
            className={`p-4 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedPreset === preset.id
                ? 'border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20'
                : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
            }`}
            aria-label={`Sélectionner le style ${preset.name}`}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{preset.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm mb-1">
                  {preset.name}
                </div>
                <div className="text-xs text-white/60 leading-relaxed">
                  {preset.description}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

export { presets };
export type { Preset };
