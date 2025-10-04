# Architecture d'Authentification

## Vue d'ensemble

Le système d'authentification est conçu pour être sécurisé, scalable et facile à utiliser. Il utilise Supabase Auth comme backend principal avec des couches de sécurité supplémentaires.

## Composants principaux

### 1. Types et Configuration (`src/lib/auth/`)

- **`types.ts`** : Définit tous les types TypeScript pour l'auth
- **`config.ts`** : Configuration centralisée (durées d'expiration, limites, etc.)
- **`security.ts`** : Fonctions de sécurité (validation, sanitisation, rate limiting)
- **`supabase.ts`** : Clients Supabase sécurisés (browser/server)

### 2. Provider d'Authentification (`src/lib/auth/auth-provider.tsx`)

Le `AuthProvider` est le cœur du système d'auth côté client :

```typescript
// Utilisation
const { authState, login, logout, sendMagicLink } = useAuth();
```

**Fonctionnalités :**
- Gestion de l'état d'authentification global
- Synchronisation avec Supabase Auth
- Gestion des sessions et tokens
- Création automatique de profils utilisateur
- Logging sécurisé des événements

### 3. Composants UI (`src/components/auth/`)

- **`LoginForm.tsx`** : Formulaire de connexion multi-méthodes
- **`RegisterForm.tsx`** : Formulaire d'inscription avec validation
- **`AuthGuard.tsx`** : Protection des routes
- **`UserMenu.tsx`** : Menu utilisateur avec gestion de profil

### 4. Pages d'Authentification (`src/app/auth/`)

- **`/auth/login`** : Page de connexion
- **`/auth/register`** : Page d'inscription
- **`/auth/callback`** : Callback pour magic links

### 5. API Routes (`src/app/api/auth/`)

- **`/api/auth/session`** : Validation des sessions côté serveur
- **`/api/auth/logout`** : Déconnexion sécurisée
- **`/api/auth/otp`** : Gestion des codes OTP

## Méthodes d'Authentification

### 1. Magic Link (Recommandé)

**Avantages :**
- Pas de mot de passe à gérer
- Sécurisé par défaut
- UX fluide

**Flux :**
1. Utilisateur saisit son email
2. Système envoie un lien magique
3. Utilisateur clique sur le lien
4. Redirection vers `/auth/callback`
5. Création de session automatique

### 2. Code OTP (Fallback)

**Cas d'usage :**
- Magic link non reçu
- Email scanner qui invalide le lien
- Préférence utilisateur

**Flux :**
1. Utilisateur saisit son email
2. Système génère un code 6 chiffres
3. Code envoyé par email
4. Utilisateur saisit le code
5. Validation et création de session

### 3. Mot de passe (Optionnel)

**Configuration :**
- Politique de force stricte
- Hachage sécurisé par Supabase
- Validation côté client et serveur

## Sécurité

### 1. Row Level Security (RLS)

Toutes les tables utilisent RLS pour isoler les données :

```sql
-- Exemple pour la table profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);
```

### 2. Rate Limiting

- **Client-side** : Limite les tentatives dans le navigateur
- **Server-side** : Protection des API contre le spam
- **Base de données** : Tracking des tentatives de connexion

### 3. Validation et Sanitisation

- **Email** : Validation stricte avec regex
- **Mots de passe** : Politique de force configurable
- **Entrées utilisateur** : Sanitisation automatique
- **Headers** : Validation des requêtes

### 4. Logging Sécurisé

Tous les événements d'auth sont loggés avec masquage des données sensibles :

```typescript
logSecurityEvent('login_success', { 
  method: 'magic_link', 
  email: 'user@example.com' // Masqué automatiquement
});
```

## Gestion des Sessions

### 1. Côté Client

- **Persistance** : Sessions stockées dans localStorage
- **Refresh automatique** : Tokens rafraîchis automatiquement
- **Synchronisation** : État synchronisé via `onAuthStateChange`

### 2. Côté Serveur

- **Validation** : Vérification des tokens JWT
- **Middleware** : Protection automatique des routes
- **Profils** : Création automatique des profils utilisateur

## Base de Données

### Tables principales

1. **`profiles`** : Informations utilisateur
2. **`auth_sessions`** : Sessions actives
3. **`auth_attempts`** : Tentatives de connexion
4. **`auth_otps`** : Codes OTP temporaires

### Migrations

Les migrations SQL sont dans `supabase/migrations/` :
- `20250105_create_profiles_table.sql`
- `20250105_update_projects_rls.sql`
- `20250105_create_auth_sessions.sql`

## Configuration

### Variables d'environnement

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OAuth (optionnel)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### Configuration Supabase

1. **Auth Settings** :
   - Magic links activés
   - OTP activé
   - Email templates personnalisés

2. **RLS Policies** :
   - Exécuter les migrations SQL
   - Tester les politiques

3. **Storage** (si utilisé) :
   - Buckets avec RLS
   - Politiques d'accès par utilisateur

## Tests

### Tests unitaires

```bash
npm run test
```

- Tests des fonctions de sécurité
- Tests du provider d'auth
- Tests des composants UI

### Tests d'intégration

- Flux de connexion complet
- Gestion des erreurs
- Protection des routes

## Déploiement

### 1. Variables d'environnement

Configurer toutes les variables dans Vercel/plateforme de déploiement.

### 2. Migrations Supabase

```bash
# Exécuter les migrations
supabase db push
```

### 3. Configuration DNS

- Domaine configuré dans Supabase
- URLs de callback configurées

## Monitoring et Alertes

### Métriques importantes

- Taux de réussite des connexions
- Tentatives d'accès non autorisées
- Erreurs d'authentification
- Performance des API

### Alertes recommandées

- Échecs de connexion répétés
- Tentatives de force brute
- Erreurs de configuration
- Problèmes de base de données

## Évolutions futures

### Fonctionnalités prévues

1. **OAuth Social** : Google, GitHub
2. **2FA** : Authentification à deux facteurs
3. **SSO** : Single Sign-On pour entreprises
4. **Audit logs** : Logs détaillés d'audit
5. **Biométrie** : Support des clés de sécurité

### Optimisations

1. **Cache** : Mise en cache des sessions
2. **CDN** : Distribution des assets d'auth
3. **Monitoring** : Métriques temps réel
4. **Backup** : Sauvegarde des données d'auth
