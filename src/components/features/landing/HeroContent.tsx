"use client";
import { memo } from "react";

export const HeroContent = memo(function HeroContent() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Transforme tes images
          </span>
          <br />
          <span className="text-white">
            avec l&apos;IA
          </span>
        </h1>
        
        <p className="text-xl text-white/80 max-w-2xl">
          L&apos;outil IA qui transforme tes photos avec un simple prompt. 
          Aucune compétence technique requise.
        </p>
      </div>

      <div className="flex flex-wrap gap-4 text-sm text-white/60">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span>2,847 créateurs actifs</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full" />
          <span>+50,000 images transformées</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-purple-400 rounded-full" />
          <span>Chiffrement SSL 256-bit</span>
        </div>
      </div>
    </div>
  );
});
