create table if not exists public.user_journals (
  user_id uuid primary key references auth.users(id) on delete cascade,
  journal_data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.user_journals enable row level security;

revoke all on table public.user_journals from anon;
grant select, insert, update, delete on table public.user_journals to authenticated;

drop policy if exists "Users manage only their own journal" on public.user_journals;
create policy "Users manage only their own journal"
on public.user_journals
for all
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create or replace function public.update_journal_timestamp()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_user_journal_updated_at on public.user_journals;
create trigger set_user_journal_updated_at
before update on public.user_journals
for each row
execute function public.update_journal_timestamp();
