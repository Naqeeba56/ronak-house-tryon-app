alter table public.tryon_pack_orders
  drop constraint if exists tryon_pack_orders_plan_amount_check;

alter table public.tryon_pack_orders
  add constraint tryon_pack_orders_plan_amount_check
  check (
    (plan_id = 'starter' and amount_paise = 6000 and tryon_count = 10)
    or (plan_id = 'pro' and amount_paise = 49900 and tryon_count in (80, 90))
    or (plan_id = 'topup' and amount_paise = 29900 and tryon_count in (45, 50))
  );

drop policy if exists "Users can create their own pending pack orders" on public.tryon_pack_orders;
create policy "Users can create their own pending pack orders"
  on public.tryon_pack_orders for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'created'
    and razorpay_payment_id is null
    and (
      (plan_id = 'starter' and amount_paise = 6000 and tryon_count = 10)
      or (plan_id = 'pro' and amount_paise = 49900 and tryon_count = 80)
      or (plan_id = 'topup' and amount_paise = 29900 and tryon_count = 45)
    )
  );
