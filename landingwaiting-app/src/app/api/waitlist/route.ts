import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Clés serveur seulement (ne jamais exposer SERVICE_ROLE au client)
const supabaseUrl = process.env.SUPABASE_URL as string | undefined;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined;

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
  : null;

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }
    const lowered = email.trim().toLowerCase();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase non configuré" }, { status: 500 });
    }
    // Si la contrainte unique n'est pas posée, on check d'abord l'existence
    const { data: existing, error: findErr } = await supabase
      .from("waiting")
      .select("id")
      .eq("email", lowered)
      .maybeSingle();
    if (!findErr && existing) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    const { error } = await supabase.from("waiting").insert({ email: lowered });
    if (error) {
      if (error?.code === "23505") {
        return NextResponse.json({ ok: true, duplicate: true });
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad Request" }, { status: 400 });
  }
}


