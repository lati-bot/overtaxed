# Round 3 — Design Panel Review: PDF Evidence Packet & Email

**Panel:** Sarah Chen (Stripe), Marcus Webb (Apple), Priya Kapoor (Airbnb), Elena Rodriguez (TurboTax/Intuit)  
**Date:** February 13, 2026  
**Subject:** Customer deliverables — PDF evidence packet (Cook County + Houston) and transactional email

---

## Executive Summary

The PDF evidence packet is **functionally excellent** — the content, data structure, and filing instructions are among the best we've seen for a self-service legal document product. However, the visual design has **significant brand disconnect** from the recently redesigned website, uses a **generic SaaS aesthetic** that undermines perceived value, and the email fails to create the **emotional payoff** a $49 purchase warrants. With targeted design changes (not a full rewrite), these deliverables can feel premium, branded, and worth far more than $49.

---

## Panel Critiques

### Sarah Chen (Stripe) — Financial Product Design

**What struck me first:** The PDF reads like a developer's first pass at a professional document — the *information architecture* is correct, but the *design language* says "template" not "premium product." At Stripe, we learned that financial documents need to feel like they come from an institution you trust. This PDF feels like it comes from a startup that just shipped.

**Specific issues:**

1. **The `#1a1a2e` dark navy is a tell.** It's the default "not-quite-black" that every CSS framework ships. The website uses `#1a6b5a` teal as its identity color — the PDF should inherit this. The header border, section titles, step number circles, and table headers should all be teal, not navy.

2. **Red/green for alert/success cards is stock Tailwind.** `#dc2626` red and `#16a34a` green are literally Tailwind's `red-600` and `green-600`. For a financial product, this screams "we didn't design this." The alert state should use a warm amber/sienna (the property is over-assessed, not on fire). The success state should use the brand teal.

3. **The "overtaxed" logo is just a text string in system fonts.** This is the first thing they see after paying $49. The brand needs a mark here — even a simple SVG wordmark or the teal square icon from the website (`<rect rx="7" fill="#1a6b5a"/>`) would transform the header from "Google Doc" to "professional product."

4. **The summary cards with 22px values are good.** Keep these — the information hierarchy of "here's the big number" is correct. But they need the brand color treatment.

### Marcus Webb (Apple) — Document & Print Design

**Overall assessment:** The document has excellent *content density management* — it's not trying to cram everything onto one page, it uses page breaks well, and the stepped instructions are a smart layout choice. But the typography and spacing need refinement for a Letter-size printout.

**Specific issues:**

1. **Font stack is wrong for PDF.** `-apple-system, BlinkMacSystemFont` renders differently on every machine that opens this PDF. Since this goes through Browserless (headless Chrome), it will render in whatever fonts are available on that server — likely falling back to Roboto or Arial. **You need to embed a web font.** Use Inter (matches the website) via a `@import` from Google Fonts. This single change will dramatically improve the look.

2. **11px base with 1.45 line-height is too tight for a legal-adjacent document.** People will print this. Some will be 55+ with reading glasses. Bump to **11.5px base, 1.55 line-height**. The comps table at 9.5px is acceptable for tabular data but the minimum — don't go smaller.

3. **Section titles at 13px UPPERCASE with 0.5px letter-spacing feel bureaucratic.** The website uses clean sentence-case headings with weight-based hierarchy. The PDF should match: **14px, sentence case, 600 weight, teal color** instead of 13px, uppercase, navy.

4. **The emoji in section titles (📋, 📝, 📸, ⚠️) are a readability concern.** They render inconsistently across PDF renderers and printers. Some will show as ▯ boxes. Replace with styled text badges or remove entirely — the section titles are clear enough without them.

5. **Comps table header at 8.5px is pushing legibility limits.** The dark navy background helps contrast, but bump to **9px minimum**. Also, 11 columns is a LOT. The Cook County table has: #, Address/PIN, Class, Bldg SF, Bed/Bath, Ext., Year, Bldg Asmt, Land Asmt, Total Asmt, $/SF. Consider whether "Ext." (exterior wall material) really earns its column — it could be a tooltip or subordinate line under the address.

6. **Spacing inconsistency:** Margins between sections are all `20px` regardless of visual weight. The title block → summary cards transition needs more breathing room (28px). The summary cards → breakdown transition needs less (16px) since they're related. **Use semantic spacing, not uniform spacing.**

