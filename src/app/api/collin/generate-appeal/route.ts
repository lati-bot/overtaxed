import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Resend } from "resend";
import crypto from "crypto";
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
// Collin Property Data Types
// ──────────────────────────────────────────────────────────────────

interface CollinComp {
  acct: string;
  address: string;
  sqft: number;
  assessedVal: number;
  perSqft: number;
  yearBuilt?: number;
  beds?: number;
  baths?: number;
}

interface CollinPropertyData {
  acct: string;
  address: string;
  city: string;
  state: string;
  zipcode: string;
  neighborhoodCode: string;
  sqft: number;
  yearBuilt: number;
  beds: number;
  fullBaths: number;
  halfBaths: number;
  stories: string;
  extWall: string;
  pool: boolean;
  fireplaces: number;
  bldgClass: string;
  currentAssessment: number;
  landVal: number;
  improvementVal: number;
  fairAssessment: number;
  potentialReduction: number;
  estimatedSavings: number;
  perSqft: number;
  fairPerSqft: number;
  overAssessedPct: number;
  comps: CollinComp[];
  compMedianPerSqft: number;
  compAvgPerSqft: number;
}

// ──────────────────────────────────────────────────────────────────
// Data fetching from Cosmos
// ──────────────────────────────────────────────────────────────────

async function getCollinPropertyData(acct: string): Promise<CollinPropertyData | null> {
  try {
    const client = getCosmosClient();
    if (!client) return null;

    const container = client.database("overtaxed").container("collin-properties");
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
    const comps: CollinComp[] = (prop.comps || []).map((c: any) => ({
      acct: c.acct || "",
      address: c.address || "",
      sqft: c.sqft || 0,
      assessedVal: c.assessed_val || 0,
      perSqft: c.psf || 0,
      yearBuilt: c.yearBuilt || c.year_built || undefined,
      beds: c.beds || undefined,
      baths: c.baths || undefined,
    }));

    const compPerSqfts = comps.map(c => c.perSqft).filter(v => v > 0).sort((a, b) => a - b);
    const compMedianPerSqft = compPerSqfts.length > 0
      ? compPerSqfts[Math.floor(compPerSqfts.length / 2)]
      : 0;
    const compAvgPerSqft = compPerSqfts.length > 0
      ? compPerSqfts.reduce((a, b) => a + b, 0) / compPerSqfts.length
      : 0;

    // Enrich comps with year_built from their own Cosmos documents
    const enrichedComps = await Promise.all(
      comps.map(async (comp) => {
        if (comp.yearBuilt) return comp;
        try {
          const { resources: compDocs } = await container.items.query({
            query: `SELECT c.year_built, c.beds, c.full_baths, c.half_baths FROM c WHERE c.id = @acct`,
            parameters: [{ name: "@acct", value: comp.acct }],
          }).fetchAll();
          if (compDocs.length > 0) {
            if (compDocs[0].year_built) comp.yearBuilt = compDocs[0].year_built;
            if (compDocs[0].beds) comp.beds = compDocs[0].beds;
            if (compDocs[0].full_baths) {
              comp.baths = compDocs[0].full_baths + (compDocs[0].half_baths || 0) * 0.5;
            }
          }
        } catch { /* skip */ }
        return comp;
      })
    );

    return {
      acct: prop.acct,
      address: prop.address || "",
      city: prop.city || "PLANO",
      state: "TX",
      zipcode: prop.zipcode || "",
      neighborhoodCode: prop.neighborhood_code || "",
      sqft,
      yearBuilt: prop.year_built || 0,
      beds: prop.beds || 0,
      fullBaths: prop.full_baths || 0,
      halfBaths: prop.half_baths || 0,
      stories: prop.stories || "",
      extWall: prop.ext_wall || "",
      pool: prop.pool || false,
      fireplaces: prop.fireplaces || 0,
      bldgClass: prop.bldg_class || "",
      currentAssessment,
      landVal: prop.land_val || 0,
      improvementVal: prop.improvement_val || 0,
      fairAssessment,
      potentialReduction,
      estimatedSavings,
      perSqft: Math.round(perSqft * 100) / 100,
      fairPerSqft: Math.round(fairPerSqft * 100) / 100,
      overAssessedPct,
      comps: enrichedComps,
      compMedianPerSqft: Math.round(compMedianPerSqft * 100) / 100,
      compAvgPerSqft: Math.round(compAvgPerSqft * 100) / 100,
    };
  } catch (error) {
    console.error("[getCollinPropertyData] Error:", error);
    return null;
  }
}

