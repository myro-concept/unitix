import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CreditCard, Loader2, Ticket, Wallet as WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const PLATFORM_FEE_RATE = 0.04;

type WalletTransaction = {
  id: string;
  date: string;
  amount: number;
  eventName: string;
};

type WalletWithdrawal = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  requested_at: string;
  paid_at: string | null;
};

export default function WalletPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmittingWithdrawal, setIsSubmittingWithdrawal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["wallet", user?.id],
    enabled: !!user,
    staleTime: 15_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const { data: tickets, error: ticketsError } = await supabase
        .from("issued_tickets")
        .select("id, amount_paid, created_at, status, events!inner(name, user_id), registrations!inner(status)")
        .eq("events.user_id", user!.id)
        .order("created_at", { ascending: false });

      if (ticketsError) throw ticketsError;

      const transactions: WalletTransaction[] = (tickets || [])
        .filter((ticket) => {
          const registration = Array.isArray(ticket.registrations) ? ticket.registrations[0] : ticket.registrations;
          return ticket.status !== "cancelled" && registration?.status !== "cancelled";
        })
        .map((ticket) => {
          const event = Array.isArray(ticket.events) ? ticket.events[0] : ticket.events;
          return {
            id: ticket.id,
            date: ticket.created_at,
            amount: Math.max(0, Number(ticket.amount_paid || 0)),
            eventName: event?.name || "Event",
          };
        });

      const totalTicketSales = transactions.reduce((sum, tx) => sum + tx.amount, 0);

      const { data: withdrawals, error: withdrawalsError } = await supabase
        .from("withdrawal_requests")
        .select("id, amount, currency, status, requested_at, paid_at")
        .eq("organizer_id", user!.id)
        .order("requested_at", { ascending: false });

      if (withdrawalsError) throw withdrawalsError;

      const platformFee = Math.round(totalTicketSales * PLATFORM_FEE_RATE);
      const withdrawalHistory: WalletWithdrawal[] = withdrawals || [];
      const pendingWithdrawals = withdrawalHistory
        .filter((withdrawal) => withdrawal.status === "pending")
        .reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);
      const paidWithdrawals = withdrawalHistory
        .filter((withdrawal) => withdrawal.status === "paid")
        .reduce((sum, withdrawal) => sum + Number(withdrawal.amount), 0);
      const availableBalance = Math.max(0, totalTicketSales - platformFee - pendingWithdrawals - paidWithdrawals);

      return {
        transactions,
        withdrawals: withdrawalHistory,
        totalTicketSales,
        platformFee,
        pendingWithdrawals,
        paidWithdrawals,
        availableBalance,
      };
    },
  });

  const transactions = data?.transactions || [];
  const withdrawals = data?.withdrawals || [];
  const totalTicketSales = data?.totalTicketSales || 0;
  const platformFee = data?.platformFee || 0;
  const pendingWithdrawals = data?.pendingWithdrawals || 0;
  const paidWithdrawals = data?.paidWithdrawals || 0;
  const availableBalance = data?.availableBalance || 0;

  const withdrawalAmountNumber = useMemo(() => {
    const value = Number(withdrawAmount);
    return Number.isFinite(value) ? value : 0;
  }, [withdrawAmount]);

  const openWithdrawDialog = () => {
    setWithdrawAmount(String(availableBalance || ""));
    setIsWithdrawOpen(true);
  };

  const handleWithdrawRequest = async () => {
    if (!user?.email) {
      toast.error("Your account email is missing.");
      return;
    }

    if (!withdrawalAmountNumber || withdrawalAmountNumber <= 0) {
      toast.error("Enter a valid withdrawal amount.");
      return;
    }

    if (withdrawalAmountNumber > availableBalance) {
      toast.error("Withdrawal amount cannot exceed available balance.");
      return;
    }

    setIsSubmittingWithdrawal(true);
    try {
      const { data: requestResult, error } = await supabase.functions.invoke("withdraw-request", {
        body: {
          amount: withdrawalAmountNumber,
          currency: "NGN",
          submission_id: crypto.randomUUID(),
        },
      });

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["wallet", user.id] });
      toast.success(`Withdrawal request submitted.`);
      if (requestResult?.notification_error) {
        toast.error("Your request was recorded, but an email notification could not be sent. Please contact support.");
      }
      setIsWithdrawOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to submit withdrawal request.");
    } finally {
      setIsSubmittingWithdrawal(false);
    }
  };

  const onViewTransactionHistory = () => {
    const section = document.getElementById("wallet-transactions");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Wallet</h1>
        <p className="text-muted-foreground">Manage your earnings and withdrawals.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
        <p className="text-sm font-semibold text-muted-foreground">Available Balance</p>
        <div className="mt-3 flex items-end justify-between gap-3 flex-wrap">
          <p className="text-4xl font-display font-bold tracking-tight">
            {naira.format(availableBalance)}
          </p>
          <div className="w-12 h-12 rounded-2xl bg-[#FF0048] text-white flex items-center justify-center">
            <WalletIcon className="w-6 h-6" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          From ticket sales, minus platform fees
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button className="rounded-xl bg-black text-white hover:bg-black/90" onClick={openWithdrawDialog}>
            Withdraw Funds
          </Button>
          <Button variant="outline" className="rounded-xl" onClick={onViewTransactionHistory}>
            Transaction History
          </Button>
        </div>
      </div>

      <div id="wallet-transactions" className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-5">
        <h2 className="text-xl font-display font-semibold">Recent Transactions</h2>

        {transactions.length === 0 ? (
          <div className="rounded-xl border border-border p-5 text-sm text-muted-foreground">
            No live transactions yet.
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="rounded-xl border border-border p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-[#fff1f2] text-[#FF0048] flex items-center justify-center shrink-0">
                    <Ticket className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Ticket sales - {transaction.eventName}</p>
                    <p className="text-sm text-muted-foreground">{new Date(transaction.date).toLocaleDateString()}</p>
                  </div>
                </div>

                <p className="font-semibold text-emerald-600 whitespace-nowrap">+{naira.format(transaction.amount)}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-5">
        <h2 className="text-xl font-display font-semibold">Withdrawal History</h2>
        {withdrawals.length === 0 ? (
          <div className="rounded-xl border border-border p-5 text-sm text-muted-foreground">
            No withdrawal requests yet.
          </div>
        ) : (
          <div className="space-y-3">
            {withdrawals.map((withdrawal) => (
              <div key={withdrawal.id} className="rounded-xl border border-border p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">Withdrawal request</p>
                  <p className="text-sm text-muted-foreground">
                    Requested {new Date(withdrawal.requested_at).toLocaleDateString()}
                    {withdrawal.paid_at ? ` · Paid ${new Date(withdrawal.paid_at).toLocaleDateString()}` : ""}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-semibold">{naira.format(Number(withdrawal.amount))}</p>
                  <span className={`text-xs font-semibold ${withdrawal.status === "paid" ? "text-emerald-600" : "text-amber-600"}`}>
                    {withdrawal.status === "paid" ? "Paid" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-7 space-y-4">
        <h2 className="text-xl font-display font-semibold">Earnings Breakdown</h2>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Total Ticket Sales</span>
            <span className="font-semibold">{naira.format(totalTicketSales)}</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Platform Fee (4%)</span>
            <span className="font-semibold text-red-600">-{naira.format(platformFee)}</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Pending withdrawals</span>
            <span className="font-semibold text-amber-600">-{naira.format(pendingWithdrawals)}</span>
          </div>

          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">Paid withdrawals</span>
            <span className="font-semibold text-red-600">-{naira.format(paidWithdrawals)}</span>
          </div>

          <div className="h-px bg-border" />

          <div className="flex items-center justify-between gap-3">
            <span className="font-semibold">Available for Withdrawal</span>
            <span className="font-display font-bold text-lg">
              {naira.format(availableBalance)}
            </span>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
          <CreditCard className="w-3.5 h-3.5" />
          Payouts are processed to your saved bank account.
        </div>
      </div>

      <Dialog open={isWithdrawOpen} onOpenChange={setIsWithdrawOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Submit a withdrawal request and we will notify your email ({user?.email}).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount (NGN)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              min={1}
              max={availableBalance}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Available: {naira.format(availableBalance)}</p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWithdrawOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-black text-white hover:bg-black/90" onClick={handleWithdrawRequest} disabled={isSubmittingWithdrawal}>
              {isSubmittingWithdrawal ? "Sending request..." : "Request Withdrawal"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
