import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ClientAuthProvider } from "@/components/providers/ClientAuthProvider";
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        {/* Anti-FOUC: CSS critique inline */}
        <style dangerouslySetInnerHTML={{
          __html: `
            body { 
              background: #0B0B0C; 
              color: #ffffff; 
              font-family: var(--font-inter), ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Helvetica Neue, Arial, "Apple Color Emoji", "Segoe UI Emoji";
              margin: 0;
              padding: 0;
            }
            .hero-title { min-height: 1.2em; }
            .hero-subtitle { min-height: 1.4em; }
            .lottie-container { aspect-ratio: 16/9; contain: layout style paint; }
          `
        }} />
      </head>
      <body className="antialiased bg-app">
        <ClientAuthProvider>
          {children}
          <SpeedInsights />
        </ClientAuthProvider>
      </body>
    </html>
  );
}
