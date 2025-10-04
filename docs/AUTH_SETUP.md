# Configuration du Système d'Authentification

## Installation

### 1. Dépendances

```bash
npm install
```

### 2. Variables d'environnement

Créez un fichier `.env.local` :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OAuth (optionnel)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

### 3. Configuration Supabase

#### A. Créer un projet Supabase

1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer l'URL et les clés

#### B. Exécuter les migrations

```bash
# Installer Supabase CLI
npm install -g supabase

# Initialiser le projet
supabase init

# Lier au projet distant
supabase link --project-ref your-project-ref

# Exécuter les migrations
supabase db push
```

#### C. Configurer l'authentification

Dans le dashboard Supabase :

1. **Auth > Settings** :
   - Activer "Enable email confirmations"
   - Configurer les URLs de redirection
   - Personnaliser les templates d'email

2. **Auth > Providers** :
   - Activer "Email" provider
   - Configurer OAuth providers si nécessaire

3. **Database > RLS** :
   - Vérifier que RLS est activé sur toutes les tables

## Utilisation

### 1. Protection des routes

```tsx
import { AuthGuard } from '@/components/auth/AuthGuard';

export default function ProtectedPage() {
  return (
    <AuthGuard requireAuth={true} roles={['user', 'admin']}>
      <div>Contenu protégé</div>
    </AuthGuard>
  );
}
```

### 2. Utilisation du hook d'auth

```tsx
import { useAuth } from '@/lib/auth/auth-provider';

export default function MyComponent() {
  const { authState, login, logout, sendMagicLink } = useAuth();

  if (authState.loading) return <div>Chargement...</div>;
  if (!authState.user) return <div>Non connecté</div>;

  return (
    <div>
      <p>Bonjour {authState.user.name}!</p>
      <button onClick={logout}>Se déconnecter</button>
    </div>
  );
}
```

### 3. API routes protégées

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/auth/supabase';

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const { data: { user }, error } = await supabaseServer.auth.getUser(token);
  
  if (error || !user) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 });
  }

  // Logique de l'API...
}
```

## Tests

### 1. Tests unitaires

```bash
npm run test
```

### 2. Tests avec interface

```bash
npm run test:ui
```

### 3. Couverture de code

```bash
npm run test:coverage
```

## Déploiement

### 1. Vercel

1. Connecter le repository GitHub
2. Configurer les variables d'environnement
3. Déployer

### 2. Variables d'environnement en production

Assurez-vous que toutes les variables sont configurées :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 3. Configuration Supabase en production

1. **Auth > URL Configuration** :
   - Site URL : `https://your-domain.com`
   - Redirect URLs : `https://your-domain.com/auth/callback`

2. **Database** :
   - Vérifier que les migrations sont appliquées
   - Tester les politiques RLS

## Sécurité

### 1. Bonnes pratiques

- ✅ Utiliser HTTPS en production
- ✅ Configurer les headers de sécurité
- ✅ Activer RLS sur toutes les tables
- ✅ Limiter les tentatives de connexion
- ✅ Logger les événements d'auth

### 2. Monitoring

- Surveiller les tentatives de connexion
- Alerter sur les échecs répétés
- Monitorer les performances

### 3. Maintenance

- Nettoyer les sessions expirées
- Supprimer les OTP utilisés
- Archiver les logs anciens

## Dépannage

### Problèmes courants

1. **"Configuration Supabase manquante"**
   - Vérifier les variables d'environnement
   - Redémarrer le serveur de développement

2. **"Token invalide"**
   - Vérifier la configuration Supabase
   - Vérifier les URLs de redirection

3. **"RLS policy violation"**
   - Vérifier les politiques RLS
   - Tester avec un utilisateur connecté

### Logs utiles

```bash
# Logs de développement
npm run dev

# Logs de production
vercel logs
```

## Support

- Documentation Supabase : [docs.supabase.com](https://docs.supabase.com)
- Issues GitHub : [Créer une issue](https://github.com/your-repo/issues)
- Discord : [Serveur communautaire](https://discord.gg/supabase)
