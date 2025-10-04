"use client";
import { useEffect, useState } from "react";

interface LottieFallbackProps {
  className?: string;
}

export default function LottieFallback({ className }: LottieFallbackProps) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div 
      className={`lottie-container ${className || ""}`}
      style={{
        aspectRatio: "16/9",
        contain: "layout style paint",
        minHeight: "200px",
        background: "linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}
    >
      <div className="text-center text-white/70">
        <div className="text-6xl mb-4 animate-bounce">🎯</div>
        <div className="text-lg font-medium">ImageAI</div>
        <div className="text-sm text-white/50 mt-1">
          Transforme tes images avec l'IA{dots}
        </div>
        <div className="mt-4 flex justify-center space-x-1">
          <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="w-2 h-2 bg-white/30 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}
