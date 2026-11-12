// @ts-ignore - resolved by Deno at runtime for Edge Functions
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
// @ts-ignore - esm.sh types not fully compatible with Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

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

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("full_name, company")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Unable to load withdrawal organizer profile:", profileError);
      return new Response(JSON.stringify({ error: "Unable to load organizer account details." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { amount, currency, submission_id: submissionId } = await req.json();
    const parsedAmount = Number(amount || 0);

    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || currency !== "NGN" || typeof submissionId !== "string") {
      return new Response(JSON.stringify({ error: "A valid NGN amount and request identifier are required." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: requestId, error: requestError } = await supabase.rpc("create_withdrawal_request", {
      p_amount: parsedAmount,
      p_submission_id: submissionId,
    });

    if (requestError || !requestId) {
      console.error("Unable to record withdrawal request:", requestError);
      return new Response(JSON.stringify({ error: requestError?.message || "Failed to record withdrawal request." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("WITHDRAW_NOTIFICATION_FROM") || "UniTix <no-reply@unitix.ng>";
    const ADMIN_EMAIL = Deno.env.get("WITHDRAW_ADMIN_EMAIL") || "hello@unitix.ng";

    if (!RESEND_API_KEY) {
      console.error("Withdrawal request recorded but notifications were not sent: RESEND_API_KEY is not configured.");
      return new Response(JSON.stringify({
        success: true,
        request_id: requestId,
        notification_error: "Email notifications are not configured.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const amountLabel = currency === "NGN" ? naira.format(parsedAmount) : `${currency || "NGN"} ${parsedAmount}`;
    const now = new Date().toISOString();
    const organizerMetadata = userData.user.user_metadata || {};
    const metadataName = [
      organizerMetadata.first_name,
      organizerMetadata.last_name,
    ].filter((part): part is string => typeof part === "string" && part.trim().length > 0).join(" ").trim();
    const organizerName = profile?.full_name?.trim()
      || (typeof organizerMetadata.full_name === "string" ? organizerMetadata.full_name.trim() : "")
      || metadataName
      || userData.user.email.split("@")[0];
    const organizerCompany = profile?.company?.trim() || "Not provided";
    const organizerPhone = typeof organizerMetadata.phone === "string" ? organizerMetadata.phone.trim() : "";
    const bankName = typeof organizerMetadata.bank_name === "string" ? organizerMetadata.bank_name.trim() : "";
    const accountName = typeof organizerMetadata.account_name === "string" ? organizerMetadata.account_name.trim() : "";
    const accountNumber = typeof organizerMetadata.account_number === "string" ? organizerMetadata.account_number.trim() : "";
    const safeOrganizerName = escapeHtml(organizerName);
    const safeOrganizerCompany = escapeHtml(organizerCompany);
    const safeOrganizerEmail = escapeHtml(userData.user.email);
    const safeAmountLabel = escapeHtml(amountLabel);
    const safeOrganizerPhone = escapeHtml(organizerPhone || "Not provided");
    const safeBankName = escapeHtml(bankName || "Not provided");
    const safeAccountName = escapeHtml(accountName || "Not provided");
    const safeAccountNumber = escapeHtml(accountNumber || "Not provided");

    const notificationErrors: string[] = [];
    let organizerEmailResponse: Response | null = null;
    try {
      organizerEmailResponse = await fetch("https://api.resend.com/emails", {
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
              <p style="margin: 0 0 10px;">Hi ${safeOrganizerName},</p>
              <p style="margin: 0 0 10px;">We received your withdrawal request.</p>
              <p style="margin: 0 0 10px;"><strong>Amount:</strong> ${safeAmountLabel}</p>
              <p style="margin: 0 0 10px;"><strong>Requested at:</strong> ${escapeHtml(now)}</p>
              <p style="margin: 0;">Our team will process this to your saved bank details.</p>
            </div>
          `,
          text: `Hi ${organizerName},\n\nWe received your withdrawal request.\nAmount: ${amountLabel}\nRequested at: ${now}\n\nOur team will process this to your saved bank details.`,
        }),
      });
    } catch (error) {
      console.error("Organizer withdrawal email request failed:", error);
      notificationErrors.push("Organizer email notification failed.");
    }

    if (organizerEmailResponse && !organizerEmailResponse.ok) {
      console.error("Organizer withdrawal email failed:", await organizerEmailResponse.text());
      notificationErrors.push("Organizer email notification failed.");
    }

    if (userData.user.email.toLowerCase() !== ADMIN_EMAIL.trim().toLowerCase()) {
      let adminResponse: Response | null = null;
      try {
        adminResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [ADMIN_EMAIL],
            subject: `Withdrawal request from ${organizerName} - UniTix`,
            html: `
              <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
                <h2 style="margin: 0 0 12px;">Withdrawal Request Received</h2>
                <p style="margin: 0 0 10px;">Hi,</p>
                <p style="margin: 0 0 10px;">We received a withdrawal request.</p>
                <p style="margin: 0 0 10px;"><strong>Organizer:</strong> ${safeOrganizerName}</p>
                <p style="margin: 0 0 10px;"><strong>Company:</strong> ${safeOrganizerCompany}</p>
                <p style="margin: 0 0 10px;"><strong>Account email:</strong> ${safeOrganizerEmail}</p>
                <p style="margin: 0 0 10px;"><strong>Phone:</strong> ${safeOrganizerPhone}</p>
                <p style="margin: 0 0 10px;"><strong>Bank:</strong> ${safeBankName}</p>
                <p style="margin: 0 0 10px;"><strong>Bank account name:</strong> ${safeAccountName}</p>
                <p style="margin: 0 0 10px;"><strong>Bank account number:</strong> ${safeAccountNumber}</p>
                <p style="margin: 0 0 10px;"><strong>Amount:</strong> ${safeAmountLabel}</p>
                <p style="margin: 0 0 10px;"><strong>Requested at:</strong> ${escapeHtml(now)}</p>
              </div>
            `,
            text: `We received a withdrawal request.\nOrganizer: ${organizerName}\nCompany: ${organizerCompany}\nAccount email: ${userData.user.email}\nPhone: ${organizerPhone || "Not provided"}\nBank: ${bankName || "Not provided"}\nBank account name: ${accountName || "Not provided"}\nBank account number: ${accountNumber || "Not provided"}\nAmount: ${amountLabel}\nRequested at: ${now}`,
          }),
        });
      } catch (error) {
        console.error("Admin withdrawal email request failed:", error);
        notificationErrors.push("Admin email notification failed.");
      }

      if (adminResponse && !adminResponse.ok) {
        console.error("Admin withdrawal email error:", await adminResponse.text());
        notificationErrors.push("Admin email notification failed.");
      }
    }

    return new Response(JSON.stringify({
      success: true,
      request_id: requestId,
      notification_error: notificationErrors.length ? notificationErrors.join(" ") : null,
    }), {
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
