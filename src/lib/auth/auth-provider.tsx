'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from './supabase';
import { createUserProfile, getUserProfile, updateUserProfile } from './supabase';
import { AuthState, User, AuthSession, LoginCredentials, RegisterCredentials, AuthError } from './types';
import { AUTH_CONFIG } from './config';
import { logSecurityEvent } from './security';

// Contexte d'authentification
const AuthContext = createContext<{
  authState: AuthState;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (credentials: RegisterCredentials) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<{ success: boolean; error?: string }>;
  sendOTP: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
} | null>(null);

// Hook pour utiliser l'authentification
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Provider d'authentification
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    error: null,
  });

  // Fonction pour mettre à jour l'état d'auth
  const updateAuthState = useCallback(async (session: any) => {
    try {
      if (session?.user) {
        // Récupérer le profil utilisateur
        const { data: profile, error: profileError } = await getUserProfile(session.user.id);
        
        if (profileError && profileError.code !== 'PGRST116') {
          logSecurityEvent('profile_fetch_error', { error: profileError }, 'error');
        }

        const user: User = {
          id: session.user.id,
          email: session.user.email || '',
          name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
          avatar_url: profile?.avatar_url || session.user.user_metadata?.avatar_url,
          role: profile?.role || 'user',
          created_at: profile?.created_at || session.user.created_at,
          updated_at: profile?.updated_at || new Date().toISOString(),
        };

        setAuthState({
          user,
          session: {
            user,
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at,
          },
          loading: false,
          error: null,
        });

        logSecurityEvent('user_authenticated', { userId: user.id, email: user.email });
      } else {
        setAuthState({
          user: null,
          session: null,
          loading: false,
          error: null,
        });
      }
    } catch (error) {
      logSecurityEvent('auth_state_update_error', { error }, 'error');
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: {
          code: 'AUTH_UPDATE_ERROR',
          message: 'Erreur lors de la mise à jour de l\'authentification',
        },
      }));
    }
  }, []);

  // Initialisation de l'auth au montage
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Récupérer la session existante
        const { data: { session }, error } = await supabaseBrowser.auth.getSession();
        
        if (error) {
          logSecurityEvent('session_get_error', { error }, 'error');
        }

        if (mounted) {
          await updateAuthState(session);
        }
      } catch (error) {
        logSecurityEvent('auth_initialization_error', { error }, 'error');
        if (mounted) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: {
              code: 'AUTH_INIT_ERROR',
              message: 'Erreur lors de l\'initialisation de l\'authentification',
            },
          }));
        }
      }
    };

    initializeAuth();

    // Écouter les changements d'auth
    const { data: { subscription } } = supabaseBrowser.auth.onAuthStateChange(
      async (event, session) => {
        logSecurityEvent('auth_state_change', { event, hasSession: !!session });
        
        if (mounted) {
          if (event === 'SIGNED_IN' && session) {
            // Créer le profil si c'est un nouvel utilisateur
            if (event === 'SIGNED_IN') {
              try {
                const { error: profileError } = await createUserProfile(session.user);
                if (profileError && profileError.code !== '23505') { // Ignore duplicate key
                  logSecurityEvent('profile_creation_error', { error: profileError }, 'warn');
                }
              } catch (err) {
                logSecurityEvent('profile_creation_exception', { error: err }, 'warn');
              }
            }
          }
          
          await updateAuthState(session);
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [updateAuthState]);

  // Fonction de connexion
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      let result;
      
      switch (credentials.method) {
        case 'magic_link':
          result = await supabaseBrowser.auth.signInWithOtp({
            email: credentials.email,
            options: {
              emailRedirectTo: `${window.location.origin}${AUTH_CONFIG.REDIRECT_URLS.callback}`,
            },
          });
          break;
          
        case 'otp':
          result = await supabaseBrowser.auth.signInWithOtp({
            email: credentials.email,
            options: {
              shouldCreateUser: false,
            },
          });
          break;
          
        case 'password':
          if (!credentials.password) {
            throw new Error('Mot de passe requis pour la connexion par mot de passe');
          }
          result = await supabaseBrowser.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          });
          break;
          
        default:
          throw new Error('Méthode de connexion non supportée');
      }

      if (result.error) {
        logSecurityEvent('login_error', { 
          method: credentials.method, 
          email: credentials.email,
          error: result.error 
        }, 'warn');
        
        return { success: false, error: result.error.message };
      }

      logSecurityEvent('login_success', { 
        method: credentials.method, 
        email: credentials.email 
      });
      
      return { success: true };
    } catch (error) {
      logSecurityEvent('login_exception', { error, method: credentials.method }, 'error');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de connexion' 
      };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Fonction d'inscription
  const register = useCallback(async (credentials: RegisterCredentials) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const result = await supabaseBrowser.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
          },
        },
      });

      if (result.error) {
        logSecurityEvent('register_error', { 
          email: credentials.email,
          error: result.error 
        }, 'warn');
        
        return { success: false, error: result.error.message };
      }

      logSecurityEvent('register_success', { email: credentials.email });
      return { success: true };
    } catch (error) {
      logSecurityEvent('register_exception', { error }, 'error');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur d\'inscription' 
      };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Fonction de déconnexion
  const logout = useCallback(async () => {
    try {
      logSecurityEvent('logout_attempt', { userId: authState.user?.id });
      
      const { error } = await supabaseBrowser.auth.signOut();
      
      if (error) {
        logSecurityEvent('logout_error', { error }, 'warn');
      } else {
        logSecurityEvent('logout_success', { userId: authState.user?.id });
      }
      
      setAuthState({
        user: null,
        session: null,
        loading: false,
        error: null,
      });
    } catch (error) {
      logSecurityEvent('logout_exception', { error }, 'error');
    }
  }, [authState.user?.id]);

  // Fonction pour envoyer un lien magique
  const sendMagicLink = useCallback(async (email: string) => {
    return login({ email, method: 'magic_link' });
  }, [login]);

  // Fonction pour envoyer un OTP
  const sendOTP = useCallback(async (email: string) => {
    return login({ email, method: 'otp' });
  }, [login]);

  // Fonction pour vérifier un OTP
  const verifyOTP = useCallback(async (email: string, otp: string) => {
    return login({ email, otp, method: 'otp' });
  }, [login]);

  // Fonction pour réinitialiser le mot de passe
  const resetPassword = useCallback(async (email: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { error } = await supabaseBrowser.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) {
        logSecurityEvent('password_reset_error', { email, error }, 'warn');
        return { success: false, error: error.message };
      }

      logSecurityEvent('password_reset_sent', { email });
      return { success: true };
    } catch (error) {
      logSecurityEvent('password_reset_exception', { error }, 'error');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de réinitialisation' 
      };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  // Fonction pour mettre à jour le profil
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      if (!authState.user) {
        return { success: false, error: 'Utilisateur non connecté' };
      }

      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const { data, error } = await updateUserProfile(authState.user.id, updates);

      if (error) {
        logSecurityEvent('profile_update_error', { userId: authState.user.id, error }, 'warn');
        return { success: false, error: error.message };
      }

      // Mettre à jour l'état local
      setAuthState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...updates } : null,
        loading: false,
      }));

      logSecurityEvent('profile_update_success', { userId: authState.user.id });
      return { success: true };
    } catch (error) {
      logSecurityEvent('profile_update_exception', { error }, 'error');
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de mise à jour' 
      };
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, [authState.user]);

  // Fonction pour rafraîchir la session
  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabaseBrowser.auth.refreshSession();
      
      if (error) {
        logSecurityEvent('session_refresh_error', { error }, 'warn');
        return;
      }

      await updateAuthState(session);
    } catch (error) {
      logSecurityEvent('session_refresh_exception', { error }, 'error');
    }
  }, [updateAuthState]);

  const value = {
    authState,
    login,
    register,
    logout,
    sendMagicLink,
    sendOTP,
    verifyOTP,
    resetPassword,
    updateProfile,
    refreshSession,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
