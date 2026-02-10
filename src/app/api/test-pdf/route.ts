import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Test endpoint to debug PDF generation and email
// Call: /api/test-pdf?pin=13014180090000&email=test@example.com

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || "";
const PARCEL_API = "https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json";
const CHARACTERISTICS_API = "https://datacatalog.cookcountyil.gov/resource/bcnq-qi2z.json";
const ASSESSMENTS_API = "https://datacatalog.cookcountyil.gov/resource/uzyt-m557.json";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const pin = searchParams.get("pin");
  const email = searchParams.get("email");
  const skipEmail = searchParams.get("skipEmail") === "true";
  
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  if (!pin) {
    return NextResponse.json({ error: "Missing pin parameter" }, { status: 400 });
  }

  try {
    // Step 1: Check env vars
    log(`[1] Checking env vars...`);
    log(`  BROWSERLESS_TOKEN: ${BROWSERLESS_TOKEN ? "SET (" + BROWSERLESS_TOKEN.slice(0,8) + "...)" : "MISSING"}`);
    log(`  RESEND_API_KEY: ${process.env.RESEND_API_KEY ? "SET" : "MISSING"}`);

    // Step 2: Fetch parcel data
    log(`[2] Fetching parcel data for PIN ${pin}...`);
    const parcelRes = await fetch(`${PARCEL_API}?pin=${pin}&$limit=1`);
    const parcels = await parcelRes.json();
    if (!parcels.length) {
      return NextResponse.json({ error: "Parcel not found", logs }, { status: 404 });
    }
    const parcel = parcels[0];
    log(`  Address: ${parcel.property_address}`);

    // Step 3: Fetch characteristics
    log(`[3] Fetching characteristics...`);
    const charRes = await fetch(`${CHARACTERISTICS_API}?pin=${pin}&$limit=1`);
    const chars = await charRes.json();
    const char = chars[0] || {};
    log(`  Sqft: ${char.char_bldg_sf || "N/A"}, Beds: ${char.char_beds || "N/A"}`);

    // Step 4: Fetch assessment
    log(`[4] Fetching assessment...`);
    const assessRes = await fetch(`${ASSESSMENTS_API}?pin=${pin}&$order=year DESC&$limit=1`);
    const assessments = await assessRes.json();
    const assessment = assessments[0] || {};
    log(`  Assessment: $${assessment.mailed_tot || assessment.certified_tot || "N/A"}`);

    // Step 5: Generate simple test HTML
    log(`[5] Generating test PDF...`);
    const testHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>Test PDF</title></head>
        <body style="font-family: sans-serif; padding: 40px;">
          <h1>Test PDF Generation</h1>
          <p><strong>PIN:</strong> ${pin}</p>
          <p><strong>Address:</strong> ${parcel.property_address}</p>
          <p><strong>Sqft:</strong> ${char.char_bldg_sf || "N/A"}</p>
          <p><strong>Assessment:</strong> $${assessment.mailed_tot || assessment.certified_tot || "N/A"}</p>
          <p><strong>Generated:</strong> ${new Date().toISOString()}</p>
        </body>
      </html>
    `;

    // Step 6: Call Browserless
    log(`[6] Calling Browserless...`);
    const browserlessUrl = `https://chrome.browserless.io/pdf?token=${BROWSERLESS_TOKEN}`;
    const pdfRes = await fetch(browserlessUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html: testHtml,
        options: {
          format: "Letter",
          printBackground: true,
        },
      }),
    });

    if (!pdfRes.ok) {
      const errorText = await pdfRes.text();
      log(`  Browserless error: ${pdfRes.status} - ${errorText}`);
      return NextResponse.json({ error: "Browserless failed", status: pdfRes.status, details: errorText, logs }, { status: 500 });
    }

    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
    log(`  PDF generated: ${pdfBuffer.length} bytes`);

    // Step 7: Send email (if email provided and not skipped)
    if (email && !skipEmail) {
      log(`[7] Sending email to ${email}...`);
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const emailResult = await resend.emails.send({
        from: "Overtaxed <hello@getovertaxed.com>",
        to: email,
        subject: `Test PDF - ${parcel.property_address}`,
        html: `<p>Test PDF attached for ${parcel.property_address}</p>`,
        attachments: [
          {
            filename: `test-${pin}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
      
      log(`  Email result: ${JSON.stringify(emailResult)}`);
    } else {
      log(`[7] Skipping email (no email provided or skipEmail=true)`);
    }

    return NextResponse.json({ 
      success: true, 
      pdfSize: pdfBuffer.length,
      address: parcel.property_address,
      logs 
    });

  } catch (error) {
    log(`ERROR: ${error}`);
    return NextResponse.json({ error: String(error), logs }, { status: 500 });
  }
}
