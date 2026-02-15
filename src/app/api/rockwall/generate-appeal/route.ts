import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import { generateAccessToken as _genToken, verifyAccessToken as _verToken, escapeHtml } from "@/lib/security";
import { CosmosClient } from "@azure/cosmos";

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

let cosmosClient: CosmosClient | null = null;
function getCosmosClient() {
  if (!cosmosClient && process.env.COSMOS_CONNECTION_STRING) {
    cosmosClient = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
  }
  return cosmosClient;
}

const BROWSERLESS_TOKEN = process.env.BROWSERLESS_TOKEN || "";

// ──────────────────────────────────────────────────────────────────
// Rockwall County Property Data Types
// ──────────────────────────────────────────────────────────────────

interface RockwallComp {
  acct: string;
  address: string;
  sqft: number;
  assessedVal: number;
  perSqft: number;
  yearBuilt?: number;
}

interface RockwallPropertyData {
  acct: string;
  address: string;
  city: string;
  state: string;
  neighborhoodCode: string;
  neighborhoodDesc: string;
  sqft: number;
  yearBuilt: number;
  beds: number;
  baths: number;
  currentAssessment: number;
  fairAssessment: number;
  potentialReduction: number;
  estimatedSavings: number;
  perSqft: number;
  fairPerSqft: number;
  overAssessedPct: number;
  comps: RockwallComp[];
  compMedianValue: number;
  compAvgValue: number;
}

// ──────────────────────────────────────────────────────────────────
// Data fetching from Cosmos
// ──────────────────────────────────────────────────────────────────

