# Overtaxed 2026 Season Strategy

**Created:** February 16, 2026  
**Product:** getovertaxed.com — $49 property tax protest evidence packets  
**Texas Protest Deadline:** May 15, 2026 (or 30 days after notice mailed, whichever is later)

---

## Executive Summary

We have pre-computed 2025 data for 9 Texas counties + Cook County, IL. The 2026 appraisal values will start dropping March–April 2026. Our window to sell is **~6 weeks** (early April → May 15). We need to:
1. Monitor for 2026 data releases starting NOW
2. Begin marketing with 2025 data immediately (brand awareness + lead capture)
3. Sprint precompute as each county's 2026 data drops
4. Go full-send on paid ads once 2026 data is live

---

## 1. County Data Timeline & Sources

### Texas Counties — Typical 2026 Schedule

| County | CAD | Est. Notice Mailing | Data Source URL | Est. Properties |
|--------|-----|---------------------|-----------------|-----------------|
| Harris | HCAD | April 1–15 | hcad.org/public-data | ~1.8M |
| Dallas | DCAD | April 1–15 | dallascad.org | ~900K |
| Tarrant | TAD | April 1–15 | tad.org | ~700K |
| Collin | CCAD | April 1–15 | collincad.org | ~400K |
| Travis | TCAD | April 1–15 | traviscad.org | ~450K |
| Denton | Denton CAD | April 1–15 | dentoncad.net | ~350K |
| Fort Bend | FBCAD | April 1–15 | fbcad.org | ~300K |
| Williamson | WCAD | April 1–15 | wcad.org | ~250K |
| Rockwall | RCAD | April 1–15 | rockwallcad.com | ~40K |

**Key facts:**
- All Texas CADs value properties as of **January 1** each year
- Preliminary values are typically finalized internally by **March** and notices mailed by **April 1–15**
- Some CADs now send **preliminary/early value notices in February–March** (new post-89th Legislature session changes)
- The formal Notice of Appraised Value triggers the 30-day protest window
- **No county has released 2026 proposed values yet** as of Feb 16 — expected March/April

### Cook County, Illinois

Cook County uses a **triennial reassessment cycle** by township group:
- **City of Chicago:** 2021, 2024, **2027**
- **North Tri (north of North Ave, outside Chicago):** 2022, 2025, **2028**  
- **South Tri (south of North Ave, outside Chicago):** 2023, **2026**, 2029

**2026 is the South Tri reassessment year.** South suburban townships will get new values in 2026. Appeals are filed with the Cook County Assessor's Office, typically 30 days after reassessment notices are mailed (rolling by township throughout the year).

⚠️ **Decision Point (Tomi):** Do we want to actively market Cook County South Tri in 2026? Different timeline, different process, may distract from Texas push.

---

## 2. Data Monitoring Plan

### Monitoring Approach

Each CAD publishes data differently. Recommended hybrid approach:

#### A. Automated URL Monitoring (Lati)
Set up a cron job that checks each CAD's data download / property search page for changes:

```
# Every 6 hours starting March 1
0 */6 * * * /path/to/check-cad-pages.sh
```

**Pages to monitor (check for new file dates, "2026" text, or page changes):**
| County | URL to Monitor |
|--------|---------------|
| Harris | hcad.org/public-data (look for new data extract files) |
| Dallas | dallascad.org → Public Data → Data Downloads |
| Collin | collincad.org → Data Downloads |
| Tarrant | tad.org → Data Downloads |
| Denton | dentoncad.net → Appraisal Info |
| Rockwall | rockwallcad.com → Data |
| Travis | traviscad.org → Online Data / Data Downloads |
| Williamson | wcad.org → Data Extracts |
| Fort Bend | fbcad.org → Data & Reports |

#### B. Manual Check (Tomi)
- Follow each CAD on social media / sign up for email alerts
- Check local news (Houston Chronicle, Dallas Morning News, Austin Statesman) for "appraisal notices" articles
- Subscribe to Texas Comptroller property tax news

