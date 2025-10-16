import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function DELETE(_req: Request, context: any) {
  const supabase = getAdmin();
  if (!supabase) return NextResponse.json({ error: "Config manquante" }, { status: 503 });

  const id = context?.params?.id as string;

  // Auth via bearer token: vérifier que le projet appartient à l'utilisateur
  const authHeader = _req.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : undefined;
  if (!token) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  const { data: userRes } = await supabase.auth.getUser(token);
  const userId = userRes?.user?.id;
  if (!userId) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

  // Récupérer le projet pour vérifier la propriété et obtenir les chemins d’images
  const { data: project, error: fetchErr } = await supabase
    .from('projects')
    .select('id,user_id,input_image_url,output_image_url')
    .eq('id', id)
    .single();
  if (fetchErr || !project) return NextResponse.json({ error: 'Projet introuvable' }, { status: 404 });
  if (project.user_id !== userId) return NextResponse.json({ error: 'Interdit' }, { status: 403 });

  // Déduire les paths des URLs publiques
  function toPath(url?: string | null) {
    if (!url) return null;
    try {
      const u = new URL(url);
      const idx = u.pathname.indexOf('/object/public/');
      if (idx === -1) return null;
      const path = u.pathname.substring(idx + '/object/public/'.length);
      return decodeURIComponent(path);
    } catch {
      return null;
    }
  }

  const inputPath = toPath(project.input_image_url);
  const outputPath = toPath(project.output_image_url);

  // Supprimer les fichiers si présents
  if (inputPath) await supabase.storage.from('input-images').remove([inputPath.replace('input-images/', '')]);
  if (outputPath) await supabase.storage.from('output-images').remove([outputPath.replace('output-images/', '')]);

  // Supprimer l’enregistrement
  const { error: delErr } = await supabase.from('projects').delete().eq('id', id);
  if (delErr) return NextResponse.json({ error: delErr.message }, { status: 400 });

  return NextResponse.json({ ok: true });
}


