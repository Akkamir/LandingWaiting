'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/lib/auth/auth-provider';
import { useRouter } from 'next/navigation';

export function UserMenu() {
  const { authState, logout, updateProfile } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(authState.user?.name || '');
  const menuRef = useRef<HTMLDivElement>(null);

  // Fermer le menu si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() !== authState.user?.name) {
      const result = await updateProfile({ name: name.trim() });
      if (result.success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  if (!authState.user) {
    return (
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.push('/login')}
          className="text-white/70 hover:text-white transition-colors"
        >
          Se connecter
        </button>
        <button
          onClick={() => router.push('/register')}
          className="btn-primary btn-sm"
        >
          S'inscrire
        </button>
      </div>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
      >
        {authState.user.avatar_url ? (
          <img
            src={authState.user.avatar_url}
            alt={authState.user.name || 'Avatar'}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
            {authState.user.name?.charAt(0)?.toUpperCase() || authState.user.email.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="text-left">
          <p className="text-white font-medium text-sm">
            {authState.user.name || 'Utilisateur'}
          </p>
          <p className="text-white/60 text-xs">
            {authState.user.email}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-white/60 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl z-50">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-4">
              {authState.user.avatar_url ? (
                <img
                  src={authState.user.avatar_url}
                  alt={authState.user.name || 'Avatar'}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                  {authState.user.name?.charAt(0)?.toUpperCase() || authState.user.email.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex-1">
                {isEditing ? (
                  <form onSubmit={handleProfileUpdate} className="space-y-2">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-1 bg-white/5 border border-white/20 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      placeholder="Votre nom"
                      maxLength={50}
                      autoFocus
                    />
                    <div className="flex space-x-2">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        Sauvegarder
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setName(authState.user?.name || '');
                          setIsEditing(false);
                        }}
                        className="px-3 py-1 bg-white/10 text-white text-xs rounded hover:bg-white/20 transition-colors"
                      >
                        Annuler
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <p className="text-white font-medium">
                      {authState.user.name || 'Utilisateur'}
                    </p>
                    <p className="text-white/60 text-sm">
                      {authState.user.email}
                    </p>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-400 hover:text-blue-300 text-xs underline mt-1"
                    >
                      Modifier le profil
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-white/10 pt-4">
              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/profile');
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Mon profil</span>
              </button>

              <button
                onClick={() => {
                  setIsOpen(false);
                  router.push('/settings');
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Paramètres</span>
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Se déconnecter</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
