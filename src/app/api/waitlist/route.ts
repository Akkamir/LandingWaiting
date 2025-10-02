import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Clés serveur seulement (ne jamais exposer SERVICE_ROLE au client)
const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

// Debug minimal et non sensible
const masked = (key?: string) => (key ? key.slice(0, 4) + "…" + key.slice(-4) : "undefined");
const supabase = supabaseUrl && supabaseServiceRoleKey
  ? (() => {
      console.log("[waitlist] Supabase config trouvée", {
        urlHost: (() => {
          try { return new URL(supabaseUrl).host; } catch { return "invalid-url"; }
        })(),
        keyMasked: masked(supabaseServiceRoleKey),
      });
      return createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } });
    })()
  : (() => {
      console.warn("[waitlist] Supabase non configuré", {
        hasUrl: Boolean(supabaseUrl),
        hasServiceRole: Boolean(supabaseServiceRoleKey),
      });
      return null;
    })();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    const lowered = email.trim().toLowerCase();
    if (!supabase) {
      console.error("[waitlist] Rejet: supabase null (env manquantes)");
      return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
    }
    // Si la contrainte unique n'est pas posée, on check d'abord l'existence
    const { data: existing, error: findErr } = await supabase
      .from("waiting")
      .select("id")
      .eq("email", lowered)
      .maybeSingle();
    if (!findErr && existing) {
      console.log("[waitlist] Email déjà existant, pas d'insert", { email: lowered });
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const { error } = await supabase.from("waiting").insert({ email: lowered });
    if (error) {
      if (error?.code === "23505") {
        console.log("[waitlist] Contrainte unique côté DB, duplicate géré", { email: lowered });
        return NextResponse.json({ ok: true, duplicate: true });
      }
      console.error("[waitlist] Erreur insert", { code: error.code, message: error.message });
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.log("[waitlist] Insert OK", { email: lowered });
    return NextResponse.json({ ok: true });
  } catch {
    console.error("[waitlist] Bad Request: JSON ou autre");
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}


