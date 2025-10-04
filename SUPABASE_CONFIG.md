# Configuration Supabase pour Session Persistante

## 🔧 Configuration Dashboard Supabase

### 1. Authentication → URL Configuration

- **SITE URL** : `http://localhost:3003`
- **Authorized Redirect URLs** : `http://localhost:3003/auth/callback`

### 2. Email Templates (CRITIQUE)

**Option A - Plus simple (recommandée) :**
- Utilise le template par défaut avec `{{ .ConfirmationURL }}`
- Le lien doit pointer vers `https://<ton-projet>.supabase.co/auth/v1/verify`
- PAS vers `http://localhost:3000/auth/v1/verify` (écran noir)

**Option B - Template personnalisé :**
```html
<p><a href="{{ .ConfirmationURL }}&redirect_to={{ .SiteURL | urlquery }}/auth/callback">Log In</a></p>
```

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
- **Email Template** : Utilise `{{ .ConfirmationURL }}` (domaine Supabase)
- **Vérification** : Le lien email doit commencer par `https://<projet>.supabase.co/auth/v1/verify`

## 🔍 Vérifications Rapides

1. **Email** : Survole le lien → doit commencer par `https://<projet>.supabase.co/auth/v1/verify`
2. **Logs** : Tu dois voir `GET /auth/callback` dans les logs Next.js
3. **Cookies** : DevTools → Application → Cookies → `sb-access-token` / `sb-refresh-token`
4. **Session** : Retour sur `/` → tu restes connecté (SSR lit via cookies)
