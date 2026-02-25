# FINAL BLUEPRINT — Overtaxed Evidence Packet v2
## The Definitive Build Spec
### February 18, 2026 | Based on 19 Research Reports (~12,000 lines)

---

## Executive Summary

After reading every report, here's the convergence: **our core evidence (equity comp grids) is built on the right foundation but the comp selection has real flaws, and we're missing the surrounding material that turns good data into a winning protest.**

The fix is two workstreams:
1. **Fix the engine** — precompute script improvements (2-3 days)
2. **Build the experience** — split into two PDFs, add the missing content (1-2 weeks)

---

## PART 1: FIX THE COMP ENGINE

### What's Wrong (Precompute Audit Grade: C+)

| Issue | Severity | Affects | Fix |
|-------|----------|---------|-----|
| No year-built filter | 🔴 CRITICAL | All 10 counties | Add ±15 year filter |
| ±25% sqft too loose | 🔴 CRITICAL | All 10 counties | Tighten to ±20% |
| Cherry-picks 5 lowest $/sqft | 🟠 HIGH | All 10 counties | Select from lower quartile, not absolute bottom |
| No fallback for thin neighborhoods | 🟠 HIGH | All counties | Expand to adjacent neighborhoods when <5 comps |
| Rockwall has NO sqft | 🔴 CRITICAL | Rockwall | Scrape from RCAD or pull from product |
| Dallas has beds/baths/pool but doesn't filter | 🟠 HIGH | Dallas | Use available data |
| Houston comps don't output year_built/beds/baths | 🟡 MEDIUM | Houston | Add to comp output |
| Multi-year savings only in Rockwall | 🟡 MEDIUM | 9 counties | Add 5-year multiplier everywhere |

### The Fix — New Comp Selection Algorithm

```
For each subject property:
  1. Filter to same neighborhood code + same property type
  2. Filter to ±20% sqft (was ±25%)
  3. Filter to ±15 years built (NEW)
  4. If <5 candidates: expand to neighborhood group / adjacent neighborhoods
  5. If still <5: widen sqft to ±30%, age to ±20 years
  6. Score remaining candidates by similarity:
     - Size match (25%): 1 - |sqft_diff| / subject_sqft
     - Age match (20%): 1 - |age_diff| / 30
     - Quality/condition match (20%): same grade = 1.0, adjacent = 0.7
     - Pool match (15%): same pool status = 1.0, different = 0.5
     - Value proximity (20%): 1 - |value_diff| / subject_value
  7. Sort by similarity score descending
  8. Take top 10 (not 5 — more comps is more credible)
  9. Calculate fair value = median comp $/sqft × subject sqft
  10. Add comp_confidence: "high" (8+), "medium" (5-7), "low" (3-4), "insufficient" (<3)
```

### Per-County Adjustments

| County | Unique Handling |
|--------|----------------|
| **Dallas** | Filter on pool status, building class. Richest data — should produce best comps. |
| **Houston** | Add year_built, beds, baths, quality_code to comp output. Use qa_cd in scoring. |
| **Tarrant** | Use quality grade + condition (CDU) instead of beds/baths (permanently unavailable). |
| **Bexar** | Verify MULTIPLE RESIDENCE floor type isn't inflating sqft. Keep sup_num logic. |
| **Austin/Travis** | Use baths (91% coverage) in scoring. Beds (34%) too sparse to filter on. |
| **Collin** | Use beds (84.5%) in filtering. Dual-source (MDB + Socrata) already handled. |
| **Fort Bend** | Full data — filter on beds, baths, pool, fireplaces. Should rival Dallas quality. |
| **Denton** | Use subdivision (10,129) as neighborhood proxy. Check certified annual ZIP for beds/baths. |
| **Williamson** | No year_built — use city grouping + value range. Flag as lower confidence. |
| **Rockwall** | **CRITICAL**: Scrape sqft from RCAD property search (42K properties = feasible). Until then, add prominent disclaimer to packet. |

### Implementation Priority
1. Year-built filter + sqft tightening (affects ALL counties, 1 day)
2. Lower-quartile selection instead of bottom-5 (1 day)
3. Add comp_confidence scoring (0.5 day)
4. Rockwall sqft enrichment (2-3 days)
5. Dallas/Fort Bend: add pool/beds/baths filtering (1 day)
6. Houston: add fields to comp output (0.5 day)
7. Fallback to adjacent neighborhoods (1 day)
8. Multi-year savings for all counties (0.5 day)

