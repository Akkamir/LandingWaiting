export function Footer() {
  return (
    <footer className="container py-12 text-center text-sm text-neutral-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span>© {new Date().getFullYear()} ImageAI</span>
          <span>•</span>
          <a href="/privacy" className="hover:text-white transition-colors">Confidentialité</a>
          <span>•</span>
          <a href="/terms" className="hover:text-white transition-colors">Conditions</a>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>Service sécurisé</span>
        </div>
      </div>
    </footer>
  );
}
