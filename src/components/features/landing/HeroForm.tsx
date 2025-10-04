"use client";
import { memo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface HeroFormProps {
  email: string;
  status: "idle" | "loading" | "success" | "error";
  message: string;
  onEmailChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const HeroForm = memo(function HeroForm({
  email,
  status,
  message,
  onEmailChange,
  onSubmit
}: HeroFormProps) {
  return (
    <div className="space-y-6">
      <div className="text-center lg:text-left">
        <h2 className="text-2xl font-semibold text-white mb-2">
          Commence gratuitement
        </h2>
        <p className="text-white/70">
          Rejoins les milliers de créateurs qui transforment déjà leurs images.
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="ton@email.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          error={status === "error" ? message : undefined}
          className="w-full"
          required
        />
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={status === "loading"}
          className="w-full"
        >
          {status === "loading" ? "Inscription..." : "Essayer gratuitement"}
        </Button>
        
        {status === "success" && (
          <p className="text-green-400 text-sm text-center">
            ✅ {message}
          </p>
        )}
      </form>

      <p className="text-xs text-white/50 text-center">
        Aucun spam. Désinscription en un clic.
      </p>
    </div>
  );
});
