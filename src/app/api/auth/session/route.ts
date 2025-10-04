import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/auth/supabase';
import { logSecurityEvent } from '@/lib/auth/security';

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') 
      ? authHeader.slice('Bearer '.length) 
      : null;

    if (!token) {
      return NextResponse.json({ user: null, session: null });
    }

    const { data: { user }, error } = await supabaseServer.auth.getUser(token);

    if (error) {
      logSecurityEvent('session_validation_error', { error }, 'warn');
      return NextResponse.json({ user: null, session: null });
    }

    if (!user) {
      return NextResponse.json({ user: null, session: null });
    }

    // Récupérer le profil utilisateur
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      logSecurityEvent('profile_fetch_error', { userId: user.id, error: profileError }, 'warn');
    }

    const userWithProfile = {
      id: user.id,
      email: user.email,
      name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0],
      avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
      role: profile?.role || 'user',
      created_at: profile?.created_at || user.created_at,
      updated_at: profile?.updated_at || new Date().toISOString(),
    };

    logSecurityEvent('session_validated', { userId: user.id, email: user.email });

    return NextResponse.json({ 
      user: userWithProfile, 
      session: { 
        access_token: token,
        expires_at: user.exp || Math.floor(Date.now() / 1000) + 3600,
      }
    });

  } catch (error) {
    logSecurityEvent('session_api_error', { error }, 'error');
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { refresh_token } = await req.json();

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Refresh token requis' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseServer.auth.refreshSession({
      refresh_token,
    });

    if (error) {
      logSecurityEvent('session_refresh_error', { error }, 'warn');
      return NextResponse.json(
        { error: 'Token de rafraîchissement invalide' },
        { status: 401 }
      );
    }

    logSecurityEvent('session_refreshed', { userId: data.user?.id });

    return NextResponse.json({
      access_token: data.session?.access_token,
      refresh_token: data.session?.refresh_token,
      expires_at: data.session?.expires_at,
    });

  } catch (error) {
    logSecurityEvent('session_refresh_api_error', { error }, 'error');
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
