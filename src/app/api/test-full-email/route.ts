/**
 * Test endpoint: Full email pipeline without Stripe
 * Usage: GET /api/test-full-email?pin=02142070370000&email=chatwithtiobot@gmail.com
 * 
 * Does the EXACT same flow as generate-appeal but skips Stripe session retrieval.
 * Returns detailed JSON at each step for debugging.
 */
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export const maxDuration = 60;
import { generateAccessToken, escapeHtml } from "@/lib/security";
import { generateCookAppealGuideHtml, type CookAppealGuideData } from "@/lib/appeal-guide-cook";
import { generateCookEvidenceHtml, type CookEvidenceData } from "@/lib/evidence-packet-cook";
import { generateCoverLetterHtml, type CoverLetterData } from "@/lib/cover-letter";
import { getReassessmentStatus } from "@/lib/cook-township-reassessment";
import { CosmosClient } from "@azure/cosmos";

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || "";
const PARCEL_API = "https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json";
const CHARACTERISTICS_API = "https://datacatalog.cookcountyil.gov/resource/bcnq-qi2z.json";
const ASSESSMENTS_API = "https://datacatalog.cookcountyil.gov/resource/uzyt-m557.json";

const CLASS_DESCRIPTIONS: Record<string, string> = {
  "202": "One-story residence, any age, up to 1,000 sq ft",
  "203": "One-story residence, any age, 1,001-1,800 sq ft",
  "204": "One-story residence, any age, over 1,800 sq ft",
  "205": "Two-story residence, up to 2,200 sq ft",
  "206": "Two-story residence, 2,201-4,999 sq ft",
  "207": "Two-story residence, over 5,000 sq ft",
  "208": "Split-level or tri-level residence",
  "209": "One-story residence with attic, any age",
  "210": "Old style row house",
  "211": "Two to six apartments, any age",
  "212": "Mixed commercial/residential, 6 units or fewer",
  "218": "Coach house/granny flat",
  "234": "Split-level residence",
  "278": "Two-story with basement apartment",
  "295": "Townhouse/row house",
};

const EXT_WALL: Record<string, string> = {
  "1": "Wood", "2": "Masonry", "3": "Wood & Masonry",
  "4": "Stucco", "5": "Other",
};

let resend: Resend | null = null;
function getResend() {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY);
  return resend;
}

let cosmosClient: CosmosClient | null = null;
function getCosmosClient() {
  if (!cosmosClient && process.env.COSMOS_CONNECTION_STRING) {
    cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  }
  return cosmosClient;
}

interface StepResult {
  step: string;
  status: "ok" | "error";
  durationMs: number;
  detail?: any;
  error?: string;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pin = searchParams.get("pin");
  const email = searchParams.get("email");
  const skipEmail = searchParams.get("skip_email") === "true";
  const skipPdf = searchParams.get("skip_pdf") === "true";

  if (!pin) {
    return NextResponse.json({ error: "Missing ?pin= parameter" }, { status: 400 });
  }

  const steps: StepResult[] = [];
  let t0: number;

  // ── Step 1: Fetch property data via lookup API (same as generate-appeal) ──
  let propertyData: any = null;
  t0 = Date.now();
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://www.getovertaxed.com";
    const lookupRes = await fetch(`${baseUrl}/api/lookup?pin=${pin}`);
    if (!lookupRes.ok) {
      throw new Error(`Lookup returned ${lookupRes.status}: ${await lookupRes.text().catch(() => "")}`);
    }
    const lookupData = await lookupRes.json();
    if (!lookupData.property) throw new Error("No property in lookup response");
    steps.push({ step: "1-lookup", status: "ok", durationMs: Date.now() - t0, detail: { address: lookupData.property.address, township: lookupData.property.township } });

    // Fetch characteristics + assessment history + comps (same as getPropertyData)
    const prop = lookupData.property;
    const analysis = prop.analysis || {};
    const assessment = prop.assessment || {};

    // Fetch characteristics from Cook County
    t0 = Date.now();
    const charsRes = await fetch(`${CHARACTERISTICS_API}?pin=${pin}&$order=tax_year%20DESC&$limit=1`);
    const charsArr = charsRes.ok ? await charsRes.json() : [];
    const chars = charsArr[0] || null;
    steps.push({ step: "2-characteristics", status: "ok", durationMs: Date.now() - t0, detail: chars ? { class: chars.class, bldg_sf: chars.bldg_sf, beds: chars.beds } : "null" });