// ──────────────────────────────────────────────────────────────────
// PDF HTML Generation — Collin County
// ──────────────────────────────────────────────────────────────────

function generateCollinPdfHtml(data: CollinPropertyData): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  // Build property details rows
  const bathsStr = data.fullBaths > 0 
    ? `${data.fullBaths} full${data.halfBaths > 0 ? ` / ${data.halfBaths} half` : ""}` 
    : "N/A";

  const compsHtml = data.comps.map((c, i) => `
    <tr>
      <td class="comp-num">${i + 1}</td>
      <td>
        <div class="comp-address">${c.address}</div>
        <div class="comp-acct">Acct: ${c.acct}</div>
      </td>
      <td class="right">${c.sqft.toLocaleString()}</td>
      <td class="right">${c.beds || "—"}</td>
      <td class="right">${c.yearBuilt || "—"}</td>
      <td class="right">$${c.assessedVal.toLocaleString()}</td>
      <td class="right highlight">$${c.perSqft.toFixed(2)}</td>
    </tr>`).join("");

  const brief = generateCollinBrief(data);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Tax Protest — Uniform & Equal — ${data.address}</title>
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
        <div>Collin County, Texas</div>
        <div>Protest Type: Uniform & Equal / Market Value</div>
        <div>Filing Body: CCAD / Appraisal Review Board</div>
      </div>
    </div>
    
    <!-- Title Block -->
    <div class="title-block">
      <div class="appeal-type">Subject Property</div>
      <div class="property-address">${data.address}</div>
      <div class="property-meta">
        <span><strong>Account:</strong> ${data.acct}</span>
        <span><strong>City:</strong> ${data.city}, TX ${data.zipcode}</span>
        <span><strong>Neighborhood:</strong> ${data.neighborhoodCode}</span>
        ${data.yearBuilt ? `<span><strong>Year Built:</strong> ${data.yearBuilt}</span>` : ""}
        <span><strong>Building SF:</strong> ${data.sqft.toLocaleString()}</span>
      </div>
    </div>
    
    <!-- Summary Cards -->
    <div class="summary-row">
      <div class="summary-card alert">
        <div class="summary-label">Current Appraised Value</div>
        <div class="summary-value">$${data.currentAssessment.toLocaleString()}</div>
        <div class="summary-detail">$${data.perSqft.toFixed(2)}/sqft · ${data.overAssessedPct}% above comparable median</div>
      </div>
      <div class="summary-card success">
        <div class="summary-label">Fair Value (Based on Comparables)</div>
        <div class="summary-value">$${data.fairAssessment.toLocaleString()}</div>
        <div class="summary-detail">$${data.fairPerSqft.toFixed(2)}/sqft · Median of ${data.comps.length} comparable properties</div>
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
          <tr><td>Building Sq Ft</td><td>${data.sqft.toLocaleString()}</td></tr>
          ${data.yearBuilt ? `<tr><td>Year Built</td><td>${data.yearBuilt}</td></tr>` : ""}
          <tr><td>Bedrooms</td><td>${data.beds || "N/A"}</td></tr>
          <tr><td>Bathrooms</td><td>${bathsStr}</td></tr>
          ${data.stories ? `<tr><td>Stories</td><td>${data.stories}</td></tr>` : ""}
          ${data.extWall ? `<tr><td>Exterior</td><td>${data.extWall}</td></tr>` : ""}
          ${data.pool ? `<tr><td>Pool</td><td>Yes</td></tr>` : ""}
          ${data.fireplaces > 0 ? `<tr><td>Fireplaces</td><td>${data.fireplaces}</td></tr>` : ""}
          <tr><td>Neighborhood Code</td><td>${data.neighborhoodCode}</td></tr>
        </table>
      </div>
      <div class="breakdown-card">
        <h4>Appraisal Summary</h4>
        <table class="breakdown-table">
          <tr><td>Improvement Value</td><td>$${data.improvementVal.toLocaleString()}</td></tr>
          <tr><td>Land Value</td><td>$${data.landVal.toLocaleString()}</td></tr>
          <tr><td>Total Appraised Value</td><td>$${data.currentAssessment.toLocaleString()}</td></tr>
        </table>
        <h4 style="margin-top: 12px;">Requested Reduction</h4>
        <table class="breakdown-table">
          <tr><td>Fair Value (Comparables)</td><td>$${data.fairAssessment.toLocaleString()}</td></tr>
          <tr><td>Requested Reduction</td><td>$${data.potentialReduction.toLocaleString()}</td></tr>
        </table>
        <h4 style="margin-top: 12px;">Tax Impact (Est. 2.2% Rate)</h4>
        <table class="breakdown-table">
          <tr><td>Current Annual Tax</td><td>$${Math.round(data.currentAssessment * 0.022).toLocaleString()}</td></tr>
          <tr><td>After Reduction</td><td>$${Math.round(data.fairAssessment * 0.022).toLocaleString()}</td></tr>
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
      <p style="font-size: 10px; color: #555; margin-bottom: 10px;">The following ${data.comps.length} comparable properties are located within the same appraisal neighborhood (${data.neighborhoodCode}) and demonstrate that the subject property is appraised at a rate significantly above comparable properties on a per-square-foot basis.</p>
      
      <table class="comps-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Address / Account</th>
            <th class="right">Bldg SF</th>
            <th class="right">Beds</th>
            <th class="right">Year Built</th>
            <th class="right">Appraised Value</th>
            <th class="right">$/SF</th>
          </tr>
        </thead>
        <tbody>
          <tr class="subject-row">
            <td class="comp-num">★</td>
            <td>
              <div class="comp-address">${data.address} (SUBJECT)</div>
              <div class="comp-acct">Acct: ${data.acct}</div>
            </td>
            <td class="right">${data.sqft.toLocaleString()}</td>
            <td class="right">${data.beds || "—"}</td>
            <td class="right">${data.yearBuilt || "—"}</td>
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
    
    <!-- FILING INSTRUCTIONS -->
    <div class="section page-break">
      <div class="section-title">📋 How to Protest — Collin County Step by Step</div>
      <p style="font-size: 10px; color: #555; margin-bottom: 14px; line-height: 1.6;">Texas law gives every property owner the right to protest their appraised value. Collin Central Appraisal District (CCAD) makes this easy — you can file online through their Online Portal. <strong>No attorney or agent needed.</strong></p>
      
      <div class="info-box warning">
        <p style="margin: 0;"><strong>⏰ Deadline:</strong> CCAD protest season typically opens when appraisal notices are mailed (usually mid-April). The deadline is typically May 15 or 30 days after your notice date, whichever is later. <strong>File as soon as you receive your notice for the best results.</strong> Verify your exact deadline at <a href="https://www.collincad.org" class="step-link">collincad.org</a>.</p>
      </div>
      
      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">Wait for Your Appraisal Notice</div>
            <div class="step-desc">CCAD mails appraisal notices in <strong>mid-April</strong>. Your notice will show your property's appraised value for the current year. Your account number is <strong style="font-family: monospace; background: #f0f0f0; padding: 1px 4px; border-radius: 3px;">${data.acct}</strong>.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">File Online via CCAD Online Portal</div>
            <div class="step-desc">
              Go to <a href="https://onlineportal.collincad.org" class="step-link">onlineportal.collincad.org</a> → Log in or create an account → File your protest online<br/>
              • Use your <strong>Property ID</strong>: <strong style="font-family: monospace; background: #f0f0f0; padding: 1px 4px; border-radius: 3px;">${data.acct}</strong><br/>
              • Select <strong>"Unequal Appraisal"</strong> as your reason for protest<br/>
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
            <div class="step-title">Check for a Settlement Offer</div>
            <div class="step-desc">
              After filing, CCAD may offer a <strong>settlement</strong> without a hearing.<br/>
              • If the offer is <strong>at or below $${data.fairAssessment.toLocaleString()}</strong> → <strong>Accept it!</strong><br/>
              • If the offer is still too high → <strong>Reject it</strong> and proceed to your ARB hearing.<br/>
              • If you don't get a settlement offer → proceed to your hearing.
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">4</div>
          <div class="step-content">
            <div class="step-title">Prepare for Your ARB Hearing</div>
            <div class="step-desc">
              If settlement doesn't work, you'll be scheduled for an <strong>Appraisal Review Board (ARB) hearing</strong>. Hearings run from <strong>May through July</strong>. You can attend <strong>in person, by phone, or online</strong>.<br/>
              • Bring <strong>this PDF</strong> — it has everything you need<br/>
              • Present your comparable properties and explain why your value should be lower<br/>
              • Focus on the <strong>$/sqft comparison</strong> — your property is at $${data.perSqft.toFixed(2)}/sqft while comparable properties average $${data.compAvgPerSqft.toFixed(2)}/sqft<br/>
              • Be polite and factual. The appraiser may offer a compromise.
            </div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">5</div>
          <div class="step-content">
            <div class="step-title">After the Hearing</div>
            <div class="step-desc">
              The ARB panel will issue a decision. If you're not satisfied, you can appeal further to <strong>District Court</strong> or pursue <strong>binding arbitration</strong> (for properties under $5 million). However, most protests are resolved at the settlement or ARB stage.
            </div>
          </div>
        </div>
      </div>
      
      <div class="info-box info">
        <p style="margin: 0;"><strong>📬 File by Mail (Alternative):</strong> You can also mail your protest to: <strong>Collin Central Appraisal District, 250 Eldorado Pkwy, McKinney, TX 75069</strong>. Include a completed Notice of Protest form (available at collincad.org) along with this evidence package. Online filing is faster and recommended.</p>
      </div>
    </div>
    
    <!-- HEARING SCRIPT -->
    <div class="section">
      <div class="section-title">📝 What to Say — Hearing Script</div>
      <p style="font-size: 10px; color: #555; margin-bottom: 10px;">If you go to an ARB hearing, here's what to say. Keep it simple and factual:</p>
      <div style="background: #f8f9fa; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 16px 18px; font-size: 10.5px; line-height: 1.7; color: #333; font-family: 'Georgia', serif;">
        <p style="margin-bottom: 8px;">"I am protesting the appraised value of my property at <strong>${data.address}</strong>, Account ${data.acct}, on the grounds of <strong>unequal appraisal</strong>."</p>
        <p style="margin-bottom: 8px;">"My property is currently appraised at <strong>$${data.currentAssessment.toLocaleString()}</strong>, which comes to <strong>$${data.perSqft.toFixed(2)} per square foot</strong>."</p>
        <p style="margin-bottom: 8px;">"I've identified ${data.comps.length} comparable properties in the same neighborhood (${data.neighborhoodCode}) with similar characteristics. The median appraised value of these comparable properties is <strong>$${data.compMedianPerSqft.toFixed(2)} per square foot</strong> — my property is appraised <strong>${data.overAssessedPct}% higher</strong> than comparable properties."</p>
        <p style="margin-bottom: 8px;">"Under Texas Tax Code §41.41(a)(2), I have the right to protest on grounds of unequal appraisal, and under §42.26(a), my appraised value must not exceed the median of comparable properties. I am requesting my appraised value be reduced to <strong>$${data.fairAssessment.toLocaleString()}</strong>, which reflects the median per-square-foot value of comparable properties in my neighborhood."</p>
        <p style="margin-bottom: 0;">"I have provided ${data.comps.length} comparable properties with their addresses, account numbers, and appraised values as supporting evidence."</p>
      </div>
    </div>
    
    <!-- KEY INFORMATION -->
    <div class="section">
      <div class="section-title">⚠️ Important Information</div>
      
      <div class="info-box tip">
        <p style="margin: 0 0 8px 0;"><strong>🏆 Why "Uniform & Equal" is Your Strongest Argument</strong></p>
        <p style="margin: 0;">Texas Tax Code §41.41(a)(2) gives you the right to protest on unequal appraisal grounds, and §42.26(a) requires that your appraised value not exceed the median of comparable properties. If your property is appraised higher per square foot than comparable properties, the Appraisal Review Board <strong>must</strong> reduce your value to the median. This is a stronger legal argument than simply saying your home is worth less — it's backed by law and is the argument used by professional tax protest firms.</p>
      </div>
      
      <div class="info-box info">
        <p style="margin: 0 0 8px 0;"><strong>📅 Texas Reassesses Every Year</strong></p>
        <p style="margin: 0;">Unlike some states, Texas reappraises properties <strong>annually</strong>. Even if you win this year's protest, you should check your value again next year. A successful protest this year also helps establish a lower baseline for future years.</p>
      </div>
      
      <div style="font-size: 10px; line-height: 1.7; color: #555; margin-top: 12px;">
        <p style="margin-bottom: 8px;"><strong>No Attorney Required:</strong> Any property owner can protest their own value. You don't need a lawyer, agent, or tax consultant. This evidence package has everything you need.</p>
        <p style="margin-bottom: 8px;"><strong>No Cost to File:</strong> Filing a protest with CCAD is completely free. There is no penalty for protesting — even if your value isn't reduced.</p>
        <p style="margin-bottom: 8px;"><strong>Homestead Exemption:</strong> If you haven't already, apply for a <strong>homestead exemption</strong> through CCAD. This is separate from your protest and can reduce your taxable value by $100,000 (effective 2024). Go to <a href="https://www.collincad.org" class="step-link">collincad.org</a> → "Exemptions" to apply.</p>
        <p style="margin-bottom: 0;"><strong>10% Homestead Cap:</strong> If you have a homestead exemption, your appraised value can't increase by more than 10% per year. Protesting still matters because it lowers the <em>base</em> that future increases are calculated from.</p>
      </div>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Disclaimer:</strong> This document provides comparable property data and analysis to support a property tax protest based on unequal appraisal under Texas Tax Code §41.41(a)(2) and §42.26(a). It does not constitute legal advice. All appraisal data is sourced from Collin Central Appraisal District (CCAD) public records. Filing deadlines and procedures are subject to change — verify current deadlines at collincad.org before filing.</p>
      <p style="margin-top: 6px;">Generated by Overtaxed · ${today} · Account: ${data.acct}</p>
    </div>
  </div>
