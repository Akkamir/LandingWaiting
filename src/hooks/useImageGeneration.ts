import { useState, useCallback } from "react";
import { validateImageFile } from "@/lib/utils";

export function useImageGeneration() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"original" | "result" | "side">("original");
  const [generationHistory, setGenerationHistory] = useState<Array<{
    id: string;
    prompt: string;
    resultUrl: string;
    timestamp: Date;
  }>>([]);
  const [currentSeed, setCurrentSeed] = useState<string | null>(null);

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
        body: formData 
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Échec génération");
      
      setResultUrl(data.output_image_url);
      setView("result");
      
      // Store in history for undo functionality
      const newGeneration = {
        id: Date.now().toString(),
        prompt,
        resultUrl: data.output_image_url,
        timestamp: new Date()
      };
      setGenerationHistory(prev => [newGeneration, ...prev.slice(0, 4)]); // Keep last 5
      
      // Store seed for regeneration
      if (data.seed) {
        setCurrentSeed(data.seed);
      }
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

  const handleDownload = useCallback(() => {
    if (resultUrl) {
      const link = document.createElement('a');
      link.href = resultUrl;
      link.download = 'generated-image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [resultUrl]);

  // Regenerate with same seed
  const handleRegenerate = useCallback(async () => {
    if (!currentSeed || !file) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("prompt", prompt);
      formData.append("seed", currentSeed); // Use same seed for consistency
      
      const res = await fetch("/api/generate", { 
        method: "POST", 
        body: formData 
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Échec régénération");
      
      setResultUrl(data.output_image_url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur inconnue";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [currentSeed, file, prompt]);

  // Undo to previous generation
  const handleUndo = useCallback(() => {
    if (generationHistory.length > 1) {
      const previous = generationHistory[1];
      setResultUrl(previous.resultUrl);
      setPrompt(previous.prompt);
      setGenerationHistory(prev => prev.slice(1));
    }
  }, [generationHistory]);

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
    handleDownload,
    handleRegenerate,
    handleUndo,
    generationHistory,
    currentSeed
  };
}
