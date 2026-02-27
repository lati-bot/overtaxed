import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";

// ──────────────────────────────────────────────────────────────────
// Day 45 Outcome Survey Email Cron
// Runs daily. Finds Stripe sessions paid ~45 days ago, sends a
// "how did it go?" email to collect testimonials and feedback.
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
  state: "TX" | "IL";
}

const JURISDICTIONS: Record<string, JurisdictionInfo> = {
  houston: { name: "Houston", county: "Harris County", state: "TX" },
  dallas: { name: "Dallas", county: "Dallas County", state: "TX" },
  austin: { name: "Austin", county: "Travis County", state: "TX" },
  collin: { name: "Collin County", county: "Collin County", state: "TX" },
  tarrant: { name: "Tarrant County", county: "Tarrant County", state: "TX" },
  denton: { name: "Denton County", county: "Denton County", state: "TX" },
  williamson: { name: "Williamson County", county: "Williamson County", state: "TX" },
  fortbend: { name: "Fort Bend County", county: "Fort Bend County", state: "TX" },
  rockwall: { name: "Rockwall County", county: "Rockwall County", state: "TX" },
  bexar: { name: "Bexar County", county: "Bexar County", state: "TX" },
};

function getJurisdiction(clientRef: string): JurisdictionInfo {
  for (const [prefix, info] of Object.entries(JURISDICTIONS)) {
    if (clientRef.startsWith(`${prefix}:`)) return info;
  }
  return { name: "Cook County", county: "Cook County", state: "IL" };
}

function buildSurveyHtml(jurisdiction: JurisdictionInfo): string {
  return `
    <div style="background: #f7f6f3; padding: 32px 16px;">
      <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: #1a6b5a; padding: 20px 24px; border-radius: 12px 12px 0 0;">
          <span style="color: white; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">overtaxed</span>
        </div>
        <div style="background: #ffffff; padding: 28px 24px; border: 1px solid #e2e2e0; border-top: none; border-radius: 0 0 12px 12px;">
          <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #1a1a1a;">
            How did your protest go? 🎯
          </h1>
          <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #666; margin-bottom: 24px; font-size: 15px;">
            It's been a few weeks since your ${jurisdiction.county} hearing. We'd love to know how it went — your experience helps us improve for everyone.
          </p>

          <div style="background: #f9fafb; border: 1px solid #e2e2e0; border-radius: 10px; padding: 20px; margin-bottom: 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <p style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; color: #333;">Just reply to this email with:</p>
            <div style="font-size: 14px; color: #555;">
              <p style="margin: 0 0 10px 0;"><strong>1.</strong> Did you get a reduction? (yes/no/pending)</p>
              <p style="margin: 0 0 10px 0;"><strong>2.</strong> If yes, roughly how much was the reduction?</p>
              <p style="margin: 0 0 10px 0;"><strong>3.</strong> How was the experience using our evidence packet?</p>
              <p style="margin: 0;"><strong>4.</strong> Would you recommend Overtaxed to a neighbor? (1-10)</p>
            </div>
          </div>

          <div style="background: #e8f4f0; border: 2px solid #1a6b5a; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #1a6b5a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong>🌟 Got a great result?</strong> We'd love to feature your story (anonymously) to help other homeowners in ${jurisdiction.county} know that protesting works. Just let us know in your reply!
            </p>
          </div>

          <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="margin: 0; font-size: 13px; color: #92400e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
              <strong>Didn't get the result you hoped for?</strong> Remember, you're covered by our money-back guarantee. Just reply and we'll take care of it — no questions asked.
            </p>
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 4px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            Thanks for trusting Overtaxed with your property tax protest. 🙏
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
    const now = Math.floor(Date.now() / 1000);
    const fortyFiveDaysAgo = now - 45 * 24 * 60 * 60;
    const fortyFourDaysAgo = now - 44 * 24 * 60 * 60;

    const sessions = await getStripe().checkout.sessions.list({
      limit: 100,
      created: {
        gte: fortyFiveDaysAgo,
        lt: fortyFourDaysAgo,
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

      if (session.metadata?.survey_sent === "true") {
        skipped++;
        continue;
      }

      const jurisdiction = getJurisdiction(clientRef);

      try {
        await getResend().emails.send({
          from: "Overtaxed <hello@getovertaxed.com>",
          to: email,
          subject: "How did your property tax protest go?",
          html: buildSurveyHtml(jurisdiction),
        });

        await getStripe().checkout.sessions.update(session.id, {
          metadata: {
            ...session.metadata,
            survey_sent: "true",
          },
        });

        sent++;
      } catch (err) {
        errors.push(`Failed to send to ${email}: ${err}`);
      }
    }

    console.log(`Outcome survey cron: sent=${sent}, skipped=${skipped}, errors=${errors.length}`);

    return NextResponse.json({
      success: true,
      sent,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Outcome survey cron error:", error);
    return NextResponse.json({ error: "Cron failed" }, { status: 500 });
  }
}