</body>
</html>`;
}

function generateCollinBrief(data: CollinPropertyData): string {
  // Include richer property description for Collin (has beds/baths)
  const features: string[] = [];
  if (data.beds > 0) features.push(`${data.beds} bedrooms`);
  if (data.fullBaths > 0) features.push(`${data.fullBaths} full bath${data.fullBaths > 1 ? "s" : ""}${data.halfBaths > 0 ? ` and ${data.halfBaths} half bath${data.halfBaths > 1 ? "s" : ""}` : ""}`);
  if (data.stories) features.push(`${data.stories} story`);
  if (data.pool) features.push("pool");
  if (data.fireplaces > 0) features.push(`${data.fireplaces} fireplace${data.fireplaces > 1 ? "s" : ""}`);
  const featuresStr = features.length > 0 ? ` The property is a ${data.sqft.toLocaleString()} sq ft residence with ${features.join(", ")}.` : "";

  return `
    <p>The subject property at <strong>${data.address}</strong> (CCAD Account: ${data.acct}), located in ${data.city}, TX, appraisal neighborhood ${data.neighborhoodCode}, is currently appraised at <strong>$${data.currentAssessment.toLocaleString()}</strong>, which equates to <strong>$${data.perSqft.toFixed(2)} per square foot</strong> of building area.${featuresStr}</p>
    
    <p>An analysis of ${data.comps.length} comparable properties within the same appraisal neighborhood demonstrates that the subject property is appraised at a rate <strong>${data.overAssessedPct}% above the comparable median</strong> of $${data.compMedianPerSqft.toFixed(2)} per square foot. This constitutes an unequal appraisal Under <strong>Texas Tax Code §41.41(a)(2)</strong>, a property owner has the right to protest the appraised value on grounds that the property is unequally appraised. Under <strong>§42.26(a)</strong>, the appraised value of property must not exceed the median appraised value of a reasonable number of comparable properties appropriately adjusted.</p>
    
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

