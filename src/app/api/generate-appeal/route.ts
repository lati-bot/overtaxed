import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { generateAccessToken as _genToken, verifyAccessToken as _verToken, escapeHtml } from "@/lib/security";
import { generateCookQuickStartHtml, type CookQuickStartData } from "@/lib/quick-start-guide-cook";
import { generateCookEvidenceHtml, type CookEvidenceData } from "@/lib/evidence-packet-cook";
import { generateCoverLetterHtml, type CoverLetterData } from "@/lib/cover-letter";

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

// Cook County API endpoints
const PARCEL_API = "https://datacatalog.cookcountyil.gov/resource/c49d-89sn.json";
const CHARACTERISTICS_API = "https://datacatalog.cookcountyil.gov/resource/bcnq-qi2z.json";
const ASSESSMENTS_API = "https://datacatalog.cookcountyil.gov/resource/uzyt-m557.json";

// Cosmos DB
import { CosmosClient } from "@azure/cosmos";
let cosmosClient: CosmosClient | null = null;
function getCosmosClient() {
  if (!cosmosClient && process.env.COSMOS_CONNECTION_STRING) {
    cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  }
  return cosmosClient;
}

// Property class code descriptions
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

// Exterior wall descriptions
const EXT_WALL: Record<string, string> = {
  "1": "Wood", "2": "Masonry", "3": "Wood & Masonry",
  "4": "Stucco", "5": "Other",
};

interface CompProperty {
  pin: string;
  address: string;
  classCode: string;
  sqft: number;
  totalSqft: number;
  beds: number;
  fbath: number;
  hbath: number;
  yearBuilt: number;
  age: number;
  extWall: string;
  rooms: number;
  assessmentTotal: number;
  assessmentBldg: number;
  assessmentLand: number;
  perSqft: number;
}

interface PropertyData {
  pin: string;
  address: string;
  city: string;
  zip: string;
  township: string;
  neighborhood: string;
  classCode: string;
  classDescription: string;
  sqft: number;
  totalSqft: number;
  landSqft: number;
  beds: number;
  fbath: number;
  hbath: number;
  rooms: number;
  yearBuilt: number;
  age: number;
  extWall: string;
  currentAssessment: number;
  currentBldg: number;
  currentLand: number;
  fairAssessment: number;
  reduction: number;
  savings: number;
  perSqft: number;
  fairPerSqft: number;
  assessmentHistory: Array<{
    year: string;
    mailedTotal: number;
    certifiedTotal: number | null;
    boardTotal: number | null;
  }>;
  comps: CompProperty[];
  compMedianPerSqft: number;
  compAvgPerSqft: number;
  overAssessedPct: number;
}