    // Fetch assessment history
    t0 = Date.now();
    const histRes = await fetch(`${ASSESSMENTS_API}?pin=${pin}&$order=year%20DESC&$limit=5&$where=mailed_tot%20IS%20NOT%20NULL`);
    const assessmentHistory = histRes.ok ? await histRes.json() : [];
    steps.push({ step: "3-assessment-history", status: "ok", durationMs: Date.now() - t0, detail: { count: assessmentHistory.length } });

    // Fetch comp PINs from Cosmos
    t0 = Date.now();
    let compPins: string[] = [];
    const client = getCosmosClient();
    if (client) {
      const container = client.database("overtaxed").container("properties");
      const { resource: mainProp } = await container.item(pin, pin).read();
      if (mainProp?.nbhd) {
        const mainPerSqft = mainProp.sqft > 0 ? mainProp.current_assessment / mainProp.sqft : 0;
        const { resources } = await container.items.query({
          query: `SELECT TOP 20 c.id, c.sqft, c.beds, c.current_assessment FROM c WHERE c.nbhd = @nbhd AND c.id != @pin AND c.sqft > 0 AND (c.current_assessment / c.sqft) < @perSqft`,
          parameters: [
            { name: "@nbhd", value: mainProp.nbhd },
            { name: "@pin", value: pin },
            { name: "@perSqft", value: mainPerSqft },
          ],
        }).fetchAll();
        const targetSqft = mainProp.sqft || 0;
        resources.sort((a: any, b: any) => Math.abs(a.sqft - targetSqft) - Math.abs(b.sqft - targetSqft));
        compPins = resources.map((c: any) => c.id);
      }
    }
    steps.push({ step: "4-comp-pins", status: "ok", durationMs: Date.now() - t0, detail: { count: compPins.length, first3: compPins.slice(0, 3) } });

    // Enrich comps
    t0 = Date.now();
    const enrichedComps = await Promise.all(compPins.map(async (cPin) => {
      try {
        const [cChars, cAssess, cAddr] = await Promise.all([
          fetch(`${CHARACTERISTICS_API}?pin=${cPin}&$order=tax_year%20DESC&$limit=1`).then(r => r.ok ? r.json() : []).then(d => d[0] || null),
          fetch(`${ASSESSMENTS_API}?pin=${cPin}&$order=year%20DESC&$limit=1&$where=mailed_tot%20IS%20NOT%20NULL`).then(r => r.ok ? r.json() : []).then(d => d[0] || null),
          fetch(`${PARCEL_API}?pin=${cPin}&$limit=1`).then(r => r.ok ? r.json() : []).then(d => d[0]?.property_address || "N/A"),
        ]);
        if (!cAssess?.mailed_tot) return null;
        const sqft = parseInt(cChars?.bldg_sf || "0") || 0;
        const assessmentTotal = parseFloat(cAssess.mailed_tot) || 0;
        return {
          pin: cPin, address: cAddr, classCode: cChars?.class || cAssess?.class || "",
          sqft, totalSqft: parseInt(cChars?.total_bldg_sf || cChars?.bldg_sf || "0") || 0,
          beds: parseInt(cChars?.beds || "0") || 0, fbath: parseInt(cChars?.fbath || "0") || 0,
          hbath: parseInt(cChars?.hbath || "0") || 0,
          yearBuilt: cChars?.age ? (new Date().getFullYear() - parseInt(cChars.age)) : 0,
          age: parseInt(cChars?.age || "0") || 0,
          extWall: EXT_WALL[cChars?.ext_wall || ""] || "Unknown",
          rooms: parseInt(cChars?.rooms || "0") || 0,
          assessmentTotal, assessmentBldg: parseFloat(cAssess.mailed_bldg) || 0,
          assessmentLand: parseFloat(cAssess.mailed_land) || 0,
          perSqft: sqft > 0 ? assessmentTotal / sqft : 0,
        };
      } catch { return null; }
    }));

