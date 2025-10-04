"use client";
import { memo } from "react";
import { HeroForm } from "./HeroForm";
import { HeroContent } from "./HeroContent";
import { HeroAnimation } from "./HeroAnimation";

interface HeroSectionProps {
  email: string;
  status: "idle" | "loading" | "success" | "error";
  message: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const HeroSection = memo(function HeroSection({
  email,
  status,
  message,
  onEmailChange,
  onSubmit
}: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20" />
      
      <div className="container relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Content */}
        <HeroContent />
        
        {/* Form */}
        <HeroForm
          email={email}
          status={status}
          message={message}
          onEmailChange={onEmailChange}
          onSubmit={onSubmit}
        />
        
        {/* Animation */}
        <div className="lg:col-span-2 flex justify-center mt-8">
          <HeroAnimation />
        </div>
      </div>
    </section>
  );
});
