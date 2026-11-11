import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { AlertCircle, CheckCircle2, Clock3, ScanQrCode, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TicketScannerDialog } from "@/components/event-detail/TicketScannerDialog";
import { useEvents } from "@/hooks/useEvents";
import { supabase } from "@/integrations/supabase/client";

type CheckInLog = {
  id: string;
  event_id: string;
  result: string;
  scanned_at: string;
  events: { name: string } | null;
  issued_tickets: { attendee_name: string; ticket_type_name: string } | null;
};

const resultStyles: Record<string, string> = {
  checked_in: "bg-green-100 text-green-800",
  already_used: "bg-amber-100 text-amber-800",
  cancelled: "bg-red-100 text-red-800",
  not_found: "bg-muted text-muted-foreground",
};

const resultLabels: Record<string, string> = {
  checked_in: "Checked in",
  already_used: "Duplicate",
  cancelled: "Cancelled",
  not_found: "Not found",
};

export default function TicketCheckIn() {
  const queryClient = useQueryClient();
  const { data: events } = useEvents();
  const {
    data: logs,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["ticket-checkin-logs"],
    queryFn: async () => {
      const { data, error: queryError } = await supabase
        .from("ticket_checkin_logs")
        .select("id, event_id, result, scanned_at, events(name), issued_tickets(attendee_name, ticket_type_name)")
        .order("scanned_at", { ascending: false })
        .limit(50);
      if (queryError) throw queryError;
      return data as CheckInLog[];
    },
  });

  const recentCounts = useMemo(() => ({
    checkedIn: logs?.filter((log) => log.result === "checked_in").length ?? 0,
    duplicates: logs?.filter((log) => log.result === "already_used").length ?? 0,
    rejected: logs?.filter((log) => log.result === "cancelled" || log.result === "not_found").length ?? 0,
  }), [logs]);

  const refreshCheckInData = () => {
    void queryClient.invalidateQueries({ queryKey: ["ticket-checkin-logs"] });
    void queryClient.invalidateQueries({ queryKey: ["issued-tickets"] });
    void queryClient.invalidateQueries({ queryKey: ["analytics-issued-tickets"] });
    void queryClient.invalidateQueries({ queryKey: ["registrations"] });
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold">Ticket check-in</h1>
          <p className="text-muted-foreground">
            Scan attendee QR codes, record entry once, and review the check-in activity.
          </p>
        </div>
        <TicketScannerDialog
          events={(events || []).map(({ id, name }) => ({ id, name }))}
          onCheckedIn={refreshCheckInData}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Successful scans", value: recentCounts.checkedIn, icon: CheckCircle2, style: "text-green-600" },
          { label: "Duplicate scans", value: recentCounts.duplicates, icon: AlertCircle, style: "text-amber-600" },
          { label: "Rejected scans", value: recentCounts.rejected, icon: XCircle, style: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <stat.icon className={`h-4 w-4 ${stat.style}`} />
            </div>
            <p className="mt-2 text-2xl font-display font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">From the latest 50 scan attempts</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border bg-card">
        <div className="flex items-center gap-2 border-b px-5 py-4">
          <Clock3 className="h-4 w-4 text-primary" />
          <div>
            <h2 className="font-semibold">Recent scan activity</h2>
            <p className="text-xs text-muted-foreground">Successful, duplicate, cancelled, unmatched, and malformed scan attempts are recorded without storing QR contents.</p>
          </div>
        </div>

        {error ? (
          <div className="flex items-center gap-2 p-5 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            Could not load scan reports: {error instanceof Error ? error.message : "Unknown error"}
          </div>
        ) : isLoading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Loading scan activity…</div>
        ) : logs?.length ? (
          <div className="divide-y">
            {logs.map((log) => (
              <div key={log.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {log.issued_tickets?.attendee_name || "Ticket not matched"}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {log.events?.name || "Event"}{log.issued_tickets?.ticket_type_name ? ` · ${log.issued_tickets.ticket_type_name}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <Badge className={`border-0 ${resultStyles[log.result] || resultStyles.not_found}`}>
                    {resultLabels[log.result] || "Unknown"}
                  </Badge>
                  <time className="text-xs text-muted-foreground" dateTime={log.scanned_at}>
                    {format(new Date(log.scanned_at), "MMM d, h:mm a")}
                  </time>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <ScanQrCode className="h-9 w-9 text-muted-foreground/50" />
            <p className="mt-3 font-semibold">No scans recorded yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Start a scan when your event is ready to admit attendees.</p>
          </div>
        )}
      </section>
    </div>
  );
}
