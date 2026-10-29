import { useEffect, useRef, useState } from "react";
import { Camera, Loader2, ScanQrCode } from "lucide-react";
import type { BrowserMultiFormatReader } from "@zxing/browser";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

type EventOption = { id: string; name: string };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function getTicketToken(value: string) {
  const trimmed = value.trim();
  let token = trimmed;
  try {
    token = new URL(trimmed).pathname.split("/").filter(Boolean).at(-1) || "";
  } catch {
    token = trimmed;
  }
  return uuidPattern.test(token) ? token : null;
}

function getResult(value: Json) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  return typeof value.result === "string" ? value.result : null;
}

export function TicketScannerDialog({
  events,
  onCheckedIn,
}: {
  events: EventOption[];
  onCheckedIn: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [eventId, setEventId] = useState("");
  const [manualValue, setManualValue] = useState("");
  const [cameraStarted, setCameraStarted] = useState(false);
  const [checking, setChecking] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const scanHandledRef = useRef(false);

  const checkIn = async (value: string) => {
    if (!eventId) {
      toast.error("Choose an event before checking in a ticket.");
      return;
    }

    const token = getTicketToken(value);
    if (!token) {
      toast.error("That QR code or ticket ID is not valid.");
      return;
    }

    setChecking(true);
    try {
      const { data, error } = await supabase.rpc("check_in_ticket", {
        p_event_id: eventId,
        p_token: token,
      });
      if (error) throw error;

      const result = getResult(data);
      if (result === "checked_in") {
        toast.success("Ticket checked in.");
        onCheckedIn();
      } else if (result === "already_used") {
        toast.error("This ticket has already been used.");
      } else if (result === "cancelled") {
        toast.error("This ticket has been cancelled.");
      } else {
        toast.error("Ticket not found for this event.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not check in this ticket.");
    } finally {
      setChecking(false);
    }
  };

  const checkInRef = useRef(checkIn);
  useEffect(() => {
    checkInRef.current = checkIn;
  });

  const startCamera = async () => {
    setCameraError("");
    if (!videoRef.current || !navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not available. Enter the ticket URL or ID below.");
      return;
    }

    try {
      scanHandledRef.current = false;
      setCameraStarted(true);
      const { BrowserMultiFormatReader } = await import("@zxing/browser");
      const reader = readerRef.current ?? new BrowserMultiFormatReader();
      readerRef.current = reader;
      controlsRef.current = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        async (result) => {
          if (!result || scanHandledRef.current) return;
          scanHandledRef.current = true;
          controlsRef.current?.stop();
          setCameraStarted(false);
          await checkInRef.current(result.getText());
        },
      );
    } catch (error) {
      setCameraStarted(false);
      setCameraError(error instanceof Error ? error.message : "Could not start the camera.");
    }
  };

  useEffect(() => {
    if (open && cameraStarted) return;
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, [open, cameraStarted]);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="rounded-full" disabled={events.length === 0}>
        <ScanQrCode className="mr-2 h-4 w-4" />
        Check in tickets
      </Button>

      <Dialog
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) setCameraStarted(false);
        }}
      >
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Ticket check-in</DialogTitle>
            <DialogDescription>
              Scan a ticket QR code or enter its ticket link. Used tickets cannot be checked in again.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="check-in-event">Event</Label>
              <Select value={eventId} onValueChange={setEventId}>
                <SelectTrigger id="check-in-event">
                  <SelectValue placeholder="Choose an event" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>{event.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <video
              ref={videoRef}
              className={cameraStarted ? "aspect-video w-full rounded-xl bg-black object-cover" : "hidden"}
              playsInline
              muted
            />
            {!cameraStarted && (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                disabled={!eventId || checking}
                onClick={() => void startCamera()}
              >
                <Camera className="mr-2 h-4 w-4" />
                Start camera
              </Button>
            )}

            {cameraError && <p className="text-sm text-destructive">{cameraError}</p>}

            <form
              className="space-y-2 border-t pt-4"
              onSubmit={(event) => {
                event.preventDefault();
                void checkIn(manualValue);
              }}
            >
              <Label htmlFor="ticket-code">Ticket URL or ID</Label>
              <div className="flex gap-2">
                <Input
                  id="ticket-code"
                  value={manualValue}
                  onChange={(event) => setManualValue(event.target.value)}
                  placeholder="Paste or type ticket ID"
                  autoComplete="off"
                />
                <Button type="submit" disabled={!eventId || checking || !manualValue.trim()}>
                  {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : "Check in"}
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
