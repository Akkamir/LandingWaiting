import Image from "next/image";

interface ImagePreviewProps {
  view: "original" | "result" | "side";
  previewUrl: string | null;
  resultUrl: string | null;
  loading: boolean;
}

export function ImagePreview({ view, previewUrl, resultUrl, loading }: ImagePreviewProps) {
  if (!previewUrl && !resultUrl && !loading) {
    return (
      <div className="text-white/50 text-sm text-center">Aucune image sélectionnée</div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full animate-pulse bg-white/5 rounded-xl" aria-busy="true" aria-live="polite" />
    );
  }

  if (view === "original" && previewUrl) {
    return (
      <div className="relative w-full h-full">
        <Image 
          src={previewUrl} 
          alt="Prévisualisation" 
          fill 
          sizes="(max-width: 768px) 100vw, 50vw" 
          style={{ objectFit: "contain" }} 
          className="rounded-xl"
        />
      </div>
    );
  }

  if (view === "result" && resultUrl) {
    return (
      <div className="relative w-full h-full">
        <Image 
          src={resultUrl} 
          alt="Image générée" 
          fill 
          sizes="(max-width: 768px) 100vw, 50vw" 
          style={{ objectFit: "contain" }} 
          className="rounded-xl"
        />
      </div>
    );
  }

  if (view === "side" && (previewUrl || resultUrl)) {
    return (
      <div className="grid grid-cols-2 w-full h-full gap-2">
        <div className="relative">
          <Image 
            src={previewUrl || resultUrl || ''} 
            alt="Original" 
            fill 
            sizes="(max-width: 768px) 50vw, 25vw" 
            style={{ objectFit: "contain" }} 
            className="rounded-l-xl border-r border-white/10" 
          />
        </div>
        <div className="relative">
          <Image 
            src={resultUrl || previewUrl || ''} 
            alt="Résultat" 
            fill 
            sizes="(max-width: 768px) 50vw, 25vw" 
            style={{ objectFit: "contain" }} 
            className="rounded-r-xl"
          />
        </div>
      </div>
    );
  }

  return null;
}
