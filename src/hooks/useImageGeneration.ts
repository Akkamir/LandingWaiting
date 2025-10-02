import { useState, useCallback } from "react";
import { validateImageFile } from "@/lib/utils";

export function useImageGeneration() {
  const [file, setFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"original" | "result" | "side">("original");

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
