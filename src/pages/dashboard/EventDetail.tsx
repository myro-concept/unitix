import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useOwnedEventBySlug, useUpdateEvent, useDeleteEvent } from "@/hooks/useEvents";
import { toast } from "sonner";
import EventDetailHeader from "@/components/event-detail/EventDetailHeader";
import EventQuickInfo from "@/components/event-detail/EventQuickInfo";
import EventAttendeesTable from "@/components/event-detail/EventAttendeesTable";

const EventDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { data: event, isLoading } = useOwnedEventBySlug(slug);
  const updateEvent = useUpdateEvent();
  const deleteEvent = useDeleteEvent();

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  if (!event) {
    return <div className="text-center py-20"><p className="text-muted-foreground">Event not found.</p></div>;
  }

  const handleStatusChange = async (status: "draft" | "live" | "past") => {
    await updateEvent.mutateAsync({ id: event.id, status });
    toast.success(`Event is now ${status}`);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    await deleteEvent.mutateAsync(event.id);
    toast.success("Event deleted");
    navigate("/dashboard/events");
  };

  const handleUpdate = (fields: any) => {
    updateEvent.mutate({ id: event.id, ...fields });
  };

  return (
    <div className="space-y-6">
      <EventDetailHeader event={event} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      <EventQuickInfo event={event} onUpdate={handleUpdate} />

      <EventAttendeesTable eventId={event.id} />
    </div>
  );
};

export default EventDetail;
