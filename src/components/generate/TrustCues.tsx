import { useState, useEffect } from "react";

interface TrustCuesProps {
  loading: boolean;
  resultUrl: string | null;
  error: string | null;
}

export function TrustCues({ loading, resultUrl, error }: TrustCuesProps) {
  const [showPrivacy, setShowPrivacy] = useState(false);

  // Auto-hide privacy notice after 5 seconds
  useEffect(() => {
    if (resultUrl) {
      const timer = setTimeout(() => setShowPrivacy(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [resultUrl]);

  return (
    <div className="space-y-3">
      {/* Privacy & Trust Badges */}
      <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 p-2 rounded-lg">
        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
        <span>We don't train on your images • Private by default</span>
        <button
          type="button"
          onClick={() => setShowPrivacy(!showPrivacy)}
          className="underline hover:text-green-300"
        >
          Learn more
        </button>
      </div>

      {/* Expanded Privacy Info */}
      {showPrivacy && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-xs text-blue-200">
          <div className="font-medium mb-2">🔒 Your Privacy is Protected</div>
          <ul className="space-y-1 text-blue-100/80">
            <li>• Images are processed securely and deleted immediately</li>
            <li>• No training data is collected from your uploads</li>
            <li>• All processing happens in isolated environments</li>
            <li>• You retain full ownership of generated images</li>
          </ul>
        </div>
      )}

      {/* Processing Feedback */}
      {loading && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-blue-300 text-sm">
            <div className="w-4 h-4 border-2 border-blue-300 border-t-transparent rounded-full animate-spin"></div>
            <span>AI is transforming your image...</span>
          </div>
          <div className="text-xs text-blue-200/60 mt-1">
            This usually takes 6-10 seconds. Please don't close this page.
          </div>
        </div>
      )}

      {/* Success Feedback */}
      {resultUrl && !loading && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-green-300 text-sm">
            <span className="text-green-400">✓</span>
            <span>Image generated successfully!</span>
          </div>
          <div className="text-xs text-green-200/60 mt-1">
            Your image is ready for download or sharing.
          </div>
        </div>
      )}

      {/* Error Feedback */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-red-300 text-sm">
            <span className="text-red-400">⚠️</span>
            <span>Generation failed</span>
          </div>
          <div className="text-xs text-red-200/60 mt-1">
            {error}. Try adjusting your prompt or uploading a different image.
          </div>
          <div className="mt-2 text-xs text-red-200/60">
            <strong>Tips:</strong> Use clear, descriptive prompts. Ensure image is high quality (min. 200x200px).
          </div>
        </div>
      )}

      {/* Usage Limits */}
      <div className="text-xs text-white/50 text-center">
        Free tier: 5 generations per day • 
        <button className="underline hover:text-white/70 ml-1">
          Upgrade for unlimited
        </button>
      </div>
    </div>
  );
}