7. **The dashed border on the "Notes for Filing" box feels cheap.** Dashed borders are a web convention for "drop zone" or "placeholder." For a copy-paste-ready text block, use a **solid 1px border with a subtle left accent bar** (like the brief section already does).

### Priya Kapoor (Airbnb) — Email & Transactional Design

**The email is the weakest link in the entire chain.** This is the moment of delivery — the customer just paid $49 and this is their receipt + product. Let me break down what's wrong:

1. **No brand header.** The email opens with an `<h1>` and no logo, no brand color, no visual identity. After Airbnb's booking confirmation redesign, our data showed that **emails with a branded header had 34% higher attachment open rates**. Add a teal header bar with the Overtaxed wordmark.

2. **The subject line is functional but not exciting.** `Board of Review Appeal Package — 123 Main St — PIN 12-34-567-890` reads like a government notice. Better: `Your property tax appeal is ready — save $847/year`. Lead with the value, not the bureaucracy.

3. **No visual hierarchy after the savings card.** The email goes: h1 → savings card → bullet list → warning box → link → footer. That's a flat structure. There should be a clear **"What's Next" section** with 2-3 numbered steps (mirroring the PDF's filing steps but condensed to the first actions).

4. **The CTA button is `#1a1a2e` navy.** It should be `#1a6b5a` teal to match the website's buttons. This is the most obvious brand inconsistency — someone goes from clicking a teal button on the website to receiving an email with a navy button.

5. **The email has no personality.** Compare to Airbnb's booking confirmation: "You're going to Tokyo!" creates excitement. This email should acknowledge the emotional journey: "You've taken the first step toward a fairer tax bill." The customer just spent money on something confusing and bureaucratic — reassure them.

6. **Missing: estimated time to complete.** The #1 anxiety after purchase is "how long will this take me?" Add: "Filing takes about 15 minutes. We've made it as easy as possible." This is copy, not design, but it's critical to the experience.

7. **The Houston email is slightly better** — it includes iSettle guidance in the bullet list and has better urgency messaging. But both emails share the same structural problems: no brand header, no emotional payoff, flat hierarchy.

8. **Mobile rendering:** The `max-width: 600px` is correct, but the savings card with `18px 20px` padding will feel cramped on a 375px screen with email client padding. The 14px body text is good for mobile. The CTA button needs `display: block; width: 100%` for mobile — `inline-block` buttons are hard to tap on phones.

### Elena Rodriguez (TurboTax/Intuit) — Tax Product UX

**The filing instructions are the best part of this product.** Seriously. At TurboTax, we spent millions trying to make tax filing steps this clear. The numbered circles, the bold call-outs, the "copy & paste this" section — this is better than what most tax attorneys provide. Now let me tell you what to fix:

1. **The "Statement of Lack of Uniformity" brief is too dense.** Three paragraphs of continuous prose citing legal codes. Most homeowners' eyes will glaze over. This is the argument that wins their appeal — it should be the most scannable section, not the densest. **Break it into a 3-part visual:**
   - Your assessment: $X (with red indicator)
   - Comparable median: $Y (with green indicator)  
   - You're paying Z% more than your neighbors
   
   Keep the full prose below as "Detailed Argument" for the official record.

2. **The comps table subject row highlight is confusing.** Red background + red text + red border for YOUR property, green text for the comps. First-time filers won't immediately understand "red = you (bad), green = them (the goal)." Add a **clear label**: "YOUR PROPERTY" in a badge above the table, and "COMPARABLE PROPERTIES" as a sub-header before the comp rows.

3. **The "Notes for Filing" copy-paste block is brilliant** but needs a stronger visual cue that says "COPY THIS." Add a small clipboard icon and the text "Copy this text and paste it into the Board of Review form" more prominently. Consider adding a light teal/green background instead of the neutral gray.

4. **The photo reminder (📸 section) should be higher.** In usability testing at Intuit, we found that requirements buried after instructions get missed 40% of the time. Move it to immediately after the summary cards or make it the first item in the filing steps. People need to know about the photo *before* they start filing, not after reading 7 steps.

5. **Assessment history table is an afterthought.** It's buried between the brief and the comps table with no context about why it matters. Either explain its relevance ("Your assessment increased 23% since 2021 while comparable properties averaged only 12% increases") or move it to an appendix section. Raw data without context reduces trust.

