// Types pour le système d'authentification
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface AuthSession {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export interface LoginMethod {
  type: 'magic_link' | 'otp' | 'password' | 'oauth';
  provider?: 'google' | 'github';
  enabled: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  details?: any;
}

export interface AuthState {
  user: User | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
}

export interface LoginCredentials {
  email: string;
  password?: string;
  otp?: string;
  method: LoginMethod['type'];
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
  acceptTerms: boolean;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}
