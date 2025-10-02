"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ImageUpload } from "@/components/generate/ImageUpload";
import { ImagePreview } from "@/components/generate/ImagePreview";
import { StylePresets } from "@/components/generate/StylePresets";
import { PromptAssist } from "@/components/generate/PromptAssist";
import { BatchVariants } from "@/components/generate/BatchVariants";
import { BeforeAfterSlider } from "@/components/generate/BeforeAfterSlider";
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

  // New state for enhanced UX
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [variantCount, setVariantCount] = useState(1);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);
  const [generationSeed, setGenerationSeed] = useState<string | null>(null);

  // URL de prévisualisation locale de l'image choisie
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // Enhanced handlers
  const handleStyleSelect = (style: string | null) => {
    setSelectedStyle(style);
  };

  const handleSizeToggle = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const handleVariantCountChange = (count: number) => {
    setVariantCount(count);
  };

  const handleBatchGenerate = async () => {
    setIsGeneratingBatch(true);
    // TODO: Implement batch generation logic
    setTimeout(() => setIsGeneratingBatch(false), 3000);
  };

  const handleRegenerate = () => {
    // TODO: Implement regeneration with same seed
    console.log('Regenerating with seed:', generationSeed);
  };

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">ImageAI</Link>
          <Link href="/" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40">← Retour à la landing</Link>
        </div>
      </header>
      
      <section className="min-h-screen section-gradient overflow-hidden">
        <div className="container py-6 md:py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              Transform any image into on-brand visuals—in seconds
            </h1>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Upload, choose a style or paste a prompt, and export platform-ready variants. 
              We never train on your images.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left Panel - Controls */}
            <div className="lg:col-span-1 space-y-6">

              {/* Image Upload */}
              <ImageUpload 
                file={file} 
                onFileChange={handleFileChange} 
                error={error} 
              />

              {/* Style Presets */}
              <StylePresets
                selectedStyle={selectedStyle}
                onStyleSelect={handleStyleSelect}
                onPromptUpdate={setPrompt}
              />

              {/* Prompt Assistant */}
              <PromptAssist
                currentPrompt={prompt}
                onPromptUpdate={setPrompt}
              />

              {/* Manual Prompt */}
              <div>
                <label htmlFor="prompt" className="block text-sm text-white/80 mb-2">Custom Prompt</label>
                <textarea
                  id="prompt"
                  className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  rows={3}
                  placeholder="Describe your transformation..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
              </div>

              {/* Batch & Variants */}
              <BatchVariants
                selectedSizes={selectedSizes}
                onSizeToggle={handleSizeToggle}
                variantCount={variantCount}
                onVariantCountChange={handleVariantCountChange}
                onGenerateBatch={handleBatchGenerate}
                isGenerating={isGeneratingBatch}
              />

              {/* Generate Button */}
              <button 
                type="button"
                onClick={handleSubmit}
                className="w-full btn-primary btn-lg" 
                disabled={loading || !file || prompt.trim().length < 8}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> 
                    Generating ~6-10s...
                  </span>
                ) : (
                  "Generate Now"
                )}
              </button>

              {error && <div role="alert" className="text-red-300 text-sm">{error}</div>}
            </div>

            {/* Right Panel - Preview & Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* Before/After Slider */}
              <BeforeAfterSlider
                originalUrl={previewUrl}
                resultUrl={resultUrl}
                onRegenerate={handleRegenerate}
                seed={generationSeed}
              />

              {/* Export Options */}
              {resultUrl && (
                <div className="card p-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Export Options</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="btn-primary btn-sm"
                    >
                      📦 Download Pack
                    </button>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(resultUrl)}
                      className="btn-secondary btn-sm"
                    >
                      📋 Copy to Clipboard
                    </button>
                  </div>
                  <div className="mt-3 text-xs text-white/60">
                    Download pack includes all selected sizes. Copy to clipboard for quick social media posting.
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


