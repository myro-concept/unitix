import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  eventId: string;
  currentPolicy: string | null;
};

export default function EventRefundPolicy({ eventId, currentPolicy }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [requestedPolicy, setRequestedPolicy] = useState("");

  const requestQuery = useQuery({
    queryKey: ["event-refund-policy-requests", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_refund_policy_requests")
        .select("id, requested_policy, status, submitted_at, review_note")
        .eq("event_id", eventId)
        .order("submitted_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const requestMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Sign in to request a refund policy change.");
      const { error } = await supabase.from("event_refund_policy_requests").insert({
        event_id: eventId,
        organizer_id: user.id,
        requested_policy: requestedPolicy.trim(),
      });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["event-refund-policy-requests", eventId] });
      setRequestedPolicy("");
      toast.success("Refund policy change sent for admin approval.");
    },
    onError: (error) => toast.error(error.message || "Could not submit the refund policy request."),
  });

  const latestRequest = requestQuery.data?.[0];
  const pendingRequest = requestQuery.data?.some((request) => request.status === "pending") ?? false;

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="text-lg font-semibold">Refund policy</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {currentPolicy || "UniTix's standard refund policy applies until an admin approves a change."}
          </p>
        </div>

        {requestQuery.isError && (
          <p role="alert" className="text-sm text-destructive">Could not load refund policy requests.</p>
        )}

        {latestRequest && (
          <div className="rounded-lg border p-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">Latest request</span>
              <Badge variant={latestRequest.status === "approved" ? "default" : "secondary"} className="capitalize">
                {latestRequest.status}
              </Badge>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-muted-foreground">{latestRequest.requested_policy}</p>
            {latestRequest.review_note && (
              <p className="mt-2 text-muted-foreground">Admin note: {latestRequest.review_note}</p>
            )}
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor={`refund-policy-${eventId}`} className="text-sm font-medium">
            Request a policy change
          </label>
          <Textarea
            id={`refund-policy-${eventId}`}
            value={requestedPolicy}
            onChange={(event) => setRequestedPolicy(event.target.value)}
            maxLength={4000}
            rows={4}
            placeholder="Describe the refund policy you are requesting."
            disabled={pendingRequest || requestMutation.isPending}
          />
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Changes take effect only after admin approval.
            </p>
            <Button
              type="button"
              size="sm"
              disabled={!requestedPolicy.trim() || pendingRequest || requestMutation.isPending}
              onClick={() => requestMutation.mutate()}
            >
              {requestMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Submit request
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
