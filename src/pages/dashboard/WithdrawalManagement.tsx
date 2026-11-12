import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Banknote, CheckCircle2, Clock3, Loader2, Upload } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";

type WithdrawalRequest = {
  id: string;
  organizer_name: string;
  organizer_company: string | null;
  organizer_email: string;
  organizer_phone: string | null;
  bank_name: string | null;
  account_name: string | null;
  account_number: string | null;
  amount: number;
  currency: string;
  status: string;
  requested_at: string;
  paid_at: string | null;
  paid_reference: string | null;
  receipt_path: string | null;
};

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
});

export default function WithdrawalManagement() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const adminQuery = useIsAdmin();
  const canManage = adminQuery.data === true;
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [paidReference, setPaidReference] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);

  const requestsQuery = useQuery({
    queryKey: ["withdrawal-requests"],
    enabled: canManage,
    refetchInterval: 30_000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("withdrawal_requests")
        .select("*")
        .order("requested_at", { ascending: false });
      if (error) throw error;
      return data as WithdrawalRequest[];
    },
  });

  const markPaid = useMutation({
    mutationFn: async (request: WithdrawalRequest) => {
      let receiptPath: string | null = null;
      if (receiptFile) {
        const extension = receiptFile.name.split(".").pop()?.toLowerCase() || "file";
        receiptPath = `${request.id}/${crypto.randomUUID()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("withdrawal-receipts")
          .upload(receiptPath, receiptFile, {
            contentType: receiptFile.type,
            upsert: false,
          });
        if (uploadError) throw uploadError;
      }

      const { data, error } = await supabase.functions.invoke("mark-withdrawal-paid", {
        body: {
          request_id: request.id,
          paid_reference: paidReference.trim() || null,
          receipt_path: receiptPath,
        },
      });
      if (error) throw error;
      return data as { success: boolean; notification_error?: string | null };
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["withdrawal-requests"] }),
        queryClient.invalidateQueries({ queryKey: ["wallet"] }),
      ]);
      toast.success("Withdrawal marked as paid.");
      if (result.notification_error) toast.warning(result.notification_error);
      setSelectedRequest(null);
      setPaidReference("");
      setReceiptFile(null);
    },
    onError: (error) => {
      console.error("Failed to mark withdrawal as paid:", error);
      toast.error(error.message || "Could not update the withdrawal. Please try again.");
    },
  });

  const pendingTotal = useMemo(
    () => (requestsQuery.data || [])
      .filter((request) => request.status === "pending")
      .reduce((sum, request) => sum + Number(request.amount), 0),
    [requestsQuery.data],
  );
  const paidTotal = useMemo(
    () => (requestsQuery.data || [])
      .filter((request) => request.status === "paid")
      .reduce((sum, request) => sum + Number(request.amount), 0),
    [requestsQuery.data],
  );

  if (adminQuery.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Checking admin access" />
      </div>
    );
  }

  if (adminQuery.isError) {
    return <p className="text-sm text-destructive">Could not verify admin access. Please refresh and try again.</p>;
  }

  if (!canManage) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center">
        <h1 className="text-xl font-bold">Admin access required</h1>
        <p className="mt-2 text-sm text-muted-foreground">Only admins can manage withdrawal requests.</p>
        <Button className="mt-5" variant="outline" onClick={() => navigate("/dashboard/events")}>
          Back to events
        </Button>
      </div>
    );
  }

  if (requestsQuery.isPending) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading withdrawal requests" />
      </div>
    );
  }

  if (requestsQuery.isError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-white p-6">
        <h1 className="text-xl font-bold">Withdrawal management</h1>
        <p className="mt-2 text-sm text-destructive">Could not load withdrawal requests. Please retry.</p>
        <Button className="mt-4" variant="outline" onClick={() => void requestsQuery.refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  const requests = requestsQuery.data || [];
  const pendingRequests = requests.filter((request) => request.status === "pending");
  const paidRequests = requests.filter((request) => request.status === "paid");

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-8">
      <header>
        <h1 className="text-3xl font-display font-bold">Withdrawal management</h1>
        <p className="mt-1 text-muted-foreground">Review organizer payout requests and record completed bank transfers.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-amber-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-700">
            <Clock3 className="h-4 w-4" /> Pending payouts
          </div>
          <p className="mt-3 text-2xl font-bold">{naira.format(pendingTotal)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{pendingRequests.length} request{pendingRequests.length === 1 ? "" : "s"} awaiting transfer</p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Paid payouts
          </div>
          <p className="mt-3 text-2xl font-bold">{naira.format(paidTotal)}</p>
          <p className="mt-1 text-sm text-muted-foreground">{paidRequests.length} completed transfer{paidRequests.length === 1 ? "" : "s"}</p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Pending requests</h2>
        {pendingRequests.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground">
            There are no pending withdrawal requests.
          </div>
        ) : pendingRequests.map((request) => (
          <article key={request.id} className="rounded-2xl border border-border bg-white p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div>
                <p className="text-lg font-bold">{request.organizer_name}</p>
                <p className="text-sm text-muted-foreground">
                  {request.organizer_company || "Organizer"} · {request.organizer_email}
                  {request.organizer_phone ? ` · ${request.organizer_phone}` : ""}
                </p>
                <p className="mt-3 text-2xl font-bold">{naira.format(Number(request.amount))}</p>
                <p className="text-sm text-muted-foreground">
                  Requested {new Date(request.requested_at).toLocaleString()}
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                <Clock3 className="h-3.5 w-3.5" /> Pending
              </span>
            </div>

            <div className="mt-5 grid gap-3 rounded-xl bg-[#fafaf9] p-4 text-sm sm:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Bank</p>
                <p className="font-semibold">{request.bank_name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Account name</p>
                <p className="font-semibold">{request.account_name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Account number</p>
                <p className="font-semibold">{request.account_number || "Not provided"}</p>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Transfer the funds to the saved account before marking this request paid.
              </p>
              <Button
                className="rounded-xl bg-[#111111] text-white hover:bg-black/90"
                onClick={() => {
                  setSelectedRequest(request);
                  setPaidReference("");
                  setReceiptFile(null);
                }}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Mark paid
              </Button>
            </div>
          </article>
        ))}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Payment history</h2>
        {paidRequests.length === 0 ? (
          <div className="rounded-2xl border border-border bg-white p-6 text-sm text-muted-foreground">
            No withdrawals have been marked paid yet.
          </div>
        ) : paidRequests.map((request) => (
          <article key={request.id} className="flex flex-col justify-between gap-3 rounded-2xl border border-border bg-white p-5 sm:flex-row sm:items-center">
            <div>
              <p className="font-semibold">{request.organizer_name} · {request.organizer_email}</p>
              <p className="text-sm text-muted-foreground">
                Paid {request.paid_at ? new Date(request.paid_at).toLocaleString() : "—"}
                {request.paid_reference ? ` · Ref: ${request.paid_reference}` : ""}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-bold">{naira.format(Number(request.amount))}</p>
              <span className="text-xs font-semibold text-emerald-700">Paid</span>
            </div>
          </article>
        ))}
      </section>

      <Dialog
        open={selectedRequest !== null}
        onOpenChange={(open) => {
          if (!open && !markPaid.isPending) {
            setSelectedRequest(null);
            setReceiptFile(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm payout completion</DialogTitle>
            <DialogDescription>
              Confirm that you transferred {selectedRequest ? naira.format(Number(selectedRequest.amount)) : ""} to the organizer’s saved bank account. This updates their wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="payout-reference">Transfer reference (optional)</Label>
            <Input
              id="payout-reference"
              value={paidReference}
              onChange={(event) => setPaidReference(event.target.value)}
              placeholder="Bank transfer reference"
              maxLength={120}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payout-receipt">Upload receipt (optional)</Label>
            <Input
              id="payout-receipt"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              disabled={markPaid.isPending}
              onChange={(event) => {
                const file = event.target.files?.[0] || null;
                const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
                if (file && !allowedTypes.includes(file.type)) {
                  toast.error("Upload a PDF, JPG, PNG, or WebP receipt.");
                  event.target.value = "";
                  setReceiptFile(null);
                  return;
                }
                if (file && file.size > 5 * 1024 * 1024) {
                  toast.error("Receipt must be 5 MB or smaller.");
                  event.target.value = "";
                  setReceiptFile(null);
                  return;
                }
                setReceiptFile(file);
              }}
            />
            <p className="text-xs text-muted-foreground">
              PDF, JPG, PNG, or WebP. The receipt is stored privately and a secure link will be emailed to the organizer.
            </p>
            {receiptFile && (
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Upload className="h-3.5 w-3.5" />
                {receiptFile.name}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" disabled={markPaid.isPending} onClick={() => setSelectedRequest(null)}>
              Cancel
            </Button>
            <Button
              className="bg-[#111111] text-white hover:bg-black/90"
              disabled={!selectedRequest || markPaid.isPending}
              onClick={() => selectedRequest && markPaid.mutate(selectedRequest)}
            >
              {markPaid.isPending ? "Uploading and saving..." : "Confirm paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