6. **The Houston PDF is cleaner because it has fewer columns in the comps table** (6 vs. 11). The Cook County PDF should consider the same simplification. The critical columns are: Address, Bldg SF, Total Assessment, $/SF. Everything else is supporting detail.

7. **The "What to Say — Hearing Script" in the Houston PDF is incredibly valuable.** The Cook County PDF doesn't have an equivalent. Add a "What to Write — Notes Template" section with the same energy. People are terrified of writing the wrong thing in an official form.

---

## Debate Round 1

**Sarah:** I want to push on the color question. Should the PDF match the website's teal exactly, or should it have its own professional palette? At Stripe, our invoices don't look like stripe.com — they're more muted.

**Marcus:** Important distinction. The *website* is a marketing surface — warm, inviting, conversion-focused. The *PDF* is a legal document the customer takes to a government body. It should feel professional and authoritative. But it should still be *recognizably* Overtaxed. I'd say: use teal as the primary accent color (replacing navy in headers, borders, step numbers), but keep the document background white and the body text dark. Don't make it warm beige — that would undermine authority.

**Elena:** Agree with Marcus. The beige background works for a website but would look unprofessional printed or displayed on a government review panel's screen. White background, teal accents, dark text. The brand recognition comes from the color accents and the logo, not the background.

**Priya:** For the email, though, I'd lean more toward the website aesthetic. The email is still a *marketing* touchpoint — it's reinforcing the purchase decision. Warm beige background, teal accents, the full brand treatment. The PDF can be more formal.

**Sarah:** That's a good framework. Email = branded marketing (warm beige + teal). PDF = professional document (white + teal + dark text). Both feel like Overtaxed, but appropriate to their context.

**All:** Consensus reached on brand direction.

---

## Debate Round 2

**Marcus:** I want to discuss the comps table. Elena says reduce to 6 columns for Cook County. But the legal argument depends on showing the *same characteristics* — class code, bed/bath, year built, exterior. Cutting those weakens the evidence.

**Elena:** Fair point. But they can be presented differently. What if the comps table has the critical comparison columns (Address, SF, Total Assessment, $/SF) and then each comp has an expandable/secondary row with the property characteristics? In PDF, this could be a smaller sub-line under the address — like how the PIN is already shown.

**Marcus:** I like that. The address cell already has two lines (address + PIN). We could add a third line: "2,100 SF · 3bd/2ba · Brick · 1965" in 8.5px gray text. Then remove Class, Bed/Bath, Ext, Year from the column headers. That gets us to 6-7 columns and keeps the data.

**Sarah:** That's how we handle line-item detail at Stripe. Primary row for the key comparison, secondary line for supporting attributes. Much more scannable.

**Elena:** One more thing: the $/SF column should be the FIRST data column after the address, not the last. It's the entire basis of the argument. People read left to right — put the punchline early.

**Priya:** On the email — should we include a small preview of the comps data inline? Like a mini "Your property: $X/sqft vs. Neighbors: $Y/sqft" visual? It gives them something concrete without opening the PDF.

**Elena:** Yes. The savings card already exists in the email — extend it with one more data point: the $/sqft comparison. That's the "hook" that makes them want to open the full report.

**All:** Consensus reached on table redesign and email enhancement.

---

## Final Unified Report

### ✅ What Works (Keep These)

1. **Filing instructions with numbered steps** — Best-in-class for a self-service legal product. Clear, specific, actionable.
2. **Copy-paste "Notes for Filing" block** — Reduces friction dramatically. Customers don't have to write anything themselves.
3. **Summary cards with big numbers** — Good information hierarchy. People immediately see their assessment, fair value, and savings.
4. **Houston hearing script** — Incredibly valuable for nervous first-time filers.
5. **Subject property highlighted in comps table** — The star (★) marker and visual differentiation is correct.
6. **Page break before filing instructions** — Smart separation of "evidence" from "action steps."
7. **Disclaimer and legal citations** — Appropriately positioned, properly caveated.
8. **Overall content structure** — Evidence → Argument → Comps → Instructions → Copy-paste text → Requirements. This flow is logical and complete.
9. **Assessment breakdown cards** — Side-by-side property details and assessment breakdown is clean and scannable.
10. **Info boxes in Houston PDF** (warning, info, tip types) — Good use of callout hierarchy.

---

### 🚨 Design Issues

#### P0 — Brand & Trust (Fix Immediately)