**Total: ~7-8 days of focused work. Critical items (1-3): 2.5 days.**

---

## PART 2: THE TWO-PDF SYSTEM

Split every packet into two documents:

### PDF #1: Evidence Packet (4-5 pages)
**Purpose**: What you submit to the CAD / hand to the ARB panel.
**Tone**: Professional, authoritative, no hand-holding. Looks like it came from a tax consultant.
**The appraiser sees this.**

### PDF #2: Homeowner Playbook (5-7 pages)  
**Purpose**: Private strategy guide. How to file, what to say, how to handle pushback.
**Tone**: Warm, clear, empowering. Like a smart friend who's been through this.
**The appraiser never sees this.**

---

## EVIDENCE PACKET — Page by Page

### Page 1: Cover Brief + Subject Property

**Header Bar**: Overtaxed logo + "Property Tax Protest Evidence" + date + county + protest type

**Subject Property Block**:
- Address, Account#, City, Neighborhood Code
- Year Built, Building SF, Beds/Baths (where available), Pool (where available)

**🆕 Property Record Audit Alert** (conditional — always show):
```
⚠️ VERIFY YOUR PROPERTY RECORD
The [CAD] records show: [SQFT] sq ft, [BEDS] beds, [BATHS] baths, Pool: [YES/NO]
Please verify these match your actual property. Errors in CAD records are
common and are grounds for immediate value reductions. If ANY detail is wrong,
note the correction and bring proof to your hearing.
```
**Why**: Property record errors are "instant wins." Deji won partly on a sqft error. This prompts EVERY customer to check. Even if the data is right, it demonstrates due diligence to the ARB.

**Summary Cards** (3 across):
1. Current Appraised Value (amber) — with $/sqft and % above median
2. Fair Value Based on Comparables (teal) — with $/sqft and comp count  
3. Estimated Annual Tax Savings (teal) — with multi-year projection

**Statement of Unequal Appraisal** (legal brief):
- TX version: Cites §41.41(a)(2) and §42.26(a)(3) specifically
- IL version: Cites 35 ILCS 200/16-70 and 200/10-35
- Dynamic: references subject's exact numbers, neighborhood, comp count, median
- **🆕 Add**: "The petitioner has also filed on grounds of excessive market value under §41.41(a)(1) to preserve all appeal rights."

### Page 2: Comparable Properties Grid

**Comp Table** (10 comps, not 5):

| # | Address / Account | Bldg SF | Year Built | Beds/Baths | Appraised Value | $/SF | Similarity |
|---|---|---|---|---|---|---|---|

- Subject property highlighted in amber row at top (★)
- **🆕 Similarity indicator**: ●●●●○ (4/5) visual dots showing match quality
- **🆕 Size match %**: "+8%" or "-12%" showing sqft difference from subject
- **🆕 Age match**: "Same era" / "+5 yrs" / "-12 yrs"

**Comp Summary Bar**:
- Subject $/SF (amber)
- Comp Median $/SF (teal)
- Comp Average $/SF (teal)
- Difference (with % — the key number)

**🆕 Comp Quality Note** (italic, below table):
```
These [10] comparable properties were selected from [TOTAL_IN_NEIGHBORHOOD]
properties within appraisal neighborhood [CODE]. Selection criteria: same property
classification, within 20% of subject's building area ([SQFT_MIN]-[SQFT_MAX] sqft),
built within 15 years of subject ([YEAR_MIN]-[YEAR_MAX]). Ranked by overall
similarity to subject property.
```
**Why**: Preempts the appraiser's #1 attack ("you cherry-picked comps"). Shows transparent, defensible methodology.

### Page 3: Property Details + Tax Impact

**Two-column layout:**

Left column — Subject Property Details:
- Building Sq Ft, Year Built, Beds/Baths, Stories, Pool, Garage, Lot Size
- Neighborhood Code, Property Class
- **🆕 Homestead Exemption Status**: ✅ Active / ⚠️ NOT FOUND (see Playbook)

