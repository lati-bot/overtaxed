/**
 * Bexar Evidence Packet Generator
 * Generates the evidence-only PDF for upload to BCAD (no filing instructions, no hearing script).
 * This is the "ammo" — comps, brief, property data.
 */

import { escapeHtml } from "@/lib/security";

export interface BexarEvidenceData {
  acct: string;
  address: string;
  city: string;
  state: string;
  neighborhoodCode: string;
  neighborhoodDesc: string;
  sqft: number;
  yearBuilt: number;
  currentAssessment: number;
  fairAssessment: number;
  potentialReduction: number;
  estimatedSavings: number;
  perSqft: number;
  fairPerSqft: number;
  overAssessedPct: number;
  comps: {
    acct: string;
    address: string;
    sqft: number;
    assessedVal: number;
    perSqft: number;
    yearBuilt?: number;
  }[];
  compMedianPerSqft: number;
  compAvgPerSqft: number;
}

export function generateBexarEvidenceHtml(data: BexarEvidenceData): string {
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const compsHtml = data.comps.map((c, i) => `
    <tr>
      <td class="comp-num">${i + 1}</td>
      <td>
        <div class="comp-address">${escapeHtml(c.address)}</div>
        <div class="comp-acct">Acct: ${escapeHtml(c.acct)}</div>
      </td>
      <td class="right">${c.sqft.toLocaleString()}</td>
      <td class="right">${c.yearBuilt || "—"}</td>
      <td class="right">$${c.assessedVal.toLocaleString()}</td>
      <td class="right highlight">$${c.perSqft.toFixed(2)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evidence Packet — Uniform & Equal — ${escapeHtml(data.address)}</title>
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
    
    .upload-note { background: #eff6ff; border: 2px solid #3b82f6; border-radius: 8px; padding: 14px 18px; font-size: 11px; line-height: 1.6; margin-bottom: 16px; }

    .footer { margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 8.5px; color: #999; line-height: 1.5; }
    
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
            <div class="subtitle">Evidence Packet — Upload This to BCAD</div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="date">${today}</div>
        <div>Bexar County, Texas</div>
        <div>Protest Type: Uniform & Equal</div>
        <div>Filing Body: BCAD / ARB</div>
      </div>
    </div>

    <!-- Upload instruction -->
    <div class="upload-note">
      <strong>📎 This is your evidence packet.</strong> Upload this document when filing your protest on bcadonline.org. See the Quick Start Guide for step-by-step instructions.
    </div>
    
    <!-- Title Block -->
    <div class="title-block">
      <div class="appeal-type">Subject Property</div>
      <div class="property-address">${escapeHtml(data.address)}</div>
      <div class="property-meta">
        <span><strong>Account:</strong> ${escapeHtml(data.acct)}</span>
        <span><strong>City:</strong> ${escapeHtml(data.city)}, TX</span>
        <span><strong>Neighborhood:</strong> ${escapeHtml(data.neighborhoodCode)}</span>
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
          <tr><td>Neighborhood Code</td><td>${escapeHtml(data.neighborhoodCode)}</td></tr>
          ${data.neighborhoodDesc ? `<tr><td>Neighborhood</td><td>${escapeHtml(data.neighborhoodDesc)}</td></tr>` : ""}
          <tr><td>Current $/Sq Ft</td><td>$${data.perSqft.toFixed(2)}</td></tr>
        </table>
      </div>
      <div class="breakdown-card">
        <h4>Appraisal Summary</h4>
        <table class="breakdown-table">
          <tr><td>Current Appraised Value</td><td>$${data.currentAssessment.toLocaleString()}</td></tr>
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
        <p>The subject property at <strong>${escapeHtml(data.address)}</strong> (BCAD Account: ${escapeHtml(data.acct)}), located in ${escapeHtml(data.city)}, TX, appraisal neighborhood ${escapeHtml(data.neighborhoodCode)}, is currently appraised at <strong>$${data.currentAssessment.toLocaleString()}</strong>, which equates to <strong>$${data.perSqft.toFixed(2)} per square foot</strong> of building area. The property is a ${data.sqft.toLocaleString()} sq ft residence${data.yearBuilt ? ` built in ${data.yearBuilt}` : ""}.</p>
        
        <p>An analysis of ${data.comps.length} comparable properties within the same appraisal neighborhood demonstrates that the subject property is appraised at a rate <strong>${data.overAssessedPct}% above the comparable median</strong> of $${data.compMedianPerSqft.toFixed(2)} per square foot. Under <strong>Texas Tax Code §41.41(a)(2)</strong>, a property owner has the right to protest the appraised value on grounds that the property is unequally appraised. Under <strong>§42.26(a)</strong>, the appraised value of property must not exceed the median appraised value of a reasonable number of comparable properties appropriately adjusted.</p>
        
        <p>Based on the comparable evidence presented, the petitioner requests a reduction in appraised value from <strong>$${data.currentAssessment.toLocaleString()}</strong> to <strong>$${data.fairAssessment.toLocaleString()}</strong>, a reduction of <strong>$${data.potentialReduction.toLocaleString()}</strong>, resulting in estimated annual tax savings of approximately <strong>$${data.estimatedSavings.toLocaleString()}</strong>.</p>
      </div>
    </div>
    
    <!-- Comparable Properties -->
    <div class="section">
      <div class="section-title">Comparable Properties Evidence</div>
      <p style="font-size: 10px; color: #555; margin-bottom: 10px;">The following ${data.comps.length} comparable properties are located within the same appraisal neighborhood (${escapeHtml(data.neighborhoodCode)}) and demonstrate that the subject property is appraised at a rate significantly above comparable properties on a per-square-foot basis.</p>
      
      <table class="comps-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Address / Account</th>
            <th class="right">Bldg SF</th>
            <th class="right">Year Built</th>
            <th class="right">Appraised Value</th>
            <th class="right">$/SF</th>
          </tr>
        </thead>
        <tbody>
          <tr class="subject-row">
            <td class="comp-num">★</td>
            <td>
              <div class="comp-address">${escapeHtml(data.address)} (SUBJECT)</div>
              <div class="comp-acct">Acct: ${escapeHtml(data.acct)}</div>
            </td>
            <td class="right">${data.sqft.toLocaleString()}</td>
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
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Disclaimer:</strong> This document provides comparable property data and analysis to support a property tax protest based on unequal appraisal under Texas Tax Code §41.41(a)(2) and §42.26(a). It does not constitute legal advice. All appraisal data is sourced from Bexar County Appraisal District (BCAD) public records.</p>
      <p style="margin-top: 6px;">Generated by Overtaxed · ${today} · Account: ${escapeHtml(data.acct)}</p>
    </div>
  </div>
</body>
</html>`;
}