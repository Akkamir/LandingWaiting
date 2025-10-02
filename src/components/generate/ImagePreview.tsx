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
      <div className="text-white/50 text-sm">Aucune image sélectionnée</div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-full animate-pulse bg-white/5" aria-busy="true" aria-live="polite" />
    );
  }

  if (view === "original" && previewUrl) {
    return (
      <Image 
        src={previewUrl} 
        alt="Prévisualisation" 
        fill 
        sizes="(max-width: 768px) 100vw, 50vw" 
        style={{ objectFit: "contain" }} 
      />
    );
  }

  if (view === "result" && resultUrl) {
    return (
      <Image 
        src={resultUrl} 
        alt="Image générée" 
        fill 
        sizes="(max-width: 768px) 100vw, 50vw" 
        style={{ objectFit: "contain" }} 
      />
    );
  }

  if (view === "side" && (previewUrl || resultUrl)) {
    return (
      <div className="grid grid-cols-2 w-full h-full gap-2">
        <Image 
          src={previewUrl || resultUrl || ''} 
          alt="Original" 
          fill 
          sizes="(max-width: 768px) 50vw, 25vw" 
          style={{ objectFit: "contain" }} 
          className="border-r border-white/10" 
        />
        <Image 
          src={resultUrl || previewUrl || ''} 
          alt="Résultat" 
          fill 
          sizes="(max-width: 768px) 50vw, 25vw" 
          style={{ objectFit: "contain" }} 
        />
      </div>
    );
  }

  return null;
}
