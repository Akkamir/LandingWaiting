-- Ajouter la colonne user_id à projects et indexer
alter table public.projects add column if not exists user_id uuid references auth.users(id);
create index if not exists idx_projects_user_id on public.projects(user_id);


