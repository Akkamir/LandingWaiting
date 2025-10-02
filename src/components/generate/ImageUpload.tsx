import { useCallback, useEffect, useRef } from "react";
import { validateImageFile, formatFileSize } from "@/lib/utils";
import { clientRateLimit, logSecurityEvent } from "@/lib/security";

interface ImageUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  error: string | null;
}

export function ImageUpload({ file, onFileChange, error }: ImageUploadProps) {
  const dropRef = useRef<HTMLLabelElement | null>(null);

  const handleFileChange = useCallback((selectedFile: File | null) => {
    if (!selectedFile) {
      onFileChange(null);
      return;
    }

    // Rate limiting pour les uploads
    if (!clientRateLimit.isAllowed('image-upload')) {
      logSecurityEvent('Upload rate limit exceeded', { 
        fileName: selectedFile.name.substring(0, 10) + '***',
        fileSize: selectedFile.size 
      });
      return;
    }

    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      logSecurityEvent('Invalid file upload attempt', { 
        fileName: selectedFile.name.substring(0, 10) + '***',
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        error: validation.error
      });
      return;
    }

    // Log sécurisé de l'upload
    logSecurityEvent('File upload initiated', { 
      fileName: selectedFile.name.substring(0, 10) + '***',
      fileType: selectedFile.type,
      fileSize: selectedFile.size
    });

    onFileChange(selectedFile);
  }, [onFileChange]);

  // Drag & drop
  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    function prevent(e: DragEvent) { 
      e.preventDefault(); 
      e.stopPropagation(); 
    }

    function onDrop(e: DragEvent) {
      prevent(e);
      const droppedFile = e.dataTransfer?.files?.[0] || null;
      handleFileChange(droppedFile);
    }

    el.addEventListener("dragover", prevent);
    el.addEventListener("drop", onDrop);
    
    return () => {
      el.removeEventListener("dragover", prevent);
      el.removeEventListener("drop", onDrop);
    };
  }, [handleFileChange]);

  return (
    <label 
      ref={dropRef} 
      htmlFor="file-upload" 
      className="card p-6 rounded-2xl block cursor-pointer border-dashed border-2 border-white/10 hover:border-white/20 transition"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="text-white/80">
          <div className="font-medium">Dépose ton image ici</div>
          <div className="text-sm text-white/60">PNG, JPG, WebP • &lt; 8 Mo</div>
        </div>
        <div className="btn-secondary btn-sm">Choisir un fichier</div>
      </div>
      
      <input
        id="file-upload"
        name="file"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="sr-only"
        aria-label="Sélectionner une image"
      />
      
      {file && (
        <div className="mt-3 text-xs text-white/60">
          Sélectionné: {file.name} ({formatFileSize(file.size)})
        </div>
      )}
    </label>
  );
}
