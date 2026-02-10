import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import crypto from "crypto";

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

let resend: Resend | null = null;
function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || "";

interface PropertyData {
  pin: string;
  address: string;
  city: string;
  zip: string;
  township: string;
  sqft: number;
  beds: number;
  yearBuilt: number;
  currentAssessment: number;
  fairAssessment: number;
  reduction: number;
  savings: number;
  perSqft: number;
  fairPerSqft: number;
  comps: Array<{
    pin: string;
    address: string;
    sqft: number;
    beds: number;
    year: number;
    perSqft: number;
  }>;
}

async function getPropertyData(pin: string): Promise<PropertyData | null> {
  try {
    console.log(`[getPropertyData] Starting for PIN: ${pin}`);
    
    // Get from our existing lookup API which already has all the data
    const baseUrl = "https://www.getovertaxed.com";
    const lookupRes = await fetch(`${baseUrl}/api/lookup?pin=${pin}`);
    console.log(`[getPropertyData] Lookup response status: ${lookupRes.status}`);
    
    if (!lookupRes.ok) {
      console.log(`[getPropertyData] Lookup failed`);
      return null;
    }
    
    const lookupData = await lookupRes.json();
    console.log(`[getPropertyData] Lookup data:`, JSON.stringify(lookupData).slice(0, 500));
    
    if (!lookupData.property) {
      console.log(`[getPropertyData] No property in lookup data`);
      return null;
    }
    
    const prop = lookupData.property;
    const assessment = prop.assessment || {};
    const analysis = prop.analysis || {};
    const chars = prop.characteristics || {};
    
    // Get comps from our comps API (returns comp details)
    const compsRes = await fetch(`${baseUrl}/api/comps?pin=${pin}&details=true`);
    const compsData = await compsRes.json();
    console.log(`[getPropertyData] Comps response:`, JSON.stringify(compsData).slice(0, 300));
    
    // Map comps - the API returns them in compsData.comps or we need to fetch from Cosmos
    let comps: PropertyData["comps"] = [];
    if (compsData.comps && Array.isArray(compsData.comps)) {
      comps = compsData.comps.slice(0, 5).map((c: any) => ({
        pin: c.pin || c.id,
        address: c.address || "N/A",
        sqft: c.sqft || 0,
        beds: c.beds || 0,
        year: c.yearBuilt || c.year || 0,
        perSqft: c.assessmentPerSqft || c.perSqft || 0,
      }));
    }

    // Current assessment from the live assessment data
    const currentAssessment = assessment.mailedTotal || assessment.certifiedTotal || compsData.current_assessment || 0;
    const fairAssessment = analysis.fairAssessment || compsData.fair_assessment || currentAssessment;
    const sqft = chars.sqft || chars.char_bldg_sf || compsData.sqft || 0;
    const beds = chars.beds || chars.char_beds || compsData.beds || 0;
    const yearBuilt = chars.yearBuilt || chars.char_yrblt || 0;
    
    const perSqft = sqft > 0 ? currentAssessment / sqft : 0;
    const fairPerSqft = sqft > 0 ? fairAssessment / sqft : 0;
    const reduction = currentAssessment - fairAssessment;
    const savings = Math.round(reduction * 0.20);

    console.log(`[getPropertyData] Mapped values: currentAssessment=${currentAssessment}, fairAssessment=${fairAssessment}, sqft=${sqft}, comps=${comps.length}`);

    return {
      pin,
      address: prop.address || "",
      city: prop.city || "CHICAGO",
      zip: prop.zip || "",
      township: prop.township || "",
      sqft,
      beds,
      yearBuilt,
      currentAssessment,
      fairAssessment,
      reduction,
      savings,
      perSqft,
      fairPerSqft,
      comps,
    };
  } catch (error) {
    console.error("[getPropertyData] Error:", error);
    return null;
  }
}

