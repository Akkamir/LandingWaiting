import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/auth/supabase';
import { generateOTP, validateOTP, checkRateLimit, logSecurityEvent } from '@/lib/auth/security';
import { z } from 'zod';

const otpRequestSchema = z.object({
  email: z.string().email('Email invalide'),
  action: z.enum(['send', 'verify']),
  code: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = otpRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, action, code } = validation.data;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';

    // Rate limiting
    if (!checkRateLimit(`${ip}:${email}`, 5)) {
      logSecurityEvent('otp_rate_limit_exceeded', { email, ip }, 'warn');
      return NextResponse.json(
        { error: 'Trop de tentatives. Veuillez patienter.' },
        { status: 429 }
      );
    }

    if (action === 'send') {
      // Générer un code OTP
      const otpCode = generateOTP();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

      // Stocker le code OTP en base
      const { error: insertError } = await supabaseServer
        .from('auth_otps')
        .insert({
          email,
          code: otpCode,
          expires_at: expiresAt.toISOString(),
          ip_address: ip,
          user_agent: req.headers.get('user-agent'),
        });

      if (insertError) {
        logSecurityEvent('otp_storage_error', { email, error: insertError }, 'error');
        return NextResponse.json(
          { error: 'Erreur lors de la génération du code' },
          { status: 500 }
        );
      }

      // Envoyer l'email (simulation - en production, utiliser un service d'email)
      logSecurityEvent('otp_generated', { email, expiresAt });
      
      // TODO: Intégrer un service d'email réel (SendGrid, AWS SES, etc.)
      console.log(`[OTP] Code pour ${email}: ${otpCode}`);

      return NextResponse.json({ 
        success: true, 
        message: 'Code de vérification envoyé par email' 
      });

    } else if (action === 'verify') {
      if (!code) {
        return NextResponse.json(
          { error: 'Code de vérification requis' },
          { status: 400 }
        );
      }

      // Récupérer le code OTP
      const { data: otpData, error: fetchError } = await supabaseServer
        .from('auth_otps')
        .select('*')
        .eq('email', email)
        .eq('code', code)
        .eq('used', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError || !otpData) {
        logSecurityEvent('otp_verification_failed', { email, code, error: fetchError }, 'warn');
        return NextResponse.json(
          { error: 'Code de vérification invalide ou expiré' },
          { status: 400 }
        );
      }

      // Vérifier l'expiration
      const now = new Date();
      const expiresAt = new Date(otpData.expires_at);
      
      if (now > expiresAt) {
        logSecurityEvent('otp_expired', { email, code });
        return NextResponse.json(
          { error: 'Code de vérification expiré' },
          { status: 400 }
        );
      }

      // Marquer le code comme utilisé
      await supabaseServer
        .from('auth_otps')
        .update({ used: true })
        .eq('id', otpData.id);

      // Créer une session pour l'utilisateur
      const { data: userData, error: userError } = await supabaseServer.auth.admin.getUserByEmail(email);
      
      if (userError || !userData.user) {
        // Créer un nouvel utilisateur si il n'existe pas
        const { data: newUser, error: createError } = await supabaseServer.auth.admin.createUser({
          email,
          email_confirm: true,
        });

        if (createError) {
          logSecurityEvent('user_creation_error', { email, error: createError }, 'error');
          return NextResponse.json(
            { error: 'Erreur lors de la création du compte' },
            { status: 500 }
          );
        }

        logSecurityEvent('user_created_via_otp', { email, userId: newUser.user.id });
      }

      logSecurityEvent('otp_verification_success', { email });

      return NextResponse.json({ 
        success: true, 
        message: 'Code de vérification validé' 
      });
    }

    return NextResponse.json(
      { error: 'Action non supportée' },
      { status: 400 }
    );

  } catch (error) {
    logSecurityEvent('otp_api_error', { error }, 'error');
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
