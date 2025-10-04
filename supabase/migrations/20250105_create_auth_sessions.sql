-- Table pour stocker les sessions d'authentification et les tentatives de connexion
CREATE TABLE IF NOT EXISTS public.auth_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_token TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Table pour les tentatives de connexion (rate limiting et sécurité)
CREATE TABLE IF NOT EXISTS public.auth_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  ip_address INET NOT NULL,
  attempt_type TEXT NOT NULL CHECK (attempt_type IN ('login', 'register', 'password_reset', 'otp')),
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent TEXT,
  country TEXT,
  city TEXT
);

-- Table pour les codes OTP
CREATE TABLE IF NOT EXISTS public.auth_otps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user_id ON public.auth_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_token ON public.auth_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expires ON public.auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_active ON public.auth_sessions(is_active);

CREATE INDEX IF NOT EXISTS idx_auth_attempts_email ON public.auth_attempts(email);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_ip ON public.auth_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_created ON public.auth_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_auth_attempts_type ON public.auth_attempts(attempt_type);

CREATE INDEX IF NOT EXISTS idx_auth_otps_email ON public.auth_otps(email);
CREATE INDEX IF NOT EXISTS idx_auth_otps_code ON public.auth_otps(code);
CREATE INDEX IF NOT EXISTS idx_auth_otps_expires ON public.auth_otps(expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_otps_used ON public.auth_otps(used);

-- RLS pour auth_sessions
ALTER TABLE public.auth_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own sessions"
  ON public.auth_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
  ON public.auth_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS pour auth_attempts (lecture seule pour les utilisateurs)
ALTER TABLE public.auth_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own attempts"
  ON public.auth_attempts FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- RLS pour auth_otps
ALTER TABLE public.auth_otps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own otps"
  ON public.auth_otps FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can create own otps"
  ON public.auth_otps FOR INSERT
  WITH CHECK (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

CREATE POLICY "Users can update own otps"
  ON public.auth_otps FOR UPDATE
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.auth_sessions 
  WHERE expires_at < NOW() OR last_activity < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les OTP expirés
CREATE OR REPLACE FUNCTION public.cleanup_expired_otps()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.auth_otps 
  WHERE expires_at < NOW() OR created_at < NOW() - INTERVAL '1 hour';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour nettoyer les tentatives anciennes
CREATE OR REPLACE FUNCTION public.cleanup_old_attempts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM public.auth_attempts 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour last_activity
CREATE OR REPLACE FUNCTION public.update_session_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.auth_sessions 
  SET last_activity = NOW() 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Nettoyage automatique (à exécuter périodiquement)
-- Ces fonctions peuvent être appelées par un cron job ou une tâche planifiée