    const subjectClass = chars?.class || "";
    let validComps = enrichedComps
      .filter((c): c is NonNullable<typeof c> => c !== null && c.sqft > 0 && c.perSqft > 0)
      .sort((a, b) => a.perSqft - b.perSqft);
    const sameClassComps = validComps.filter(c => c.classCode === subjectClass);
    if (sameClassComps.length >= 5) validComps = sameClassComps.slice(0, 9);
    else validComps = validComps.slice(0, 9);
    steps.push({ step: "5-enrich-comps", status: "ok", durationMs: Date.now() - t0, detail: { enriched: enrichedComps.filter(Boolean).length, valid: validComps.length } });

    // Build property data object
    const sqft = parseInt(chars?.bldg_sf || "0") || prop.characteristics?.buildingSqFt || 0;
    const totalSqft = parseInt(chars?.total_bldg_sf || "0") || sqft;
    const landSqft = parseInt(chars?.hd_sf || "0") || 0;
    const currentAssessment = assessment.mailedTotal || 0;
    const currentBldg = assessment.mailedBuilding || 0;
    const currentLand = assessment.mailedLand || 0;
    const fairAssessment = analysis.fairAssessment || currentAssessment;
    const reduction = currentAssessment - fairAssessment;
    const savings = Math.round(reduction * 0.20);
    const perSqft = sqft > 0 ? currentAssessment / sqft : 0;
    const fairPerSqft = sqft > 0 ? fairAssessment / sqft : 0;
    const overAssessedPct = currentAssessment > 0 ? Math.round((reduction / currentAssessment) * 100) : 0;
    const compPerSqfts = validComps.map(c => c.perSqft);
    const compMedianPerSqft = compPerSqfts.length > 0 ? compPerSqfts[Math.floor(compPerSqfts.length / 2)] : 0;
    const compAvgPerSqft = compPerSqfts.length > 0 ? compPerSqfts.reduce((a, b) => a + b, 0) / compPerSqfts.length : 0;
    const yearBuilt = chars?.age ? (new Date().getFullYear() - parseInt(chars.age)) : (prop.characteristics?.yearBuilt || 0);

    propertyData = {
      pin, address: prop.address || "", city: prop.city || "CHICAGO", zip: prop.zip || "",
      township: prop.township || "", neighborhood: chars?.nbhd || prop.neighborhood || "",
      classCode: subjectClass,
      classDescription: CLASS_DESCRIPTIONS[subjectClass] || `Class ${subjectClass}`,
      sqft, totalSqft, landSqft,
      beds: parseInt(chars?.beds || "0") || prop.characteristics?.bedrooms || 0,
      fbath: parseInt(chars?.fbath || "0") || 0, hbath: parseInt(chars?.hbath || "0") || 0,
      rooms: parseInt(chars?.rooms || "0") || 0, yearBuilt, age: parseInt(chars?.age || "0") || 0,
      extWall: EXT_WALL[chars?.ext_wall || ""] || "Unknown",
      currentAssessment, currentBldg, currentLand, fairAssessment, reduction, savings,
      perSqft, fairPerSqft,
      assessmentHistory: assessmentHistory.map((a: any) => ({
        year: a.year, mailedTotal: parseFloat(a.mailed_tot) || 0,
        certifiedTotal: a.certified_tot ? parseFloat(a.certified_tot) : null,
        boardTotal: a.board_tot ? parseFloat(a.board_tot) : null,
      })),
      comps: validComps, compMedianPerSqft, compAvgPerSqft, overAssessedPct,
    };

