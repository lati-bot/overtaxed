import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

/**
 * TEMPORARY diagnostic endpoint for debugging email delivery.
 * DELETE after resolving the issue.
 * 
 * GET /api/debug-email — checks env vars, tests Browserless PDF, tests Resend email
 */

export async function GET(request: NextRequest) {
  const results: Record<string, unknown> = {};

  // 1. Check env vars
  results.envVars = {
    RESEND_API_KEY: !!process.env.RESEND_API_KEY,
    BROWSERLESS_TOKEN: !!process.env.BROWSERLESS_TOKEN,
    STRIPE_SECRET_KEY: !!process.env.STRIPE_SECRET_KEY,
    COSMOS_CONNECTION_STRING: !!process.env.COSMOS_CONNECTION_STRING,
  };

  // 2. Test Browserless PDF generation
  const browserlessToken = process.env.BROWSERLESS_TOKEN || "";
  try {
    const pdfRes = await fetch(`https://production-sfo.browserless.io/pdf?token=${browserlessToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html: "<html><body><h1>Hello World — Browserless Test</h1></body></html>",
        options: { format: "Letter", printBackground: true },
      }),
    });
    if (pdfRes.ok) {
      const buf = await pdfRes.arrayBuffer();
      results.browserless = { ok: true, pdfBytes: buf.byteLength };
    } else {
      const errText = await pdfRes.text().catch(() => "");
      results.browserless = { ok: false, status: pdfRes.status, error: errText.slice(0, 500) };
    }
  } catch (e: any) {
    results.browserless = { ok: false, error: e.message };
  }

  // 3. Test Resend email
  const testEmail = "tomi@getovertaxed.com"; // safe internal address
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const emailRes = await resend.emails.send({
      from: "Overtaxed <hello@getovertaxed.com>",
      to: testEmail,
      subject: "[DEBUG] Email delivery test — " + new Date().toISOString(),
      html: "<p>This is a test email from the debug-email endpoint. If you see this, Resend is working.</p>",
    });
    results.resend = { ok: true, id: emailRes.data?.id, error: emailRes.error };
  } catch (e: any) {
    results.resend = { ok: false, error: e.message };
  }

  return NextResponse.json(results, { status: 200 });
}
