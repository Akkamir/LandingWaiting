import { useState, useCallback } from "react";
import { validateImageFile } from "@/lib/utils";
import { useAuth } from "@/components/providers/ClientAuthProvider";

export function useImageGeneration() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"original" | "result" | "side">("original");
  const { session } = useAuth();

  const handleFileChange = useCallback((selectedFile: File | null) => {
    setError(null);
    if (!selectedFile) {
      setFile(null);
      return;
    }

    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error || "Erreur de validation");
      setFile(null);
      return;
    }

    setFile(selectedFile);
    setView("original");
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultUrl(null);

    if (!file) {
      setError("Sélectionne une image");
      return;
    }

    if (!prompt.trim() || prompt.trim().length < 8) {
      setError("Prompt trop court (min. 8 caractères)");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);
      formData.append("prompt", prompt);

      const res = await fetch("/api/generate", { 
        method: "POST", 
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: formData 
      });
      
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
  }, [file, prompt]);

  const handleReset = useCallback(() => {
    setFile(null);
    setPrompt("");
    setResultUrl(null);
    setError(null);
    setLoading(false);
    setView("original");
  }, []);

  const handleDownload = useCallback(async () => {
    if (!resultUrl) return;
    
    try {
      // Récupérer le fichier depuis l'URL
      const response = await fetch(resultUrl);
      if (!response.ok) throw new Error('Erreur lors du téléchargement');
      
      // Créer un blob à partir de la réponse
      const blob = await response.blob();
      
      // Créer un lien de téléchargement avec le blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      // Déterminer l'extension du fichier
      const extension = resultUrl.includes('.png') ? 'png' : 
                       resultUrl.includes('.jpg') || resultUrl.includes('.jpeg') ? 'jpg' : 'png';
      
      link.download = `image-generee-${Date.now()}.${extension}`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL du blob
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      // Fallback: ouvrir dans un nouvel onglet
      window.open(resultUrl, '_blank');
    }
  }, [resultUrl]);

  return {
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
  };
}
