
import { QRCodeSVG } from "qrcode.react";

type UniTixTicketProps = {
  ticketId: string;
  eventName: string;
  attendeeName: string;
  attendeeEmail?: string;
  attendeePhone?: string;
  ticketType: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  location: string;
  amountPaid: number;
  currency?: string;
  qrValue: string;
  eventImage?: string;
  status?: "valid" | "used" | "cancelled";
};

export default function UniTixTicket({
  ticketId,
  eventName,
  attendeeName,
  attendeeEmail,
  attendeePhone,
  ticketType,
  eventDate,
  eventTime,
  venue,
  location,
  amountPaid,
  currency = "NGN",
  qrValue,
  eventImage,
  status = "valid",
}: UniTixTicketProps) {
  const money = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountPaid);

  const statusLabel = {
    valid: "Valid ticket",
    used: "Already used",
    cancelled: "Cancelled",
  }[status];

  return (
    <div className="unitix-ticket-page min-h-screen bg-[#f0f0f0] px-3 py-6 sm:px-5">
      <article
        className="unitix-ticket mx-auto w-full max-w-md overflow-hidden rounded-2xl
        border border-gray-200 bg-white shadow-sm"
      >
        {/* Event cover / header */}
        <header className="relative h-52 overflow-hidden bg-[#ff0048]">
          {eventImage ? (
            <img
              src={eventImage}
              alt={eventName}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.25em]">
                  Your next experience
                </p>
                <h2 className="mt-3 text-3xl font-bold leading-tight">
                  {eventName}
                </h2>
              </div>
            </div>
          )}

          {eventImage && (
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-5 pt-12">
              <p className="text-xs font-semibold uppercase tracking-widest text-white">
                Your event ticket
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                {eventName}
              </h2>
            </div>
          )}

          <div className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5">
            <span className="text-sm font-extrabold tracking-tight text-[#ff0048]">
              ◉ UniTix
            </span>
          </div>
        </header>

        {/* Ticket heading */}
        <section className="px-5 pb-4 pt-6">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Your ticket is ready!
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950">
            {eventName}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Hi {attendeeName}, keep this ticket handy for entry to your event.
          </p>
        </section>

        {/* Ticket summary */}
        <section className="mx-4 rounded-xl bg-[#f8f8f8] p-4 sm:mx-5">
          <h3 className="text-base font-bold text-gray-950">
            Ticket summary
          </h3>

          <div className="mt-3 space-y-0 text-sm">
            {attendeeEmail && <InfoRow label="Attendee email" value={attendeeEmail} />}
            {attendeePhone && <InfoRow label="Attendee phone" value={attendeePhone} />}
            <InfoRow label="Ticket number" value={ticketId} />
            <InfoRow label="Event date" value={eventDate} />
            <InfoRow label="Event time" value={eventTime} />
            <InfoRow label="Ticket type" value={ticketType} />
            <InfoRow label="Venue" value={venue} />
            <InfoRow label="Location" value={location} />
          </div>

          {/* Price card */}
          <div className="mt-4 rounded-xl bg-white p-4">
            <p className="text-xs text-gray-500">Amount paid</p>
            <div className="mt-1 flex items-center justify-between gap-3">
              <span className="text-xl font-bold text-gray-950">
                {money}
              </span>
              <span className="text-xs text-gray-500">
                {ticketType}
              </span>
            </div>
          </div>

          {/* QR section */}
          <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4">
            <div className="flex flex-col items-center text-center">
              <div className="rounded-lg border border-gray-100 p-3">
                <QRCodeSVG
                  value={qrValue}
                  size={176}
                  level="H"
                  marginSize={2}
                  title={`Ticket ${ticketId}`}
                />
              </div>

              <h3 className="mt-3 text-sm font-bold text-gray-950">
                Your entry pass
              </h3>
              <p className="mt-1 max-w-xs text-xs leading-5 text-gray-500">
                Present this QR code at the entrance for ticket verification.
                Keep your ticket private.
              </p>

              <span
                className={`mt-3 rounded-full px-3 py-1 text-xs font-semibold ${
                  status === "valid"
                    ? "bg-lime-100 text-lime-800"
                    : status === "used"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          {/* Download / print */}
          <button
            type="button"
            onClick={() => window.print()}
            disabled={status === "cancelled"}
            className="mt-4 w-full rounded-full bg-[#ff0048] px-5 py-3
            text-sm font-bold text-white transition hover:bg-[#df003e]
            disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download / Print Ticket
          </button>
        </section>

        {/* Footer */}
        <footer className="mt-5 bg-[#fafafa] px-5 py-5 text-center">
          <p className="text-sm font-bold text-gray-900">
            Ready for your next experience?
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Keep your ticket safe and arrive on time.
          </p>
          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-sm font-extrabold text-[#ff0048]">
              ◉ UniTix
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Your access, simplified.
            </p>
            <p className="mt-3 text-[10px] text-gray-400">
              Ticket ID: {ticketId}
            </p>
          </div>
        </footer>
      </article>

      <style>{`
        @media print {
          @page {
            size: auto;
            margin: 8mm;
          }

          body {
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .ticket-collection,
          .ticket-collection-content,
          .ticket-list,
          .unitix-ticket-page {
            display: contents !important;
          }

          .ticket-page-heading,
          .ticket-navigation {
            display: none !important;
          }

          .unitix-ticket,
          .unitix-ticket * {
            visibility: visible !important;
          }

          .unitix-ticket {
            position: relative;
            margin: 0 auto;
            width: 100%;
            max-width: 420px;
            box-shadow: none !important;
            border: 1px solid #ddd;
            break-after: page;
            page-break-after: always;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .ticket-list > .unitix-ticket-page:last-child > .unitix-ticket {
            break-after: auto;
            page-break-after: auto;
          }

          .unitix-ticket button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-gray-200 py-3 last:border-b-0">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="break-words text-right font-medium text-gray-900">
        {value}
      </span>
    </div>
  );
}
