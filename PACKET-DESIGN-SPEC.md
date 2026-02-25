# Overtaxed Evidence Packet — Definitive Design Specification

**Version:** 1.0  
**Date:** February 18, 2026  
**Author:** AI Design Agent  
**Purpose:** Complete page-by-page blueprint for the upgraded $49 evidence packet  
**Audience:** Engineering team implementing PDF generation  

---

## Table of Contents

1. [Design Philosophy](#1-design-philosophy)
2. [Document Architecture — Two PDFs](#2-document-architecture--two-pdfs)
3. [PDF #1: Evidence Packet (For Submission)](#3-pdf-1-evidence-packet-for-submission)
4. [PDF #2: Homeowner Playbook (For Preparation)](#4-pdf-2-homeowner-playbook-for-preparation)
5. [County Variation Matrix](#5-county-variation-matrix)
6. [Data Requirements](#6-data-requirements)
7. [Priority Implementation Order](#7-priority-implementation-order)
8. [Visual Design System](#8-visual-design-system)
9. [Appendix: Legal Citations Reference](#9-appendix-legal-citations-reference)

---

## 1. Design Philosophy

### The Problem We're Solving
Current packet is a monolithic PDF mixing evidence (for the appraiser/board) with instructions (for the homeowner). Customer feedback (Deji, Feb 2026): *"The PDF is a lot to digest. The avg user is already overwhelmed and just wants simple dumbed down steps."*

### The Solution: Two Documents
Split into **two PDFs** delivered together:

| Document | Purpose | Audience | Pages |
|----------|---------|----------|-------|
| **Evidence Packet** | Submit to CAD/Board | Appraiser, ARB panel, Board of Review | 4–5 pages |
| **Homeowner Playbook** | Prepare & win | The homeowner only | 4–6 pages |

**Why two documents:**
1. The Evidence Packet is what you hand to the appraiser. It should look professional, authoritative, and contain ONLY evidence + legal argument. No hearing scripts, no "how to file" instructions.
2. The Homeowner Playbook is the homeowner's private strategy guide. Hearing script, rebuttal guide, process timeline, CAD evidence request instructions, condition documentation guide. The appraiser never sees this.

### Page Count Target
- Evidence Packet: **4–5 pages** (lean, authoritative, no filler)
- Homeowner Playbook: **4–6 pages** (comprehensive but scannable)
- **Total: 8–10 pages across both PDFs**

---

## 2. Document Architecture — Two PDFs

### PDF Naming Convention
- `evidence-packet-{acct}.pdf` — "Submit this to the appraisal district"
- `playbook-{acct}.pdf` — "Your private strategy guide"

### Delivery
Both PDFs attached to the same email. Web app shows both with clear labels:
- 📄 **Evidence Packet** — "Upload this when you file your protest"
- 📖 **Homeowner Playbook** — "Read this before your hearing"

---

## 3. PDF #1: Evidence Packet (For Submission)

This is the document the homeowner uploads to iFile/uFile/SmartFile or hands to the ARB panel. It must be clean, professional, and look like something a tax consultant would prepare.

### Page 1: Cover Brief & Subject Property

#### Section 1A: Header Bar
- **Content:**
  - Left: Overtaxed logo (teal circle + wordmark) + "Property Tax Protest Evidence"
  - Right: Date generated, County name, State, Protest type
- **Exact text (right side):**
  ```
  [Date]
  [County] County, [State]
  Protest Type: Uniform & Equal Appraisal [+ Market Value if applicable]
  Filing Body: [HCAD / DCAD / Cook County Assessor / etc.]
  ```
- **Data required:** `county`, `state`, `filingBody`, `generatedDate`

#### Section 1B: Subject Property Block
- **Layout:** Light gray background box with rounded corners
- **Content:**
  ```
  SUBJECT PROPERTY
  [ADDRESS]
  Account: [ACCT]    City: [CITY], [STATE]    Neighborhood: [NEIGHBORHOOD_CODE]
  Year Built: [YEAR]    Building SF: [SQFT]    Beds/Baths: [BEDS]/[BATHS]
  ```
- **NEW — Property Record Audit Alert (conditional):**
  If we detect potential data issues, show a yellow alert box:
  ```
  ⚠️ PROPERTY RECORD VERIFICATION RECOMMENDED
  The CAD records show: [SQFT] sq ft, [BEDS] beds, [BATHS] baths, [STORIES] stories, Pool: [YES/NO]
  Please verify these match your actual property. Errors in CAD records are common and
  can result in immediate value reductions. See your Homeowner Playbook for details.
  ```
- **Data required:** `address`, `acct`, `city`, `state`, `neighborhoodCode`, `yearBuilt`, `sqft`, `beds`, `baths`, `stories`, `hasPool`, `lotSqft`
- **Why it matters:** This is the homeowner's first prompt to check if the CAD has wrong data. A wrong sqft or phantom pool is an instant win — no hearing needed.

#### Section 1C: Summary Cards (3 across)
- **Layout:** Three equal-width cards
- **Card 1 — "Current Appraised Value"** (amber/warning border)
  ```
  $[CURRENT_ASSESSMENT]
  $[PER_SQFT]/sqft · [OVER_ASSESSED_PCT]% above comparable median
  ```
- **Card 2 — "Fair Value (Based on Comparables)"** (teal/success border)
  ```
  $[FAIR_ASSESSMENT]
  $[FAIR_PER_SQFT]/sqft · Median of [COMP_COUNT] comparable properties
  ```
- **Card 3 — "Estimated Annual Tax Savings"** (teal/success border)
  ```
  $[ESTIMATED_SAVINGS]
  Based on value reduction of $[POTENTIAL_REDUCTION]
  ```
- **Data required:** `currentAssessment`, `fairAssessment`, `estimatedSavings`, `potentialReduction`, `perSqft`, `fairPerSqft`, `overAssessedPct`, `compCount`

#### Section 1D: Statement of Unequal Appraisal (Legal Brief)
- **Layout:** Left teal border, light gray background
- **Content (TX version):**
  ```
  The subject property at [ADDRESS] (Account: [ACCT]), located in appraisal
  neighborhood [NEIGHBORHOOD_CODE], is currently appraised at $[CURRENT_ASSESSMENT],
  equating to $[PER_SQFT] per square foot of building area.

  An analysis of [COMP_COUNT] comparable properties within the same appraisal area
  demonstrates that the subject property is appraised [OVER_ASSESSED_PCT]% above the
  comparable median of $[COMP_MEDIAN_PSF] per square foot. Under Texas Tax Code
  §41.41(a)(2), a property owner may protest on grounds of unequal appraisal. Under
  §42.26(a)(3), the appraised value of a property must not exceed the median appraised
  value of a reasonable number of comparable properties, appropriately adjusted.

  Based on the comparable evidence presented, the petitioner requests a reduction from
  $[CURRENT_ASSESSMENT] to $[FAIR_ASSESSMENT], a reduction of $[POTENTIAL_REDUCTION].
  ```
- **Content (IL version):**
  ```
  The subject property at [ADDRESS] (PIN: [PIN]), is currently assessed at
  $[CURRENT_ASSESSMENT] (Assessment Level: [ASSESSMENT_LEVEL]%). An analysis of
  [COMP_COUNT] comparable properties in the same township and classification
  demonstrates that the subject property is assessed [OVER_ASSESSED_PCT]% above the
  comparable median.

  Under the Illinois Property Tax Code (35 ILCS 200/16-70 and 200/16-185), the
  assessed value should be uniform across similar properties. The Cook County Board
  of Review may reduce assessments where lack of uniformity is demonstrated.

  Based on the comparable evidence presented, the petitioner requests a reduction
  in assessed value from $[CURRENT_ASSESSMENT] to $[FAIR_ASSESSMENT].
  ```
- **Why it matters:** This is the core legal argument. The ARB panel or BOR analyst reads this first. It frames everything that follows.
- **County variations:** Legal citations change per state. TX cites §41.41, §42.26. IL cites 35 ILCS 200. Assessment vs. appraised value terminology differs.

---

### Page 2: Comparable Properties Grid (Equity Analysis)

This is the highest-value page in the entire packet. This is what wins hearings.

#### Section 2A: Section Header
- **Content:** `COMPARABLE PROPERTIES — EQUITY ANALYSIS`
- **Subtext:** `The following [N] comparable properties are in the same [appraisal neighborhood / township and classification] and demonstrate unequal appraisal of the subject property.`

#### Section 2B: Comp Table

| Column | Header | Width | Notes |
|--------|--------|-------|-------|
| # | `#` | narrow | Row number or ★ for subject |
| Address/Account | `Address / Account` | wide | Two-line: address on top, account below |
| Bldg SF | `Bldg SF` | medium | Right-aligned |
| Year Built | `Yr Built` | narrow | Right-aligned |
| **NEW: Distance** | `Dist.` | narrow | Miles from subject (e.g., "0.3 mi") |
| Appraised Value | `Appraised Value` | medium | Right-aligned, formatted with $ |
| $/SF | `$/SF` | medium | Right-aligned, teal bold for comps, amber bold for subject |

**Subject Row (FIRST ROW):**
- Background: amber/gold (#fffbeb)
- Border: 2px solid amber (#b45309)
- All values in bold amber
- Label: `[ADDRESS] (SUBJECT)` with star ★ instead of number

**Comp Rows:**
- Alternating white/light-gray
- $/SF in teal bold

**NEW — Comp Quality Indicators:**
Below each comp row (or as hover/footnote), show WHY this comp was selected:
```
Same neighborhood ([CODE]) · Similar size (±[X]%) · Similar age (±[Y] yrs) · [DISTANCE] mi away
```

Implementation option: Add a small italic line under each comp address:
```
<div class="comp-quality">Same nbhd · ±8% size · ±5 yr age · 0.4 mi</div>
```

- **Data required per comp:** `acct`, `address`, `sqft`, `yearBuilt`, `assessedVal`, `perSqft`, `distanceMiles`, `neighborhoodCode`
- **Data required for quality indicators:** `sqftDiffPct`, `ageDiffYears`, `distanceMiles`, `sameNeighborhood`
- **Why it matters:** When the appraiser says "those comps aren't similar," the homeowner can point to the quality indicators showing they ARE similar. This is the #1 rebuttal defense.

#### Section 2C: Comps Summary Bar
- **Layout:** Below table, teal top border
- **Content (4 metrics in a row):**
  ```
  Subject $/SF: $[PER_SQFT] (amber)
  Comp Median $/SF: $[COMP_MEDIAN_PSF] (teal)
  Comp Average $/SF: $[COMP_AVG_PSF] (teal)
  Difference: $[DIFF]/SF ([OVER_ASSESSED_PCT]%) (amber)
  ```

#### Section 2D: Methodology Note
- **Layout:** Small italic text below summary bar
- **Content:**
  ```
  Comparable properties were selected based on: (1) same appraisal neighborhood/market area,
  (2) similar building square footage (±20%), (3) similar year built (±10 years),
  (4) same property classification. All appraised values are from the [YEAR] certified
  tax roll maintained by [CAD_NAME]. Under Texas Tax Code §42.26(a)(3) / [IL equivalent],
  the appraised value must not exceed the median of comparable properties.
  ```
- **Why it matters:** Pre-answers the "how were these comps selected?" challenge.

---

### Page 3: Market Value Analysis (NEW SECTION)

**This is entirely new.** Currently we only argue equity/uniformity. Adding a market value section gives the homeowner TWO independent legal arguments — doubling their chances.

#### Section 3A: Section Header
- **Content:** `MARKET VALUE ANALYSIS`
- **Subtext:** `Recent arm's-length sales of comparable properties support a market value at or below the requested fair value.`

#### Section 3B: Sales Comparison Grid (if sales data available)

| Column | Header | Notes |
|--------|--------|-------|
| # | `#` | Row number |
| Address | `Address` | Sale address |
| Sale Date | `Sale Date` | MM/YYYY format |
| Sale Price | `Sale Price` | Right-aligned |
| Bldg SF | `Bldg SF` | Right-aligned |
| $/SF (Sale) | `$/SF` | Right-aligned, bold |
| Adjustments | `Adj.` | Net adjustment amount |
| Adj. Value | `Adj. Value` | After adjustments, bold teal |

**Subject Row:** Shows current appraised value for comparison (amber highlight)

#### Section 3C: Market Value Summary
```
Median Adjusted Sale Price: $[MEDIAN_SALE_PRICE]
Subject Appraised Value: $[CURRENT_ASSESSMENT]
Overvaluation: $[DIFFERENCE] ([PCT]%)
```

#### Section 3D: If No Sales Data Available (Fallback)
If we don't have MLS/sales data, show guidance instead:
```
MARKET VALUE EVIDENCE — SUPPLEMENTAL GUIDANCE

Your evidence packet focuses on uniform/equal appraisal, which is the strongest
legal argument in Texas. To add a market value argument:

1. Request the CAD's evidence packet (see Playbook, Section 4) — it typically
   includes sales comps. Review their sales data and note any that support YOUR value.
2. Check Zillow, Redfin, or Realtor.com for recent sales within 0.5 miles of your
   property. Sales below your appraised value strengthen your case.
3. If you purchased your home within the last 2 years for less than the appraised
   value, bring your closing disclosure — it's powerful evidence.
```

- **Data required:** `salesComps[]` (address, saleDate, salePrice, sqft, adjustments) — **OPTIONAL field; not all counties will have this**
- **County variations:**
  - **TX:** Texas is a non-disclosure state — sale prices aren't in public records. We may not have sales data. In that case, use the fallback guidance.
  - **IL:** Illinois IS a disclosure state. Sale prices are available via Illinois Department of Revenue transfer declarations. We should be able to include actual sales comps for Cook County.
- **Why it matters:** Professional tax firms always present BOTH arguments. Giving the homeowner two independent arguments means the panel has two chances to agree. Even if they reject equity, they might accept market value (or vice versa).

---

### Page 4: Property Record Details & Opinion of Value

#### Section 4A: Property Record Audit (NEW)
- **Layout:** Two-column table showing CAD's recorded characteristics
- **Content:**
  ```
  PROPERTY RECORD — VERIFY FOR ACCURACY
  ┌─────────────────────────┬──────────────────┐
  │ Characteristic          │ CAD Record       │
  ├─────────────────────────┼──────────────────┤
  │ Building Sq Ft          │ [SQFT]           │
  │ Year Built              │ [YEAR_BUILT]     │
  │ Bedrooms                │ [BEDS]           │
  │ Bathrooms               │ [BATHS]          │
  │ Stories                 │ [STORIES]        │
  │ Pool                    │ [YES/NO]         │
  │ Garage                  │ [TYPE/SPACES]    │
  │ Lot Size                │ [LOT_SQFT] sf    │
  │ Construction            │ [CONSTRUCTION]   │
  │ Condition/CDU           │ [CDU_RATING]     │
  │ Neighborhood Code       │ [NBHD_CODE]      │
  └─────────────────────────┴──────────────────┘
  
  ⚠️ If ANY of the above do not match your actual property, this is grounds for
  an immediate correction. Common errors include: inflated square footage, a pool
  that was removed, incorrect bedroom/bathroom count, or wrong construction type.
  Notify the appraisal district of any errors — corrections often result in value
  reductions without needing a hearing.
  ```
- **Data required:** `sqft`, `yearBuilt`, `beds`, `baths`, `stories`, `hasPool`, `garageType`, `garageSpaces`, `lotSqft`, `constructionType`, `cduRating`, `neighborhoodCode`
- **County variations:** Field names differ (TX has CDU rating, IL has building class). Adapt column labels per county.
- **Why it matters:** Per our HEARING-TACTICS-RESEARCH: "Evidence of errors in the CAD's records is the strongest possible evidence — it's factual, not subjective, and requires immediate correction." Deji's biggest win was catching wrong sqft. This section prompts EVERY customer to check.

#### Section 4B: Homestead Exemption Verification (NEW)
- **Layout:** Conditional alert box
- **If exemption IS applied:**
  ```
  ✅ HOMESTEAD EXEMPTION: Active
  Your property has an active homestead exemption. Your appraised value is
  subject to the 10% annual cap (TX) / homeowner exemption (IL).
  ```
- **If exemption is NOT applied or unknown:**
  ```
  🔴 HOMESTEAD EXEMPTION: Not Found
  Our records do not show an active homestead exemption on this property.
  If this is your primary residence, you may be missing up to $100,000 in
  exemption value (TX) / significant assessment reduction (IL).
  Apply immediately at [FILING_URL] — this is FREE and separate from your protest.
  ```
- **Data required:** `hasHomesteadExemption` (boolean), `exemptionAmount`
- **Why it matters:** A missing homestead exemption costs the homeowner MORE than an over-appraisal. This is the single highest-ROI alert we can provide. Customers will thank us even if the protest fails.

#### Section 4C: Opinion of Value Statement
- **Layout:** Prominent box with teal border
- **Content:**
  ```
  OPINION OF VALUE

  Based on the equity analysis of [COMP_COUNT] comparable properties and
  [market value analysis of [SALES_COUNT] recent sales], the petitioner's
  opinion of fair market/appraised value for the subject property is:

                    $[FAIR_ASSESSMENT]

  This represents a reduction of $[POTENTIAL_REDUCTION] ([OVER_ASSESSED_PCT]%)
  from the current appraised value of $[CURRENT_ASSESSMENT].
  ```

#### Section 4D: Footer & Disclaimer
```
This evidence was prepared by Overtaxed (getovertaxed.com) using publicly available
appraisal data from [CAD_NAME] [YEAR] certified tax roll. It does not constitute
legal advice or a formal appraisal. All data is believed accurate but should be
verified against official county records. The property owner is responsible for
filing deadlines and procedures.

Generated: [DATE] · Account: [ACCT] · [COUNTY] County, [STATE]
```

---

## 4. PDF #2: Homeowner Playbook (For Preparation)

This is the customer's private strategy guide. The appraiser never sees it.

### Page 1: Quick Start — "Do These 3 Things"

#### Section P1A: Header
- **Content:** Overtaxed logo + "Your Property Tax Protest Playbook"
- **Subtext:** `Private strategy guide for [ADDRESS] · Do NOT submit this to the appraisal district`

#### Section P1B: The 3-Step Action Plan
Massive, clear, impossible to miss. This is the entire first page.

```
HOW TO FILE YOUR PROTEST

┌─────────────────────────────────────────────────────────┐
│  ① FILE ONLINE — by [DEADLINE]                          │
│                                                         │
│  Go to: [FILING_URL]                                    │
│  Account: [ACCT]                                        │
│  Select: "Unequal Appraisal" [+ "Value Over Market"]    │
│  Enter fair value: $[FAIR_ASSESSMENT]                   │
│  Upload: Your Evidence Packet PDF (the other file)      │
│                                                         │
│  [County-specific sub-steps: iFile PIN for Harris,      │
│   uFile for Dallas, SmartFile for Cook County, etc.]    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ② CHECK FOR A SETTLEMENT OFFER                         │
│                                                         │
│  In 1–3 weeks, check [PORTAL] for an offer.            │
│  • At or below $[FAIR_ASSESSMENT] → Accept it!          │
│  • Higher → Reject it and go to your hearing.           │
│  [iSettle details for Harris County]                    │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  ③ YOUR HEARING (if needed)                             │
│                                                         │
│  Bring your Evidence Packet. Use the script on p.3.     │
│  The hearing is informal — present calmly, 5 min max.   │
│  They CANNOT raise your value for protesting.           │
└─────────────────────────────────────────────────────────┘

Zero risk. Your taxes can only go down or stay the same.
```

- **Data required:** `deadline`, `filingUrl`, `filingPortal`, `fairAssessment`, `acct`
- **County variations:** Filing URL, portal name, iSettle guidance, specific sub-steps all differ per county.

#### Section P1C: "What Happens Next" Timeline (NEW)
Visual horizontal timeline showing the process:

```
FILE PROTEST          SETTLEMENT           INFORMAL         FORMAL ARB       RESULT
    │                    OFFER              HEARING           HEARING           │
    ●───────────────────●──────────────────●─────────────────●─────────────────●
  [DEADLINE]         1–3 weeks          if no offer       if no agreement   Decision
  File online        Check portal        Meet appraiser    3-person panel    announced
  Upload evidence    Accept or reject    Negotiate value   Present evidence  on the spot
                                                                    
                     ┌──────────┐        ┌──────────┐     ┌──────────┐
                     │ Accept?  │        │ Settle?  │     │ Not      │
                     │ → Done!  │        │ → Done!  │     │ satisfied?│
                     └──────────┘        └──────────┘     │ → Binding│
                                                          │ Arbitration│
                                                          │ or Court  │
                                                          └──────────┘
```

- **County variations:**
  - **Harris County (TX):** File → iSettle Offer → Informal → Formal ARB → Binding Arb/Court
  - **Dallas County (TX):** File → Informal Conference → Formal ARB → Binding Arb/Court
  - **Cook County (IL):** File with Assessor → Assessor Decision → Board of Review Appeal → PTAB → Circuit Court
- **Why it matters:** Most homeowners don't understand the multi-stage process. Seeing it as a timeline with exit points at each stage reduces anxiety and increases follow-through.

---

### Page 2: CAD Evidence Request & Property Record Audit

#### Section P2A: CAD Evidence Packet Request (NEW — THIS IS GOLD)
```
🏆 SECRET WEAPON: Request the District's Evidence BEFORE Your Hearing

Under Texas Tax Code §41.461, you have the RIGHT to receive a copy of ALL
data, schedules, formulas, and evidence the chief appraiser plans to present
at your hearing — at least 14 days before your hearing date.

WHY THIS MATTERS:
• You'll see their comps — and can find weaknesses in them
• Any evidence not provided to you 14 days before the hearing CANNOT be
  used against you (§41.67(d))
• You can use their OWN data to support YOUR argument

HOW TO REQUEST:
1. Send a written letter (email or mail) to [CAD_NAME] immediately after
   filing your protest
2. Reference: "Pursuant to Texas Property Tax Code §41.461(a)(2), I am
   requesting all data, schedules, formulas, and information the chief
   appraiser plans to introduce at my hearing."
3. Include your name, property address, and account number ([ACCT])
4. Send to: [CAD_ADDRESS / CAD_EMAIL]

SAMPLE LETTER:
┌──────────────────────────────────────────────────────────────────┐
│ [DATE]                                                          │
│                                                                 │
│ [CAD_NAME]                                                      │
│ [CAD_ADDRESS]                                                   │
│                                                                 │
│ Re: Evidence Request — Account [ACCT]                           │
│     Property: [ADDRESS]                                         │
│                                                                 │
│ Dear Chief Appraiser,                                           │
│                                                                 │
│ Pursuant to Texas Property Tax Code §41.461(a)(2), I request    │
│ a copy of all data, schedules, formulas, and all other          │
│ information the chief appraiser plans to introduce at my        │
│ Appraisal Review Board hearing to establish any matter at       │
│ issue.                                                          │
│                                                                 │
│ Per §41.461(b), there shall be no charge for these copies.      │
│ Per §41.67(d), any evidence not provided at least 14 days       │
│ before my hearing may not be used as evidence.                  │
│                                                                 │
│ Please deliver to: [HOMEOWNER_PLACEHOLDER]                      │
│                                                                 │
│ Thank you,                                                      │
│ [HOMEOWNER_PLACEHOLDER]                                         │
│ Property Owner                                                  │
└──────────────────────────────────────────────────────────────────┘

WHAT TO DO WITH THEIR EVIDENCE:
• Review their comparable properties. Do any actually support YOUR value?
• Check if any of their comps have received protest reductions — this
  undermines their own median.
• Note any comps that are in different neighborhoods, significantly
  different sizes, or different property types — these are weak comps
  you can challenge at the hearing.
```

- **Data required:** `cadName`, `cadAddress`, `cadEmail`, `acct`, `address`
- **County variations:**
  - **TX counties:** All use §41.461 framework. CAD name/address varies per county.
  - **Harris County:** Has online evidence available via iFile after filing — note this.
  - **Cook County IL:** Different framework. IL has Freedom of Information Act (FOIA) requests. The Assessor's Office provides their analysis when you appeal. The Board of Review has its own evidence review process. Adapt language accordingly.
- **Why it matters:** This is the single most powerful tool homeowners don't know about. Per O'Connor Tax: *"Obtaining your adversary's evidence 14 days before the hearing gives ample time to study their evidence. It also limits what evidence they can present at the hearing."* The appraiser CANNOT introduce evidence at the hearing that wasn't shared 14 days prior.

#### Section P2B: Property Record Audit Guide (NEW)
```
✅ CHECK YOUR PROPERTY RECORD FOR ERRORS — Instant Win Potential

The CAD's records for your property show:
  Building Sq Ft: [SQFT]        Bedrooms: [BEDS]
  Year Built: [YEAR]            Bathrooms: [BATHS]
  Stories: [STORIES]            Pool: [YES/NO]
  Garage: [TYPE/SPACES]         Lot Size: [LOT_SQFT] sf
  Construction: [TYPE]          Condition: [CDU]

DO THESE MATCH YOUR ACTUAL PROPERTY?

Common errors that result in over-appraisal:
□ Square footage is higher than actual (most common!)
□ Pool listed but has been removed or filled in
□ Extra bedroom/bathroom that doesn't exist
□ Garage listed as finished living space
□ Year built is wrong (newer = higher value)
□ Construction quality rated too high
□ Lot size is incorrect

IF YOU FIND AN ERROR:
This is your strongest possible evidence. At the hearing, state:
"The district's records show [WRONG], but my property actually has [CORRECT].
I have [SURVEY / BLUEPRINT / PHOTOS] to document this."

Where to verify:
• [CAD_WEBSITE] → Search your account → "Property Details" or "Improvements"
• Compare to your original survey, deed, or builder plans
• Measure your home's exterior if square footage seems off
```

- **Data required:** Same property record fields as Evidence Packet Section 4A
- **Why it matters:** Data errors are the #1 source of "easy wins." The current packet doesn't prompt customers to check. This section makes it impossible to ignore.

---

### Page 3: Hearing Script & Appraiser Rebuttal Guide

#### Section P3A: 5-Minute Hearing Script
```
📝 WHAT TO SAY AT YOUR HEARING
Read this word-for-word if you want. Hearings are ~15 minutes total.
You get about 5 minutes. Keep it calm and factual.

OPENING (30 seconds):
"Good morning. My name is [YOUR NAME], and I'm the owner of [ADDRESS],
account number [ACCT]. I'm protesting on the grounds of unequal appraisal.
My property is appraised at $[CURRENT_VALUE]. I'm requesting a value of
$[FAIR_VALUE]. I've provided copies of my evidence for each panel member."

[If record errors found:]
RECORD CORRECTION (30 seconds):
"First, I'd like to note that the district's records show [ERROR].
My property actually has [CORRECT]. This alone affects the valuation."

YOUR EVIDENCE (90 seconds):
"Turning to my evidence packet, I've identified [COMP_COUNT] comparable
properties in the same neighborhood ([CODE]) with similar size and age.
The median appraisal among these comparables is $[COMP_MEDIAN_PSF] per
square foot. My property is appraised at $[PER_SQFT] per square foot —
that's [OVER_ASSESSED_PCT]% higher than comparable properties.

Under Texas Tax Code Section 42.26, my appraised value must not exceed
the median of comparable properties. I'm requesting a reduction to
$[FAIR_VALUE]."

CLOSING (30 seconds):
"In summary, [COMP_COUNT] comparable properties in my neighborhood are
appraised significantly lower on a per-square-foot basis. I respectfully
request the Board set my value at $[FAIR_VALUE]. Thank you."
```

- **Data required:** Same core fields as evidence packet
- **County variations:** Script adapts legal citations (TX vs IL), board name (ARB vs BOR), terminology

#### Section P3B: Appraiser Rebuttal Guide (NEW — CRITICAL ADDITION)
```
🛡️ WHEN THE APPRAISER PUSHES BACK — What They'll Say & How to Respond

┌────────────────────────────┬───────────────────────────────────────────┐
│ THEY SAY:                  │ YOU SAY:                                  │
├────────────────────────────┼───────────────────────────────────────────┤
│ "We used different comps"  │ "I've reviewed the district's evidence.   │
│                            │ My comps are in the same neighborhood     │
│                            │ code ([CODE]), similar size and age.      │
│                            │ Can you explain specifically why your     │
│                            │ comps are more appropriate than mine?"    │
├────────────────────────────┼───────────────────────────────────────────┤
│ "Your comps are too far    │ "My comps are all within [X] miles and   │
│ away" or "not similar      │ share the same neighborhood code. Under  │
│ enough"                    │ §42.26(a)(3), comparable properties in   │
│                            │ the same neighborhood are valid for      │
│                            │ equity comparison. Which specific comp   │
│                            │ do you believe is invalid, and why?"     │
├────────────────────────────┼───────────────────────────────────────────┤
│ "Market conditions support │ "I'm not arguing about market direction  │
│ our value"                 │ — I'm arguing about equal treatment.     │
│                            │ These comparable properties are in the   │
│                            │ SAME market and SAME time period, yet    │
│                            │ they're appraised lower. That's unequal  │
│                            │ appraisal."                              │
├────────────────────────────┼───────────────────────────────────────────┤
│ "Your property has [pool/  │ "I've accounted for those differences.   │
│ upgrades/extra bedroom]    │ Even after adjustments, the comparables  │
│ that comps don't"          │ support my requested value. Also, the    │
│                            │ district's record shows [FEATURE] — can  │
│                            │ you confirm that's accurate?"            │
├────────────────────────────┼───────────────────────────────────────────┤
│ "These are assessment      │ "Yes, that's intentional. I filed on     │
│ comps, not sales comps"    │ grounds of unequal appraisal. Texas Tax  │
│                            │ Code §42.26(a)(3) explicitly uses        │
│                            │ appraised values — not sales prices —    │
│                            │ for equity protests."                    │
├────────────────────────────┼───────────────────────────────────────────┤
│ "We can offer you $[X]"    │ If ≤ $[FAIR_VALUE]: "I'll accept that."  │
│ (a compromise)             │ If higher: "My evidence supports         │
│                            │ $[FAIR_VALUE]. I'd like the board to     │
│                            │ consider the comparable data."           │
└────────────────────────────┴───────────────────────────────────────────┘

PRO TIP: Force specificity. When the appraiser challenges your comps,
ask: "Which specific comp do you believe is invalid, and what makes it
dissimilar?" Many times they can't articulate a specific reason. This
puts them on the defensive.
```

- **Data required:** `neighborhoodCode`, `fairAssessment`, `compCount`
- **County variations:**
  - **TX:** All rebuttals cite Texas Tax Code. Same structure for all TX counties.
  - **IL (Cook County):** Adapt citations to IL law. BOR hearings are different — often no appraiser present; it's a paper review. Rebuttal guide focuses on strengthening the written submission rather than verbal counter-arguments.
- **Why it matters:** This is the #1 thing missing from our current packet. Customers are terrified of hearings because they don't know what the OTHER side will say. This removes the fear.

---

### Page 4: Condition Documentation Guide & Settlement Strategy

#### Section P4A: Condition Documentation Guide (NEW)
```
📸 DOCUMENT YOUR PROPERTY'S CONDITION — Reduce Value Further

If your property has deferred maintenance, damage, or functional issues,
documenting them can reduce your assessed value beyond what comps alone achieve.

WHAT TO PHOTOGRAPH:
□ Roof (age, missing shingles, visible wear, leaks)
□ Foundation (cracks, settling, uneven floors)
□ HVAC system (age plate showing year, visible deterioration)
□ Water damage (stains, mold, warped wood)
□ Exterior (peeling paint, rotting wood, cracked siding)
□ Plumbing issues (visible leaks, old pipes)
□ Outdated kitchen/bathrooms (if similar comps have been updated)
□ Any structural or cosmetic damage

HOW TO STRENGTHEN YOUR CASE:
1. Take clear, dated photos of each issue
2. Get written repair estimates from licensed contractors
   (on company letterhead with license number)
3. If available, include insurance claims or inspection reports

WHAT TO SAY AT THE HEARING:
"My property has condition issues that reduce its market value.
[DESCRIBE ISSUES]. I've obtained contractor estimates totaling $[AMOUNT]
for necessary repairs. A reasonable buyer would deduct these costs."

ESTIMATED VALUE IMPACTS:
• Roof replacement: $8,000–$25,000
• Foundation repair: $5,000–$30,000
• HVAC replacement: $5,000–$15,000
• Major plumbing: $3,000–$15,000
• Kitchen/bath renovation needed: $10,000–$40,000
```

- **Data required:** None (static guidance)
- **County variations:** Same across all counties
- **Why it matters:** Many homeowners don't realize deferred maintenance is valid evidence. This gives them a concrete checklist and helps them build a stronger case.

#### Section P4B: Settlement Decision Guide
```
💰 HOW TO EVALUATE A SETTLEMENT OFFER

When you receive a settlement offer (via iSettle, informal hearing, or
Board of Review), use this framework:

YOUR TARGET VALUE: $[FAIR_ASSESSMENT]

ACCEPT if the offer is:
✅ At or below $[FAIR_ASSESSMENT]
✅ Within $[5K–10K] of your target AND your evidence is moderate
✅ You don't want the time/stress of a formal hearing

REJECT if:
❌ The offer is barely a reduction (< 3% of appraised value)
❌ You have strong evidence (record errors, major condition issues,
   overwhelming comp data)
❌ You're willing to go to a formal hearing

IMPORTANT: Once you accept a settlement, it's FINAL.
You cannot appeal further. Make sure the number is right before signing.

IF YOU REJECT → WHAT HAPPENS:
• You'll be scheduled for a formal hearing (ARB in TX, BOR in IL)
• The formal hearing is before an independent panel — not the same
  appraiser who made the offer
• The panel CANNOT raise your value — worst case is no change
• You can still negotiate right before the hearing starts
```

- **Data required:** `fairAssessment`
- **County variations:** iSettle specifics for Harris County, different settlement mechanics per county

---

### Page 5: Important Information & Escalation Options

#### Section P5A: Homestead Exemption Check (NEW — ACTIVE VERIFICATION)
```
[IF EXEMPTION MISSING:]
🔴 URGENT: You May Be Missing Your Homestead Exemption

Our data does not show an active homestead exemption on your property.
If this is your primary residence, you are potentially missing:

TEXAS: Up to $100,000 reduction in taxable value (effective 2024),
plus a 10% annual cap on appraised value increases.

HOW TO APPLY (FREE — takes 5 minutes):
1. Go to [CAD_WEBSITE]
2. Download Form 50-114 (Application for Residential Homestead Exemption)
3. Complete and submit with a copy of your driver's license
4. You may file retroactively for up to 2 years of missed exemptions

This is SEPARATE from your protest and should be done immediately.

[IF EXEMPTION ACTIVE:]
✅ Your homestead exemption is active.
Reminder: Your appraised value cannot increase by more than 10% per year
under the homestead cap. Protesting STILL matters — it lowers the base
that future increases are calculated from.
```

- **Data required:** `hasHomesteadExemption`, `exemptionType`, `cadWebsite`
- **County variations:**
  - **TX:** $100,000 homestead exemption, 10% cap, Form 50-114
  - **IL (Cook County):** Homeowner Exemption ($10,000 EAV reduction), Senior Exemption ($8,000 EAV), Senior Freeze, apply through Cook County Assessor

#### Section P5B: Escalation Options
```
📈 IF YOUR PROTEST IS DENIED — Next Steps

Your protest journey doesn't end at the ARB/BOR. You have additional options:

TEXAS:
1. Binding Arbitration (properties under $5 million)
   • File within 60 days of ARB order
   • $500 deposit (refunded if you win)
   • Independent arbitrator reviews evidence
   • Decision is final for both sides

2. District Court Appeal
   • File within 60 days of ARB order
   • Requires an attorney
   • More expensive but more thorough review
   • Consider for properties with $10K+ at stake

ILLINOIS (Cook County):
1. Property Tax Appeal Board (PTAB)
   • File within 30 days of BOR decision
   • State-level review board
   • Free to file
   • Can take 12-18 months

2. Circuit Court
   • File within 35 days of assessment
   • Requires an attorney
   • For complex cases or high-value properties
```

#### Section P5C: Important Reminders
```
• Texas/IL reassesses EVERY YEAR — protest annually for best results
• Filing a protest is FREE and there is NO downside
• Your taxes can ONLY go down or stay the same from protesting
• You do NOT need an attorney, agent, or consultant
• Keep this playbook for reference in future years
```

#### Section P5D: Footer
```
This playbook was prepared by Overtaxed (getovertaxed.com) for the exclusive
use of the property owner. It does not constitute legal advice.

Questions? Reply to your delivery email or contact hello@getovertaxed.com

Generated: [DATE] · Account: [ACCT] · [COUNTY] County, [STATE]
```

---

## 5. County Variation Matrix

### What's Universal (Same in All Counties)
| Section | Notes |
|---------|-------|
| Evidence Packet: Header, Summary Cards, Comp Table | Layout identical; data varies |
| Evidence Packet: Property Record Audit | Field names may differ but structure is same |
| Evidence Packet: Opinion of Value | Same structure |
| Playbook: Condition Documentation Guide | Static content, same everywhere |
| Playbook: Rebuttal Guide | Core structure same; citations differ |
| Playbook: Settlement Decision Guide | Framework same; portal names differ |

### What Changes Per State

| Element | Texas | Illinois (Cook County) |
|---------|-------|----------------------|
| Legal citations | §41.41, §42.26, §41.461, §41.67 | 35 ILCS 200/16-70, 200/16-185 |
| Terminology | "Appraised value" | "Assessed value" / "EAV" |
| Hearing body | Appraisal Review Board (ARB) | Board of Review (BOR) / Assessor |
| Evidence request | §41.461 letter to Chief Appraiser | FOIA request / part of appeal process |
| Filing portal | iFile (Harris), uFile (Dallas), etc. | SmartFile (Cook County Assessor) |
| Homestead exemption | $100K, 10% cap, Form 50-114 | Homeowner Exemption $10K EAV |
| Escalation | Binding Arbitration → District Court | PTAB → Circuit Court |
| Assessment ratio | 100% (market = appraised) | 10% of market value (residential) |
| Reassessment cycle | Annual | Triennial (by township in Cook) |
| Sales comp availability | Non-disclosure state (limited) | Disclosure state (available) |
| Hearing format | In-person or phone, adversarial | Mostly paper review, can request hearing |
| Market value section | Fallback guidance (no public sales) | Can include actual sales comps |

### What Changes Per County (TX)

| Element | Harris | Dallas | Tarrant | Others |
|---------|--------|--------|---------|--------|
| CAD name | HCAD | DCAD | TAD | [varies] |
| Filing URL | owners.hcad.org | dallascad.org | tad.org | [varies] |
| Portal name | iFile | uFile | eFile | [varies] |
| iSettle | Yes (detailed guidance) | Yes (limited) | No | [varies] |
| CAD email | [email] | [email] | [email] | [varies] |
| Deadline | May 15 / 30 days / Apr 30 homestead | May 15 / 30 days | May 15 / 30 days | [varies] |
| Evidence request address | HCAD, 13013 NW Fwy | DCAD, 2949 N. Stemmons | TAD, 2500 Handley-Ederville | [varies] |

---

## 6. Data Requirements

### Existing Fields (Already in Cosmos DB)
```typescript
interface PropertyData {
  acct: string;              // Account number
  address: string;           // Property address
  city: string;              // City
  state: string;             // State (TX, IL)
  county: string;            // County name
  neighborhoodCode: string;  // Appraisal neighborhood code
  neighborhoodGroup: string; // Neighborhood group
  sqft: number;              // Building square footage
  yearBuilt: number;         // Year built
  currentAssessment: number; // Current appraised/assessed value
  fairAssessment: number;    // Our calculated fair value
  potentialReduction: number;// Dollar reduction
  estimatedSavings: number;  // Annual tax savings
  perSqft: number;           // Current $/sqft
  fairPerSqft: number;       // Fair $/sqft
  overAssessedPct: number;   // % over-assessed
  comps: Comp[];             // Array of comparables
  compMedianPerSqft: number;
  compAvgPerSqft: number;
}

interface Comp {
  acct: string;
  address: string;
  sqft: number;
  assessedVal: number;
  perSqft: number;
  yearBuilt?: number;
}
```

### NEW Fields Needed
```typescript
interface PropertyDataExtended extends PropertyData {
  // Property Record Audit fields
  beds?: number;              // Bedroom count from CAD
  baths?: number;             // Bathroom count from CAD
  halfBaths?: number;         // Half-bath count
  stories?: number;           // Number of stories
  hasPool?: boolean;          // Pool on property
  garageType?: string;        // "Attached", "Detached", "Carport", "None"
  garageSpaces?: number;      // Number of garage spaces
  lotSqft?: number;           // Lot size in sq ft
  constructionType?: string;  // "Frame", "Brick", "Stone", etc.
  cduRating?: string;         // Condition/Desirability/Utility rating
  
  // Homestead Exemption
  hasHomesteadExemption?: boolean;
  exemptionType?: string;     // "Homestead", "Over65", "Disabled", etc.
  exemptionAmount?: number;
  
  // Comp Quality Indicators
  // (per comp, extend Comp interface)
  
  // Market Value / Sales Comps (optional)
  salesComps?: SalesComp[];
  
  // County-specific metadata
  cadName: string;            // "Harris County Appraisal District"
  cadAddress: string;         // Mailing address for evidence request
  cadEmail?: string;          // Email for evidence request
  cadWebsite: string;         // Main CAD website
  filingUrl: string;          // Where to file protest
  filingPortal: string;       // "iFile", "uFile", "SmartFile"
  filingBody: string;         // "HCAD", "DCAD", etc.
  deadline: string;           // "May 15" or specific date
  hasISettle: boolean;        // Whether iSettle is available
  
  // IL-specific
  pin?: string;               // Property Index Number (IL)
  township?: string;          // Township name (IL)
  classCode?: string;         // Property class code (IL)
  assessmentLevel?: number;   // Assessment level % (IL, typically 10%)
}

interface CompExtended extends Comp {
  distanceMiles?: number;     // Distance from subject
  sqftDiffPct?: number;       // % size difference from subject
  ageDiffYears?: number;      // Year built difference from subject
  sameNeighborhood: boolean;  // Same neighborhood code as subject
  neighborhoodCode?: string;  // Comp's neighborhood code
}

interface SalesComp {
  address: string;
  saleDate: string;           // MM/YYYY
  salePrice: number;
  sqft: number;
  pricePerSqft: number;
  adjustments?: number;       // Net dollar adjustment
  adjustedValue?: number;     // After adjustments
}
```

### Data Availability Assessment

| Field | Harris | Dallas | Tarrant | Cook County | Priority |
|-------|--------|--------|---------|-------------|----------|
| beds/baths | ✅ HCAD API | ✅ DCAD | ✅ TAD | ✅ Assessor | HIGH |
| stories | ✅ | ✅ | ✅ | ✅ | HIGH |
| hasPool | ✅ | ✅ | ✅ | ✅ | HIGH |
| garage | ✅ | ✅ | ✅ | ✅ | MEDIUM |
| lotSqft | ✅ | ✅ | ✅ | ✅ | MEDIUM |
| construction | ✅ | ✅ | ✅ | ✅ | MEDIUM |
| CDU rating | ✅ | ✅ | ✅ | N/A (IL) | LOW |
| homestead exempt | ✅ | ✅ | ✅ | ✅ | HIGH |
| comp distance | Calculate from lat/lng | Calculate | Calculate | Calculate | HIGH |
| sales comps | ❌ (non-disclosure) | ❌ | ❌ | ✅ (disclosure state) | MEDIUM |

---

## 7. Priority Implementation Order

### If we can only add 3 things (MVP upgrade):

**Priority 1: Property Record Audit Section** (Evidence Packet p.4 + Playbook p.2)
- **Effort:** LOW — We likely already have beds/baths/pool in our data or can scrape it
- **Impact:** HIGHEST — Data errors are the #1 source of "instant wins"
- **Customer value:** Prompts every customer to verify their records. Even if our data is incomplete, the checklist itself is valuable.

**Priority 2: Appraiser Rebuttal Guide** (Playbook p.3)
- **Effort:** LOW — It's static content with a few dynamic fields (neighborhood code, fair value)
- **Impact:** HIGH — Removes the #1 fear customers have about hearings
- **Customer value:** Customers feel prepared and confident. This is what separates a $49 packet from a free Google search.

**Priority 3: CAD Evidence Request Instructions + Sample Letter** (Playbook p.2)
- **Effort:** LOW — Static content with county-specific addresses
- **Impact:** HIGH — This is a genuine "secret weapon" most homeowners don't know about
- **Customer value:** Levels the playing field. Feels like insider knowledge. §41.461 is powerful and underused.

### Full Implementation Phases

**Phase 1 (MVP — 1 week):**
- [ ] Split into two PDFs (Evidence + Playbook)
- [ ] Add Property Record Audit section to both PDFs
- [ ] Add Appraiser Rebuttal Guide to Playbook
- [ ] Add CAD Evidence Request instructions + sample letter to Playbook
- [ ] Add Comp Quality Indicators to comp table (distance, size match, age match)

**Phase 2 (Polish — 1 week):**
- [ ] Add "What Happens Next" visual timeline
- [ ] Add Condition Documentation Guide
- [ ] Add Homestead Exemption Verification (active check)
- [ ] Add Settlement Decision Guide
- [ ] Add Escalation Options section
- [ ] Improve hearing script with record-error conditional section

**Phase 3 (Market Value — 2 weeks):**
- [ ] Add Market Value Analysis section (with sales comps for IL)
- [ ] Add fallback guidance for TX (non-disclosure state)
- [ ] Source sales comp data for Cook County IL
- [ ] Add adjustment methodology for sales comps

**Phase 4 (County Expansion):**
- [ ] Template all county-specific metadata (CAD name, address, portal, deadline)
- [ ] Build county config system so adding a new county is just adding config
- [ ] Test with all active counties (Harris, Dallas, Tarrant, Fort Bend, etc.)

---

## 8. Visual Design System

### Color Palette (existing, maintained)
| Color | Hex | Usage |
|-------|-----|-------|
| Teal (primary) | `#1a6b5a` | Headers, success states, comp highlights |
| Amber (alert) | `#b45309` | Subject row, over-appraisal callouts |
| Amber light (bg) | `#fffbeb` | Subject row background |
| Teal light (bg) | `#e8f4f0` | Success card backgrounds |
| Yellow warning | `#f59e0b` | Deadline warnings, alerts |
| Blue info | `#3b82f6` | Info boxes |
| Red urgent | `#dc2626` | Missing homestead exemption |
| Gray background | `#f8f9fa` | Section backgrounds |
| Border gray | `#e2e8f0` | Table borders, dividers |

### Typography
| Element | Font | Size | Weight |
|---------|------|------|--------|
| Document title | Inter | 22px | 800 |
| Section headers | Inter | 13px | 700, uppercase, 0.5px letter-spacing |
| Body text | Inter | 11px | 400 |
| Table headers | Inter | 9px | 600, uppercase |
| Table body | Inter | 10px | 400 |
| Hearing script | Georgia (serif) | 10.5px | 400 |
| Monospace (accts) | SF Mono / Consolas | 8.5px | 400 |
| Legal disclaimer | Inter | 8.5px | 400, color: #999 |

### Layout Rules
- **Page size:** US Letter (8.5" × 11")
- **Margins:** 0.6" top/bottom, 0.65" left/right (evidence), 0.75" (playbook)
- **Section spacing:** 20px between sections
- **Page breaks:** Explicit `page-break-before: always` at key boundaries
- **Print fidelity:** All backgrounds use `print-color-adjust: exact`

### Iconography
Use Unicode emoji for section headers in the Playbook (📋 📝 🏆 📸 💰 ⚠️ ✅ 🔴).
Evidence Packet stays emoji-free — purely professional.

---

## 9. Appendix: Legal Citations Reference

### Texas Property Tax Code
| Section | What It Says | Where We Use It |
|---------|-------------|-----------------|
| §41.41(a)(1) | Right to protest appraised value exceeds market value | Market value argument |
| §41.41(a)(2) | Right to protest on grounds of unequal appraisal | Primary equity argument |
| §41.43(b)(3) | Equity protest standard — must reduce to median of comps | Brief, hearing script |
| §42.26(a)(3) | Appraised value must not exceed median of comparable properties | Brief, hearing script |
| §41.461 | Right to request CAD's evidence 14 days before hearing | Evidence request letter |
| §41.67(d) | Evidence not provided 14 days before hearing is inadmissible | Evidence request letter |
| §11.13 | Homestead exemption | Homestead check section |

### Illinois Property Tax Code
| Section | What It Says | Where We Use It |
|---------|-------------|-----------------|
| 35 ILCS 200/16-70 | Assessor may revise assessments on appeal | Brief |
| 35 ILCS 200/16-185 | Board of Review appeal rights | Brief, filing instructions |
| 35 ILCS 200/10-35 | Assessment uniformity requirement | Equity argument |
| 35 ILCS 200/15-172 | Homeowner Exemption ($10,000 EAV) | Homestead check |
| 35 ILCS 200/15-175 | Senior Citizens Homestead Exemption | Senior exemption mention |

---

## Summary: What We're Building

| What Exists Today | What We're Adding | Impact |
|---|---|---|
| Single monolithic PDF | Split into Evidence Packet + Playbook | Clarity, professionalism |
| Basic comp table | Comp Quality Indicators (distance, size match, age match) | Defends comp selection |
| Hearing script | + Appraiser Rebuttal Guide (6 scenarios) | Removes hearing fear |
| Homestead reminder (text) | Active Homestead Exemption Verification | Catches missed exemptions |
| Filing instructions | + CAD Evidence Request letter + sample | "Secret weapon" |
| No property record check | Property Record Audit with checklist | "Instant win" potential |
| No condition guidance | Condition Documentation Guide | Additional reduction path |
| No process timeline | "What Happens Next" visual timeline | Reduces anxiety |
| Equity only | + Market Value section (or guidance) | Two arguments > one |
| Generic legal citations | County-specific metadata system | Scalable to new counties |

**Total estimated value increase to customer: MASSIVE.** This transforms a decent comp report into a complete protest toolkit that rivals what $500+ professional firms deliver.

---

*End of specification. Ready for engineering implementation.*
