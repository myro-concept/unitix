import { useEffect, useRef, useState } from "react";
import { Camera, CheckCircle2, Loader2, ScanQrCode, XCircle } from "lucide-react";
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
const ticketCodePattern = /^UT-[0-9A-F]{18}$/i;

function getTicketInput(value: string): { token: string } | { ticketCode: string } | null {
  const trimmed = value.trim();
  let token = trimmed;
  try {
    const url = new URL(trimmed);
    token = url.searchParams.get("token")
      || url.pathname.split("/").filter(Boolean).at(-1)
      || "";
  } catch {
    token = trimmed;
  }

  if (uuidPattern.test(token)) return { token };
  if (ticketCodePattern.test(token)) return { ticketCode: token.toUpperCase() };
  return null;
}

type CheckInResult = {
  result: string;
  attendee_name?: string;
  ticket_type_name?: string;
  checked_in_at?: string | null;
};

function getResult(value: Json): CheckInResult | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) return null;
  if (typeof value.result !== "string") return null;
  return {
    result: value.result,
    attendee_name: typeof value.attendee_name === "string" ? value.attendee_name : undefined,
    ticket_type_name: typeof value.ticket_type_name === "string" ? value.ticket_type_name : undefined,
    checked_in_at: typeof value.checked_in_at === "string" ? value.checked_in_at : null,
  };
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
  const [lastResult, setLastResult] = useState<CheckInResult | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const scanHandledRef = useRef(false);

  const checkIn = async (value: string) => {
    if (!eventId) {
      toast.error("Choose an event before checking in a ticket.");
      return;
    }

    setChecking(true);
    try {
      const ticketInput = getTicketInput(value);
      const { data, error } = ticketInput && "token" in ticketInput
        ? await supabase.rpc("check_in_ticket", {
            p_event_id: eventId,
            p_token: ticketInput.token,
          })
        : ticketInput && "ticketCode" in ticketInput
          ? await supabase.rpc("check_in_ticket_by_code", {
              p_event_id: eventId,
              p_ticket_code: ticketInput.ticketCode,
            })
          : await supabase.rpc("record_invalid_ticket_scan", { p_event_id: eventId });
      if (error) throw error;

      const result = getResult(data);
      if (!result) throw new Error("The check-in service returned an invalid response.");
      setLastResult(result);
      onCheckedIn();

      if (result.result === "checked_in") {
        if ("vibrate" in navigator) navigator.vibrate(100);
        toast.success("Ticket checked in.");
      } else if (result.result === "already_used") {
        toast.error("This ticket has already been used.");
      } else if (result.result === "cancelled") {
        toast.error("This ticket has been cancelled.");
      } else if (result.result === "not_found") {
        toast.error("Ticket not found for this event.");
      } else {
        throw new Error("The check-in service returned an unknown result.");
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
          if (!nextOpen) {
            setCameraStarted(false);
            setLastResult(null);
          }
        }}
      >
        <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto overscroll-contain touch-pan-y rounded-2xl">
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
            {lastResult && (
              <div
                role="status"
                aria-live="polite"
                className={`rounded-xl border p-4 ${
                  lastResult.result === "checked_in"
                    ? "border-green-200 bg-green-50 text-green-950"
                    : "border-amber-200 bg-amber-50 text-amber-950"
                }`}
              >
                <div className="flex items-start gap-3">
                  {lastResult.result === "checked_in"
                    ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                    : <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />}
                  <div>
                    <p className="font-semibold">
                      {lastResult.result === "checked_in"
                        ? "Entry recorded"
                        : lastResult.result === "already_used"
                          ? "Duplicate scan — already checked in"
                          : lastResult.result === "cancelled"
                            ? "Ticket cancelled"
                            : "Ticket not found for this event"}
                    </p>
                    {lastResult.attendee_name && (
                      <p className="mt-1 text-sm">{lastResult.attendee_name}</p>
                    )}
                    {lastResult.ticket_type_name && (
                      <p className="text-sm opacity-75">{lastResult.ticket_type_name}</p>
                    )}
                    {lastResult.checked_in_at && lastResult.result !== "checked_in" && (
                      <p className="mt-1 text-xs opacity-75">
                        First checked in {new Date(lastResult.checked_in_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
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
              <Label htmlFor="ticket-code">Ticket number, link, or QR token</Label>
              <div className="flex gap-2">
                <Input
                  id="ticket-code"
                  value={manualValue}
                  onChange={(event) => setManualValue(event.target.value)}
                  placeholder="Enter the UT- ticket number or scan/paste its link"
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
