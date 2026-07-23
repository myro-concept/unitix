import { serve } from "jsr:@std/http/server";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user?.email) {
      return new Response(JSON.stringify({ error: "Unable to verify account email." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount, currency } = await req.json();
    const parsedAmount = Number(amount || 0);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return new Response(JSON.stringify({ error: "A valid amount is required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("WITHDRAW_NOTIFICATION_FROM") || "UniTix <no-reply@unitix.ng>";

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured on the server." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountLabel = currency === "NGN" ? naira.format(parsedAmount) : `${currency || "NGN"} ${parsedAmount}`;
    const now = new Date().toISOString();

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [userData.user.email],
        subject: "Withdrawal request received - UniTix",
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
            <h2 style="margin: 0 0 12px;">Withdrawal Request Received</h2>
            <p style="margin: 0 0 10px;">Hi,</p>
            <p style="margin: 0 0 10px;">We received your withdrawal request.</p>
            <p style="margin: 0 0 10px;"><strong>Amount:</strong> ${amountLabel}</p>
            <p style="margin: 0 0 10px;"><strong>Requested at:</strong> ${now}</p>
            <p style="margin: 0;">Our team will process this to your saved bank details.</p>
          </div>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text();
      console.error("Resend error:", resendError);
      return new Response(JSON.stringify({ error: "Failed to send withdrawal notification email." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("withdraw-request error:", error);
    return new Response(JSON.stringify({ error: "An internal error occurred." }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