| # | Issue | Where | Impact |
|---|-------|-------|--------|
| 1 | **Navy `#1a1a2e` everywhere instead of brand teal `#1a6b5a`** | Header border, table headers, step circles, section titles, CTA button | Complete brand disconnect. Customer goes from teal website → navy PDF/email. Feels like two different companies. |
| 2 | **No logo/brand mark in PDF header** | `.header .logo` is just text | PDF looks like a generated report, not a premium product. Zero brand recognition. |
| 3 | **No brand header in email** | Email HTML starts with raw `<h1>` | Most important touchpoint (60%+ on mobile) has no visual identity. Reduces open/engagement rates. |
| 4 | **Stock Tailwind red (`#dc2626`) / green (`#16a34a`) for alert/success** | Summary cards, subject row, comps | Feels like a template, not a designed product. Red for "your assessment" creates anxiety instead of motivation. |
| 5 | **No embedded font — relies on system font stack** | Entire PDF | Inconsistent rendering across devices. PDF looks different for every customer depending on their OS/viewer. |

#### P1 — Readability & Hierarchy

| # | Issue | Where | Impact |
|---|-------|-------|--------|
| 6 | **Emoji in section titles (📋📝📸⚠️)** | Filing instructions, notes, photo, important info | Inconsistent rendering in PDF viewers/printers. Some show as □ boxes. Looks unprofessional in print. |
| 7 | **11-column comps table (Cook County)** | Comparable properties section | Too dense. Key comparison ($/SF) is buried as the last column. Scanning is difficult. |
| 8 | **Uniformity brief is a wall of text** | "Statement of Lack of Uniformity" | The most important argument is the least scannable section. Eyes glaze over. |
| 9 | **Section titles: 13px UPPERCASE looks bureaucratic** | All `.section-title` elements | Doesn't match the website's clean, modern typography. Creates institutional feel instead of premium feel. |
| 10 | **Photo requirement buried at the end** | 📸 section after all filing steps | 40%+ of users will miss this. It's a *requirement* — it should appear before or within the filing steps. |
| 11 | **Assessment history has no context** | History table | Raw data without explanation of why it matters reduces trust. |
| 12 | **Dashed border on copy-paste block** | Notes for Filing section | "Dashed border = placeholder/draft" is a web convention. Undermines the professionalism. |

#### P2 — Polish & Optimization

| # | Issue | Where | Impact |
|---|-------|-------|--------|
| 13 | **Uniform 20px section margins** | Between all sections | Doesn't reflect visual weight relationships. Some transitions need more space, some less. |
| 14 | **Email CTA button is `inline-block`** | Email HTML | Hard to tap on mobile. Should be `display: block; width: 100%` with proper touch target. |
| 15 | **Email subject line is bureaucratic** | Email subject | "Board of Review Appeal Package — …" reads like government mail. Should lead with value. |
| 16 | **No "time to complete" in email** | Email body | #1 post-purchase anxiety is "how long will this take?" Missing reassurance. |
| 17 | **Cook County PDF missing hearing script** | Filing instructions section | Houston has "What to Say" — Cook County should have "What to Write" equivalent. |
| 18 | **Link colors use `#2563eb` (Tailwind blue)** | `.step-link` class | Should use brand teal `#1a6b5a` for consistency. |

---

### 🎨 Recommended Redesign — PDF

#### Color Palette

```
Primary accent:     #1a6b5a  (brand teal — replaces #1a1a2e navy)
Primary accent dark: #155a4c  (hover/emphasis)
Primary accent light: #e8f4f0  (teal tint backgrounds)
Body text:          #1a1a1a  (near-black — darker than current #1a1a2e)
Secondary text:     #5a5a5a  (replaces #555/#666 — more consistent)
Tertiary text:      #8a8a8a  (replaces #999/#888)
Alert/over-assessed: #b45309  (amber-700 — urgent but not alarming)
Alert background:   #fffbeb  (amber-50)
Success/savings:    #1a6b5a  (brand teal — replaces green-600)
Success background: #e8f4f0  (teal tint)
Table header bg:    #1a6b5a  (teal — replaces navy)
Table header text:  #ffffff
Border/divider:     #e2e2e0  (warm gray — replaces #e2e8f0 blue-gray)
Background cards:   #f7f6f3  (warm beige — matches website)
Document background: #ffffff (keep white for print/authority)
```

#### Typography

