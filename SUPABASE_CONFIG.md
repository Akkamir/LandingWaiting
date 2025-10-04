# Configuration Supabase pour Session Persistante

## 🔧 Configuration Dashboard Supabase

### 1. Authentication → URL Configuration

- **SITE URL** : `http://localhost:3003`
- **Authorized Redirect URLs** : `http://localhost:3003/auth/callback`

### 2. Email Templates (optionnel)

Si tu as configuré des modèles d'email personnalisés, assure-toi que le redirect par défaut pointe vers `/auth/callback`.

## 🚀 Flux de Connexion

1. **Login** → Magic link envoyé avec `emailRedirectTo: /auth/callback`
2. **Magic link** → Redirige vers `/auth/callback` (pas directement `/generate`)
3. **Callback** → Parse tokens et les stocke dans cookies via middleware
4. **Redirect** → Vers `/generate` (URL propre, sans hash)
5. **Session persistante** → Disponible sur toutes les pages via cookies

## 🔍 Logs Attendus

```
[AUTH-CALLBACK] 🔄 Processing magic link callback
[AUTH-CALLBACK] 📋 Session result: { hasSession: true, hasUser: true, userEmail: "ton@email.com", urlHash: "#access_token=..." }
[AUTH-CALLBACK] ✅ User authenticated, redirecting to /generate
[AUTH] 🔍 Checking for existing session...
[AUTH] 📋 Session check result: { hasSession: true, hasUser: true, userEmail: "ton@email.com" }
[HEADER] 🔍 Auth state: { loading: false, isAuthenticated: true }
```

## ⚠️ Points d'Attention

- **Origine** : Utilise toujours `http://localhost:3003` (pas 127.0.0.1)
- **Middleware** : Doit être à la racine du projet (`middleware.ts`)
- **Matcher** : `['/(.*)']` pour couvrir toutes les routes
- **Redirect URLs** : Ajoute `/auth/callback` dans les URLs autorisées
