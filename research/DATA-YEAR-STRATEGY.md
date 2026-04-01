# Data Year Strategy — Multi-Perspective Analysis & Recommendation

**Date:** February 12, 2026  
**Status:** Active Decision  
**TL;DR:** Go with a **Hybrid of B + C** — show 2025 data transparently, sell when actionable (late BOR/protest filings), capture email + auto-upgrade to 2026 when data drops. Details below.

---

## Table of Contents

1. [Analysis: Revenue Strategist](#1-revenue-strategist)
2. [Analysis: Trust & Brand Advisor](#2-trust--brand-advisor)
3. [Analysis: Product/UX Designer](#3-productux-designer)
4. [Analysis: The Customer](#4-the-customer)
5. [Recommendation: The Hybrid Approach](#5-recommendation-the-hybrid-approach)
6. [Exact Copy — Results Page Messaging](#6-exact-copy--results-page-messaging)
7. [Edge Cases — Calendar Year Walkthrough](#7-edge-cases--calendar-year-walkthrough)
8. [Implementation Notes](#8-implementation-notes)
9. [Email Capture Flow](#9-email-capture-flow)

---

## 1. Revenue Strategist

### The Core Revenue Question

We need to model this across three dimensions: **immediate conversion**, **lead capture value**, and **refund/churn risk**.

### Conversion Modeling: 1,000 Users Visit in February 2026

| Metric | Option A (Don't Sell) | Option B (Sell + Update) | Option C (Free Preview + Email) |
|--------|----------------------|--------------------------|--------------------------------|
| See results page | 1,000 | 1,000 | 1,000 |
| Find they're over-assessed | ~600 | ~600 | ~600 |
| Immediate purchases | 0 | ~30-45 (5-7.5% of 600) | 0 |
| Email captured | 0 | ~45 (buyers only) | ~120-180 (20-30% of 600) |
| Return to buy in April | ~30-50 (5-8%) | Already bought | ~48-72 (40% of captured emails) |
| **Total conversions** | **30-50** | **30-45** | **48-72** |
| **Revenue (@ $49)** | **$1,470-$2,450** | **$1,470-$2,205** | **$2,352-$3,528** |
| Refund risk | 0% | 15-25% | ~5% |
| **Net revenue** | **$1,470-$2,450** | **$1,250-$1,874** | **$2,234-$3,352** |

**Key assumptions:**
- February visitors are mostly "early researchers" — they don't have their 2026 notice yet. Conversion intent is lower.
- Option B buyers who realize in April that their numbers changed will request refunds or feel burned. I model 15-25% refund rate.
- Option C email capture converts at 40% when the follow-up email hits at the perfect moment (they just got their notice, they're stressed, and we're the solution they already trust).

### What SaaS/Fintech Products Do

**TurboTax:** The gold standard for time-sensitive data products. They DON'T let you file your 2025 return until the IRS opens e-filing (late January). But they DO let you:
- Start your return early using estimated data
- Import prior-year data
- Pre-fill everything and "save your spot"
- Email you the moment filing opens

This is essentially Option B/C hybrid — capture the user, deliver partial value, then activate when timely.

**Insurance quotes (Progressive, Geico):** Quotes expire after 30 days. They say so clearly. They email you before expiration with "your rate is about to change." This creates urgency without deception.

**Credit Karma / NerdWallet:** Show you your score for free, email you when something changes, sell you the product when it's timely. Classic Option C.

### Revenue Strategist Verdict

**Option C (with email capture) maximizes total revenue** when you account for:
- Higher trust = lower refund rate
- Email list = remarketing asset (LTV >> single transaction)
- April conversion rates will be 3-5x higher than February rates because users have their notice in hand and a deadline looming
- An email list of 180 qualified leads per 1,000 visitors is worth far more than 45 impulse buyers with 20% refund risk

**The email list IS the product in the off-season.** Each email is a $49 lead at 40% conversion = $19.60 expected value. That's a $3,528 asset from 1,000 visitors vs. $1,874 net from Option B.

---

## 2. Trust & Brand Advisor

### The Trust Hierarchy for Financial Products

For a new, unknown brand selling a financial/legal product, trust is built in this order:

1. **Accuracy** — Does the data match reality?
2. **Transparency** — Do they tell me what they don't know?
3. **Alignment** — Are their incentives aligned with mine?
4. **Social proof** — Do others vouch for them?

We're weak on #4 (new brand, no reviews). That means #1-3 must be impeccable.

### Scenario: What Happens When Data Mismatches

**The nightmare scenario for Option B:**

> Sarah buys a 2025 package in February 2026 for $49. It says her home is appraised at $420,000 and she's over-assessed by $35,000.
> 
> In April, her 2026 notice arrives: $465,000. The comps are different. The neighborhood stats are different. The $49 package she bought feels useless — it's analyzing last year's numbers.
> 
> She thinks: "Did they knowingly sell me stale data?" She emails for a refund. She leaves a 1-star review. She tells her friends Overtaxed is a scam.

This is not hypothetical. Texas appraisal districts regularly adjust values 5-15% year-over-year. The 2025 package will be noticeably wrong for a meaningful percentage of users.

**The same scenario under Option C:**

> Sarah looks up her property in February. She sees a clear banner: "Based on 2025 appraisal data." She sees she was over-assessed last year. The site says: "Your 2026 notice arrives in March/April. Want us to analyze it the moment data drops?"
> 
> She enters her email. In April, she gets an email: "Your 2026 appraisal notice just dropped. You're over-assessed by $28,000. Here's your filing package."
> 
> She thinks: "These people are on top of it. They didn't try to sell me stale data. They waited until it was right."

### How Competitors Handle This

**Ownwell:** They sign you up year-round. But they're a full-service firm — they handle everything, so "data year" is their problem, not yours. They file when it's time. The customer never sees stale data because Ownwell manages the timeline. **This model doesn't apply to us** because we sell a DIY package. The customer IS the filer. They need current data.

**NTPTS (North Texas Property Tax Services):** Same as Ownwell — year-round enrollment, contingency-based, full-service. They sign you up and handle timing internally. 93% retention rate.

**Key insight:** Full-service firms can sell year-round because the customer delegates timing to them. DIY products CANNOT do this — the customer needs data that matches their filing window.

### Refund/Complaint Risk by Option

| Option | Refund Risk | Complaint Risk | Brand Damage Risk |
|--------|-------------|----------------|-------------------|
| A (Don't Sell) | 0% | Low (some frustration at "can't buy") | Very Low |
| B (Sell + Update) | 15-25% | High (stale data anger) | **HIGH** |
| C (Free Preview + Email) | ~5% | Very Low | Very Low |

### Trust Advisor Verdict

**Option C is the only option that builds trust for a new brand.** Option B is actively dangerous — a single viral "Overtaxed sold me stale data" tweet could kill the business before it starts. We don't have the reputation reserves to survive a trust violation. Ownwell can afford mistakes because they have hundreds of thousands of customers and years of track record. We have zero.

The free preview actually builds MORE trust than showing nothing (Option A) because it demonstrates competence. "Look, we found that your home was over-assessed by $X last year. Imagine what we can do with your 2026 data."

---

## 3. Product/UX Designer

### Pattern Analysis: Time-Sensitive Data Products

**TurboTax Year Transition:**
- In December: "Get a head start on your 2025 taxes"
- Homepage prominently says "2025 taxes" (the year being filed)
- Pre-filing: lets you start, import W-2s, preview refund
- Filing opens: sends push notification + email "You're ready to file!"
- **Pattern: tease → capture → activate**

**Insurance Quotes:**
- "This quote is valid for 30 days"
- Clear expiration date on every quote
- Countdown timers on some sites
- **Pattern: time-bound validity + urgency**

**Zillow Zestimate:**
- Always shows current estimate with "Updated [date]"
- Shows history graph
- Never sells you something based on last year's data
- **Pattern: transparent timestamps on all data**

**Credit Karma:**
- Free scores, email when something changes
- Sells products (cards, loans) when timing is right
- **Pattern: free monitoring → timely product push**

### The Key UX Principle

**Never let the user be confused about what they're looking at.**

Right now, Overtaxed shows `year: "2025"` in the assessment object but doesn't display it prominently to users. The urgency banner says "2026 protest season opens soon" which implies the data is for 2026. This is a trust gap waiting to explode.

### Results Page Mockups by Option

#### Option A: Don't Sell

```
┌─────────────────────────────────────────────┐
│ 123 Main St, Houston TX                     │
│ Account: 1234567 • Harris County            │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 📊 Based on 2025 Appraisal Data        │ │
│ │                                         │ │
│ │ Appraised Value: $420,000               │ │
│ │ Fair Value:      $385,000               │ │
│ │ Over-Assessed:   $35,000                │ │
│ │                                         │ │
│ │ You were overtaxed by ~$770/yr in 2025  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ 📬 Your 2026 Notice Arrives March/April │ │
│ │                                         │ │
│ │ Based on 2025, you were likely          │ │
│ │ over-appraised. We'll analyze your 2026 │ │
│ │ data the moment it's available.         │ │
│ │                                         │ │
│ │ [Check Back in April]                   │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Problem:** Dead end. No conversion path. No email capture. User bounces.

#### Option B: Sell + Update

```
┌─────────────────────────────────────────────┐
│ 123 Main St, Houston TX                     │
│                                             │
│ ✅ You're Over-Appraised (2025 Data)       │
│                                             │
│ Appraised Value: $420,000                   │
│ Fair Value: $385,000                        │
│ Est. Savings: $770/yr                       │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Start Your Protest — $49                │ │
│ │ ✓ 2025 filing package (still valid)     │ │
│ │ ✓ FREE 2026 update when available       │ │
│ │                                         │ │
│ │ [File My Protest — $49]                 │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Problem:** "2025 filing package (still valid)" raises questions — valid for what? If I haven't gotten my 2026 notice, what am I filing? The "FREE 2026 update" sounds like a promise that adds complexity.

#### Option C: Free Preview + Email Capture (RECOMMENDED)

```
┌─────────────────────────────────────────────┐
│ 123 Main St, Houston TX                     │
│ Account: 1234567 • Harris County            │
│                                             │
│ ┌─ 2025 APPRAISAL ANALYSIS ─────────────┐  │
│ │                                        │  │
│ │  ✅ You Were Over-Appraised in 2025    │  │
│ │                                        │  │
│ │  Est. Tax Bill:  $9,240 → $8,470      │  │
│ │  Potential Savings: $770/yr            │  │
│ │  Based on 15 comparable properties     │  │
│ │                                        │  │
│ └────────────────────────────────────────┘  │
│                                             │
│ ┌─ WHAT'S NEXT ─────────────────────────┐  │
│ │ 📬 2026 notices arrive March/April.    │  │
│ │                                        │  │
│ │ We'll analyze your 2026 appraisal      │  │
│ │ the day data drops and send you a      │  │
│ │ ready-to-file protest package.         │  │
│ │                                        │  │
│ │ [your@email.com    ] [Notify Me →]     │  │
│ │                                        │  │
│ │ 🔒 No spam. Just your 2026 analysis.  │  │
│ └────────────────────────────────────────┘  │
│                                             │
│ ┌─ ALREADY HAVE YOUR 2025 NOTICE? ──────┐  │
│ │ If you're filing a late 2025 protest   │  │
│ │ or missed your deadline, we can help.  │  │
│ │                                        │  │
│ │ [Get Your 2025 Filing Package — $49]   │  │
│ └────────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

**This works because:**
1. Data year is crystal clear — "2025 APPRAISAL ANALYSIS"
2. Value is demonstrated before asking for anything
3. Email capture feels helpful, not transactional
4. Late filers still have a purchase path
5. No confusion about what year they're protesting

### UX Designer Verdict

**Option C with the hybrid late-filer CTA.** The data year labeling is the most critical UX change regardless of which option we choose. The current site has an integrity gap — it shows 2025 data without labeling it, while the urgency banner implies 2026 readiness.

---

## 4. The Customer

### Persona A: First-Time Homeowner, January 2026

**Maya, 31, bought her first house in Katy, TX in 2024.**

She just got her 2025 tax bill and was shocked — $8,400 on a house she paid $340K for. She Googles "property tax too high Texas." She finds getovertaxed.com.

**What Maya needs:**
- Validation that she's not crazy — ARE her taxes too high?
- Education — she doesn't know what "protest" means or that it's normal
- Simple next steps — she doesn't know the timeline
- She does NOT have a 2026 notice. She has no idea notices come in spring.

**Under Option A:** Maya sees she was over-assessed by $25K. Cool. The site says "check back in April." She thinks "okay" and never comes back. She forgets about it. She pays $8,400 again next year.

**Under Option B:** Maya sees $25K over-assessed. She can buy a package for $49. She does — she's motivated. But what does she DO with it? There's no notice to protest yet. The 2025 protest deadline was May 15, 2025 — she missed it. The package feels useless. She requests a refund.

**Under Option C:** Maya sees she was over-assessed by $25K. She's validated. The site explains: "Your 2026 notice arrives in March/April. Enter your email and we'll send you a ready-to-file package the day the data drops." She enters her email and goes about her life. In April, she gets an email at the perfect moment. She buys. She files. She saves $550.

**Maya's verdict: Option C.** It respects that she doesn't know the system and guides her.

### Persona B: Savvy Homeowner, April 2026

**James, 52, has protested his taxes himself for 3 years. He just got his 2026 notice — $510K, up from $475K. He's pissed.**

He searches "property tax protest help Houston" and finds Overtaxed. He wants to act NOW.

**What James needs:**
- Current 2026 data — he KNOWS his 2026 number
- Comps and evidence — he's done this before
- Speed — the deadline is May 15

**Under any option:** By April, we HAVE 2026 data (we update when districts publish). James sees his 2026 analysis, it matches his notice, and he buys immediately. **This persona is not affected by the pre-season strategy** because he arrives after data is current.

**James's verdict:** Doesn't care about pre-season strategy. He needs 2026 data to be live by April. (Implementation note: we MUST have data pipelines ready before notices drop.)

### Persona C: December 2025 Buyer Wondering About Validity

**Linda, 45, bought the 2025 package in December for her Dallas County home. She filed her 2025 protest and got a $12K reduction. Now it's February 2026 and she's wondering: does she need to do this again?**

**What Linda needs:**
- Confirmation that Texas reassesses EVERY year (yes, she needs to protest again)
- Knowledge that her 2025 package is for 2025 — a new package will be available for 2026
- An easy re-engagement path

**Under Option C (recommended):** Linda returns to the site, enters her address. She sees: "Based on 2025, you were over-appraised. Your 2026 notice arrives March/April." She enters her email. She gets notified in April. She buys her 2026 package for $49.

**Better yet:** Linda should get a proactive email in March: "Hey Linda, 2026 appraisal notices are dropping in Dallas County. Want us to analyze your new value? We'll have your 2026 package ready the day data drops."

**Linda's verdict: Option C + proactive re-engagement emails.** She's a repeat buyer — the most valuable customer type. Don't make her come back to the site. Go to her.

---

## 5. Recommendation: The Hybrid Approach

### The Winner: Option C+ (Free Preview + Email Capture + Late-Filer Escape Hatch)

**Not pure C. A hybrid that captures three revenue streams:**

#### Stream 1: Email Capture (Primary — Jan through March)
- Show 2025 analysis results **for free**, clearly labeled as 2025 data
- Capture email with: "We'll send your 2026 analysis the day data drops"
- This is the majority of pre-season traffic

#### Stream 2: Late Filer Sales (Secondary — Jan through April)
- Some users visiting in Jan-Mar are actually trying to file a LATE 2025 protest (extensions, BOR, binding arbitration)
- Show a secondary CTA: "Already have your 2025 notice? Need to file a late protest?"
- This captures revenue that pure Option C would miss

#### Stream 3: Current-Season Sales (Primary — April through May)
- Once 2026 data is live, switch to normal sales flow
- Email blast to captured leads: "Your 2026 data is ready"
- This is peak conversion window

### Why Not Pure B or Pure A?

**Not B** because:
- Selling 2025 packages to people who think they're getting 2026 data is a trust violation
- "We'll update you for free" adds operational complexity and sets expectations we may not meet on time
- Refund risk is real and damages brand reputation disproportionately for a new company

**Not A** because:
- Zero conversion = zero business
- No email capture means we lose the visitor forever
- Showing data with no next step is a waste of intent

### Why This Hybrid Wins

1. **Maximizes trust** — data year is always clear, we never sell stale data as current
2. **Captures leads** — the email list is the real asset in the off-season
3. **Preserves revenue** — late filers can still buy, and April conversion rates on warmed leads will be 3-5x cold traffic
4. **Operationally simple** — no complex "auto-update" logic, no tracking who needs what
5. **Scales yearly** — this same pattern works every year's transition

---

## 6. Exact Copy — Results Page Messaging

### Pre-Season (January 1 — until 2026 data is loaded)

#### Data Year Banner (appears at top of analysis section)

```
📊 2025 Appraisal Analysis

This analysis is based on your 2025 appraised value from [HCAD/DCAD/TCAD].
Your 2026 notice arrives in late March / early April.
```

#### Over-Assessed Hero (replaces current hero when pre-season)

```
✅ You Were Over-Appraised in 2025

Your 2025 appraised value was $[AMOUNT] — but based on [X] comparable 
properties in your neighborhood, a fair value was closer to $[FAIR_AMOUNT].

That means you may have overpaid by ~$[SAVINGS]/year in property taxes.
```

#### Email Capture CTA (primary CTA in pre-season)

```
📬 Get Your 2026 Protest Package

2026 appraisal notices arrive in late March. We'll analyze your new 
value the day data drops and send you a ready-to-file protest package.

[your@email.com          ] [Notify Me →]

🔒 One email when your data is ready. No spam, ever.
```

#### Late Filer Secondary CTA

```
Already filing a 2025 protest?

If you received a 2025 notice and still need to file (late protest, 
Board of Review hearing, or binding arbitration), your 2025 analysis 
is ready now.

[Get Your 2025 Filing Package — $49]
```

#### Urgency Banner (replaces current misleading banner)

```
📅 2026 protest season: Notices arrive late March → Deadline May 15
   Sign up now and we'll have your package ready on day one.
```

### In-Season (2026 data loaded — through May 15)

#### Data Year Banner

```
📊 2026 Appraisal Analysis  •  Updated [DATE]

Based on your 2026 appraised value as published by [HCAD/DCAD/TCAD].
Filing deadline: May 15, 2026.
```

#### Normal Sales Flow

Current CTA copy works great — just add the year:

```
Start Your 2026 Protest — $49

✓ Custom hearing script written for [ADDRESS]
✓ [X] comparable properties with detailed analysis
✓ Step-by-step [HCAD iFile / DCAD uFile / TCAD Portal] instructions

[File My 2026 Protest — $49]

🔒 One-time filing fee • Delivered instantly to your email
```

#### Deadline Urgency (in-season)

```
⏰ Filing deadline: May 15, 2026
   [X] days remaining — filing early gets the best results.
```

### Post-Season (After May 15)

```
📊 2026 Appraisal Analysis

The standard protest deadline for 2026 has passed (May 15).

Still options available:
• Late protests may be accepted in some cases
• Board of Review hearings
• Binding arbitration for values over $5M

[Get Your 2026 Analysis — $49]

Or enter your email and we'll notify you when 2027 data drops:
[your@email.com          ] [Notify Me →]
```

---

## 7. Edge Cases — Calendar Year Walkthrough

### Monthly Breakdown

| Month | Data Available | User Intent | What We Show | Revenue Path |
|-------|---------------|-------------|--------------|--------------|
| **Jan** | 2025 only | Early research, sticker shock from tax bill | 2025 preview + email capture | Email capture + late filer sales |
| **Feb** | 2025 only | Same as Jan, some late 2025 BOR filers | 2025 preview + email capture | Email capture + late filer sales |
| **Mar (early)** | 2025 only | Anticipating notices | 2025 preview + email capture + "notices coming soon" | Email capture |
| **Mar (late)** | 2026 data dropping | Just got notice, ready to act | **SWITCH TO IN-SEASON** as data loads per county | Full sales |
| **Apr** | 2026 live | Peak protest intent | Full 2026 sales + email blast | Primary revenue month |
| **May 1-15** | 2026 live | Deadline urgency | Full sales + countdown | Last push, highest urgency |
| **May 16-31** | 2026 live | Missed deadline | Post-deadline messaging | Late protest sales + 2027 capture |
| **Jun-Sep** | 2026 live | BOR/arbitration season | Analysis + late options | Lower volume sales |
| **Oct-Dec** | 2026 live | Tax bill arrives, anger | 2026 preview + email capture for 2027 | Email capture + education |

### Critical Transition Points

**Transition 1: 2026 Data Starts Loading (Late March)**

Different counties publish at different times. We need per-county data status:

```
if (county.has2026Data) {
  // Show 2026 data, normal sales flow
} else {
  // Show 2025 data, email capture flow
  // "2026 data for [county] drops soon — we'll email you"
}
```

**This is the hardest edge case.** Harris County might publish March 25, Travis County April 1, Dallas County March 28. We need independent switching per jurisdiction.

**Transition 2: User Has Both 2025 and 2026 Data**

Once 2026 loads, we could show a comparison:

```
Your appraisal went from $420,000 (2025) → $445,000 (2026)
That's a 6% increase. Here's what we found...
```

This is a powerful trust signal — we're not hiding the year-over-year change.

**Transition 3: Post-Deadline (After May 15)**

Don't go dark. The site should still work. But messaging shifts to:
- Late protest options (still possible in many cases)
- BOR hearing preparation
- "Get ready for 2027" email capture

**Edge Case: Cook County (Non-Texas)**

Cook County reassesses every 3 years by township. The timing is completely different. The pre/post-season logic should be **Texas-specific**. Cook County's results page should show the current reassessment cycle status, not a protest season countdown.

For now, Cook County doesn't need the same calendar-driven messaging. It's on a township-by-township reassessment cycle. Keep Cook County's current flow and add proper data year labeling.

---

## 8. Implementation Notes

### Priority 1: Data Year Labeling (Do This NOW — Before Anything Else)

The current code hardcodes `year: "2025"` in the assessment object but never shows it to the user. This needs to change immediately:

**File: `results-content.tsx`**

1. Surface the assessment year in the UI:
   - Add a badge/banner below the property header: `📊 Based on 2025 appraisal data`
   - For Texas: `"2025 Appraisal from [HCAD/DCAD/TCAD]"`
   - For Cook County: `"2025 Assessment from Cook County Assessor"`

2. Replace the misleading urgency banner:
   - Current: `"2026 protest season opens soon — get your analysis ready now"`
   - Replace with date-aware messaging (see copy above)

### Priority 2: Pre-Season Mode Toggle

Add a configuration flag or computed value:

```typescript
// In results-content.tsx or a config file
const DATA_YEAR = "2025";
const CURRENT_YEAR = new Date().getFullYear(); // 2026
const isPreSeason = DATA_YEAR < String(CURRENT_YEAR); // true until 2026 data loads

// Per-jurisdiction data status (could be from API or config)
const jurisdictionDataYear: Record<string, string> = {
  houston: "2025",
  dallas: "2025", 
  austin: "2025",
  cook_county: "2025", // Cook County is different but label it anyway
};

const dataYear = jurisdictionDataYear[jurisdictionValue] || "2025";
const isCurrentYearData = dataYear === String(CURRENT_YEAR);
```

**Better approach:** Have the API return the data year in each response, so the frontend doesn't have to guess:

```typescript
// API response includes:
{
  property: { ... },
  dataYear: "2025",
  nextYearDataExpected: "2026-03-25", // when we expect 2026 data
  isCurrentSeason: false,
}
```

### Priority 3: Email Capture Component

New component: `PreSeasonEmailCapture`

```typescript
// Needs:
// - Email input with validation
// - Property ID association (so we can send the right analysis later)
// - Jurisdiction tracking
// - Supabase or similar storage for the waitlist
// - Simple API endpoint: POST /api/waitlist { email, propertyId, jurisdiction }
```

**Email storage schema:**

```sql
CREATE TABLE protest_waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  property_id TEXT NOT NULL,
  jurisdiction TEXT NOT NULL,
  data_year_waiting_for TEXT NOT NULL DEFAULT '2026',
  created_at TIMESTAMP DEFAULT NOW(),
  notified_at TIMESTAMP, -- null until we send the notification
  converted_at TIMESTAMP, -- null until they purchase
  UNIQUE(email, property_id, data_year_waiting_for)
);
```

### Priority 4: Conditional CTA Rendering

The main CTA block in results-content.tsx needs to branch:

```typescript
{isPreSeason ? (
  <PreSeasonBlock 
    property={property}
    dataYear={dataYear}
    estimatedSavings={estimatedSavings}
    jurisdiction={jurisdictionValue}
  />
) : (
  <CurrentSeasonCTA 
    property={property}
    estimatedSavings={estimatedSavings}
    jurisdiction={jurisdictionValue}
  />
)}
```

The `PreSeasonBlock` contains:
1. 2025 analysis results (same data, different framing)
2. Email capture CTA (primary)
3. Late filer CTA (secondary, below the fold)

### Priority 5: Data Pipeline Monitoring

When 2026 data starts loading, we need:
- A mechanism to flip `jurisdictionDataYear.houston = "2026"` per county
- Ideally automatic: the data ingestion pipeline detects new-year data and updates a config
- A notification to us when 2026 data is live (so we can send the email blast)

### Priority 6: Email Blast System

When 2026 data goes live for a jurisdiction:
1. Query `protest_waitlist` for that jurisdiction where `notified_at IS NULL`
2. Re-run analysis for each property with 2026 data
3. Send personalized email:
   - "Your 2026 appraisal data just dropped. Here's what we found..."
   - Include the headline numbers (assessed value, over-assessment amount, estimated savings)
   - CTA: "Get Your 2026 Protest Package — $49"
4. Mark `notified_at = NOW()`

### Code Changes Summary

| Change | File(s) | Effort | Priority |
|--------|---------|--------|----------|
| Add data year badge to results | `results-content.tsx` | Small | P0 — Do today |
| Fix urgency banner copy | `results-content.tsx` | Small | P0 — Do today |
| Add `dataYear` to API responses | All lookup API routes | Medium | P1 — This week |
| Pre-season mode toggle | `results-content.tsx` + config | Medium | P1 — This week |
| Email capture component | New component + API route | Medium | P1 — This week |
| Waitlist database table | Supabase migration | Small | P1 — This week |
| Conditional CTA rendering | `results-content.tsx` | Medium | P1 — This week |
| Late filer secondary CTA | `results-content.tsx` | Small | P2 — Next week |
| Data pipeline year detection | Data ingestion scripts | Medium | P2 — Before March |
| Email blast system | New service/script | Large | P2 — Before March |
| Per-county data status | Config or DB | Small | P2 — Before March |

---

## 9. Email Capture Flow

### User Journey: Pre-Season Visitor → Paying Customer

```
[1] User visits getovertaxed.com, enters address
     ↓
[2] Results page loads with 2025 data
    - Clear "2025 Appraisal Analysis" labeling
    - Shows over-assessment amount and estimated savings
    - "You were overtaxed by ~$770 in 2025"
     ↓
[3] Primary CTA: Email Capture
    - "Your 2026 notice arrives March/April"
    - "We'll analyze it the day data drops"
    - [email input] [Notify Me →]
     ↓
[4] Confirmation (inline, not a new page):
    - ✅ "You're on the list. We'll email you at [email] 
      when 2026 data is available for [property address]."
    - "In the meantime, here's how the protest process works:" 
      [link to educational content]
     ↓
[5] Welcome Email (immediate, automated):
    Subject: "You're all set — we'll watch [Address] for you"
    Body:
    - Quick recap: "Based on 2025, your home at [Address] was 
      over-appraised by $[X]."
    - Timeline: "2026 notices typically arrive in late March. 
      We're monitoring [County] data daily."
    - What to expect: "We'll email you with your 2026 analysis 
      and a ready-to-file protest package."
    - CTA: "Bookmark your results page: [link]"
     ↓
[6] Nurture Email (2-3 weeks before notices expected):
    Subject: "2026 appraisal notices are coming — here's what to expect"
    Body:
    - "In the next few weeks, [County] will mail 2026 appraisal notices."
    - Educational content: what the notice means, how to read it, 
      why values change
    - "As soon as 2026 data is published, we'll send your analysis."
    - Optional: "Know your neighbors? Forward this — the more people 
      who protest in your neighborhood, the better everyone's results."
     ↓
[7] DATA DROP EMAIL (the money shot):
    Subject: "🏠 Your 2026 appraisal is in — you're over-assessed by $[X]"
    Body:
    - Headline: "Your 2026 appraised value: $[NEW_VALUE]"
    - Change from 2025: "$[OLD] → $[NEW] ([+X%])"
    - Over-assessment: "Based on [X] comparable properties, 
      your fair value is $[FAIR]. You're over-assessed by $[DIFF]."
    - Estimated savings: "$[ANNUAL_SAVINGS]/year"
    - Deadline: "File by May 15, 2026"
    - CTA: "Get Your Protest Package — $49" [button → checkout]
    - Trust signal: "Your analysis is based on 2026 data from [County], 
      published [date]."
     ↓
[8] Reminder Email (if no purchase after 5 days):
    Subject: "⏰ [X] days until your protest deadline"
    Body: 
    - Countdown to May 15
    - Savings reminder
    - CTA: "Don't leave $[SAVINGS] on the table — $49" [button]
     ↓
[9] Last Chance Email (May 10):
    Subject: "5 days left to protest your 2026 property taxes"
    Body:
    - Final urgency
    - "After May 15, your 2026 assessed value locks in."
    - CTA: "File now — $49"
```

### Email Capture Technical Specs

**Frontend Component:**

```
┌─────────────────────────────────────────────────────────┐
│  📬 Get Your 2026 Protest Package                       │
│                                                         │
│  2026 appraisal notices arrive in late March.           │
│  We'll send your ready-to-file package the day          │
│  data drops for [Harris/Dallas/Travis] County.          │
│                                                         │
│  ┌──────────────────────────┐ ┌─────────────┐          │
│  │ your@email.com           │ │ Notify Me → │          │
│  └──────────────────────────┘ └─────────────┘          │
│                                                         │
│  🔒 One email when your data is ready. No spam, ever.  │
└─────────────────────────────────────────────────────────┘
```

**On Submit:**
1. Validate email (basic format + MX check if possible)
2. POST `/api/waitlist` with `{ email, propertyId, jurisdiction, assessedValue, estimatedSavings }`
3. Store in database
4. Trigger welcome email via SendGrid/Resend/Postmark
5. Show inline confirmation (no page redirect)
6. Replace form with: `✅ We'll email you at [email] when 2026 data drops for [Address].`

**Anti-Spam / Trust Signals:**
- Privacy policy link
- "Unsubscribe anytime" footer
- CAN-SPAM compliant
- Don't ask for name — just email. Lower friction = higher capture rate.

### Metrics to Track

| Metric | Target | Notes |
|--------|--------|-------|
| Email capture rate | 20-30% of over-assessed visitors | From form impression to submission |
| Welcome email open rate | >60% | First-party, high-intent leads |
| Data drop email open rate | >50% | This is what they signed up for |
| Data drop email → purchase | 35-45% | Warm lead, perfect timing, deadline pressure |
| Overall pre-season visitor → purchase | 8-14% | Capture × conversion |
| Unsubscribe rate | <2% | If higher, we're emailing too much |

---

## Final Word

The data year gap is not a problem to solve — it's an opportunity to build trust. Every competitor in this space (Ownwell, NTPTS) can sell year-round because they're full-service. As a DIY product, we have to be MORE transparent about data timing, not less.

The email capture approach turns a limitation into an advantage:
- We look trustworthy because we DON'T sell stale data
- We build a list of qualified, high-intent leads
- We hit those leads at the perfect moment with a personalized message
- The conversion rate on "your 2026 data just dropped" emails will crush cold traffic conversion rates

**Do the P0 changes today:** Label the data year. Fix the urgency banner. Stop implying 2025 data is 2026-ready. Then build the email capture flow this week. March will be here fast.
