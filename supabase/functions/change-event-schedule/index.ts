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

function respond(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isValidDate(value: unknown): value is string | null {
  return value === null || (typeof value === "string" && Number.isFinite(Date.parse(value)));
}

function formatSchedule(value: string | null, timeZone: string): string {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return respond({ error: "Method not allowed." }, 405);

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const authorization = req.headers.get("Authorization");
    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      throw new Error("Supabase credentials are not configured.");
    }
    if (!authorization?.startsWith("Bearer ")) {
      return respond({ error: "Authentication is required." }, 401);
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData.user) return respond({ error: "Authentication is required." }, 401);

    const body: unknown = await req.json();
    if (
      typeof body !== "object" ||
      body === null ||
      !("event_id" in body) ||
      typeof body.event_id !== "string" ||
      !("event_date" in body) ||
      !("event_end_date" in body) ||
      !isValidDate(body.event_date) ||
      !isValidDate(body.event_end_date)
    ) {
      return respond({ error: "Invalid schedule change request." }, 400);
    }

    const { data: eventBefore, error: eventError } = await supabase
      .from("events")
      .select("id, user_id, name, event_date, event_end_date, timezone")
      .eq("id", body.event_id)
      .single();
    if (eventError) throw eventError;
    if (eventBefore.user_id !== userData.user.id) {
      return respond({ error: "Only the event organizer can change its schedule." }, 403);
    }

    const sameInstant = (left: string | null, right: string | null) =>
      left === null || right === null ? left === right : Date.parse(left) === Date.parse(right);
    const scheduleChanged =
      !sameInstant(eventBefore.event_date, body.event_date) ||
      !sameInstant(eventBefore.event_end_date, body.event_end_date);
    if (!scheduleChanged) return respond({ success: true, notified: 0 });

    const { data: tickets, error: ticketsError } = await supabase
      .from("issued_tickets")
      .select("attendee_email")
      .eq("event_id", body.event_id)
      .neq("status", "cancelled");
    if (ticketsError) throw ticketsError;

    const recipients = [...new Set((tickets || [])
      .map((ticket) => ticket.attendee_email.trim().toLowerCase())
      .filter(Boolean))];

    const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
    if (recipients.length > 0 && !resendApiKey) {
      return respond({ error: "Email delivery is not configured, so the schedule was not changed." }, 503);
    }

    const fromEmail = Deno.env.get("TICKET_EMAIL_FROM") || "UniTix <tickets@unitix.ng>";
    const timeZone = eventBefore.timezone || "Africa/Lagos";
    const notificationId = crypto.randomUUID();
    const message = [
      `The schedule for ${eventBefore.name} has changed.`,
      "",
      `New start: ${formatSchedule(body.event_date, timeZone)}`,
      `New end: ${formatSchedule(body.event_end_date, timeZone)}`,
      "",
      "Your ticket remains valid. Please use these updated event details.",
    ].join("\n");

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { error: updateError } = await adminClient.rpc("update_event_schedule", {
      p_event_id: body.event_id,
      p_event_date: body.event_date,
      p_event_end_date: body.event_end_date,
      p_actor_id: userData.user.id,
      p_actor_email: userData.user.email || null,
    });
    if (updateError) throw updateError;
    if (recipients.length === 0) return respond({ success: true, notified: 0 });

    let notified = 0;
    let notificationFailed = false;

    for (let index = 0; index < recipients.length; index += 50) {
      const batch = recipients.slice(index, index + 50);
      try {
        const response = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
            "Idempotency-Key": `event-schedule-${body.event_id}-${notificationId}-${index}`,
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [batch[0]],
            ...(batch.length > 1 ? { bcc: batch.slice(1) } : {}),
            subject: `Updated schedule: ${eventBefore.name}`,
            text: message,
          }),
        });

        if (!response.ok) {
          notificationFailed = true;
          console.error("Event schedule notification failed:", await response.text());
        } else {
          notified += batch.length;
        }
      } catch (error) {
        notificationFailed = true;
        console.error("Event schedule notification request failed:", error);
      }
    }

    return respond({
      success: true,
      notified,
      notification_warning: notificationFailed
        ? "The schedule was updated, but some ticket-holder notifications could not be sent."
        : null,
    });
  } catch (error) {
    console.error("change-event-schedule error:", error);
    return respond({ error: error instanceof Error ? error.message : "Unable to update the event schedule." }, 500);
  }
});
