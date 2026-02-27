import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

// ──────────────────────────────────────────────────────────────────
// Day 21 Hearing-Prep Email Cron
// Runs daily. Finds Stripe sessions paid ~21 days ago, sends a
// "your hearing is coming up" email with last-minute tips.
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

interface JurisdictionInfo {
  name: string;
  county: string;
  portalUrl: string;
  portalName: string;
  deadline: string;
  state: "TX" | "IL";
}

const JURISDICTIONS: Record<string, JurisdictionInfo> = {
  houston: { name: "Houston", county: "Harris County", portalUrl: "https://www.hcad.org", portalName: "HCAD", deadline: "May 15, 2026", state: "TX" },
  dallas: { name: "Dallas", county: "Dallas County", portalUrl: "https://www.dallascad.org", portalName: "DCAD", deadline: "May 15, 2026", state: "TX" },
  austin: { name: "Austin", county: "Travis County", portalUrl: "https://www.traviscad.org", portalName: "TCAD", deadline: "May 15, 2026", state: "TX" },
  collin: { name: "Collin County", county: "Collin County", portalUrl: "https://www.collincad.org", portalName: "Collin CAD", deadline: "May 15, 2026", state: "TX" },
  tarrant: { name: "Tarrant County", county: "Tarrant County", portalUrl: "https://www.tad.org", portalName: "TAD", deadline: "May 15, 2026", state: "TX" },
  denton: { name: "Denton County", county: "Denton County", portalUrl: "https://www.dentoncad.com", portalName: "DCAD", deadline: "May 15, 2026", state: "TX" },
  williamson: { name: "Williamson County", county: "Williamson County", portalUrl: "https://www.wcad.org", portalName: "WCAD", deadline: "May 15, 2026", state: "TX" },
  fortbend: { name: "Fort Bend County", county: "Fort Bend County", portalUrl: "https://www.fbcad.org", portalName: "FBCAD", deadline: "May 15, 2026", state: "TX" },
  rockwall: { name: "Rockwall County", county: "Rockwall County", portalUrl: "https://www.rockwallcad.com", portalName: "Rockwall CAD", deadline: "May 15, 2026", state: "TX" },
  bexar: { name: "Bexar County", county: "Bexar County", portalUrl: "https://www.bcad.org", portalName: "BCAD", deadline: "May 15, 2026", state: "TX" },
};

function getJurisdiction(clientRef: string): JurisdictionInfo | null {
  for (const [prefix, info] of Object.entries(JURISDICTIONS)) {
    if (clientRef.startsWith(`${prefix}:`)) return info;
  }
  return {
    name: "Cook County",
    county: "Cook County",
    portalUrl: "https://www.cookcountyassessor.com",
    portalName: "Cook County Assessor",
    deadline: "varies by township",
    state: "IL",
  };
}

function buildHearingPrepHtml(jurisdiction: JurisdictionInfo): string {
  const isTX = jurisdiction.state === "TX";

  const dayOfSection = isTX
    ? `
      <p style="margin: 0 0 12px 0;"><strong>📋 Day-of checklist:</strong></p>
      <ul style="margin: 0 0 16px 0; padding-left: 20px;">
        <li>Bring <strong>two printed copies</strong> of your evidence packet (one for you, one for the appraiser)</li>
        <li>Bring your <strong>cover letter</strong> — it summarizes your case at a glance</li>
        <li>Arrive 10-15 minutes early</li>
        <li>Dress business casual — you don't need a suit, but look like you take it seriously</li>
        <li>Be polite, be brief, let the comps do the talking</li>
      </ul>
    `
    : `
      <p style="margin: 0 0 12px 0;"><strong>📋 Final steps:</strong></p>
      <ul style="margin: 0 0 16px 0; padding-left: 20px;">
        <li>Make sure your appeal is filed at <a href="${jurisdiction.portalUrl}" style="color: #1a6b5a;">${jurisdiction.portalName}</a></li>
        <li>Confirm your evidence packet was uploaded successfully</li>
        <li>Save any confirmation numbers or emails</li>
        <li>If you haven't heard back, follow up with the Assessor's office</li>
      </ul>
    `;

  const negotiationTips = isTX
    ? `
      <p style="margin: 0 0 12px 0;"><strong>🤝 If they offer a settlement:</strong></p>
      <ul style="margin: 0 0 16px 0; padding-left: 20px;">
        <li>Compare their offer to the <strong>fair value</strong> in your evidence packet</li>
        <li>If their number is at or below your fair value — <strong>take it</strong></li>
        <li>If it's above, counter with your number and point to your comps</li>
        <li>You can always say "I'd like to proceed to a formal hearing" if you disagree</li>
        <li>Most informal hearings result in <em>some</em> reduction — that's a win</li>
      </ul>
    `
    : "";

  return `
    <div style="background: #f7f6f3; padding: 32px 16px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: #1a6b5a; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <span style="color: white; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">overtaxed</span>
        </div>
        <div style="background: #ffffff; padding: 28px 24px; border: 1px solid #e2e2e0; border-top: none; border-radius: 0 0 12px 12px;">
          <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #1a1a1a;">
            Your hearing is around the corner 🏛️
          </h1>
          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #666; margin-bottom: 24px; font-size: 15px;">
            It's been about 3 weeks since you got your protest package. If you've filed, your hearing should be coming up soon. Here's a final prep refresher.
          </p>

          <div style="background: #e8f4f0; border: 2px solid #1a6b5a; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #333;">
            ${dayOfSection}
          </div>

          ${negotiationTips ? `
          <div style="background: #f9fafb; border: 1px solid #e2e2e0; border-radius: 8px; padding: 18px 20px; margin-bottom: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; color: #333;">
            ${negotiationTips}
          </div>
          ` : ""}

          <div style="background: #dbeafe; border: 1px solid #3b82f6; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #1e40af; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong>💡 Remember:</strong> Even a partial reduction saves you money every year going forward. A $20,000 value reduction can save $400-600/year in taxes. You've got this.
            </p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #92400e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong>Haven't filed yet?</strong> The deadline for ${jurisdiction.county} is <strong>${jurisdiction.deadline}</strong>. File now at <a href="${jurisdiction.portalUrl}" style="color: #92400e;">${jurisdiction.portalName}</a> — it takes about 10 minutes.
            </p>
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            After your hearing, we'd love to hear how it went. Just reply to this email — your feedback helps us improve for everyone.
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
  const authHeader = request.headers.get("authorization");
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Find sessions completed 21 days ago (24-hour window)
    const now = Math.floor(Date.now() / 1000);
    const twentyOneDaysAgo = now - 21 * 24 * 60 * 60;
    const twentyDaysAgo = now - 20 * 24 * 60 * 60;

    const sessions = await getStripe().checkout.sessions.list({
      limit: 100,
      created: {
        gte: twentyOneDaysAgo,
        lt: twentyDaysAgo,
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

      // Skip if already sent hearing prep (check metadata)
      if (session.metadata?.hearing_prep_sent === "true") {
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
          subject: `Your ${jurisdiction.county} hearing is coming up — last-minute tips`,
          html: buildHearingPrepHtml(jurisdiction),
        });

        // Mark as sent
        await getStripe().checkout.sessions.update(session.id, {
          metadata: {
            ...session.metadata,
            hearing_prep_sent: "true",
          },
        });

        sent++;
      } catch (err) {
        errors.push(`Failed to send to ${email}: ${err}`);
      }
    }

    console.log(`Hearing-prep cron: sent=${sent}, skipped=${skipped}, errors=${errors.length}`);

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Hearing-prep cron error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
