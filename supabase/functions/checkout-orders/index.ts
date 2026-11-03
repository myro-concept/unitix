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
    const paymentReference = typeof body.payment_reference === "string"
      ? body.payment_reference.trim() || null
      : null;

    if (orderTotal > 0) {
      const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");
      if (!paystackSecretKey) {
        throw new Error("PAYSTACK_SECRET_KEY is not configured.");
      }
      if (!paystackSecretKey.startsWith("sk_test_")) {
        throw new Error("Ticket checkout is restricted to Paystack test mode. Configure a test secret key.");
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

      if (
        typeof transaction.amount !== "number" ||
        transaction.amount !== Math.round(orderTotal * 100)
      ) {
        return respond({ error: "The verified Paystack amount does not match the checkout total." }, 402);
      }

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
            template: {
              id: "581b0672-44bf-4bc4-a9a1-b83ba4d27fee",
              variables: {
                customer_name: contact.full_name.trim(),
                event_name: event.name,
              },
            },
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