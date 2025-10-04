-- Activer RLS et restreindre l'accès aux projets par utilisateur
alter table public.projects enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'projects' and policyname = 'Allow owner read'
  ) then
    create policy "Allow owner read" on public.projects
      for select using ( auth.uid() = user_id );
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'projects' and policyname = 'Allow owner insert'
  ) then
    create policy "Allow owner insert" on public.projects
      for insert with check ( auth.uid() = user_id );
  end if;
end $$;


