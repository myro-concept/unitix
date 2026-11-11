import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Star } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { supabase } from "@/integrations/supabase/client";

type LiveEvent = {
  id: string;
  name: string;
  event_date: string | null;
  location_value: string | null;
  background_image_url: string | null;
};

const slotNumbers = [1, 2, 3, 4, 5];

export default function FeaturedEvents() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const adminQuery = useIsAdmin();
  const canManage = adminQuery.data === true;

  const slotsQuery = useQuery({
    queryKey: ["featured-events", "slots"],
    enabled: canManage,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("featured_events")
        .select("slot, event_id")
        .order("slot");
      if (error) throw error;
      return data;
    },
  });

  const eventsQuery = useQuery({
    queryKey: ["featured-events", "live-events"],
    enabled: canManage,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("id, name, event_date, location_value, background_image_url")
        .eq("status", "live")
        .order("event_date", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data;
    },
  });

  const saveSlot = useMutation({
    mutationFn: async ({ slot, eventId }: { slot: number; eventId: string | null }) => {
      if (eventId === null) {
        const { error } = await supabase.from("featured_events").delete().eq("slot", slot);
        if (error) throw error;
        return;
      }

      const { error } = await supabase
        .from("featured_events")
        .upsert({ slot, event_id: eventId }, { onConflict: "slot" });
      if (error) throw error;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["featured-events"] });
      toast.success("Featured events updated");
    },
    onError: (error) => {
      console.error("Failed to update featured events:", error);
      toast.error("Could not update featured events. Please try again.");
    },
  });

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
        <p className="mt-2 text-sm text-muted-foreground">Only admins can manage featured events.</p>
        <Button className="mt-5" variant="outline" onClick={() => navigate("/dashboard/events")}>
          Back to events
        </Button>
      </div>
    );
  }

  if (slotsQuery.isError || eventsQuery.isError) {
    return (
      <div className="rounded-2xl border border-destructive/30 bg-white p-6">
        <h1 className="text-xl font-bold">Featured events</h1>
        <p className="mt-2 text-sm text-destructive">Could not load featured event settings. Please refresh and try again.</p>
        <Button className="mt-4" variant="outline" onClick={() => {
          void slotsQuery.refetch();
          void eventsQuery.refetch();
        }}>
          Retry
        </Button>
      </div>
    );
  }

  const slots = slotsQuery.data ?? [];
  const liveEvents = eventsQuery.data ?? [];
  const eventById = new Map(liveEvents.map((event) => [event.id, event]));
  const selectedBySlot = new Map(slots.map((item) => [item.slot, item.event_id]));
  const assignedEventIds = new Set(slots.map((item) => item.event_id));
  const isLoading = slotsQuery.isPending || eventsQuery.isPending;

  return (
    <div className="mx-auto max-w-6xl space-y-7">
      <header>
        <div className="flex items-center gap-2">
          <Star className="h-6 w-6 text-amber-500" />
          <h1 className="text-3xl font-bold">Featured events</h1>
        </div>
        <p className="mt-2 text-muted-foreground">
          Choose up to five live events to highlight on the landing page. Changes appear immediately.
        </p>
      </header>

      {liveEvents.length === 0 && !isLoading && (
        <div className="rounded-xl border bg-white p-5 text-sm text-muted-foreground">
          There are no live events available to feature.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {slotNumbers.map((slot) => {
          const eventId = selectedBySlot.get(slot) ?? "";
          const currentEvent = eventById.get(eventId);
          const availableEvents = liveEvents.filter(
            (event) => event.id === eventId || !assignedEventIds.has(event.id),
          );
          const hasStaleAssignment = Boolean(eventId && !currentEvent);

          return (
            <section key={slot} className="overflow-hidden rounded-2xl border bg-white">
              <div className="aspect-[16/9] bg-muted">
                {currentEvent?.background_image_url ? (
                  <img
                    src={currentEvent.background_image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {hasStaleAssignment ? "Previously featured event is no longer live" : "Featured slot"}
                  </div>
                )}
              </div>
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Slot {slot}</p>
                  <h2 className="mt-1 line-clamp-1 font-semibold">
                    {currentEvent?.name ?? (hasStaleAssignment ? "Event no longer live" : "Choose an event")}
                  </h2>
                  {currentEvent?.event_date && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {new Date(currentEvent.event_date).toLocaleDateString("en-NG", {
                        dateStyle: "medium",
                      })}
                      {currentEvent.location_value ? ` · ${currentEvent.location_value}` : ""}
                    </p>
                  )}
                </div>
                <Select
                  value={eventId || "unassigned"}
                  disabled={isLoading || saveSlot.isPending}
                  onValueChange={(value) => {
                    saveSlot.mutate({ slot, eventId: value === "unassigned" ? null : value });
                  }}
                >
                  <SelectTrigger aria-label={`Choose event for featured slot ${slot}`}>
                    <SelectValue placeholder="Choose a live event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No event selected</SelectItem>
                    {hasStaleAssignment && (
                      <SelectItem value={eventId} disabled>Current event is no longer live</SelectItem>
                    )}
                    {availableEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
