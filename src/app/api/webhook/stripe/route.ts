import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

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
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "";

// Cook County APIs
const PARCEL_API = "https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json";
const CHARACTERISTICS_API = "https://datacatalog.cookcountyil.gov/resource/bcnq-qi2z.json";
const ASSESSMENTS_API = "https://datacatalog.cookcountyil.gov/resource/uzyt-m557.json";

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
    console.log(`Fetching property data for PIN: ${pin}`);
    
    // Get parcel info
    const parcelUrl = `${PARCEL_API}?pin=${pin}&$limit=1`;
    console.log(`Parcel URL: ${parcelUrl}`);
    const parcelRes = await fetch(parcelUrl);
    const parcels = await parcelRes.json();
    console.log(`Parcel response: ${JSON.stringify(parcels).slice(0, 200)}`);
    if (!parcels.length) {
      console.error(`No parcel found for PIN: ${pin}`);
      return null;
    }
    const parcel = parcels[0];

    // Get characteristics
    const charRes = await fetch(`${CHARACTERISTICS_API}?pin=${pin}&$limit=1`);
    const chars = await charRes.json();
    const char = chars[0] || {};

    // Get assessment
    const assessRes = await fetch(`${ASSESSMENTS_API}?pin=${pin}&$order=year DESC&$limit=1`);
    const assessments = await assessRes.json();
    const assessment = assessments[0] || {};

    const currentAssessment = parseInt(assessment.mailed_tot || assessment.certified_tot || "0");
    const sqft = parseInt(char.char_bldg_sf || "0");
    const beds = parseInt(char.char_beds || "0");
    const yearBuilt = parseInt(char.char_yrblt || "0");
    const perSqft = sqft > 0 ? currentAssessment / sqft : 0;

    // Get Cosmos analysis for fair assessment
    const baseUrl = process.env.VERCEL_ENV === "production" 
      ? "https://www.getovertaxed.com" 
      : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");
    const cosmosRes = await fetch(`${baseUrl}/api/lookup?pin=${pin}`);
    const cosmosData = await cosmosRes.json();
    
    const fairAssessment = cosmosData.property?.analysis?.fairAssessment || currentAssessment;
    const fairPerSqft = sqft > 0 ? fairAssessment / sqft : 0;
    const reduction = currentAssessment - fairAssessment;
    const savings = Math.round(reduction * 0.20);

    // Get comps from same neighborhood
    const nbhd = char.nbhd || parcel.nbhd;
    const compsRes = await fetch(
      `${CHARACTERISTICS_API}?nbhd=${nbhd}&$limit=200&$order=year DESC`
    );
    const allComps = await compsRes.json();

    // Filter and score comps
    const comps: PropertyData["comps"] = [];
    for (const c of allComps) {
      if (c.pin === pin) continue;
      const cSqft = parseInt(c.char_bldg_sf || "0");
      const cBeds = parseInt(c.char_beds || "0");
      const cYear = parseInt(c.char_yrblt || "0");
      
      // Filter: within 25% sqft, same beds ±1
      if (!cSqft || Math.abs(cSqft - sqft) / sqft > 0.25) continue;
      if (Math.abs(cBeds - beds) > 1) continue;

      // Get assessment for this comp
      const cAssessRes = await fetch(`${ASSESSMENTS_API}?pin=${c.pin}&$order=year DESC&$limit=1`);
      const cAssessments = await cAssessRes.json();
      if (!cAssessments.length) continue;
      
      const cAssessment = parseInt(cAssessments[0].mailed_tot || cAssessments[0].certified_tot || "0");
      const cPerSqft = cAssessment / cSqft;

      // Get address
      const cParcelRes = await fetch(`${PARCEL_API}?pin=${c.pin}&$limit=1`);
      const cParcels = await cParcelRes.json();
      const cAddress = cParcels[0]?.property_address || "Unknown";

      comps.push({
        pin: c.pin,
        address: cAddress,
        sqft: cSqft,
        beds: cBeds,
        year: cYear,
        perSqft: Math.round(cPerSqft * 100) / 100,
      });

      if (comps.length >= 8) break;
    }

    // Sort by $/sqft
    comps.sort((a, b) => a.perSqft - b.perSqft);

    return {
      pin,
      address: parcel.property_address,
      city: parcel.property_city,
      zip: parcel.property_zip,
      township: parcel.township_name,
      sqft,
      beds,
      yearBuilt,
      currentAssessment,
      fairAssessment,
      reduction,
      savings,
      perSqft: Math.round(perSqft * 100) / 100,
      fairPerSqft: Math.round(fairPerSqft * 100) / 100,
      comps,
    };
  } catch (error) {
    console.error("Error fetching property data:", error);
    return null;
  }
}