Right column — Appraisal & Tax Summary:
- Current Appraised Value → Fair Value → Requested Reduction
- Current Annual Tax → After Reduction → Annual Savings
- **🆕 5-Year Savings Projection**: $[SAVINGS × 5] (Texas reassesses annually)

### Page 4: Property Record Audit (NEW)

**🆕 Full page — this is net new content**

**Property Characteristics Comparison**:

| Field | CAD Records | Your Actual Property | Match? |
|-------|------------|---------------------|--------|
| Building Sq Ft | [FROM_DATA] | _______________ | ☐ |
| Year Built | [FROM_DATA] | _______________ | ☐ |
| Bedrooms | [FROM_DATA] | _______________ | ☐ |
| Bathrooms | [FROM_DATA] | _______________ | ☐ |
| Stories | [FROM_DATA] | _______________ | ☐ |
| Pool | [FROM_DATA] | _______________ | ☐ |
| Garage | [FROM_DATA] | _______________ | ☐ |
| Exterior | [FROM_DATA] | _______________ | ☐ |
| Condition | [FROM_DATA] | _______________ | ☐ |

**Instructions below table**:
```
Review each field carefully. If ANY field is incorrect:
1. Note the correction in the "Your Actual Property" column
2. Gather supporting evidence (survey, blueprints, photos, contractor letter)
3. Present corrections at your hearing — data errors are the #1 source of 
   immediate reductions. A wrong sqft alone can reduce your value by thousands.
```

