import Link from "next/link";
import { useHoverOptimization } from "@/components/OptimizedAnimations";
import { useAuth } from "@/components/providers/ClientAuthProvider";
import { useState } from "react";
import { AuthModal } from "@/components/auth/AuthModal";

const navigationItems = [
  { label: 'Produit', href: '#features' },
  { label: 'Prix', href: '#pricing' },
  { label: 'Ressources', href: '#faq' },
  { label: 'Communauté', href: '#testimonials' }
];

export function Header() {
  const { handleMouseEnter, handleMouseLeave } = useHoverOptimization();
  const { user, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
      <div className="container py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold tracking-tight" aria-label="ImageAI - Accueil">
          ImageAI
        </Link>
        
        <nav 
          className="hidden md:flex items-center gap-8 text-sm text-white/80" 
          role="navigation" 
          aria-label="Navigation principale"
        >
          {navigationItems.map((item) => (
            <a 
              key={item.label} 
              href={item.href} 
              className="relative group px-1 focus-visible:ring-2 focus-visible:ring-white/40"
              aria-label={`Aller à la section ${item.label}`}
            >
              <span className="group-hover:text-white">{item.label}</span>
              <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white/30 transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>
        
        {user ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-white/60">
              {user.email}
            </span>
            <button
              onClick={() => signOut()}
              className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition inline-flex hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAuthModal(true)}
            className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition inline-flex hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40"
          >
            <span className="hidden sm:inline">Se connecter</span>
            <span className="sm:hidden">🔐</span>
          </button>
        )}
      </div>
      
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </header>
  );
}
