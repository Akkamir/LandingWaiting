import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { validateInput, waitlistRequestSchema } from "@/lib/validation";

// Validation des variables d'environnement critiques
function validateEnvironment() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error("[SECURITY] Variables d'environnement Supabase manquantes");
    return null;
  }
  
  // Validation de l'URL Supabase
  try {
    new URL(supabaseUrl);
  } catch {
    console.error("[SECURITY] URL Supabase invalide");
    return null;
  }
  
  return { supabaseUrl, supabaseServiceRoleKey };
}

// Initialisation sécurisée de Supabase
function getSupabaseClient() {
  const env = validateEnvironment();
  if (!env) return null;
  
  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, { 
    auth: { persistSession: false },
    global: {
      headers: {
        'X-Client-Info': 'imageai-waitlist-api'
      }
    }
  });
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  
  try {
    // Validation stricte de l'entrée
    const body = await req.json();
    const validation = validateInput(waitlistRequestSchema, body);
    
    if (!validation.success) {
      console.warn(`[SECURITY] Validation failed for ${ip}:`, validation.error);
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }
    
    const { email } = validation.data;
    
    // Initialisation sécurisée de Supabase
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.error("[SECURITY] Supabase non configuré");
      return NextResponse.json({ error: "Service temporairement indisponible" }, { status: 503 });
    }
    
    // Vérification de l'existence avec protection contre les attaques
    const { data: existing, error: findErr } = await supabase
      .from("waiting")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    
    if (findErr) {
      console.error("[SECURITY] Database query error:", { 
        error: findErr.message,
        ip,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
    }
    
    if (existing) {
      // Log sécurisé sans données sensibles
      console.log("[waitlist] Email déjà existant", { 
        ip,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime
      });
      return NextResponse.json({ ok: true, duplicate: true });
    }

    // Insertion sécurisée
    const { error } = await supabase.from("waiting").insert({ 
      email,
      created_at: new Date().toISOString(),
      ip_address: ip // Pour audit de sécurité
    });
    
    if (error) {
      if (error?.code === "23505") {
        console.log("[waitlist] Contrainte unique côté DB", { 
          ip,
          timestamp: new Date().toISOString()
        });
        return NextResponse.json({ ok: true, duplicate: true });
      }
      
      console.error("[SECURITY] Database insert error:", { 
        code: error.code,
        ip,
        timestamp: new Date().toISOString()
      });
      return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
    }
    
    console.log("[waitlist] Inscription réussie", { 
      ip,
      timestamp: new Date().toISOString(),
      processingTime: Date.now() - startTime
    });
    
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("[SECURITY] Unexpected error in waitlist API:", {
      error: error instanceof Error ? error.message : 'Unknown error',
      ip,
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
  }
}


