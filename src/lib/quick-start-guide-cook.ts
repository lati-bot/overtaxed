/**
 * Quick Start Guide Generator — Cook County, IL
 * Board of Review appeal process (different from TX ARB)
 */

export interface CookQuickStartData {
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
  notesForFiling: string; // Pre-built copy-paste text
}

export function generateCookQuickStartHtml(data: CookQuickStartData): string {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);

  const formattedPin = data.pin.replace(/(\d{2})(\d{2})(\d{3})(\d{3})(\d{4})/, "$1-$2-$3-$4-$5");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Property Tax Appeal Quick Start Guide — Cook County</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    @page { size: letter; margin: 0.75in 0.75in; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; font-size: 13px; line-height: 1.6; color: #1a1a1a; background: white; }
    .page { page-break-after: always; min-height: 9in; position: relative; padding-bottom: 40px; }
    .page:last-child { page-break-after: auto; }

    .hero { margin-bottom: 44px; text-align: center; }
    .hero-savings { font-size: 22px; font-weight: 600; color: #1a1a1a; margin-bottom: 6px; }
    .hero-address { font-size: 16px; font-weight: 400; color: #444; margin-bottom: 4px; }
    .hero-sub { font-size: 12px; color: #888; }

    .steps-label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #999; margin-bottom: 28px; }
    .steps { max-width: 580px; margin: 0 auto; }
    .step { margin-bottom: 44px; }
    .step-header { font-size: 16px; font-weight: 500; color: #1a1a1a; margin-bottom: 16px; display: flex; align-items: center; gap: 12px; }
    .step-number { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border: 1.5px solid #1a1a1a; border-radius: 50%; font-size: 14px; font-weight: 500; flex-shrink: 0; }
    .step-deadline { font-weight: 600; color: #1a1a1a; }
    .step-content { font-size: 13px; color: #4a4a4a; line-height: 1.7; margin-left: 40px; }

    .filing-box { background: #fafafa; border: 1px solid #e0e0e0; border-radius: 4px; padding: 16px 20px; margin-top: 12px; font-size: 12px; line-height: 1.8; }
    .filing-box-row { margin-bottom: 6px; }
    .filing-box-row:last-child { margin-bottom: 0; }
    .filing-box-label { display: inline-block; width: 160px; color: #666; }
    .filing-box-value { color: #1a1a1a; }
    .filing-box-value strong { font-weight: 600; }

    .warning-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; padding: 12px 16px; margin-top: 12px; font-size: 12px; line-height: 1.6; }

    .reassurance { text-align: center; font-size: 13px; color: #666; margin-top: 48px; padding-top: 24px; border-top: 1px solid #e0e0e0; }

    /* Page 2 — Notes for Filing */
    .notes-title { font-size: 18px; font-weight: 500; color: #1a1a1a; margin-bottom: 6px; text-align: center; }
    .notes-subtitle { font-size: 12px; color: #888; text-align: center; margin-bottom: 32px; }
    .notes-box { background: #f8f9fa; border: 2px dashed #cbd5e1; border-radius: 8px; padding: 20px 24px; font-size: 12px; line-height: 1.8; color: #333; font-family: 'Georgia', serif; margin-bottom: 28px; }
    .notes-box p { margin-bottom: 10px; }
    .notes-box p:last-child { margin-bottom: 0; }

    .photo-box { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; padding: 14px 18px; font-size: 12px; line-height: 1.6; margin-bottom: 24px; }
    .photo-box ul { margin: 8px 0 0 16px; padding: 0; }

    .info-section { margin-bottom: 20px; }
    .info-title { font-size: 14px; font-weight: 500; color: #1a1a1a; margin-bottom: 10px; }
    .info-text { font-size: 12px; color: #555; line-height: 1.7; }
    .info-text p { margin-bottom: 8px; }
    .info-text p:last-child { margin-bottom: 0; }

    .footer { position: absolute; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #999; padding: 12px 0; }
  </style>
</head>
<body>

  <!-- Page 1: Action Page -->
  <div class="page">
    <div class="hero">
      <div class="hero-savings">Save ${formatCurrency(data.estimatedSavings)}/year on your property taxes</div>
      <div class="hero-address">${data.address}</div>
      <div class="hero-sub">PIN: ${formattedPin} · ${data.township} Township · Cook County, IL</div>
    </div>

    <div class="steps">
      <div class="steps-label">How to file your appeal</div>

      <div class="step">
        <div class="step-header">
          <span class="step-number">1</span>
          <span>Check if your township is open</span>
        </div>
        <div class="step-content">
          Go to <strong>cookcountyboardofreview.com</strong> and check the homepage.<br>
          Your township (<strong>${data.township}</strong>) must show as "OPEN" to file.
          <div class="warning-box">
            ⏰ Each township opens for ~30 days. File as soon as it opens — you can't file after it closes.
          </div>
        </div>
      </div>

      <div class="step">
        <div class="step-header">
          <span class="step-number">2</span>
          <span>File online as a guest</span>
        </div>
        <div class="step-content">
          <div class="filing-box">
            <div class="filing-box-row">
              <span class="filing-box-label">Go to:</span>
              <span class="filing-box-value">cookcountyboardofreview.com</span>
            </div>
            <div class="filing-box-row">
              <span class="filing-box-label">Click:</span>
              <span class="filing-box-value"><strong>"Submit Appeal as Guest"</strong></span>
            </div>
            <div class="filing-box-row">
              <span class="filing-box-label">Type of Appeal:</span>
              <span class="filing-box-value"><strong>Property Over-Assessed</strong></span>
            </div>
            <div class="filing-box-row">
              <span class="filing-box-label">PIN:</span>
              <span class="filing-box-value"><strong>${data.pin}</strong></span>
            </div>
            <div class="filing-box-row">
              <span class="filing-box-label">Are you an attorney?</span>
              <span class="filing-box-value"><strong>No</strong></span>
            </div>
            <div class="filing-box-row">
              <span class="filing-box-label">Request a hearing?</span>
              <span class="filing-box-value"><strong>No</strong> (written evidence is stronger)</span>
            </div>
            <div class="filing-box-row">
              <span class="filing-box-label">Notes field:</span>
              <span class="filing-box-value">Copy text from <strong>page 2</strong> of this guide</span>
            </div>
          </div>
        </div>
      </div>

      <div class="step">
        <div class="step-header">
          <span class="step-number">3</span>
          <span>Upload your evidence</span>
        </div>
        <div class="step-content">
          After submitting, you'll be asked to upload evidence:<br>
          • Upload the <strong>Evidence Packet PDF</strong> (select "BOR Appraisal" as document type)<br>
          • Upload a <strong>photo of the front of your property</strong> (required by Board Rule #17)
        </div>
      </div>

      <div class="step">
        <div class="step-header">
          <span class="step-number">4</span>
          <span>Save your complaint number — done!</span>
        </div>
        <div class="step-content">
          You'll receive a BOR Complaint Number. Save it as proof.<br>
          The Board typically responds within 90 days after your township's filing period closes.
        </div>
      </div>
    </div>

    <div class="reassurance">
      Free to file. No lawyer needed. They can't raise your taxes for appealing.
    </div>

    <div class="footer">Generated by Overtaxed</div>
  </div>

  <!-- Page 2: Notes for Filing + Photo + Info -->
  <div class="page">
    <div class="notes-title">Copy & paste into the "Notes" field</div>
    <div class="notes-subtitle">Step 2 asks for notes — paste this text exactly as-is.</div>

    <div class="notes-box">
      ${data.notesForFiling}
    </div>

    <div class="photo-box">
      <strong>📸 Required: Photo of your property (Board Rule #17)</strong>
      <ul>
        <li>Take a clear photo of the <strong>full front</strong> of your building</li>
        <li>Make sure it shows the exterior material and general condition</li>
        <li>Upload as a separate file on the evidence page</li>
      </ul>
    </div>

    <div class="info-section">
      <div class="info-title">Good to know</div>
      <div class="info-text">
        <p><strong>LLC / Trust / Corporation:</strong> If your property is owned by an LLC, trust, or corporation, you need an attorney to file. Individual homeowners can file themselves.</p>
        <p><strong>Two chances:</strong> You can appeal with both the Assessor's Office (first level) AND the Board of Review (second level). This is the "two-bite strategy" pros use.</p>
        <p><strong>No cost:</strong> Filing is completely free.</p>
      </div>
    </div>

    <div class="footer">Generated by Overtaxed</div>
  </div>

</body>
</html>`;
}