function generatePdfHtml(data: PropertyData): string {
  const overAssessedPct = data.currentAssessment > 0 
    ? Math.round((data.reduction / data.currentAssessment) * 100) 
    : 0;
  
  const compsHtml = data.comps.map(c => `
    <tr>
      <td class="comp-address">${c.address}<br><span class="pin-cell">${c.pin}</span></td>
      <td>${c.sqft.toLocaleString()}</td>
      <td>${c.beds}</td>
      <td>${c.year}</td>
      <td class="comp-highlight">$${c.perSqft.toFixed(2)}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Tax Appeal Package - ${data.address}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; line-height: 1.5; color: #1a1a1a; background: #fff; }
    .page { max-width: 8.5in; margin: 0 auto; padding: 48px; }
    .hero-number { font-size: 64px; font-weight: 700; color: #16a34a; margin: 24px 0 8px; }
    .hero-label { font-size: 18px; color: #666; margin-bottom: 32px; }
    .property-address { font-size: 24px; font-weight: 600; margin-bottom: 8px; }
    .property-details { font-size: 14px; color: #666; margin-bottom: 32px; }
    .section { margin: 32px 0; }
    .section-title { font-size: 18px; font-weight: 600; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #e5e7eb; }
    .verdict { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-radius: 12px; padding: 20px; margin: 24px 0; }
    .verdict-text { font-size: 16px; font-weight: 500; }
    .comparison { display: flex; gap: 24px; margin: 24px 0; }
    .comparison-row { flex: 1; }
    .comparison-label { font-size: 12px; color: #666; margin-bottom: 4px; }
    .comparison-bar-container { height: 40px; background: #f3f4f6; border-radius: 8px; overflow: hidden; }
    .comparison-bar { height: 100%; display: flex; align-items: center; padding: 0 12px; font-weight: 600; font-size: 14px; }
    .bar-you { background: #fee2e2; color: #dc2626; }
    .bar-fair { background: #dcfce7; color: #16a34a; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { text-align: left; padding: 12px 8px; background: #f9fafb; font-weight: 600; font-size: 12px; text-transform: uppercase; color: #666; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px 8px; border-bottom: 1px solid #e5e7eb; }
    .comp-address { font-weight: 500; }
    .comp-highlight { color: #16a34a; font-weight: 600; }
    .pin-cell { font-family: monospace; font-size: 10px; color: #666; }
    .steps { counter-reset: step; }
    .step { display: flex; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #f3f4f6; }
    .step:last-child { border-bottom: none; }
    .step-number { width: 32px; height: 32px; background: #1a1a1a; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; margin-right: 16px; }
    .step-content { flex: 1; }
    .step-title { font-weight: 600; margin-bottom: 4px; }
    .step-description { font-size: 14px; color: #666; }
    .step-link { display: inline-block; margin-top: 8px; color: #2563eb; font-size: 13px; }
    .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #999; }
    .logo { font-size: 20px; font-weight: 700; font-style: italic; color: #1a1a1a; margin-bottom: 24px; }
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } .page { padding: 32px; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="logo">overtaxed</div>
    <div class="hero-number">$${data.savings.toLocaleString()}</div>
    <div class="hero-label">estimated annual savings</div>
    <div class="property-address">${data.address}</div>
    <div class="property-details">${data.city}, IL ${data.zip} · PIN: ${data.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5")} · ${data.township} Township</div>
    
    <div class="verdict">
      <div class="verdict-text">Your property is assessed ${overAssessedPct}% higher than similar homes in your neighborhood.</div>
    </div>

    <div class="section">
      <div class="section-title">Assessment Comparison</div>
      <div class="comparison">
        <div class="comparison-row">
          <div class="comparison-label">Your Current Assessment (per sqft)</div>
          <div class="comparison-bar-container">
            <div class="comparison-bar bar-you" style="width: 100%">$${data.perSqft.toFixed(2)}/sqft</div>
          </div>
        </div>
        <div class="comparison-row">
          <div class="comparison-label">Fair Assessment Based on Comparables</div>
          <div class="comparison-bar-container">
            <div class="comparison-bar bar-fair" style="width: ${Math.round((data.fairPerSqft / data.perSqft) * 100)}%">$${data.fairPerSqft.toFixed(2)}/sqft</div>
          </div>
        </div>
      </div>
      <table>
        <tr>
          <th style="width: 50%">Metric</th>
          <th style="width: 25%">Current</th>
          <th style="width: 25%">Fair Value</th>
        </tr>
        <tr>
          <td>Total Assessment</td>
          <td>$${data.currentAssessment.toLocaleString()}</td>
          <td class="comp-highlight">$${data.fairAssessment.toLocaleString()}</td>
        </tr>
        <tr>
          <td>Assessment per Sqft</td>
          <td>$${data.perSqft.toFixed(2)}</td>
          <td class="comp-highlight">$${data.fairPerSqft.toFixed(2)}</td>
        </tr>
        <tr>
          <td>Estimated Annual Tax Savings</td>
          <td colspan="2" class="comp-highlight" style="font-size: 18px; font-weight: 700;">$${data.savings.toLocaleString()}</td>
        </tr>
      </table>
    </div>

    <div class="section">
      <div class="section-title">Comparable Properties</div>
      <p style="color: #666; margin-bottom: 16px;">These similar properties in your neighborhood are assessed at lower values per square foot:</p>
      <table>
        <tr>
          <th>Address</th>
          <th>Sqft</th>
          <th>Beds</th>
          <th>Year</th>
          <th>$/Sqft</th>
        </tr>
        ${compsHtml}
      </table>
    </div>

    <div class="section">
      <div class="section-title">How to File Your Appeal</div>
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">Go to the Cook County Assessor's Office website</div>
            <div class="step-description">Visit the online appeals portal to start your appeal.</div>
            <div class="step-link">cookcountyassessor.com/appeals</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">Enter your PIN and select "Lack of Uniformity"</div>
            <div class="step-description">Your PIN is ${data.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5")}. Select "Lack of Uniformity" as your appeal reason — this means comparable homes are assessed lower than yours.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">Enter the comparable property PINs</div>
            <div class="step-description">Use the PINs from the comparable properties table above. Enter at least 3-5 comparable PINs to strengthen your case.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <div class="step-title">Submit and wait for your decision</div>
            <div class="step-description">You'll receive a decision by mail within 4-8 weeks. If approved, your assessment will be reduced and you'll see savings on your next tax bill.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>Generated by Overtaxed · ${new Date().toLocaleDateString()} · This document provides comparable property data to support your appeal. It is not legal advice. Filing deadlines and procedures vary — verify with the Cook County Assessor's Office.</p>
    </div>
  </div>
</body>
</html>`;
}

async function generatePdf(html: string): Promise<Buffer> {
  const response = await fetch("https://chrome.browserless.io/pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${BROWSERLESS_TOKEN}`,
    },
    body: JSON.stringify({
      html,
      options: {
        format: "Letter",
        printBackground: true,
        margin: { top: "0.5in", right: "0.5in", bottom: "0.5in", left: "0.5in" },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Browserless error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function sendEmail(
  email: string, 
  pin: string, 
  pdfBuffer: Buffer, 
  address: string,
  accessToken: string
): Promise<void> {
  const accessLink = `https://www.getovertaxed.com/appeal/${accessToken}`;
  
  await getResend().emails.send({
    from: "Overtaxed <hello@getovertaxed.com>",
    to: email,
    subject: `Your Property Tax Appeal Package - ${address}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="font-size: 24px; font-weight: 700; margin-bottom: 16px;">Your appeal package is ready!</h1>
        <p style="color: #666; margin-bottom: 24px;">Here's everything you need to appeal your property tax assessment for <strong>${address}</strong>.</p>
        
        <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0; color: #166534;"><strong>Your appeal package is attached to this email.</strong></p>
        </div>
        
        <p style="margin-bottom: 16px;">You can also access your appeal package anytime:</p>
        <a href="${accessLink}" style="display: inline-block; background: #1a1a1a; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">View Your Appeal Package</a>
        
        <p style="color: #999; font-size: 12px; margin-top: 32px;">This link will expire in 30 days. If you need assistance, reply to this email.</p>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #999; font-size: 12px;">Overtaxed · hello@getovertaxed.com</p>
      </div>
    `,
    attachments: [
      {
        filename: `appeal-package-${pin}.pdf`,
        content: pdfBuffer.toString("base64"),
      },
    ],
  });
}

// Simple in-memory store for access tokens (in production, use a database)
// For now, we'll encode the PIN in the token and verify via Stripe
function generateAccessToken(sessionId: string, pin: string): string {
  const data = `${sessionId}:${pin}:${Date.now()}`;
  const hash = crypto.createHash("sha256").update(data + process.env.STRIPE_SECRET_KEY).digest("hex");
  return `${Buffer.from(`${pin}:${sessionId}`).toString("base64url")}.${hash.slice(0, 16)}`;
}

function verifyAccessToken(token: string): { pin: string; sessionId: string } | null {
  try {
    const [encoded, hash] = token.split(".");
    if (!encoded || !hash) return null;
    
    const decoded = Buffer.from(encoded, "base64url").toString();
    const [pin, sessionId] = decoded.split(":");
    if (!pin || !sessionId) return null;
    
    return { pin, sessionId };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const accessToken = searchParams.get("token");

  // If access token provided, verify and return data
  if (accessToken) {
    const tokenData = verifyAccessToken(accessToken);
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    // Verify the session exists and was paid
    try {
      const session = await getStripe().checkout.sessions.retrieve(tokenData.sessionId);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const propertyData = await getPropertyData(tokenData.pin);
    if (!propertyData) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      property: propertyData,
      token: accessToken,
    });
  }

  // If session_id provided, this is post-checkout
  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
      }

      const pin = session.client_reference_id;
      const email = session.customer_details?.email;

      if (!pin) {
        return NextResponse.json({ error: "No PIN in session" }, { status: 400 });
      }

      const propertyData = await getPropertyData(pin);
      if (!propertyData) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }

      // Generate access token for this purchase
      const token = generateAccessToken(sessionId, pin);

      // Send email in background (don't wait)
      if (email) {
        generatePdf(generatePdfHtml(propertyData)).then(pdfBuffer => {
          sendEmail(email, pin, pdfBuffer, propertyData.address, token).catch(console.error);
        }).catch(console.error);
      }

      return NextResponse.json({ 
        success: true, 
        property: propertyData,
        token,
        email: email || null,
      });

    } catch (error) {
      console.error("Error retrieving session:", error);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ error: "Missing session_id or token" }, { status: 400 });
}

// POST endpoint to download PDF
export async function POST(request: NextRequest) {
  const { token } = await request.json();
  
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const tokenData = verifyAccessToken(token);
  if (!tokenData) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  // Verify payment
  try {
    const session = await getStripe().checkout.sessions.retrieve(tokenData.sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const propertyData = await getPropertyData(tokenData.pin);
  if (!propertyData) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const html = generatePdfHtml(propertyData);
  const pdfBuffer = await generatePdf(html);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="appeal-package-${tokenData.pin}.pdf"`,
    },
  });
}