#### C. Google Alerts
Set up alerts for: `"2026 appraisal" site:hcad.org`, `"notice of appraised value" 2026 Texas`, etc.

### Precompute Time Estimates

Based on property counts and assuming similar pipeline to 2025:

| County | Properties | Est. Precompute Time |
|--------|-----------|---------------------|
| Harris | ~1.8M | 8–12 hours |
| Dallas | ~900K | 4–6 hours |
| Tarrant | ~700K | 3–5 hours |
| Travis | ~450K | 2–3 hours |
| Collin | ~400K | 2–3 hours |
| Denton | ~350K | 2–3 hours |
| Fort Bend | ~300K | 1.5–2.5 hours |
| Williamson | ~250K | 1–2 hours |
| Rockwall | ~40K | 15–30 min |

**Total: ~24–36 hours of compute** if run sequentially. Can parallelize.

⚠️ **Action (Lati):** Ensure precompute pipeline is ready to run before March 15. Test with one county's 2025 data to validate pipeline still works.

---

## 3. Go-to-Market Timing

### The Hot Window

```
        Feb          March         April              May
  ──────┼────────────┼─────────────┼──────────────────┼───
  NOW   |            |  Data drops | NOTICES MAILED   | May 15
  Brand |  Prep &    |  Precompute | ████████████████ | DEADLINE
  aware |  Monitor   |  Sprint     | HOT SELLING      |
  ness  |            |             | WINDOW           |
```

- **Feb 16 → Mar 15:** Brand awareness phase. Free estimates, lead capture, SEO content.
- **Mar 15 → Apr 1:** Data monitoring intensifies. Precompute pipeline on standby.
- **Apr 1 → May 15:** **THE WINDOW.** Homeowners receive notices, panic, Google "property tax protest." This is when we spend.

### Should We Sell NOW with 2025 Data?

**Yes, but carefully:**
- **DO:** Offer free property lookups / preliminary estimates using 2025 data to capture emails
- **DO:** Publish SEO content targeting "property tax protest [county] 2026"
- **DON'T:** Sell $49 evidence packets based on 2025 data as if they're for 2026 protests
- **Transition messaging:** "Enter your address to see your 2025 analysis. We'll notify you when 2026 values drop."

### Competitor Timing (Ownwell, NTPTS, CutMyTaxes)

- **Ownwell** ramps Google Ads aggressively in **March–April**. They blanket Texas media (see Dallas Morning News coverage April 2025). They push "free" homestead exemption filing as a lead-gen for their 25%-of-savings protest service.
- **NTPTS (North Texas Property Tax Services)** markets year-round but peaks **April–May**.
- **CutMyTaxes** focuses on Cook County IL primarily.
- All competitors have **year-round SEO content** that captures organic traffic; paid spend concentrates in the protest window.

**Our advantage:** $49 flat fee vs. 25–40% of savings. For a homeowner saving $500–$2,000, we're dramatically cheaper. This is the core message.

---

## 4. Advertising Strategy

### Channel Mix

| Channel | When | Budget/mo | Expected CPC | Notes |
|---------|------|-----------|-------------|-------|
| Google Ads (Search) | Apr 1 – May 15 | $2,000–5,000 | $2–5 | Target "property tax protest [county]", "protest appraisal [city]" |
| Facebook/Instagram | Mar 15 – May 15 | $1,000–2,000 | $0.50–1.50 | Target homeowners in our counties, 30–65 age |
| NextDoor | Apr 1 – May 15 | $500–1,000 | Varies | Hyperlocal, high intent |
| Local SEO / Content | NOW (ongoing) | $0 (time) | N/A | Blog posts, landing pages per county |
| Reddit (r/houston, r/dallas, etc.) | Apr 1 – May 15 | $0–500 | Organic + ads | Community posts, be helpful not spammy |

### CAC Math

- **Product price:** $49
- **Target CAC:** ≤ $15 (30% of revenue)
- **Stretch CAC:** ≤ $10 (20% of revenue)
- At $3 CPC and 10% conversion rate → **$30 CAC** ❌ too high
- At $3 CPC and 20% conversion rate → **$15 CAC** ✅ borderline
- At $2 CPC and 25% conversion rate → **$8 CAC** ✅ great

