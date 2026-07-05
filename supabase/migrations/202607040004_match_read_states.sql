-- Persist per-user read watermarks for active match threads so unread state can
-- follow a profile across browsers/devices.

create table if not exists public.match_read_states (
  match_id uuid not null references public.matches(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  read_through_at timestamptz not null default 'epoch'::timestamptz,
  updated_at timestamptz not null default now(),
  primary key (match_id, profile_id)
);

create index if not exists match_read_states_profile_id_idx
  on public.match_read_states(profile_id);

drop trigger if exists match_read_states_set_updated_at on public.match_read_states;
create trigger match_read_states_set_updated_at
before update on public.match_read_states
for each row execute function public.set_updated_at();

grant select, insert, update on public.match_read_states to authenticated;

alter table public.match_read_states enable row level security;

create policy "match_read_states_select_member_own"
on public.match_read_states
for select
to authenticated
using (
  profile_id = (select auth.uid())
  and private.can_access_active_match(match_id)
);

create policy "match_read_states_insert_member_own"
on public.match_read_states
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and private.can_access_active_match(match_id)
);

create policy "match_read_states_update_member_own"
on public.match_read_states
for update
to authenticated
using (
  profile_id = (select auth.uid())
  and private.can_access_active_match(match_id)
)
with check (
  profile_id = (select auth.uid())
  and private.can_access_active_match(match_id)
);