```css
/* Embed Inter from Google Fonts at top of <style> */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 11.5px;     /* was 11px */
  line-height: 1.55;     /* was 1.45 */
  color: #1a1a1a;        /* was #1a1a2e */
}

.section-title {
  font-size: 14px;        /* was 13px */
  font-weight: 600;       /* was 700 */
  text-transform: none;   /* was uppercase */
  letter-spacing: 0;      /* was 0.5px */
  color: #1a6b5a;         /* was #1a1a2e */
  border-bottom: 2px solid #1a6b5a;  /* was #e2e8f0 */
}

/* Remove all emoji from section titles — replace with clean text */
```

#### Header Redesign

```html
<div class="header">
  <div class="header-left">
    <!-- Add brand mark: teal rounded square + wordmark -->
    <div style="display: flex; align-items: center; gap: 10px;">
      <svg width="28" height="28" viewBox="0 0 32 32">
        <rect width="32" height="32" rx="7" fill="#1a6b5a"/>
        <text x="16" y="22" text-anchor="middle" fill="white" 
              font-family="Inter" font-weight="800" font-size="18">o</text>
      </svg>
      <div>
        <div class="logo">overtaxed</div>
        <div class="subtitle">Board of Review Appeal Evidence Package</div>
      </div>
    </div>
  </div>
  ...
</div>

.header {
  border-bottom: 3px solid #1a6b5a;  /* was #1a1a2e */
}
.header-left .logo {
  color: #1a6b5a;  /* was #1a1a2e */
  font-family: 'Inter', sans-serif;
  font-weight: 800;
}
```

#### Summary Cards Redesign

```css
.summary-card.alert {
  border-color: #b45309;      /* was #dc2626 */
  background: #fffbeb;        /* was #fef2f2 */
}
.summary-card.alert .summary-value {
  color: #b45309;             /* was #dc2626 */
}
.summary-card.success {
  border-color: #1a6b5a;      /* was #16a34a */
  background: #e8f4f0;        /* was #f0fdf4 */
}
.summary-card.success .summary-value {
  color: #1a6b5a;             /* was #16a34a */
}
```

#### Comps Table Redesign (Cook County)

Reduce from 11 columns to 7 by consolidating property characteristics into a sub-line:

```
| # | Address / Details              | $/SF ↑  | Bldg SF | Total Asmt | Bldg Asmt | Land Asmt |
|---|-------------------------------|---------|---------|------------|-----------|-----------|
| ★ | 123 Main St (SUBJECT)         | $45.23  | 2,100   | $94,990    | $67,000   | $27,990   |
|   | PIN 12-34-567-890-0000        |         |         |            |           |           |
|   | 203 · 3bd/2ba · Brick · 1965  |         |         |            |           |           |
|---|-------------------------------|---------|---------|------------|-----------|-----------|
| 1 | 456 Oak Ave                   | $32.15  | 1,980   | $63,657    | $45,000   | $18,657   |
|   | PIN 12-34-567-891-0000        |         |         |            |           |           |
|   | 203 · 3bd/2ba · Frame · 1968  |         |         |            |           |           |
```

Key changes:
- **$/SF is column 3** (was column 11) — the punchline comes early
- Property characteristics (Class, Bed/Bath, Ext, Year) become a 3rd sub-line under address in 8.5px gray
- Subject row uses amber (`#b45309`) instead of red
- Comp $/SF uses brand teal instead of stock green

```css
.comps-table th {
  background: #1a6b5a;       /* was #1a1a2e */
}
.comps-table tr.subject-row {
  background: #fffbeb;        /* was #fef2f2 */
  border: 2px solid #b45309;  /* was #dc2626 */
}
.comps-table tr.subject-row td {
  color: #b45309;             /* was #dc2626 */
}
.highlight {
  color: #1a6b5a;             /* was #16a34a */
}
```

#### Uniformity Brief — Add Visual Summary

Before the prose brief, add a scannable 3-column visual:

```html
<div class="uniformity-visual">
  <div class="uv-item alert">
    <div class="uv-label">Your Assessment</div>
    <div class="uv-value">$45.23/sqft</div>
  </div>
  <div class="uv-arrow">→</div>
  <div class="uv-item success">
    <div class="uv-label">Comparable Median</div>
    <div class="uv-value">$32.15/sqft</div>
  </div>
  <div class="uv-arrow">=</div>
  <div class="uv-item alert">
    <div class="uv-label">You're Paying</div>
    <div class="uv-value">41% More</div>
  </div>
</div>
<!-- Then the full prose brief below as "Detailed Argument" -->
```