**Key insight:** We need high conversion rates because the product price is low. This means:
1. Landing pages must be excellent (show the actual value estimate immediately)
2. Free preview / address lookup is critical for conversion
3. Social proof (testimonials, success rates) matters enormously

### Lead Capture Strategy (Pre-Data)

**Starting NOW:**
1. Add email capture on getovertaxed.com: "Get notified when 2026 values drop"
2. Offer free 2025 analysis preview (no payment) to build email list
3. When 2026 data is ready, email blast the list → high-intent, low-cost conversions

⚠️ **Decision Point (Tomi):** Budget allocation — how much total are we willing to spend on the Apr–May push? Suggest $3K–$8K total across channels for first year.

---

## 5. Expansion vs. Depth

### Recommendation: Depth First

Focus marketing budget on existing 9 Texas counties. Reasons:
- Data is already precomputed
- These are the **largest metro areas in Texas** (Houston, DFW, Austin)
- Combined TAM covers **~5M+ residential properties**
- We haven't proven marketing → conversion yet; do that before expanding

### Total Addressable Market (Current Counties)

| County | Est. Residential Properties | If 5% convert | Revenue at $49 |
|--------|---------------------------|----------------|----------------|
| Harris | ~1.2M residential | 60,000 | $2.94M |
| Dallas | ~600K | 30,000 | $1.47M |
| Tarrant | ~500K | 25,000 | $1.23M |
| Travis | ~350K | 17,500 | $858K |
| Collin | ~300K | 15,000 | $735K |
| Denton | ~250K | 12,500 | $613K |
| Fort Bend | ~200K | 10,000 | $490K |
| Williamson | ~180K | 9,000 | $441K |
| Rockwall | ~30K | 1,500 | $74K |
| **Total** | **~3.6M** | **180,500** | **$8.8M** |

5% is aspirational long-term. Even 0.01% (360 sales) = $17,640 — covers ad spend.

### Quick-Win Expansion Candidates (Post-2026 Season)

- **Bexar County (San Antonio):** Already researched, waiting on PIA data. ~600K properties. High priority.
- **Montgomery County:** North of Houston, fast-growing. ~250K properties.
- **Brazoria County:** South Houston metro. ~130K properties.
- **Ellis / Kaufman / Johnson Counties:** DFW exurbs, growing fast.

---

## 6. Data Year Messaging

### Website Messaging (Now → Data Drop)

**Homepage banner:**
> "2026 protest season is coming! Enter your address to preview your property analysis. We'll have 2026 values ready as soon as your county releases them."

**Property lookup page:**
> "Showing 2025 appraised values. 2026 proposed values expected April 2026. We'll update automatically — check back or sign up for alerts."

### During Transition

- **DO NOT pause sales.** Some homeowners may still be protesting late 2025 values or want to understand their property's position.
- **Be transparent** about which year's data is shown.
- **Instant switch:** When 2026 data is precomputed for a county, flip the site to show 2026 and send email blast to that county's waitlist.

---

## 7. Cook County / Illinois Strategy

### 2026 Relevance

- **South Tri townships** are reassessed in 2026 — this is relevant!
- **City of Chicago & North Tri** — not reassessed until 2027/2028, but homeowners can still appeal annually
- Cook County appeals go through the Assessor's office, then Board of Review — different process than Texas

### Recommendation

- **Market Cook County separately** — different timeline, different messaging, different audience
- **South Tri is the opportunity** — reassessment notices will go out on a rolling basis throughout 2026
- **Deprioritize for now** — focus engineering and marketing on Texas for the April–May window, then turn attention to Cook County
- Cook County could be a year-round product given the rolling reassessment schedule

⚠️ **Decision Point (Tomi):** Invest time in Cook County marketing for 2026, or save it for 2027 (Chicago reassessment year = much bigger market)?

---

