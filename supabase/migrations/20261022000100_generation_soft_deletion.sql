alter table public.try_on_generations
  add column if not exists deleted_at timestamptz;

create index if not exists try_on_generations_deleted_at_idx
  on public.try_on_generations (deleted_at)
  where deleted_at is not null;

drop policy if exists "Users can soft delete their try-ons" on public.try_on_generations;
create policy "Users can soft delete their try-ons"
  on public.try_on_generations for update to authenticated
  using (user_id = (select auth.uid()) and deleted_at is null)
  with check (user_id = (select auth.uid()) and deleted_at is not null);

grant update (deleted_at) on public.try_on_generations to authenticated;

create or replace view public.try_on_generations_with_retention
with (security_invoker = true)
as
select
  id,
  user_id,
  storage_path,
  garment_type,
  model_gender,
  created_at,
  expires_at,
  greatest(0, ceil(extract(epoch from (expires_at - now())) / 86400))::integer as days_remaining
from public.try_on_generations
where expires_at > now()
  and deleted_at is null;

grant select on public.try_on_generations_with_retention to authenticated;
