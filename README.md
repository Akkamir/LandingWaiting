This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 🔐 Configuration Supabase Auth

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_anon_key
SUPABASE_URL=https://votre-projet.supabase.co
SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key

# Replicate Configuration
REPLICATE_API_TOKEN=votre_replicate_token
REPLICATE_MODEL=google/nano-banana
```

### 2. Configuration Supabase

1. **Créer un projet Supabase** sur [supabase.com](https://supabase.com)
2. **Récupérer les clés** dans Settings > API
3. **Exécuter le SQL** dans l'éditeur SQL de Supabase :

```sql
-- Migration: ajouter user_id à projects
alter table public.projects
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create index if not exists idx_projects_user_id on public.projects(user_id);

-- RLS: restreindre l'accès par utilisateur
alter table public.projects enable row level security;

create policy "Allow owner read" on public.projects for select using (auth.uid() = user_id);
create policy "Allow owner insert" on public.projects for insert with check (auth.uid() = user_id);
create policy "Allow owner update" on public.projects for update using (auth.uid() = user_id);
create policy "Allow owner delete" on public.projects for delete using (auth.uid() = user_id);
```

### 3. Utilisation

- **Page `/login`** : Envoi de lien magique par email
- **Page `/generate`** : Génération d'images (authentification requise)
- **Isolation des données** : Chaque utilisateur ne voit que ses projets