    steps.push({ step: "6-property-data", status: "ok", durationMs: 0, detail: {
      address: propertyData.address, township: propertyData.township, currentAssessment,
      fairAssessment, savings, comps: validComps.length, perSqft: perSqft.toFixed(2),
    }});
  } catch (err: any) {
    steps.push({ step: "property-data", status: "error", durationMs: Date.now() - t0, error: err?.message || String(err), detail: err?.stack?.split("\n").slice(0, 5) });
    return NextResponse.json({ steps, error: "Failed at property data stage" });
  }

  // ── Step 7: Build HTML for 3 documents ──
  let appealGuideHtml = "", evidenceHtml = "", coverLetterHtml = "";

  // Appeal Guide
  t0 = Date.now();
  try {
    const formattedPin = pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
    const reassessment = getReassessmentStatus(propertyData.township) || {
      district: 'City of Chicago' as const,
      reassessmentYear: 2024, nextReassessmentYear: 2027,
      isReassessmentYear: false, yearsUntilNext: 1, savingsMultiplier: 1,
      message: 'Reductions are possible at the Board of Review.',
    };
    const topCompPins = propertyData.comps.slice(0, 5).map((c: any) => c.pin);
    const notesForFiling = `<p>I am filing this appeal on the grounds of LACK OF UNIFORMITY.</p><p>My property at ${escapeHtml(propertyData.address)} (PIN: ${formattedPin}), Class ${propertyData.classCode}...</p>`;

    const guideData: CookAppealGuideData = {
      address: propertyData.address, pin, township: propertyData.township,
      currentAssessment: propertyData.currentAssessment, fairAssessment: propertyData.fairAssessment,
      estimatedSavings: propertyData.savings, overAssessedPct: propertyData.overAssessedPct,
      perSqft: propertyData.perSqft, compMedianPerSqft: propertyData.compMedianPerSqft,
      compCount: propertyData.comps.length, notesForFiling, topCompPins, reassessment,
    };
    appealGuideHtml = generateCookAppealGuideHtml(guideData);
    steps.push({ step: "7a-appeal-guide-html", status: "ok", durationMs: Date.now() - t0, detail: { htmlLength: appealGuideHtml.length } });
  } catch (err: any) {
    steps.push({ step: "7a-appeal-guide-html", status: "error", durationMs: Date.now() - t0, error: err?.message || String(err), detail: err?.stack?.split("\n").slice(0, 5) });
    return NextResponse.json({ steps, error: "Appeal Guide HTML generation crashed" });
  }

  // Evidence Packet
  t0 = Date.now();
  try {
    const evidenceData: CookEvidenceData = {
      pin, address: propertyData.address, township: propertyData.township,
      neighborhood: propertyData.neighborhood, classCode: propertyData.classCode,
      classDescription: propertyData.classDescription, sqft: propertyData.sqft,
      totalSqft: propertyData.totalSqft, landSqft: propertyData.landSqft,
      beds: propertyData.beds, fbath: propertyData.fbath, hbath: propertyData.hbath,
      yearBuilt: propertyData.yearBuilt, extWall: propertyData.extWall,
      rooms: propertyData.rooms, currentBldg: propertyData.currentBldg,
      currentLand: propertyData.currentLand, currentAssessment: propertyData.currentAssessment,
      fairAssessment: propertyData.fairAssessment, reduction: propertyData.reduction,
      savings: propertyData.savings, perSqft: propertyData.perSqft,
      fairPerSqft: propertyData.fairPerSqft, overAssessedPct: propertyData.overAssessedPct,
      compMedianPerSqft: propertyData.compMedianPerSqft, compAvgPerSqft: propertyData.compAvgPerSqft,
      comps: propertyData.comps, assessmentHistory: propertyData.assessmentHistory,
      topCompPins: propertyData.comps.slice(0, 5).map((c: any) => c.pin),
    };
    evidenceHtml = generateCookEvidenceHtml(evidenceData);
    steps.push({ step: "7b-evidence-html", status: "ok", durationMs: Date.now() - t0, detail: { htmlLength: evidenceHtml.length } });
  } catch (err: any) {
    steps.push({ step: "7b-evidence-html", status: "error", durationMs: Date.now() - t0, error: err?.message || String(err), detail: err?.stack?.split("\n").slice(0, 5) });
    return NextResponse.json({ steps, error: "Evidence HTML generation crashed" });
  }

  // Cover Letter
  t0 = Date.now();
  try {
    const coverData: CoverLetterData = {
      ownerName: "Property Owner", address: propertyData.address, acct: pin,
      county: "Cook", state: "IL", filingBody: "CCAO",
      filingBodyFull: "Cook County Assessor's Office",
      currentAssessment: propertyData.currentAssessment,
      fairAssessment: propertyData.fairAssessment,
      overAssessedPct: propertyData.overAssessedPct,
      compCount: propertyData.comps.length,
      compMedianPerSqft: propertyData.compMedianPerSqft,
      perSqft: propertyData.perSqft, taxYear: "2025",
    };
    coverLetterHtml = generateCoverLetterHtml(coverData);
    steps.push({ step: "7c-cover-letter-html", status: "ok", durationMs: Date.now() - t0, detail: { htmlLength: coverLetterHtml.length } });
  } catch (err: any) {
    steps.push({ step: "7c-cover-letter-html", status: "error", durationMs: Date.now() - t0, error: err?.message || String(err), detail: err?.stack?.split("\n").slice(0, 5) });
    return NextResponse.json({ steps, error: "Cover Letter HTML generation crashed" });
  }

  if (skipPdf) {
    return NextResponse.json({ steps, message: "Stopped before PDF generation (skip_pdf=true)", htmlSizes: { appealGuide: appealGuideHtml.length, evidence: evidenceHtml.length, coverLetter: coverLetterHtml.length } });
  }

  // ── Step 8: Generate PDFs ──
  let appealGuidePdf: Buffer, evidencePdf: Buffer, coverLetterPdf: Buffer;
  t0 = Date.now();
  try {
    const generatePdf = async (html: string, label: string): Promise<Buffer> => {
      const pdfT0 = Date.now();
      const response = await fetch(`https://production-sfo.browserless.io/pdf?token=${BROWSERLESS_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Cache-Control": "no-cache" },
        body: JSON.stringify({
          html, options: { format: "Letter", printBackground: true, margin: { top: "0.4in", right: "0.4in", bottom: "0.4in", left: "0.4in" } },
        }),
      });
      if (!response.ok) {
        const errText = await response.text().catch(() => "");
        throw new Error(`Browserless ${label}: ${response.status} - ${errText.slice(0, 200)}`);
      }
      const buf = Buffer.from(await response.arrayBuffer());
      console.log(`[test-full-email] PDF ${label}: ${buf.length} bytes in ${Date.now() - pdfT0}ms`);
      return buf;
    };

    [appealGuidePdf, evidencePdf, coverLetterPdf] = await Promise.all([
      generatePdf(appealGuideHtml, "appeal-guide"),
      generatePdf(evidenceHtml, "evidence"),
      generatePdf(coverLetterHtml, "cover-letter"),
    ]);
    steps.push({ step: "8-pdfs", status: "ok", durationMs: Date.now() - t0, detail: {
      appealGuideBytes: appealGuidePdf.length, evidenceBytes: evidencePdf.length, coverLetterBytes: coverLetterPdf.length,
      totalBytes: appealGuidePdf.length + evidencePdf.length + coverLetterPdf.length,
    }});
  } catch (err: any) {
    steps.push({ step: "8-pdfs", status: "error", durationMs: Date.now() - t0, error: err?.message || String(err), detail: err?.stack?.split("\n").slice(0, 5) });
    return NextResponse.json({ steps, error: "PDF generation failed" });
  }

  if (skipEmail || !email) {
    return NextResponse.json({ steps, message: skipEmail ? "Stopped before email (skip_email=true)" : "No email provided", pdfSizes: { appealGuide: appealGuidePdf!.length, evidence: evidencePdf!.length, coverLetter: coverLetterPdf!.length } });
  }

  // ── Step 9: Send email ──
  t0 = Date.now();
  try {
    const formattedPin = pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
    const result = await getResend().emails.send({
      from: "Overtaxed <hello@getovertaxed.com>",
      to: email,
      subject: `[TEST] Cook County Appeal Package — ${propertyData.address}`,
      html: `<p>Test email for PIN ${formattedPin}. 3 PDFs attached (${(appealGuidePdf!.length + evidencePdf!.length + coverLetterPdf!.length).toLocaleString()} bytes total).</p>`,
      attachments: [
        { filename: `appeal-guide-${formattedPin}.pdf`, content: appealGuidePdf!.toString("base64") },
        { filename: `cover-letter-${formattedPin}.pdf`, content: coverLetterPdf!.toString("base64") },
        { filename: `evidence-packet-${formattedPin}.pdf`, content: evidencePdf!.toString("base64") },
      ],
    });
    steps.push({ step: "9-email", status: "ok", durationMs: Date.now() - t0, detail: { to: email, resendResult: result } });
  } catch (err: any) {
    steps.push({ step: "9-email", status: "error", durationMs: Date.now() - t0, error: err?.message || String(err), detail: err?.stack?.split("\n").slice(0, 5) });
    return NextResponse.json({ steps, error: "Email sending failed" });
  }

  return NextResponse.json({ steps, success: true, message: `Full pipeline completed. Email sent to ${email}.` });
}
