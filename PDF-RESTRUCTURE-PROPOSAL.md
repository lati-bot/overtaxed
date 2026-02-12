# PDF Restructure Proposal — Overtaxed Appeal Package

> **Origin**: Real customer feedback from Deji (Houston, Account #144-574-003-0003), who said: *"the PDF is a lot to digest. The avg user is already overwhelmed and just wants simple dumbed down steps."*
>
> **Date**: February 12, 2026

---

## 1. Current State Audit

The current PDF is a single monolithic document (~4 printed pages) generated via HTML→Browserless PDF. Both Houston and Dallas routes produce structurally identical output. Here's the section-by-section breakdown:

### Page 1: Evidence Package
| Section | Content | Lines/Space |
|---------|---------|-------------|
| **Header** | Overtaxed logo, date, county, protest type, filing body | ~3 lines |
| **Title Block** | Subject property address, account, city, neighborhood, year built, sqft | ~3 lines |
| **Summary Cards** (3x) | Current Appraised Value, Fair Value, Estimated Savings — big numbers | ~4 lines |
| **Breakdown Tables** (2 cols) | Left: property details. Right: appraisal summary + tax impact | ~12 lines |
| **Statement of Unequal Appraisal** | Legal brief citing §42.26, 3 paragraphs | ~8 lines |
| **Comparable Properties Table** | Subject row (highlighted red) + N comp rows with address, acct, sqft, year built, appraised value, $/SF | ~15 lines |
| **Comps Summary Row** | Subject $/SF, Comp Median $/SF, Comp Avg $/SF, Difference | ~2 lines |

### Page 2: Filing Instructions (page-break)
| Section | Content |
|---------|---------|
| **"How to Protest" header** | "Texas law gives every property owner the right…" |
| **⏰ Deadline warning box** | Yellow box with deadline info |
| **5 numbered steps** | (1) Wait for notice → (2) File online via iFile/uFile → (3) Check for iSettle offer → (4) Prepare for ARB hearing → (5) After the hearing |

### Page 3: Hearing Script + Important Info
| Section | Content |
|---------|---------|
| **"What to Say" script** | 5 paragraphs in a dashed-border box, Georgia serif font |
| **"Uniform & Equal" explainer** | Green tip box — why this argument is strongest |
| **"Texas Reassesses Every Year"** | Blue info box |
| **Miscellaneous bullets** | No attorney required, no cost to file, homestead exemption, 10% cap |
| **Footer/Disclaimer** | Legal disclaimer, generation date |

### Email (sent with PDF attached)
- Subject line: `Property Tax Protest Package — {address} — {County}`
- Savings callout (green box)
- Deadline warning (yellow box)
- Bullet list of what's included
- "View Protest Package" button (links to web app)
- PDF attached as `protest-package-{acct}.pdf`

### Web App (`/appeal/[token]`)
- Property summary with savings
- Download PDF button
- Comparable properties table
- 4-step "How to File" guide
- Contact email

---

## 2. Pain Points — Three Expert Perspectives

### 🏠 Role 1: The Overwhelmed First-Time Homeowner

**"I just bought my first house. I don't know what I'm doing."**

> I open this PDF and the first thing I see is a wall of numbers. Three colored cards, two tables, a legal paragraph citing "Section 42.26(a)(3)"… I don't even know what an appraisal IS vs. an assessment vs. a tax bill. I definitely don't know what an ARB is.

**Specific pain points:**
1. **No clear "START HERE"** — I don't know if I should read the whole thing or just do something. What's my first action?
2. **Legal language up front** — The "Statement of Unequal Appraisal" is the 4th thing I see. I'm already lost. I don't need to know what §42.26 says, I need to know what to DO.
3. **I don't know what to upload where** — Step 2 says "Upload this PDF as your supporting evidence." The WHOLE PDF? Even the part that tells me how to file? That feels wrong. The appraiser doesn't need to see my hearing script.
4. **Timeline is vague** — "late March to early April" and "May 15 or 30 days after" — I need concrete dates. When do I need to act?
5. **Too many outcomes** — iSettle offer vs. reject vs. no offer vs. ARB hearing vs. District Court vs. binding arbitration. I'm already overwhelmed and you're telling me there are 5 possible paths?
6. **I don't know what year's data I'm looking at** — Is this 2025 data? 2024? Does this apply to the notice I just got? The PDF says "2025" nowhere prominently. I'm confused about whether this is stale.
7. **Fear of screwing up** — What if I say the wrong thing? What if I miss the deadline? What if they RAISE my taxes because I protested? (This fear isn't addressed.)

**What would make me follow through:**
- A 1-page "cheat sheet" that says: *"Do these 3 things, in this order, and you're done."*
- Knowing that the worst-case scenario is nothing changes (no downside risk)
- A clear separation between "what you submit" and "what helps you prepare"

### 🧑‍💻 Role 2: Deji — The Experienced Self-Filer

**"I know the process. I used ChatGPT last year. Let me see what I'm actually paying $49 for."**

**What works:**
- The comparable properties table is genuinely useful. This is the core value.
- The $/sqft framing is exactly right — that's the argument that works.
- Having account numbers for comps is great. I needed those last year.
- The hearing script is a nice touch — I wrote my own last year, but this would have saved me an hour.

**What's overkill:**
- The legal brief is too formal and generic. My actual evidence letter (which won) was 1 page with 3 numbered points: data error, market sales, equity comps. This brief doesn't have that crispness.
- The "Important Information" section at the end (homestead exemption, 10% cap, annual reassessment) is filler. I already know this stuff. A first-timer might need it, but not in the evidence packet.
- The breakdown tables (property details, appraisal summary) duplicate information that's already on my notice from HCAD/DCAD.

**What's missing:**
- **My actual evidence letter** — What I submitted to HCAD was a standalone document I could hand the appraiser. The current "Statement of Unequal Appraisal" is buried inside a branded PDF. It doesn't look like a serious evidence submission. It looks like a marketing document.
- **Data error checking** — My biggest win was catching that HCAD had the wrong square footage. The current PDF doesn't check for data errors. It just takes the county's sqft at face value.
- **Pushback handling** — My hearing script had a "Handling Pushback" section for when the appraiser objects. The current script is one-way. What do I say when they say "but your home has upgrades" or "those comps aren't similar enough"?
- **A clean evidence grid** — My comp table had HCAD account, address, sale date, living area, time-adjusted price, and $/sf. The current table doesn't include sale dates or time adjustments. The §42.26 equity grid is different from the sales comp grid. These are two different arguments.

### 🎨 Role 3: UX Designer (Legal/Financial Products)

**"I've designed TurboTax, LegalZoom, and similar products."**

**Core diagnosis: This is a "suitcase problem."**
You've packed everything into one bag. The user opens it and sees underwear mixed with formal wear mixed with toiletries. The solution isn't better underwear — it's separate compartments.

**Lessons from TurboTax:**
1. **Progressive disclosure** — TurboTax doesn't show you all tax forms at once. It walks you through one question at a time. The equivalent here: don't show the hearing script until they've filed. Don't show filing instructions until they've received their notice.
2. **Separate the "what to submit" from the "how to guide"** — TurboTax generates a CLEAN tax return (for the IRS) and a SEPARATE summary (for you). The current PDF mixes appraiser-facing evidence with homeowner-facing instructions in one document.
3. **Name things in human terms** — "ARB hearing" → "your hearing." "Statement of Unequal Appraisal" → "Your Evidence." "iSettle" → "settlement offer." Don't make users learn jargon to use your product.
4. **Reduce decision points** — Don't present 5 steps with 3 branches each. Present the happy path. Put edge cases in footnotes.

**Document hierarchy that reduces cognitive load:**

The TurboTax model is:
- **Email** = "Here's what to do" (3 bullets max)
- **Quick Start Guide** (1 page) = Step-by-step instructions for filing
- **Evidence Packet** (2-3 pages) = What you upload/bring to the hearing — looks professional, no instructions, no branding fluff
- **Appendix/Reference** = Everything else (hearing script, legal background, homestead info)

**Formatting fixes:**
- The current 9px/10px font is too small for a nervous homeowner printing this at home
- The serif hearing script in Georgia font is a jarring context switch
- The red/green color coding assumes color printing — need it to work in B&W too
- The "overtaxed" branding in the header of the evidence document undermines credibility at a hearing. You want this to look like a PROFESSIONAL evidence submission, not a startup's marketing PDF.

---

## 3. Proposed Structure

### Split into 2 Documents + Restructured Email

#### Document 1: "Your Step-by-Step Guide" (1 page)
**Purpose:** Instructions only. Human-readable. Not submitted to anyone.

| Section | Content |
|---------|---------|
| **Hero block** | Your address, estimated savings, one sentence: "Here's how to save $X on your property taxes this year." |
| **Timeline bar** | Visual: `📬 Get Notice → 📝 File Online → 💬 Check for Offer → 🏛️ Hearing (if needed)` |
| **Step 1: File Your Protest** | 4-5 sentences. Link to file online. Your account number (big, copyable). What to select ("Unequal Appraisal"). What value to enter. "Upload the Evidence Packet (the other PDF we sent you)." |
| **Step 2: Check for a Settlement Offer** | 3 sentences. What to look for. "If they offer $X or less, accept it. Otherwise, go to your hearing." |
| **Step 3: Your Hearing** | 3 sentences. "Bring the Evidence Packet. Use the hearing script on the back." Brief confidence booster. |
| **⚡ Quick Facts sidebar** | No cost to file · No risk (they can't raise your taxes for protesting) · No lawyer needed · Takes 15 minutes to file |
| **Hearing Script** (back of page / page 2) | Simplified 5-sentence script + 3 pushback responses |

**Design:** Large type (12-13px). Numbered steps with big circles. Lots of white space. Feels like an Apple product manual, not a legal document.

#### Document 2: "Evidence Packet" (2-3 pages)
**Purpose:** This is what you submit online AND bring to your hearing. Looks professional and official.

| Section | Content |
|---------|---------|
| **Header** | Clean, minimal. "Property Tax Protest — Uniform & Equal Analysis." Date. County. NO "overtaxed" branding — or very subtle footer-only. |
| **Subject Property** | Address, Account #, Sqft, Year Built. Clean box. |
| **Summary** | Current Value vs. Fair Value. One clear comparison. |
| **Statement of Unequal Appraisal** | 2-3 paragraphs. §42.26 argument. Formal tone. |
| **Comparable Properties Table** | Subject row (highlighted) + comp rows. Columns: #, Address, Account, Sqft, Year Built, Appraised Value, $/SF |
| **Statistical Summary** | Subject $/SF vs. Median vs. Average. % difference. |
| **Footer** | Disclaimer. Data source. Date. Small "Prepared by Overtaxed" credit. |

**Design:** Looks like a professional appraisal report. Black and white friendly. Conservative layout. 10-11px body. No emojis. No colored boxes. No instructions.

**What's CUT from current PDF:**
- ❌ Filing instructions (moved to Guide)
- ❌ Hearing script (moved to Guide)
- ❌ "Important Information" section (homestead exemption, 10% cap, annual reassessment — moved to email or Guide sidebar)
- ❌ "overtaxed" branding in header (moved to subtle footer)
- ❌ Tax Impact calculation (nice-to-have but not evidence)
- ❌ Emojis (📋 📝 ⚠️ ⏰) in evidence document

**What's ADDED:**
- ✅ Cleaner, more authoritative visual design
- ✅ Year of appraisal data prominently labeled (e.g., "2025 Appraised Values")
- ✅ B&W-safe formatting (bold/underline instead of color-only differentiation)

#### Restructured Email
See section 4 below.

---

## 4. Email Flow — How Email + Attachments Work Together

### Current Flow
```
Email (with embedded instructions) + 1 PDF attachment + web link
```
**Problem:** The email tries to explain the process AND deliver the package. It's doing two jobs.

### Proposed Flow
```
Email (short, action-oriented) + 2 PDF attachments + web link
```

### New Email Structure

```
Subject: Your property tax protest is ready — {address}

──────────────────────────────────────

Hey {first_name},

Your protest package for {address} is ready. Here's everything you need to 
save an estimated ${savings}/year on your property taxes.

📎 TWO ATTACHMENTS:
  1. Quick Start Guide — Step-by-step instructions (read this first)
  2. Evidence Packet — Upload this when you file your protest

🎯 THE SHORT VERSION:
  1. Wait for your appraisal notice (arrives late March / early April)
  2. Go to {filing_url} and file a protest
  3. Upload the Evidence Packet PDF as your supporting evidence
  4. Enter ${fairAssessment} as your opinion of value

That's it. The Quick Start Guide has the full walkthrough, plus a script 
for your hearing if you need one.

[View Online →]

──────────────────────────────────────

Quick facts:
• No cost to file, no risk, no lawyer needed
• Filing takes about 15 minutes
• Your account number: {acct}
• Questions? Just reply to this email.

overtaxed · hello@getovertaxed.com
```

**Key changes:**
1. **Names the two attachments** so user knows what each is for
2. **"THE SHORT VERSION"** gives the complete process in 4 lines — if they read nothing else, they can still file
3. **Calls out "read this first"** to direct attention to the Guide
4. **Moves all the savings/value details** to the web app and PDF — email stays lean
5. **"Just reply to this email"** — human support reduces anxiety

---

## 5. Copy Examples — Quick Start Guide

### Draft: Page 1 of Quick Start Guide

---

# Save ${savings}/year on your property taxes

**{address}** · Account: `{acct}` · {County} County

Your property is appraised at **${currentAssessment}** — that's **{overAssessedPct}% higher** than similar homes nearby.

Based on {N} comparable properties, a fair value is **${fairAssessment}**.

---

## How to file your protest

You can do this online in about 15 minutes. No lawyer, no fees, no risk.

### ① Wait for your appraisal notice
The county mails notices in **late March / early April**. You need the notice to file. (It'll confirm your account number: `{acct}`.)

> **⏰ Deadline:** You must file by **May 15** (or 30 days after your notice date, whichever is later). Don't wait.

### ② File online
Go to **{filing_url}** and search for your account:

```
Account number: {acct}
Reason for protest: ✅ Unequal Appraisal
Your opinion of value: ${fairAssessment}
Evidence: Upload the "Evidence Packet" PDF (the other attachment)
```

### ③ Check for a settlement offer
After filing, the county may offer to lower your value **without a hearing**. Check your email and your online account.

- **Offer ≤ ${fairAssessment}?** → Accept it. You're done! 🎉
- **Offer too high?** → Reject it. You'll get a hearing date.
- **No offer?** → No worries. Proceed to your hearing.

### ④ Go to your hearing (if needed)
Most protests settle before this step. But if you get a hearing:
- **Bring the Evidence Packet** (printed or on your phone)
- **Use the script on the next page** — it tells you exactly what to say
- **Be brief and factual.** The panel has seen hundreds of these.

---

**Things you might be worried about:**

| Worry | Reality |
|-------|---------|
| "Can they raise my taxes for protesting?" | **No.** Texas law prohibits retaliation. The worst case is your value stays the same. |
| "Do I need a lawyer?" | **No.** You have everything you need right here. |
| "What if I mess up at the hearing?" | **You won't.** Stick to the script. The data does the talking. |
| "Is this worth my time?" | **At ${savings}/year?** That's ${Math.round(savings/12)}/month back in your pocket. |

---

### Draft: Page 2 — Hearing Script (back of Guide)

---

## What to say at your hearing

*Read this if you're headed to an ARB hearing. Keep it simple — 2 minutes max.*

---

**Your opening:**

> "Good morning. I'm protesting the value of my property at **{address}**, Account {acct}, on the basis of **unequal appraisal**."

**Your argument (the only slide you need):**

> "My property is appraised at **${perSqft}/sqft**. I've identified {N} comparable properties in the same neighborhood that are appraised at a median of **${compMedianPerSqft}/sqft** — that's **{overAssessedPct}% lower** than mine.
>
> Under Texas Tax Code Section 42.26, properties must be appraised equally. I'm requesting a reduction to **${fairAssessment}**, which matches the median of comparable properties."

**Your close:**

> "I've provided {N} comparable properties with addresses, account numbers, and appraised values as supporting evidence. I respectfully request the board adjust my value to ${fairAssessment}."

---

**If they push back:**

| They say… | You say… |
|-----------|----------|
| "Your home has upgrades/features they don't" | "The comparables are in the same neighborhood with similar build year and square footage. I'm asking for equal treatment, not a discount." |
| "Those comps aren't similar enough" | "They're in the same appraisal neighborhood, same era construction, similar size. Section 42.26 requires the board to consider the median of comparable properties." |
| "We can offer you ${X}" (a compromise) | If ≤ ${fairAssessment}: "I'll accept that." / If higher: "I appreciate the offer, but the comparable data supports ${fairAssessment}. I'd like the board to consider the evidence." |

---

## 6. Data Year Lingo

### The Problem
Users don't understand what year the data represents or whether it's current. The current PDF doesn't clearly label data years anywhere. This creates confusion:

- "Is this last year's data? Is it stale?"
- "My notice says 2026 — but this PDF shows different numbers?"
- "When was this analysis generated? Is it still valid?"

### The Confusion Cycle
In Texas, appraisal districts value properties as of **January 1** of the current year. Notices mail in **March-April**. So:
- Data labeled "2025" was actually assessed as of January 1, 2025
- Notices for 2025 values arrive in spring 2025
- The tax bill you pay in late 2025 / early 2026 is based on 2025 values

Users buying the Overtaxed package in **early 2026** might see 2025 data and think it's outdated — but it's actually the current year's data they're protesting.

### Proposed Language

#### On the Results Page (before purchase):
```
📊 2025 Tax Year Analysis
This analysis is based on your property's 2025 appraised value — the value 
on your most recent appraisal notice. This is the value you'll protest.

Your 2025 Appraised Value: $334,780
Fair Value (based on 2025 comparable data): $312,000
```

**Key:** Always pair the year with "appraisal notice" so users connect it to the physical mail they received.

#### On the PDF Evidence Packet:
```
Header: "2025 Tax Year — Uniform & Equal Analysis"
Comps table header: "2025 Appraised Values — Comparable Properties"
Footer: "All values reflect 2025 HCAD/DCAD certified appraisals. 
         Generated {date} by Overtaxed."
```

#### On the Quick Start Guide:
```
This package is for your **2025 property tax protest** — the value shown on 
your most recent appraisal notice (mailed spring 2025).
```

#### In the Email:
```
Subject: Your 2025 property tax protest is ready — {address}
```

### Rules for Data Year Communication:
1. **Always say "2025 Tax Year" or "2025 Appraised Value"** — never just "2025"
2. **Connect it to the notice** — "the value on your appraisal notice"
3. **Put the year in the PDF title and header** — not buried in body text
4. **In the comps table, label values explicitly** — "2025 Appraised Value" not just "Appraised Value"
5. **If we're selling data from a previous year** (e.g., selling 2025 data in early 2026 before 2026 notices mail), add: "2026 notices haven't mailed yet. Once yours arrives, we'll update your package."

---

## 7. Before/After — The Filing Instructions Section

### BEFORE (Current)

```
📋 HOW TO PROTEST — HARRIS COUNTY STEP BY STEP

Texas law gives every property owner the right to protest their appraised 
value. Harris County makes this easy — you can do it entirely online. 
No attorney or agent needed.

⏰ Deadline: Harris County protest season typically opens in late March 
when appraisal notices are mailed. The deadline is usually May 15 (or 30 
days after your notice date, whichever is later). Homestead properties 
may have an earlier deadline of April 30. File as soon as you receive 
your notice for the best results.

Step 1: Wait for Your Appraisal Notice
HCAD mails appraisal notices in late March to early April. Your notice 
will show your property's appraised value for the current year. You need 
the Account Number from this notice (your account: 1234567890).

Step 2: File Online via iFile
Go to hcad.org and click "File a Protest" or go directly to HCAD iFile 
Protest
• Enter your Account Number: 1234567890
• Select "Unequal Appraisal" as your reason for protest (this is the 
  strongest legal argument)
• You can also check "Value is Over Market Value" as an additional reason
• Enter your opinion of value: $312,000
• Upload this PDF as your supporting evidence
• Submit your protest

Step 3: Check for an iSettle Offer
After filing, HCAD may send you a settlement offer via iSettle (check 
your email and your iFile account). This is HCAD's automated settlement 
system — they may offer to reduce your value without a hearing.
• If the offer is at or below $312,000 → Accept it! You're done.
• If the offer is still too high → Reject it and proceed to your ARB hearing.
• If you don't get an iSettle offer → proceed to your hearing.

Step 4: Prepare for Your ARB Hearing
If iSettle doesn't work, you'll be scheduled for an Appraisal Review 
Board (ARB) hearing. Hearings run from May through July. You can attend 
in person or by phone.
• Bring this PDF — it has everything you need
• Present your comparable properties and explain why your value should 
  be lower
• Focus on the $/sqft comparison — your property is at $172.00/sqft 
  while comparable properties average $145.00/sqft
• Be polite and factual. The appraiser may offer a compromise.

Step 5: After the Hearing
The ARB panel will issue a decision, usually within a few weeks. If 
you're not satisfied with the result, you can appeal further to District 
Court or pursue binding arbitration (for properties under $5 million). 
However, most protests are resolved at the iSettle or ARB stage.
```

**Problems:**
- 5 steps with dense paragraphs
- Mixes "wait" steps with "do" steps
- "Upload this PDF" — which includes instructions the appraiser shouldn't see
- Jargon: iSettle, ARB, iFile, §42.26, binding arbitration
- Parenthetical asides slow reading: "(this is the strongest legal argument)"
- Step 5 introduces District Court and binding arbitration — terrifying to a first-timer
- No visual hierarchy — every step looks the same weight

---

### AFTER (Proposed — from Quick Start Guide)

```
HOW TO FILE YOUR PROTEST
Online. 15 minutes. No lawyer needed.

────────────────────────────────────

① FILE ONLINE                                    ⏰ By May 15

   Go to hcad.org → "File a Protest"

   ┌─────────────────────────────────────────┐
   │  Account number:    1234567890           │
   │  Reason:            ✓ Unequal Appraisal  │
   │  Your value:        $312,000             │
   │  Evidence:          Upload Evidence       │
   │                     Packet PDF            │
   └─────────────────────────────────────────┘

   That's it. You'll get a confirmation email.

────────────────────────────────────

② CHECK FOR AN OFFER                       📬 1-3 weeks later

   The county may offer to lower your value 
   without a hearing. Check your email.

   • Good offer (≤ $312,000)?  → Accept it. Done!
   • Bad offer or no offer?    → You'll get a 
                                  hearing date.

────────────────────────────────────

③ YOUR HEARING (if needed)                  🏛️ May – July

   Most people never get here. But if you do:

   • Bring the Evidence Packet (print or phone)
   • Use the hearing script (next page)
   • Total time: ~15 minutes

   The worst case? Your value stays the same.
   There is zero risk to protesting.

────────────────────────────────────

YOUR ACCOUNT NUMBER (you'll need this):

   ╔══════════════════════════╗
   ║     1 2 3 4 5 6 7 8 9 0 ║
   ╚══════════════════════════╝
```

**What changed:**
- 5 steps → 3 steps (removed "wait for notice" and "after the hearing")
- Dense paragraphs → scannable blocks with visual boxes
- Jargon removed — "iSettle" → "offer," "ARB" → "your hearing"
- Clear timeline markers on each step (⏰ By May 15, 📬 1-3 weeks, 🏛️ May-July)
- Account number giant and prominent (they'll need to copy it)
- "Upload this PDF" → "Upload Evidence Packet PDF" (refers to the correct document)
- District Court / binding arbitration eliminated entirely
- Zero-risk reassurance built into the flow (not a separate section)
- "Upload" box looks like a form they'll see online — pattern matching

---

## Summary of Recommended Changes

### Immediate (High Impact)
1. **Split PDF into 2 documents**: Quick Start Guide + Evidence Packet
2. **Restructure email** to be short and action-oriented with 2 named attachments
3. **Add data year labels** throughout (results page, PDF headers, email subject)
4. **Remove Overtaxed branding from Evidence Packet header** (keep subtle footer credit)
5. **Add pushback handling** to hearing script

### Medium-term
6. **Add data error detection** (flag sqft discrepancies like Deji found)
7. **Make web app the primary experience** with PDF as a download/print option (progressive disclosure)
8. **Add "hearing mode"** to web app — phone-friendly view with just the script and comps table
9. **Add year-to-year feature**: "2026 notices haven't mailed yet. We'll notify you when they do."

### Longer-term
10. **Drip email sequence** instead of one email: (1) Package delivered → (2) "Notices are mailing — time to file!" → (3) "Did you file? Here's a reminder" → (4) "Hearing tips"
11. **Template the evidence letter** to match Deji's winning format: numbered points, data error + market sales + equity argument structure
12. **Add a "confidence score"** — "Your case strength: Strong 💪" based on how much the property exceeds median

---

## Appendix: Deji's Evidence Letter Structure (Gold Standard)

For reference, here's how Deji's actual winning evidence letter was structured — this should be the model for the Evidence Packet:

```
Evidence Letter – Account #{acct}
Owner: {name}
Situs: {address}
2025 Notice Value: ${currentAssessment}
Requested Market/Appraised Value: ${fairAssessment}

1 · [Specific data error, if any]
   - What's wrong in the county's records
   - Corrected calculation
   - How it changes the value

2 · Sales prove the correct $/sf is ~$X, not $Y
   - Table: Account | Address | Sale date | Living area | Time-adj price | $/sf
   - Average calculation
   - What this implies for subject property

3 · Unequal appraisal versus identical models (§42.26)
   - Table: Account | Address | 2025 Notice value
   - Median of peer set
   - How request compares

Requested action:
[One sentence: what you want and why]
```

This is **1 page**, **3 numbered points**, **2 tables**, and **1 requested action**. Compare this to the current 3-paragraph legal brief — Deji's version is clearer, more specific, and more persuasive.
