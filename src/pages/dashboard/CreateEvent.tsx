import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  PartyPopper,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import logoGlyph from "@/assets/logo-glyph-160.png";

import { supabase } from "@/integrations/supabase/client";
import { useCreateEvent, useUpdateEvent, useOwnedEventBySlug } from "@/hooks/useEvents";
import { useBulkInsertFormFields, useFormFields } from "@/hooks/useFormFields";

type TicketType = {
  name: string;
  price: string;
  quantity: string;
};

const defaultFields = [
  { label: "Full Name", field_type: "text", required: true, position: 0 },
  { label: "Email Address", field_type: "email", required: true, position: 1 },
  { label: "Phone Number", field_type: "tel", required: true, position: 2 },
  { label: "School / Campus", field_type: "text", required: false, position: 3 },
];

const eventTypes = [
  { value: "party", label: "Party / Hangout" },
  { value: "concert", label: "Concert / Show" },
  { value: "conference", label: "Conference / Summit" },
  { value: "workshop", label: "Workshop / Training" },
  { value: "sport", label: "Sports Event" },
  { value: "religious", label: "Religious Event" },
  { value: "departmental", label: "Departmental Event" },
  { value: "other", label: "Other Campus Event" },
];

function formatDateTimeForLagos(input?: string | null) {
  if (!input) return { date: "", time: "" };

  const d = new Date(input);
  if (Number.isNaN(d.getTime())) return { date: "", time: "" };

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Lagos",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value || "";

  return {
    date: `${get("year")}-${get("month")}-${get("day")}`,
    time: `${get("hour")}:${get("minute")}`,
  };
}

function buildLagosTimestamp(date: string, time: string) {
  if (!date) return undefined;
  const hhmm = time ? `${time}:00` : "00:00:00";
  return `${date}T${hhmm}+01:00`;
}

