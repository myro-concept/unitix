import { useRef, type ChangeEvent, type JSX } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { ImageIcon, Upload, Trash2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  onUpdate: (fields: Partial<Tables<"events">>) => void;
}

export default function EventQuickInfo({ event, onUpdate }: Props): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startDate = event.event_date ? new Date(event.event_date) : null;
  const endDate = event.event_end_date ? new Date(event.event_end_date) : null;

  const updateEventDate = (field: "event_date" | "event_end_date", part: "date" | "time", value: string) => {
    const current = field === "event_date" ? startDate : endDate;
    const baseDate = current && !Number.isNaN(current.getTime()) ? current : new Date();

    if (part === "date") {
      if (!value) {
        onUpdate({ [field]: null });
        return;
      }

      const time = current && !Number.isNaN(current.getTime())
        ? `${String(current.getHours()).padStart(2, "0")}:${String(current.getMinutes()).padStart(2, "0")}`
        : "00:00";

      onUpdate({ [field]: new Date(`${value}T${time}:00`).toISOString() } as Partial<Tables<"events">>);
      return;
    }

    const currentDate = current && !Number.isNaN(current.getTime())
      ? current.toISOString().split("T")[0]
      : new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate()).toISOString().split("T")[0];

    onUpdate({ [field]: new Date(`${currentDate}T${value || "00:00"}:00`).toISOString() } as Partial<Tables<"events">>);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split(".").pop();
    const path = `event-images/${event.id}.${ext}`;

    const { error } = await supabase.storage
      .from("event-assets")
      .upload(path, file, { upsert: true });

    if (error) {
      toast.error("Failed to upload image");
      return;
    }

    const { data: urlData } = supabase.storage
      .from("event-assets")
      .getPublicUrl(path);

    onUpdate({ background_image_url: urlData.publicUrl });
    toast.success("Image updated!");
  };

  const handleImageDelete = () => {
    onUpdate({ background_image_url: null });
    toast.success("Image removed");
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
                onClick={handleImageDelete}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute bottom-3 right-3 rounded-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-3.5 w-3.5" /> Replace flyer
              </Button>
            </div>
          ) : (
            <label className="flex h-64 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#e5e7eb] bg-[#fafaf9] transition-colors hover:bg-white">
              <ImageIcon className="mb-2 h-6 w-6 text-muted-foreground" />
              <span className="text-sm font-semibold text-[#111111]">Upload event flyer</span>
              <span className="text-xs text-muted-foreground">PNG or JPG, up to 5MB</span>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            </label>
          )}

          {event.background_image_url && (
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
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
              defaultValue={event.name}
              onBlur={(e) => {
                if (e.target.value.trim() && e.target.value !== event.name) {
                  onUpdate({ name: e.target.value.trim() });
                }
              }}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Event type</Label>
              <Select defaultValue={event.event_type || "party"} onValueChange={(value) => onUpdate({ event_type: value })}>
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
                defaultValue={event.location_value || ""}
                onBlur={(e) => onUpdate({ location_value: e.target.value || null })}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input
                type="date"
                defaultValue={startDate ? startDate.toISOString().split("T")[0] : ""}
                onBlur={(e) => updateEventDate("event_date", "date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Start time</Label>
              <Input
                type="time"
                defaultValue={startDate ? `${String(startDate.getHours()).padStart(2, "0")}:${String(startDate.getMinutes()).padStart(2, "0")}` : ""}
                onBlur={(e) => updateEventDate("event_date", "time", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>End date</Label>
              <Input
                type="date"
                defaultValue={endDate ? endDate.toISOString().split("T")[0] : ""}
                onBlur={(e) => updateEventDate("event_end_date", "date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>End time</Label>
              <Input
                type="time"
                defaultValue={endDate ? `${String(endDate.getHours()).padStart(2, "0")}:${String(endDate.getMinutes()).padStart(2, "0")}` : ""}
                onBlur={(e) => updateEventDate("event_end_date", "time", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              rows={4}
              placeholder="Describe the event vibe, activities, performers, dress code, ticket benefits, and entry details."
              defaultValue={event.description || ""}
              onBlur={(e) => onUpdate({ description: e.target.value || null })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
