import { Users, TrendingUp, CalendarDays, Loader2, ScanQrCode } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useRegistrationStats } from "@/hooks/useRegistrations";
import { useMemo } from "react";
import { format, parseISO, startOfWeek } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

const Analytics = () => {
  const { data: stats, isLoading } = useRegistrationStats();
  const {
    data: issuedTickets,
    isLoading: isLoadingTickets,
    error: issuedTicketsError,
  } = useQuery({
    queryKey: ["analytics-issued-tickets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("issued_tickets")
        .select("event_id, status");
      if (error) throw error;
      return data;
    },
  });

  const perEventData = useMemo(() => {
    if (!stats?.events || !stats?.registrations) return [];
    const countMap: Record<string, { name: string; registrations: number }> = {};
    stats.events.forEach(e => { countMap[e.id] = { name: e.name, registrations: 0 }; });
    stats.registrations.forEach(r => {
      if (countMap[r.event_id]) countMap[r.event_id].registrations++;
    });
    return Object.values(countMap)
      .filter(d => d.registrations > 0)
      .sort((a, b) => b.registrations - a.registrations);
  }, [stats]);

  const overTimeData = useMemo(() => {
    if (!stats?.registrations?.length) return [];
    const weekMap: Record<string, number> = {};
    stats.registrations.forEach(r => {
      const week = format(startOfWeek(parseISO(r.created_at)), "MMM d");
      weekMap[week] = (weekMap[week] || 0) + 1;
    });
    return Object.entries(weekMap).map(([week, count]) => ({ week, registrations: count }));
  }, [stats]);

  const checkInData = useMemo(() => {
    if (!stats?.events || !issuedTickets) return [];
    const countMap: Record<string, { name: string; checkedIn: number; notCheckedIn: number }> = {};
    stats.events.forEach((event) => {
      countMap[event.id] = { name: event.name, checkedIn: 0, notCheckedIn: 0 };
    });
    issuedTickets.forEach((ticket) => {
      const event = countMap[ticket.event_id];
      if (!event) return;
      if (ticket.status === "used") event.checkedIn++;
      else if (ticket.status === "valid") event.notCheckedIn++;
    });
    return Object.values(countMap)
      .filter((event) => event.checkedIn + event.notCheckedIn > 0)
      .sort((a, b) => b.checkedIn - a.checkedIn);
  }, [stats, issuedTickets]);

  if (isLoading || isLoadingTickets) {
    return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const checkedInCount = issuedTickets?.filter((ticket) => ticket.status === "used").length ?? 0;
  const activeIssuedTickets = issuedTickets?.filter((ticket) => ticket.status !== "cancelled").length ?? 0;
  const checkInRate = activeIssuedTickets
    ? Math.round((checkedInCount / activeIssuedTickets) * 100)
    : 0;
  const statCards = [
    { label: "Total registrations", value: stats?.total ?? 0, icon: Users },
    { label: "Active events", value: stats?.activeEvents ?? 0, icon: CalendarDays },
    { label: "Avg per event", value: stats?.events?.length ? Math.round((stats?.total ?? 0) / stats.events.length) : 0, icon: TrendingUp },
    { label: "Tickets checked in", value: `${checkedInCount} · ${checkInRate}%`, icon: ScanQrCode },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold">Analytics</h1>
        <p className="text-muted-foreground">Track registrations, attendance, and ticket check-ins.</p>
      </div>

      {issuedTicketsError && (
        <p role="alert" className="text-sm text-destructive">
          Could not load check-in analytics: {issuedTicketsError.message}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-card rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
                <stat.icon className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <p className="text-2xl font-display font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-card rounded-xl p-5 sm:p-6">
          <h3 className="font-display font-semibold mb-4">Registrations by event</h3>
          {perEventData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={perEventData} layout="vertical" margin={{ left: 8, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                  <XAxis type="number" className="text-xs" allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={92}
                    className="text-xs"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(value: string) => (value.length > 16 ? `${value.slice(0, 16)}...` : value)}
                  />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar dataKey="registrations" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12 text-sm">No registration data yet.</p>
          )}
        </div>

        <div className="bg-card rounded-xl p-5 sm:p-6">
          <h3 className="font-display font-semibold mb-4">Registrations over time</h3>
          {overTimeData.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={overTimeData} margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="week" className="text-xs" tick={{ fontSize: 11 }} />
                  <YAxis className="text-xs" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Line type="monotone" dataKey="registrations" stroke="hsl(var(--success))" strokeWidth={2.5} dot={{ fill: "hsl(var(--success))", r: 4, strokeWidth: 0 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-12 text-sm">No registration data yet.</p>
          )}
        </div>
      </div>

      <div className="bg-card rounded-xl p-5 sm:p-6">
        <h3 className="font-display font-semibold mb-1">Ticket check-ins by event</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Successful entries compared with valid tickets that have not checked in.
        </p>
        {checkInData.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={checkInData} margin={{ left: 8, right: 16, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis
                  dataKey="name"
                  className="text-xs"
                  tick={{ fontSize: 11 }}
                  tickFormatter={(value: string) => value.length > 16 ? `${value.slice(0, 16)}...` : value}
                />
                <YAxis className="text-xs" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 13 }}
                />
                <Legend />
                <Bar dataKey="checkedIn" name="Checked in" stackId="tickets" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="notCheckedIn" name="Not checked in" stackId="tickets" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">No issued ticket check-ins yet.</p>
        )}
      </div>
    </div>
  );
};

export default Analytics;
