-- Enable RLS and owner-only read on subscriptions
alter table if exists public.subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'subscriptions' and policyname = 'Allow owner read subscriptions'
  ) then
    create policy "Allow owner read subscriptions" on public.subscriptions
      for select using ( auth.uid() = user_id );
  end if;
end $$;


