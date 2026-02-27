import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

// ──────────────────────────────────────────────────────────────────
// Day 7 Follow-Up Email Cron
// Runs daily. Finds Stripe sessions paid ~7 days ago, sends hearing
// prep email with county-specific portal links and next steps.
// ──────────────────────────────────────────────────────────────────

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

const CRON_SECRET = process.env.CRON_SECRET || "";

// Map client_reference_id prefix → jurisdiction info
interface JurisdictionInfo {
  name: string;
  county: string;
  portalUrl: string;
  portalName: string;
  deadline: string;
  state: "TX" | "IL";
}

const JURISDICTIONS: Record<string, JurisdictionInfo> = {
  houston: {
    name: "Houston",
    county: "Harris County",
    portalUrl: "https://www.hcad.org",
    portalName: "HCAD",
    deadline: "May 15, 2026",
    state: "TX",
  },
  dallas: {
    name: "Dallas",
    county: "Dallas County",
    portalUrl: "https://www.dallascad.org",
    portalName: "DCAD",
    deadline: "May 15, 2026",
    state: "TX",
  },
  austin: {
    name: "Austin",
    county: "Travis County",
    portalUrl: "https://www.traviscad.org",
    portalName: "TCAD",
    deadline: "May 15, 2026",
    state: "TX",
  },
  collin: {
    name: "Collin County",
    county: "Collin County",
    portalUrl: "https://www.collincad.org",
    portalName: "Collin CAD",
    deadline: "May 15, 2026",
    state: "TX",
  },
  tarrant: {
    name: "Tarrant County",
    county: "Tarrant County",
    portalUrl: "https://www.tad.org",
    portalName: "TAD",
    deadline: "May 15, 2026",
    state: "TX",
  },
  denton: {
    name: "Denton County",
    county: "Denton County",
    portalUrl: "https://www.dentoncad.com",
    portalName: "DCAD",
    deadline: "May 15, 2026",
    state: "TX",
  },
  williamson: {
    name: "Williamson County",
    county: "Williamson County",
    portalUrl: "https://www.wcad.org",
    portalName: "WCAD",
    deadline: "May 15, 2026",
    state: "TX",
  },
  fortbend: {
    name: "Fort Bend County",
    county: "Fort Bend County",
    portalUrl: "https://www.fbcad.org",
    portalName: "FBCAD",
    deadline: "May 15, 2026",
    state: "TX",
  },
  rockwall: {
    name: "Rockwall County",
    county: "Rockwall County",
    portalUrl: "https://www.rockwallcad.com",
    portalName: "Rockwall CAD",
    deadline: "May 15, 2026",
    state: "TX",
  },
  bexar: {
    name: "Bexar County",
    county: "Bexar County",
    portalUrl: "https://www.bcad.org",
    portalName: "BCAD",
    deadline: "May 15, 2026",
    state: "TX",
  },
};

function getJurisdiction(clientRef: string): JurisdictionInfo | null {
  for (const [prefix, info] of Object.entries(JURISDICTIONS)) {
    if (clientRef.startsWith(`${prefix}:`)) return info;
  }
  // Default: Cook County (IL) — no prefix
  return {
    name: "Cook County",
    county: "Cook County",
    portalUrl: "https://www.cookcountyassessor.com",
    portalName: "Cook County Assessor",
    deadline: "varies by township",
    state: "IL",
  };
}

