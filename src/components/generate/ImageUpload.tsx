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
    <div className="space-y-3">
      <label 
        ref={dropRef} 
        htmlFor="file-upload" 
        className={`card p-6 rounded-2xl block cursor-pointer border-dashed border-2 transition-all duration-200 ${
          file 
            ? 'border-green-500/50 bg-green-500/5' 
            : error 
            ? 'border-red-500/50 bg-red-500/5' 
            : 'border-white/10 hover:border-white/20 hover:bg-white/5'
        }`}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="text-white/80">
            <div className="font-medium flex items-center gap-2">
              {file ? (
                <>
                  <span className="text-green-400">✓</span>
                  <span>Image sélectionnée</span>
                </>
              ) : (
                <>
                  <span className="text-blue-400">📁</span>
                  <span>Dépose ton image ici</span>
                </>
              )}
            </div>
            <div className="text-sm text-white/60">
              PNG, JPG, WebP • &lt; 8 Mo • Min. 200x200px
            </div>
          </div>
          <div className="btn-secondary btn-sm">
            {file ? 'Changer' : 'Choisir un fichier'}
          </div>
        </div>
        
        {/* Drag & Drop visual feedback */}
        <div className="mt-4 text-center">
          <div className="text-4xl mb-2">📸</div>
          <div className="text-sm text-white/50">
            {file ? 'Glisser-déposer pour remplacer' : 'Glisser-déposer ou cliquer pour sélectionner'}
          </div>
        </div>
      </label>
      
      <input
        id="file-upload"
        name="file"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
        className="sr-only"
        aria-label="Sélectionner une image"
      />
      
      {/* File info avec validation */}
      {file && (
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/80">
              <div className="font-medium">{file.name}</div>
              <div className="text-xs text-white/60">
                {formatFileSize(file.size)} • {file.type}
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleFileChange(null)}
              className="text-red-400 hover:text-red-300 text-sm"
              aria-label="Supprimer l'image"
            >
              ✕ Supprimer
            </button>
          </div>
        </div>
      )}
      
      {/* Error display avec guidance */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="text-red-300 text-sm font-medium mb-1">⚠️ Erreur d'upload</div>
          <div className="text-red-200 text-xs">{error}</div>
          <div className="text-red-200/60 text-xs mt-1">
            Formats acceptés: PNG, JPG, WebP • Taille max: 8 Mo • Dimensions min: 200x200px
          </div>
        </div>
      )}
    </div>
  );
}
