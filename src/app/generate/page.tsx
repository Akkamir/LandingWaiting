"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

export default function GeneratePage() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [helper, setHelper] = useState<string | null>(
    "Ajoute une image et décris la modification. Ex: ‘Ajoute un chapeau rouge, style studio’."
  );
  const [view, setView] = useState<"original" | "result" | "side">("original");
  const dropRef = useRef<HTMLLabelElement | null>(null);

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
    if (!prompt.trim() || prompt.trim().length < 8) { setError("Prompt trop court (min. 8 caractères)"); return; }
    try {
      setLoading(true);
      const fd = new FormData();
      fd.append("image", file);
      fd.append("prompt", prompt);
      const res = await fetch("/api/generate", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Échec génération");
      setResultUrl(data.output_image_url);
      setView("result");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  // Validation fichier (type / taille) + micro-feedback
  const onPickFile = useCallback((f: File | null) => {
    setError(null);
    if (!f) { setFile(null); return; }
    const validTypes = ["image/png","image/jpeg","image/webp","image/jpg"];
    const maxMB = 8;
    if (!validTypes.includes(f.type)) { setError("Format non supporté. Utilise PNG, JPG ou WebP."); return; }
    if (f.size > maxMB * 1024 * 1024) { setError(`Image trop volumineuse (> ${maxMB} Mo)`); return; }
    setFile(f);
    setHelper("Astuce: Sois précis. Ex: ‘Style aquarelle, fond blanc, éclairage doux’. ");
    setView("original");
  }, []);

  // Drag & drop basique
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;
    function prevent(e: DragEvent) { e.preventDefault(); e.stopPropagation(); }
    function onDrop(e: DragEvent) {
      prevent(e);
      const f = e.dataTransfer?.files?.[0] || null;
      onPickFile(f);
    }
    el.addEventListener("dragover", prevent);
    el.addEventListener("drop", onDrop);
    return () => {
      el.removeEventListener("dragover", prevent);
      el.removeEventListener("drop", onDrop);
    };
  }, [onPickFile]);

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

          <form className="mt-6 space-y-4" onSubmit={onSubmit} aria-label="Formulaire de génération">
            {/* Zone drag & drop stylée avec fallback */}
            <label ref={dropRef} htmlFor="file" className="card p-6 rounded-2xl block cursor-pointer border-dashed border-2 border-white/10 hover:border-white/20 transition">
              <div className="flex items-center justify-between gap-4">
                <div className="text-white/80">
                  <div className="font-medium">Dépose ton image ici</div>
                  <div className="text-sm text-white/60">PNG, JPG, WebP • &lt; 8 Mo</div>
                </div>
                <div className="btn-secondary btn-sm">Choisir un fichier</div>
              </div>
              <input
                id="file"
                name="file"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => onPickFile(e.target.files?.[0] || null)}
                className="sr-only"
                aria-label="Sélectionner une image"
              />
              {file && (
                <div className="mt-3 text-xs text-white/60">Sélectionné: {file.name} ({Math.round(file.size/1024)} Ko)</div>
              )}
            </label>
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
              {helper && <div id="prompt-help" className="mt-1 text-xs text-white/60">{helper}</div>}
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary btn-lg" disabled={loading || !file || prompt.trim().length < 8}>
                {loading ? (
                  <span className="inline-flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Génération…</span>
                ) : (
                  "Générer"
                )}
              </button>
              <button type="button" className="btn-ghost btn-lg" onClick={() => { setFile(null); setPrompt(""); setResultUrl(null); setError(null); setView("original"); }}>Réinitialiser</button>
              {resultUrl && (
                <a href={resultUrl} download className="btn-secondary btn-lg">Télécharger</a>
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
            {!previewUrl && !resultUrl && !loading && (
              <div className="text-white/50 text-sm">Aucune image sélectionnée</div>
            )}
            {loading && (
              <div className="w-full h-full animate-pulse bg-white/5" aria-busy="true" aria-live="polite" />
            )}
            {!loading && view === "original" && previewUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={previewUrl} alt="Prévisualisation" className="max-w-full max-h-full object-contain" />
            )}
            {!loading && view === "result" && resultUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resultUrl} alt="Image générée" className="max-w-full max-h-full object-contain" />
            )}
            {!loading && view === "side" && (previewUrl || resultUrl) && (
              <div className="grid grid-cols-2 w-full h-full gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl || resultUrl || ''} alt="Original" className="max-w-full max-h-full object-contain border-r border-white/10" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resultUrl || previewUrl || ''} alt="Résultat" className="max-w-full max-h-full object-contain" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
    </>
  );
}