function generatePdfHtml(data: PropertyData): string {
  const medianPerSqft = data.comps.length > 0 
    ? data.comps[Math.floor(data.comps.length / 2)].perSqft 
    : data.fairPerSqft;

  const overAssessedPct = data.fairAssessment > 0 
    ? Math.round(((data.currentAssessment - data.fairAssessment) / data.fairAssessment) * 100)
    : 0;

  const barWidth = Math.min(100, Math.round((medianPerSqft / data.perSqft) * 100));

  const compsRows = data.comps.map(c => `
    <tr>
      <td class="address-cell">${c.address}</td>
      <td class="pin-cell">${c.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4")}</td>
      <td>${c.sqft.toLocaleString()}</td>
      <td>${c.beds}</td>
      <td>${c.year}</td>
      <td>$${c.perSqft.toFixed(2)}</td>
    </tr>
  `).join("");

  const compPins = data.comps.map((c, i) => `
    <div class="checklist-item">${c.address.split(" ").slice(0, 3).join(" ")} <span class="checklist-pin">${c.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-0000")}</span></div>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Your Property Tax Appeal Package</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.5; background: #fff; }
    .page { max-width: 700px; margin: 0 auto; padding: 48px 32px; page-break-after: always; }
    .page:last-child { page-break-after: avoid; }
    .hero-number { font-size: 72px; font-weight: 700; color: #16a34a; letter-spacing: -2px; margin-bottom: 8px; }
    .hero-label { font-size: 24px; color: #666; margin-bottom: 48px; }
    .property-address { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
    .property-details { font-size: 14px; color: #666; margin-bottom: 32px; }
    .verdict { background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 24px; margin-bottom: 32px; }
    .verdict-text { font-size: 18px; font-weight: 500; color: #166534; }
    .comparison { margin: 32px 0; }
    .comparison-row { display: flex; align-items: center; margin-bottom: 16px; }
    .comparison-label { width: 140px; font-size: 14px; color: #666; }
    .comparison-bar-container { flex: 1; height: 32px; background: #f3f4f6; border-radius: 4px; position: relative; }
    .comparison-bar { height: 100%; border-radius: 4px; display: flex; align-items: center; padding-left: 12px; font-weight: 600; font-size: 14px; color: #fff; }
    .bar-you { background: #ef4444; width: 100%; }
    .bar-similar { background: #16a34a; width: ${barWidth}%; }
    .stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 32px 0; }
    .stat { background: #f9fafb; border-radius: 8px; padding: 16px; }
    .stat-value { font-size: 24px; font-weight: 700; color: #1a1a1a; }
    .stat-value.green { color: #16a34a; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; }
    .section-title { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
    .section-subtitle { font-size: 14px; color: #666; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin: 24px 0; }
    th { text-align: left; padding: 10px 6px; border-bottom: 2px solid #e5e7eb; font-weight: 600; color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; }
    th:last-child { text-align: right; }
    td { padding: 10px 6px; border-bottom: 1px solid #f3f4f6; }
    td:last-child { text-align: right; font-weight: 600; }
    tr:last-child td { border-bottom: none; }
    .highlight-row { background: #fef2f2; }
    .highlight-row td { color: #dc2626; font-weight: 600; }
    .median-row { background: #f0fdf4; font-weight: 600; }
    .median-row td { color: #16a34a; border-top: 2px solid #16a34a; }
    .address-cell { font-size: 11px; }
    .pin-cell { font-family: monospace; font-size: 10px; color: #666; }
    .steps { counter-reset: step; }
    .step { display: flex; margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #f3f4f6; }
    .step:last-child { border-bottom: none; }
    .step-number { width: 32px; height: 32px; background: #1a1a1a; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; margin-right: 16px; }
    .step-content { flex: 1; }
    .step-title { font-weight: 600; margin-bottom: 4px; }
    .step-description { font-size: 14px; color: #666; }
    .step-link { display: inline-block; margin-top: 8px; color: #2563eb; font-size: 13px; }
    .pin-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 12px 16px; font-family: monospace; font-size: 16px; margin-top: 8px; display: inline-block; }
    .pins-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; margin-top: 12px; }
    .pins-grid .checklist-item { display: flex; align-items: center; padding: 4px 0; font-size: 12px; }
    .pins-grid .checklist-item::before { content: "☐"; margin-right: 8px; font-size: 14px; }
    .checklist-pin { font-family: monospace; font-size: 10px; color: #666; margin-left: 4px; }
    .action-box { border-radius: 12px; padding: 20px; margin: 24px 0; }
    .action-box.green { background: #f0fdf4; border: 2px solid #16a34a; }
    .action-box-title { font-weight: 700; font-size: 16px; margin-bottom: 8px; color: #166534; }
    .action-box-text { font-size: 14px; color: #166534; }
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
    <div class="property-details">${data.city}, IL ${data.zip} · PIN: ${data.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-0000")} · ${data.township} Township</div>
    <div class="verdict">
      <div class="verdict-text">Your property is assessed ${overAssessedPct}% higher than similar homes in your neighborhood.</div>
    </div>
    <div class="comparison">
      <div class="comparison-row">
        <div class="comparison-label">Your home</div>
        <div class="comparison-bar-container">
          <div class="comparison-bar bar-you">$${data.perSqft.toFixed(2)}/sqft</div>
        </div>
      </div>
      <div class="comparison-row">
        <div class="comparison-label">Similar homes</div>
        <div class="comparison-bar-container">
          <div class="comparison-bar bar-similar">$${medianPerSqft.toFixed(2)}/sqft</div>
        </div>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><div class="stat-value">$${data.currentAssessment.toLocaleString()}</div><div class="stat-label">Current Assessment</div></div>
      <div class="stat"><div class="stat-value green">$${data.fairAssessment.toLocaleString()}</div><div class="stat-label">Fair Assessment</div></div>
      <div class="stat"><div class="stat-value green">$${data.reduction.toLocaleString()}</div><div class="stat-label">Potential Reduction</div></div>
      <div class="stat"><div class="stat-value green">$${data.savings.toLocaleString()}/yr</div><div class="stat-label">Estimated Tax Savings</div></div>
    </div>
    <div class="footer">Analysis based on Cook County Assessor data. Assessment comparisons use properties in your neighborhood with similar square footage (±25%) and bedrooms (±1).</div>
  </div>

  <div class="page">
    <div class="section-title">Comparable Properties</div>
    <div class="section-subtitle">${data.comps.length} similar properties in your neighborhood — ${data.sqft.toLocaleString()} sqft, ${data.beds} bedrooms.</div>
    <table>
      <thead><tr><th>Address</th><th>PIN</th><th>Sqft</th><th>Beds</th><th>Year</th><th>$/sqft</th></tr></thead>
      <tbody>
        ${compsRows}
        <tr class="median-row"><td colspan="5">Median of comparables</td><td>$${medianPerSqft.toFixed(2)}</td></tr>
        <tr class="highlight-row"><td colspan="5">Your property (${data.address})</td><td>$${data.perSqft.toFixed(2)}</td></tr>
      </tbody>
    </table>
    <div style="margin-top: 32px;">
      <div class="section-title" style="font-size: 18px;">The Math</div>
      <div style="font-size: 14px; color: #666; margin-top: 12px; line-height: 1.8;">
        <strong>Your assessment:</strong> $${data.currentAssessment.toLocaleString()} total · ${data.sqft.toLocaleString()} sqft = <strong style="color: #dc2626;">$${data.perSqft.toFixed(2)}/sqft</strong><br>
        <strong>Median comparable:</strong> <strong style="color: #16a34a;">$${medianPerSqft.toFixed(2)}/sqft</strong><br>
        <strong>Fair assessment:</strong> ${data.sqft.toLocaleString()} sqft × $${medianPerSqft.toFixed(2)} = <strong>$${data.fairAssessment.toLocaleString()}</strong><br>
        <strong>Reduction:</strong> $${data.currentAssessment.toLocaleString()} − $${data.fairAssessment.toLocaleString()} = <strong style="color: #16a34a;">$${data.reduction.toLocaleString()}</strong><br>
        <strong>Est. tax savings:</strong> $${data.reduction.toLocaleString()} × 20% ≈ <strong style="color: #16a34a;">$${data.savings.toLocaleString()}/year</strong>
      </div>
    </div>
  </div>

  <div class="page">
    <div class="section-title">How to File Your Appeal</div>
    <div class="section-subtitle">File with the Cook County Assessor. Takes about 10 minutes.</div>
    <div class="action-box green">
      <div class="action-box-title">✓ You're Ready to File</div>
      <div class="action-box-text">You have everything you need. Follow the steps below to submit your appeal online.</div>
    </div>
    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <div class="step-title">Go to the Assessor's appeal portal</div>
          <div class="step-description">Create an account or log in. Click "Residential" to start.</div>
          <a class="step-link" href="https://www.cookcountyassessoril.gov/online-appeals">cookcountyassessoril.gov/online-appeals</a>
        </div>
      </div>
      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <div class="step-title">Enter your PIN</div>
          <div class="step-description">Search for your property using this PIN:</div>
          <div class="pin-box">${data.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-0000")}</div>
        </div>
      </div>
      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <div class="step-title">Select "Lack of Uniformity" as your reason</div>
          <div class="step-description">This means your property is assessed higher than similar properties. The portal will ask you to provide comparable properties.</div>
        </div>
      </div>
      <div class="step">
        <div class="step-number">4</div>
        <div class="step-content">
          <div class="step-title">Add these comparable properties</div>
          <div class="step-description">Enter each PIN below. The system auto-fills the property details.</div>
          <div class="pins-grid">${compPins}</div>
        </div>
      </div>
      <div class="step">
        <div class="step-number">5</div>
        <div class="step-content">
          <div class="step-title">Submit</div>
          <div class="step-description">That's it. You'll get a confirmation email. The Assessor typically responds in 4-6 weeks.<br><br><strong>If denied:</strong> You can appeal to the Board of Review at <a href="https://appeals.cookcountyboardofreview.com" style="color: #2563eb;">appeals.cookcountyboardofreview.com</a></div>
        </div>
      </div>
    </div>
    <div class="footer"><strong>Questions?</strong> Cook County Assessor: 312-443-7550<br><br>Generated by Overtaxed using public data from the Cook County Assessor's Office. This is not legal or tax advice.</div>
  </div>
</body>
</html>`;
}

async function generatePdf(html: string): Promise<Buffer> {
  const response = await fetch(`https://chrome.browserless.io/pdf?token=${BROWSERLESS_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
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

async function sendEmail(to: string, pin: string, pdfBuffer: Buffer, propertyAddress: string) {
  await getResend().emails.send({
    from: "Overtaxed <hello@getovertaxed.com>",
    to,
    subject: `Your Property Tax Appeal Package - ${propertyAddress}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #1a1a1a; font-size: 24px;">Your appeal package is ready! 🎉</h1>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Attached is your complete property tax appeal package for <strong>${propertyAddress}</strong>.
        </p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          The PDF includes:
        </p>
        <ul style="color: #666; font-size: 16px; line-height: 1.8;">
          <li>Your potential savings breakdown</li>
          <li>Comparable properties with lower assessments</li>
          <li>Step-by-step filing instructions</li>
          <li>All the PINs you need to copy/paste</li>
        </ul>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          <strong>Next step:</strong> Open the PDF and follow the instructions to file your appeal. It takes about 10 minutes.
        </p>
        <p style="color: #666; font-size: 16px; line-height: 1.6;">
          Questions? Just reply to this email.
        </p>
        <p style="color: #999; font-size: 14px; margin-top: 32px;">
          — The Overtaxed Team
        </p>
      </div>
    `,
    attachments: [
      {
        filename: `appeal-package-${pin}.pdf`,
        content: pdfBuffer,
      },
    ],
  });
}

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
    const pin = session.client_reference_id;
    const email = session.customer_details?.email;

    if (!pin || !email) {
      console.error("Missing PIN or email in session:", { pin, email });
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    console.log(`Processing order: client_reference_id=${pin}, Email=${email}`);

    try {
      // Determine jurisdiction from client_reference_id prefix
      const baseUrl = process.env.VERCEL_ENV === "production" 
        ? "https://www.getovertaxed.com" 
        : (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

      let endpoint: string;
      if (pin.startsWith("houston:")) {
        endpoint = `${baseUrl}/api/houston/generate-appeal`;
      } else if (pin.startsWith("dallas:")) {
        endpoint = `${baseUrl}/api/dallas/generate-appeal`;
      } else {
        endpoint = `${baseUrl}/api/generate-appeal`;
      }

      // The generate-appeal endpoint handles lookup, PDF, and email
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
// trigger redeploy
// webhook fix Tue Feb 10 02:30:20 CST 2026
