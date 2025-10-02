"use client";
import { useEffect, useMemo } from "react";
import Link from "next/link";
import { ImageUpload } from "@/components/generate/ImageUpload";
import { ImagePreview } from "@/components/generate/ImagePreview";
import { useImageGeneration } from "@/hooks/useImageGeneration";

export default function GeneratePage() {
  const {
    file,
    prompt,
    setPrompt,
    loading,
    resultUrl,
    error,
    view,
    setView,
    handleFileChange,
    handleSubmit,
    handleReset,
    handleDownload
  } = useImageGeneration();

  // URL de prévisualisation locale de l'image choisie
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container py-3 flex items-center justify-between">
                  <Link href="/" className="font-semibold tracking-tight">ImageAI</Link>
          <Link href="/" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40">← Retour à la landing</Link>
        </div>
      </header>
    <section className="h-screen section-gradient overflow-hidden">
      <div className="container h-full py-6 md:py-8 grid gap-6 md:grid-cols-2 items-stretch">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Génération d&apos;image IA</h1>
          <p className="mt-2 text-white/70">Transforme ton image avec un prompt.
            <span className="block text-white/50 text-sm mt-1">Chemin rapide: image → prompt → Générer → aperçu → télécharger.</span>
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit} aria-label="Formulaire de génération">
            <ImageUpload 
              file={file} 
              onFileChange={handleFileChange} 
              error={error} 
            />
            
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="prompt" className="text-sm text-white/80">Prompt</label>
                <div className="text-xs text-white/50">Ex: « Met un chapeau au personnage, style studio, fond blanc »</div>
              </div>
              <textarea
                id="prompt"
                className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/50"
                rows={4}
                placeholder="Décris la transformation souhaitée…"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                aria-describedby="prompt-help"
              />
              <div id="prompt-help" className="mt-1 text-xs text-white/60">
                Astuce: Sois précis. Ex: 'Style aquarelle, fond blanc, éclairage doux'.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary btn-lg" disabled={loading || !file || prompt.trim().length < 8}>
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                    Génération…
                  </span>
                ) : (
                  "Générer"
                )}
              </button>
              <button type="button" className="btn-ghost btn-lg" onClick={handleReset}>
                Réinitialiser
              </button>
              {resultUrl && (
                <button type="button" onClick={handleDownload} className="btn-secondary btn-lg">
                  Télécharger
                </button>
              )}
            </div>
          </form>

          {error && <div role="alert" className="mt-4 text-red-300 text-sm">{error}</div>}
        </div>

        <div className="flex flex-col h-full">
          <div className="mb-3 flex gap-2 flex-shrink-0">
            <button className="tab-pill" aria-selected={view==='original'} onClick={() => setView('original')}>Original</button>
            <button className="tab-pill" aria-selected={view==='result'} onClick={() => setView('result')}>Résultat</button>
            <button className="tab-pill" aria-selected={view==='side'} onClick={() => setView('side')}>Côte à côte</button>
          </div>
          <div className="card overflow-hidden rounded-2xl w-full flex-1 flex items-center justify-center min-h-0 preview-panel">
            <ImagePreview 
              view={view}
              previewUrl={previewUrl}
              resultUrl={resultUrl}
              loading={loading}
            />
          </div>
        </div>
      </div>
    </section>
    </>
  );
}


