"use client";
import { useEffect, useMemo, useState } from "react";

export default function GeneratePage() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // URL de prévisualisation locale de l'image choisie
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResultUrl(null);
    if (!file) { setError("Sélectionne une image"); return; }
    if (!prompt.trim()) { setError("Écris un prompt"); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("image", file);
      fd.append("prompt", prompt);
      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Échec génération");
      setResultUrl(data.output_image_url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container py-3 flex items-center justify-between">
          <a href="/" className="font-semibold tracking-tight">ChroniQuest</a>
          <a href="/" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40">← Retour à la landing</a>
        </div>
      </header>
    <section className="min-h-screen section-gradient">
      <div className="container py-12 md:py-16 grid gap-8 md:grid-cols-2 items-start">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Génération d&apos;image IA</h1>
          <p className="mt-2 text-white/70">Transforme ton image avec un prompt.</p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div className="card p-4">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-white/80"
              />
            </div>
            <textarea
              className="w-full rounded-xl bg-white/5 border border-white/10 p-4 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[color:var(--color-accent)]/50"
              rows={4}
              placeholder="Décris la transformation souhaitée…"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
            <button type="submit" className="btn-primary btn-lg" disabled={loading}>
              {loading ? "Génération en cours…" : "Générer"}
            </button>
          </form>

          {error && <div className="mt-4 text-red-300 text-sm">{error}</div>}

          {resultUrl && (
            <div className="mt-8">
              <div className="text-sm text-white/70 mb-2">Résultat</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={resultUrl} alt="Image générée" className="card w-full max-w-xl" />
            </div>
          )}
        </div>

        <div className="sticky top-24">
          <div className="card overflow-hidden rounded-2xl w-full aspect-[4/5] flex items-center justify-center">
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Prévisualisation" className="w-full h-full object-contain" />
            ) : (
              <div className="text-white/50 text-sm">Aucune image sélectionnée</div>
            )}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}