async function getRockwallPropertyData(acct: string): Promise<RockwallPropertyData | null> {
  try {
    const client = getCosmosClient();
    if (!client) return null;

    const container = client.database("overtaxed").container("rockwall-properties");
    const { resources } = await container.items.query({
      query: `SELECT * FROM c WHERE c.id = @acct`,
      parameters: [{ name: "@acct", value: acct.trim() }],
    }).fetchAll();

    if (resources.length === 0) return null;
    const prop = resources[0];

    const sqft = prop.sqft || 0;
    const currentAssessment = prop.current_assessment || 0;
    const fairAssessment = prop.fair_assessment || currentAssessment;
    const potentialReduction = prop.potential_reduction || 0;
    const estimatedSavings = prop.estimated_savings || 0;
    const perSqft = sqft > 0 ? currentAssessment / sqft : 0;
    const fairPerSqft = sqft > 0 ? fairAssessment / sqft : 0;
    const overAssessedPct = currentAssessment > 0 && potentialReduction > 0
      ? Math.round((potentialReduction / currentAssessment) * 100)
      : 0;

    // Map comps
    const comps: RockwallComp[] = (prop.comps || []).map((c: any) => ({
      acct: c.acct || "",
      address: c.address || "",
      sqft: c.sqft || 0,
      assessedVal: c.assessed_val || 0,
      perSqft: c.psf || 0,
      yearBuilt: c.yearBuilt || undefined,
    }));

    // Comp stats — use appraised values (no sqft data)
    const compValues = comps.map(c => c.assessedVal).filter(v => v > 0).sort((a, b) => a - b);
    const compMedianValue = compValues.length > 0
      ? compValues[Math.floor(compValues.length / 2)]
      : 0;
    const compAvgValue = compValues.length > 0
      ? Math.round(compValues.reduce((a, b) => a + b, 0) / compValues.length)
      : 0;

    return {
      acct: prop.acct,
      address: prop.address || "",
      city: prop.city || "ROCKWALL",
      state: "TX",
      neighborhoodCode: prop.neighborhood_code || "",
      neighborhoodDesc: prop.neighborhood_desc || "",
      sqft,
      yearBuilt: prop.year_built || 0,
      beds: prop.beds || 0,
      baths: prop.full_baths || 0,
      currentAssessment,
      fairAssessment,
      potentialReduction,
      estimatedSavings,
      perSqft: Math.round(perSqft * 100) / 100,
      fairPerSqft: Math.round(fairPerSqft * 100) / 100,
      overAssessedPct,
      comps,
      compMedianValue,
      compAvgValue,
    };
  } catch (error) {
    console.error("[getRockwallPropertyData] Error:", error);
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────
// PDF HTML Generation — Rockwall County
// ──────────────────────────────────────────────────────────────────

function generateRockwallPdfHtml(data: RockwallPropertyData): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Comps table uses appraised value (no $/sqft since sqft=0)
  const compsHtml = data.comps.map((c, i) => `
    <tr>
      <td class="comp-num">${i + 1}</td>
      <td>
        <div class="comp-address">${escapeHtml(c.address)}</div>
        <div class="comp-acct">Acct: ${escapeHtml(c.acct)}</div>
      </td>
      <td class="right">$${c.assessedVal.toLocaleString()}</td>
    </tr>`).join("");

  const brief = generateRockwallBrief(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Tax Protest — Uniform & Equal — ${escapeHtml(data.address)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    @page { size: Letter; margin: 0.6in 0.65in; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11px; line-height: 1.45; color: #1a1a1a; background: #fff; }
    .page { max-width: 8.5in; margin: 0 auto; padding: 0; }
    
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 3px solid #1a6b5a; }
    .header-left .logo { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; color: #1a6b5a; }
    .header-left .subtitle { font-size: 10px; color: #666; margin-top: 2px; letter-spacing: 1px; text-transform: uppercase; }
    .header-right { text-align: right; font-size: 10px; color: #666; }
    .header-right .date { font-weight: 600; color: #1a1a1a; }
    
    .title-block { background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px 20px; margin-bottom: 20px; }
    .appeal-type { font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-bottom: 6px; font-weight: 600; }
    .property-address { font-size: 18px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
    .property-meta { font-size: 11px; color: #555; }
    .property-meta span { margin-right: 16px; }
    
    .summary-row { display: flex; gap: 12px; margin-bottom: 20px; }
    .summary-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; }
    .summary-card.alert { border-color: #b45309; background: #fffbeb; }
    .summary-card.success { border-color: #1a6b5a; background: #e8f4f0; }
    .summary-label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 4px; font-weight: 600; }
    .summary-value { font-size: 22px; font-weight: 700; }
    .summary-card.alert .summary-value { color: #b45309; }
    .summary-card.success .summary-value { color: #1a6b5a; }
    .summary-detail { font-size: 10px; color: #666; margin-top: 2px; }
    
    .breakdown-row { display: flex; gap: 12px; margin-bottom: 20px; }
    .breakdown-card { flex: 1; }
    .breakdown-card h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #666; margin-bottom: 8px; }
    .breakdown-table { width: 100%; border-collapse: collapse; }
    .breakdown-table td { padding: 5px 8px; font-size: 11px; border-bottom: 1px solid #f0f0f0; }
    .breakdown-table td:last-child { text-align: right; font-weight: 600; }
    .breakdown-table tr:last-child td { border-bottom: 2px solid #1a6b5a; font-weight: 700; }
    
    .section { margin-bottom: 20px; }
    .section-title { font-size: 13px; font-weight: 700; color: #1a6b5a; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .brief { background: #f8f9fa; border-left: 4px solid #1a6b5a; padding: 14px 18px; margin-bottom: 20px; font-size: 11px; line-height: 1.6; color: #333; }
    .brief p { margin-bottom: 8px; }
    .brief p:last-child { margin-bottom: 0; }
    
    .comps-table { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 8px; }
    .comps-table th { background: #1a6b5a; color: #fff; padding: 8px 6px; text-align: left; font-weight: 600; font-size: 9px; text-transform: uppercase; letter-spacing: 0.5px; }
    .comps-table th.right, .comps-table td.right { text-align: right; }
    .comps-table td { padding: 7px 6px; border-bottom: 1px solid #e8e8e8; }
    .comps-table tr:nth-child(even) { background: #fafafa; }
    .comp-num { color: #999; font-weight: 600; width: 24px; }
    .comp-address { font-weight: 600; font-size: 10.5px; }
    .comp-acct { font-family: 'SF Mono', 'Consolas', monospace; font-size: 8.5px; color: #888; }
    .highlight { color: #1a6b5a; font-weight: 700; }
    
    .comps-summary { display: flex; gap: 20px; padding: 10px 0; border-top: 2px solid #1a6b5a; font-size: 10px; }
    .comps-summary-item .label { color: #666; font-size: 9px; text-transform: uppercase; }
    .comps-summary-item .value { font-weight: 700; font-size: 13px; color: #1a6b5a; }
    
    .comps-table tr.subject-row { background: #fffbeb; border: 2px solid #b45309; }
    .comps-table tr.subject-row td { font-weight: 600; color: #b45309; }
    
    .steps { counter-reset: step; }
    .step { display: flex; margin-bottom: 14px; }
    .step-number { width: 24px; height: 24px; background: #1a6b5a; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 11px; flex-shrink: 0; margin-right: 12px; margin-top: 1px; }
    .step-content { flex: 1; }
    .step-title { font-weight: 700; font-size: 11px; margin-bottom: 2px; }
    .step-desc { font-size: 10px; color: #555; line-height: 1.5; }
    .step-link { color: #2563eb; font-size: 10px; }
    
    .info-box { border-radius: 8px; padding: 14px 18px; font-size: 11px; line-height: 1.6; margin-bottom: 16px; }
    .info-box.warning { background: #fef3c7; border: 2px solid #f59e0b; }
    .info-box.info { background: #eff6ff; border: 2px solid #3b82f6; }
    .info-box.tip { background: #e8f4f0; border: 2px solid #1a6b5a; }
    
    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 8.5px; color: #999; line-height: 1.5; }
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
            <div class="subtitle">Property Tax Protest Evidence Package</div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="date">${today}</div>
        <div>Rockwall County, Texas</div>
        <div>Protest Type: Uniform & Equal / Market Value</div>
        <div>Filing Body: RCAD / Appraisal Review Board</div>
      </div>
    </div>
    
    <!-- Title Block -->
    <div class="title-block">
      <div class="appeal-type">Subject Property</div>
      <div class="property-address">${escapeHtml(data.address)}</div>
      <div class="property-meta">
        <span><strong>Account:</strong> ${escapeHtml(data.acct)}</span>
        <span><strong>City:</strong> ${escapeHtml(data.city)}, TX</span>
        <span><strong>Neighborhood:</strong> ${escapeHtml(data.neighborhoodCode)}</span>
      </div>
    </div>
    
    <!-- Summary Cards -->
    <div class="summary-row">
      <div class="summary-card alert">
        <div class="summary-label">Current Appraised Value</div>
        <div class="summary-value">$${data.currentAssessment.toLocaleString()}</div>
        <div class="summary-detail">${data.overAssessedPct}% above comparable median in neighborhood</div>
      </div>
      <div class="summary-card success">
        <div class="summary-label">Fair Value (Based on Comparables)</div>
        <div class="summary-value">$${data.fairAssessment.toLocaleString()}</div>
        <div class="summary-detail">Median of ${data.comps.length} comparable properties in neighborhood ${escapeHtml(data.neighborhoodCode)}</div>
      </div>
      <div class="summary-card success">
        <div class="summary-label">Estimated Annual Tax Savings</div>
        <div class="summary-value">$${data.estimatedSavings.toLocaleString()}</div>
        <div class="summary-detail">Based on value reduction of $${data.potentialReduction.toLocaleString()}</div>
      </div>
    </div>
    
    <!-- Property Details -->
    <div class="breakdown-row">
      <div class="breakdown-card">
        <h4>Subject Property Details</h4>
        <table class="breakdown-table">
          <tr><td>Account Number</td><td>${escapeHtml(data.acct)}</td></tr>
          <tr><td>Neighborhood Code</td><td>${escapeHtml(data.neighborhoodCode)}</td></tr>
          ${data.neighborhoodDesc ? `<tr><td>Neighborhood</td><td>${data.neighborhoodDesc}</td></tr>` : ""}
          <tr><td>Current Appraised Value</td><td>$${data.currentAssessment.toLocaleString()}</td></tr>
        </table>
      </div>
      <div class="breakdown-card">
        <h4>Appraisal Summary</h4>
        <table class="breakdown-table">
          <tr><td>Current Appraised Value</td><td>$${data.currentAssessment.toLocaleString()}</td></tr>
          <tr><td>Fair Value (Comparables)</td><td>$${data.fairAssessment.toLocaleString()}</td></tr>
          <tr><td>Requested Reduction</td><td>$${data.potentialReduction.toLocaleString()}</td></tr>
        </table>
        <h4 style="margin-top: 12px;">Tax Impact (Est. 2.19% Rate)</h4>
        <table class="breakdown-table">
          <tr><td>Current Annual Tax</td><td>$${Math.round(data.currentAssessment * 0.0219).toLocaleString()}</td></tr>
          <tr><td>After Reduction</td><td>$${Math.round(data.fairAssessment * 0.0219).toLocaleString()}</td></tr>
          <tr><td>Annual Savings</td><td>$${data.estimatedSavings.toLocaleString()}</td></tr>
        </table>
      </div>
    </div>
    
    <!-- Uniform & Equal Brief -->
    <div class="section">
      <div class="section-title">Statement of Unequal Appraisal</div>
      <div class="brief">
        ${brief}
      </div>
    </div>
    
    <!-- Comparable Properties -->
    <div class="section">
      <div class="section-title">Comparable Properties Evidence</div>
      <p style="font-size: 10px; color: #555; margin-bottom: 10px;">The following ${data.comps.length} comparable properties are located within the same appraisal neighborhood (${escapeHtml(data.neighborhoodCode)}) and demonstrate that the subject property is appraised at a value significantly above comparable properties.</p>
      
      <table class="comps-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Address / Account</th>
            <th class="right">Appraised Value</th>
          </tr>
        </thead>
        <tbody>
          <tr class="subject-row">
            <td class="comp-num">★</td>
            <td>
              <div class="comp-address">${escapeHtml(data.address)} (SUBJECT)</div>
              <div class="comp-acct">Acct: ${escapeHtml(data.acct)}</div>
            </td>
            <td class="right" style="color: #b45309; font-weight: 700;">$${data.currentAssessment.toLocaleString()}</td>
          </tr>
          ${compsHtml}
        </tbody>
      </table>
      
      <div class="comps-summary">
        <div class="comps-summary-item">
          <div class="label">Subject Value</div>
          <div class="value" style="color: #b45309;">$${data.currentAssessment.toLocaleString()}</div>
        </div>
        <div class="comps-summary-item">
          <div class="label">Comp Median Value</div>
          <div class="value">$${data.compMedianValue.toLocaleString()}</div>
        </div>
        <div class="comps-summary-item">
          <div class="label">Comp Average Value</div>
          <div class="value">$${data.compAvgValue.toLocaleString()}</div>
        </div>
        <div class="comps-summary-item">
          <div class="label">Over-Appraised</div>
          <div class="value">${data.overAssessedPct}% above median</div>
        </div>
      </div>
      
      <p style="font-size: 9.5px; color: #666; line-height: 1.5; margin-top: 8px; font-style: italic;">These comparable properties were selected based on proximity, neighborhood, size, and property classification. If the appraiser challenges a specific comparable, focus on the ones most similar to your property in age and size. Even 3–4 strong comps are sufficient to demonstrate unequal treatment.</p>
    </div>
    
    <!-- FILING INSTRUCTIONS -->
    <div class="section page-break">
      <div class="section-title">📋 How to Protest — Rockwall County Step by Step</div>
      <p style="font-size: 10px; color: #555; margin-bottom: 14px; line-height: 1.6;">Texas law gives every property owner the right to protest their appraised value. Rockwall CAD offers online filing. <strong>No attorney or agent needed.</strong></p>
      
      <div class="info-box warning">
        <p style="margin: 0;"><strong>⏰ Deadline:</strong> Rockwall County protest season typically opens in late March when appraisal notices are mailed. The deadline is usually May 15 (or 30 days after your notice date, whichever is later). <strong>File as soon as you receive your notice for the best results.</strong></p>
      </div>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">Wait for Your Appraisal Notice</div>
            <div class="step-desc">RCAD mails appraisal notices in <strong>late March to early April</strong>. Your notice will include information needed for online filing. Your property account: <strong style="font-family: monospace; background: #f0f0f0; padding: 1px 4px; border-radius: 3px;">${escapeHtml(data.acct)}</strong>.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">File Online via RCAD Portal</div>
            <div class="step-desc">
              Go to <span class="step-link">rockwallcad.com</span> and look for the <strong>"Online Protest"</strong> or <strong>"File a Protest"</strong> option.<br/>
              • Enter your property account number or information from your appraisal notice<br/>
              • Select <strong>"Unequal Appraisal"</strong> as your reason for protest (this is the strongest legal argument)<br/>
              • You can also check <strong>"Value is Over Market Value"</strong> as an additional reason<br/>
              • Enter your opinion of value: <strong>$${data.fairAssessment.toLocaleString()}</strong><br/>
              • Upload <strong>this PDF</strong> as your supporting evidence<br/>
              • Submit your protest
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">Attend Your Informal Meeting</div>
            <div class="step-desc">
              After filing, an RCAD appraiser will review your evidence and may offer a settlement.<br/>
              • If the offer is <strong>at or below $${data.fairAssessment.toLocaleString()}</strong> → <strong>Accept it!</strong> You're done.<br/>
              • If the offer is still too high → <strong>Reject it</strong> and proceed to your ARB hearing.
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <div class="step-title">Prepare for Your ARB Hearing</div>
            <div class="step-desc">
              If the informal meeting doesn't resolve it, you'll be scheduled for an <strong>Appraisal Review Board (ARB) hearing</strong>. Hearings run from <strong>May through July</strong>.<br/>
              • Check in at <span class="step-link">rockwall.prodigycad.com/check-in-beta</span> for your hearing<br/>
              • Bring <strong>this PDF</strong> — it has everything you need<br/>
              • Present your comparable properties and explain why your value should be lower<br/>
              • Focus on the <strong>appraised value comparison</strong> — your property is at $${data.currentAssessment.toLocaleString()} while comparable properties in the same neighborhood average $${data.compAvgValue.toLocaleString()}<br/>
              • Be polite and factual. The appraiser may offer a compromise.
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">5</div>
          <div class="step-content">
            <div class="step-title">After the Hearing</div>
            <div class="step-desc">
              The ARB panel will issue a decision, usually within a few weeks. If you're not satisfied, you can appeal to <strong>District Court</strong> or pursue <strong>binding arbitration</strong> (for properties under $5 million). Most protests are resolved at the informal or ARB stage.
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- WHAT TO SAY AT YOUR HEARING -->
    <div class="section">
      <div class="section-title">📝 What to Say — Hearing Script</div>
      <p style="font-size: 10px; color: #555; margin-bottom: 10px;">If you go to an ARB hearing, here's what to say. Keep it simple and factual:</p>
      <div style="background: #f8f9fa; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 16px 18px; font-size: 10.5px; line-height: 1.7; color: #333; font-family: 'Georgia', serif;">
        <p style="margin-bottom: 8px;">"I am protesting the appraised value of my property at <strong>${escapeHtml(data.address)}</strong>, Account ${escapeHtml(data.acct)}, on the grounds of <strong>unequal appraisal</strong>."</p>
        <p style="margin-bottom: 8px;">"My property is currently appraised at <strong>$${data.currentAssessment.toLocaleString()}</strong>."</p>
        <p style="margin-bottom: 8px;">"I've identified ${data.comps.length} comparable properties in the same neighborhood (${escapeHtml(data.neighborhoodCode)}) with similar characteristics. The median appraised value of these comparable properties is <strong>$${data.compMedianValue.toLocaleString()}</strong> — my property is appraised <strong>${data.overAssessedPct}% higher</strong> than comparable properties."</p>
        <p style="margin-bottom: 8px;">"Under Texas Tax Code §41.41(a)(2), I have the right to protest on grounds of unequal appraisal, and under §42.26(a), my appraised value must not exceed the median of comparable properties. I am requesting my appraised value be reduced to <strong>$${data.fairAssessment.toLocaleString()}</strong>, which reflects the median appraised value of comparable properties in my neighborhood."</p>
        <p style="margin-bottom: 0;">"I have provided ${data.comps.length} comparable properties with their addresses, account numbers, and appraised values as supporting evidence."</p>
      </div>
    </div>
    
    <!-- KEY INFORMATION -->
    <div class="section">
      <div class="section-title">⚠️ Important Information</div>
      
      <div class="info-box tip">
        <p style="margin: 0 0 8px 0;"><strong>🏆 Why "Uniform & Equal" is Your Strongest Argument</strong></p>
        <p style="margin: 0;">Texas Tax Code §41.41(a)(2) gives you the right to protest on unequal appraisal grounds, and §42.26(a) requires that your appraised value not exceed the median of comparable properties. If your property is appraised higher than comparable properties in the same neighborhood, the Appraisal Review Board <strong>must</strong> reduce your value to the median. This is a stronger legal argument than simply saying your home is worth less — it's backed by law and is the argument used by professional tax protest firms.</p>
      </div>
      
      <div class="info-box info">
        <p style="margin: 0 0 8px 0;"><strong>📅 Texas Reassesses Every Year</strong></p>
        <p style="margin: 0;">Unlike some states, Texas reappraises properties <strong>annually</strong>. Even if you win this year's protest, you should check your value again next year. A successful protest this year also helps establish a lower baseline for future years.</p>
      </div>
      
      <div style="font-size: 10px; line-height: 1.7; color: #555; margin-top: 12px;">
        <p style="margin-bottom: 8px;"><strong>No Attorney Required:</strong> Any property owner can protest their own value. You don't need a lawyer, agent, or tax consultant. This evidence package has everything you need.</p>
        <p style="margin-bottom: 8px;"><strong>No Cost to File:</strong> Filing a protest with RCAD is completely free. There is no penalty for protesting — even if your value isn't reduced.</p>
        <p style="margin-bottom: 8px;"><strong>Homestead Exemption:</strong> If you haven't already, apply for a <strong>homestead exemption</strong> through RCAD. This is separate from your protest and can reduce your taxable value by $100,000 (effective 2024). Go to <span class="step-link">rockwallcad.com</span> to apply.</p>
        <p style="margin-bottom: 0;"><strong>10% Homestead Cap:</strong> If you have a homestead exemption, your appraised value can't increase by more than 10% per year, regardless of what RCAD says the market value is. Protesting still matters because it lowers the <em>base</em> that future increases are calculated from.</p>
      </div>
    </div>
    
    <!-- RCAD Contact Info -->
    <div class="section">
      <div class="section-title">📞 Rockwall Central Appraisal District</div>
      <div style="font-size: 10px; line-height: 1.7; color: #555;">
        <p style="margin-bottom: 4px;"><strong>Address:</strong> 841 Justin Road, Rockwall, TX 75087</p>
        <p style="margin-bottom: 4px;"><strong>Website:</strong> <span class="step-link">rockwallcad.com</span></p>
        <p style="margin-bottom: 4px;"><strong>Phone:</strong> (972) 771-2034</p>
        <p style="margin-bottom: 4px;"><strong>Email:</strong> info@rockwallcad.com</p>
        <p style="margin-bottom: 4px;"><strong>ARB Hearing Check-in:</strong> <span class="step-link">rockwall.prodigycad.com/check-in-beta</span></p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Disclaimer:</strong> This document provides comparable property data and analysis to support a property tax protest based on unequal appraisal under Texas Tax Code §41.41(a)(2) and §42.26(a). It does not constitute legal advice. All appraisal data is sourced from Rockwall Central Appraisal District (RCAD) public records. Filing deadlines and procedures are subject to change — verify current deadlines at rockwallcad.com before filing.</p>
      <p style="margin-top: 6px;">Generated by Overtaxed · ${today} · Account: ${escapeHtml(data.acct)}</p>
    </div>
  </div>
</body>
</html>`;
}

function generateRockwallBrief(data: RockwallPropertyData): string {
  return `
    <p>The subject property at <strong>${escapeHtml(data.address)}</strong> (RCAD Account: ${escapeHtml(data.acct)}), located in appraisal neighborhood ${escapeHtml(data.neighborhoodCode)}, is currently appraised at <strong>$${data.currentAssessment.toLocaleString()}</strong>.</p>
    
    <p>An analysis of ${data.comps.length} comparable properties within the same appraisal neighborhood demonstrates that the subject property is appraised at a value <strong>${data.overAssessedPct}% above the comparable median</strong> of $${data.compMedianValue.toLocaleString()}. This constitutes an unequal appraisal Under <strong>Texas Tax Code §41.41(a)(2)</strong>, a property owner has the right to protest the appraised value on grounds that the property is unequally appraised. Under <strong>§42.26(a)</strong>, the appraised value of property must not exceed the median appraised value of a reasonable number of comparable properties appropriately adjusted.</p>
    
    <p>Based on the comparable evidence presented, the petitioner requests a reduction in appraised value from <strong>$${data.currentAssessment.toLocaleString()}</strong> to <strong>$${data.fairAssessment.toLocaleString()}</strong>, a reduction of <strong>$${data.potentialReduction.toLocaleString()}</strong>, resulting in estimated annual tax savings of approximately <strong>$${data.estimatedSavings.toLocaleString()}</strong>.</p>
  `;
}

// ──────────────────────────────────────────────────────────────────
// PDF Generation via Browserless
// ──────────────────────────────────────────────────────────────────

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

// ──────────────────────────────────────────────────────────────────
// Email
// ──────────────────────────────────────────────────────────────────

async function sendRockwallEmail(
  email: string,
  acct: string,
  pdfBuffer: Buffer,
  data: RockwallPropertyData,
  accessToken: string
): Promise<void> {
  const accessLink = `https://www.getovertaxed.com/appeal/${accessToken}`;

  await getResend().emails.send({
    from: "Overtaxed <hello@getovertaxed.com>",
    to: email,
    subject: `Your protest package is ready — save $${data.estimatedSavings.toLocaleString()}/year on property taxes`,
    html: `
      <div style="background: #f7f6f3; padding: 32px 16px;">
        <div style="max-width: 600px; margin: 0 auto;">
          <div style="background: #1a6b5a; padding: 20px 24px; border-radius: 12px 12px 0 0;">
            <span style="color: white; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">overtaxed</span>
          </div>
          <div style="background: #ffffff; padding: 28px 24px; border: 1px solid #e2e2e0; border-top: none; border-radius: 0 0 12px 12px;">
            <h1 style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 700; margin-bottom: 8px; color: #1a1a1a;">Your protest package is ready</h1>
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #666; margin-bottom: 24px; font-size: 15px;">Everything you need to protest your property tax for <strong>${escapeHtml(data.address)}</strong> with the Rockwall Central Appraisal District.</p>
        
        <div style="background: #e8f4f0; border: 2px solid #1a6b5a; border-radius: 10px; padding: 18px 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px 0; font-size: 14px; color: #1a6b5a;"><strong>Estimated Annual Savings: $${data.estimatedSavings.toLocaleString()}</strong></p>
          <p style="margin: 0; font-size: 13px; color: #1a6b5a;">Current: $${data.currentAssessment.toLocaleString()} → Fair: $${data.fairAssessment.toLocaleString()} (${data.overAssessedPct}% over-appraised)</p>
        </div>
        
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #92400e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><strong>⏰ Deadline:</strong> File your protest once you receive your appraisal notice (usually by May 15 or 30 days after your notice, whichever is later). Don't wait!</p>
        </div>
        
        <p style="font-size: 14px; margin-bottom: 8px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;"><strong>Your protest package includes:</strong></p>
        <ul style="font-size: 14px; color: #555; margin-bottom: 24px; padding-left: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <li>${data.comps.length} comparable properties with appraised values</li>
          <li>Written "Uniform & Equal" argument citing Texas Tax Code §41.41(a)(2) &amp; §42.26(a)</li>
          <li>Step-by-step RCAD online filing instructions</li>
          <li>Hearing script — exactly what to say</li>
          <li>RCAD contact information and portal links</li>
        </ul>
        
        <p style="margin-bottom: 16px; font-size: 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Your protest package PDF is attached. You can also access it online:</p>
        <a href="${accessLink}" style="display: block; width: 100%; text-align: center; background: #1a6b5a; color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">View Your Appeal Package</a>
        
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;" />
        <p style="color: #999; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">This link expires in 30 days. For questions, reply to this email.</p>
        <p style="color: #999; font-size: 11px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">Overtaxed · hello@getovertaxed.com</p>
          </div>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: `protest-package-${acct}.pdf`,
        content: pdfBuffer.toString("base64"),
      },
    ],
  });
}

// ──────────────────────────────────────────────────────────────────
// Token handling
// ──────────────────────────────────────────────────────────────────

function generateAccessToken(sessionId: string, acct: string): string {
  return _genToken(`rockwall:${acct}:${sessionId}`);
}

function verifyAccessToken(token: string): { acct: string; sessionId: string } | null {
  const data = _verToken(token);
  if (!data) return null;
  const parts = data.split(":");
  if (parts.length < 3 || parts[0] !== "rockwall") return null;
  return { acct: parts[1], sessionId: parts[2] };
}

// ──────────────────────────────────────────────────────────────────
// API Routes
// ──────────────────────────────────────────────────────────────────

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
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
      }
      if (session.metadata?.processed === "true") {
        return NextResponse.json({ error: "This session has already been processed" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
    const propertyData = await getRockwallPropertyData(tokenData.acct);
    if (!propertyData) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, property: propertyData, token: accessToken, jurisdiction: "rockwall" });
  }

  if (sessionId) {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== "paid") {
        return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
      }
      if (session.metadata?.processed === "true") {
        return NextResponse.json({ error: "This session has already been processed" }, { status: 400 });
      }
      const clientRef = session.client_reference_id;
      const email = session.customer_details?.email;
      if (!clientRef || !clientRef.startsWith("rockwall:")) {
        return NextResponse.json({ error: "Not a Rockwall County property" }, { status: 400 });
      }
      const acct = clientRef.replace("rockwall:", "");
      const propertyData = await getRockwallPropertyData(acct);
      if (!propertyData) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }
      const token = generateAccessToken(sessionId, acct);
      if (email) {
        try {
          const pdfBuffer = await generatePdf(generateRockwallPdfHtml(propertyData));
          await sendRockwallEmail(email, acct, pdfBuffer, propertyData, token);
        } catch (emailErr) {
          console.error("Email send error:", emailErr);
        }
      }
      return NextResponse.json({ success: true, property: propertyData, token, email: email || null, jurisdiction: "rockwall" });
    } catch (error) {
      console.error("Error retrieving session:", error);
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ error: "Missing session_id or token" }, { status: 400 });
}

export async function POST(request: NextRequest) {
  let body;
  try {
    body = await request.json();
  } catch {
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
    if (session.payment_status !== "paid") {
      return NextResponse.json({ error: "Payment not completed" }, { status: 400 });
    }
    if (session.metadata?.processed === "true") {
      return NextResponse.json({ error: "This session has already been processed" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const propertyData = await getRockwallPropertyData(tokenData.acct);
  if (!propertyData) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const html = generateRockwallPdfHtml(propertyData);
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
      "Content-Disposition": `attachment; filename="protest-package-${tokenData.acct}.pdf"`,
    },
  });
}
