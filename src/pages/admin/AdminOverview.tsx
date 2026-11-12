import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Clock3, Star, WalletCards } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

export default function AdminOverview() {
  const overviewQuery = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const [withdrawalsResult, featuredResult] = await Promise.all([
        supabase.from("withdrawal_requests").select("amount, status"),
        supabase.from("featured_events").select("slot", { count: "exact", head: true }),
      ]);

      if (withdrawalsResult.error) throw withdrawalsResult.error;
      if (featuredResult.error) throw featuredResult.error;

      const withdrawals = withdrawalsResult.data || [];
      const pending = withdrawals.filter((item) => item.status === "pending");
      const paid = withdrawals.filter((item) => item.status === "paid");

      return {
        pendingCount: pending.length,
        pendingAmount: pending.reduce((total, item) => total + Number(item.amount), 0),
        paidAmount: paid.reduce((total, item) => total + Number(item.amount), 0),
        featuredCount: featuredResult.count || 0,
      };
    },
  });

  if (overviewQuery.isPending) {
    return <div className="py-16 text-center text-sm text-muted-foreground">Loading admin overview…</div>;
  }

  if (overviewQuery.isError) {
    return <div className="rounded-2xl border border-destructive/30 bg-white p-6 text-sm text-destructive">Could not load the admin overview. Please refresh and try again.</div>;
  }

  const overview = overviewQuery.data;
  const cards = [
    {
      label: "Pending withdrawals",
      value: naira.format(overview.pendingAmount),
      detail: `${overview.pendingCount} request${overview.pendingCount === 1 ? "" : "s"} need review`,
      icon: Clock3,
      href: "/admin/withdrawals",
      color: "text-amber-700 bg-amber-50",
    },
    {
      label: "Paid withdrawals",
      value: naira.format(overview.paidAmount),
      detail: "Total marked as transferred",
      icon: WalletCards,
      href: "/admin/withdrawals",
      color: "text-emerald-700 bg-emerald-50",
    },
    {
      label: "Featured events",
      value: `${overview.featuredCount} / 5`,
      detail: "Current homepage placements",
      icon: Star,
      href: "/admin/featured-events",
      color: "text-[#FF0048] bg-[#fff1f2]",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#FF0048]">UniTix operations</p>
          <h1 className="mt-2 text-3xl font-display font-bold">Admin dashboard</h1>
          <p className="mt-1 text-muted-foreground">Monitor payouts and manage homepage features.</p>
        </div>
        <Button asChild className="w-fit rounded-xl bg-[#111111] text-white hover:bg-black/90">
          <Link to="/admin/withdrawals">Review withdrawals <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </Button>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.href}
              className="rounded-2xl border border-border bg-white p-5 transition-shadow hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-muted-foreground">{card.label}</p>
                  <p className="mt-3 text-2xl font-bold">{card.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </Link>
          );
        })}
      </section>

      <section className="rounded-2xl border border-border bg-white p-6">
        <h2 className="text-lg font-bold">Admin tools</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link to="/admin/withdrawals" className="rounded-xl border border-border p-4 hover:bg-[#fafaf9]">
            <p className="font-semibold">Withdrawal management</p>
            <p className="mt-1 text-sm text-muted-foreground">Review requests, verify payout details, and record completed bank transfers.</p>
          </Link>
          <Link to="/admin/featured-events" className="rounded-xl border border-border p-4 hover:bg-[#fafaf9]">
            <p className="font-semibold">Featured events</p>
            <p className="mt-1 text-sm text-muted-foreground">Choose which live events appear in the homepage featured section.</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
