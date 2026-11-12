import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

type EventEdit = {
  id: string;
  actor_email: string | null;
  actor_id: string | null;
  changed_at: string;
  changes: Json;
};

const fieldLabels: Record<string, string> = {
  name: "Event title",
  description: "Description",
  background_image_url: "Event poster",
  gallery_urls: "Event gallery",
  location_value: "Venue",
  event_date: "Start date",
  event_end_date: "End date",
  ticket_price: "Ticket price",
  ticket_name: "Ticket type name",
  ticket_type_name: "Ticket type name",
  ticket_quantity: "Available ticket quantity",
  ticket_type: "Ticket type",
  capacity: "Capacity",
  refund_policy: "Refund policy",
  status: "Status",
};

function displayValue(value: Json | undefined): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export default function EventEditHistory({ eventId }: { eventId: string }) {
  const historyQuery = useQuery({
    queryKey: ["event-edit-history", eventId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("event_edit_history")
        .select("id, actor_email, actor_id, changed_at, changes")
        .eq("event_id", eventId)
        .order("changed_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as EventEdit[];
    },
  });

  if (historyQuery.isPending) {
    return <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Loading edit history" />;
  }

  if (historyQuery.isError) {
    return <p role="alert" className="text-sm text-destructive">Could not load event edit history.</p>;
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div>
          <h2 className="text-lg font-semibold">Edit history</h2>
          <p className="text-sm text-muted-foreground">Recent changes, with the editor and time recorded.</p>
        </div>
        {historyQuery.data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No edits recorded yet.</p>
        ) : (
          <ol className="space-y-4">
            {historyQuery.data.map((entry) => {
              const changes = entry.changes && typeof entry.changes === "object" && !Array.isArray(entry.changes)
                ? Object.entries(entry.changes as Record<string, Json>)
                : [];
              return (
                <li key={entry.id} className="border-t pt-3">
                  <p className="text-sm font-medium">
                    {entry.actor_email || (entry.actor_id ? `User ${entry.actor_id.slice(0, 8)}` : "System")}
                    <span className="ml-2 font-normal text-muted-foreground">
                      {format(new Date(entry.changed_at), "PP p")}
                    </span>
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {changes.map(([field, value]) => {
                      const change = value && typeof value === "object" && !Array.isArray(value)
                        ? value as Record<string, Json>
                        : {};
                      return (
                        <li key={field}>
                          <span className="font-medium text-foreground">{fieldLabels[field] || field}:</span>{" "}
                          {displayValue(change.old)} → {displayValue(change.new)}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
