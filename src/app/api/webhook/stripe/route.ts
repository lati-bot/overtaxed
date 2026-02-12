import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Lazy initialization
let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripe;
}

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const clientRef = session.client_reference_id;
    const email = session.customer_details?.email;

    if (!clientRef || !email) {
      console.error("Missing client_reference_id or email in session:", { clientRef, email });
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    console.log(`Processing order: client_reference_id=${clientRef}, Email=${email}`);

    try {
      // Determine jurisdiction from client_reference_id prefix and delegate
      // to the appropriate generate-appeal endpoint (which handles lookup, PDF, and email)
      const baseUrl = process.env.VERCEL_ENV === "production" 
        ? "https://www.getovertaxed.com" 
        : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

      let endpoint: string;
      if (clientRef.startsWith("houston:")) {
        endpoint = `${baseUrl}/api/houston/generate-appeal`;
      } else if (clientRef.startsWith("dallas:")) {
        endpoint = `${baseUrl}/api/dallas/generate-appeal`;
      } else {
        endpoint = `${baseUrl}/api/generate-appeal`;
      }

      const generateRes = await fetch(`${endpoint}?session_id=${session.id}`, {
        method: "GET",
      });

      if (!generateRes.ok) {
        const errData = await generateRes.json().catch(() => ({}));
        console.error("Generate appeal failed:", errData);
        // Don't fail the webhook — the user can still access via success page
      } else {
        console.log(`Successfully triggered appeal generation for ${email}`);
      }
    } catch (error) {
      console.error("Error processing order:", error);
      return NextResponse.json({ error: "Processing failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
