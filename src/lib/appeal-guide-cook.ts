/**
 * Appeal Guide Generator — Cook County, IL
 * Comprehensive guide covering both Assessor and Board of Review appeals.
 * Replaces the old Quick Start Guide.
 */

import { escapeHtml } from "@/lib/security";
import type { ReassessmentStatus } from "@/lib/cook-township-reassessment";

export interface CookAppealGuideData {
  address: string;
  pin: string;
  township: string;
  currentAssessment: number;
  fairAssessment: number;
  estimatedSavings: number;
  overAssessedPct: number;
  perSqft: number;
  compMedianPerSqft: number;
  compCount: number;
  notesForFiling: string;
  /** Top 5 comparable PINs (14-digit raw) */
  topCompPins: string[];
  reassessment: ReassessmentStatus;
}

function formatPin(pin: string): string {
  return pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
}

export function generateCookAppealGuideHtml(data: CookAppealGuideData): string {
  const fPin = formatPin(data.pin);
  const r = data.reassessment;
  const totalSavings = data.estimatedSavings * r.savingsMultiplier;
  const compPinsFormatted = data.topCompPins.map(formatPin);
  const compPinsList = compPinsFormatted.map((p, i) => `<span style="font-family: 'SF Mono', Consolas, monospace; background: #e8f4f0; padding: 2px 6px; border-radius: 3px; font-size: 11px;">${p}</span>`).join('&nbsp; ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Property Tax Appeal Guide — Cook County</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: letter; margin: 0.65in; }
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; font-size: 11.5px; line-height: 1.55; color: #1a1a1a; background: #fff; }
    .page { page-break-after: always; min-height: 9in; position: relative; padding-bottom: 36px; }
    .page:last-child { page-break-after: auto; }
    
    .header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 14px; border-bottom: 3px solid #1a6b5a; margin-bottom: 24px; }
    .logo { font-size: 20px; font-weight: 800; color: #1a6b5a; letter-spacing: -0.5px; }
    .header-right { font-size: 9px; color: #888; text-align: right; }
    
    h1 { font-size: 24px; font-weight: 800; color: #1a1a1a; margin-bottom: 6px; }
    h2 { font-size: 16px; font-weight: 700; color: #1a6b5a; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 2px solid #e2e8f0; }
    h3 { font-size: 13px; font-weight: 700; color: #1a6b5a; margin-bottom: 8px; }
    
    .hero { text-align: center; margin-bottom: 28px; }
    .hero h1 { font-size: 26px; margin-bottom: 4px; }
    .hero .addr { font-size: 15px; color: #444; margin-bottom: 2px; }
    .hero .meta { font-size: 11px; color: #888; }
    
    .savings-banner { background: #e8f4f0; border: 2px solid #1a6b5a; border-radius: 10px; padding: 18px 22px; text-align: center; margin-bottom: 24px; }
    .savings-banner .amount { font-size: 28px; font-weight: 800; color: #1a6b5a; }
    .savings-banner .detail { font-size: 12px; color: #1a6b5a; margin-top: 2px; }
    
    .info-grid { display: flex; gap: 12px; margin-bottom: 20px; }
    .info-card { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 14px; }
    .info-card .label { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #888; font-weight: 600; margin-bottom: 3px; }
    .info-card .value { font-size: 16px; font-weight: 700; color: #1a1a1a; }
    .info-card .sub { font-size: 10px; color: #666; margin-top: 1px; }
    .info-card.alert { border-color: #f59e0b; background: #fffbeb; }
    .info-card.alert .value { color: #b45309; }
    .info-card.success { border-color: #1a6b5a; background: #e8f4f0; }
    .info-card.success .value { color: #1a6b5a; }
    
    .reassessment-box { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 11px; }
    .reassessment-box strong { color: #0369a1; }
    
    .step { display: flex; margin-bottom: 14px; }
    .step-num { width: 26px; height: 26px; background: #1a6b5a; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; flex-shrink: 0; margin-right: 12px; margin-top: 1px; }
    .step-body { flex: 1; }
    .step-title { font-weight: 700; font-size: 12px; margin-bottom: 3px; }
    .step-desc { font-size: 11px; color: #444; line-height: 1.65; }
    
    .filing-box { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 6px; padding: 14px 16px; margin: 10px 0; font-size: 11px; }
    .filing-row { display: flex; margin-bottom: 5px; }
    .filing-row:last-child { margin-bottom: 0; }
    .filing-label { width: 140px; color: #666; flex-shrink: 0; }
    .filing-value { color: #1a1a1a; font-weight: 600; }
    
    .warning-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 11px 14px; margin: 10px 0; font-size: 11px; line-height: 1.6; }
    
    .tip-box { background: #e8f4f0; border: 1px solid #1a6b5a; border-radius: 6px; padding: 11px 14px; margin: 10px 0; font-size: 11px; line-height: 1.6; }
    
    .notes-box { background: #f8f9fa; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 16px 18px; font-size: 11px; line-height: 1.75; color: #333; font-family: 'Georgia', serif; margin: 10px 0; }
    .notes-box p { margin-bottom: 8px; }
    .notes-box p:last-child { margin-bottom: 0; }
    
    .timeline { display: flex; align-items: center; justify-content: center; gap: 0; margin: 20px 0; }
    .tl-step { text-align: center; flex: 1; }
    .tl-dot { width: 14px; height: 14px; background: #1a6b5a; border-radius: 50%; margin: 0 auto 6px; }
    .tl-label { font-size: 9.5px; font-weight: 600; color: #1a6b5a; }
    .tl-sub { font-size: 8.5px; color: #888; }
    .tl-line { width: 100%; height: 3px; background: #d1d5db; flex: 1; margin-top: -20px; }
    
    .faq-item { margin-bottom: 14px; }
    .faq-q { font-weight: 700; font-size: 12px; color: #1a1a1a; margin-bottom: 3px; }
    .faq-a { font-size: 11px; color: #444; line-height: 1.65; }
    
    .cta-box { background: #1a6b5a; color: #fff; border-radius: 10px; padding: 16px 20px; text-align: center; margin-top: 24px; }
    .cta-box .cta-text { font-size: 14px; font-weight: 600; }
    
    .footer { position: absolute; bottom: 0; left: 0; right: 0; text-align: center; font-size: 9px; color: #bbb; }
    
    @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
  </style>
</head>
<body>

<!-- PAGE 1: ACTION SUMMARY -->
<div class="page">
  <div class="header">
    <div style="display: flex; align-items: center; gap: 8px;">
      <svg width="24" height="24" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#1a6b5a"/><circle cx="16" cy="15.5" r="8" fill="none" stroke="white" stroke-width="3.5"/></svg>
      <span class="logo">overtaxed</span>
    </div>
    <div class="header-right">Appeal Guide · Cook County, IL</div>
  </div>
  
  <div class="hero">
    <h1>Your Property Tax Appeal Guide</h1>
    <div class="addr">${escapeHtml(data.address)}</div>
    <div class="meta">PIN: ${fPin} · ${escapeHtml(data.township)} Township · Cook County, IL</div>
  </div>
  
  <div class="savings-banner">
    <div class="amount">Save ${formatCurrency(data.estimatedSavings)}/year</div>
    <div class="detail">${formatCurrency(totalSavings)} over ${r.savingsMultiplier === 3 ? 'the 3-year reassessment cycle' : r.savingsMultiplier === 2 ? 'the next 2 years' : 'this year'}</div>
  </div>
  
  <div class="info-grid">
    <div class="info-card alert">
      <div class="label">Current Assessment</div>
      <div class="value">${formatCurrency(data.currentAssessment)}</div>
      <div class="sub">${data.overAssessedPct}% above comparables</div>
    </div>
    <div class="info-card success">
      <div class="label">Fair Assessment</div>
      <div class="value">${formatCurrency(data.fairAssessment)}</div>
      <div class="sub">Based on ${data.compCount} comparable properties</div>
    </div>
    <div class="info-card">
      <div class="label">Township</div>
      <div class="value">${escapeHtml(data.township)}</div>
      <div class="sub">${r.district}</div>
    </div>
  </div>
  
  <div class="reassessment-box">
    <strong>${r.district} — ${r.isReassessmentYear ? `${r.reassessmentYear} Reassessment Year` : `Off-Year (last reassessment: ${r.reassessmentYear})`}</strong><br>
    ${r.message}
  </div>
  
  <div class="cta-box">
    <div class="cta-text">Start with Step 1 on page 2 →</div>
    <div style="font-size: 11px; margin-top: 4px; opacity: 0.85;">You have TWO chances to appeal. This guide walks you through both.</div>
  </div>
  
  <div class="footer">Page 1 · Generated by Overtaxed</div>
</div>

<!-- PAGES 2-3: THE TWO-BITE STRATEGY -->
<div class="page">
  <div class="header">
    <div style="display: flex; align-items: center; gap: 8px;">
      <svg width="24" height="24" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#1a6b5a"/><circle cx="16" cy="15.5" r="8" fill="none" stroke="white" stroke-width="3.5"/></svg>
      <span class="logo">overtaxed</span>
    </div>
    <div class="header-right">The Two-Bite Strategy</div>
  </div>
  
  <h2>The Two-Bite Strategy: Two Free Chances to Lower Your Taxes</h2>
  
  <p style="font-size: 12px; line-height: 1.7; margin-bottom: 16px;">Cook County gives you <strong>two separate opportunities</strong> to appeal your property tax assessment — first with the <strong>Assessor's Office</strong>, then with the <strong>Board of Review</strong>. Professional tax appeal firms file at both levels. You should too. <strong>It's completely free.</strong></p>
  
  <!-- Timeline -->
  <div style="display: flex; align-items: flex-start; gap: 0; margin: 24px 0; padding: 0 10px;">
    <div style="flex: 1; text-align: center;">
      <div style="width: 36px; height: 36px; background: #1a6b5a; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px;">1</div>
      <div style="font-size: 11px; font-weight: 700; color: #1a6b5a;">Reassessment<br>Notice</div>
      <div style="font-size: 9px; color: #888; margin-top: 3px;">Assessment values<br>are published</div>
    </div>
    <div style="flex: 0.6; height: 3px; background: #d1d5db; margin-top: 18px;"></div>
    <div style="flex: 1; text-align: center;">
      <div style="width: 36px; height: 36px; background: #1a6b5a; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px;">2</div>
      <div style="font-size: 11px; font-weight: 700; color: #1a6b5a;">Assessor<br>Appeal</div>
      <div style="font-size: 9px; color: #888; margin-top: 3px;">~30 day window<br>First level</div>
    </div>
    <div style="flex: 0.6; height: 3px; background: #d1d5db; margin-top: 18px;"></div>
    <div style="flex: 1; text-align: center;">
      <div style="width: 36px; height: 36px; background: #1a6b5a; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 14px;">3</div>
      <div style="font-size: 11px; font-weight: 700; color: #1a6b5a;">Board of<br>Review</div>
      <div style="font-size: 9px; color: #888; margin-top: 3px;">~30 day window<br>Second level</div>
    </div>
    <div style="flex: 0.6; height: 3px; background: #d1d5db; margin-top: 18px;"></div>
    <div style="flex: 1; text-align: center;">
      <div style="width: 36px; height: 36px; background: #e8f4f0; border: 2px solid #1a6b5a; border-radius: 50%; margin: 0 auto 8px; display: flex; align-items: center; justify-content: center; color: #1a6b5a; font-weight: 700; font-size: 14px;">✓</div>
      <div style="font-size: 11px; font-weight: 700; color: #1a6b5a;">Results</div>
      <div style="font-size: 9px; color: #888; margin-top: 3px;">Lower assessment<br>= lower taxes</div>
    </div>
  </div>
  
  <div style="display: flex; gap: 14px; margin: 24px 0;">
    <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
      <h3 style="margin-bottom: 6px;">Level 1: Assessor Appeal</h3>
      <ul style="font-size: 11px; color: #444; margin-left: 16px; line-height: 1.7;">
        <li>File online at cookcountyassessoril.gov</li>
        <li>Just enter comparable PINs — no documents needed</li>
        <li>The Assessor's analysts review on their own too</li>
        <li>Results in weeks to months</li>
      </ul>
    </div>
    <div style="flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px;">
      <h3 style="margin-bottom: 6px;">Level 2: Board of Review</h3>
      <ul style="font-size: 11px; color: #444; margin-left: 16px; line-height: 1.7;">
        <li>File online at cookcountyboardofreview.com</li>
        <li>Upload your Evidence Packet PDF</li>
        <li>Include notes + photo of property</li>
        <li>Results 60-90 days after filing closes</li>
      </ul>
    </div>
  </div>
  
  ${r.isReassessmentYear ? `
  <div class="tip-box">
    <strong>🎯 Reassessment Year Advantage:</strong> Your assessment just changed in ${r.reassessmentYear}. A reduction now locks in savings for the full 3-year reassessment cycle — that's up to <strong>${formatCurrency(totalSavings)}</strong> in total savings.
  </div>
  ` : `
  <div class="tip-box">
    <strong>💡 Off-Year Tip:</strong> Even though this isn't a reassessment year for ${escapeHtml(data.township)} Township, reductions are still possible — especially at the Board of Review. Your next reassessment is in ${r.nextReassessmentYear}.
  </div>
  `}
  
  <div class="warning-box">
    <strong>⚠️ File at BOTH levels.</strong> Even if the Assessor reduces your value, you can still file with the Board of Review for an additional reduction. Professional firms always do this. You should too.
  </div>
  
  <div class="footer">Page 2 · Generated by Overtaxed</div>
</div>

<!-- PAGES 4-6: ASSESSOR APPEAL WALKTHROUGH -->
<div class="page">
  <div class="header">
    <div style="display: flex; align-items: center; gap: 8px;">
      <svg width="24" height="24" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#1a6b5a"/><circle cx="16" cy="15.5" r="8" fill="none" stroke="white" stroke-width="3.5"/></svg>
      <span class="logo">overtaxed</span>
    </div>
    <div class="header-right">Level 1: Assessor Appeal</div>
  </div>
  
  <h2>Level 1: Assessor Appeal — Step by Step</h2>
  
  <p style="font-size: 11.5px; line-height: 1.7; margin-bottom: 16px;">The Assessor's Office is your <strong>first chance</strong> to get a reduction. It's simpler than the Board of Review — you just enter comparable PINs online. No documents to upload.</p>
  
  <div class="step">
    <div class="step-num">1</div>
    <div class="step-body">
      <div class="step-title">Check if your township is open for appeals</div>
      <div class="step-desc">Go to <strong>cookcountyassessoril.gov/online-appeals</strong>. Your township (<strong>${escapeHtml(data.township)}</strong>) must be listed as open. Each township opens for approximately 30 days after reassessment notices are mailed.</div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-num">2</div>
    <div class="step-body">
      <div class="step-title">Start your appeal</div>
      <div class="step-desc">Click "File an Appeal" and enter your PIN: <strong style="font-family: monospace; background: #f0f0f0; padding: 1px 4px; border-radius: 3px;">${escapeHtml(data.pin)}</strong>. The system will pull up your property details.</div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-num">3</div>
    <div class="step-body">
      <div class="step-title">Select appeal reasons</div>
      <div class="step-desc">Select <strong>both</strong> "Overvaluation" AND "Lack of Uniformity" as your appeal reasons. This gives you two bases for a reduction.</div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-num">4</div>
    <div class="step-body">
      <div class="step-title">Enter comparable PINs</div>
      <div class="step-desc">Enter these comparable property PINs when prompted. These are your strongest comps — all assessed lower per square foot than your property:</div>
    </div>
  </div>
  
  <!-- Comp PINs box -->
  <div class="filing-box" style="margin-left: 38px;">
    <div style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #888; font-weight: 600; margin-bottom: 8px;">Comparable PINs to Enter</div>
    ${compPinsFormatted.map((p, i) => `<div class="filing-row"><span class="filing-label">Comp ${i + 1}:</span><span class="filing-value" style="font-family: 'SF Mono', Consolas, monospace;">${p}</span></div>`).join('')}
  </div>
  
  <div class="step">
    <div class="step-num">5</div>
    <div class="step-body">
      <div class="step-title">Submit your appeal</div>
      <div class="step-desc">Review your information and submit. You'll receive a confirmation number — save it as proof.</div>
    </div>
  </div>
  
  <div class="tip-box" style="margin-top: 16px;">
    <strong>💡 Good to know:</strong> You don't need to upload documents at the Assessor level — just entering comparable PINs is often enough. The Assessor's analysts will also review comparables on their own.
  </div>
  
  <!-- Quick Reference Filing Box -->
  <div style="background: #f8f9fa; border: 2px solid #1a6b5a; border-radius: 8px; padding: 16px 18px; margin-top: 16px;">
    <div style="font-size: 11px; font-weight: 700; color: #1a6b5a; margin-bottom: 10px;">📋 Quick Reference — Assessor Appeal</div>
    <div class="filing-row"><span class="filing-label">Website:</span><span class="filing-value">cookcountyassessoril.gov/online-appeals</span></div>
    <div class="filing-row"><span class="filing-label">Your PIN:</span><span class="filing-value" style="font-family: monospace;">${fPin}</span></div>
    <div class="filing-row"><span class="filing-label">Township:</span><span class="filing-value">${escapeHtml(data.township)}</span></div>
    <div class="filing-row"><span class="filing-label">Appeal Type:</span><span class="filing-value">Overvaluation + Lack of Uniformity</span></div>
    <div class="filing-row"><span class="filing-label">Comps to Enter:</span><span class="filing-value">${compPinsFormatted.length} PINs (listed above)</span></div>
  </div>
  
  <div class="footer">Page 3 · Generated by Overtaxed</div>
</div>

<!-- PAGES 7-12: BOARD OF REVIEW FILING WALKTHROUGH -->
<div class="page">
  <div class="header">
    <div style="display: flex; align-items: center; gap: 8px;">
      <svg width="24" height="24" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#1a6b5a"/><circle cx="16" cy="15.5" r="8" fill="none" stroke="white" stroke-width="3.5"/></svg>
      <span class="logo">overtaxed</span>
    </div>
    <div class="header-right">Level 2: Board of Review</div>
  </div>
  
  <h2>Level 2: Board of Review — Step by Step</h2>
  
  <p style="font-size: 11.5px; line-height: 1.7; margin-bottom: 16px;">The Board of Review is your <strong>second (and strongest) chance</strong> for a reduction. You'll upload the Evidence Packet PDF that came with this guide, plus paste in your appeal notes. No account required.</p>
  
  <div class="step">
    <div class="step-num">1</div>
    <div class="step-body">
      <div class="step-title">Check if your township is open</div>
      <div class="step-desc">Go to <strong>cookcountyboardofreview.com</strong> and check the homepage. Your township (<strong>${escapeHtml(data.township)}</strong>) must show as "OPEN" to file. Each township opens for ~30 days.</div>
    </div>
  </div>
  
  <div class="warning-box" style="margin-left: 38px;">
    ⏰ Each township opens for ~30 days. File as soon as it opens — you can't file after it closes.
  </div>
  
  <div class="step">
    <div class="step-num">2</div>
    <div class="step-body">
      <div class="step-title">Click "Submit Appeal as Guest"</div>
      <div class="step-desc">On the homepage, click <strong>"Submit Appeal as Guest"</strong> in the top menu. You do NOT need an account. Read the Terms and click <strong>"I Agree"</strong>.</div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-num">3</div>
    <div class="step-body">
      <div class="step-title">Page 1 — Enter your property info</div>
      <div class="step-desc">
        Fill in the following:
      </div>
    </div>
  </div>
  
  <div class="filing-box" style="margin-left: 38px;">
    <div class="filing-row"><span class="filing-label">Type of Appeal:</span><span class="filing-value">Property Over-Assessed</span></div>
    <div class="filing-row"><span class="filing-label">PIN:</span><span class="filing-value" style="font-family: monospace;">${escapeHtml(data.pin)}</span></div>
    <div class="filing-row"><span class="filing-label">Are you an attorney?</span><span class="filing-value">No</span></div>
    <div class="filing-row"><span class="filing-label">Request a hearing?</span><span class="filing-value">No (written evidence is stronger)</span></div>
  </div>
  <div style="margin-left: 38px; font-size: 11px; color: #444; margin-top: 6px;">Complete the reCAPTCHA and click <strong>"Next"</strong>.</div>
  
  <div class="step" style="margin-top: 14px;">
    <div class="step-num">4</div>
    <div class="step-body">
      <div class="step-title">Page 2 — Your information + Notes</div>
      <div class="step-desc">
        • <strong>Associated PINs:</strong> Select "No" unless you have multiple parcels<br>
        • Enter your <strong>name, address, phone, and email</strong><br>
        • <strong>Appellant Type:</strong> "Property Owner"<br>
        • <strong>Request a Hearing?</strong> Select <strong>"No"</strong><br>
        • <strong>Recent Purchase:</strong> Select year if bought in last 3 years, otherwise "Other"<br>
        • <strong>Notes:</strong> Copy and paste the text from the next page exactly as-is<br>
        • Click <strong>"Next"</strong>
      </div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-num">5</div>
    <div class="step-body">
      <div class="step-title">Page 3 — Review & Submit</div>
      <div class="step-desc">
        Review all your information. Check the confirmation box, type your initials (electronic signature), and click <strong>"Submit"</strong>.
      </div>
    </div>
  </div>
  
  <div class="footer">Page 4 · Generated by Overtaxed</div>
</div>

<!-- BOR continued: Evidence upload + Notes -->
<div class="page">
  <div class="header">
    <div style="display: flex; align-items: center; gap: 8px;">
      <svg width="24" height="24" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#1a6b5a"/><circle cx="16" cy="15.5" r="8" fill="none" stroke="white" stroke-width="3.5"/></svg>
      <span class="logo">overtaxed</span>
    </div>
    <div class="header-right">Level 2: Board of Review (continued)</div>
  </div>
  
  <div class="step">
    <div class="step-num">6</div>
    <div class="step-body">
      <div class="step-title">Page 4 — Upload your evidence</div>
      <div class="step-desc">
        • "Do you plan on submitting Evidence?" → Click <strong>"Yes"</strong><br>
        • Click "Browse" and select your <strong>Evidence Packet PDF</strong><br>
        • For Document Type, select <strong>"BOR Appraisal"</strong><br>
        • Click "Submit"<br>
        • Then upload a <strong>photo of the front of your property</strong> (required — see below)
      </div>
    </div>
  </div>
  
  <div class="step">
    <div class="step-num">7</div>
    <div class="step-body">
      <div class="step-title">Done! Save your BOR Complaint Number</div>
      <div class="step-desc">
        After submitting, you'll receive a <strong>BOR Complaint Number</strong>. Save this as proof. The Board typically responds within 60-90 days after your township's filing period closes.
      </div>
    </div>
  </div>
  
  <!-- Photo requirement -->
  <div class="warning-box" style="margin-top: 20px;">
    <strong>📸 Required: Photo of Your Property (Board Rule #17)</strong><br>
    Take a clear photo of the <strong>full front</strong> of your building with your phone. Make sure it shows:
    <ul style="margin: 6px 0 0 16px;">
      <li>The entire front of the building</li>
      <li>Exterior material (brick, frame, etc.)</li>
      <li>General condition</li>
    </ul>
    Upload as a separate file on the evidence page.
  </div>
  
  <!-- LLC warning -->
  <div class="warning-box">
    <strong>⚠️ LLC / Trust / Corporation:</strong> If your property is owned by an LLC, trust, or corporation, the Board of Review <strong>requires an attorney</strong> to file on your behalf. Individual homeowners can file themselves.
  </div>
  
  <h3 style="margin-top: 24px; font-size: 14px;">Copy & Paste Into the "Notes" Field (Step 4)</h3>
  <p style="font-size: 10px; color: #666; margin-bottom: 8px;">Copy the text below and paste it into the Notes field on Page 2 of the Board of Review form:</p>
  
  <div class="notes-box">
    ${data.notesForFiling}
  </div>
  
  <div class="footer">Page 5 · Generated by Overtaxed</div>
</div>

<!-- PAGES 13-14: FAQ -->
<div class="page">
  <div class="header">
    <div style="display: flex; align-items: center; gap: 8px;">
      <svg width="24" height="24" viewBox="0 0 32 32"><rect width="32" height="32" rx="7" fill="#1a6b5a"/><circle cx="16" cy="15.5" r="8" fill="none" stroke="white" stroke-width="3.5"/></svg>
      <span class="logo">overtaxed</span>
    </div>
    <div class="header-right">Frequently Asked Questions</div>
  </div>
  
  <h2>Frequently Asked Questions</h2>
  
  <div class="faq-item">
    <div class="faq-q">Can my assessment go UP if I appeal?</div>
    <div class="faq-a">No. The Assessor and Board of Review can only reduce or maintain your assessment in response to an appeal. They cannot increase it. There is zero risk to filing.</div>
  </div>
  
  <div class="faq-item">
    <div class="faq-q">Do I need a lawyer?</div>
    <div class="faq-a">No — individual homeowners can file both appeals themselves for free. The only exception: if your property is owned by an LLC, trust, or corporation, the Board of Review requires an attorney to file on your behalf.</div>
  </div>
  
  <div class="faq-item">
    <div class="faq-q">Should I request a hearing?</div>
    <div class="faq-a">Usually no. For residential properties, written evidence (your Evidence Packet) is typically stronger than an in-person hearing. Hearings are brief and don't give you more time to present evidence. Select "No" unless you have a unique situation.</div>
  </div>
  
  <div class="faq-item">
    <div class="faq-q">What if the Assessor already reduced my value?</div>
    <div class="faq-a">Still file with the Board of Review! The BOR is an independent body — they can grant an additional reduction on top of what the Assessor gave you. Professional firms always file at both levels.</div>
  </div>
  
  <div class="faq-item">
    <div class="faq-q">What's the equalization factor?</div>
    <div class="faq-a">The equalization factor (also called the "multiplier") is applied by the Illinois Department of Revenue <em>after</em> the assessed value is set. It adjusts Cook County assessments to match state-wide standards. Your appeal targets the assessed value — the factor is applied afterward and is the same for everyone in the county.</div>
  </div>
  
  <div class="faq-item">
    <div class="faq-q">What about PTAB (Property Tax Appeal Board)?</div>
    <div class="faq-a">PTAB is a third-level appeal option if the Board of Review denies your case. However, most residential cases don't go to PTAB — it's a longer process primarily used for commercial properties or unusually large discrepancies. The Assessor + Board of Review are your best bets.</div>
  </div>
  
  <div class="faq-item">
    <div class="faq-q">How long until I see results?</div>
    <div class="faq-a"><strong>Assessor:</strong> Weeks to months, depending on township volume.<br><strong>Board of Review:</strong> Typically 60-90 days after the filing period closes for your township. You'll receive a decision by mail.</div>
  </div>
  
  <div class="faq-item">
    <div class="faq-q">Is there a cost to file?</div>
    <div class="faq-a">No. Both the Assessor appeal and Board of Review appeal are completely free to file.</div>
  </div>
  
  <div style="margin-top: 28px; padding: 16px 20px; background: #f7f6f3; border-radius: 10px; text-align: center;">
    <div style="font-size: 13px; font-weight: 600; color: #1a1a1a; margin-bottom: 4px;">Questions? We're here to help.</div>
    <div style="font-size: 11px; color: #666;">Reply to the email that delivered this guide, or contact us at hello@getovertaxed.com</div>
  </div>
  
  <div class="footer">Page 6 · Generated by Overtaxed</div>
</div>

</body>
</html>`;
}
