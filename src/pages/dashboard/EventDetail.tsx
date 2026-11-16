import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Star } from "lucide-react";
import { useOwnedEventBySlug, useUpdateEvent } from "@/hooks/useEvents";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TablesUpdate } from "@/integrations/supabase/types";
import EventDetailHeader from "@/components/event-detail/EventDetailHeader";
import EventQuickInfo from "@/components/event-detail/EventQuickInfo";
import EventAttendeesTable from "@/components/event-detail/EventAttendeesTable";
import EventEditHistory from "@/components/event-detail/EventEditHistory";
import EventRefundPolicy from "@/components/event-detail/EventRefundPolicy";

const EventDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: event, isLoading } = useOwnedEventBySlug(slug);
  const updateEvent = useUpdateEvent();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!event) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Event not found.</p></div>;
  }

  const handleStatusChange = async (status: "draft" | "live" | "past") => {
    try {
      await updateEvent.mutateAsync({ id: event.id, status });
      toast.success(`Event is now ${status}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update event status.");
    }
  };

  const handleUpdate = async (fields: Partial<TablesUpdate<"events">>) => {
    const updatedEvent = await updateEvent.mutateAsync({ id: event.id, ...fields });
    if (fields.name && updatedEvent.slug !== slug) {
      navigate(`/dashboard/events/${updatedEvent.slug}`, { replace: true });
    }
  };

  const handleScheduleUpdate = async (schedule: {
    event_date: string | null;
    event_end_date: string | null;
  }) => {
    const { data, error } = await supabase.functions.invoke("change-event-schedule", {
      body: { event_id: event.id, ...schedule },
    });
    if (error) throw error;

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["owned-event-slug", event.user_id, slug] }),
      queryClient.invalidateQueries({ queryKey: ["events", event.user_id] }),
      queryClient.invalidateQueries({ queryKey: ["event-slug", slug] }),
      queryClient.invalidateQueries({ queryKey: ["event-edit-history", event.id] }),
    ]);

    if (data?.notification_warning) {
      toast.warning(data.notification_warning);
    } else {
      toast.success(`Schedule updated; ${data?.notified || 0} ticket holders notified.`);
    }
  };

  const featureRequestSubject = `Feature request: ${event.name}`;
  const featureRequestBody = [
    "Hi UniTix team,",
    "",
    "I would like to request that my event be featured on UniTix.",
    `Event: ${event.name}`,
    `Event link: ${window.location.origin}/events/${event.slug}`,
    "",
    "Thank you.",
  ].join("\n");
  const featureRequestHref = `mailto:hello@unitix.ng?subject=${encodeURIComponent(featureRequestSubject)}&body=${encodeURIComponent(featureRequestBody)}`;

  return (
    <div className="space-y-6">
      <EventDetailHeader event={event} onStatusChange={handleStatusChange} />
      <EventQuickInfo event={event} onUpdate={handleUpdate} onScheduleUpdate={handleScheduleUpdate} />

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Star className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-semibold">Get your event featured</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Send us a request and we’ll review your event for a featured spot.
            </p>
          </div>
        </div>
        <a
          href={featureRequestHref}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          Request featuring
        </a>
      </section>

      <EventAttendeesTable eventId={event.id} />
      <EventRefundPolicy eventId={event.id} currentPolicy={event.refund_policy} />
      <EventEditHistory eventId={event.id} />
    </div>
  );
};

export default EventDetail;
