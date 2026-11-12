// @ts-ignore - resolved by Deno at runtime for Edge Functions
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-ignore - esm.sh types are not fully compatible with Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Attendee = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
};

type IssuedTicket = {
  token: string;
  attendee_name: string;
  ticket_type_name: string;
};

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonNegativeSafeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
}

function escapeHtml(value: string): string {
  const entities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  };
  return value.replace(/[&<>"']/g, (character) => entities[character] || character);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return respond({ error: "Method not allowed." }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !serviceRoleKey) {
      throw new Error("Supabase service credentials are not configured.");
    }

    const body: unknown = await req.json();
    if (!isRecord(body)) {
      return respond({ error: "Invalid checkout request." }, 400);
    }

    const rawAttendees = body.attendees;
    const rawContact = body.contact;
    if (
      typeof body.event_id !== "string" ||
      typeof body.ticket_name !== "string" ||
      (body.ticket_type_id !== null && typeof body.ticket_type_id !== "string") ||
      (
        body.payment_reference !== undefined &&
        body.payment_reference !== null &&
        typeof body.payment_reference !== "string"
      ) ||
      !Array.isArray(rawAttendees) ||
      rawAttendees.length < 1 ||
      rawAttendees.length > 99 ||
      !isRecord(rawContact) ||
      typeof rawContact.email !== "string" ||
      typeof rawContact.full_name !== "string" ||
      typeof rawContact.phone !== "string"
    ) {
      return respond({ error: "Checkout is missing valid attendee or contact details." }, 400);
    }

    const attendees = rawAttendees.map((value): Attendee | null => {
      if (!isRecord(value)) return null;
      const { first_name, last_name, email, phone } = value;
      if (
        typeof first_name !== "string" ||
        !first_name.trim() ||
        typeof last_name !== "string" ||
        !last_name.trim() ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
        typeof phone !== "string"
      ) {
        return null;
      }
      return { first_name, last_name, email, phone };
    });

    if (
      attendees.some((attendee) => attendee === null) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawContact.email.trim())
    ) {
      return respond({ error: "Enter a valid name and email address for every attendee and contact." }, 400);
    }
    const validAttendees = attendees.filter((attendee): attendee is Attendee => attendee !== null);
    const contact = {
      full_name: rawContact.full_name,
      email: rawContact.email,
      phone: rawContact.phone,
    };

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, name, status, ticket_price, event_date, location_value")
      .eq("id", body.event_id)
      .maybeSingle();

    if (eventError) throw eventError;
    if (!event || event.status !== "live") {
      return respond({ error: "This event is not accepting registrations." }, 400);
    }

    let ticketTypeId: string | null = null;
    let ticketName = body.ticket_name.trim();
    let unitPrice = Number(event.ticket_price || 0);

    if (typeof body.ticket_type_id === "string") {
      const { data: ticketType, error: ticketTypeError } = await supabase
        .from("ticket_types")
        .select("id, event_id, name, price")
        .eq("id", body.ticket_type_id)
        .eq("event_id", body.event_id)
        .maybeSingle();

      if (ticketTypeError) throw ticketTypeError;
      if (!ticketType) {
        return respond({ error: "The selected ticket type is no longer available." }, 400);
      }

      ticketTypeId = ticketType.id;
      ticketName = ticketType.name;
      unitPrice = Number(ticketType.price);
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      throw new Error("The selected ticket has an invalid price.");
    }

    const quantity = validAttendees.length;
    const orderTotal = unitPrice * quantity;
    const expectedTicketAmountKobo = Math.round(orderTotal * 100);
    let amountPaidKobo = expectedTicketAmountKobo;
    let paystackFeeKobo = 0;
    const paymentReference = typeof body.payment_reference === "string"
      ? body.payment_reference.trim() || null
      : null;

    if (orderTotal > 0) {
      const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackSecretKey) {
        throw new Error("PAYSTACK_SECRET_KEY is not configured.");
      }
      if (!paystackSecretKey.startsWith("sk_live_")) {
        throw new Error("Ticket checkout is restricted to Paystack live mode. Configure a live secret key.");
      }
      if (!paymentReference) {
        return respond({ error: "A verified payment is required for this order." }, 400);
      }

      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${encodeURIComponent(paymentReference)}`,
        { headers: { Authorization: `Bearer ${paystackSecretKey}` } },
      );
      const verifyPayload: unknown = await verifyResponse.json();
      const paystackMessage = isRecord(verifyPayload) && typeof verifyPayload.message === "string"
        ? verifyPayload.message
        : "Paystack could not verify this transaction.";
      const transaction = isRecord(verifyPayload) && isRecord(verifyPayload.data)
        ? verifyPayload.data
        : null;
      const customer = transaction && isRecord(transaction.customer)
        ? transaction.customer
        : null;

      if (!verifyResponse.ok || !transaction) {
        return respond({ error: paystackMessage }, 402);
      }

      if (transaction.status !== "success") {
        return respond({
          error: `Paystack transaction is not successful (status: ${String(transaction.status || "unknown")}).`,
        }, 402);
      }

      const transactionAmount = transaction.amount;
      const transactionFees = transaction.fees;
      if (
        !isNonNegativeSafeInteger(transactionAmount) ||
        transactionAmount < expectedTicketAmountKobo
      ) {
        return respond({ error: "The verified Paystack amount does not match the checkout total." }, 402);
      }

      const feeWasPassedToCustomer = isNonNegativeSafeInteger(transactionFees)
        && transactionAmount === expectedTicketAmountKobo + transactionFees;

      if (
        (transactionAmount !== expectedTicketAmountKobo && !feeWasPassedToCustomer)
      ) {
        return respond({ error: "The verified Paystack amount does not match the checkout total." }, 402);
      }

      amountPaidKobo = transactionAmount;
      paystackFeeKobo = transactionAmount - expectedTicketAmountKobo;

      if (transaction.currency !== "NGN") {
        return respond({ error: "The verified Paystack transaction is not in NGN." }, 402);
      }

      if (
        typeof customer?.email !== "string" ||
        customer.email.toLowerCase() !== contact.email.trim().toLowerCase()
      ) {
        return respond({ error: "The Paystack payer email does not match the checkout contact email." }, 402);
      }
    } else if (paymentReference) {
      return respond({ error: "A payment reference is not expected for a free order." }, 400);
    }

    const firstAttendee = validAttendees[0];
    const registrationData = {
      "Full Name": `${firstAttendee.first_name.trim()} ${firstAttendee.last_name.trim()}`,
      "Email Address": firstAttendee.email.trim(),
      "Phone Number": firstAttendee.phone.trim(),
      "Ticket Type": ticketName,
      Quantity: String(quantity),
      "Ticket Price": String(unitPrice),
      "Order Total": String(orderTotal),
      "Paystack Service Fee": String(paystackFeeKobo / 100),
      "Amount Paid": String(amountPaidKobo / 100),
      "Contact Name": contact.full_name.trim(),
      "Contact Email": contact.email.trim(),
      "Contact Phone": contact.phone.trim(),
      Attendees: validAttendees.map((attendee) => ({
        "Full Name": `${attendee.first_name.trim()} ${attendee.last_name.trim()}`,
        "Email Address": attendee.email.trim(),
        "Phone Number": attendee.phone.trim(),
      })),
    };

    const { data: result, error: checkoutError } = await supabase.rpc("complete_ticket_checkout", {
      p_event_id: body.event_id,
      p_ticket_type_id: ticketTypeId,
      p_ticket_name: ticketName,
      p_verified_unit_price: unitPrice,
      p_quantity: quantity,
      p_registration_data: registrationData,
      p_attendees: validAttendees,
      p_payment_reference: paymentReference,
    });

    if (checkoutError) throw checkoutError;

    if (!isRecord(result) || typeof result.registration_id !== "string") {
      throw new Error("Checkout completed without returning a registration ID.");
    }

    const { data: issuedTickets, error: ticketsError } = await supabase
      .from("issued_tickets")
      .select("token, attendee_name, ticket_type_name")
      .eq("registration_id", result.registration_id);

    if (ticketsError) throw ticketsError;
    if (!issuedTickets || issuedTickets.length !== validAttendees.length) {
      throw new Error("Checkout completed without issuing one ticket per attendee.");
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("TICKET_EMAIL_FROM") || "UniTix <tickets@unitix.ng>";
    let emailsSent = 0;
    let emailsFailed = 0;

    if (!resendApiKey) {
      console.error("Ticket email was not sent: RESEND_API_KEY is not configured.");
      emailsFailed = 1;
    } else {
      try {
        const siteUrl = (Deno.env.get("UNITIX_SITE_URL") || "https://unitix.ng").replace(/\/+$/, "");
        type TicketLink = IssuedTicket & { url: string; number: number };

        const ticketLinks: TicketLink[] = issuedTickets.map((ticket: IssuedTicket, index: number): TicketLink => ({
          ...ticket,
          url: `${siteUrl}/ticket/${encodeURIComponent(ticket.token)}`,
          number: index + 1,
        }));
        const safeCustomerName = escapeHtml(contact.full_name.trim());
        const safeEventName = escapeHtml(event.name);
        const ticketHtml = ticketLinks.map((ticket: TicketLink) => `
          <div style="margin:16px 0;padding:16px;border:1px solid #e5e7eb;border-radius:12px">
            <p style="margin:0 0 4px;font-weight:700;color:#111827">Ticket ${ticket.number}: ${escapeHtml(ticket.attendee_name)}</p>
            <p style="margin:0 0 14px;color:#6b7280">${escapeHtml(ticket.ticket_type_name)}</p>
            <a href="${ticket.url}" style="display:inline-block;padding:11px 18px;border-radius:999px;background:#ff0048;color:#ffffff;text-decoration:none;font-weight:700">View ticket</a>
          </div>
        `).join("");
        const textTicketLinks = ticketLinks.map((ticket: TicketLink) =>
          `Ticket ${ticket.number} — ${ticket.attendee_name} (${ticket.ticket_type_name}): ${ticket.url}`
        ).join("\n\n");
        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `order-tickets-${result.registration_id}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [contact.email.trim()],
            subject: `Your Ticket Confirmation for ${event.name}`,
            html: `
              <div style="margin:0;padding:32px 16px;background:#f4f4f5;font-family:Arial,sans-serif;color:#111827">
                <div style="max-width:560px;margin:0 auto;padding:28px;background:#ffffff;border:1px solid #e5e7eb;border-radius:16px">
                  <span style="display:none!important;visibility:hidden;opacity:0;height:0;width:0;overflow:hidden">Your UniTix ticket is confirmed! Your ticket details are inside.</span>
                  <p style="margin:0 0 16px;font-size:22px;line-height:1.4;color:#111827"><strong>Hello ${safeCustomerName},</strong></p>
                  <p style="margin:0 0 20px;line-height:1.6;color:#4b5563">Your ticket for <strong>${safeEventName}</strong> has been successfully confirmed.</p>
                  ${ticketHtml}
                  <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280">Each ticket has its own QR code. Present the correct ticket at the event entrance. You can reopen these links whenever you need them.</p>
                </div>
              </div>
            `,
            text: `Hello ${contact.full_name.trim()},\n\nYour ticket for ${event.name} has been successfully confirmed.\n\n${textTicketLinks}\n\nEach ticket has its own QR code. Present the correct ticket at the event entrance.`,
          }),
        });

        if (!emailResponse.ok) {
          console.error("Ticket order email failed:", await emailResponse.text());
          emailsFailed = 1;
        } else {
          emailsSent = 1;
        }
      } catch (emailError) {
        console.error("Ticket order email failed:", emailError);
        emailsFailed = 1;
      }
    }

    if (emailsFailed > 0) {
      console.error(`Ticket email delivery summary: ${emailsSent} sent, ${emailsFailed} failed.`);
    }

    return respond({
      tickets: issuedTickets.map((ticket: IssuedTicket) => ({ token: ticket.token })),
      email_delivery: {
        sent: emailsSent,
        failed: emailsFailed,
      },
    });
  } catch (error) {
    console.error("checkout-orders error:", error);
    return respond({
      error: error instanceof Error ? error.message : "Unable to complete checkout.",
    }, 500);
  }
});