async function sendCollinEmail(
  email: string,
  acct: string,
  pdfBuffer: Buffer,
  data: CollinPropertyData,
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
        <p style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #666; margin-bottom: 24px; font-size: 15px;">Everything you need to protest your property tax for <strong>${data.address}</strong> with the Collin Central Appraisal District.</p>
        
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
          <li>Step-by-step CCAD Online Portal and ARB hearing instructions</li>
          <li>Hearing script — exactly what to say</li>
          <li>Settlement guidance — how to evaluate CCAD's offer</li>
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
// Token handling — collin:acct:sessionId format
// ──────────────────────────────────────────────────────────────────

function generateAccessToken(sessionId: string, acct: string): string {
  const data = `collin:${acct}:${sessionId}`;
  const encoded = Buffer.from(data).toString("base64url");
  const hash = crypto
    .createHmac("sha256", process.env.TOKEN_SIGNING_SECRET || process.env.STRIPE_SECRET_KEY!)
    .update(data)
    .digest("base64url");
  return `${encoded}.${hash}`;
}

function verifyAccessToken(token: string): { acct: string; sessionId: string } | null {
  try {
    const [encoded, hash] = token.split(".");
    if (!encoded || !hash) return null;

    const decoded = Buffer.from(encoded, "base64url").toString();
    const parts = decoded.split(":");
    if (parts.length < 3 || parts[0] !== "collin") return null;

    // Recalculate expected hash
    const data = `collin:${parts[1]}:${parts[2]}`;
    const expectedHash = crypto
      .createHmac("sha256", process.env.TOKEN_SIGNING_SECRET || process.env.STRIPE_SECRET_KEY!)
      .update(data)
      .digest("base64url");

    // Constant-time comparison
    if (!crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(expectedHash))) {
      return null;
    }

    return { acct: parts[1], sessionId: parts[2] };
  } catch {
    return null;
  }
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
    const propertyData = await getCollinPropertyData(tokenData.acct);
    if (!propertyData) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, property: propertyData, token: accessToken, jurisdiction: "collin" });
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
      if (!clientRef || !clientRef.startsWith("collin:")) {
        return NextResponse.json({ error: "Not a Collin County property" }, { status: 400 });
      }
      const acct = clientRef.replace("collin:", "");
      const propertyData = await getCollinPropertyData(acct);
      if (!propertyData) {
        return NextResponse.json({ error: "Property not found" }, { status: 404 });
      }
      const token = generateAccessToken(sessionId, acct);
      // Send email
      console.log(`[Collin] Email: ${email || "NONE"}, Acct: ${acct}, Session: ${sessionId}`);
      if (email) {
        try {
          console.log("[Collin] Generating PDF...");
          const pdfBuffer = await generatePdf(generateCollinPdfHtml(propertyData));
          console.log(`[Collin] PDF generated: ${pdfBuffer.length} bytes`);
          await sendCollinEmail(email, acct, pdfBuffer, propertyData, token);
          console.log("[Collin] Email sent successfully");
        } catch (emailErr) {
          console.error("[Collin] Email send error:", emailErr);
          // Don't fail the response — email is best-effort
        }
      } else {
        console.warn("[Collin] No email from Stripe session — skipping email send");
      }
      return NextResponse.json({ success: true, property: propertyData, token, email: email || null, jurisdiction: "collin" });
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

  const propertyData = await getCollinPropertyData(tokenData.acct);
  if (!propertyData) {
    return NextResponse.json({ error: "Property not found" }, { status: 404 });
  }

  const html = generateCollinPdfHtml(propertyData);
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