export default function CreateEvent() {
  const { slug: editSlug } = useParams<{ slug?: string }>();
  const isEditMode = !!editSlug;

  const navigate = useNavigate();
  const createEvent = useCreateEvent();
  const updateEvent = useUpdateEvent();
  const bulkInsertFields = useBulkInsertFormFields();

  const { data: existingEvent, isLoading: eventLoading } = useOwnedEventBySlug(isEditMode ? editSlug : undefined);
  const { data: existingFields, isLoading: fieldsLoading } = useFormFields(existingEvent?.id);

  const [name, setName] = useState("");
  const [eventType, setEventType] = useState("party");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [locationAddress, setLocationAddress] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    { name: "Regular", price: "", quantity: "" },
  ]);
  const [capacity, setCapacity] = useState("");
  const [flyerUrl, setFlyerUrl] = useState<string | null>(null);
  const [fields, setFields] = useState(defaultFields);
  const [uploading, setUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdSlug, setCreatedSlug] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (isEditMode && existingEvent && !initialized) {
      setName(existingEvent.name || "");
      setDescription(existingEvent.description || "");
      setEventType(existingEvent.event_type || "party");
      setCapacity(existingEvent.capacity ? String(existingEvent.capacity) : "");
      setFlyerUrl(existingEvent.background_image_url || null);

      if (existingEvent.ticket_price && Number(existingEvent.ticket_price) > 0) {
        setIsPaid(true);
        setTicketTypes([
          {
            name: "Regular",
            price: String(existingEvent.ticket_price),
            quantity: existingEvent.capacity ? String(existingEvent.capacity) : "",
          },
        ]);
      }

      if (existingEvent.event_date) {
        const start = formatDateTimeForLagos(existingEvent.event_date);
        setStartDate(start.date);
        setStartTime(start.time);
      }

      if (existingEvent.event_end_date) {
        const end = formatDateTimeForLagos(existingEvent.event_end_date);
        setEndDate(end.date);
        setEndTime(end.time);
      }

      setLocationAddress(existingEvent.location_value || "");
      setInitialized(true);
    }
  }, [isEditMode, existingEvent, initialized]);

  useEffect(() => {
    if (isEditMode && existingFields && existingFields.length > 0 && initialized) {
      setFields(
        existingFields.map((f) => ({
          label: f.label,
          field_type: f.field_type,
          required: f.required,
          position: f.position,
        }))
      );
    }
  }, [isEditMode, existingFields, initialized]);

  const handleFlyerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const ext = file.name.split(".").pop();
      const path = `flyers/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage.from("event-assets").upload(path, file);
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("event-assets").getPublicUrl(path);
      setFlyerUrl(urlData.publicUrl);
      toast.success("Flyer uploaded");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const buildEventDate = (date: string, time: string) => buildLagosTimestamp(date, time);

  const updateTicketType = (index: number, key: keyof TicketType, value: string) => {
    setTicketTypes((current) =>
      current.map((ticket, i) => (i === index ? { ...ticket, [key]: value } : ticket))
    );
  };

  const addTicketType = () => {
    setTicketTypes((current) => [...current, { name: "", price: "", quantity: "" }]);
  };

  const removeTicketType = (index: number) => {
    setTicketTypes((current) => current.filter((_, i) => i !== index));
  };

  const firstPaidTicket = ticketTypes.find((ticket) => ticket.price && Number(ticket.price) > 0);
  const totalTicketQuantity = ticketTypes.reduce((sum, ticket) => {
    const qty = Number(ticket.quantity);
    return sum + (Number.isFinite(qty) ? qty : 0);
  }, 0);
  const saveTicketTypes = async (eventId: string) => {
    const ticketTypesQuery = supabase.from("ticket_types" as any);

    await ticketTypesQuery.delete().eq("event_id", eventId);

    const ticketsToSave = isPaid
      ? ticketTypes
          .filter((ticket) => ticket.name.trim() && ticket.price)
          .map((ticket) => ({
            event_id: eventId,
            name: ticket.name.trim(),
            price: Number(ticket.price),
            quantity: ticket.quantity ? Number(ticket.quantity) : null,
          }))
      : [
          {
            event_id: eventId,
            name: "Free Ticket",
            price: 0,
            quantity: capacity ? Number(capacity) : null,
          },
        ];

    if (ticketsToSave.length > 0) {
      const { error } = await ticketTypesQuery.insert(ticketsToSave);

      if (error) throw error;
    }
  };

  const handlePublish = async () => {
    if (!name.trim()) {
      toast.error("Event name is required");
      return;
    }

    if (!startDate) {
      toast.error("Event date is required");
      return;
    }

    if (!locationAddress.trim()) {
      toast.error("Venue or campus location is required");
      return;
    }

    if (isPaid) {
      const hasValidTicket = ticketTypes.some(
        (ticket) => ticket.name.trim() && ticket.price && Number(ticket.price) > 0
      );

      if (!hasValidTicket) {
        toast.error("Add at least one paid ticket type");
        return;
      }
    }

    try {
      const eventData = {
        name,
        description: description || undefined,
        event_date: buildEventDate(startDate, startTime),
        event_end_date: buildEventDate(endDate, endTime),
        timezone: "Africa/Lagos",
        event_type: eventType,
        template: "landing",
        location_type: "physical",
        location_value: locationAddress,
        ticket_price: isPaid && firstPaidTicket ? parseFloat(firstPaidTicket.price) : undefined,
        capacity: capacity ? parseInt(capacity) : totalTicketQuantity || undefined,
        background_image_url: flyerUrl || undefined,
        color_mode: "light",
        requires_approval: false,
        status: "live",
      } as any;

      if (isEditMode && existingEvent?.id) {
        await updateEvent.mutateAsync({ id: existingEvent.id, ...eventData } as any);

        try {
          await supabase.from("form_fields").delete().eq("event_id", existingEvent.id);
          await bulkInsertFields.mutateAsync(fields.map((f) => ({ ...f, event_id: existingEvent.id })));
        } catch (fieldErr: any) {
          console.warn("Form fields could not be saved:", fieldErr);
          toast.error("Event saved, but registration fields could not be updated. Please sync latest database migrations.");
        }

        try {
          await saveTicketTypes(existingEvent.id);
        } catch (ticketErr: any) {
          console.warn("Ticket types could not be saved:", ticketErr);
          toast.error("Event saved, but ticket types could not be updated. Please sync latest database migrations.");
        }

        toast.success("Event updated");
        navigate(`/dashboard/events/${existingEvent.slug}`);
        return;
      }

      const event = await createEvent.mutateAsync(eventData);
      try {
        await bulkInsertFields.mutateAsync(fields.map((f) => ({ ...f, event_id: event.id })));
      } catch (fieldErr: any) {
        console.warn("Form fields could not be saved:", fieldErr);
        toast.error("Event published, but registration fields could not be created. Please sync latest database migrations.");
      }

      try {
        await saveTicketTypes(event.id);
      } catch (ticketErr: any) {
        console.warn("Ticket types could not be saved:", ticketErr);
        toast.error("Event published, but ticket types could not be created. Please sync latest database migrations.");
      }

      setCreatedSlug(event.slug);
      setShowSuccess(true);
    } catch (err: any) {
      toast.error(err.message || `Failed to ${isEditMode ? "update" : "create"} event`);
    }
  };

  const isPublishing = createEvent.isPending || updateEvent.isPending || bulkInsertFields.isPending;

  if (isEditMode && (eventLoading || fieldsLoading)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-[#FF0048]" />
      </div>
    );
  }

  if (showSuccess) {
  const eventUrl = `${window.location.origin}/${createdSlug}`;

  const copyEventUrl = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(eventUrl);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = eventUrl;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto max-w-xl space-y-6 text-center"
      >
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#FF0048]">
          <PartyPopper className="h-10 w-10 text-white" />
        </div>

        <div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-[#111111]">
            Your UniTix event is live.
          </h1>
          <p className="mt-2 text-muted-foreground">
            <span className="font-semibold text-foreground">{name}</span> is ready to receive ticket orders.
          </p>
        </div>

        <Card className="border-[#e5e7eb] bg-white text-left shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Event Link
              </Label>

              <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input
                  value={eventUrl}
                  readOnly
                  className="min-w-0 w-full bg-muted/40 text-sm"
                />

                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyEventUrl}
                  className="h-12 w-full shrink-0 rounded-xl sm:w-12"
                  type="button"
                >
                  <Copy className="h-4 w-4 text-[#FF0048]" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button
            className="bg-[#FF0048] text-white hover:bg-[#E00040]"
            onClick={() => navigate(`/dashboard/events/${createdSlug}`)}
          >
            <Eye className="mr-2 h-4 w-4" /> View Dashboard
          </Button>

          <Button variant="outline" asChild>
            <a href={eventUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" /> Preview Event
            </a>
          </Button>
        </div>

        <Button
          variant="ghost"
          className="text-muted-foreground hover:text-[#FF0048]"
          onClick={() => navigate("/dashboard/events")}
        >
          Back to events
        </Button>
      </motion.div>
    </div>
  );
}

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#fafaf9]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 10%, rgba(255,0,72,0.10), transparent 28%), radial-gradient(circle at 85% 18%, rgba(17,17,17,0.08), transparent 24%), linear-gradient(135deg, rgba(255,0,72,0.05) 0 12%, transparent 12% 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(17,17,17,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(17,17,17,0.06) 1px, transparent 1px)",
          backgroundSize: "38px 38px",
        }}
      />

      <div className="relative mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/dashboard/events" className="inline-flex items-center gap-2 no-underline">
            <img src={logoGlyph} alt="UniTix" className="h-9 w-9 rounded-[10px] object-contain" />
            <span className="font-display text-[22px] font-black tracking-[-0.04em] text-[#111111]">
              UniTix
            </span>
          </Link>

          <span className="hidden rounded-full border border-[#fecdd3] bg-white/80 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#FF0048] backdrop-blur sm:inline-flex">
            Create Event
          </span>
        </div>

        <Button
          variant="ghost"
          className="text-[#111111] hover:bg-white hover:text-[#FF0048]"
          onClick={() => navigate(isEditMode && existingEvent ? `/dashboard/events/${existingEvent.slug}` : "/dashboard/events")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {isEditMode ? "Back to Event" : "Back to Events"}
        </Button>

        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[30px] border border-[#e5e7eb] bg-white/85 p-6 shadow-sm backdrop-blur sm:p-8"
        >
          <div className="absolute right-6 top-6 hidden h-16 w-16 rounded-2xl bg-[#fff1f2] sm:block" />
          <p className="mb-3 text-[11px] font-black uppercase tracking-[0.22em] text-[#FF0048]">
            {isEditMode ? "Edit Event" : "Create Campus Event"}
          </p>

          <h1 className="max-w-2xl text-4xl font-black leading-[1.03] tracking-[-0.055em] text-[#111111] sm:text-6xl">
            Publish your school event in minutes.
          </h1>

          <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground">
            Add the important details, upload your flyer, set ticket types, and make your event easy for students to find.
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]"
        >
          <div className="space-y-5">
            <Card className="border-[#e5e7eb] bg-white/90 shadow-sm backdrop-blur">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="text-lg font-black tracking-[-0.03em] text-[#111111]">Event details</h2>
                  <p className="text-sm text-muted-foreground">The basic information students will see first.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="event-name">Event name</Label>
                  <Input
                    id="event-name"
                    placeholder="e.g., Freshers Glow Party"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Event type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Venue / campus location</Label>
                    <Input
                      placeholder="e.g., Main Auditorium, Babcock University"
                      value={locationAddress}
                      onChange={(e) => setLocationAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Start date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>Start time</Label>
                    <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>End date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                  </div>

                  <div className="space-y-2">
                    <Label>End time</Label>
                    <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    rows={4}
                    placeholder="Describe the event vibe, activities, performers, dress code, ticket benefits, and entry details."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-[#e5e7eb] bg-white/90 shadow-sm backdrop-blur">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="text-lg font-black tracking-[-0.03em] text-[#111111]">Tickets</h2>
                  <p className="text-sm text-muted-foreground">
                    Create one price or multiple ticket types like Regular, VIP, or Table.
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-[#e5e7eb] bg-[#fafaf9] p-4">
                  <div>
                    <Label>Paid event</Label>
                    <p className="text-xs text-muted-foreground">Turn this on if students need to pay for tickets.</p>
                  </div>
                  <Switch checked={isPaid} onCheckedChange={setIsPaid} />
                </div>

                {isPaid && (
                  <div className="space-y-3">
                    {ticketTypes.map((ticket, index) => (
                      <div key={index} className="rounded-2xl border border-[#e5e7eb] bg-white p-4">
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-sm font-black text-[#111111]">Ticket {index + 1}</p>
                          {ticketTypes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTicketType(index)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-[#fff1f2] hover:text-[#FF0048]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid gap-3 sm:grid-cols-[1fr_0.8fr_0.8fr]">
                          <div className="space-y-2">
                            <Label>Ticket name</Label>
                            <Input
                              placeholder="Regular"
                              value={ticket.name}
                              onChange={(e) => updateTicketType(index, "name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Price (₦)</Label>
                            <Input
                              type="number"
                              min="0"
                              step="100"
                              placeholder="3000"
                              value={ticket.price}
                              onChange={(e) => updateTicketType(index, "price", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="100"
                              value={ticket.quantity}
                              onChange={(e) => updateTicketType(index, "quantity", e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}

                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed border-[#FF0048]/35 text-[#FF0048] hover:bg-[#fff1f2]"
                      onClick={addTicketType}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add another ticket type
                    </Button>

                    <p className="text-xs font-semibold text-[#FF0048]">
                      UniTix charges organizers a 4% organizer fee on paid ticket sales.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsPaid(false)}
                  className={`w-full rounded-2xl border p-4 text-left transition-all ${
                    !isPaid
                      ? "border-[#FF0048] bg-[#fff1f2] shadow-sm"
                      : "border-[#e5e7eb] bg-[#fafaf9] hover:border-[#fecdd3] hover:bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[#111111]">Free event</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Students can get tickets without payment.
                      </p>
                    </div>
                    <span className={`mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-black ${
                      !isPaid
                        ? "border-[#FF0048] bg-[#FF0048] text-white"
                        : "border-[#d1d5db] bg-white text-transparent"
                    }`}>
                      ✓
                    </span>
                  </div>
                </button>

                <div className="space-y-2">
                  <Label>Overall guest capacity</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="Leave empty if unlimited"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="border-[#e5e7eb] bg-white/90 shadow-sm backdrop-blur lg:sticky lg:top-20">
              <CardContent className="space-y-5 p-6">
                <div>
                  <h2 className="text-lg font-black tracking-[-0.03em] text-[#111111]">Flyer</h2>
                  <p className="text-sm text-muted-foreground">Use your event flyer as the main visual.</p>
                </div>

                {flyerUrl ? (
                  <div className="relative">
                    <img
                      src={flyerUrl}
                      alt="Event flyer"
                      className="h-64 w-full rounded-2xl border border-[#e5e7eb] object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute -right-2 -top-2 h-7 w-7 rounded-full"
                      onClick={() => setFlyerUrl(null)}
                    >
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e5e7eb] bg-[#fafaf9] transition-colors hover:bg-white">
                    {uploading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="mb-2 h-6 w-6 text-muted-foreground" />
                        <span className="text-sm font-semibold text-[#111111]">Upload event flyer</span>
                        <span className="text-xs text-muted-foreground">PNG or JPG, up to 5MB</span>
                      </>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleFlyerUpload} disabled={uploading} />
                  </label>
                )}

                <div className="rounded-2xl border border-[#fecdd3] bg-[#fff1f2] p-4">
                  <h3 className="text-sm font-black text-[#111111]">Quick summary</h3>
                  <div className="mt-3 space-y-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Event</p>
                      <p className="font-semibold">{name || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ticket</p>
                      <p className="font-semibold">
                        {isPaid
                          ? ticketTypes.length > 1
                            ? `${ticketTypes.length} ticket types`
                            : `₦${ticketTypes[0]?.price || "0"}`
                          : "Free"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="font-semibold">{startDate || "Not set"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Venue</p>
                      <p className="font-semibold">{locationAddress || "Not set"}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs leading-6 text-muted-foreground">
                  UniTix will automatically collect attendee name, email, phone number, and school.
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        <div className="flex flex-col-reverse gap-3 pb-8 sm:flex-row sm:items-center sm:justify-between">
          <Button variant="outline" onClick={() => navigate("/dashboard/events")}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel
          </Button>

          <Button
            className="bg-[#FF0048] px-6 text-white hover:bg-[#E00040]"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {isEditMode ? "Saving..." : "Publishing..."}
              </>
            ) : (
              <>
                {isEditMode ? "Save Changes" : "Publish Event"} <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