// Fetch characteristics for a PIN from Cook County
async function fetchCharacteristics(pin: string): Promise<any> {
  try {
    const url = `${CHARACTERISTICS_API}?pin=${pin}&$order=tax_year%20DESC&$limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] || null;
  } catch {
    return null;
  }
}

// Fetch latest assessment for a PIN from Cook County
async function fetchAssessment(pin: string): Promise<any> {
  try {
    const url = `${ASSESSMENTS_API}?pin=${pin}&$order=year%20DESC&$limit=1&$where=mailed_tot%20IS%20NOT%20NULL`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data[0] || null;
  } catch {
    return null;
  }
}

// Fetch assessment history for subject property
async function fetchAssessmentHistory(pin: string): Promise<any[]> {
  try {
    const url = `${ASSESSMENTS_API}?pin=${pin}&$order=year%20DESC&$limit=5&$where=mailed_tot%20IS%20NOT%20NULL`;
    const res = await fetch(url);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

// Fetch address for a PIN from Cook County parcel data
async function fetchAddress(pin: string): Promise<string> {
  try {
    const url = `${PARCEL_API}?pin=${pin}&$limit=1`;
    const res = await fetch(url);
    if (!res.ok) return "N/A";
    const data = await res.json();
    return data[0]?.property_address || "N/A";
  } catch {
    return "N/A";
  }
}

// Get comp PINs from Cosmos
async function getCompPins(pin: string): Promise<string[]> {
  const client = getCosmosClient();
  if (!client) return [];
  
  try {
    const container = client.database("overtaxed").container("properties");
    const { resource: mainProp } = await container.item(pin, pin).read();
    
    if (!mainProp?.nbhd) return [];
    
    const mainPerSqft = mainProp.sqft > 0 ? mainProp.current_assessment / mainProp.sqft : 0;
    
    // Get 20 comps (we'll sort by sqft similarity and filter to best 9 after enrichment)
    const { resources } = await container.items.query({
      query: `SELECT TOP 20 c.id, c.sqft, c.beds, c.current_assessment
              FROM c 
              WHERE c.nbhd = @nbhd 
              AND c.id != @pin 
              AND c.sqft > 0 
              AND (c.current_assessment / c.sqft) < @perSqft`,
      parameters: [
        { name: "@nbhd", value: mainProp.nbhd },
        { name: "@pin", value: pin },
        { name: "@perSqft", value: mainPerSqft },
      ],
    }).fetchAll();
    
    // Sort by sqft similarity client-side (Cosmos doesn't support ORDER BY ABS())
    const targetSqft = mainProp.sqft || 0;
    resources.sort((a: any, b: any) => Math.abs(a.sqft - targetSqft) - Math.abs(b.sqft - targetSqft));
    
    return resources.map((c: any) => c.id);
  } catch (err) {
    console.error("[getCompPins] Error:", err);
    return [];
  }
}

// Enrich a comp PIN with full data from Cook County APIs
async function enrichCompPin(pin: string): Promise<CompProperty | null> {
  try {
    const [chars, assessment, address] = await Promise.all([
      fetchCharacteristics(pin),
      fetchAssessment(pin),
      fetchAddress(pin),
    ]);
    
    if (!assessment?.mailed_tot) return null;
    
    const sqft = parseInt(chars?.bldg_sf || "0") || 0;
    const totalSqft = parseInt(chars?.total_bldg_sf || chars?.bldg_sf || "0") || 0;
    const assessmentTotal = parseFloat(assessment.mailed_tot) || 0;
    
    return {
      pin,
      address: address || "N/A",
      classCode: chars?.class || assessment?.class || "",
      sqft,
      totalSqft,
      beds: parseInt(chars?.beds || "0") || 0,
      fbath: parseInt(chars?.fbath || "0") || 0,
      hbath: parseInt(chars?.hbath || "0") || 0,
      yearBuilt: chars?.age ? (new Date().getFullYear() - parseInt(chars.age)) : 0,
      age: parseInt(chars?.age || "0") || 0,
      extWall: EXT_WALL[chars?.ext_wall || ""] || "Unknown",
      rooms: parseInt(chars?.rooms || "0") || 0,
      assessmentTotal,
      assessmentBldg: parseFloat(assessment.mailed_bldg) || 0,
      assessmentLand: parseFloat(assessment.mailed_land) || 0,
      perSqft: sqft > 0 ? assessmentTotal / sqft : 0,
    };
  } catch {
    return null;
  }
}

async function getPropertyData(pin: string): Promise<PropertyData | null> {
  try {
    console.log(`[getPropertyData] Starting for PIN: ${pin}`);
    
    // Fetch all data in parallel
    const [chars, assessmentHistory, compPins] = await Promise.all([
      fetchCharacteristics(pin),
      fetchAssessmentHistory(pin),
      getCompPins(pin),
    ]);
    
    // Also get parcel info for address
    const baseUrl = "https://www.getovertaxed.com";
    const lookupRes = await fetch(`${baseUrl}/api/lookup?pin=${pin}`);
    if (!lookupRes.ok) return null;
    const lookupData = await lookupRes.json();
    if (!lookupData.property) return null;
    
    const prop = lookupData.property;
    const analysis = prop.analysis || {};
    const assessment = prop.assessment || {};
    
    // Enrich comp PINs with full Cook County data (parallel, batched)
    console.log(`[getPropertyData] Enriching ${compPins.length} comps...`);
    const enrichedComps = await Promise.all(compPins.map(enrichCompPin));
    
    // Filter to valid comps with same class code, then take best 9
    const subjectClass = chars?.class || "";
    let validComps = enrichedComps
      .filter((c): c is CompProperty => c !== null && c.sqft > 0 && c.perSqft > 0)
      .sort((a, b) => a.perSqft - b.perSqft); // Lowest $/sqft first (strongest evidence)
    
    // Prefer same class code, but fall back to all if not enough
    const sameClassComps = validComps.filter(c => c.classCode === subjectClass);
    if (sameClassComps.length >= 5) {
      validComps = sameClassComps.slice(0, 9);
    } else {
      validComps = validComps.slice(0, 9);
    }
    
    // Calculate stats
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
    const compMedianPerSqft = compPerSqfts.length > 0 
      ? compPerSqfts[Math.floor(compPerSqfts.length / 2)] 
      : 0;
    const compAvgPerSqft = compPerSqfts.length > 0
      ? compPerSqfts.reduce((a, b) => a + b, 0) / compPerSqfts.length
      : 0;
    
    const yearBuilt = chars?.age ? (new Date().getFullYear() - parseInt(chars.age)) : (prop.characteristics?.yearBuilt || 0);
    
    console.log(`[getPropertyData] Done: ${validComps.length} comps, $${currentAssessment} assessment, $${savings} savings`);
    
    return {
      pin,
      address: prop.address || "",
      city: prop.city || "CHICAGO",
      zip: prop.zip || "",
      township: prop.township || "",
      neighborhood: chars?.nbhd || prop.neighborhood || "",
      classCode: subjectClass,
      classDescription: CLASS_DESCRIPTIONS[subjectClass] || `Class ${subjectClass}`,
      sqft,
      totalSqft,
      landSqft,
      beds: parseInt(chars?.beds || "0") || prop.characteristics?.bedrooms || 0,
      fbath: parseInt(chars?.fbath || "0") || 0,
      hbath: parseInt(chars?.hbath || "0") || 0,
      rooms: parseInt(chars?.rooms || "0") || 0,
      yearBuilt,
      age: parseInt(chars?.age || "0") || 0,
      extWall: EXT_WALL[chars?.ext_wall || ""] || "Unknown",
      currentAssessment,
      currentBldg,
      currentLand,
      fairAssessment,
      reduction,
      savings,
      perSqft,
      fairPerSqft,
      assessmentHistory: assessmentHistory.map(a => ({
        year: a.year,
        mailedTotal: parseFloat(a.mailed_tot) || 0,
        certifiedTotal: a.certified_tot ? parseFloat(a.certified_tot) : null,
        boardTotal: a.board_tot ? parseFloat(a.board_tot) : null,
      })),
      comps: validComps,
      compMedianPerSqft,
      compAvgPerSqft,
      overAssessedPct,
    };
  } catch (error) {
    console.error("[getPropertyData] Error:", error);
    return null;
  }
}

function generatePdfHtml(data: PropertyData): string {
  const formattedPin = data.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  
  const compsHtml = data.comps.map((c, i) => {
    const formattedCompPin = c.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
    return `
    <tr>
      <td class="comp-num">${i + 1}</td>
      <td>
        <div class="comp-address">${escapeHtml(c.address)}</div>
        <div class="comp-pin">${formattedCompPin}</div>
      </td>
      <td class="right">${c.classCode}</td>
      <td class="right">${c.sqft.toLocaleString()}</td>
      <td class="right">${c.beds}/${c.fbath}${c.hbath ? `.${c.hbath}` : ""}</td>
      <td class="right">${c.extWall}</td>
      <td class="right">${c.yearBuilt || "—"}</td>
      <td class="right">$${c.assessmentBldg.toLocaleString()}</td>
      <td class="right">$${c.assessmentLand.toLocaleString()}</td>
      <td class="right">$${c.assessmentTotal.toLocaleString()}</td>
      <td class="right highlight">$${c.perSqft.toFixed(2)}</td>
    </tr>`;
  }).join("");

  // Assessment history rows
  const historyHtml = data.assessmentHistory.map(h => `
    <tr>
      <td>${h.year}</td>
      <td class="right">$${h.mailedTotal.toLocaleString()}</td>
      <td class="right">${h.certifiedTotal !== null ? "$" + h.certifiedTotal.toLocaleString() : "—"}</td>
      <td class="right">${h.boardTotal !== null ? "$" + h.boardTotal.toLocaleString() : "—"}</td>
    </tr>
  `).join("");

  // Generate the uniformity brief
  const brief = generateBrief(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Board of Review Appeal — Lack of Uniformity — ${escapeHtml(data.address)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    @page { size: Letter; margin: 0.6in 0.65in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; line-height: 1.45; color: #1a1a1a; background: #fff; }
    .page { max-width: 8.5in; margin: 0 auto; padding: 0; }
    
    /* Header */
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 3px solid #1a6b5a; }
    .header-left .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #1a6b5a; }
    .header-left .subtitle { font-size: 10px; color: #666; margin-top: 2px; letter-spacing: 1px; text-transform: uppercase; }
    .header-right { text-align: right; font-size: 10px; color: #666; }
    .header-right .date { font-weight: 600; color: #1a1a1a; }
    
    /* Title block */
    .title-block { background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
    .appeal-type { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-bottom: 6px; font-weight: 600; }
    .property-address { font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
    .property-meta { font-size: 11px; color: #555; }
    .property-meta span { margin-right: 16px; }
    
    /* Summary cards */
    .summary-row { display: flex; gap: 12px; margin-bottom: 20px; }
    .summary-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
    .summary-card.alert { border-color: #b45309; background: #fffbeb; }
    .summary-card.success { border-color: #1a6b5a; background: #e8f4f0; }
    .summary-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 4px; font-weight: 600; }
    .summary-value { font-size: 22px; font-weight: 700; }
    .summary-card.alert .summary-value { color: #b45309; }
    .summary-card.success .summary-value { color: #1a6b5a; }
    .summary-detail { font-size: 10px; color: #666; margin-top: 2px; }
    
    /* Assessment breakdown */
    .breakdown-row { display: flex; gap: 12px; margin-bottom: 20px; }
    .breakdown-card { flex: 1; }
    .breakdown-card h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 8px; }
    .breakdown-table { width: 100%; border-collapse: collapse; }
    .breakdown-table td { padding: 5px 8px; font-size: 11px; border-bottom: 1px solid #f0f0f0; }
    .breakdown-table td:last-child { text-align: right; font-weight: 600; }
    .breakdown-table tr:last-child td { border-bottom: 2px solid #1a6b5a; font-weight: 700; }
    
    /* Section */
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: #1a6b5a; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    /* Brief */
    .brief { background: #f8f9fa; border-left: 4px solid #1a6b5a; padding: 14px 18px; margin-bottom: 20px; font-size: 11px; line-height: 1.6; color: #333; }
    .brief p { margin-bottom: 8px; }
    .brief p:last-child { margin-bottom: 0; }
    
    /* Comps table */
    .comps-table { width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 8px; }
    .comps-table th { background: #1a6b5a; color: #fff; padding: 7px 5px; text-align: left; font-weight: 600; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.5px; }
    .comps-table th.right, .comps-table td.right { text-align: right; }
    .comps-table td { padding: 6px 5px; border-bottom: 1px solid #e8e8e8; }
    .comps-table tr:nth-child(even) { background: #fafafa; }
    .comp-num { color: #999; font-weight: 600; width: 20px; }
    .comp-address { font-weight: 600; font-size: 10px; }
    .comp-pin { font-family: 'SF Mono', 'Consolas', monospace; font-size: 8.5px; color: #888; }
    .highlight { color: #1a6b5a; font-weight: 700; }
    
    /* Summary row at bottom of comps */
    .comps-summary { display: flex; gap: 20px; padding: 10px 0; border-top: 2px solid #1a6b5a; font-size: 10px; }
    .comps-summary-item { }
    .comps-summary-item .label { color: #666; font-size: 9px; text-transform: uppercase; }
    .comps-summary-item .value { font-weight: 700; font-size: 13px; color: #1a6b5a; }
    
    /* Subject highlight row */
    .comps-table tr.subject-row { background: #fffbeb; border: 2px solid #b45309; }
    .comps-table tr.subject-row td { font-weight: 600; color: #b45309; }
    
    /* Assessment history */
    .history-table { width: 100%; border-collapse: collapse; font-size: 10px; }
    .history-table th { background: #f8f9fa; padding: 6px 8px; text-align: left; font-weight: 600; font-size: 9px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    .history-table th.right { text-align: right; }
    .history-table td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
    .history-table td.right { text-align: right; }
    
    /* Filing steps */
    .steps { counter-reset: step; }
    .step { display: flex; margin-bottom: 14px; }
    .step-number { width: 24px; height: 24px; background: #1a6b5a; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; flex-shrink: 0; margin-right: 12px; margin-top: 1px; }
    .step-content { flex: 1; }
    .step-title { font-weight: 700; font-size: 11px; margin-bottom: 2px; }
    .step-desc { font-size: 10px; color: #555; line-height: 1.5; }
    .step-link { color: #2563eb; font-size: 10px; }
    
    /* Footer */
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 8.5px; color: #999; line-height: 1.5; }
    
    /* Page break helper */
    .page-break { page-break-before: always; }
    
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="page">
    <!-- Header -->
    <div class="header">
      <div class="header-left">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="28" height="28" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#1a6b5a"/>
            <circle cx="16" cy="15.5" r="8" fill="none" stroke="white" stroke-width="3.5"/>
          </svg>
          <div>
            <div class="logo">overtaxed</div>
            <div class="subtitle">Board of Review Appeal Evidence Package</div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="date">${today}</div>
        <div>Cook County, Illinois</div>
        <div>Filing Body: Board of Review</div>
        <div>Appeal Type: Lack of Uniformity</div>
      </div>
    </div>
    
    <!-- Title Block -->
    <div class="title-block">
      <div class="appeal-type">Subject Property</div>
      <div class="property-address">${escapeHtml(data.address)}</div>
      <div class="property-meta">
        <span><strong>PIN:</strong> ${formattedPin}</span>
        <span><strong>Township:</strong> ${escapeHtml(data.township)}</span>
        <span><strong>Neighborhood:</strong> ${escapeHtml(data.neighborhood)}</span>
        <span><strong>Class:</strong> ${data.classCode} — ${data.classDescription}</span>
      </div>
    </div>
    
    <!-- Summary Cards -->
    <div class="summary-row">
      <div class="summary-card alert">
        <div class="summary-label">Current Assessment</div>
        <div class="summary-value">$${data.currentAssessment.toLocaleString()}</div>
        <div class="summary-detail">$${data.perSqft.toFixed(2)}/sqft · ${data.overAssessedPct}% above comparable median</div>
      </div>
      <div class="summary-card success">
        <div class="summary-label">Fair Assessment (Based on Comparables)</div>
        <div class="summary-value">$${data.fairAssessment.toLocaleString()}</div>
        <div class="summary-detail">$${data.fairPerSqft.toFixed(2)}/sqft · Median of ${data.comps.length} comparable properties</div>
      </div>
      <div class="summary-card success">
        <div class="summary-label">Estimated Annual Tax Savings</div>
        <div class="summary-value">$${data.savings.toLocaleString()}</div>
        <div class="summary-detail">Based on assessment reduction of $${data.reduction.toLocaleString()}</div>
      </div>
    </div>
    
    <!-- Deadline Warning -->
    <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 14px 18px; font-size: 11px; line-height: 1.6; margin-bottom: 20px;">
      <p style="margin: 0;"><strong>⏰ Deadline:</strong> The Board of Review opens each township for approximately 30 days. Your township (<strong>${escapeHtml(data.township)}</strong>) must be open to file. Check <a href="https://www.cookcountyboardofreview.com" style="color: #2563eb;">cookcountyboardofreview.com</a> for your township's dates. Once your township opens, file immediately — you cannot file after it closes.</p>
    </div>
    
    <!-- Assessment Breakdown -->
    <div class="breakdown-row">
      <div class="breakdown-card">
        <h4>Subject Property Details</h4>
        <table class="breakdown-table">
          <tr><td>Building Sq Ft</td><td>${data.sqft.toLocaleString()}</td></tr>
          <tr><td>Total Sq Ft</td><td>${data.totalSqft.toLocaleString()}</td></tr>
          <tr><td>Land Sq Ft</td><td>${data.landSqft.toLocaleString()}</td></tr>
          <tr><td>Bedrooms / Baths</td><td>${data.beds} bed / ${data.fbath} full${data.hbath ? ` / ${data.hbath} half` : ""}</td></tr>
          <tr><td>Year Built</td><td>${data.yearBuilt || "N/A"}</td></tr>
          <tr><td>Exterior</td><td>${escapeHtml(data.extWall)}</td></tr>
          <tr><td>Rooms</td><td>${data.rooms}</td></tr>
        </table>
      </div>
      <div class="breakdown-card">
        <h4>Current Assessment Breakdown</h4>
        <table class="breakdown-table">
          <tr><td>Building Assessment</td><td>$${data.currentBldg.toLocaleString()}</td></tr>
          <tr><td>Land Assessment</td><td>$${data.currentLand.toLocaleString()}</td></tr>
          <tr><td>Total Assessment</td><td>$${data.currentAssessment.toLocaleString()}</td></tr>
        </table>
        <h4 style="margin-top: 12px;">Requested Assessment</h4>
        <table class="breakdown-table">
          <tr><td>Requested Total</td><td>$${data.fairAssessment.toLocaleString()}</td></tr>
          <tr><td>Reduction Amount</td><td>$${data.reduction.toLocaleString()}</td></tr>
        </table>
      </div>
    </div>
    
    <!-- Uniformity Brief -->
    <div class="section">
      <div class="section-title">Statement of Lack of Uniformity</div>
      <div class="brief">
        ${brief}
      </div>
    </div>
    
    <!-- Comparable Properties -->
    <div class="section">
      <div class="section-title">Comparable Properties Evidence</div>
      <p style="font-size: 10px; color: #555; margin-bottom: 10px;">The following ${data.comps.length} comparable properties are located within the same assessment neighborhood (${escapeHtml(data.neighborhood)}), share the same or similar property classification, and demonstrate that the subject property is assessed at a rate significantly above comparable properties on a per-square-foot basis.</p>
      
      <!-- Subject property row first -->
      <table class="comps-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Address / PIN</th>
            <th class="right">Class</th>
            <th class="right">Bldg SF</th>
            <th class="right">Bed/Bath</th>
            <th class="right">Ext.</th>
            <th class="right">Year</th>
            <th class="right">Bldg Asmt</th>
            <th class="right">Land Asmt</th>
            <th class="right">Total Asmt</th>
            <th class="right">$/SF</th>
          </tr>
        </thead>
        <tbody>
          <tr class="subject-row">
            <td class="comp-num">★</td>
            <td>
              <div class="comp-address">${escapeHtml(data.address)} (SUBJECT)</div>
              <div class="comp-pin">${formattedPin}</div>
            </td>
            <td class="right">${data.classCode}</td>
            <td class="right">${data.sqft.toLocaleString()}</td>
            <td class="right">${data.beds}/${data.fbath}${data.hbath ? `.${data.hbath}` : ""}</td>
            <td class="right">${escapeHtml(data.extWall)}</td>
            <td class="right">${data.yearBuilt || "—"}</td>
            <td class="right">$${data.currentBldg.toLocaleString()}</td>
            <td class="right">$${data.currentLand.toLocaleString()}</td>
            <td class="right">$${data.currentAssessment.toLocaleString()}</td>
            <td class="right" style="color: #b45309; font-weight: 700;">$${data.perSqft.toFixed(2)}</td>
          </tr>
          ${compsHtml}
        </tbody>
      </table>
      
      <div class="comps-summary">
        <div class="comps-summary-item">
          <div class="label">Subject $/SF</div>
          <div class="value" style="color: #b45309;">$${data.perSqft.toFixed(2)}</div>
        </div>
        <div class="comps-summary-item">
          <div class="label">Comp Median $/SF</div>
          <div class="value">$${data.compMedianPerSqft.toFixed(2)}</div>
        </div>
        <div class="comps-summary-item">
          <div class="label">Comp Average $/SF</div>
          <div class="value">$${data.compAvgPerSqft.toFixed(2)}</div>
        </div>
        <div class="comps-summary-item">
          <div class="label">Difference</div>
          <div class="value">$${(data.perSqft - data.compMedianPerSqft).toFixed(2)}/SF (${data.overAssessedPct}%)</div>
        </div>
      </div>
      
      <p style="font-size: 9.5px; color: #666; line-height: 1.5; margin-top: 8px; font-style: italic;">These comparable properties were selected based on proximity, neighborhood, size, and property classification. If the appraiser challenges a specific comparable, focus on the ones most similar to your property in age and size. Even 3–4 strong comps are sufficient to demonstrate unequal treatment.</p>
    </div>
    
    <!-- Assessment History -->
    ${data.assessmentHistory.length > 0 ? `
    <div class="section">
      <div class="section-title">Assessment History</div>
      <table class="history-table">
        <thead>
          <tr>
            <th>Tax Year</th>
            <th class="right">Mailed Assessment</th>
            <th class="right">Certified Assessment</th>
            <th class="right">Board of Review</th>
          </tr>
        </thead>
        <tbody>
          ${historyHtml}
        </tbody>
      </table>
    </div>
    ` : ""}
    
    <!-- BOARD OF REVIEW FILING INSTRUCTIONS -->
    <div class="section page-break">
      <div class="section-title">📋 How to File — Board of Review (Step by Step)</div>
      <p style="font-size: 10px; color: #555; margin-bottom: 14px; line-height: 1.6;">The Cook County Board of Review is your best opportunity for a property tax reduction. You can file as a guest — <strong>no account required</strong>. Follow these steps exactly:</p>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">Check if Your Township is Open</div>
            <div class="step-desc">Go to <span class="step-link">cookcountyboardofreview.com</span> and check the homepage. Your township (<strong>${escapeHtml(data.township)}</strong>) must show as "OPEN" to file. Each township opens for approximately 30 days after the Assessor closes.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">Click "Submit Appeal as Guest"</div>
            <div class="step-desc">On the Board of Review homepage, click <strong>"Submit Appeal as Guest"</strong> in the top menu. You do NOT need to create an account. Read the Terms of Use and click <strong>"I Agree"</strong>.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">Fill Out Page 1</div>
            <div class="step-desc">
              • <strong>Type of Appeal:</strong> Select <strong>"Property Over-Assessed"</strong><br/>
              • <strong>Property Index Number:</strong> Enter <strong style="font-family: monospace; background: #f0f0f0; padding: 1px 4px; border-radius: 3px;">${escapeHtml(data.pin)}</strong> (the system will auto-format it with dashes)<br/>
              • <strong>"Are you a registered Board of Review Attorney?"</strong> → Click <strong>"No"</strong><br/>
              • Complete the reCAPTCHA ("I'm not a robot")<br/>
              • Click <strong>"Next"</strong>
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <div class="step-title">Fill Out Page 2 — Your Information</div>
            <div class="step-desc">
              • <strong>Associated PINs:</strong> Select "No" unless you have multiple parcels for one property<br/>
              • Enter your <strong>name, address, phone, and email</strong> (this is YOUR info, not the property's)<br/>
              • <strong>Appellant Type:</strong> Select "Property Owner"<br/>
              • <strong>Request a Hearing?</strong> Select <strong>"No"</strong> — hearings are only for unique situations. Your written evidence is stronger.<br/>
              • <strong>Recent Purchase:</strong> If you bought in the last 3 years, select the year. Otherwise select "Other"<br/>
              • <strong>Notes:</strong> Copy and paste the text from the "Notes for Filing" section below. This is where you make your case.<br/>
              • Click <strong>"Next"</strong>
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">5</div>
          <div class="step-content">
            <div class="step-title">Page 3 — Review & Submit</div>
            <div class="step-desc">
              • Review all your information<br/>
              • <strong>Check the confirmation box</strong><br/>
              • <strong>Type your initials</strong> where prompted (this is your electronic signature)<br/>
              • Click <strong>"Submit"</strong>
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">6</div>
          <div class="step-content">
            <div class="step-title">Page 4 — Upload Evidence</div>
            <div class="step-desc">
              • When asked "Do you plan on submitting Evidence?" → Click <strong>"Yes"</strong><br/>
              • Click <strong>"Browse"</strong> and select <strong>this PDF file</strong><br/>
              • For Document Type, select <strong>"BOR Appraisal"</strong> from the dropdown<br/>
              • Click <strong>"Submit"</strong><br/>
              • <strong>IMPORTANT:</strong> Also upload a <strong>photo of the front of your property</strong> (required by Board Rule #17). Use your phone to take a clear photo showing the full front of the building.
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">7</div>
          <div class="step-content">
            <div class="step-title">Done! Save Your Complaint Number</div>
            <div class="step-desc">After submitting, you'll receive a <strong>BOR Complaint Number</strong>. Save this — it's your proof the appeal was filed. The Board typically responds within 90 days after the filing period closes for your township.</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- NOTES FOR FILING (copy-paste ready) -->
    <div class="section">
      <div class="section-title">📝 Notes for Filing — Copy & Paste Into Board of Review Form</div>
      <p style="font-size: 10px; color: #555; margin-bottom: 10px;">Copy the text below and paste it into the "Notes" field on Page 2 of the Board of Review appeal form:</p>
      <div style="background: #f8f9fa; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 16px 18px; font-size: 10px; line-height: 1.7; color: #333; font-family: 'Georgia', serif;">
        <p style="margin-bottom: 8px;">I am filing this appeal on the grounds of LACK OF UNIFORMITY.</p>
        <p style="margin-bottom: 8px;">My property at ${escapeHtml(data.address)} (PIN: ${formattedPin}), Class ${data.classCode}, is currently assessed at $${data.currentAssessment.toLocaleString()} total ($${data.perSqft.toFixed(2)}/sq ft of building area).</p>
        <p style="margin-bottom: 8px;">An analysis of ${data.comps.length} comparable properties in Assessment Neighborhood ${escapeHtml(data.neighborhood)} shows a median assessment of $${data.compMedianPerSqft.toFixed(2)}/sq ft — my property is assessed ${data.overAssessedPct}% above comparable properties.</p>
        <p style="margin-bottom: 8px;">Comparable PINs (all Class ${data.classCode}, Neighborhood ${escapeHtml(data.neighborhood)}):</p>
        <p style="margin-bottom: 8px; font-family: monospace; font-size: 9px;">${data.comps.map(c => c.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5")).join(", ")}</p>
        <p style="margin-bottom: 0;">I request a reduction to $${data.fairAssessment.toLocaleString()} based on comparable property assessments. Full evidence package with property details, assessment history, and comparable analysis is uploaded as supporting documentation.</p>
      </div>
    </div>
    
    <!-- PHOTO REMINDER -->
    <div class="section">
      <div class="section-title">📸 Required: Photo of Your Property</div>
      <div style="background: #fef3c7; border: 2px solid #f59e0b; border-radius: 8px; padding: 14px 18px; font-size: 11px; line-height: 1.6;">
        <p style="margin-bottom: 8px;"><strong>Board of Review Rule #17 requires a photo of the front of your property.</strong></p>
        <p style="margin-bottom: 8px;">Take a clear photo of the <strong>full front</strong> of your building with your phone. Make sure the photo shows:</p>
        <ul style="margin: 0 0 8px 16px; padding: 0;">
          <li>The entire front of the building</li>
          <li>The building's exterior material (brick, frame, etc.)</li>
          <li>General condition of the property</li>
        </ul>
        <p style="margin: 0;">Upload this photo as a separate file on Page 4 of the Board of Review form. Photos of comparable properties are helpful but not required.</p>
      </div>
    </div>
    
    <!-- IMPORTANT NOTES -->
    <div class="section">
      <div class="section-title">⚠️ Important Information</div>
      <div style="font-size: 10px; line-height: 1.7; color: #555;">
        <p style="margin-bottom: 8px;"><strong>LLC / Trust / Corporation-Owned Properties:</strong> If your property is owned by an LLC, trust, or corporation, the Board of Review <strong>requires an attorney</strong> to file the appeal on your behalf. Individual homeowners can file themselves.</p>
        <p style="margin-bottom: 8px;"><strong>Filing Deadline:</strong> Each township has a specific closing date. Check <span class="step-link">cookcountyboardofreview.com</span> for your township's deadline. You must file before the closing date.</p>
        <p style="margin-bottom: 8px;"><strong>Two Chances:</strong> You can appeal with both the Assessor's Office (first level) AND the Board of Review (second level). This is called "the two-bite strategy" — professional tax appeal firms file with both to maximize chances of a reduction.</p>
        <p style="margin-bottom: 0;"><strong>No Cost to File:</strong> Filing an appeal with the Board of Review is completely free. You do not need a lawyer unless your property is owned by an LLC or corporation.</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Disclaimer:</strong> This document provides comparable property data and analysis to support a property tax appeal based on lack of uniformity under the Illinois Constitution (Article IX, Section 4). It does not constitute legal advice. All assessment data is sourced from the Cook County Assessor's Office public records. Filing deadlines and procedures are subject to change — verify current deadlines with the Cook County Assessor's Office or Board of Review before filing.</p>
      <p style="margin-top: 6px;">Generated by Overtaxed · ${today} · Reference PIN: ${formattedPin}</p>
    </div>
  </div>
</body>
</html>`;
}

function generateBrief(data: PropertyData): string {
  const formattedPin = data.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
  const sameClass = data.comps.filter(c => c.classCode === data.classCode).length;
  
  return `
    <p>The subject property at <strong>${escapeHtml(data.address)}</strong> (PIN: ${formattedPin}), classified as Class ${data.classCode} (${data.classDescription}), is currently assessed at <strong>$${data.currentAssessment.toLocaleString()}</strong>, which equates to <strong>$${data.perSqft.toFixed(2)} per square foot</strong> of building area.</p>
    
    <p>An analysis of ${data.comps.length} comparable properties within Assessment Neighborhood ${escapeHtml(data.neighborhood)}${sameClass > 0 ? `, ${sameClass} of which share the same Class ${data.classCode} classification,` : ""} demonstrates that the subject property is assessed at a rate <strong>${data.overAssessedPct}% above the comparable median</strong> of $${data.compMedianPerSqft.toFixed(2)} per square foot. This constitutes a lack of uniformity in violation of Article IX, Section 4 of the Illinois Constitution, which requires that taxes upon real property be levied uniformly by valuation. Pursuant to 35 ILCS 200/16-70 et seq., the Board of Review has authority to revise and correct assessments to achieve uniformity.</p>
    
    <p>Based on the comparable evidence presented, the petitioner requests a reduction in assessed value from <strong>$${data.currentAssessment.toLocaleString()}</strong> to <strong>$${data.fairAssessment.toLocaleString()}</strong>, a reduction of <strong>$${data.reduction.toLocaleString()}</strong>, which would result in estimated annual tax savings of approximately <strong>$${data.savings.toLocaleString()}</strong>.</p>
  `;
}

async function generatePdf(html: string): Promise<Buffer> {
  const response = await fetch(`https://production-sfo.browserless.io/pdf?token=${BROWSERLESS_TOKEN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache",
    },
    body: JSON.stringify({
      html,
      options: {
        format: "Letter",
        printBackground: true,
        margin: { top: "0.4in", right: "0.4in", bottom: "0.4in", left: "0.4in" },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    console.error(`Browserless error: ${response.status} - ${errorText}`);
    throw new Error(`Browserless error: ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

function buildCookQuickStartData(data: PropertyData): CookQuickStartData {
  const formattedPin = data.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
  const notesForFiling = `
    <p>I am filing this appeal on the grounds of LACK OF UNIFORMITY.</p>
    <p>My property at ${escapeHtml(data.address)} (PIN: ${formattedPin}), Class ${data.classCode}, is currently assessed at $${data.currentAssessment.toLocaleString()} total ($${data.perSqft.toFixed(2)}/sq ft of building area).</p>
    <p>An analysis of ${data.comps.length} comparable properties in Assessment Neighborhood ${escapeHtml(data.neighborhood)} shows a median assessment of $${data.compMedianPerSqft.toFixed(2)}/sq ft — my property is assessed ${data.overAssessedPct}% above comparable properties.</p>
    <p>Comparable PINs (all Class ${data.classCode}, Neighborhood ${escapeHtml(data.neighborhood)}):</p>
    <p style="font-family: monospace; font-size: 9px;">${data.comps.map(c => c.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5")).join(", ")}</p>
    <p>I request a reduction to $${data.fairAssessment.toLocaleString()} based on comparable property assessments. Full evidence package with property details, assessment history, and comparable analysis is uploaded as supporting documentation.</p>
  `;
  return {
    address: data.address,
    pin: data.pin,
    township: data.township,
    currentAssessment: data.currentAssessment,
    fairAssessment: data.fairAssessment,
    estimatedSavings: data.savings,
    overAssessedPct: data.overAssessedPct,
    perSqft: data.perSqft,
    compMedianPerSqft: data.compMedianPerSqft,
    compCount: data.comps.length,
    notesForFiling,
  };
}

function buildCookEvidenceData(data: PropertyData): CookEvidenceData {
  return {
    pin: data.pin,
    address: data.address,
    township: data.township,
    neighborhood: data.neighborhood,
    classCode: data.classCode,
    classDescription: data.classDescription,
    sqft: data.sqft,
    totalSqft: data.totalSqft,
    landSqft: data.landSqft,
    beds: data.beds,
    fbath: data.fbath,
    hbath: data.hbath,
    yearBuilt: data.yearBuilt,
    extWall: data.extWall,
    rooms: data.rooms,
    currentBldg: data.currentBldg,
    currentLand: data.currentLand,
    currentAssessment: data.currentAssessment,
    fairAssessment: data.fairAssessment,
    reduction: data.reduction,
    savings: data.savings,
    perSqft: data.perSqft,
    fairPerSqft: data.fairPerSqft,
    overAssessedPct: data.overAssessedPct,
    compMedianPerSqft: data.compMedianPerSqft,
    compAvgPerSqft: data.compAvgPerSqft,
    comps: data.comps,
    assessmentHistory: data.assessmentHistory,
  };
}

function buildCoverLetterData(data: PropertyData): CoverLetterData {
  return {
    ownerName: "Property Owner",
    address: data.address,
    acct: data.pin,
    county: "Cook",
    state: "IL",
    filingBody: "CCAO",
    filingBodyFull: "Cook County Assessor's Office",
    currentAssessment: data.currentAssessment,
    fairAssessment: data.fairAssessment,
    overAssessedPct: data.overAssessedPct,
    compCount: data.comps.length,
    compMedianPerSqft: data.compMedianPerSqft,
    perSqft: data.perSqft,
    taxYear: "2025",
  };
}

async function sendEmail(
  email: string, 
  pin: string, 
  quickStartPdf: Buffer,
  evidencePdf: Buffer,
  coverLetterPdf: Buffer,
  data: PropertyData,
  accessToken: string
): Promise<void> {
  const accessLink = `https://www.getovertaxed.com/appeal/${accessToken}`;
  const formattedPin = pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
  
  await getResend().emails.send({
    from: "Overtaxed <hello@getovertaxed.com>",
    to: email,
    subject: `Your appeal package is ready — save $${data.savings.toLocaleString()}/year on property taxes`,
    html: `
      <div style="background: #f7f6f3; padding: 32px 16px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: #1a6b5a; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <span style="color: white; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">overtaxed</span>
          </div>
          <div style="background: #ffffff; padding: 28px 24px; border: 1px solid #e2e2e0; border-top: none; border-radius: 0 0 12px 12px;">
            <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #1a1a1a;">Your Board of Review appeal package is ready</h1>
            <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #666; margin-bottom: 24px; font-size: 15px;">Everything you need to file your property tax appeal for <strong>${escapeHtml(data.address)}</strong> with the Cook County Board of Review.</p>
            
            <div style="background: #e8f4f0; border: 2px solid #1a6b5a; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
              <p style="margin: 0 0 4px 0; font-size: 14px; color: #1a6b5a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><strong>Estimated Annual Savings: $${data.savings.toLocaleString()}</strong></p>
              <p style="margin: 0; font-size: 13px; color: #1a6b5a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Current: $${data.currentAssessment.toLocaleString()} → Fair: $${data.fairAssessment.toLocaleString()} (${data.overAssessedPct}% over-assessed)</p>
            </div>
            
            <p style="font-size: 14px; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><strong>Three PDFs attached:</strong></p>
            
            <div style="background: #f0fdf4; border: 1px solid #1a6b5a; border-radius: 8px; padding: 14px 16px; margin-bottom: 16px;">
              <p style="margin: 0 0 8px 0; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><strong>📋 Quick Start Guide</strong> — step-by-step filing instructions + notes to copy-paste</p>
              <p style="margin: 0 0 8px 0; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><strong>✉️ Cover Letter</strong> — Formal protest letter, pre-filled and ready to sign.</p>
              <p style="margin: 0; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><strong>📎 Evidence Packet</strong> — ${data.comps.length} comps, uniformity brief, assessment history (upload this to the Board of Review)</p>
            </div>
            
            <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
              <p style="margin: 0; font-size: 13px; color: #92400e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><strong>📸 Don't forget:</strong> The Board of Review requires a photo of the front of your property (Rule #17). Take a clear photo with your phone before you file.</p>
            </div>
            
            <p style="margin-bottom: 16px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Your appeal package PDF is attached to this email. You can also access it online:</p>
            <a href="${accessLink}" style="display: block; width: 100%; text-align: center; background: #1a6b5a; color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">View Your Appeal Package</a>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
            <p style="color: #999; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">This link expires in 90 days. For questions, reply to this email.</p>
            <p style="color: #999; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Overtaxed · hello@getovertaxed.com</p>
          </div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `quick-start-guide-${formattedPin}.pdf`,
        content: quickStartPdf.toString("base64"),
      },
      {
        filename: `cover-letter-${formattedPin}.pdf`,
        content: coverLetterPdf.toString("base64"),
      },
      {
        filename: `evidence-packet-${formattedPin}.pdf`,
        content: evidencePdf.toString("base64"),
      },
    ],
  });
}

function generateAccessToken(sessionId: string, pin: string): string {
  return _genToken(`${pin}:${sessionId}`);
}

function verifyAccessToken(token: string): { pin: string; sessionId: string } | null {
  const data = _verToken(token);
  if (!data) return null;
  const parts = data.split(":");
  if (parts.length < 2) return null;
  return { pin: parts[0], sessionId: parts[1] };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("session_id");
  const accessToken = searchParams.get("token");

  if (accessToken) {
    const tokenData = verifyAccessToken(accessToken);
    if (!tokenData) {
      return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }
    try {
      const session = await getStripe().checkout.sessions.retrieve(tokenData.sessionId);
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
      }
      if (session.metadata?.processed === "true") {
        return NextResponse.json({ error: "This session has already been processed" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const propertyData = await getPropertyData(tokenData.pin);
    if (!propertyData) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, property: propertyData, token: accessToken });
  }

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
      }
      if (session.metadata?.processed === "true") {
        return NextResponse.json({ error: "This session has already been processed" }, { status: 400 });
      }
      const pin = session.client_reference_id;
      const email = session.customer_details?.email;
      if (!pin) {
        return NextResponse.json({ error: "No PIN in session" }, { status: 400 });
      }
      // Houston properties use "houston:ACCT" format — reject so frontend falls back to Houston endpoint
      if (pin.startsWith("houston:")) {
        return NextResponse.json({ error: "Not a Houston property" }, { status: 400 });
      }
      const propertyData = await getPropertyData(pin);
      if (!propertyData) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }
      const token = generateAccessToken(sessionId, pin);
      // Send email in background
      if (email) {
        const quickStartData = buildCookQuickStartData(propertyData);
        const evidenceData = buildCookEvidenceData(propertyData);
        Promise.all([
          generatePdf(generateCookQuickStartHtml(quickStartData)),
          generatePdf(generateCookEvidenceHtml(evidenceData)),
          generatePdf(generateCoverLetterHtml(buildCoverLetterData(propertyData))),
        ]).then(([quickStartPdf, evidencePdf, coverLetterPdf]) => {
          sendEmail(email, pin, quickStartPdf, evidencePdf, coverLetterPdf, propertyData, token).catch(console.error);
        }).catch(console.error);
      }
      return NextResponse.json({ success: true, property: propertyData, token, email: email || null });
    } catch (error) {
      console.error("Error retrieving session:", error);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ error: "Missing session_id or token" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  console.log("[POST] PDF download request received");
  let body;
  try {
    body = await request.json();
  } catch (e) {
    console.error("[POST] Failed to parse request body:", e);
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  
  const { token } = body;
  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const tokenData = verifyAccessToken(token);
  if (!tokenData) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(tokenData.sessionId);
    if (session.payment_status !== "paid" && session.payment_status !== "no_payment_required") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }
    if (session.metadata?.processed === "true") {
      return NextResponse.json({ error: "This session has already been processed" }, { status: 400 });
    }
  } catch (e) {
    console.error("[POST] Session verification failed:", e);
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const propertyData = await getPropertyData(tokenData.pin);
  if (!propertyData) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const evidenceData = buildCookEvidenceData(propertyData);
  const html = generateCookEvidenceHtml(evidenceData);
  const pdfBuffer = await generatePdf(html);

  // Mark session as processed
  try {
    await getStripe().checkout.sessions.update(tokenData.sessionId, {
      metadata: { processed: "true" },
    });
  } catch (e) {
    console.error("[POST] Failed to mark session as processed:", e);
  }

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="appeal-package-${tokenData.pin}.pdf"`,
    },
  });
}
