import { useState } from "react";

interface PrivacyControlsProps {
  onSettingsChange: (settings: PrivacySettings) => void;
  className?: string;
}

export interface PrivacySettings {
  autoDelete: boolean;
  noStorage: boolean;
  noTraining: boolean;
}

export function PrivacyControls({ onSettingsChange, className = "" }: PrivacyControlsProps) {
  const [settings, setSettings] = useState<PrivacySettings>({
    autoDelete: true,
    noStorage: true,
    noTraining: true
  });

  const handleSettingChange = (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm font-medium text-white/80 mb-3">
        Contrôles de confidentialité :
      </div>
      
      <div className="space-y-3">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.autoDelete}
            onChange={(e) => handleSettingChange('autoDelete', e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
          />
          <div className="flex-1">
            <div className="text-sm text-white font-medium">
              Supprimer automatiquement après traitement
            </div>
            <div className="text-xs text-white/60 mt-1">
              Vos images sont supprimées dès que le traitement est terminé
            </div>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.noStorage}
            onChange={(e) => handleSettingChange('noStorage', e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
          />
          <div className="flex-1">
            <div className="text-sm text-white font-medium">
              Ne pas stocker mes images
            </div>
            <div className="text-xs text-white/60 mt-1">
              Aucun stockage permanent de vos fichiers
            </div>
          </div>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={settings.noTraining}
            onChange={(e) => handleSettingChange('noTraining', e.target.checked)}
            className="mt-1 w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500 focus:ring-2"
          />
          <div className="flex-1">
            <div className="text-sm text-white font-medium">
              Ne pas utiliser pour l'entraînement IA
            </div>
            <div className="text-xs text-white/60 mt-1">
              Vos images ne sont jamais utilisées pour améliorer nos modèles
            </div>
          </div>
        </label>
      </div>

      {/* Badges de confiance */}
      <div className="flex flex-wrap gap-2 mt-4">
        <div className="inline-flex items-center gap-1 bg-green-500/10 border border-green-500/20 rounded-full px-3 py-1 text-xs text-green-400">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          Chiffrement SSL 256-bit
        </div>
        <div className="inline-flex items-center gap-1 bg-blue-500/10 border border-blue-500/20 rounded-full px-3 py-1 text-xs text-blue-400">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Pas d'entraînement sur vos photos
        </div>
        <div className="inline-flex items-center gap-1 bg-purple-500/10 border border-purple-500/20 rounded-full px-3 py-1 text-xs text-purple-400">
          <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
          Suppression automatique
        </div>
      </div>
    </div>
  );
}
