"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserSupabase } from "@/lib/supabaseClient";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

type Project = {
  id: string;
  input_image_url: string | null;
  output_image_url: string | null;
  prompt: string | null;
  created_at?: string;
};

export default function DashboardPage() {
  const router = useRouter();
  const { isAuthenticated, loading, user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // Lightbox
  const [deletingId, setDeletingId] = useState<string | null>(null); // Confirm modal
  const [page, setPage] = useState(1);
  const pageSize = 12;

  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace("/login");
  }, [loading, isAuthenticated, router]);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const supabase = createBrowserSupabase();
      const { data, error } = await supabase
        .from("projects")
        .select("id,input_image_url,output_image_url,prompt,created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .range(0, page * pageSize - 1);
      if (error) return;
      setProjects(data || []);
    })();
  }, [user, page]);

  const hasMore = useMemo(() => (projects?.length ?? 0) >= page * pageSize, [projects, page, pageSize]);

  // NOTE: Section génération SUPPRIMÉE du dashboard (upload + prompt + bouton)

  async function handleDelete(projectId: string) {
    try {
      const supabase = createBrowserSupabase();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Erreur suppression");
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur inconnue");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-8 h-8 border-4 border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="container py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold tracking-tight">ImageAI</Link>
          <div className="flex items-center gap-2">
            <Link href="/generate" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40">🚀 Générer</Link>
            <Link href="/" className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 transition hover:bg-white hover:text-black focus-visible:ring-2 focus-visible:ring-white/40">← Retour à la landing</Link>
          </div>
        </div>
      </header>

      <div className="container py-10 min-h-screen">
      <h1 className="text-2xl font-semibold mb-6">Mes images</h1>
      {error && <div className="mb-4 text-sm text-red-300">{error}</div>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {projects.map((p) => (
            <div key={p.id} className="card p-3 rounded-xl border border-white/10 bg-white/5 group overflow-hidden">
            <div className="relative">
              <button
                className="absolute right-2 top-2 z-10 rounded-full bg-black/50 px-2 py-1 text-xs text-white/90 opacity-0 group-hover:opacity-100 transition"
                onClick={() => setPreviewUrl(p.output_image_url || p.input_image_url || null)}
                aria-label="Agrandir"
              >Agrandir</button>
              {p.output_image_url ? (
                <img
                  src={p.output_image_url}
                  alt="Image générée"
                  className="w-full rounded-lg aspect-square object-cover"
                  loading="lazy"
                />
              ) : p.input_image_url ? (
                <img
                  src={p.input_image_url}
                  alt="Image d'entrée"
                  className="w-full rounded-lg aspect-square object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full rounded-lg aspect-square grid place-items-center text-white/50">Aperçu indisponible</div>
              )}
            </div>

              <div className="mt-3 space-y-2">
              <div className="text-xs text-white/50 flex items-center justify-between">
                <span>{p.created_at ? formatDistanceToNow(new Date(p.created_at), { addSuffix: true, locale: fr }) : ""}</span>
                <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] text-white/70">Privé</span>
              </div>
              {p.prompt && (
                <div className="text-sm text-white/80 line-clamp-2" title={p.prompt || undefined}>{p.prompt}</div>
              )}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={(p.output_image_url || p.input_image_url) ?? '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary btn-sm w-full sm:w-auto"
                >Télécharger</a>
                <button
                  className="btn-ghost btn-sm w-full sm:w-auto"
                  onClick={() => setDeletingId(p.id)}
                >Supprimer</button>
                <Link href={{ pathname: "/generate", query: p.prompt ? { prompt: p.prompt } : {} }} className="btn-ghost btn-sm w-full sm:w-auto">Régénérer</Link>
              </div>
            </div>
          </div>
        ))}
        {projects.length === 0 && (
          <div className="card p-8 rounded-2xl border border-white/10 bg-white/5 text-center">
            <div className="text-xl">Aucune image pour l’instant</div>
            <div className="text-white/60 mt-1">Génère ta première image pour la voir ici.</div>
            <Link href="/generate" className="btn-primary btn-md mt-4 inline-flex">🚀 Aller à la génération</Link>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="mt-6 flex justify-center">
          <button className="btn-secondary" onClick={() => setPage((p) => p + 1)}>Charger plus</button>
        </div>
      )}

      {/* Lightbox simple */}
      {previewUrl && (
        <div className="fixed inset-0 z-[60] bg-black/80 grid place-items-center p-4" onClick={() => setPreviewUrl(null)}>
          <img src={previewUrl} alt="Aperçu" className="max-h-[90vh] max-w-[90vw] rounded-lg" />
        </div>
      )}

      {/* Confirm suppression */}
      {deletingId && (
        <div className="fixed inset-0 z-[70] bg-black/70 grid place-items-center p-4">
          <div className="card p-6 rounded-2xl border border-white/10 bg-white/5 max-w-sm w-full">
            <div className="text-lg font-medium">Supprimer l’image ?</div>
            <div className="text-white/70 mt-1">Cette action est irréversible.</div>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-ghost" onClick={() => setDeletingId(null)}>Annuler</button>
              <button
                className="btn-primary"
                onClick={async () => { await handleDelete(deletingId); setDeletingId(null); }}
              >Supprimer</button>
            </div>
          </div>
        </div>
      )}
      </div>
    </>
  );
}


