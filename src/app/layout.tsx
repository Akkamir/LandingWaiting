import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClientProviders } from "@/components/providers/ClientProviders";
import "./globals.css";

// Optimisation: Preload de la police critique
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap", // Optimise le chargement de la police
  preload: true,
});

        export const metadata: Metadata = {
          title: "ImageAI — Transforme tes images avec l'IA",
          description: "L'outil IA qui transforme tes photos avec un simple prompt. Aucune compétence technique requise.",
        };

// Optimisation: Viewport séparé pour éviter les warnings
export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0B0B0C",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <head>
        {/* Optimisation: Preload des assets critiques (seulement sur la page d'accueil) */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        {/* Favicon pour éviter l'erreur 500 */}
        <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎯</text></svg>" />
        {/* Anti-FOUC: CSS critique optimisé */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Optimisation: CSS critique pour le rendu initial */
            body { 
              background: #0B0B0C; 
              color: #ffffff; 
              font-family: var(--font-inter), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
            
            /* Prévention CLS - dimensions fixes pour les éléments critiques */
            .hero-title { 
              min-height: 1.2em; 
              contain: layout style paint;
            }
            .hero-subtitle { 
              min-height: 1.4em; 
              contain: layout style paint;
            }
            
            /* Optimisation Lottie - dimensions stables */
            .lottie-container { 
              aspect-ratio: 16/9; 
              contain: layout style paint;
              min-height: 200px;
              background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
            }
            
            /* Optimisation: Skeleton loader pour éviter les flashs */
            .skeleton {
              background: linear-gradient(90deg, #2a2a2a 25%, #3a3a3a 50%, #2a2a2a 75%);
              background-size: 200% 100%;
              animation: loading 1.5s infinite;
            }
            
            @keyframes loading {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
            
            /* Optimisation: will-change seulement quand nécessaire */
            .will-change-transform { will-change: transform; }
            .will-change-auto { will-change: auto; }
          `
        }} />
      </head>
      <body className="antialiased bg-app">
        <ClientProviders>
          {children}
        </ClientProviders>
        <SpeedInsights />
      </body>
    </html>
  );
}
