create table if not exists public.tryon_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  free_tryon_used boolean not null default false,
  pack_tryons integer not null default 0 check (pack_tryons >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.tryon_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  source text not null check (source in ('free', 'pack')),
  status text not null default 'reserved' check (status in ('reserved', 'consumed', 'refunded')),
  created_at timestamptz not null default now()
);

create table if not exists public.try_on_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  storage_path text not null unique,
  garment_type text not null,
  model_gender text not null check (model_gender in ('male', 'female', 'custom')),
  created_at timestamptz not null default now()
);

create index if not exists try_on_generations_user_created_idx
  on public.try_on_generations (user_id, created_at desc);

create table if not exists public.tryon_pack_orders (
  razorpay_order_id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_paise integer not null check (amount_paise = 6000),
  status text not null default 'created' check (status in ('created', 'paid')),
  razorpay_payment_id text unique,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

alter table public.tryon_entitlements enable row level security;
alter table public.tryon_reservations enable row level security;
alter table public.try_on_generations enable row level security;
alter table public.tryon_pack_orders enable row level security;

drop policy if exists "Users can read their try-on balance" on public.tryon_entitlements;
create policy "Users can read their try-on balance"
  on public.tryon_entitlements for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can read their try-on library" on public.try_on_generations;
create policy "Users can read their try-on library"
  on public.try_on_generations for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can save their try-ons" on public.try_on_generations;
create policy "Users can save their try-ons"
  on public.try_on_generations for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "Users can delete their try-ons" on public.try_on_generations;
create policy "Users can delete their try-ons"
  on public.try_on_generations for delete to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can read their pack orders" on public.tryon_pack_orders;
create policy "Users can read their pack orders"
  on public.tryon_pack_orders for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "Users can create their own pending pack orders" on public.tryon_pack_orders;
create policy "Users can create their own pending pack orders"
  on public.tryon_pack_orders for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and amount_paise = 6000
    and status = 'created'
    and razorpay_payment_id is null
  );

grant select on public.tryon_entitlements to authenticated;
grant select, insert, delete on public.try_on_generations to authenticated;
grant select, insert on public.tryon_pack_orders to authenticated;

create or replace function public.reserve_tryon_credit(p_user_id uuid)
returns table (reservation_id uuid, source text, free_remaining integer, pack_remaining integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entitlement public.tryon_entitlements%rowtype;
  v_reservation_id uuid;
  v_source text;
begin
  if auth.role() <> 'service_role' and auth.uid() is distinct from p_user_id then
    raise exception 'users can only reserve their own try-on credits';
  end if;

  insert into public.tryon_entitlements (user_id)
  values (p_user_id)
  on conflict (user_id) do nothing;

  select * into v_entitlement
  from public.tryon_entitlements
  where user_id = p_user_id
  for update;

  if not v_entitlement.free_tryon_used then
    v_source := 'free';
    update public.tryon_entitlements
    set free_tryon_used = true, updated_at = now()
    where user_id = p_user_id;
  elsif v_entitlement.pack_tryons > 0 then
    v_source := 'pack';
    update public.tryon_entitlements
    set pack_tryons = pack_tryons - 1, updated_at = now()
    where user_id = p_user_id;
  else
    return;
  end if;

  insert into public.tryon_reservations (user_id, source)
  values (p_user_id, v_source)
  returning id into v_reservation_id;

  return query
  select v_reservation_id, v_source, 0,
    v_entitlement.pack_tryons - case when v_source = 'pack' then 1 else 0 end;
end;
$$;

create or replace function public.finish_tryon_reservation(
  p_user_id uuid,
  p_reservation_id uuid,
  p_succeeded boolean
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_reservation public.tryon_reservations%rowtype;
begin
  if auth.role() <> 'service_role' and auth.uid() is distinct from p_user_id then
    raise exception 'users can only finish their own try-on reservations';
  end if;

  select * into v_reservation
  from public.tryon_reservations
  where id = p_reservation_id and user_id = p_user_id
  for update;

  if not found or v_reservation.status <> 'reserved' then
    return false;
  end if;

  if p_succeeded then
    update public.tryon_reservations set status = 'consumed' where id = p_reservation_id;
  else
    if v_reservation.source = 'free' then
      update public.tryon_entitlements
      set free_tryon_used = false, updated_at = now()
      where user_id = p_user_id;
    else
      update public.tryon_entitlements
      set pack_tryons = pack_tryons + 1, updated_at = now()
      where user_id = p_user_id;
    end if;
    update public.tryon_reservations set status = 'refunded' where id = p_reservation_id;
  end if;

  return true;
end;
$$;

create or replace function public.credit_tryon_pack(p_razorpay_order_id text, p_razorpay_payment_id text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.tryon_pack_orders%rowtype;
begin
  if auth.role() <> 'service_role' then
    raise exception 'service role required';
  end if;

  select * into v_order
  from public.tryon_pack_orders
  where razorpay_order_id = p_razorpay_order_id
  for update;

  if not found then
    raise exception 'order not found';
  end if;

  if v_order.status = 'paid' then
    return v_order.razorpay_payment_id = p_razorpay_payment_id;
  end if;

  insert into public.tryon_entitlements (user_id, pack_tryons)
  values (v_order.user_id, 10)
  on conflict (user_id) do update
    set pack_tryons = public.tryon_entitlements.pack_tryons + 10,
        updated_at = now();

  update public.tryon_pack_orders
  set status = 'paid', razorpay_payment_id = p_razorpay_payment_id, paid_at = now()
  where razorpay_order_id = p_razorpay_order_id;

  return true;
end;
$$;

revoke all on function public.reserve_tryon_credit(uuid) from public, anon, authenticated;
revoke all on function public.finish_tryon_reservation(uuid, uuid, boolean) from public, anon, authenticated;
revoke all on function public.credit_tryon_pack(text, text) from public, anon, authenticated;
grant execute on function public.reserve_tryon_credit(uuid) to authenticated, service_role;
grant execute on function public.finish_tryon_reservation(uuid, uuid, boolean) to authenticated, service_role;
grant execute on function public.credit_tryon_pack(text, text) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('try-on-results', 'try-on-results', false, 12582912, array['image/png', 'image/jpeg', 'image/webp'])
on conflict (id) do update
set public = false, file_size_limit = 12582912,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp'];

drop policy if exists "Users can read their private try-on images" on storage.objects;
create policy "Users can read their private try-on images"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'try-on-results'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can upload their private try-on images" on storage.objects;
create policy "Users can upload their private try-on images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'try-on-results'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users can remove their private try-on images" on storage.objects;
create policy "Users can remove their private try-on images"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'try-on-results'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );