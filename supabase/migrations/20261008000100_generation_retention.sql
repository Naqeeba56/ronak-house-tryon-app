alter table public.try_on_generations
  add column if not exists expires_at timestamptz;

update public.try_on_generations
set expires_at = created_at + interval '30 days'
where expires_at is null;

alter table public.try_on_generations
  alter column expires_at set default (now() + interval '30 days'),
  alter column expires_at set not null;

create index if not exists try_on_generations_expires_at_idx
  on public.try_on_generations (expires_at);