"use client";
import { useEffect, useState } from "react";

// Composant pour éviter les différences de rendu serveur/client
export default function NoSSR({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return <>{children}</>;
}