**Common Errors to Check**:
- Sq ft includes garage, porch, or unfinished space that shouldn't count
- Pool listed but removed/filled in
- Extra bathroom or bedroom that doesn't exist
- Condition rated too high (doesn't reflect current state)
- Year built wrong (especially after major renovation — may show reno year)

### Page 5 (Cook County only): Sales Comparable Analysis

**IL is a disclosure state — we can include actual sales data.**

| # | Address | Sale Date | Sale Price | Sq Ft | $/SF | Adjusted Value |
|---|---------|-----------|------------|-------|------|---------------|

- Source: Cook County Assessor open data portal (free API)
- 3-5 recent sales within same township, similar size/age
- Adjustments for size, age, condition differences
- Median adjusted sale price as market value indicator

**Brief**: "Recent arm's-length sales of comparable properties in [TOWNSHIP] demonstrate a market value of $[MEDIAN_ADJUSTED], supporting the requested reduction."

---

## HOMEOWNER PLAYBOOK — Page by Page

### Page 1: Quick Start Guide

**Big, clear process overview:**

```
YOUR PROTEST IN 4 STEPS

① FILE YOUR PROTEST
   → [County-specific portal URL and instructions]
   → Account Number: [ACCT] (pre-filled)
   → Opinion of Value: $[FAIR_VALUE] (pre-filled)  
   → Check BOTH boxes: ☑ Market Value ☑ Unequal Appraisal
   → Upload your Evidence Packet PDF

② REQUEST THE CAD'S EVIDENCE (14 days before hearing)
   → Send the letter on page 3 — it's your legal right under §41.461
   → This is your secret weapon

③ PREPARE FOR YOUR HEARING
   → Read your hearing script on page 4
   → Review the appraiser rebuttal guide on page 5
   → Photograph any condition issues (guide on page 6)

④ ATTEND YOUR HEARING
   → Bring 4 copies of your Evidence Packet
   → Present your case in 5 minutes (script provided)
   → Be factual, polite, and confident
```

**County-specific filing box** with exact portal URL, what to click, where to upload.

**🆕 For Harris County**: iSettle decision guide:
```
ISSETTLE STRATEGY
HCAD may send you a settlement offer via iSettle before your hearing.
• If the offer is at or below $[FAIR_VALUE] → ACCEPT IT. You're done.
• If the offer reduces your value by 5%+ → Strongly consider accepting.
• If the offer barely moves (<3% reduction) → REJECT and go to hearing.
• ⚠️ You have ~10 days to respond. Don't miss the window.
• ⚠️ Rejecting = no informal meeting. You go straight to formal ARB.
```

### Page 2: What Happens Next — Timeline

**🆕 Visual timeline (horizontal bar with milestones):**

```
APRIL              MAY               JUNE-JULY           AUGUST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📬 Notice     📝 File by       🤝 Informal/        📋 ARB Hearing
   Arrives       May 15           iSettle              (if needed)
                                  Offer
                                                    📄 Decision
                                                       by Mail
```

**Key dates** (county-specific):
- Filing deadline: May 15 (or 30 days after notice, whichever later)
- Hearing window: May–August (varies by county)
- Decision: Announced at hearing, written order follows by mail

### Page 3: CAD Evidence Request (NEW — The Secret Weapon)

**🆕 Pre-written §41.461 evidence request letter**

```
[Your Name]
[Your Address]

[Date]

[Chief Appraiser Name]
[County] Central Appraisal District
[CAD Address]

RE: Request for Evidence — Texas Property Tax Code §41.461
    Account: [ACCOUNT_NUMBER]
    Property: [ADDRESS]

Dear Chief Appraiser,

Pursuant to Texas Property Tax Code §41.461(a), I request a complete copy
of all evidence the district plans to introduce at my hearing, including:

  1. All sales comparables and adjustment data
  2. All equity/assessment comparables
  3. Subject property record card
  4. Cost approach data, if applicable
  5. Photographs and maps
  6. All adjustment schedules and formulas

Per §41.461(b), no charge may be assessed for this evidence. Per §41.67(d),
any evidence not provided at least 14 days before the hearing may be excluded.

Please deliver to: [EMAIL or ADDRESS]

Sincerely,
[Your Name]
```

**Guidance box**:
```
WHY THIS MATTERS
The CAD must show you their evidence before the hearing. When you receive it:
✓ Check if their comps are still at the values shown (comps may have been
  reduced by OTHER protests since the CAD built their evidence)
✓ Look for errors in their property description of YOUR home
✓ Compare their comps to YOUR comps — if any of theirs support a LOWER 
  value, point that out at the hearing
✓ Check their math — arithmetic errors happen
```

**County-specific CAD contact info** (name, address, email, phone).

### Page 4: Hearing Script

**🆕 Upgraded verbatim script with timing marks:**

```
YOUR 5-MINUTE HEARING PRESENTATION

[0:00 — INTRODUCTION, 30 seconds]
"Thank you, members of the Board. I'm [NAME], owner of [ADDRESS],
account [ACCT]. I'm protesting on grounds of both unequal appraisal
and market value. I request a value of $[FAIR_VALUE]. I've provided
copies of my evidence for each of you."

[0:30 — ERRORS (if any), 30 seconds]
"First, I'd like to note [NUMBER] errors in the district's property
record. The district shows [WRONG], but the actual [CORRECT] as
evidenced by [SOURCE]. This alone accounts for $[AMOUNT] in overvaluation."

[1:00 — EQUITY EVIDENCE, 90 seconds]
"Turning to page [X] of my evidence, I've identified [10] comparable
properties in neighborhood [CODE] — same classification, similar size
and age. The median appraised value is $[MEDIAN_PSF] per square foot.
My property is appraised at $[SUBJECT_PSF] — that's [OVER_PCT]% above
the median. Under §42.26(a)(3), my value should not exceed this median."

[2:30 — CONDITION (if applicable), 60 seconds]
"My property also has condition issues that reduce its value. As shown
in the photos: [DESCRIBE]. I've obtained estimates totaling $[AMOUNT]
for necessary repairs."

[3:30 — REQUEST, 30 seconds]  
"Based on this evidence, I respectfully request a reduction to
$[FAIR_VALUE], reflecting the median of comparable properties.
Thank you."
```

### Page 5: Appraiser Rebuttal Guide (NEW)

**🆕 The 6 most common pushbacks and exactly how to counter them:**

```
WHEN THE APPRAISER SAYS...          YOU SAY...

1. "We used different comps"
→ "My comps are from the same neighborhood code [CODE] as assigned by
   YOUR district. I've selected [10] properties of similar size and age.
   Can you explain why your comps are more appropriate than mine?"

2. "Your comps are too far away / not comparable"
→ "All my comps are within YOUR neighborhood code — the same grouping
   YOUR district uses for mass appraisal. If the neighborhood code isn't
   a valid basis for comparison, that's a question about the district's
   own methodology."

3. "Market conditions support our value"
→ "I'm arguing unequal appraisal under §42.26, not market value. Even
   if the market supports your value, the law requires my property be
   appraised uniformly with comparable properties. It's not."

4. "Your property has [feature] that comps don't"
→ "I've selected comps with similar characteristics. But even accounting
   for [feature], a $[AMOUNT] difference — which is what you'd need to
   justify — is not supported by any standard adjustment schedule."

5. "These aren't sales comps — we need sale prices"
→ "My protest is on grounds of unequal appraisal. §42.26(a)(3) explicitly
   uses APPRAISED values, not sale prices. Texas is a non-disclosure state —
   the equity argument exists precisely because sale prices aren't public."

6. "The condition issues aren't significant"
→ "A buyer would subtract these repair costs from their offer. I have
   estimates from licensed contractors totaling $[AMOUNT]. Whether you
   consider them significant, a rational buyer would."
```

### Page 6: Condition Documentation Guide (NEW)

**🆕 What to photograph + how to get estimates:**

```
STRENGTHEN YOUR CASE WITH CONDITION EVIDENCE

WHAT TO PHOTOGRAPH (in priority order):
□ Foundation cracks or settling (measure width, include ruler for scale)
□ Roof damage (missing shingles, leaks, age — include wide + close-up)
□ Water damage / mold / staining
□ Outdated kitchen or bathrooms (if significantly below area standard)
□ HVAC system (if old — photograph the data plate showing age)
□ Plumbing issues (galvanized pipes, leaks)
□ Exterior damage (siding, paint, fencing)
□ Any issue that a buyer would negotiate on

PHOTO TIPS:
• Date stamp every photo
• Take both wide-angle (shows location) and close-up (shows detail)
• Include a ruler or hand for scale on cracks/damage
• Photograph the WORST areas — this is evidence, not a listing

HOW TO GET FREE REPAIR ESTIMATES:
• Foundation companies almost always provide free inspections + estimates
• Roofing companies: free inspections after storm season
• HVAC: free assessments from most major companies
• General: HomeAdvisor, Thumbtack — request estimates mentioning
  "need documentation for tax protest"
• Get estimates on company letterhead with license number
```

### Page 7: Homestead Exemption Check (NEW — conditional)

**🆕 Only shows if our data indicates NO homestead exemption:**

```
⚠️ IMPORTANT: YOU MAY BE MISSING YOUR HOMESTEAD EXEMPTION

Our records indicate no homestead exemption is filed on this property.
If this is your primary residence, you're leaving money on the table:

WHAT YOU'RE MISSING:
• $140,000 school district exemption (saves ~$1,400/year)
• 10% annual cap on value increases (prevents big jumps)
• Additional $60,000 if over 65 or disabled (saves ~$600/year more)
• Total potential savings: $1,400 - $2,000+ per year

HOW TO FILE (takes 5 minutes):
→ Go to [COUNTY-SPECIFIC URL]
→ You need: Texas ID matching property address + proof of ownership
→ Deadline: April 30 (but late filing accepted up to 2 years back)
→ You may be eligible for a RETROACTIVE refund of up to 2 years

This is separate from your protest and equally important.
```

**Why this is huge**: Research shows ~20% of eligible TX homeowners are missing their exemption. $1,400-2,000/year in savings for 5 minutes of work. This single page could save our customers more money than the protest itself.

---

## PART 3: COUNTY VARIATION MATRIX

### What Changes Per County

| Element | TX Universal | Harris Only | Cook County Only |
|---------|-------------|-------------|-----------------|
| Legal citations | §41.41, §42.26 | — | 35 ILCS 200/16-70 |
| Filing portal | County-specific URL + name | iFile + iSettle | CCAO + CCBOR (two separate appeals) |
| Evidence request | §41.461 letter | iSettle strategy section | Different process |
| Assessment ratio | 100% (market = appraised) | — | 10% of market value |
| Sales comps | NOT included (non-disclosure) | — | INCLUDED (disclosure state) |
| Reassessment cycle | Annual | — | Triennial by township |
| Hearing format | 3-person ARB panel | — | Board of Review hearing |
| Dual appeal | No | — | Yes (CCAO → CCBOR) |
| Homestead exemption | $140K school district | — | $10K EAV Homeowner Exemption |
| Condition rating system | CDU scale | — | Not applicable |

### Cook County Differences (Full List)

The Cook County packet needs significant customization:

1. **Evidence Packet**: Add sales comp grid (Page 5) — IL is disclosure state
2. **Brief**: Different legal citations, mention assessment level, equalization factor
3. **Playbook**: Two filing guides (CCAO appeal + CCBOR appeal)
4. **No §41.461 letter** — different evidence request process
5. **Reassessment context**: Which township, when last reassessed, when next
6. **Different hearing script**: Board of Review format vs ARB format
7. **Different rebuttal guide**: BOR-specific pushbacks
8. **Different exemption check**: Homeowner Exemption ($10K EAV), Senior Freeze, etc.

### Per-County Portal Quick Reference

| County | Portal | URL | System |
|--------|--------|-----|--------|
| Harris | iFile | owners.hcad.org | iFile + iSettle |
| Dallas | uFile | dallascad.org | uFile |
| Collin | Online Portal | onlineportal.collincad.org | SmartFile |
| Tarrant | Online Protest | tad.org | True Prodigy |
| Denton | Online | dentoncad.net | True Prodigy |
| Fort Bend | Online | fbcad.org | — |
| Williamson | Online | wcad.org | — |
| Travis | Online | traviscad.org | PACS |
| Bexar | Online | bcadonline.org | PACS |
| Rockwall | Online | rockwallcad.com | True Prodigy |
| Cook County | Online | cookcountyboardofreview.com | CCBOR + CCAO |

---

## PART 4: BUILD SEQUENCE

### Week 1: Fix the Engine (Critical)
- [ ] Day 1-2: Update all precompute scripts — year-built filter, ±20% sqft, lower-quartile selection
- [ ] Day 2-3: Add comp_confidence scoring, multi-year savings, Houston comp output fields  
- [ ] Day 3: Rockwall sqft enrichment (scrape RCAD property detail pages)
- [ ] Day 4: Re-run precompute for ALL counties with new algorithm
- [ ] Day 5: Re-upload to Cosmos DB, verify data quality

### Week 2: Build the Two-PDF System (High)
- [ ] Day 1: Refactor Houston generate-appeal into Evidence Packet + Playbook templates
- [ ] Day 2: Add all new Evidence Packet content (property record audit, comp quality notes, 10 comps)
- [ ] Day 3: Build Playbook content (filing guide, timeline, hearing script, rebuttal guide, condition guide)
- [ ] Day 4: Add CAD evidence request letter + homestead exemption check
- [ ] Day 5: Wire up county-specific metadata (portal URLs, CAD addresses, deadlines)

### Week 3: County Rollout + Cook County
- [ ] Day 1-2: Template the system so each county is a config, not a copy-paste
- [ ] Day 2-3: Build Cook County variant (sales comps, dual appeal, IL-specific content)
- [ ] Day 3-4: Test all 11 counties, generate sample PDFs, QA every page
- [ ] Day 5: Deploy to production

### Week 4: Post-Purchase Experience  
- [ ] Day 1-2: Build email sequence (purchase confirmation → filing reminder → hearing prep)
- [ ] Day 3: Add CAD evidence request reminder email (timed 14 days before hearing window)
- [ ] Day 4: Post-hearing follow-up email
- [ ] Day 5: Value monitoring for next year's return customers

---

## PART 5: WHAT WE CAN TELL CUSTOMERS

### Success Rate Claims (Backed by Data)

**Safe to say**:
- "Texas property owners who protest win a reduction ~65-85% of the time" (varies by county/year)
- "The median reduction in Harris County is $18,000-$22,000 in property value"
- "Tarrant County has the highest win rate at nearly 90%"
- "DIY homeowners in Harris County actually have HIGHER success rates than agent-represented homeowners for informal protests" (SquareDeal.tax data)
- "Texas protests saved property owners $6.5 billion in 2022"

**Needs disclaimer**:
- "Success rates vary by county, year, and quality of evidence"
- "Past results do not guarantee future outcomes"
- "Individual results depend on property characteristics and local market conditions"

### Pricing Confidence

Our $49 packet with the v2 upgrades includes everything a $300-500 professional firm provides:
- Equity comp grid with 10 properties ✅
- Property record audit ✅
- County-specific filing guide ✅
- Hearing script with timing marks ✅
- Appraiser rebuttal guide ✅
- CAD evidence request letter ✅
- Condition documentation guide ✅
- Homestead exemption detection ✅
- Multi-year savings projection ✅
- iSettle strategy (Harris) ✅

What we DON'T do (and competitors charge 25-50% of savings for):
- Attend the hearing for you
- File the protest for you
- Sales comp analysis (TX only — we DO include sales comps for Cook County)

**The pitch**: "Everything a professional firm uses to win, for $49. You keep 100% of your savings."

---

## PART 6: KEY NUMBERS FOR REFERENCE

### Tax Rates (for savings calculations)
| County | Current Rate | Recommended |
|--------|-------------|-------------|
| Harris | 2.2% | 2.2% (good average) |
| Dallas | 2.2% | 2.2% |
| Collin | 2.2% | 2.1% (slightly lower avg) |
| Tarrant | 2.2% | 2.3% (slightly higher) |
| Denton | 2.2% | 2.2% |
| Fort Bend | 2.2% | 2.3% |
| Williamson | 2.1% | 2.1% |
| Travis | 1.8% | 1.95% (1.8% is too low for Austin proper) |
| Bexar | 2.1% | 2.1% |
| Rockwall | 2.19% | 2.2% |
| Cook County | ~2.0% of market | Varies by township — use actual rate if available |

### Homestead Exemption ($140K school district, effective 2025)
- Applies to ALL school district taxes
- ~$1,400/year savings at 1.0% school rate (conservative)
- Over-65/disabled: additional $60K = ~$2,000/year total
- 10% annual cap on appraised value increases (HUGE long-term value)

### Multi-Year Savings
- Texas reassesses annually → savings compound
- Use 5-year multiplier for total impact messaging
- But actual savings depend on future assessments — use "estimated" language

---

## APPENDIX: Research Reports Index

| # | Report | Lines | Key Finding |
|---|--------|-------|-------------|
| 1 | TX-PROTEST-AUDIT | 908 | §42.26 equity is king; always file both arguments |
| 2 | COOK-COUNTY-APPEAL-AUDIT | 730 | Two-bite system; IL sales data available |
| 3 | COMPETITOR-TEARDOWN | 717 | Jubally closing = market opening; AppealDesk is direct rival |
| 4 | PROTEST-QUALITY-RESEARCH | 409 | Gap analysis; per-market specs; action plan |
| 5 | HEARING-TACTICS-RESEARCH | 687 | Verbatim 5-min script; 6 appraiser rebuttals; iSettle strategy |
| 6 | COUNTY-PORTALS-RESEARCH | 924 | All 10 TX portals documented step-by-step |
| 7 | REAL-PROTEST-EXAMPLES | 556 | Actual winning documents; competitor sample formats |
| 8 | PACKET-DESIGN-SPEC | 1,103 | Page-by-page blueprint; two-PDF architecture |
| 9 | COMP-SELECTION-RESEARCH | 667 | IAAO standards; similarity scoring; adjustment methodology |
| 10 | CUSTOMER-JOURNEY-RESEARCH | 673 | 12-email sequence; post-purchase gap; value monitoring |
| 11 | CAD-EVIDENCE-COUNTER-RESEARCH | 757 | §41.461 power; stale comp strategy; counter-evidence |
| 12 | CONDITION-VALUE-RESEARCH | 777 | Foundation #1 impact; photo guide; free estimates |
| 13 | HOMESTEAD-EXEMPTION-RESEARCH | 500 | $140K (Prop 13); 20% missing; retroactive 2 years |
| 14 | PRECOMPUTE-AUDIT | 411 | Grade C+; year-built filter critical; Rockwall unusable |
| 15 | SUCCESS-RATE-RESEARCH | 622 | 65-85% win rate; $18K median reduction; DIY beats agents |
| 16 | WINNING-PACKET-EXAMPLES | 586 | Best evidence formats; what ARBs prefer |
| 17 | MARKET-VALUE-ARGUMENT-RESEARCH | 603 | §41.461 is secret weapon; Cook County sales data free |
| 18 | LEGAL-FRAMEWORK-RESEARCH | (pending) | Statute verification |
| 19 | COOK-COUNTY-PACKET-DESIGN | (pending) | IL-specific packet design |

**Total research: ~11,630+ lines across 17 completed reports.**

---

*This blueprint supersedes all prior design documents. Implementation begins with the comp engine fixes (Week 1), then the two-PDF system (Week 2), then county rollout (Week 3).*
