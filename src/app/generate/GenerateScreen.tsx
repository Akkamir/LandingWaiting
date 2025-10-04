'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ImageUpload } from '@/components/generate/ImageUpload';
import { ImagePreview } from '@/components/generate/ImagePreview';
import { PresetPills } from '@/components/ui/PresetPills';
import { PlatformSizePresets } from '@/components/ui/PlatformSizePresets';
import { PrivacyControls, type PrivacySettings } from '@/components/ui/PrivacyControls';
import { BeforeAfterSlider } from '@/components/ui/BeforeAfterSlider';
import { useImageGeneration } from '@/hooks/useImageGeneration';

export default function GenerateScreen() {
  // ❗ Hooks MUST be unconditional – no early returns above this line
  const [selectedPreset, setSelectedPreset] = useState<string>();
  const [selectedSize, setSelectedSize] = useState<string>();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    autoDelete: true, noStorage: true, noTraining: true,
  });
  const [showOnboarding, setShowOnboarding] = useState(true);

  const {
    file, prompt, setPrompt, loading, resultUrl, error,
    view, setView, handleFileChange, handleSubmit, handleReset, handleDownload,
  } = useImageGeneration();   // ⬅️ Always called

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">ImageAI</Link>
          <Link href="/" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40">← Retour à la landing</Link>
        </div>
      </header>

      <section className="min-h-screen section-gradient">
        <div className="container py-6 md:py-8 grid gap-8 lg:grid-cols-2 items-start">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Génération d&apos;image IA</h1>
            <p className="mt-2 text-white/70">
              Transforme ton image avec un prompt.
              <span className="block text-white/50 text-sm mt-1">Chemin rapide: image → prompt → Générer → aperçu → télécharger.</span>
            </p>

            <form className="mt-6 space-y-6" onSubmit={handleSubmit} aria-label="Formulaire de génération">
              {showOnboarding && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">👋</div>
                    <div className="flex-1">
                      <div className="font-medium text-white mb-2">Bienvenue ! Voici comment transformer vos photos :</div>
                      <div className="text-sm text-white/70 space-y-1">
                        <div>1. Ajoutez votre photo</div>
                        <div>2. Choisissez un style ou décrivez votre transformation</div>
                        <div>3. Téléchargez le résultat</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowOnboarding(false)}
                        className="text-blue-400 text-sm mt-2 hover:text-blue-300"
                      >
                        Compris, ne plus afficher
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <ImageUpload file={file} onFileChange={handleFileChange} error={error} />

              <PresetPills
                onPresetSelect={(preset) => { setSelectedPreset(preset.id); setPrompt(preset.prompt); }}
                selectedPreset={selectedPreset}
              />

              <PlatformSizePresets
                onSizeSelect={(size) => setSelectedSize(size.id)}
                selectedSize={selectedSize}
              />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <label htmlFor="prompt" className="text-sm text-white/80 font-medium">
                    Ou décrivez votre transformation
                  </label>
                  <div className="text-xs text-white/50">Soyez précis pour de meilleurs résultats</div>
                </div>
                <textarea
                  id="prompt"
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/50"
                  rows={3}
                  placeholder="Ex: 'Améliore l'éclairage de ce portrait', 'Supprime l'arrière-plan', 'Restaure cette photo ancienne'"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  aria-describedby="prompt-help"
                />
                <div id="prompt-help" className="mt-2 text-xs text-white/60">
                  💡 Exemples : "Nettoyer l'arrière-plan", "Améliorer l'éclairage", "Restaure cette photo vintage"
                </div>
              </div>

              <PrivacyControls onSettingsChange={setPrivacySettings} />

              <div className="flex items-center gap-3">
                <button type="submit" className="btn-primary btn-lg" disabled={loading || !file || prompt.trim().length < 8}>
                  {loading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Génération…
                    </span>
                  ) : 'Générer'}
                </button>

                <button type="button" className="btn-ghost btn-lg" onClick={handleReset}>Réinitialiser</button>

                {resultUrl && (
                  <button type="button" onClick={handleDownload} className="btn-secondary btn-lg">
                    Télécharger
                  </button>
                )}
              </div>
            </form>

            {error && <div role="alert" className="mt-4 text-red-300 text-sm">{error}</div>}
          </div>

          <div className="flex flex-col">
            <div className="mb-3 flex gap-2 flex-shrink-0">
              <button className="tab-pill" aria-selected={view === 'original'} onClick={() => setView('original')}>Original</button>
              <button className="tab-pill" aria-selected={view === 'result'} onClick={() => setView('result')}>Résultat</button>
              <button className="tab-pill" aria-selected={view === 'side'} onClick={() => setView('side')}>Côte à côte</button>
            </div>

            <div className="card overflow-hidden rounded-2xl w-full h-[clamp(18rem,40vh,32rem)] md:h-[clamp(20rem,45vh,34rem)] relative">
              {view === 'side' && previewUrl && resultUrl ? (
                <BeforeAfterSlider
                  beforeImage={previewUrl}
                  afterImage={resultUrl}
                  beforeLabel="Original"
                  afterLabel="Transformé"
                  className="w-full h-full"
                />
              ) : (
                <ImagePreview view={view} previewUrl={previewUrl} resultUrl={resultUrl} loading={loading} />
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
