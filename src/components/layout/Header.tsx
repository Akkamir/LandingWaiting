import Link from "next/link";
import { useHoverOptimization } from "@/components/OptimizedAnimations";

const navigationItems = [
  { label: 'Produit', href: '#features' },
  { label: 'Prix', href: '#pricing' },
  { label: 'Ressources', href: '#faq' },
  { label: 'Communauté', href: '#testimonials' }
];

export function Header() {
  const { handleMouseEnter, handleMouseLeave } = useHoverOptimization();

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
        
        <Link 
          href="/login" 
          className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition inline-flex hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40 magnet min-h-[44px] min-w-[44px] items-center justify-center" 
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={(e) => {
            const target = e.currentTarget as HTMLAnchorElement;
            const rect = target.getBoundingClientRect();
            const relX = e.clientX - rect.left - rect.width/2;
            const relY = e.clientY - rect.top - rect.height/2;
            target.style.transform = `translate(${Math.max(Math.min(relX*0.06,10),-10)}px, ${Math.max(Math.min(relY*0.06,10),-10)}px)`;
          }}
          aria-label="Se connecter - Transformer mes images"
        >
          <span className="hidden sm:inline">Se connecter</span>
          <span className="sm:hidden">🚀</span>
        </Link>
      </div>
    </header>
  );
}
