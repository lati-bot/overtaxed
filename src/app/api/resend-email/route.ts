import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { verifyAccessToken } from "@/lib/security";

let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripe;
}

// Rate limit: track last resend per session to prevent abuse
const resendCooldowns = new Map<string, number>();
const COOLDOWN_MS = 60_000; // 1 minute between resends

function detectJurisdiction(tokenData: string): string | null {
  const parts = tokenData.split(":");
  if (parts.length < 3) return "cook";
  const jurisdiction = parts[0];
  const valid = ["houston", "dallas", "austin", "collin", "tarrant", "denton", "williamson", "fortbend", "bexar", "rockwall"];
  return valid.includes(jurisdiction) ? jurisdiction : "cook";
}

const jurisdictionEndpoints: Record<string, string> = {
  cook: "/api/generate-appeal",
  houston: "/api/houston/generate-appeal",
  dallas: "/api/dallas/generate-appeal",
  austin: "/api/austin/generate-appeal",
  collin: "/api/collin/generate-appeal",
  tarrant: "/api/tarrant/generate-appeal",
  denton: "/api/denton/generate-appeal",
  williamson: "/api/williamson/generate-appeal",
  fortbend: "/api/fortbend/generate-appeal",
  bexar: "/api/bexar/generate-appeal",
  rockwall: "/api/rockwall/generate-appeal",
};

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { token } = body;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  // Verify the access token
  const tokenData = verifyAccessToken(token);
  if (!tokenData) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  // Extract session ID from token data (format: "jurisdiction:acct:sessionId" or "pin:sessionId")
  const parts = tokenData.split(":");
  let sessionId: string;
  if (parts.length >= 3) {
    sessionId = parts[2];
  } else if (parts.length === 2) {
    sessionId = parts[1];
  } else {
    return NextResponse.json({ error: "Invalid token format" }, { status: 400 });
  }

  // Rate limit check
  const lastResend = resendCooldowns.get(sessionId);
  if (lastResend && Date.now() - lastResend < COOLDOWN_MS) {
    const waitSec = Math.ceil((COOLDOWN_MS - (Date.now() - lastResend)) / 1000);
    return NextResponse.json(
      { error: `Please wait ${waitSec} seconds before requesting another resend` },
      { status: 429 }
    );
  }

  // Get email from Stripe session
  let email: string | null;
  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }
    email = session.customer_details?.email || null;
    if (!email) {
      return NextResponse.json({ error: "No email associated with this purchase" }, { status: 400 });
    }

    // Temporarily clear the "processed" flag so the generate-appeal endpoint will send the email
    const wasProcessed = session.metadata?.processed === "true";
    if (wasProcessed) {
      await getStripe().checkout.sessions.update(sessionId, {
        metadata: { ...session.metadata, processed: "" },
      });
    }

    // Determine jurisdiction and call the appropriate endpoint
    const jurisdiction = detectJurisdiction(tokenData);
    const endpointPath = jurisdictionEndpoints[jurisdiction || "cook"];
    
    const baseUrl = "https://www.getovertaxed.com";

    const res = await fetch(`${baseUrl}${endpointPath}?session_id=${sessionId}`);
    
    // Restore the processed flag
    if (wasProcessed) {
      await getStripe().checkout.sessions.update(sessionId, {
        metadata: { ...session.metadata, processed: "true" },
      });
    }

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      console.error("Resend email - generate appeal failed:", errData);
      return NextResponse.json({ error: "Failed to resend email. Please try again." }, { status: 500 });
    }

    // Mark cooldown
    resendCooldowns.set(sessionId, Date.now());

    return NextResponse.json({ success: true, email });
  } catch (error) {
    console.error("Resend email error:", error);
    return NextResponse.json({ error: "Failed to resend email" }, { status: 500 });
  }
}
