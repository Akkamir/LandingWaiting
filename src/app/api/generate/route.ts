import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Replicate from "replicate";
import { randomUUID } from "crypto";

const SUPABASE_URL = process.env.SUPABASE_URL as string | undefined;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;
const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN as string | undefined;
const REPLICATE_MODEL = process.env.REPLICATE_MODEL as string | undefined;

function getSupabaseAdmin() {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return null;
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
}

function extractReplicateUrl(output: unknown): string | null {
  if (typeof output === "string") return output;
  if (Array.isArray(output) && output.length > 0 && typeof output[0] === "string") return output[0] as string;
  if (
    typeof output === "object" &&
    output !== null &&
    Array.isArray((output as { output?: unknown }).output) &&
    ((output as { output: unknown[] }).output[0] as unknown) &&
    typeof (output as { output: unknown[] }).output[0] === "string"
  ) {
    return ((output as { output: string[] }).output[0]) ?? null;
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
    }
    if (!REPLICATE_API_TOKEN || !REPLICATE_MODEL) {
      return NextResponse.json({ error: "Replicate non configuré" }, { status: 500 });
    }

    const formData = await req.formData();
    const prompt = (formData.get("prompt") as string | null)?.toString() || "";
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Aucune image reçue" }, { status: 400 });
    }
    if (!prompt.trim()) {
      return NextResponse.json({ error: "Prompt requis" }, { status: 400 });
    }

    const projectId = randomUUID();

    // Upload image d'entrée
    const bytes = Buffer.from(await file.arrayBuffer());
    const inputPath = `projects/${projectId}/input-${Date.now()}.png`;
    const { error: upErr } = await supabase.storage.from("input-images").upload(inputPath, bytes, {
      contentType: file.type || "image/png",
      upsert: false,
    });
    if (upErr) {
      const errorId = randomUUID();
      console.error("[generate] Upload input error", {
        errorId,
        path: inputPath,
        size: bytes.byteLength,
        contentType: file.type,
        message: upErr.message,
      });
      return NextResponse.json({ error: `Upload input: ${upErr.message}`, errorId }, { status: 400 });
    }
    const { data: pubInput } = supabase.storage.from("input-images").getPublicUrl(inputPath);
    const inputUrl = pubInput.publicUrl;

    // Appel Replicate
    const replicate = new Replicate({ auth: REPLICATE_API_TOKEN });
    let outputUrl: string | null = null;
    try {
      const inputPayload = {
        prompt,
        image_input: [inputUrl],
        output_format: "jpg",
      } as const;
      const output = await replicate.run(
        REPLICATE_MODEL as `${string}/${string}` | `${string}/${string}:${string}`,
        { input: inputPayload }
      );
      // Gestion des formats possibles: objet avec url(), string, array, ou { output: [] }
      if (output && typeof output === "object" && typeof (output as { url?: () => string }).url === "function") {
        try {
          outputUrl = (output as { url: () => string }).url();
        } catch (e) {
          console.warn("[generate] output.url() a échoué, fallback extract", e);
          outputUrl = extractReplicateUrl(output);
        }
      } else {
        outputUrl = extractReplicateUrl(output);
      }
    } catch (err) {
      const errorId = randomUUID();
      const message = err instanceof Error ? err.message : String(err);
      const name = err instanceof Error ? err.name : typeof err;
      const stack = err instanceof Error && err.stack ? err.stack.split("\n").slice(0, 3).join(" | ") : undefined;
      console.error("[generate] Replicate error", {
        errorId,
        name,
        message,
        stack,
        model: REPLICATE_MODEL,
        inputUrl,
        promptPreview: prompt.slice(0, 140),
        promptLength: prompt.length,
      });
      return NextResponse.json({ error: "Erreur Replicate", errorId, message }, { status: 500 });
    }
    if (!outputUrl) {
      const errorId = randomUUID();
      console.error("[generate] Replicate returned no output URL", {
        errorId,
        model: REPLICATE_MODEL,
        inputUrl,
        promptPreview: prompt.slice(0, 140),
      });
      return NextResponse.json({ error: "Aucune image générée", errorId }, { status: 500 });
    }

    // Télécharger l'image générée puis uploader dans output-images
    const genRes = await fetch(outputUrl);
    if (!genRes.ok) {
      const errorId = randomUUID();
      console.error("[generate] Download generated image failed", {
        errorId,
        outputUrl,
        status: genRes.status,
        statusText: genRes.statusText,
      });
      return NextResponse.json({ error: "Téléchargement image générée échoué", errorId }, { status: 500 });
    }
    const genBuf = Buffer.from(await genRes.arrayBuffer());
    const outputPath = `projects/${projectId}/output-${Date.now()}.png`;
    const { error: outErr } = await supabase.storage.from("output-images").upload(outputPath, genBuf, {
      contentType: genRes.headers.get("content-type") || "image/png",
      upsert: false,
    });
    if (outErr) {
      const errorId = randomUUID();
      console.error("[generate] Upload output error", {
        errorId,
        path: outputPath,
        size: genBuf.byteLength,
        message: outErr.message,
      });
      return NextResponse.json({ error: `Upload output: ${outErr.message}`, errorId }, { status: 400 });
    }
    const { data: pubOutput } = supabase.storage.from("output-images").getPublicUrl(outputPath);
    const storedOutputUrl = pubOutput.publicUrl;

    // Enregistrer en base
    const { error: insertErr } = await supabase.from("projects").insert({
      id: projectId,
      input_image_url: inputUrl,
      output_image_url: storedOutputUrl,
      prompt,
      status: "completed",
    });
    if (insertErr) {
      const errorId = randomUUID();
      console.error("[generate] DB insert error", {
        errorId,
        message: insertErr.message,
        code: (insertErr as { code?: string }).code,
      });
      return NextResponse.json({ error: `DB insert: ${insertErr.message}`, errorId }, { status: 400 });
    }

    return NextResponse.json({ output_image_url: storedOutputUrl });
  } catch {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


