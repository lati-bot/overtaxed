// ──────────────────────────────────────────────────────────────────
// Homeowner Playbook — Private Strategy Guide
// For the homeowner's eyes only. NOT submitted to the CAD/ARB.
// ──────────────────────────────────────────────────────────────────

import { escapeHtml } from "@/lib/security";

// ──────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────

interface PlaybookData {
  // Subject property
  address: string;
  acct: string;
  city: string;
  state: string;
  county: string;
  neighborhoodCode: string;
  sqft: number;
  yearBuilt: number;
  beds?: number;
  baths?: number;
  hasPool?: boolean;

  // Values
  currentAssessment: number;
  fairAssessment: number;
  estimatedSavings: number;
  potentialReduction: number;
  perSqft: number;
  fairPerSqft: number;
  overAssessedPct: number;
  compCount: number;
  compMedianPerSqft: number;

  // County-specific
  cadName: string;
  cadAddress: string;
  cadEmail?: string;
  cadPhone?: string;
  cadWebsite: string;
  filingUrl: string;
  filingPortal: string;
  hasISettle: boolean;
  deadline: string;

  // Homestead
  hasHomesteadExemption?: boolean;
  exemptionUrl?: string;

  // Comp confidence
  compConfidence: "high" | "medium" | "low" | "insufficient";
}

// ──────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => n.toLocaleString("en-US");
const fmtD = (n: number) => `$${fmt(n)}`;
const fmtSf = (n: number) => `$${n.toFixed(2)}`;
const esc = escapeHtml;

function confidenceLabel(c: PlaybookData["compConfidence"]): string {
  switch (c) {
    case "high":
      return "High — strong comparable evidence";
    case "medium":
      return "Medium — solid evidence with some variation";
    case "low":
      return "Low — limited comparable data available";
    case "insufficient":
      return "Insufficient — consider additional evidence";
  }
}

function confidenceColor(c: PlaybookData["compConfidence"]): string {
  switch (c) {
    case "high":
      return "#1a6b5a";
    case "medium":
      return "#b45309";
    case "low":
      return "#dc2626";
    case "insufficient":
      return "#dc2626";
  }
}

function propertyDescription(d: PlaybookData): string {
  const parts: string[] = [];
  parts.push(`${fmt(d.sqft)} sq ft`);
  if (d.beds) parts.push(`${d.beds} bed`);
  if (d.baths) parts.push(`${d.baths} bath`);
  parts.push(`built ${d.yearBuilt}`);
  if (d.hasPool) parts.push("pool");
  return parts.join(" · ");
}

// ──────────────────────────────────────────────────────────────────
// CSS
// ──────────────────────────────────────────────────────────────────

function getStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    @page {
      size: Letter;
      margin: 0.75in 0.75in;
    }

    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11px;
      line-height: 1.5;
      color: #1a1a1a;
      background: #fff;
    }

    .page { max-width: 8.5in; margin: 0 auto; padding: 0; }
    .page-break { page-break-before: always; }

    /* ── Header ─────────────────────────────────────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 14px;
      border-bottom: 3px solid #1a6b5a;
    }
    .header-left .logo {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #1a6b5a;
    }
    .header-left .subtitle {
      font-size: 9px;
      color: #888;
      margin-top: 2px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
    }
    .header-right {
      text-align: right;
      font-size: 9.5px;
      color: #666;
    }
    .header-right .date { font-weight: 600; color: #1a1a1a; }

    /* ── Page Title ──────────────────────────────────────────── */
    .page-title {
      font-size: 18px;
      font-weight: 800;
      color: #1a6b5a;
      margin-bottom: 4px;
      letter-spacing: -0.3px;
    }
    .page-subtitle {
      font-size: 11px;
      color: #666;
      margin-bottom: 18px;
      line-height: 1.5;
    }

    /* ── Property Banner ────────────────────────────────────── */
    .property-banner {
      background: #f8f9fa;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 14px 18px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .property-banner .address {
      font-size: 14px;
      font-weight: 700;
      color: #1a1a1a;
    }
    .property-banner .meta {
      font-size: 10px;
      color: #555;
      margin-top: 2px;
    }
    .property-banner .meta span { margin-right: 12px; }
    .property-banner .values {
      text-align: right;
    }
    .property-banner .values .current {
      font-size: 10px;
      color: #b45309;
      font-weight: 600;
    }
    .property-banner .values .fair {
      font-size: 13px;
      color: #1a6b5a;
      font-weight: 700;
    }
    .property-banner .values .savings {
      font-size: 10px;
      color: #1a6b5a;
    }

    /* ── Section Titles ─────────────────────────────────────── */
    .section { margin-bottom: 20px; }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      color: #1a6b5a;
      padding-bottom: 6px;
      border-bottom: 2px solid #e2e8f0;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ── Steps ───────────────────────────────────────────────── */
    .steps { counter-reset: step; }
    .step {
      display: flex;
      margin-bottom: 16px;
      align-items: flex-start;
    }
    .step-number {
      width: 32px;
      height: 32px;
      background: #1a6b5a;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 14px;
      flex-shrink: 0;
      margin-right: 14px;
      margin-top: 1px;
    }
    .step-content { flex: 1; }
    .step-title {
      font-weight: 700;
      font-size: 12px;
      margin-bottom: 3px;
      color: #1a1a1a;
    }
    .step-desc {
      font-size: 10.5px;
      color: #444;
      line-height: 1.6;
    }

    /* ── Info Boxes ──────────────────────────────────────────── */
    .info-box {
      border-radius: 8px;
      padding: 14px 18px;
      font-size: 11px;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .info-box.warning {
      background: #fef3c7;
      border: 2px solid #f59e0b;
    }
    .info-box.info {
      background: #eff6ff;
      border: 2px solid #3b82f6;
    }
    .info-box.tip {
      background: #f0fdf4;
      border: 2px solid #1a6b5a;
    }
    .info-box.alert {
      background: #fef2f2;
      border: 2px solid #dc2626;
    }
    .info-box.isettle {
      background: #faf5ff;
      border: 2px solid #7c3aed;
    }
    .info-box p { margin: 0 0 6px 0; }
    .info-box p:last-child { margin-bottom: 0; }

    /* ── Highlight Values ───────────────────────────────────── */
    .val {
      font-family: 'SF Mono', 'Consolas', 'Menlo', monospace;
      background: #f0f0f0;
      padding: 1px 5px;
      border-radius: 3px;
      font-weight: 600;
      font-size: 10.5px;
    }
    .val-teal { color: #1a6b5a; }
    .val-amber { color: #b45309; }
    .acct {
      font-family: 'SF Mono', 'Consolas', 'Menlo', monospace;
      background: #f0f0f0;
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 10px;
    }
    a, .link {
      color: #2563eb;
      text-decoration: none;
    }

    /* ── Timeline ────────────────────────────────────────────── */
    .timeline {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin: 20px 0;
      position: relative;
    }
    .timeline::before {
      content: '';
      position: absolute;
      top: 18px;
      left: 36px;
      right: 36px;
      height: 3px;
      background: #d1d5db;
      z-index: 0;
    }
    .timeline-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      flex: 1;
      position: relative;
      z-index: 1;
    }
    .timeline-dot {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #1a6b5a;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 13px;
      margin-bottom: 8px;
      border: 3px solid #fff;
      box-shadow: 0 0 0 2px #1a6b5a;
    }
    .timeline-dot.pending {
      background: #e5e7eb;
      color: #6b7280;
      box-shadow: 0 0 0 2px #d1d5db;
    }
    .timeline-label {
      font-size: 9.5px;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 2px;
    }
    .timeline-date {
      font-size: 8.5px;
      color: #666;
    }
    .timeline-note {
      font-size: 8px;
      color: #999;
      margin-top: 2px;
      max-width: 100px;
    }

    /* ── Letter ──────────────────────────────────────────────── */
    .letter {
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 24px 28px;
      margin-bottom: 20px;
      background: #fff;
      font-size: 11px;
      line-height: 1.7;
    }
    .letter .date-line {
      margin-bottom: 16px;
      color: #555;
    }
    .letter .addressee {
      margin-bottom: 16px;
      line-height: 1.5;
    }
    .letter .subject-line {
      font-weight: 700;
      margin-bottom: 12px;
    }
    .letter p { margin-bottom: 10px; }
    .letter ol {
      margin: 10px 0 10px 20px;
      line-height: 1.8;
    }
    .letter ol li { margin-bottom: 2px; }
    .letter .closing { margin-top: 20px; }

    /* ── Script ──────────────────────────────────────────────── */
    .script-block {
      background: #f8f9fa;
      border: 2px dashed #cbd5e1;
      border-radius: 8px;
      padding: 20px 22px;
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 11px;
      line-height: 1.8;
      color: #333;
      margin-bottom: 16px;
    }
    .script-block .timing {
      display: inline-block;
      background: #1a6b5a;
      color: #fff;
      font-family: 'SF Mono', 'Consolas', monospace;
      font-size: 9px;
      padding: 1px 6px;
      border-radius: 3px;
      margin-right: 6px;
      font-weight: 600;
      vertical-align: middle;
    }
    .script-block .section-label {
      font-weight: 700;
      color: #1a6b5a;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 6px;
      margin-top: 14px;
      font-family: 'Inter', sans-serif;
    }
    .script-block .section-label:first-child { margin-top: 0; }
    .script-block p {
      margin-bottom: 10px;
      text-indent: 0;
    }
    .script-block p:last-child { margin-bottom: 0; }

    /* ── Rebuttal Table ──────────────────────────────────────── */
    .rebuttal-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10.5px;
      margin-bottom: 16px;
    }
    .rebuttal-table th {
      background: #1a6b5a;
      color: #fff;
      padding: 10px 12px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .rebuttal-table td {
      padding: 12px;
      border-bottom: 1px solid #e8e8e8;
      vertical-align: top;
      line-height: 1.6;
    }
    .rebuttal-table tr:nth-child(even) { background: #fafafa; }
    .rebuttal-table .says {
      width: 38%;
      color: #b45309;
      font-weight: 600;
    }
    .rebuttal-table .respond {
      width: 62%;
      color: #1a6b5a;
    }

    /* ── Checklist ───────────────────────────────────────────── */
    .checklist {
      list-style: none;
      padding: 0;
    }
    .checklist li {
      display: flex;
      align-items: flex-start;
      margin-bottom: 8px;
      font-size: 10.5px;
      line-height: 1.5;
    }
    .checklist li::before {
      content: '☐';
      margin-right: 8px;
      font-size: 13px;
      color: #1a6b5a;
      flex-shrink: 0;
      margin-top: -1px;
    }

    /* ── Homestead Alert ─────────────────────────────────────── */
    .homestead-alert {
      border: 3px solid #dc2626;
      border-radius: 12px;
      padding: 24px;
      background: #fef2f2;
      margin-bottom: 20px;
    }
    .homestead-alert h2 {
      color: #dc2626;
      font-size: 18px;
      margin-bottom: 8px;
    }
    .homestead-savings {
      display: flex;
      gap: 16px;
      margin: 16px 0;
    }
    .homestead-savings .card {
      flex: 1;
      background: #fff;
      border: 1px solid #fca5a5;
      border-radius: 8px;
      padding: 14px;
      text-align: center;
    }
    .homestead-savings .card .amount {
      font-size: 22px;
      font-weight: 800;
      color: #dc2626;
    }
    .homestead-savings .card .label {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #666;
      margin-top: 2px;
    }

    /* ── Footer ──────────────────────────────────────────────── */
    .playbook-footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      font-size: 8px;
      color: #999;
      line-height: 1.5;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .playbook-footer .confidential {
      font-weight: 700;
      color: #b45309;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
  `;
}

// ──────────────────────────────────────────────────────────────────
// Shared Components
// ──────────────────────────────────────────────────────────────────

function renderHeader(d: PlaybookData, today: string): string {
  return `
    <div class="header">
      <div class="header-left">
        <div style="display: flex; align-items: center; gap: 10px;">
          <svg width="26" height="26" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="7" fill="#1a6b5a"/>
            <circle cx="16" cy="15.5" r="8" fill="none" stroke="white" stroke-width="3.5"/>
          </svg>
          <div>
            <div class="logo">overtaxed</div>
            <div class="subtitle">Homeowner Playbook</div>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="date">${today}</div>
        <div>${esc(d.county)} County, ${esc(d.state)}</div>
        <div>Account: <span class="acct">${esc(d.acct)}</span></div>
      </div>
    </div>`;
}

function renderPropertyBanner(d: PlaybookData): string {
  return `
    <div class="property-banner">
      <div>
        <div class="address">${esc(d.address)}</div>
        <div class="meta">
          <span>${esc(d.city)}, ${esc(d.state)}</span>
          <span>${propertyDescription(d)}</span>
          <span>Neighborhood: ${esc(d.neighborhoodCode)}</span>
        </div>
      </div>
      <div class="values">
        <div class="current">Current: ${fmtD(d.currentAssessment)} (${fmtSf(d.perSqft)}/sf)</div>
        <div class="fair">Fair Value: ${fmtD(d.fairAssessment)}</div>
        <div class="savings">Potential Savings: ${fmtD(d.estimatedSavings)}/yr</div>
      </div>
    </div>`;
}

function renderFooter(d: PlaybookData, today: string): string {
  return `
    <div class="playbook-footer">
      <div>
        <span class="confidential">Homeowner Playbook — For Your Use Only — Do Not Submit to the Appraisal District</span>
      </div>
      <div>
        Overtaxed · ${today} · ${esc(d.acct)}
      </div>
    </div>`;
}

// ──────────────────────────────────────────────────────────────────
// Page 1: Quick Start Guide
// ──────────────────────────────────────────────────────────────────

function renderPage1(d: PlaybookData, today: string): string {
  const iSettleBox = d.hasISettle
    ? `
      <div class="info-box isettle">
        <p style="margin: 0 0 6px 0;"><strong>🎯 iSettle Strategy (${esc(d.county)} County)</strong></p>
        <p>After you file, the appraisal district may send you a <strong>settlement offer via iSettle</strong> — this is an automated online system where they offer a reduced value without a hearing.</p>
        <p><strong>Your target:</strong> Accept any offer at or below <span class="val val-teal">${fmtD(d.fairAssessment)}</span> (${fmtSf(d.fairPerSqft)}/sf). If the offer is higher than your target, <strong>reject it</strong> and go to your hearing — you have strong comparable evidence.</p>
        <p style="margin-bottom: 0;"><strong>Tip:</strong> iSettle offers often come in waves. If your first offer is too high, wait — a second, lower offer may follow. Don't panic-accept a bad offer.</p>
      </div>`
    : "";

  return `
    <!-- PAGE 1: QUICK START GUIDE -->
    ${renderHeader(d, today)}
    ${renderPropertyBanner(d)}

    <div class="page-title">📋 Your Protest in 4 Steps</div>
    <div class="page-subtitle">Everything you need to reduce your property tax. Follow these steps in order.</div>

    <div class="info-box warning">
      <p style="margin: 0;"><strong>⏰ Deadline: ${esc(d.deadline)}</strong> — File your protest before this date or you lose your right to protest for this tax year. File as early as possible for the best results.</p>
    </div>

    <div class="steps">
      <div class="step">
        <div class="step-number">1</div>
        <div class="step-content">
          <div class="step-title">File Your Protest Online</div>
          <div class="step-desc">
            Go to <a href="${esc(d.filingUrl)}" class="link">${esc(d.filingPortal)}</a> (${esc(d.cadWebsite)})<br/>
            • Enter your Account Number: <span class="acct">${esc(d.acct)}</span><br/>
            • Select <strong>"Unequal Appraisal"</strong> as your reason (strongest legal argument)<br/>
            • Also check <strong>"Value is Over Market Value"</strong> as a backup<br/>
            • Enter your opinion of value: <span class="val val-teal">${fmtD(d.fairAssessment)}</span><br/>
            • Upload your evidence package PDF<br/>
            • Submit — you'll get a confirmation number
          </div>
        </div>
      </div>

      <div class="step">
        <div class="step-number">2</div>
        <div class="step-content">
          <div class="step-title">Request the CAD's Evidence (See Page 3)</div>
          <div class="step-desc">
            Within 7 days of filing, send the pre-written evidence request letter on <strong>page 3</strong> of this playbook. Texas law (§41.461) requires the appraisal district to give you <strong>free copies</strong> of all evidence they plan to use at your hearing. This is your right — and their evidence often contains weaknesses you can exploit.<br/>
            <em style="color: #1a6b5a;">★ This is the step most homeowners skip — and it's the one that makes the biggest difference.</em>
          </div>
        </div>
      </div>

      <div class="step">
        <div class="step-number">3</div>
        <div class="step-content">
          <div class="step-title">Prepare for Your Hearing (See Pages 4–5)</div>
          <div class="step-desc">
            Review the <strong>hearing script</strong> on page 4 — it's a word-for-word 5-minute presentation you can read aloud. Then study the <strong>rebuttal guide</strong> on page 5 so you know how to respond when the appraiser pushes back. Print 3 copies of your evidence package (one for you, one for the appraiser, one for the panel).
          </div>
        </div>
      </div>

      <div class="step">
        <div class="step-number">4</div>
        <div class="step-content">
          <div class="step-title">Attend Your Hearing & Present Your Case</div>
          <div class="step-desc">
            Hearings are typically <strong>5–10 minutes</strong>. You can attend in person or by phone/video. Be polite, be factual, and stick to the numbers. The appraiser may offer a settlement before the panel hearing — evaluate it against your target of <span class="val val-teal">${fmtD(d.fairAssessment)}</span>. If the offer isn't good enough, proceed to the panel.
          </div>
        </div>
      </div>
    </div>

    ${iSettleBox}

    <div class="info-box tip">
      <p style="margin: 0 0 6px 0;"><strong>💡 Confidence Level: <span style="color: ${confidenceColor(d.compConfidence)};">${confidenceLabel(d.compConfidence)}</span></strong></p>
      <p style="margin-bottom: 0;">Your evidence package includes <strong>${d.compCount} comparable properties</strong> with a median of <span class="val">${fmtSf(d.compMedianPerSqft)}/sf</span> vs. your current <span class="val val-amber">${fmtSf(d.perSqft)}/sf</span> — that's <strong>${d.overAssessedPct}% over-appraised</strong> compared to your neighbors.${d.compConfidence === "high" ? " This is a very strong case." : ""}</p>
    </div>

    ${renderFooter(d, today)}`;
}

// ──────────────────────────────────────────────────────────────────
// Page 2: Timeline
// ──────────────────────────────────────────────────────────────────

function renderPage2(d: PlaybookData, today: string): string {
  const iSettleStep = d.hasISettle
    ? `
      <div class="timeline-step">
        <div class="timeline-dot pending">3</div>
        <div class="timeline-label">iSettle /<br/>Informal</div>
        <div class="timeline-date">1–4 weeks<br/>after filing</div>
        <div class="timeline-note">Check for online settlement offer</div>
      </div>`
    : `
      <div class="timeline-step">
        <div class="timeline-dot pending">3</div>
        <div class="timeline-label">Informal<br/>Meeting</div>
        <div class="timeline-date">Scheduled<br/>by CAD</div>
        <div class="timeline-note">Meet with appraiser before formal hearing</div>
      </div>`;

  return `
    <!-- PAGE 2: TIMELINE -->
    <div class="page-break"></div>
    ${renderHeader(d, today)}

    <div class="page-title">📅 What Happens Next — Your Timeline</div>
    <div class="page-subtitle">Here's the full protest process from start to finish. Most cases resolve before the ARB hearing.</div>

    <div class="timeline">
      <div class="timeline-step">
        <div class="timeline-dot">1</div>
        <div class="timeline-label">Notice<br/>Received</div>
        <div class="timeline-date">March–April</div>
        <div class="timeline-note">Appraisal notice arrives by mail</div>
      </div>
      <div class="timeline-step">
        <div class="timeline-dot pending">2</div>
        <div class="timeline-label">File<br/>Protest</div>
        <div class="timeline-date">By ${esc(d.deadline)}</div>
        <div class="timeline-note">File online via ${esc(d.filingPortal)}</div>
      </div>
      ${iSettleStep}
      <div class="timeline-step">
        <div class="timeline-dot pending">4</div>
        <div class="timeline-label">ARB<br/>Hearing</div>
        <div class="timeline-date">May–July</div>
        <div class="timeline-note">Present your evidence to panel</div>
      </div>
      <div class="timeline-step">
        <div class="timeline-dot pending">5</div>
        <div class="timeline-label">Decision</div>
        <div class="timeline-date">1–2 weeks<br/>after hearing</div>
        <div class="timeline-note">Written order from ARB</div>
      </div>
    </div>

    <div class="section" style="margin-top: 24px;">
      <div class="section-title">🔑 Key Reminders at Each Stage</div>

      <div class="info-box tip" style="margin-bottom: 12px;">
        <p><strong>Stage 1 — Notice Received</strong></p>
        <p style="margin-bottom: 0;">Compare the notice value to your <strong>opinion of value</strong> (${fmtD(d.fairAssessment)}). Check that your property details are correct — square footage, year built, bedrooms, bathrooms, pool. Errors on the notice strengthen your case. Note your <strong>deadline date</strong> from the notice.</p>
      </div>

      <div class="info-box info" style="margin-bottom: 12px;">
        <p><strong>Stage 2 — File Your Protest</strong></p>
        <p style="margin-bottom: 0;">File immediately — don't wait until the deadline. Early filers often get <strong>earlier hearing dates</strong> and more settlement opportunities. Upload your evidence package when you file. Then send the evidence request letter (page 3) within 7 days.</p>
      </div>

      ${d.hasISettle ? `
      <div class="info-box isettle" style="margin-bottom: 12px;">
        <p><strong>Stage 3 — iSettle / Informal</strong></p>
        <p><strong>Your target:</strong> ${fmtD(d.fairAssessment)} or below = accept. Above = reject and go to hearing.</p>
        <p style="margin-bottom: 0;">Don't feel pressured to accept a bad offer. If you reject iSettle, you'll still get a hearing. Many homeowners get better results at the hearing than through iSettle. Check your email and the portal regularly for offers.</p>
      </div>` : `
      <div class="info-box info" style="margin-bottom: 12px;">
        <p><strong>Stage 3 — Informal Meeting</strong></p>
        <p style="margin-bottom: 0;">The appraisal district may schedule an informal meeting with an appraiser before your formal ARB hearing. Bring your evidence package. The appraiser may offer to settle — evaluate against your target of ${fmtD(d.fairAssessment)}. If no agreement, you proceed to the formal hearing.</p>
      </div>`}

      <div class="info-box warning" style="margin-bottom: 12px;">
        <p><strong>Stage 4 — ARB Hearing</strong></p>
        <p style="margin-bottom: 0;">Print <strong>3 copies</strong> of your evidence package. Use the hearing script on page 4. Keep your presentation to <strong>5 minutes</strong>. Be respectful — the panel members are volunteers. Focus on per-square-foot comparisons. If the appraiser offers a number before the panel, you can accept or proceed.</p>
      </div>

      <div class="info-box tip" style="margin-bottom: 0;">
        <p><strong>Stage 5 — Decision</strong></p>
        <p style="margin-bottom: 0;">You'll receive a written order. If the result is still too high, you can appeal to <strong>District Court</strong> (expensive) or <strong>binding arbitration</strong> (for properties under $5 million — filing fee ~$500). However, most homeowners accept the ARB result. Even a partial reduction saves money.</p>
      </div>
    </div>

    ${renderFooter(d, today)}`;
}

// ──────────────────────────────────────────────────────────────────
// Page 3: CAD Evidence Request Letter
// ──────────────────────────────────────────────────────────────────

function renderPage3(d: PlaybookData, today: string): string {
  const todayLetter = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return `
    <!-- PAGE 3: EVIDENCE REQUEST LETTER -->
    <div class="page-break"></div>
    ${renderHeader(d, today)}

    <div class="page-title">📝 CAD Evidence Request Letter</div>
    <div class="page-subtitle">Send this letter within 7 days of filing your protest. Texas law requires the CAD to provide this evidence for free.</div>

    <div class="info-box tip" style="margin-bottom: 16px;">
      <p><strong>💡 Why This Matters</strong></p>
      <p>Under Texas Tax Code <strong>§41.461(a)</strong>, you have the right to inspect and obtain copies of <strong>all evidence</strong> the appraisal district plans to present at your hearing. Under <strong>§41.461(b)</strong>, the first copy is <strong>free</strong>. Under <strong>§41.67(d)</strong>, any evidence they don't provide to you in advance <strong>cannot be used against you</strong> at the hearing. This letter puts them on notice.</p>
      <p style="margin-bottom: 0;"><strong>🔍 Stale Comps Strategy:</strong> When you receive their evidence, check whether any of their comparable properties have had their values <strong>reduced by other protests</strong>. If an appraiser's comp was protested down to a lower value, that comp actually supports <em>your</em> argument for a lower value. This is extremely common and is one of the most powerful counter-arguments you can make.</p>
    </div>

    <div class="letter">
      <div class="date-line">${todayLetter}</div>

      <div class="addressee">
        <strong>${esc(d.cadName)}</strong><br/>
        ${esc(d.cadAddress)}${d.cadEmail ? `<br/>Email: ${esc(d.cadEmail)}` : ""}
      </div>

      <div class="subject-line">Re: Evidence Request Pursuant to Texas Tax Code §41.461<br/>
      Property Account: ${esc(d.acct)}<br/>
      Property Address: ${esc(d.address)}, ${esc(d.city)}, ${esc(d.state)}</div>

      <p>To Whom It May Concern:</p>

      <p>I have filed a protest of the appraised value of the above-referenced property for the current tax year. Pursuant to <strong>Texas Tax Code §41.461(a)</strong>, I am requesting copies of all data, schedules, formulas, and other information the appraisal district plans to introduce at my protest hearing.</p>

      <p>Specifically, I am requesting the following:</p>

      <ol>
        <li>The complete <strong>property record card</strong> for the subject property, including all characteristics, adjustments, and notes</li>
        <li>All <strong>comparable properties</strong> the district intends to use as evidence, including account numbers, addresses, appraised values, and property characteristics</li>
        <li>The <strong>methodology and adjustments</strong> used to value the subject property, including any cost, income, or market approach worksheets</li>
        <li>Any <strong>sales data</strong> the district intends to rely upon, including sale prices, dates, and verification sources</li>
        <li>The <strong>neighborhood analysis</strong> or mass appraisal model applied to properties in neighborhood ${esc(d.neighborhoodCode)}</li>
        <li>Any <strong>aerial photographs, sketches, or condition reports</strong> related to the subject property</li>
        <li>The <strong>land value schedule</strong> and any site-specific adjustments applied to the subject property</li>
        <li>Any <strong>income and expense data</strong> used in the valuation (if applicable)</li>
        <li>Documentation of any <strong>physical inspection</strong> of the property conducted during the current appraisal cycle</li>
        <li>Any other <strong>evidence, documents, or information</strong> the district plans to present or rely upon at the hearing</li>
      </ol>

      <p>Pursuant to <strong>§41.461(b)</strong>, I am entitled to one free copy of this information. Please also note that under <strong>§41.67(d)</strong>, the appraisal district may not introduce evidence at the hearing that was not provided to me upon request.</p>

      <p>Please provide this information at your earliest convenience to the address below, or by email if available.</p>

      <div class="closing">
        <p>Respectfully,</p>
        <br/>
        <p>_________________________________________<br/>
        Property Owner<br/>
        ${esc(d.address)}<br/>
        ${esc(d.city)}, ${esc(d.state)}<br/>
        Account: ${esc(d.acct)}</p>
      </div>
    </div>

    <div class="info-box info" style="margin-top: 0;">
      <p><strong>📬 How to Send This Letter</strong></p>
      <p style="margin-bottom: 0;"><strong>Option A (Best):</strong> Email to <strong>${d.cadEmail ? esc(d.cadEmail) : `the CAD email listed at ${esc(d.cadWebsite)}`}</strong> — creates a timestamped record.<br/>
      <strong>Option B:</strong> Upload via the ${esc(d.filingPortal)} portal when you file your protest — attach as supporting document.<br/>
      <strong>Option C:</strong> Mail to the address above — use certified mail for proof of delivery.${d.cadPhone ? `<br/><strong>Questions?</strong> Call ${esc(d.cadPhone)}.` : ""}</p>
    </div>

    ${renderFooter(d, today)}`;
}

// ──────────────────────────────────────────────────────────────────
// Page 4: Hearing Script
// ──────────────────────────────────────────────────────────────────

function renderPage4(d: PlaybookData, today: string): string {
  return `
    <!-- PAGE 4: HEARING SCRIPT -->
    <div class="page-break"></div>
    ${renderHeader(d, today)}

    <div class="page-title">🏆 Your Hearing Script</div>
    <div class="page-subtitle">Read this word-for-word at your hearing. It's designed to be a clear, factual 5-minute presentation. Practice it once or twice before you go.</div>

    <div class="info-box tip" style="margin-bottom: 16px;">
      <p style="margin: 0;"><strong>🎯 Tips:</strong> Speak slowly and clearly. Hand the panel members a copy of your evidence package before you begin. Make eye contact with the panel, not the appraiser. You're speaking to the <em>decision-makers</em>, not arguing with the appraiser.</p>
    </div>

    <div class="script-block">
      <div class="section-label"><span class="timing">0:00</span> Introduction — 30 seconds</div>
      <p>"Good morning/afternoon. My name is _________________ and I am the owner of the property at <strong>${esc(d.address)}</strong>, Account Number <strong>${esc(d.acct)}</strong>."</p>
      <p>"I am protesting the appraised value of my property on the grounds of <strong>unequal appraisal</strong> under Texas Tax Code Section 41.41(a)(2). I have provided each of you with a copy of my evidence."</p>

      <div class="section-label"><span class="timing">0:30</span> Property Record Review — 30 seconds</div>
      <p>"Before presenting my comparable evidence, I'd like to confirm that the district's records for my property are accurate. My home is ${fmt(d.sqft)} square feet, built in ${d.yearBuilt}${d.beds ? `, with ${d.beds} bedrooms` : ""}${d.baths ? ` and ${d.baths} bathrooms` : ""}${d.hasPool ? ", with a pool" : ""}. If any of these details are incorrect in the district's records, I'd ask that they be corrected, as errors can inflate the appraised value."</p>

      <div class="section-label"><span class="timing">1:00</span> Equity Evidence — 90 seconds</div>
      <p>"My property is currently appraised at <strong>${fmtD(d.currentAssessment)}</strong>, which comes to <strong>${fmtSf(d.perSqft)} per square foot</strong>."</p>
      <p>"I've identified <strong>${d.compCount} comparable properties</strong> within the same appraisal neighborhood — neighborhood code <strong>${esc(d.neighborhoodCode)}</strong> — with similar characteristics. These are properties the district itself has grouped together as comparable."</p>
      <p>"The <strong>median appraised value</strong> of these comparable properties is <strong>${fmtSf(d.compMedianPerSqft)} per square foot</strong>. My property is appraised <strong>${d.overAssessedPct}% higher</strong> than the median of my comparable neighbors."</p>
      <p>"Under Texas Tax Code <strong>Section 42.26(a)</strong>, the appraised value of my property should not exceed the <strong>median appraised value</strong> of a reasonable number of comparable properties appropriately adjusted. The evidence clearly shows my property exceeds that median."</p>

      <div class="section-label"><span class="timing">2:30</span> Condition Issues — 60 seconds (if applicable)</div>
      <p><em>[If you have condition issues — roof damage, foundation problems, deferred maintenance — present them here. Show photos and repair estimates if available. If no condition issues, skip to the request below.]</em></p>
      <p>"Additionally, my property has [describe condition issues] that the current appraisal does not account for. I have [photos / repair estimates] showing that these issues reduce the market value of my home. These conditions were not reflected in the appraiser's valuation."</p>

      <div class="section-label"><span class="timing">3:30</span> Request — 30 seconds</div>
      <p>"Based on the comparable evidence presented, I am requesting that my appraised value be reduced from <strong>${fmtD(d.currentAssessment)}</strong> to <strong>${fmtD(d.fairAssessment)}</strong>. This reflects the median per-square-foot value of <strong>${fmtSf(d.compMedianPerSqft)}</strong> applied to my <strong>${fmt(d.sqft)} square feet</strong>, which equals <strong>${fmtD(d.fairAssessment)}</strong>."</p>
      <p>"This is consistent with how comparable properties in my neighborhood are valued by this district. I am simply asking to be treated the same as my neighbors. Thank you."</p>
    </div>

    <div class="info-box info">
      <p style="margin: 0;"><strong>📌 After Your Presentation:</strong> The appraiser will present their case. Listen carefully and take notes. When it's your turn to respond, use the rebuttal guide on the next page. Stay calm and factual. The panel appreciates courtesy.</p>
    </div>

    ${renderFooter(d, today)}`;
}

// ──────────────────────────────────────────────────────────────────
// Page 5: Appraiser Rebuttal Guide
// ──────────────────────────────────────────────────────────────────

function renderPage5(d: PlaybookData, today: string): string {
  return `
    <!-- PAGE 5: REBUTTAL GUIDE -->
    <div class="page-break"></div>
    ${renderHeader(d, today)}

    <div class="page-title">⚔️ When the Appraiser Pushes Back</div>
    <div class="page-subtitle">The appraiser will try to defend their value. Here are the 6 most common arguments they'll make — and exactly how to respond.</div>

    <table class="rebuttal-table">
      <thead>
        <tr>
          <th style="width: 38%;">🗣️ When They Say...</th>
          <th style="width: 62%;">💬 You Say...</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="says">"We used different comps than yours."</td>
          <td class="respond">"My comparable properties are all from <strong>neighborhood ${esc(d.neighborhoodCode)}</strong> — the same neighborhood your district assigned to my property. These are properties your own system groups as comparable. If your comps are from outside my neighborhood, I'd argue mine are more appropriate since they reflect the same area, construction quality, and market conditions that the district itself recognizes."</td>
        </tr>
        <tr>
          <td class="says">"Your comps aren't really comparable — they differ in size/age/features."</td>
          <td class="respond">"That's exactly why I'm using a <strong>per-square-foot comparison</strong> rather than raw values — it normalizes for size differences. As for age and features, all of my comps are from the same neighborhood code that the district uses for mass appraisal, which means the district already considers them comparable. I've selected properties with <strong>transparent, consistent criteria</strong> — same neighborhood, similar characteristics."</td>
        </tr>
        <tr>
          <td class="says">"Market conditions support our appraised value."</td>
          <td class="respond">"With respect, I'm not making a market value argument today. I'm arguing <strong>unequal appraisal under §42.26</strong>. The question isn't what my home would sell for — it's whether my property is appraised <strong>equitably</strong> compared to similar properties. At <strong>${fmtSf(d.perSqft)}/sf</strong> vs. the comparable median of <strong>${fmtSf(d.compMedianPerSqft)}/sf</strong>, it clearly is not. Equal and uniform treatment is a constitutional requirement."</td>
        </tr>
        <tr>
          <td class="says">"Your property has [a pool / extra features / upgrades] that justify a higher value."</td>
          <td class="respond">"If the district is applying an adjustment for that feature, I'd like to see the <strong>documented support</strong> for the adjustment amount. A feature only justifies a higher appraisal if the district can demonstrate — with market evidence — that it adds a specific, quantifiable amount of value. Without that documentation, the adjustment is arbitrary. Several of my comps may also have similar features."</td>
        </tr>
        <tr>
          <td class="says">"These aren't sales comps — they're just appraised values."</td>
          <td class="respond">"That's correct, and that's intentional. Under <strong>Texas Tax Code §42.26</strong>, the standard for unequal appraisal is based on <strong>appraised values</strong>, not sales prices. The statute requires that my appraised value not exceed the <strong>median appraised value</strong> of comparable properties. I'm using the district's own appraised values — the exact data the statute contemplates."</td>
        </tr>
        <tr>
          <td class="says">"The condition issues you describe aren't significant enough to affect value."</td>
          <td class="respond">"I respectfully disagree. I have [<em>photos / contractor estimates</em>] showing the scope of these issues. A prospective buyer would negotiate the price down based on these conditions — or walk away entirely. The repair cost is real and documented. If the district hasn't physically inspected my property to verify its condition, then the appraisal doesn't reflect the actual state of the property."</td>
        </tr>
      </tbody>
    </table>

    <div class="info-box tip">
      <p><strong>🧠 General Strategy Tips</strong></p>
      <p>• <strong>Don't argue with the appraiser</strong> — address the panel. The panel members make the decision, not the appraiser.</p>
      <p>• <strong>Stay on §42.26 (equity)</strong> — it's your strongest argument. Don't get pulled into market value debates.</p>
      <p>• <strong>If they introduce evidence you didn't receive</strong>, object under §41.67(d): "I was not provided this evidence in advance and it should be excluded."</p>
      <p style="margin-bottom: 0;">• <strong>It's okay to say "I don't know"</strong> — it's better than guessing. Follow up with "but the comparable data speaks for itself."</p>
    </div>

    ${renderFooter(d, today)}`;
}

// ──────────────────────────────────────────────────────────────────
// Page 6: Condition Documentation Guide
// ──────────────────────────────────────────────────────────────────

function renderPage6(d: PlaybookData, today: string): string {
  return `
    <!-- PAGE 6: CONDITION DOCUMENTATION -->
    <div class="page-break"></div>
    ${renderHeader(d, today)}

    <div class="page-title">📸 Condition Documentation Guide</div>
    <div class="page-subtitle">If your property has any physical issues — even minor ones — documenting them can significantly strengthen your protest. Here's exactly what to photograph and how.</div>

    <div class="section">
      <div class="section-title">What to Photograph (Priority Order)</div>
      <ul class="checklist">
        <li><strong>Roof damage</strong> — missing/damaged shingles, leaks, sagging, age-related wear (highest impact item)</li>
        <li><strong>Foundation issues</strong> — cracks in slab, walls, or brick veneer; doors that stick; uneven floors</li>
        <li><strong>Water damage</strong> — stains on ceilings/walls, mold, past flooding evidence, damaged drywall</li>
        <li><strong>HVAC system age/condition</strong> — old units (15+ years), visible rust, non-functional components</li>
        <li><strong>Plumbing issues</strong> — leaking pipes, water heater age, low water pressure, galvanized pipes</li>
        <li><strong>Electrical problems</strong> — outdated panel, knob-and-tube wiring, non-functional outlets</li>
        <li><strong>Exterior deterioration</strong> — peeling paint, rotting wood, damaged siding, cracked driveway</li>
        <li><strong>Fence damage</strong> — leaning, rotting posts, missing sections</li>
        <li><strong>Window/door issues</strong> — broken seals (foggy double-pane), drafts, damaged frames</li>
        <li><strong>Pool/spa problems</strong> (if applicable) — cracked decking, equipment failures, staining</li>
        <li><strong>Drainage/grading</strong> — standing water, erosion, negative grading toward foundation</li>
        <li><strong>Interior wear</strong> — damaged flooring, outdated kitchen/bath (only if significantly below neighborhood standard)</li>
      </ul>
    </div>

    <div class="info-box info" style="margin-bottom: 16px;">
      <p><strong>📷 Photo Tips for Maximum Impact</strong></p>
      <p>• <strong>Date stamp your photos</strong> — turn on the date feature in your camera app, or hold up a newspaper/phone showing the date</p>
      <p>• <strong>Take two shots of each issue:</strong> one wide shot (showing context/location) and one close-up (showing detail)</p>
      <p>• <strong>Include a ruler or common object</strong> (credit card, coin) for scale when photographing cracks or damage</p>
      <p>• <strong>Photograph in good lighting</strong> — use your phone's flashlight for dark areas</p>
      <p style="margin-bottom: 0;">• <strong>Label your photos</strong> — name files descriptively (e.g., "roof-damage-north-side.jpg", "foundation-crack-garage.jpg")</p>
    </div>

    <div class="section">
      <div class="section-title">🔧 Getting Free Repair Estimates</div>
      <div style="font-size: 10.5px; line-height: 1.7; color: #444;">
        <p style="margin-bottom: 8px;">Repair estimates from licensed contractors are <strong>powerful evidence</strong>. Most contractors will provide free estimates — they want the work. Here's how to get them:</p>
        <p style="margin-bottom: 6px;"><strong>1. Roof:</strong> Call 2–3 local roofing companies and ask for a free inspection and written estimate. Most will come out same-week. Get estimates for both repair and replacement.</p>
        <p style="margin-bottom: 6px;"><strong>2. Foundation:</strong> Foundation repair companies (e.g., Olshan, Perma-Pier, or local firms) almost always offer free inspections with detailed reports showing pier placement and costs.</p>
        <p style="margin-bottom: 6px;"><strong>3. HVAC/Plumbing/Electrical:</strong> Ask for a written estimate when you have any service call. Companies like Home Depot and Lowe's also provide free estimates for replacements.</p>
        <p style="margin-bottom: 6px;"><strong>4. General:</strong> Apps like Thumbtack, Angi, and HomeAdvisor can get you multiple free estimates quickly.</p>
        <p style="margin-bottom: 0;"><strong>Tip:</strong> You don't need to actually do the repairs. The <em>estimate</em> itself is the evidence. The panel understands that these issues reduce your home's value whether or not you've fixed them yet.</p>
      </div>
    </div>

    <div class="info-box warning">
      <p><strong>📤 Where to Submit Your Photos & Estimates</strong></p>
      <p>• <strong>With your protest filing:</strong> Upload photos and estimates as attachments when you file via <strong>${esc(d.filingPortal)}</strong> at <a href="${esc(d.filingUrl)}" class="link">${esc(d.cadWebsite)}</a></p>
      <p>• <strong>At your hearing:</strong> Print photos in <strong>color</strong> (3 copies — for you, appraiser, and panel). Organize them with labels.</p>
      <p style="margin-bottom: 0;">• <strong>By mail/email:</strong> Send to ${esc(d.cadName)} before your hearing date. Reference your account number <span class="acct">${esc(d.acct)}</span> on all submissions.</p>
    </div>

    ${renderFooter(d, today)}`;
}

// ──────────────────────────────────────────────────────────────────
// Page 7: Homestead Exemption Alert (conditional)
// ──────────────────────────────────────────────────────────────────

function renderPage7Homestead(d: PlaybookData, today: string): string {
  const exemptionLink = d.exemptionUrl
    ? `<a href="${esc(d.exemptionUrl)}" class="link">${esc(d.exemptionUrl)}</a>`
    : `<a href="${esc(d.cadWebsite)}" class="link">${esc(d.cadWebsite)}</a> → Exemptions`;

  return `
    <!-- PAGE 7: HOMESTEAD EXEMPTION ALERT -->
    <div class="page-break"></div>
    ${renderHeader(d, today)}

    <div class="homestead-alert">
      <h2>⚠️ You May Be Missing Your Homestead Exemption</h2>
      <p style="font-size: 12px; color: #555; margin-bottom: 0;">Our records suggest you may not have a homestead exemption on file. This is <strong>separate from your protest</strong> — and it could save you even more than the protest itself.</p>
    </div>

    <div class="section">
      <div class="section-title">💰 What You're Missing</div>

      <div class="homestead-savings">
        <div class="card">
          <div class="amount">$100,000</div>
          <div class="label">School Tax Exemption</div>
        </div>
        <div class="card">
          <div class="amount">~$40,000+</div>
          <div class="label">County/City Exemptions (varies)</div>
        </div>
        <div class="card">
          <div class="amount">~$1,400+</div>
          <div class="label">Est. Annual Tax Savings</div>
        </div>
      </div>

      <div style="font-size: 11px; line-height: 1.7; color: #444; margin-top: 12px;">
        <p style="margin-bottom: 8px;">The Texas homestead exemption provides three major benefits:</p>
        <p style="margin-bottom: 6px;"><strong>1. $100,000 school tax exemption</strong> — Reduces your taxable value for school district taxes by $100,000. At a typical school tax rate of ~1.0%, that's ~$1,000/year in savings.</p>
        <p style="margin-bottom: 6px;"><strong>2. County/city exemptions</strong> — Many local taxing entities offer additional homestead exemptions (often $5,000–$40,000+). These vary by county and city.</p>
        <p style="margin-bottom: 6px;"><strong>3. 10% appraisal cap</strong> — Once you have a homestead exemption, your <strong>appraised value cannot increase by more than 10% per year</strong>, regardless of market conditions. This is enormously valuable in a rising market.</p>
        <p style="margin-bottom: 0;"><strong>4. Retroactive filing</strong> — You can file for homestead exemption <strong>retroactively for up to 2 prior years</strong>, potentially getting refunds for taxes you overpaid.</p>
      </div>
    </div>

    <div class="section">
      <div class="section-title">📋 How to File (5 Minutes)</div>

      <div class="steps">
        <div class="step">
          <div class="step-number">1</div>
          <div class="step-content">
            <div class="step-title">Go to the Exemption Portal</div>
            <div class="step-desc">${exemptionLink}</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">2</div>
          <div class="step-content">
            <div class="step-title">Fill Out the Application</div>
            <div class="step-desc">You'll need your <strong>driver's license</strong> or <strong>state ID</strong> (must match the property address) and your <strong>account number</strong>: <span class="acct">${esc(d.acct)}</span>. Some counties accept online applications; others require a downloadable form.</div>
          </div>
        </div>
        <div class="step">
          <div class="step-number">3</div>
          <div class="step-content">
            <div class="step-title">Submit & Confirm</div>
            <div class="step-desc">Submit online or mail to ${esc(d.cadName)}. You'll receive confirmation once approved. <strong>Check the retroactive box</strong> to claim exemptions for up to 2 prior years.</div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-box alert">
      <p><strong>🚨 Don't Skip This</strong></p>
      <p style="margin-bottom: 0;">The homestead exemption is the single most valuable tax benefit available to Texas homeowners. If you own and live in this property, there is <strong>no reason not to file</strong>. It's free, takes 5 minutes, and saves you money <strong>every single year</strong> — potentially more than the protest itself. Do it today.</p>
    </div>

    ${renderFooter(d, today)}`;
}

// ──────────────────────────────────────────────────────────────────
// Main Generator
// ──────────────────────────────────────────────────────────────────

function generatePlaybookHtml(data: PlaybookData): string {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const showHomesteadPage = data.hasHomesteadExemption === false;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Homeowner Playbook — ${esc(data.address)}</title>
  <style>${getStyles()}</style>
</head>
<body>
  <div class="page">
    ${renderPage1(data, today)}
    ${renderPage2(data, today)}
    ${renderPage3(data, today)}
    ${renderPage4(data, today)}
    ${renderPage5(data, today)}
    ${renderPage6(data, today)}
    ${showHomesteadPage ? renderPage7Homestead(data, today) : ""}
  </div>
</body>
</html>`;
}

// ──────────────────────────────────────────────────────────────────
// Exports
// ──────────────────────────────────────────────────────────────────

export { generatePlaybookHtml };
export type { PlaybookData };
