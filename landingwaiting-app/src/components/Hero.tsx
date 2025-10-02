import Image from "next/image";

export default function Hero() {
  return (
    <section id="hero" className="container py-20 md:py-28">
      <div className="grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
            ChroniQuest
          </h1>
          <p className="mt-4 text-white/70 max-w-prose">
            Construis de meilleures habitudes de focus avec une app simple et élégante.
          </p>
        </div>
        <div className="relative aspect-video rounded-xl bg-white/[0.04] ring-1 ring-white/10 card" aria-hidden>
          <Image
            src="/next.svg"
            alt="aperçu"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            style={{ objectFit: "contain", padding: 24 }}
            priority
          />
        </div>
      </div>
    </section>
  );
}