## 8. Action Items & Calendar

### February 2026 (NOW)

| Action | Owner | Due |
|--------|-------|-----|
| Add email capture / "notify me for 2026" on website | Lati | Feb 23 |
| Create county-specific landing pages for SEO | Lati | Feb 28 |
| Set up Google Alerts for each CAD + "2026 appraisal" | Tomi | Feb 20 |
| Verify precompute pipeline works (test run on 2025 data) | Lati | Feb 28 |
| Write 3–5 blog posts targeting "property tax protest [county] 2026" | Tomi | Feb 28 |
| **DECIDE:** Total ad budget for April–May push | Tomi | Feb 28 |

### March 2026

| Action | Owner | Due |
|--------|-------|-----|
| Begin automated CAD page monitoring (cron every 6h) | Lati | Mar 1 |
| Start Facebook/Instagram brand awareness ads (low budget, $10–20/day) | Tomi | Mar 15 |
| Set up Google Ads campaigns (paused, ready to activate) | Tomi | Mar 15 |
| Monitor for early 2026 value notices from any CAD | Both | Ongoing |
| Precompute pipeline: hot standby | Lati | Mar 15 |

### April 2026

| Action | Owner | Due |
|--------|-------|-----|
| **DATA DROP:** As each county releases 2026 data, run precompute immediately | Lati | ASAP per county |
| Activate Google Ads for counties with 2026 data ready | Tomi | Within 24h of data ready |
| Email blast waitlist per county as data goes live | Lati | Within 24h of data ready |
| Ramp paid spend — this is the window | Tomi | Apr 1–May 10 |
| Post on Reddit, NextDoor, local Facebook groups | Tomi | Apr 1–15 |
| Monitor ad performance, adjust bids/targeting daily | Tomi | Ongoing |

### May 2026

| Action | Owner | Due |
|--------|-------|-----|
| **May 10:** Start "5 days left" urgency messaging | Both | May 10 |
| **May 15:** DEADLINE — final push | Both | May 15 |
| May 16: Pause all ads, do retrospective | Both | May 16 |
| Analyze season performance: sales, CAC, revenue, conversion rates | Both | May 20 |

---

## 9. Risk Factors & Contingencies

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| CAD delays 2026 data release past April 15 | Medium | High — shortens our window | Precompute pipeline must be ready to run in <24h; consider selling 2025 analysis as fallback |
| Precompute pipeline breaks with 2026 data format | Low | High | Test pipeline with 2025 data by Feb 28; keep 2025 schema documentation current |
| Ownwell/competitors outspend us on ads | High | Medium | Focus on differentiation ($49 flat fee vs. 25%), SEO, and organic/community channels |
| Low conversion rate makes paid ads unprofitable | Medium | High | Set strict CAC limit ($15); kill underperforming campaigns fast; rely on organic/email |
| Website goes down during peak | Low | Critical | Load test before April; ensure Cosmos DB can handle traffic spikes |
| May 15 falls on a Friday (2026: it's a Friday ✅) | N/A | Positive — full business week before deadline | N/A |

---

## 10. Key Decisions Needed from Tomi

1. **Ad Budget:** How much total for April–May paid push? (Suggested: $3K–$8K)
2. **Cook County:** Market South Tri 2026, or wait for Chicago 2027?
3. **Free Estimates:** Offer free preview lookups now (costs compute, builds list) or save for 2026 data?
4. **Bexar County:** Pursue PIA data for 2026 season or punt to 2027?
5. **Pricing:** Stay at $49, or test $39/$29 to maximize volume in first season?

---

## 11. Success Metrics for 2026 Season

| Metric | Target |
|--------|--------|
| Email waitlist signups (pre-season) | 1,000+ |
| Total evidence packets sold | 500+ |
| Revenue | $24,500+ |
| Customer acquisition cost | ≤ $15 |
| Conversion rate (visitor → purchase) | ≥ 15% |
| Counties with 2026 data live by Apr 15 | 9/9 |

---

*This is a living document. Update as data releases happen and decisions are made.*
