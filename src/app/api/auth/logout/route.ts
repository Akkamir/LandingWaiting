import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/auth/supabase';
import { logSecurityEvent } from '@/lib/auth/security';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice('Bearer '.length) 
      : null;

    if (!token) {
      return NextResponse.json({ success: true });
    }

    // Récupérer l'utilisateur pour logging
    const { data: { user } } = await supabaseServer.auth.getUser(token);

    // Invalider la session côté serveur
    const { error } = await supabaseServer.auth.admin.signOut(token);

    if (error) {
      logSecurityEvent('logout_error', { userId: user?.id, error }, 'warn');
    } else {
      logSecurityEvent('logout_success', { userId: user?.id, email: user?.email });
    }

    // Nettoyer les sessions actives de l'utilisateur
    if (user?.id) {
      await supabaseServer
        .from('auth_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    logSecurityEvent('logout_api_error', { error }, 'error');
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion' },
      { status: 500 }
    );
  }
}
