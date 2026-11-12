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
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const naira = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 2,
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

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return jsonResponse({ error: "Unauthorized." }, 401);

    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userError } = await supabase.auth.getUser(authHeader.slice("Bearer ".length));
    if (userError || !userData.user) return jsonResponse({ error: "Unable to verify account." }, 401);

    const { data: isAdmin, error: roleError } = await supabase.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (roleError) {
      console.error("Could not verify admin role:", roleError);
      return jsonResponse({ error: "Could not verify admin access." }, 500);
    }
    if (!isAdmin) return jsonResponse({ error: "Admin access is required." }, 403);

    const { request_id: requestId, paid_reference: paidReference, receipt_path: receiptPath } = await req.json();
    if (typeof requestId !== "string" || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId)) {
      return jsonResponse({ error: "A valid withdrawal request ID is required." }, 400);
    }
    if (paidReference !== null && paidReference !== undefined && typeof paidReference !== "string") {
      return jsonResponse({ error: "Payment reference must be text." }, 400);
    }
    if (receiptPath !== null && receiptPath !== undefined
      && (typeof receiptPath !== "string" || !receiptPath.startsWith(`${requestId}/`) || receiptPath.includes(".."))) {
      return jsonResponse({ error: "Invalid receipt path." }, 400);
    }

    const { data: withdrawal, error: withdrawalError } = await supabase
      .from("withdrawal_requests")
      .select("id, organizer_name, organizer_email, amount, currency, status")
      .eq("id", requestId)
      .maybeSingle();

    if (withdrawalError) {
      console.error("Could not load withdrawal request:", withdrawalError);
      return jsonResponse({ error: "Could not load withdrawal request." }, 500);
    }
    if (!withdrawal || withdrawal.status !== "pending") {
      return jsonResponse({ error: "Withdrawal request was not found or is already paid." }, 409);
    }

    let receiptUrl: string | null = null;
    if (typeof receiptPath === "string" && receiptPath) {
      const { data: signedReceipt, error: receiptError } = await supabase.storage
        .from("withdrawal-receipts")
        .createSignedUrl(receiptPath, 60 * 60 * 24 * 30);
      if (receiptError || !signedReceipt?.signedUrl) {
        console.error("Could not create organizer receipt link:", receiptError);
        return jsonResponse({ error: "Could not create a secure receipt link." }, 500);
      }
      receiptUrl = signedReceipt.signedUrl;
    }

    const { error: paymentError } = await supabase.rpc("mark_withdrawal_paid", {
      p_request_id: requestId,
      p_paid_reference: typeof paidReference === "string" ? paidReference.trim() || null : null,
      p_receipt_path: typeof receiptPath === "string" ? receiptPath : null,
    });
    if (paymentError) {
      console.error("Could not mark withdrawal as paid:", paymentError);
      return jsonResponse({ error: paymentError.message || "Could not mark withdrawal as paid." }, 400);
    }

    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      console.error("Withdrawal marked paid, but RESEND_API_KEY is not configured.");
      return jsonResponse({
        success: true,
        notification_error: "Payment was recorded, but the organizer email could not be sent because email is not configured.",
      });
    }

    const fromEmail = Deno.env.get("WITHDRAW_NOTIFICATION_FROM") || "UniTix <no-reply@unitix.ng>";
    const amountLabel = naira.format(Number(withdrawal.amount));
    const safeName = escapeHtml(withdrawal.organizer_name);
    const safeReference = typeof paidReference === "string" ? escapeHtml(paidReference.trim()) : "";
    const receiptMarkup = receiptUrl
      ? `<p style="margin:0 0 10px;"><a href="${escapeHtml(receiptUrl)}">View payment receipt</a> (secure link valid for 30 days).</p>`
      : "";
    const receiptText = receiptUrl ? `\nReceipt: ${receiptUrl} (secure link valid for 30 days)` : "";
    const referenceMarkup = safeReference
      ? `<p style="margin:0 0 10px;"><strong>Payment reference:</strong> ${safeReference}</p>`
      : "";
    const referenceText = typeof paidReference === "string" && paidReference.trim()
      ? `\nPayment reference: ${paidReference.trim()}`
      : "";

    let emailResponse: Response;
    try {
      emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [withdrawal.organizer_email],
          subject: "Your UniTix withdrawal has been paid",
          html: `
            <div style="font-family:Arial,sans-serif;line-height:1.6;color:#111">
              <h2 style="margin:0 0 12px">Withdrawal Payment Completed</h2>
              <p style="margin:0 0 10px">Hello ${safeName},</p>
              <p style="margin:0 0 10px">Your withdrawal payment has been sent to your saved bank account.</p>
              <p style="margin:0 0 10px"><strong>Amount:</strong> ${escapeHtml(amountLabel)}</p>
              ${referenceMarkup}
              ${receiptMarkup}
              <p style="margin:0">Thank you for using UniTix.</p>
            </div>
          `,
          text: `Hello ${withdrawal.organizer_name},\n\nYour withdrawal payment has been sent to your saved bank account.\nAmount: ${amountLabel}${referenceText}${receiptText}\n\nThank you for using UniTix.`,
        }),
      });
    } catch (error) {
      console.error("Withdrawal paid email request failed:", error);
      return jsonResponse({
        success: true,
        notification_error: "Payment was recorded, but the organizer email could not be sent.",
      });
    }

    if (!emailResponse.ok) {
      console.error("Withdrawal paid email failed:", await emailResponse.text());
      return jsonResponse({
        success: true,
        notification_error: "Payment was recorded, but the organizer email could not be sent.",
      });
    }

    return jsonResponse({ success: true, notification_error: null });
  } catch (error) {
    console.error("mark-withdrawal-paid error:", error);
    return jsonResponse({ error: "An internal error occurred." }, 500);
  }
});