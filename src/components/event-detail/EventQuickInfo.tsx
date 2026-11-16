import { useEffect, useRef, useState, type ChangeEvent, type JSX } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tables, TablesUpdate } from "@/integrations/supabase/types";
import { ImageIcon, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { optimizeEventImage } from "@/lib/optimize-event-image";

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

interface Props {
  event: Tables<"events">;
  onUpdate: (fields: Partial<TablesUpdate<"events">>) => Promise<void>;
  onScheduleUpdate: (schedule: { event_date: string | null; event_end_date: string | null }) => Promise<void>;
}

function dateParts(value: string | null) {
  const date = value ? new Date(value) : null;
  return {
    date: date && !Number.isNaN(date.getTime()) ? date.toISOString().slice(0, 10) : "",
    time: date && !Number.isNaN(date.getTime())
      ? `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`
      : "",
  };
}

function toIsoDate(date: string, time: string): string | null {
  return date ? new Date(`${date}T${time || "00:00"}:00`).toISOString() : null;
}

export default function EventQuickInfo({ event, onUpdate, onScheduleUpdate }: Props): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [scheduleDraft, setScheduleDraft] = useState(() => ({
    start: dateParts(event.event_date),
    end: dateParts(event.event_end_date),
  }));
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState(() => ({
    name: event.name,
    event_type: event.event_type || "party",
    location_value: event.location_value || "",
    description: event.description || "",
  }));
  const [savingDetails, setSavingDetails] = useState(false);

  useEffect(() => {
    setScheduleDraft({
      start: dateParts(event.event_date),
      end: dateParts(event.event_end_date),
    });
  }, [event.event_date, event.event_end_date]);

  useEffect(() => {
    setDetailsDraft({
      name: event.name,
      event_type: event.event_type || "party",
      location_value: event.location_value || "",
      description: event.description || "",
    });
  }, [event.name, event.event_type, event.location_value, event.description]);

  const nextStartDate = toIsoDate(scheduleDraft.start.date, scheduleDraft.start.time);
  const nextEndDate = toIsoDate(scheduleDraft.end.date, scheduleDraft.end.time);
  const dateChanged = (next: string | null, current: string | null) => {
    if (!next || !current) return next !== current;
    return new Date(next).getTime() !== new Date(current).getTime();
  };
  const scheduleChanged =
    dateChanged(nextStartDate, event.event_date) ||
    dateChanged(nextEndDate, event.event_end_date);
  const detailsChanged =
    detailsDraft.name.trim() !== event.name ||
    detailsDraft.event_type !== (event.event_type || "party") ||
    (detailsDraft.location_value.trim() || null) !== (event.location_value || null) ||
    (detailsDraft.description.trim() || null) !== (event.description || null);

  const saveFields = (fields: Partial<TablesUpdate<"events">>) => {
    void onUpdate(fields).catch((error) => {
      toast.error(error instanceof Error ? error.message : "Could not update the event.");
    });
  };

  const saveDetails = async () => {
    const name = detailsDraft.name.trim();
    if (!name) {
      toast.error("Event name is required.");
      return;
    }

    const fields: Partial<TablesUpdate<"events">> = {};
    if (name !== event.name) fields.name = name;
    if (detailsDraft.event_type !== (event.event_type || "party")) {
      fields.event_type = detailsDraft.event_type;
    }
    const location = detailsDraft.location_value.trim() || null;
    if (location !== event.location_value) fields.location_value = location;
    const description = detailsDraft.description.trim() || null;
    if (description !== event.description) fields.description = description;

    if (Object.keys(fields).length === 0) return;

    setSavingDetails(true);
    try {
      await onUpdate(fields);
      toast.success("Event details saved.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the event.");
    } finally {
      setSavingDetails(false);
    }
  };

  const saveSchedule = async () => {
    if (!scheduleChanged) return;
    if (!scheduleDraft.start.date) {
      toast.error("Event start date is required.");
      return;
    }
    if (!window.confirm("Changing the schedule will notify all ticket holders by email. Continue?")) return;

    setSavingSchedule(true);
    try {
      await onScheduleUpdate({ event_date: nextStartDate, event_end_date: nextEndDate });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update the event schedule.");
    } finally {
      setSavingSchedule(false);
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.currentTarget.value = "";

    setUploadingImage(true);

    try {
      const optimizedFile = await optimizeEventImage(file);
      const extension = optimizedFile.name.split(".").pop();
      const path = `event-images/${event.id}.${extension}`;
      const { error } = await supabase.storage
        .from("event-assets")
        .upload(path, optimizedFile, {
          upsert: true,
          cacheControl: "31536000",
          contentType: optimizedFile.type,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from("event-assets").getPublicUrl(path);
      await onUpdate({ background_image_url: `${urlData.publicUrl}?updated=${Date.now()}` });
      toast.success("Image updated!");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageDelete = async () => {
    try {
      await onUpdate({ background_image_url: null });
      toast.success("Image removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the image.");
    }
  };

  return (
    <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
      <Card className="border-[#e5e7eb] bg-white/90 shadow-sm backdrop-blur lg:sticky lg:top-20">
        <CardContent className="space-y-5 p-6">
          <div>
            <h2 className="text-lg font-black tracking-[-0.03em] text-[#111111]">Flyer</h2>
            <p className="text-sm text-muted-foreground">Use your event flyer as the main visual.</p>
          </div>

          {event.background_image_url ? (
            <div className="relative">
              <img
                src={event.background_image_url}
                alt="Event flyer"
                className="max-h-[720px] w-full rounded-2xl border border-[#e5e7eb] object-contain bg-[#fafaf9]"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -right-2 -top-2 h-7 w-7 rounded-full"
                onClick={() => void handleImageDelete()}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute bottom-3 right-3 rounded-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
              >
                <Upload className="mr-2 h-3.5 w-3.5" /> {uploadingImage ? "Optimizing..." : "Replace flyer"}
              </Button>
            </div>
          ) : (
            <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e5e7eb] bg-[#fafaf9] transition-colors hover:bg-white">
              <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-semibold text-[#111111]">Upload event flyer</span>
              <span className="text-xs text-muted-foreground">JPG, JPEG, or PNG</span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
          )}

          {event.background_image_url && (
            <input
              ref={fileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,image/jpeg,image/png"
              className="hidden"
              onChange={handleImageUpload}
              disabled={uploadingImage}
            />
          )}

        </CardContent>
      </Card>

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
              value={detailsDraft.name}
              onChange={(e) => setDetailsDraft((draft) => ({ ...draft, name: e.target.value }))}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Event type</Label>
              <Select
                value={detailsDraft.event_type}
                onValueChange={(value) => setDetailsDraft((draft) => ({ ...draft, event_type: value }))}
              >
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
                value={detailsDraft.location_value}
                onChange={(e) => setDetailsDraft((draft) => ({ ...draft, location_value: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input
                type="date"
                value={scheduleDraft.start.date}
                onChange={(e) => setScheduleDraft((current) => ({
                  ...current,
                  start: { ...current.start, date: e.target.value },
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Start time</Label>
              <Input
                type="time"
                value={scheduleDraft.start.time}
                onChange={(e) => setScheduleDraft((current) => ({
                  ...current,
                  start: { ...current.start, time: e.target.value },
                }))}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>End date</Label>
              <Input
                type="date"
                value={scheduleDraft.end.date}
                onChange={(e) => setScheduleDraft((current) => ({
                  ...current,
                  end: { ...current.end, date: e.target.value },
                }))}
              />
            </div>

            <div className="space-y-2">
              <Label>End time</Label>
              <Input
                type="time"
                value={scheduleDraft.end.time}
                onChange={(e) => setScheduleDraft((current) => ({
                  ...current,
                  end: { ...current.end, time: e.target.value },
                }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Ticket holders will be notified of schedule changes.</p>
            <Button type="button" size="sm" onClick={saveSchedule} disabled={!scheduleChanged || savingSchedule}>
              {savingSchedule ? "Saving..." : "Save schedule"}
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={4}
              placeholder="Describe the event vibe, activities, performers, dress code, ticket benefits, and entry details."
              value={detailsDraft.description}
              onChange={(e) => setDetailsDraft((draft) => ({ ...draft, description: e.target.value }))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" onClick={saveDetails} disabled={!detailsChanged || savingDetails}>
              {savingDetails ? "Saving..." : "Save details"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
