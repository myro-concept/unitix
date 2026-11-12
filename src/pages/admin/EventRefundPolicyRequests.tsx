import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, X } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type RefundPolicyRequest = {
  id: string;
  event_id: string;
  requested_policy: string;
  status: string;
  submitted_at: string;
  review_note: string | null;
  event_name: string;
};

export default function EventRefundPolicyRequests() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const adminQuery = useIsAdmin();
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({});

  const requestsQuery = useQuery({
    queryKey: ["admin-event-refund-policy-requests"],
    enabled: adminQuery.data === true,
    queryFn: async () => {
      const { data: requests, error } = await supabase
        .from("event_refund_policy_requests")
        .select("id, event_id, requested_policy, status, submitted_at, review_note")
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      if (!requests?.length) return [];

      const eventIds = [...new Set(requests.map((request) => request.event_id))];
      const { data: events, error: eventsError } = await supabase
        .from("events")
        .select("id, name")
        .in("id", eventIds);
      if (eventsError) throw eventsError;

      const eventNames = new Map((events || []).map((event) => [event.id, event.name]));
      return requests.map((request) => ({
        ...request,
        event_name: eventNames.get(request.event_id) || "Event",
      })) as RefundPolicyRequest[];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ requestId, decision }: { requestId: string; decision: "approved" | "rejected" }) => {
      const { error } = await supabase.rpc("review_event_refund_policy_request", {
        p_request_id: requestId,
        p_decision: decision,
        p_review_note: reviewNote[requestId]?.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-event-refund-policy-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["event-refund-policy-requests"] });
      await queryClient.invalidateQueries({ queryKey: ["owned-event-slug"] });
      await queryClient.invalidateQueries({ queryKey: ["event-slug"] });
      await queryClient.invalidateQueries({ queryKey: ["event-edit-history"] });
      toast.success("Refund policy request reviewed.");
    },
    onError: (error) => toast.error(error.message || "Could not review the request."),
  });

  if (adminQuery.isPending) {
    return <div className="flex min-h-[40vh] items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (adminQuery.isError) {
    return <p role="alert" className="text-sm text-destructive">Could not verify admin access.</p>;
  }
  if (!adminQuery.data) {
    return (
      <div className="mx-auto max-w-xl rounded-2xl border bg-white p-8 text-center">
        <h1 className="text-xl font-bold">Admin access required</h1>
        <Button className="mt-5" variant="outline" onClick={() => navigate("/dashboard/events")}>Back to events</Button>
      </div>
    );
  }
  if (requestsQuery.isError) {
    return <p role="alert" className="text-sm text-destructive">Could not load refund policy requests.</p>;
  }

  const requests = requestsQuery.data || [];
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-3xl font-display font-bold">Refund policy requests</h1>
        <p className="mt-1 text-muted-foreground">Review organizer proposals. Approved policies immediately apply to the event.</p>
      </header>
      {requestsQuery.isPending ? (
        <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin" /></div>
      ) : requests.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-sm text-muted-foreground">No refund policy requests yet.</CardContent></Card>
      ) : requests.map((request) => (
        <Card key={request.id}>
          <CardContent className="space-y-4 p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{request.event_name}</h2>
                <p className="text-sm text-muted-foreground">
                  Submitted {format(new Date(request.submitted_at), "PP p")}
                </p>
              </div>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-semibold capitalize">{request.status}</span>
            </div>
            <p className="whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm">{request.requested_policy}</p>
            {request.status === "pending" ? (
              <>
                <Textarea
                  value={reviewNote[request.id] || ""}
                  onChange={(event) => setReviewNote((current) => ({ ...current, [request.id]: event.target.value }))}
                  placeholder="Optional note for the organizer"
                  rows={2}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    disabled={reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate({ requestId: request.id, decision: "rejected" })}
                  >
                    <X className="mr-2 h-4 w-4" /> Reject
                  </Button>
                  <Button
                    disabled={reviewMutation.isPending}
                    onClick={() => reviewMutation.mutate({ requestId: request.id, decision: "approved" })}
                  >
                    <Check className="mr-2 h-4 w-4" /> Approve
                  </Button>
                </div>
              </>
            ) : request.review_note ? (
              <p className="text-sm text-muted-foreground">Admin note: {request.review_note}</p>
            ) : null}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
