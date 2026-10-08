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
where expires_at > now();

grant select on public.try_on_generations_with_retention to authenticated;

alter table public.tryon_pack_orders
  add column if not exists plan_id text not null default 'starter',
  add column if not exists tryon_count integer not null default 10 check (tryon_count > 0);

alter table public.tryon_pack_orders
  drop constraint if exists tryon_pack_orders_amount_paise_check;

alter table public.tryon_pack_orders
  add constraint tryon_pack_orders_plan_amount_check
  check (
    (plan_id = 'starter' and amount_paise = 6000 and tryon_count = 10)
    or (plan_id = 'pro' and amount_paise = 49900 and tryon_count = 90)
    or (plan_id = 'topup' and amount_paise = 29900 and tryon_count = 50)
  );

create table if not exists public.tryon_credit_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  razorpay_order_id text unique references public.tryon_pack_orders(razorpay_order_id) on delete cascade,
  plan_id text not null check (plan_id in ('legacy', 'starter', 'pro', 'topup')),
  credits_issued integer not null check (credits_issued > 0),
  credits_remaining integer not null check (credits_remaining >= 0 and credits_remaining <= credits_issued),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists tryon_credit_grants_user_expiry_idx
  on public.tryon_credit_grants (user_id, expires_at, created_at)
  where credits_remaining > 0;

alter table public.tryon_credit_grants enable row level security;

drop policy if exists "Users can read their credit grants" on public.tryon_credit_grants;
create policy "Users can read their credit grants"
  on public.tryon_credit_grants for select to authenticated
  using (user_id = (select auth.uid()));

grant select on public.tryon_credit_grants to authenticated;

alter table public.tryon_reservations
  add column if not exists grant_id uuid references public.tryon_credit_grants(id) on delete set null;

insert into public.tryon_credit_grants (
  user_id, plan_id, credits_issued, credits_remaining, expires_at
)
select user_id, 'legacy', pack_tryons, pack_tryons, now() + interval '30 days'
from public.tryon_entitlements
where pack_tryons > 0
on conflict do nothing;

drop policy if exists "Users can create their own pending pack orders" on public.tryon_pack_orders;
create policy "Users can create their own pending pack orders"
  on public.tryon_pack_orders for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'created'
    and razorpay_payment_id is null
    and (
      (plan_id = 'starter' and amount_paise = 6000 and tryon_count = 10)
      or (plan_id = 'pro' and amount_paise = 49900 and tryon_count = 90)
      or (plan_id = 'topup' and amount_paise = 29900 and tryon_count = 50)
    )
  );

create or replace function public.reserve_tryon_credit(p_user_id uuid)
returns table (reservation_id uuid, source text, free_remaining integer, pack_remaining integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_entitlement public.tryon_entitlements%rowtype;
  v_grant public.tryon_credit_grants%rowtype;
  v_reservation_id uuid;
  v_source text;
  v_pack_remaining integer;
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
  else
    select * into v_grant
    from public.tryon_credit_grants
    where user_id = p_user_id
      and credits_remaining > 0
      and expires_at > now()
    order by expires_at, created_at
    limit 1
    for update;

    if not found then
      return;
    end if;

    v_source := 'pack';
    update public.tryon_credit_grants
    set credits_remaining = credits_remaining - 1
    where id = v_grant.id;
    update public.tryon_entitlements
    set pack_tryons = greatest(pack_tryons - 1, 0), updated_at = now()
    where user_id = p_user_id;
  end if;

  insert into public.tryon_reservations (user_id, source, grant_id)
  values (p_user_id, v_source, case when v_source = 'pack' then v_grant.id else null end)
  returning id into v_reservation_id;

  select coalesce(sum(credits_remaining), 0)::integer into v_pack_remaining
  from public.tryon_credit_grants
  where user_id = p_user_id
    and credits_remaining > 0
    and expires_at > now();

  return query select v_reservation_id, v_source, 0, v_pack_remaining;
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
      if v_reservation.grant_id is not null then
        update public.tryon_credit_grants
        set credits_remaining = least(credits_issued, credits_remaining + 1)
        where id = v_reservation.grant_id and expires_at > now();
      end if;
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

  insert into public.tryon_credit_grants (
    user_id, razorpay_order_id, plan_id, credits_issued, credits_remaining, expires_at
  ) values (
    v_order.user_id, v_order.razorpay_order_id, v_order.plan_id,
    v_order.tryon_count, v_order.tryon_count, now() + interval '30 days'
  );

  insert into public.tryon_entitlements (user_id, pack_tryons)
  values (v_order.user_id, v_order.tryon_count)
  on conflict (user_id) do update
    set pack_tryons = public.tryon_entitlements.pack_tryons + v_order.tryon_count,
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