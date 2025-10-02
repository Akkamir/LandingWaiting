import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Replicate from "replicate";
import { randomUUID } from "crypto";
import { validateInput, promptSchema, imageFileSchema, isValidUrl } from "@/lib/validation";

// Validation sécurisée des variables d'environnement
function validateEnvironment() {
  const required = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    REPLICATE_API_TOKEN: process.env.REPLICATE_API_TOKEN,
    REPLICATE_MODEL: process.env.REPLICATE_MODEL
  };
  
  const missing = Object.entries(required)
    .filter(([_, value]) => !value)
    .map(([key]) => key);
    
  if (missing.length > 0) {
    console.error("[SECURITY] Variables d'environnement manquantes:", missing);
    return null;
  }
  
  // Validation de l'URL Supabase
  try {
    new URL(required.SUPABASE_URL!);
  } catch {
    console.error("[SECURITY] URL Supabase invalide");
    return null;
  }
  
  return required as Required<typeof required>;
}

function getSupabaseAdmin() {
  const env = validateEnvironment();
  if (!env) return null;
  
  return createClient(env.SUPABASE_URL!, env.SUPABASE_SERVICE_ROLE_KEY!, { 
    auth: { persistSession: false },
    global: {
      headers: {
        'X-Client-Info': 'imageai-generate-api'
      }
    }
  });
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
  const startTime = Date.now();
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const projectId = randomUUID();
  
  console.log("[GENERATE] Starting generation request", { ip, projectId, timestamp: new Date().toISOString() });
  
  try {
    // Validation de l'environnement
    const env = validateEnvironment();
    if (!env) {
      console.error("[SECURITY] Environment validation failed");
      return NextResponse.json({ error: "Service temporairement indisponible" }, { status: 503 });
    }
    
    console.log("[GENERATE] Environment validated successfully");
    
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      console.error("[SECURITY] Supabase initialization failed");
      return NextResponse.json({ error: "Service temporairement indisponible" }, { status: 503 });
    }

    // Validation sécurisée des données d'entrée
    const formData = await req.formData();
    const prompt = formData.get("prompt") as string | null;
    const file = formData.get("image") as File | null;
    
    // Validation du prompt
    const promptValidation = validateInput(promptSchema, prompt);
    if (!promptValidation.success) {
      console.warn(`[SECURITY] Invalid prompt from ${ip}:`, promptValidation.error);
      return NextResponse.json({ error: "Prompt invalide" }, { status: 400 });
    }
    
    // Validation du fichier
    const fileValidation = validateInput(imageFileSchema, file);
    if (!fileValidation.success) {
      console.warn(`[SECURITY] Invalid file from ${ip}:`, fileValidation.error);
      return NextResponse.json({ error: "Fichier invalide" }, { status: 400 });
    }
    
    const validatedPrompt = promptValidation.data;
    const validatedFile = fileValidation.data;

    // Upload sécurisé de l'image d'entrée
    const bytes = Buffer.from(await validatedFile.arrayBuffer());
    const inputPath = `projects/${projectId}/input-${Date.now()}.${validatedFile.type.split('/')[1] || 'png'}`;
    
    const { error: upErr } = await supabase.storage.from("input-images").upload(inputPath, bytes, {
      contentType: validatedFile.type,
      upsert: false,
    });
    
    if (upErr) {
      console.error("[SECURITY] Upload input error:", {
        error: upErr.message,
        ip,
        projectId,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ error: "Erreur d'upload" }, { status: 500 });
    }
    
    const { data: pubInput } = supabase.storage.from("input-images").getPublicUrl(inputPath);
    const inputUrl = pubInput.publicUrl;
    
    console.log("[GENERATE] Input URL generated:", { inputUrl, path: inputPath });
    
    // Validation de l'URL générée
    if (!isValidUrl(inputUrl)) {
      console.error("[SECURITY] Invalid input URL generated:", { 
        inputUrl, 
        ip,
        hostname: new URL(inputUrl).hostname,
        protocol: new URL(inputUrl).protocol
      });
      return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
    }
    
    console.log("[GENERATE] Input URL validated successfully");

    // Appel sécurisé à Replicate
    const replicate = new Replicate({ auth: env.REPLICATE_API_TOKEN });
    let outputUrl: string | null = null;
    
    try {
      const inputPayload = {
        prompt: validatedPrompt,
        image_input: [inputUrl],
        output_format: "jpg",
      } as const;
      
      const output = await replicate.run(
        env.REPLICATE_MODEL as `${string}/${string}` | `${string}/${string}:${string}`,
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
      console.error("[SECURITY] Replicate API error:", {
        error: err instanceof Error ? err.message : 'Unknown error',
        ip,
        projectId,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ error: "Erreur de génération" }, { status: 500 });
    }
    
    if (!outputUrl) {
      console.error("[SECURITY] No output URL from Replicate:", {
        ip,
        projectId,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ error: "Aucune image générée" }, { status: 500 });
    }
    
    // Validation de l'URL de sortie
    if (!isValidUrl(outputUrl)) {
      console.error("[SECURITY] Invalid output URL from Replicate:", { outputUrl, ip });
      return NextResponse.json({ error: "URL de sortie invalide" }, { status: 500 });
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

    console.log("[GENERATE] Generation completed successfully", { 
      projectId, 
      outputUrl: storedOutputUrl,
      processingTime: Date.now() - startTime 
    });
    
    return NextResponse.json({ output_image_url: storedOutputUrl });
  } catch (error) {
    console.error("[GENERATE] Unexpected error:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      ip,
      projectId,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}


