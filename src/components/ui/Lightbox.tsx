import Image from "next/image";

interface LightboxProps {
  open: boolean;
  src?: string;
  onClose: () => void;
}

export function Lightbox({ open, src, onClose }: LightboxProps) {
  if (!open) return null;

  return (
    <button 
      aria-label="Fermer" 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center" 
      onClick={onClose}
    >
      <div className="relative w-[90vw] max-w-3xl aspect-video">
        {src && (
          <Image 
            src={src} 
            alt="aperçu" 
            fill 
            sizes="90vw" 
            style={{ objectFit: "contain" }} 
            priority 
          />
        )}
      </div>
    </button>
  );
}