#### Step Numbers

```css
.step-number {
  background: #1a6b5a;  /* was #1a1a2e */
}
```

#### Section Spacing (Semantic)

```css
/* Title block → Summary cards: generous */
.title-block { margin-bottom: 28px; }       /* was 20px */

/* Summary cards → Breakdown: related, tighter */
.summary-row { margin-bottom: 16px; }       /* was 20px */

/* Between major sections: standard */
.section { margin-bottom: 24px; }           /* was 20px */

/* Before page break sections: generous */
.page-break { margin-top: 0; }             /* page-break handles this */
```

#### Notes for Filing Box

```css
/* Replace dashed border with solid + left accent */
.notes-box {
  background: #e8f4f0;                      /* was #f8f9fa */
  border: 1px solid #1a6b5a30;             /* was 2px dashed #cbd5e1 */
  border-left: 4px solid #1a6b5a;          /* strong left accent */
  border-radius: 8px;
  padding: 16px 18px;
}
```

#### Photo Requirement — Move Up

Move the photo requirement to **Step 6** (where it already partially exists as a note) and promote it to a full warning callout *before* the filing steps begin:

```html
<!-- Before the steps, add: -->
<div class="info-box warning" style="margin-bottom: 20px;">
  <strong>Before you start:</strong> You'll need a clear photo of the front of your property. 
  Take it now with your phone — the Board of Review requires it (Rule #17).
</div>
```

---

### 📧 Email Redesign Recommendations

#### Structure (Top to Bottom)

```
┌─────────────────────────────────────┐
│  [Teal header bar with logo]        │  ← Brand identity
│  overtaxed                          │
├─────────────────────────────────────┤
│                                     │
│  Your property tax appeal is ready  │  ← H1, 22px, #1a1a1a
│                                     │
│  "You've taken the first step       │  ← Empowering copy
│   toward a fairer tax bill."        │
│                                     │
│  ┌─ Savings Card ────────────────┐  │
│  │ Save $847/year                │  │  ← Teal background
│  │ $94,990 → $63,657 (41% over) │  │
│  │ Your neighbors pay $32.15/sf  │  │  ← NEW: $/sqft hook
│  │ You're paying $45.23/sf       │  │
│  └───────────────────────────────┘  │
│                                     │
│  What's inside your package:        │  ← Bulleted list
│  • 8 comparable properties...       │
│  • Written argument citing...       │
│  • Step-by-step filing guide        │
│  • Copy-paste notes for the form    │
│                                     │
│  ┌─ What to Do Next ────────────┐   │
│  │ 1. Open the PDF (attached)   │   │  ← 3 simple steps
│  │ 2. Take a photo of your home │   │
│  │ 3. File at cookcounty...     │   │
│  │    ⏱️ Takes about 15 minutes │   │  ← Time estimate
│  └──────────────────────────────┘   │
│                                     │
│  [████ View Appeal Package ████]    │  ← Teal, full-width, block
│                                     │
│  ┌─ Deadline Warning ───────────┐   │
│  │ ⏰ Check if your township    │   │  ← Amber background
│  │ is open for filing           │   │
│  └──────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│  Questions? Reply to this email.    │
│  overtaxed · hello@getovertaxed.com │
└─────────────────────────────────────┘
```

#### Email CSS Changes

```html
<!-- Branded header -->
<div style="background: #1a6b5a; padding: 20px 24px; border-radius: 12px 12px 0 0;">
  <span style="color: white; font-size: 18px; font-weight: 800; letter-spacing: -0.5px;">overtaxed</span>
</div>

<!-- Body wrapper -->
<div style="background: #ffffff; padding: 28px 24px; border: 1px solid #e2e2e0; border-top: none; border-radius: 0 0 12px 12px;">
  ...
</div>

<!-- Outer wrapper (optional warm beige) -->
<div style="background: #f7f6f3; padding: 32px 16px;">
  <!-- email content -->
</div>

<!-- CTA button — full width, teal -->
<a href="..." style="display: block; width: 100%; text-align: center; background: #1a6b5a; color: #fff; padding: 14px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
  View Your Appeal Package
</a>
```

#### Subject Line

