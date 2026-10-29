import { useQuery } from "@tanstack/react-query";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import UniTixTicket from "@/pages/UniTixTicket";

interface TicketDetails {
  id: string;
  token: string;
  attendeeName: string;
  attendeeEmail: string;
  attendeePhone: string;
  ticketType: string;
  amountPaid: number;
  status: "valid" | "used" | "cancelled";
  eventName: string;
  eventDate: string | null;
  location: string;
  eventImage: string | undefined;
}

function mapTickets(value: Json): TicketDetails[] {
  if (!Array.isArray(value)) {
    throw new Error("The ticket service returned an invalid response.");
  }

  return value.map((row) => {
    if (typeof row !== "object" || row === null || Array.isArray(row)) {
      throw new Error("The ticket service returned incomplete ticket details.");
    }

    const {
      id,
      token,
      attendee_name,
      attendee_email,
      attendee_phone,
      ticket_type_name,
      amount_paid,
      status,
      event_name,
      event_date,
      location,
      event_image,
    } = row;

    if (
      typeof id !== "string" ||
      typeof token !== "string" ||
      typeof attendee_name !== "string" ||
      typeof attendee_email !== "string" ||
      typeof attendee_phone !== "string" ||
      typeof ticket_type_name !== "string" ||
      typeof event_name !== "string" ||
      (status !== "valid" && status !== "used" && status !== "cancelled")
    ) {
      throw new Error("The ticket service returned incomplete ticket details.");
    }

    const parsedAmount = typeof amount_paid === "number"
      ? amount_paid
      : typeof amount_paid === "string"
      ? Number(amount_paid)
      : Number.NaN;
    if (!Number.isFinite(parsedAmount)) {
      throw new Error("The ticket service returned an invalid ticket amount.");
    }

    return {
      id,
      token,
      attendeeName: attendee_name,
      attendeeEmail: attendee_email,
      attendeePhone: attendee_phone,
      ticketType: ticket_type_name,
      amountPaid: parsedAmount,
      status,
      eventName: event_name,
      eventDate: typeof event_date === "string" ? event_date : null,
      location: typeof location === "string" ? location : "Venue TBA",
      eventImage: typeof event_image === "string" ? event_image : undefined,
    };
  });
}

function formatEventDate(value: string | null) {
  if (!value) return { date: "Date TBA", time: "Time TBA" };
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "Date TBA", time: "Time TBA" };
  return {
    date: date.toLocaleDateString("en-NG", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: date.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" }),
  };
}

export default function TicketCollection() {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const providedTokens = [token, ...searchParams.getAll("token")]
    .filter((value): value is string => value !== undefined)
    .map((value) => value.trim());
  const hasTokenInput = token !== undefined || searchParams.has("token");
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const tokens = [...new Set(providedTokens.filter((value) => uuidPattern.test(value)))];
  const invalidTokenCount = providedTokens.filter((value) => !uuidPattern.test(value)).length;
  const tooManyTokens = tokens.length > 99;

  const ticketsQuery = useQuery({
    queryKey: ["issued-tickets-by-token", tokens],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_tickets_by_tokens", {
        p_tokens: tokens,
      });
      if (error) throw error;
      return mapTickets(data);
    },
    enabled: tokens.length > 0 && !tooManyTokens,
  });
  const missingTokenCount = ticketsQuery.data
    ? tokens.length - ticketsQuery.data.filter((ticket) => tokens.includes(ticket.token)).length
    : 0;

  return (
    <main className="ticket-collection min-h-screen bg-[#f0f0f0] px-3 py-8 sm:px-5">
      <div className="ticket-collection-content mx-auto max-w-3xl">
        <div className="ticket-page-heading mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-950">Your tickets</h1>
          <p className="mt-1 text-sm text-gray-600">
            Keep these QR codes ready to present at the event entrance.
          </p>
        </div>

        {!hasTokenInput ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
            No ticket token was provided. Open a complete ticket link to view your ticket.
          </div>
        ) : tooManyTokens ? (
          <div className="rounded-xl border border-red-200 bg-white p-5 text-center text-sm text-red-700">
            You can view up to 99 tickets at a time.
          </div>
        ) : ticketsQuery.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-[#ff0048]" />
          </div>
        ) : (
          <>
            {invalidTokenCount > 0 && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-white p-4 text-center text-sm text-amber-800">
                {invalidTokenCount === 1
                  ? "One ticket token is invalid and was not loaded."
                  : `${invalidTokenCount} ticket tokens are invalid and were not loaded.`}
              </div>
            )}
            {missingTokenCount > 0 && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-white p-4 text-center text-sm text-amber-800">
                {missingTokenCount === 1
                  ? "One ticket was not found."
                  : `${missingTokenCount} tickets were not found.`}
              </div>
            )}

            {ticketsQuery.isError ? (
              <div className="rounded-xl border border-red-200 bg-white p-5 text-center text-sm text-red-700">
                <AlertCircle className="mx-auto mb-2 h-5 w-5" />
                Tickets could not be loaded: {ticketsQuery.error instanceof Error
                  ? ticketsQuery.error.message
                  : "Please try opening your ticket link again."}
              </div>
            ) : ticketsQuery.data?.length ? (
              <div className="ticket-list space-y-6">
                {ticketsQuery.data.map((ticket) => {
                  const date = formatEventDate(ticket.eventDate);
                  return (
                    <UniTixTicket
                      key={ticket.id}
                      ticketId={ticket.token}
                      eventName={ticket.eventName}
                      attendeeName={ticket.attendeeName}
                      attendeeEmail={ticket.attendeeEmail}
                      attendeePhone={ticket.attendeePhone}
                      ticketType={ticket.ticketType}
                      eventDate={date.date}
                      eventTime={date.time}
                      venue={ticket.location}
                      location={ticket.location}
                      amountPaid={ticket.amountPaid}
                      qrValue={ticket.token}
                      eventImage={ticket.eventImage}
                      status={ticket.status}
                    />
                  );
                })}
              </div>
            ) : invalidTokenCount > 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
                No valid ticket tokens were provided.
              </div>
            ) : (
              <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-600">
                No tickets were found for this link. Check that you opened the complete ticket URL.
              </div>
            )}
          </>
        )}

        <div className="ticket-navigation mt-6 text-center">
          <Link to="/events" className="text-sm font-semibold text-[#ff0048] hover:underline">
            Browse more events
          </Link>
        </div>
      </div>
    </main>
  );
}
