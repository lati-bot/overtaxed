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
    let clientReferenceId: string;
    if (jurisdiction === "houston") {
      clientReferenceId = `houston:${propertyId}`;
    } else if (jurisdiction === "dallas") {
      clientReferenceId = `dallas:${propertyId}`;
    } else if (jurisdiction === "austin") {
      clientReferenceId = `austin:${propertyId}`;
    } else if (jurisdiction === "collin") {
      clientReferenceId = `collin:${propertyId}`;
    } else if (jurisdiction === "tarrant") {
      clientReferenceId = `tarrant:${propertyId}`;
    } else if (jurisdiction === "denton") {
      clientReferenceId = `denton:${propertyId}`;
    } else if (jurisdiction === "williamson") {
      clientReferenceId = `williamson:${propertyId}`;
    } else if (jurisdiction === "fortbend") {
      clientReferenceId = `fortbend:${propertyId}`;
    } else if (jurisdiction === "rockwall") {
      clientReferenceId = `rockwall:${propertyId}`;
    } else {
      clientReferenceId = propertyId;
    }

    const isTexas = jurisdiction === "houston" || jurisdiction === "dallas" || jurisdiction === "austin" || jurisdiction === "collin" || jurisdiction === "tarrant" || jurisdiction === "denton" || jurisdiction === "williamson" || jurisdiction === "fortbend" || jurisdiction === "rockwall";
    const countyName = jurisdiction === "houston" ? "Harris County" 
      : jurisdiction === "dallas" ? "Dallas County" 
      : jurisdiction === "austin" ? "Travis County"
      : jurisdiction === "collin" ? "Collin County"
      : jurisdiction === "tarrant" ? "Tarrant County"
      : jurisdiction === "denton" ? "Denton County"
      : jurisdiction === "williamson" ? "Williamson County"
      : jurisdiction === "fortbend" ? "Fort Bend County"
      : jurisdiction === "rockwall" ? "Rockwall County"
      : "Cook County";

    const origin = request.headers.get("origin") || "https://www.getovertaxed.com";

    let cancelUrl: string;
    if (jurisdiction === "houston") {
      cancelUrl = `${origin}/results?acct=${propertyId}&jurisdiction=houston`;
    } else if (jurisdiction === "dallas") {
      cancelUrl = `${origin}/results?acct=${propertyId}&jurisdiction=dallas`;
    } else if (jurisdiction === "austin") {
      cancelUrl = `${origin}/results?acct=${propertyId}&jurisdiction=austin`;
    } else if (jurisdiction === "collin") {
      cancelUrl = `${origin}/results?acct=${propertyId}&jurisdiction=collin`;
    } else if (jurisdiction === "tarrant") {
      cancelUrl = `${origin}/results?acct=${propertyId}&jurisdiction=tarrant`;
    } else if (jurisdiction === "denton") {
      cancelUrl = `${origin}/results?acct=${propertyId}&jurisdiction=denton`;
    } else if (jurisdiction === "williamson") {
      cancelUrl = `${origin}/results?acct=${propertyId}&jurisdiction=williamson`;
    } else if (jurisdiction === "fortbend") {
      cancelUrl = `${origin}/results?acct=${propertyId}&jurisdiction=fortbend`;
    } else if (jurisdiction === "rockwall") {
      cancelUrl = `${origin}/results?acct=${propertyId}&jurisdiction=rockwall`;
    } else {
      cancelUrl = `${origin}/results?pin=${propertyId}`;
    }

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: isTexas
                ? "Property Tax Protest Package" 
                : "Property Tax Appeal Package",
              description: isTexas
                ? `Complete protest package with comparable properties, appraisal analysis, hearing script, and step-by-step filing instructions for ${countyName}.`
                : `Complete appeal package with comparable properties, assessment analysis, and step-by-step filing instructions for ${countyName}.`,
            },
            unit_amount: 4900, // $49.00
          },
          quantity: 1,
        },
      ],
      client_reference_id: clientReferenceId,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[create-checkout] Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}
