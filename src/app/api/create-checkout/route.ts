import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

let stripe: Stripe | null = null;
function getStripe() {
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripe;
}

export async function POST(request: NextRequest) {
  try {
    const { propertyId, jurisdiction } = await request.json();

    if (!propertyId) {
      return NextResponse.json({ error: "Missing property ID" }, { status: 400 });
    }

    // Build client_reference_id based on jurisdiction
    const clientReferenceId = jurisdiction === "houston" 
      ? `houston:${propertyId}` 
      : propertyId;

    const origin = request.headers.get("origin") || "https://www.getovertaxed.com";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: jurisdiction === "houston" 
                ? "Property Tax Protest Package" 
                : "Property Tax Appeal Package",
              description: jurisdiction === "houston"
                ? "Complete protest package with comparable properties, appraisal analysis, hearing script, and step-by-step filing instructions for Harris County."
                : "Complete appeal package with comparable properties, assessment analysis, and step-by-step filing instructions for Cook County.",
            },
            unit_amount: 4900, // $49.00
          },
          quantity: 1,
        },
      ],
      client_reference_id: clientReferenceId,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/results?${jurisdiction === "houston" ? `acct=${propertyId}&jurisdiction=houston` : `pin=${propertyId}`}`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[create-checkout] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
