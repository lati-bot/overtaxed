# Homestead Exemption Research — Detection, Value, and Customer Guidance
*Generated February 18, 2026*

---

## Table of Contents
1. [Texas Homestead Exemption — Current Law](#1-texas-homestead-exemption--current-law)
2. [How to Detect Missing Exemptions from Our Data](#2-how-to-detect-missing-exemptions-from-our-data)
3. [Impact of Missing Homestead Exemption](#3-impact-of-missing-homestead-exemption)
4. [How to Apply by County (Our 10 TX Counties)](#4-how-to-apply-by-county)
5. [Cook County / Illinois Exemptions](#5-cook-county--illinois-exemptions)
6. [The 10% Homestead Cap — Deep Dive](#6-the-10-homestead-cap--deep-dive)
7. [Common Reasons People Miss Their Exemption](#7-common-reasons-people-miss-their-exemption)
8. [Product Strategy: Free Value-Add or Separate Product?](#8-product-strategy)
9. [Upcoming Legislative Changes](#9-upcoming-legislative-changes)

---

## 1. Texas Homestead Exemption — Current Law

### Current Amounts (Effective January 1, 2025 — Prop 13 + Prop 11 passed Nov 2025)

| Exemption Type | Amount | Applies To |
|----------------|--------|------------|
| **General Homestead (School District)** | **$140,000** | All homeowners (was $100K in 2024, $40K before 2023) |
| **Over-65 / Disabled Additional (School)** | **$60,000** | On top of general = **$200,000 total** for seniors/disabled (was $10K add-on before 2025) |
| **County (FM/Flood Control)** | $3,000 | Mandatory for counties collecting FM/flood taxes |
| **Local Option (Any taxing unit)** | Up to 20% of appraised value (min $5,000) | Optional — cities, counties, special districts may adopt |
| **Over-65/Disabled Local Option** | At least $3,000 | Any taxing unit can adopt |

### Key Legal References
- **Texas Tax Code §11.13(b)** — School district general homestead ($140,000)
- **Texas Tax Code §11.13(c)** — School district over-65/disabled additional ($60,000)
- **Texas Tax Code §11.13(n)** — Local option up to 20% of value
- **Texas Tax Code §11.13(a)** — County FM/flood control ($3,000)
- **Texas Tax Code §23.23** — 10% annual cap on appraised value increases

### What Qualifies
- Must be your **principal residence** (owner-occupied)
- Must have **ownership interest** in the property
- Texas driver's license or ID must match property address
- Cannot claim homestead on another property (in or outside TX)
- Applies to up to **20 acres** of residential land
- If you buy after Jan 1, you can still get a prorated exemption for that year

### Total Potential Savings (Example: $400K Home)

For a home appraised at $400,000 with a **2.2% total tax rate** (typical for suburban TX):

| Without Homestead | With Homestead | With Homestead + Over-65 |
|-------------------|----------------|--------------------------|
| $400K × 2.2% = **$8,800** | ($400K - $140K school - $5K+ local) × rates ≈ **$7,000–$7,400** | ($400K - $200K school - $5K+ local) × rates ≈ **$5,800–$6,200** |
| — | **Saves ~$1,400–$1,800/yr** | **Saves ~$2,600–$3,000/yr** |

**School district savings alone from the $140K exemption at ~1.0% school rate = ~$1,400/year.**

For seniors: the combined $200K school exemption at ~1.0% rate = **$2,000/year just from school district**.

---

## 2. How to Detect Missing Exemptions from Our Data

### By County — What Data We Have

| County | CAD | Exemption Data Available? | Field/Method |
|--------|-----|--------------------------|--------------|
| **Harris** (HCAD) | hcad.org | ✅ YES — Public data download includes exemption fields | HCAD PDATA files (tab-delimited text) include exemption codes per account. Look for exemption file in the bulk download. Codes include HS (homestead), OV65, DP (disabled person) |
| **Dallas** (DCAD) | dallascad.org | ✅ YES — Property records include exemption status | DCAD property search shows exemptions. Bulk data on data.texas.gov may include exemption field |
| **Bexar** (BCAD) | bcad.org | ✅ YES — `hs_exempt` field exists in our Cosmos DB | Already detected in our data model |
| **Tarrant** (TAD) | tad.org | ✅ LIKELY — TAD data downloads include exemption info | TAD manages exemptions for 73 jurisdictions. Data includes exemption status |
| **Travis** (TCAD) | traviscad.org | ✅ YES — Online search shows exemptions per account | TCAD property search shows exemption history. Prodigy CAD system. May need scraping or API |
| **Collin** (CCAD) | collincad.org | ✅ YES — data.texas.gov has CCAD data with exemption fields | Socrata API — query directly |
| **Denton** (DCAD) | dentoncad.com | ✅ LIKELY — Similar TX CAD system | data.texas.gov may include. Need to verify |
| **Fort Bend** (FBCAD) | fbcad.org | ✅ LIKELY — esearch.fbcad.org shows exemptions | Online search shows exemption status per property |
| **Williamson** (WCAD) | wcad.org | ✅ YES — WCAD specifically tracks and publicizes missing exemptions | WCAD identified 18,977 properties missing homestead in 2019 alone |
| **Rockwall** (RCAD) | rockwallcad.com | ✅ LIKELY — Standard TX CAD data | Smaller county, same data patterns |
| **Cook County** (IL) | cookcountyassessoril.gov | ✅ YES — Exemption history visible per PIN | Cook County Assessor shows "Exemption History and Status" per property. Open Data catalog has exemption datasets |

### Detection Algorithm (Proposed)

```
FOR each property in our database:
  IF property.use_code IN [residential, single-family, condo, townhome]
    AND property.owner_mailing_address MATCHES property.situs_address
    AND property.exemption_status IS NULL OR NOT CONTAINS "HS"
  THEN:
    flag as "LIKELY MISSING HOMESTEAD EXEMPTION"
    calculate potential_savings = $140,000 * school_tax_rate
```

### Key Signals of Missing Exemption
1. **Owner mailing address = property address** (owner-occupied, but no exemption)
2. **No exemption codes** in CAD data (or empty exemption field)
3. **Recent purchase** (within last 1-2 years) — exemptions don't transfer in TX
4. **Market value = appraised value** (no cap loss showing = likely no homestead)
5. **No cap loss on tax statement** — if appraised value equals market value with no "homestead limitation" line

### Estimated Miss Rate
- **~20% of eligible TX homeowners** don't have their homestead exemption (per TaxDrop, 2025)
- Williamson County found **18,977 properties** missing homestead in 2019 — that's significant even in one county
- **New homebuyers** are the biggest group — exemptions do NOT transfer with sale in Texas
- This percentage is likely higher in fast-growing counties (Collin, Denton, Williamson, Fort Bend) with lots of new construction and new buyers

---

## 3. Impact of Missing Homestead Exemption

### Dollar Savings by County (Estimated)

Using the $140K school exemption + typical local option exemptions:

| County | Avg School Rate | School Savings Alone | Est. Total Savings (all exemptions) |
|--------|----------------|---------------------|--------------------------------------|
| Harris | ~1.04% | ~$1,456/yr | ~$1,600–$1,900/yr |
| Dallas | ~1.05% | ~$1,470/yr | ~$1,600–$1,900/yr |
| Tarrant | ~1.10% | ~$1,540/yr | ~$1,700–$2,000/yr |
| Travis | ~0.95% | ~$1,330/yr | ~$1,500–$1,800/yr |
| Collin | ~1.10% | ~$1,540/yr | ~$1,700–$2,000/yr |
| Bexar | ~1.10% | ~$1,540/yr | ~$1,700–$2,000/yr |
| Denton | ~1.08% | ~$1,512/yr | ~$1,600–$1,900/yr |
| Fort Bend | ~1.10% | ~$1,540/yr | ~$1,700–$2,000/yr |
| Williamson | ~1.05% | ~$1,470/yr | ~$1,600–$1,900/yr |
| Rockwall | ~1.15% | ~$1,610/yr | ~$1,800–$2,100/yr |

**Average savings: ~$1,500–$2,000/year per homeowner** — this is MORE than many protest savings!

### The 10% Cap — The Hidden Cost of Not Having It

The dollar savings above are just the EXEMPTION. The **10% annual cap on appraised value** is arguably even more valuable:

**Example: Home bought for $300K in 2022, no homestead filed:**
- 2023 CAD market value: $340K (you pay on $340K)
- 2024 CAD market value: $390K (you pay on $390K)
- 2025 CAD market value: $430K (you pay on $430K)

**Same home WITH homestead filed in 2022:**
- 2023: Capped at $330K (saved $10K in taxable value)
- 2024: Capped at $363K (saved $27K in taxable value)
- 2025: Capped at $399K (saved $31K in taxable value)

**Cumulative extra taxable value without homestead: ~$68K over 3 years.** At 2.2% tax rate, that's an extra **~$1,500 in unnecessary taxes** just from the cap alone, on top of the exemption savings.

### Retroactive Filing — Can You Get Refunds?

**YES — up to 2 years retroactively** (as of Jan 1, 2022 change to TX Tax Code §11.431)

- File Form 50-114 with your county appraisal district
- Check "Yes" for late application, specify years
- If approved, the tax collector issues refund within **60 days** — automatically
- No extra paperwork needed for the refund
- **You can recover 2 years of overpaid taxes**

**Important caveats:**
- The 2-year window is measured from the **tax delinquency date** (typically Feb 1 of the following year)
- So for tax year 2024 (bills due Jan 31, 2025, delinquent Feb 1, 2025), you can file retroactively until Feb 1, 2027
- If bills are already issued, the exemption doesn't pause collections — pay first, refund comes later
- Penalties DO accrue if you're delinquent while waiting for exemption approval

### Before 2022 vs. After 2022
- **Before 2022**: Hard deadline of April 30 for filing. Miss it, lose the year.
- **After 2022**: You can file any time during the year, plus up to 2 years retroactively
- **Lost years beyond 2**: Unfortunately, if you find out after 3+ years, earlier years are gone forever

---

## 4. How to Apply by County

### Universal Requirements (All TX Counties)
- **Form**: Texas Comptroller Form 50-114 (Residence Homestead Exemption Application)
- **Documents needed**:
  - Texas driver's license or TX ID card (address must match property)
  - Copy of closing statement or deed (for new purchases)
  - Vehicle registration showing property address (sometimes)
- **Deadline**: April 30 of the tax year (but late filing accepted up to 2 years back)
- **Processing time**: Typically 2-6 weeks

### County-Specific Application Details

| County | CAD | Online Filing? | Website | Special Notes |
|--------|-----|---------------|---------|---------------|
| **Harris** | HCAD | ✅ Yes — HCAD Mobile App + online | hcad.org → Homestead | Mobile app allows photo upload of DL front/back. Fastest method. |
| **Dallas** | DCAD | ✅ Yes — online portal | dallascad.org → Exemptions | Online via DCAD website |
| **Tarrant** | TAD | ✅ Yes — online portal | tad.org → Forms → Homestead Exemption | Online form with document upload. DL address must match. |
| **Travis** | TCAD | ✅ Yes — online | traviscad.org → Exemptions | Online portal. TCAD also uses Prodigy CAD system. |
| **Collin** | CCAD | ✅ Yes — online | collincad.org → Exemptions | Online portal available |
| **Bexar** | BCAD | ✅ Yes — online | bcadonline.org | Online application through BCAD's portal |
| **Denton** | Denton CAD | ✅ Yes — online | dentoncad.com → Forms | Online form submission |
| **Fort Bend** | FBCAD | ✅ Yes — portal | fbcad.org → Property Owner's Login → Exemptions/Rendition Portal | Through property owner login |
| **Williamson** | WCAD | ✅ Yes — online | wcad.org | Online application; WCAD actively promotes exemption awareness |
| **Rockwall** | RCAD | ✅ Yes — online/paper | rockwallcad.com | Online or paper Form 50-114 |

### Processing Timeline
1. **Submit application** (online or paper) — takes 5 minutes
2. **CAD reviews** — typically 2-4 weeks
3. **Approval notification** — letter or online status update
4. **Exemption applied** — reflected on next tax bill
5. **If retroactive** — refund issued by tax collector within 60 days of approval

---

## 5. Cook County / Illinois Exemptions

### Available Exemptions

| Exemption | EAV Reduction | Eligibility | Auto-Renewal? |
|-----------|--------------|-------------|---------------|
| **Homeowner Exemption** | **$10,000 off EAV** | Own + occupy as primary residence | ✅ Yes — auto-renews annually |
| **Senior Citizen Exemption** | **$8,000 off EAV** (Cook County) | Age 65+, own + occupy | ✅ Yes — auto-renews |
| **Senior Freeze** | Freezes EAV at base year level | Age 65+, household income ≤$65,000 | ❌ Must file annually |
| **Persons with Disabilities** | Reduction in EAV | Disabled, own + occupy | ✅ Yes — auto-renews (new legislation) |
| **Home Improvement** | Up to $75,000 of added value exempt for 4 years | Any homeowner making improvements | ✅ Auto-applied |
| **Long-Time Homeowner** | Expanded homeowner exemption (no max) | 2% of homeowners qualify — income + residency + large increase | ❌ Annual filing |

### Dollar Savings

- **Homeowner Exemption**: ~$950/year average (per Cook County Assessor)
- **Senior Citizen Exemption**: Additional ~$300–$800/year depending on local tax rate
- **Senior Freeze**: Varies hugely — prevents EAV increases, could save thousands over time
- Combined Homeowner + Senior + Senior Freeze for an eligible senior can save **$2,000–$4,000+/year**

### How to Detect from Our Cook County Data

Cook County's data ecosystem is excellent for detection:

1. **Cook County Assessor's website**: Each PIN shows "Exemption History and Status" — you can see which exemptions are applied
2. **Cook County Open Data Portal** (datacatalog.cookcountyil.gov): Has tax data including exemption info
3. **Cook County Treasurer** (cookcountytreasurer.com): "Your Property Tax Overview" shows exemptions on file
4. **Socrata API**: Data catalog has programmatic access to property datasets

**Detection approach for Cook County:**
- Check if property has `exe_homeowner` flag in tax data
- Compare owner-occupied properties (class code 2-XX for residential) without homeowner exemption
- Flag recently purchased properties without exemption (new owners must apply — Cook County auto-renews for existing owners but NOT for new buyers)

### Application Process

| Exemption | How to Apply | Where |
|-----------|-------------|-------|
| **Homeowner** | First-time: apply online. Auto-renews after. | cookcountyassessoril.gov → Exemptions → Homeowner Exemption |
| **Senior Citizen** | Apply online or paper form. Auto-renews. | cookcountyassessoril.gov → Senior Exemption |
| **Senior Freeze** | Must apply annually. Income verification required. | cookcountyassessoril.gov → Senior Freeze Exemption |
| **Missing past years** | File Certificate of Error for years 2024, 2023, 2022, 2021 | cookcountyassessoril.gov → Certificates of Error |

**Key difference from Texas**: Cook County auto-renews most exemptions for existing homeowners. New owners must apply once, then it auto-renews. Texas does NOT auto-renew — exemptions do not transfer with sale.

---

## 6. The 10% Homestead Cap — Deep Dive

### How It Works (TX Tax Code §23.23)

The cap limits the **appraised value** (for tax purposes) to the lesser of:
1. **Fair market value**, OR
2. **Previous year's appraised value + 10% + value of new improvements**

The cap takes effect **January 1 of the tax year AFTER** you first receive the homestead exemption. So if you file in 2025, the cap kicks in for 2026.

### Cap vs. Protest Interaction — CRITICAL for Our Product

**Scenario**: Home market value is $400K, capped value is $300K

| Action | Market Value | Capped/Appraised Value | Taxes Based On |
|--------|-------------|----------------------|----------------|
| Do nothing | $400K | $300K | **$300K** (cap wins) |
| Protest market to $350K | $350K | $300K | **$300K** (cap still wins — no immediate savings) |
| Protest market to $280K | $280K | $280K | **$280K** (market now below cap — SAVES MONEY) |

### When Does Protesting Market Value Matter Even With a Good Cap?

**It ALWAYS matters.** Here's why:

1. **Next year's cap is based on THIS year's appraised value**
   - If your capped value this year is $300K, next year's cap is $330K
   - If you protest market to $350K (still above cap), next year the CAD starts from $350K not $400K
   - This means if the market softens, you get the benefit sooner
   
2. **The gap matters when you sell or remove homestead**
   - If you convert to rental, lose homestead, or sell — the property jumps to full market value
   - A lower market value means a smaller jump
   
3. **Protesting prevents market value "inflation"**
   - CADs tend to ratchet up market values aggressively
   - Even if the cap protects you now, an inflated market value creates a false ceiling
   - If you ever lose homestead status, you're hit with the full inflated value
   
4. **It protects future cap calculations**
   - Cap = (prior appraised value × 1.10) + improvements
   - Appraised value = min(market value, capped value)
   - If market value drops below cap due to your protest, the LOWER value becomes the new base
   - This compounds savings in future years

### Worked Example

**Year 1 (2024)**: Market: $500K, Capped: $440K → Taxes on $440K
- Protest gets market to $465K — no immediate tax savings (cap still $440K)
- But the record now shows $465K market, not $500K

**Year 2 (2025)**: CAD would have set market at $550K, now sets at $510K
- Cap: $484K (= $440K × 1.10)
- Without protest: taxed on $484K
- With Year 1 protest: still taxed on $484K (cap still binds)
- BUT market is $510K vs $550K — gap is $26K vs $66K

**Year 3 (2026)**: Market stabilizes at $520K
- Cap: $532K (= $484K × 1.10)
- Now market ($520K) < cap ($532K)!
- Taxes on $520K instead of $532K — **the protest from Year 1 is now saving real money**

### When Is Protesting NOT Worth It?
- If the gap between market value and capped value is enormous (say $200K+) and the market is unlikely to drop that much
- Even then, it's free to file, so the argument is really about effort vs. reward
- **Our recommendation**: Always encourage protesting. It's insurance for the future.

### Important: 20% Cap for Non-Homestead Properties (New in 2024)
- Properties WITHOUT homestead that are valued under $5M get a **20% annual cap**
- This is less generous than the 10% homestead cap
- Another reason to encourage homestead filing — you get 10% instead of 20%

---

## 7. Common Reasons People Miss Their Exemption

### Top Reasons (In Order of Frequency)

1. **Just bought the home** — #1 reason
   - In Texas, homestead exemptions **DO NOT transfer** with the sale of a property
   - The new buyer must file their own application
   - Many first-time buyers (and even experienced ones) don't know this
   - Title companies sometimes mention it but it gets lost in closing paperwork

2. **Never knew it existed**
   - No one tells you. It's not automatic in TX.
   - Especially common with first-time homebuyers
   - People from states where it's automatic (like FL) may assume it carries over

3. **Filed but it wasn't processed**
   - Application was lost in the mail
   - Online submission didn't go through
   - CAD rejected for documentation issues (DL address didn't match)
   - Owner never followed up

4. **Address mismatch on driver's license**
   - TX requires DL address to match the homestead property
   - If you haven't updated your DL after moving, your application will be rejected
   - This trips up a LOT of people

5. **Refinanced and thought they lost it**
   - Myth: refinancing doesn't affect your homestead exemption
   - But some homeowners worry and don't re-file
   - The exemption stays unless you move or sell

6. **Previous owner had it, new owner assumed it transferred**
   - Very common misconception
   - The CAD removes the previous owner's exemption upon sale
   - New owner must file fresh

7. **Rental conversion or returning to the property**
   - If you rented your home out and removed homestead, then moved back in
   - Must re-file when you resume owner-occupancy

8. **New construction**
   - Builder doesn't file for you
   - Especially common in fast-growing suburbs (Collin, Denton, Fort Bend, Williamson)
   - New construction = no prior owner exemption to even be confused about

---

## 8. Product Strategy

### Should We Flag Missing Exemptions? — **ABSOLUTELY YES**

This is potentially our **highest-value free feature**. Here's why:

#### The Value Proposition
- Average homestead exemption saves **$1,500–$2,000/year**
- Our protest evidence saves maybe **$200–$800/year** on average
- Flagging a missing exemption literally saves someone **MORE than our product costs**
- And it's FREE for them to file — we're just alerting them

#### Implementation Options

**Option A: Pre-Purchase Alert (Landing Page Hook)**
```
"🚨 We found something — you may be missing your homestead exemption!
This could save you $1,847/year. Filing is free and takes 5 minutes.
[Learn How →]
```
- Show this BEFORE they even buy our protest package
- Builds massive trust and goodwill
- Creates a "holy shit this is useful" moment
- They'll be MORE likely to buy the protest evidence after we just saved them money for free

**Option B: Included in Evidence Package**
- Add a section to the appeal PDF: "Exemption Status Check"
- If no exemption detected: bold alert with filing instructions
- If exemption present: "✅ Your homestead exemption is on file"
- We already mention homestead in our PDFs — make it data-driven

**Option C: Standalone Free Tool**
- "Check Your Exemption Status" tool on our website
- Enter address → we check CAD data → tell them if they're missing it
- SEO goldmine: "am I missing my homestead exemption Texas"
- Lead generation funnel → upsell protest evidence

**🏆 Recommended: All three, phased.**
- Phase 1: Add detection to existing evidence PDFs (we already have the data for some counties)
- Phase 2: Pre-purchase landing page alert (when someone enters their address)
- Phase 3: Standalone free tool for SEO + lead gen

#### Competitive Landscape

| Competitor | Homestead Exemption? | Approach |
|-----------|---------------------|----------|
| **Ownwell** | ✅ Yes — files homestead as part of their service | Bundles exemption filing with protest. BBB complaints show they file it for free as part of signup. Mentioned in Dallas Morning News coverage. |
| **SquareDeal.tax** | 📝 Educational content only | Excellent blog posts about homestead exemption. No filing service. |
| **HomeTaxShield** | 📝 Educational content | Blog posts about cap and exemption. No filing service. |
| **O'Connor & Associates** | ✅ Likely includes | Full-service firm, probably helps with exemptions |
| **Title companies** | Sometimes mention at closing | Inconsistent — often gets lost in paperwork |
| **Scam companies** | ⚠️ Charge $50–$200 to file | TX AG has issued consumer alerts about companies charging fees to file the free form. These are misleading but common. |

**Key insight**: Ownwell is the only tech competitor bundling exemption filing. Nobody is doing proactive "you're missing your exemption" alerts as a standalone value-add. **This is a gap we can own.**

#### ⚠️ Legal Considerations
- **Do NOT charge** for helping someone file their homestead exemption — it's free and the TX Attorney General has specifically warned about companies charging for this
- Position it as a **free value-add** and good faith gesture
- We can guide them to the right CAD website/form, calculate their savings, but shouldn't "file for them" (that gets into the scam territory the AG flagged)
- Our value is in **detection and notification**, not filing

#### Revenue Impact
- Builds trust → higher conversion on protest evidence purchases
- SEO traffic from exemption-related searches → leads
- Reduced churn — customers who save money trust us more
- Word of mouth: "Overtaxed told me I was missing $1,800/year and I didn't even have to buy anything"

---

## 9. Upcoming Legislative Changes

### Dan Patrick's "Operation Double Nickel" (Proposed Dec 2025)
- Increase school homestead exemption from $140,000 → **$180,000**
- Increase senior/disabled from $200,000 → **$240,000**
- Proposed for 2026 legislative session
- Would require voter approval (constitutional amendment)
- If passed, would add another **~$350–$500/year** in savings for all homeowners

### Gov. Abbott's Counter-Proposal
- Wants to **eliminate school property taxes for homeowners entirely**
- Also wants tighter restrictions on appraisal value growth
- Wants to make it harder for local governments to raise taxes
- More aggressive but less likely to pass in one session

### What This Means for Our Product
- Homestead exemptions are becoming MORE valuable every session
- The political trend is toward larger exemptions
- **Missing your exemption will cost MORE over time**
- This makes our detection feature even more valuable to customers

---

## Action Items

### Immediate (This Sprint)
- [ ] Audit each county's data for exemption fields — confirm which counties we can detect today
- [ ] For Bexar: we already have `hs_exempt` — start using it in the evidence PDF
- [ ] Add exemption status check to the evidence generation for all TX counties where data is available

### Short-Term (Next 2-4 Weeks)
- [ ] Build a "Check Your Exemption" widget for the address lookup page
- [ ] Add a banner/alert on the results page if no exemption detected
- [ ] Calculate and display personalized savings: "You could save $X/year by filing for homestead exemption"
- [ ] Include county-specific filing links and instructions

### Medium-Term (Next Quarter)
- [ ] Build standalone SEO landing page: "Am I Missing My Texas Homestead Exemption?"
- [ ] Create Cook County equivalent for IL properties
- [ ] Track conversion lift from exemption alerts → protest evidence purchases
- [ ] Consider: automated email/SMS reminders for new homebuyers in our database

### Data Engineering
- [ ] HCAD: Download and parse PDATA exemption files, map to our property records
- [ ] DCAD: Check data.texas.gov for exemption fields
- [ ] CCAD: Query Socrata API for exemption status
- [ ] Cook County: Pull exemption history from open data portal
- [ ] Create a unified `has_homestead_exemption` boolean in our property schema

---

## Key Takeaways

1. **~20% of eligible TX homeowners are missing their homestead exemption** — that's potentially hundreds of thousands of our users
2. **The savings ($1,500–$2,000/year) exceed what many people save from protesting** — this is a bigger deal than our core product for many customers
3. **Retroactive filing recovers up to 2 years of overpaid taxes** — we can save people thousands
4. **The 10% cap is arguably more valuable than the exemption itself** — missing it means uncapped value growth
5. **Detection is feasible** with data we already have or can easily get
6. **No competitor is doing proactive detection at scale** — Ownwell bundles filing, but nobody alerts you first
7. **This should be FREE** — builds trust, generates leads, increases conversions
8. **Cook County has similar opportunities** — $950/yr average savings from homeowner exemption alone
9. **Political trend = bigger exemptions** — the value of detecting missing exemptions only increases

**Bottom line: This is our biggest potential value-add. We should prioritize it immediately.**
