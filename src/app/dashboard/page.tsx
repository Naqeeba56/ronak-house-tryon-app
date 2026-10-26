import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowUpRight, IndianRupee, LayoutDashboard, Users } from "lucide-react";
import { APP_ADMIN_EMAIL } from "@/lib/constants";
import { formatDisplayDate } from "@/lib/date-format";
import ErrorAlert from "@/components/ui/ErrorAlert";
import BrandMark from "@/components/layout/BrandMark";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = {
  title: "Owner Dashboard",
  robots: { index: false, follow: false },
};

type PaidOrder = {
  razorpay_order_id: string;
  user_id: string;
  amount_paise: number;
  plan_id: string;
  paid_at: string | null;
};

const formatCurrency = (paise: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(paise / 100);

export default async function DashboardPage() {
  const sessionClient = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await sessionClient.auth.getUser();
  if (authError || !user) redirect("/?auth=required");
  const isOwner = user.app_metadata?.role === "owner"
    || user.email?.trim().toLowerCase() === APP_ADMIN_EMAIL;
  if (!isOwner) redirect("/");
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const activityWindowStart = new Date(thirtyDaysAgo).toISOString();

  let analyticsError: string | null = null;
  let userCount = 0;
  let newUserCount = 0;
  let generationCount = 0;
  let activeUserCount = 0;
  const paidOrders: PaidOrder[] = [];
  let recentUsers: Array<{ id: string; email: string; name: string; createdAt: string }> = [];

  try {
    const admin = createSupabaseAdminClient();
    const [usersResult, generationsResult] = await Promise.all([
      admin.auth.admin.listUsers({ page: 1, perPage: 1000 }),
      admin.from("try_on_generations").select("id", { count: "exact", head: true }),
    ]);
    if (usersResult.error) throw usersResult.error;
    if (generationsResult.error) throw generationsResult.error;

    generationCount = generationsResult.count ?? 0;
    const activeUserIds = new Set<string>();
    for (let start = 0; ; start += 1000) {
      const { data, error } = await admin
        .from("try_on_generations")
        .select("user_id")
        .gte("created_at", activityWindowStart)
        .order("created_at", { ascending: false })
        .range(start, start + 999);
      if (error) throw error;
      for (const generation of data ?? []) activeUserIds.add(generation.user_id);
      if (!data || data.length < 1000) break;
    }
    activeUserCount = activeUserIds.size;
    let page = 1;
    let pageUsers = usersResult.data.users;
    while (true) {
      if (page === 1) userCount = usersResult.data.total;
      newUserCount += pageUsers.filter(({ created_at }) => Date.parse(created_at) >= thirtyDaysAgo).length;
      recentUsers = [...recentUsers, ...pageUsers.map((account) => ({
        id: account.id,
        email: account.email ?? "No email",
        name: String(account.user_metadata?.full_name ?? account.user_metadata?.name ?? "FabricFit member"),
        createdAt: account.created_at,
      }))]
        .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
        .slice(0, 8);
      if (pageUsers.length < 1000) break;
      page += 1;
      const nextPage = await admin.auth.admin.listUsers({ page, perPage: 1000 });
      if (nextPage.error) throw nextPage.error;
      pageUsers = nextPage.data.users;
    }

    for (let start = 0; ; start += 1000) {
      const { data, error } = await admin
        .from("tryon_pack_orders")
        .select("razorpay_order_id, user_id, amount_paise, plan_id, paid_at")
        .eq("status", "paid")
        .order("paid_at", { ascending: false })
        .range(start, start + 999);
      if (error) throw error;
      paidOrders.push(...(data ?? []));
      if (!data || data.length < 1000) break;
    }
  } catch (error) {
    analyticsError = error instanceof Error ? error.message : "Analytics data could not be loaded.";
  }

  const recentRevenuePaise = paidOrders.reduce(
    (total, order) => total + (order.paid_at && Date.parse(order.paid_at) >= thirtyDaysAgo ? order.amount_paise : 0),
    0,
  );
  const paidUserMap = new Map(recentUsers.map((account) => [account.id, account.email]));

  return (
    <div className="mobile-compact mx-auto min-h-[75vh] max-w-7xl space-y-4 px-4 py-7 text-slate-100 sm:space-y-8 sm:px-8 sm:py-10 lg:px-10">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-400/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-indigo-300"><LayoutDashboard className="h-3.5 w-3.5" /> Owner only</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:mt-4 sm:text-4xl">Analytics dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">Registered users, try-on activity, and captured Razorpay revenue.</p>
        </div>
        <Link href="/profile" className="inline-flex min-h-10 items-center gap-2 self-start rounded-full border border-slate-700 px-4 text-sm font-medium text-slate-300 transition hover:border-indigo-400/50 hover:text-white sm:self-auto">Account <ArrowUpRight className="h-4 w-4" /></Link>
      </header>

      {analyticsError && <ErrorAlert
        description="Analytics could not be fully loaded."
        details={<p className="mt-1 break-words text-gray-500">{analyticsError} Check that the server-only Supabase credential is configured and required migrations have been applied.</p>}
        className="w-full sm:w-full"
      />}

      <section aria-label="Key analytics" className="grid grid-cols-2 gap-2.5 sm:gap-4 xl:grid-cols-3">
        <MetricCard label="Registered users" value={analyticsError ? "—" : userCount.toLocaleString()} detail={analyticsError ? "Unavailable until Supabase is configured" : `${newUserCount} joined in the last 30 days`} icon={<Users className="h-5 w-5 text-indigo-300" />} />
        <MetricCard label="Active users · 30 days" value={analyticsError ? "—" : activeUserCount.toLocaleString()} detail={analyticsError ? "Unavailable until Supabase is configured" : "Users with a saved generation in the last 30 days"} icon={<Users className="h-5 w-5 text-violet-300" />} />
        <MetricCard label="Generated images" value={analyticsError ? "—" : generationCount.toLocaleString()} detail={analyticsError ? "Unavailable until Supabase is configured" : "Historical generation records"} icon={<BrandMark className="h-5 w-5" />} />
        <MetricCard label="Revenue · 30 days" value={analyticsError ? "—" : formatCurrency(recentRevenuePaise)} detail={analyticsError ? "Unavailable until Supabase is configured" : `${paidOrders.length} paid orders total`} icon={<IndianRupee className="h-5 w-5 text-amber-300" />} />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/75">
          <div className="border-b border-slate-800 px-5 py-4"><h2 className="font-semibold text-white">Recent sign-ups</h2><p className="mt-1 text-xs text-slate-500">Latest accounts from Supabase Auth</p></div>
          <div className="divide-y divide-slate-800">
            {analyticsError ? <p className="px-5 py-8 text-sm text-slate-500">Sign-up analytics are unavailable until the server credential is configured.</p> : recentUsers.length ? recentUsers.map((account) => (
              <div key={account.id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-200">{account.name}</p><p className="truncate text-xs text-slate-500">{account.email}</p></div>
                <time className="shrink-0 text-xs text-slate-500">{formatDisplayDate(account.createdAt)}</time>
              </div>
            )) : <p className="px-5 py-8 text-sm text-slate-500">No user records to show.</p>}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/75">
          <div className="border-b border-slate-800 px-5 py-4"><h2 className="font-semibold text-white">Recent paid orders</h2><p className="mt-1 text-xs text-slate-500">Revenue counts only captured orders</p></div>
          <div className="divide-y divide-slate-800">
            {paidOrders.slice(0, 8).length ? paidOrders.slice(0, 8).map((order) => (
              <div key={order.razorpay_order_id} className="flex items-center justify-between gap-4 px-5 py-3.5">
                <div className="min-w-0"><p className="truncate text-sm font-medium capitalize text-slate-200">{order.plan_id} plan</p><p className="truncate text-xs text-slate-500">{paidUserMap.get(order.user_id) ?? order.razorpay_order_id}</p></div>
                <div className="shrink-0 text-right"><p className="text-sm font-semibold text-emerald-300">{formatCurrency(order.amount_paise)}</p><time className="text-xs text-slate-500">{order.paid_at ? formatDisplayDate(order.paid_at) : "—"}</time></div>
              </div>
            )) : <p className="px-5 py-8 text-sm text-slate-500">No captured payments yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <article className="min-w-0 rounded-2xl border border-slate-800 bg-slate-900/75 p-3.5 sm:p-5">
      <div className="flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p>{icon}</div>
      <p className="mt-4 break-words text-2xl font-semibold tracking-tight text-white sm:mt-5 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  );
}
