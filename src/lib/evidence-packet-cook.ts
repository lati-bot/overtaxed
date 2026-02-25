/**
 * Cook County Evidence Packet Generator
 * Generates the evidence-only PDF for upload to Board of Review.
 * Contains: property details, assessment breakdown, uniformity brief, comps table, assessment history.
 * No filing instructions — those are in the Quick Start Guide.
 */

import { escapeHtml } from "@/lib/security";

export interface CookCompProperty {
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
  assessmentBldg: number;
  assessmentLand: number;
  assessmentTotal: number;
  perSqft: number;
}

export interface CookAssessmentHistory {
  year: number | string;
  mailedTotal: number;
  certifiedTotal: number | null;
  boardTotal: number | null;
}

export interface CookEvidenceData {
  pin: string;
  address: string;
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
  yearBuilt: number;
  extWall: string;
  rooms: number;
  currentBldg: number;
  currentLand: number;
  currentAssessment: number;
  fairAssessment: number;
  reduction: number;
  savings: number;
  perSqft: number;
  fairPerSqft: number;
  overAssessedPct: number;
  compMedianPerSqft: number;
  compAvgPerSqft: number;
  comps: CookCompProperty[];
  assessmentHistory: CookAssessmentHistory[];
}

export function generateCookEvidenceHtml(data: CookEvidenceData): string {
  const formattedPin = data.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const compsHtml = data.comps.map((c, i) => {
    const fPin = c.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
    return `
    <tr>
      <td class="comp-num">${i + 1}</td>
      <td>
        <div class="comp-address">${escapeHtml(c.address)}</div>
        <div class="comp-pin">${fPin}</div>
      </td>
      <td class="right">${c.classCode}</td>
      <td class="right">${c.sqft.toLocaleString()}</td>
      <td class="right">${c.beds}/${c.fbath}${c.hbath ? `.${c.hbath}` : ""}</td>
      <td class="right">${escapeHtml(c.extWall)}</td>
      <td class="right">${c.yearBuilt || "—"}</td>
      <td class="right">$${c.assessmentTotal.toLocaleString()}</td>
      <td class="right highlight">$${c.perSqft.toFixed(2)}</td>
    </tr>`;
  }).join("");

  const historyHtml = data.assessmentHistory.map(h => `
    <tr>
      <td>${h.year}</td>
      <td class="right">$${h.mailedTotal.toLocaleString()}</td>
      <td class="right">${h.certifiedTotal !== null ? "$" + h.certifiedTotal.toLocaleString() : "—"}</td>
      <td class="right">${h.boardTotal !== null ? "$" + h.boardTotal.toLocaleString() : "—"}</td>
    </tr>
  `).join("");

  // Generate uniformity brief
  const sameClass = data.comps.filter(c => c.classCode === data.classCode).length;
  const brief = `
    <p>The subject property at <strong>${escapeHtml(data.address)}</strong> (PIN: ${formattedPin}), classified as Class ${data.classCode} (${data.classDescription}), is currently assessed at <strong>$${data.currentAssessment.toLocaleString()}</strong>, which equates to <strong>$${data.perSqft.toFixed(2)} per square foot</strong> of building area.</p>
    
    <p>An analysis of ${data.comps.length} comparable properties within Assessment Neighborhood ${escapeHtml(data.neighborhood)}${sameClass > 0 ? `, ${sameClass} of which share the same Class ${data.classCode} classification,` : ""} demonstrates that the subject property is assessed at a rate <strong>${data.overAssessedPct}% above the comparable median</strong> of $${data.compMedianPerSqft.toFixed(2)} per square foot. This constitutes a lack of uniformity in violation of Article IX, Section 4 of the Illinois Constitution, which requires that taxes upon real property be levied uniformly by valuation. Pursuant to 35 ILCS 200/16-70 et seq., the Board of Review has authority to revise and correct assessments to achieve uniformity.</p>
    
    <p>Based on the comparable evidence presented, the petitioner requests a reduction in assessed value from <strong>$${data.currentAssessment.toLocaleString()}</strong> to <strong>$${data.fairAssessment.toLocaleString()}</strong>, a reduction of <strong>$${data.reduction.toLocaleString()}</strong>, which would result in estimated annual tax savings of approximately <strong>$${data.savings.toLocaleString()}</strong>.</p>
  `;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Board of Review Appeal — Evidence Packet — ${escapeHtml(data.address)}</title>
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
    
    .comps-table { width: 100%; border-collapse: collapse; font-size: 9.5px; margin-bottom: 8px; }
    .comps-table th { background: #1a6b5a; color: #fff; padding: 7px 5px; text-align: left; font-weight: 600; font-size: 8.5px; text-transform: uppercase; letter-spacing: 0.5px; }
    .comps-table th.right, .comps-table td.right { text-align: right; }
    .comps-table td { padding: 6px 5px; border-bottom: 1px solid #e8e8e8; }
    .comps-table tr:nth-child(even) { background: #fafafa; }
    .comp-num { color: #999; font-weight: 600; width: 20px; }
    .comp-address { font-weight: 600; font-size: 10px; }
    .comp-pin { font-family: 'SF Mono', 'Consolas', monospace; font-size: 8.5px; color: #888; }
    .highlight { color: #1a6b5a; font-weight: 700; }
    
    .comps-summary { display: flex; gap: 20px; padding: 10px 0; border-top: 2px solid #1a6b5a; font-size: 10px; }
    .comps-summary-item .label { color: #666; font-size: 9px; text-transform: uppercase; }
    .comps-summary-item .value { font-weight: 700; font-size: 13px; color: #1a6b5a; }
    
    .comps-table tr.subject-row { background: #fffbeb; border: 2px solid #b45309; }
    .comps-table tr.subject-row td { font-weight: 600; color: #b45309; }
    
    .history-table { width: 100%; border-collapse: collapse; font-size: 10px; }
    .history-table th { background: #f8f9fa; padding: 6px 8px; text-align: left; font-weight: 600; font-size: 9px; text-transform: uppercase; border-bottom: 2px solid #e2e8f0; }
    .history-table th.right { text-align: right; }
    .history-table td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
    .history-table td.right { text-align: right; }
    
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
            <div class="subtitle">Board of Review Appeal — Evidence Packet</div>
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
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Disclaimer:</strong> This document provides comparable property data and analysis to support a property tax appeal based on lack of uniformity under the Illinois Constitution (Article IX, Section 4). It does not constitute legal advice. All assessment data is sourced from the Cook County Assessor's Office public records.</p>
      <p style="margin-top: 6px;">Generated by Overtaxed · ${today} · Reference PIN: ${formattedPin}</p>
    </div>
  </div>
</body>
</html>`;
}
