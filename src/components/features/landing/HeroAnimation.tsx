"use client";
import { memo } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Skeleton";

// Lazy loading optimisé de l'animation Lottie
const LottieAnimation = dynamic(() => import("@/components/LottieAnimation"), {
  ssr: false,
  loading: () => <SkeletonImage className="w-full max-w-md mx-auto" />
});

export const HeroAnimation = memo(function HeroAnimation() {
  return (
    <div className="w-full max-w-md mx-auto">
      <LottieAnimation className="w-full h-auto" />
    </div>
  );
});

// Import du SkeletonImage depuis le composant Skeleton
import { SkeletonImage } from "@/components/ui/Skeleton";
