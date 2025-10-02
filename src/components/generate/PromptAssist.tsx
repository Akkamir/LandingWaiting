import { useState } from "react";

// Prompt suggestions basées sur la recherche - addresses prompt complexity concerns
const PROMPT_SUGGESTIONS = [
  {
    category: "E-commerce",
    suggestions: [
      "Clean product shot, white background",
      "Lifestyle product photography, natural lighting",
      "Product detail close-up, professional lighting"
    ]
  },
  {
    category: "Social Media", 
    suggestions: [
      "Instagram-worthy, vibrant colors",
      "LinkedIn professional, clean background",
      "TikTok trendy, eye-catching composition"
    ]
  },
  {
    category: "Marketing",
    suggestions: [
      "Brand consistent, on-message",
      "High-converting, commercial style",
      "A/B test ready, multiple variants"
    ]
  }
];

const PROMPT_EXAMPLES = [
  {
    good: "Make it look professional",
    better: "Professional product photography, clean white background, studio lighting, commercial quality",
    best: "Professional e-commerce product photography, clean white background, soft studio lighting, high resolution, commercial quality, consistent with brand guidelines"
  },
  {
    good: "Make it social media ready",
    better: "Social media optimized, vibrant colors, engaging composition, Instagram-worthy",
    best: "Social media optimized photography, vibrant colors, engaging composition, Instagram-worthy aesthetic, optimized for mobile viewing, high engagement potential"
  }
];

interface PromptAssistProps {
  currentPrompt: string;
  onPromptUpdate: (prompt: string) => void;
}

export function PromptAssist({ currentPrompt, onPromptUpdate }: PromptAssistProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    onPromptUpdate(suggestion);
    setShowSuggestions(false);
  };

  const handleRefinePrompt = () => {
    if (currentPrompt.length < 20) {
      // Expand short prompts
      const expanded = `Professional photography, ${currentPrompt}, high quality, commercial style, optimized for marketing use`;
      onPromptUpdate(expanded);
    } else {
      // Enhance existing prompts
      const enhanced = `${currentPrompt}, high quality, professional photography, commercial grade, optimized for business use`;
      onPromptUpdate(enhanced);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Prompt Assistant</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showSuggestions ? 'Hide' : 'Show'} Suggestions
          </button>
          <button
            type="button"
            onClick={() => setShowExamples(!showExamples)}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            {showExamples ? 'Hide' : 'Show'} Examples
          </button>
        </div>
      </div>

      {/* Refine Prompt Button - addresses prompt complexity */}
      <button
        type="button"
        onClick={handleRefinePrompt}
        className="w-full btn-secondary btn-sm"
      >
        ✨ Refine Prompt (Auto-enhance)
      </button>

      {/* Prompt Suggestions - addresses prompt complexity */}
      {showSuggestions && (
        <div className="space-y-3">
          {PROMPT_SUGGESTIONS.map((category) => (
            <div key={category.category}>
              <h4 className="text-sm font-medium text-white/80 mb-2">{category.category}</h4>
              <div className="space-y-1">
                {category.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full text-left text-xs text-white/70 hover:text-white hover:bg-white/5 p-2 rounded transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Good → Better → Best Examples - addresses quality consistency */}
      {showExamples && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-white/80">Good → Better → Best Examples</h4>
          {PROMPT_EXAMPLES.map((example, index) => (
            <div key={index} className="space-y-2">
              <div className="text-xs">
                <span className="text-red-400">❌ Good:</span>
                <span className="text-white/60 ml-2">{example.good}</span>
              </div>
              <div className="text-xs">
                <span className="text-yellow-400">⚠️ Better:</span>
                <span className="text-white/70 ml-2">{example.better}</span>
              </div>
              <div className="text-xs">
                <span className="text-green-400">✅ Best:</span>
                <span className="text-white/80 ml-2">{example.best}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Tips */}
      <div className="text-xs text-white/60 bg-white/5 p-3 rounded-lg">
        <strong>💡 Tips:</strong> Be specific about lighting, background, style, and use case. 
        Mention your target platform (social, e-commerce, marketing) for better results.
      </div>
    </div>
  );
}