**Before:** `Board of Review Appeal Package — 123 Main St — PIN 12-34-567-890`  
**After:** `Your appeal package is ready — save $847/year on property taxes`

For Houston:  
**Before:** `Property Tax Protest Package — 123 Main St — Harris County`  
**After:** `Your protest package is ready — save $1,200/year on property taxes`

---

### 🏷 Brand Alignment Recommendations

| Surface | Background | Primary Accent | Text | Rationale |
|---------|-----------|----------------|------|-----------|
| **Website** | Warm beige `#f7f6f3` | Teal `#1a6b5a` | Near-black `#1a1a1a` | Marketing — warm, inviting, conversion |
| **Email** | Warm beige `#f7f6f3` outer, white inner | Teal `#1a6b5a` | Near-black `#1a1a1a` | Post-purchase — still marketing, reinforces brand |
| **PDF** | White `#ffffff` | Teal `#1a6b5a` | Near-black `#1a1a1a` | Legal document — authoritative but branded |

**Shared brand elements across all surfaces:**
- Inter font family
- Teal `#1a6b5a` as primary accent on all interactive/emphasis elements
- Rounded square logo mark (present in website, needs to be added to PDF/email)
- Warm gray borders `#e2e2e0` instead of cool blue-gray `#e2e8f0`
- Amber `#b45309` for warnings/alerts (not red)
- No stock Tailwind colors — everything is intentionally chosen

**What should NOT match:**
- PDF background stays white (not beige) — print/authority context
- PDF should feel more formal than the website — less rounded corners, tighter spacing in data tables
- Email can split the difference — branded wrapper with professional content area

---

### 📊 Priority Ranking

#### P0 — Ship This Week (Brand & Trust)

1. **Replace all `#1a1a2e` with `#1a6b5a`** in PDF and email (header border, table headers, step numbers, CTA button, section title borders)
2. **Add brand mark to PDF header** (teal rounded square + styled wordmark)
3. **Add branded header to email** (teal bar with logo)
4. **Replace red/green with amber/teal** in summary cards and comps table
5. **Embed Inter font** via Google Fonts `@import` in PDF `<style>`
6. **Change email subject line** to lead with savings amount
7. **Make email CTA button teal + full-width block** for mobile

#### P1 — Ship Next Sprint (Readability & Hierarchy)

8. **Remove emoji from section titles** — replace with clean text or small styled badges
9. **Restructure comps table** — consolidate to 7 columns, move $/SF to column 3, property details to sub-line
10. **Add visual summary to uniformity brief** — 3-column "Your assessment → Median → Difference"
11. **Move photo requirement up** — add warning before filing steps
12. **Section titles: sentence case, 14px, 600 weight, teal**
13. **Add "What to Do Next" section to email** with 3 numbered steps + time estimate
14. **Adjust section spacing** to semantic values (28px/24px/16px based on relationship)
15. **Replace dashed border** on notes block with solid + left accent

#### P2 — Ship When Possible (Polish)

16. **Bump base font to 11.5px, line-height to 1.55**
17. **Add contextual note to assessment history** explaining year-over-year trends
18. **Add "What to Write" section to Cook County PDF** (equivalent to Houston's hearing script)
19. **Replace `#2563eb` link color** with `#1a6b5a` teal
20. **Add empowering copy to email** ("You've taken the first step toward a fairer tax bill")
21. **Warm up card backgrounds** — use `#f7f6f3` instead of `#f8f9fa`
22. **Replace cool blue-gray borders** (`#e2e8f0`) with warm gray (`#e2e2e0`)
23. **Houston email: add homestead exemption reminder** as a distinct callout

---

### Estimated Impact

| Change | Effort | Expected Impact |
|--------|--------|-----------------|
| Color swap (navy → teal) | 1 hour | Instant brand recognition. PDF/email feel like the same product as the website. |
| Embedded font | 15 min | Consistent rendering for every customer. Professional typography. |
| Email redesign | 2-3 hours | Higher attachment open rate, reduced post-purchase anxiety, better NPS. |
| Comps table restructure | 2 hours | Dramatically improved scannability. The core evidence becomes obvious. |
| Brief visual summary | 1 hour | The #1 argument becomes scannable in 5 seconds. |
| All P0 changes | 4-5 hours | PDF goes from "developer template" to "premium product worth $49+." |

---

*Panel review complete. All four panelists signed off on the above recommendations.*