function buildFollowUpHtml(jurisdiction: JurisdictionInfo): string {
  const isTX = jurisdiction.state === "TX";

  const hearingTips = isTX
    ? `
      <p style="margin: 0 0 12px 0;"><strong>🏛️ What to expect at your hearing:</strong></p>
      <ul style="margin: 0 0 16px 0; padding-left: 20px;">
        <li>Hearings are typically informal — you'll sit across from an appraiser</li>
        <li>Present your evidence packet calmly — the comps speak for themselves</li>
        <li>If offered a settlement, compare it to your fair value estimate</li>
        <li>You can accept, counter, or proceed to a formal hearing</li>
        <li>Most cases settle in the informal stage</li>
      </ul>
    `
    : `
      <p style="margin: 0 0 12px 0;"><strong>🏛️ What to expect:</strong></p>
      <ul style="margin: 0 0 16px 0; padding-left: 20px;">
        <li>File your appeal with the Cook County Assessor's office</li>
        <li>Submit your evidence packet along with your appeal form</li>
        <li>The Assessor's office will review and respond</li>
        <li>If you disagree, you can appeal to the Board of Review</li>
      </ul>
    `;

  return `
    <div style="background: #f7f6f3; padding: 32px 16px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: #1a6b5a; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <span style="color: white; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">overtaxed</span>
        </div>
        <div style="background: #ffffff; padding: 28px 24px; border: 1px solid #e2e2e0; border-top: none; border-radius: 0 0 12px 12px;">
          <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #1a1a1a;">
            Ready for your hearing? Here's how to prepare.
          </h1>
          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #666; margin-bottom: 24px; font-size: 15px;">
            It's been a week since you got your protest package. If you haven't filed yet, now's the time — the deadline is <strong>${jurisdiction.deadline}</strong>.
          </p>

          <div style="background: #e8f4f0; border: 2px solid #1a6b5a; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 12px 0; font-size: 15px; color: #1a6b5a; font-weight: 700; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              ✅ Your checklist
            </p>
            <div style="font-size: 14px; color: #1a6b5a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <p style="margin: 0 0 8px 0;">☐ <strong>File your protest</strong> at <a href="${jurisdiction.portalUrl}" style="color: #1a6b5a;">${jurisdiction.portalName}</a> (${jurisdiction.portalUrl})</p>
              <p style="margin: 0 0 8px 0;">☐ <strong>Upload your evidence packet</strong> — the PDF we emailed you</p>
              <p style="margin: 0 0 8px 0;">☐ <strong>Print your cover letter</strong> to bring to the hearing</p>
              <p style="margin: 0;">☐ <strong>Save your hearing date</strong> — you'll get a notice after filing</p>
            </div>
          </div>

          <div style="background: #f9fafb; border: 1px solid #e2e2e0; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #333;">
            ${hearingTips}
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #92400e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong>💡 Pro tip:</strong> Bring a printed copy of your evidence packet to the hearing. Having it on paper makes a stronger impression than showing your phone.
            </p>
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Can't find your original email? Check your spam folder or reply to this email — we'll resend your packet.
          </p>

          <hr style="border: none; border-top: 1px solid #e2e2e0; margin: 24px 0;">
          <p style="font-size: 12px; color: #999; margin: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Overtaxed · Property tax protest made simple · <a href="https://www.getovertaxed.com" style="color: #999;">getovertaxed.com</a>
          </p>
        </div>
      </div>
    </div>
  `;
}

export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find sessions completed 7 days ago (24-hour window)
    const now = Math.floor(Date.now() / 1000);
    const sevenDaysAgo = now - 7 * 24 * 60 * 60;
    const sixDaysAgo = now - 6 * 24 * 60 * 60;

    const sessions = await getStripe().checkout.sessions.list({
      limit: 100,
      created: {
        gte: sevenDaysAgo,
        lt: sixDaysAgo,
      },
      status: "complete",
    });

    let sent = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const session of sessions.data) {
      const email = session.customer_details?.email;
      const clientRef = session.client_reference_id;

      if (!email || !clientRef) {
        skipped++;
        continue;
      }

      // Skip if already sent follow-up (check metadata)
      if (session.metadata?.followup_sent === "true") {
        skipped++;
        continue;
      }

      const jurisdiction = getJurisdiction(clientRef);
      if (!jurisdiction) {
        skipped++;
        continue;
      }

      try {
        await getResend().emails.send({
          from: "Overtaxed <hello@getovertaxed.com>",
          to: email,
          subject: "Your hearing is coming up — here's how to prepare",
          html: buildFollowUpHtml(jurisdiction),
        });

        // Mark as sent
        await getStripe().checkout.sessions.update(session.id, {
          metadata: {
            ...session.metadata,
            followup_sent: "true",
          },
        });

        sent++;
      } catch (err) {
        errors.push(`Failed to send to ${email}: ${err}`);
      }
    }

    console.log(`Follow-up cron: sent=${sent}, skipped=${skipped}, errors=${errors.length}`);

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Follow-up cron error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
