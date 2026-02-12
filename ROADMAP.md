# Overtaxed — Product Roadmap & Market Intelligence

*Last updated: February 12, 2026*

---

## Markets Overview

### Live on Production (getovertaxed.com)

| Market | County | Properties | Data Quality | Status |
|--------|--------|:---:|:---:|:---:|
| Chicago, IL | Cook | 971,738 | ⭐⭐⭐⭐⭐ | ✅ Live |
| Houston, TX | Harris | 1,165,980 | ⭐⭐⭐ | ✅ Live |
| Dallas, TX | Dallas | 631,846 | ⭐⭐⭐⭐⭐ | ✅ Live |

### Built (On Dev Branch)

| Market | County | Properties | Data Quality | Status |
|--------|--------|:---:|:---:|:---:|
| Austin, TX | Travis | 382,088 | ⭐⭐⭐⭐ | 🟡 QA Needed |

### Researched (Ready to Build)

| Market | County | Properties | Data Quality | Status |
|--------|--------|:---:|:---:|:---:|
| Plano / Frisco / McKinney, TX | Collin | 377,599 | ⭐⭐⭐⭐ | 📊 Data Analyzed |
| Fort Worth, TX | Tarrant | 662,396 | ⭐⭐⭐½ | 📊 Data Analyzed |

### Future (Not Yet Sourced)

| Market | County | Est. Properties | Data Status | Priority |
|--------|--------|:---:|:---:|:---:|
| Denton / Lewisville, TX | Denton | ~350-400K | ❓ Needs Investigation | High (completes DFW) |
| San Antonio, TX | Bexar | ~600-700K | ❓ Needs Investigation | Medium |
| Other TX counties | Various | Varies | data.texas.gov may have | Low |
| Atlanta, GA | Fulton/DeKalb | ~1.5M | Phase 3 | Future |
| Florida counties | Various | Large | Phase 3 | Future |

---

## Data Coverage — Field-by-Field Comparison

### Currently Loaded Markets

| Field | Cook County (IL) | Houston (TX) | Dallas (TX) | Austin (TX) |
|-------|:---:|:---:|:---:|:---:|
| **Properties** | 971K | 1.17M | 632K | 382K |
| **Status** | ✅ Live | ✅ Live | ✅ Live | 🟡 Dev |
| Address | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% |
| City / Zip | ✅ | ✅ | ✅ | ✅ |
| Sqft | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% |
| Year Built | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% |
| Bedrooms | ✅ 100% | ❌ **Not available** | ✅ ~100% | ⚠️ 34% |
| Bathrooms | ✅ 100% | ❌ **Not available** | ✅ ~100% | ⚠️ 91% |
| Stories | ✅ | ❌ | ✅ | ✅ |
| Pool | ✅ | ❌ | ✅ | ⚠️ 24% |
| Fireplaces | ✅ | ❌ | ✅ | ⚠️ 64% |
| Ext Wall | ✅ | ❌ | ✅ | ✅ |
| Neighborhood Code | ✅ | ✅ | ✅ | ✅ |
| Market Value | ✅ | ✅ | ✅ | ✅ |
| Land / Impr Split | ✅ | ✅ | ✅ | ✅ |
| Quality Grade | — | — | — | — |
| Condition Rating | — | — | — | — |

### Next Two Markets (Researched)

| Field | Collin (TX) | Tarrant (TX) |
|-------|:---:|:---:|
| **Properties** | 377K | 662K |
| Address | ✅ 99.96% | ✅ 100% |
| City / Zip | ✅ 100% | ✅ 100% |
| Sqft | ✅ 95.4% | ✅ 93% |
| Year Built | ✅ 95.4% | ✅ 93% |
| Bedrooms | ⚠️ 93-98% *(MDB only)* | ❌ **Permanently N/A** |
| Bathrooms | ⚠️ 93-98% *(MDB only)* | ❌ **Permanently N/A** |
| Stories | ⚠️ 93-98% *(MDB only)* | ✅ 93% |
| Pool | ✅ flag | ✅ flag |
| Fireplaces | ❌ | ❌ |
| Ext Wall | ❌ | ❌ |
| Neighborhood Code | ✅ 100% (2,619 nbhds) | ✅ 100% |
| Market Value | ✅ 100% | ✅ 98% |
| Land / Impr Split | ✅ | ✅ 92-96% |
| Quality Grade | — | ✅ 93% |
| Condition Rating | — | ✅ 93% |

**Collin note**: Beds/baths/stories require joining two data sources (Socrata API + MDB from collincad.org). The Socrata API alone doesn't have them.

**Tarrant note**: TAD explicitly marked beds/baths as "No longer Used" in their data exports. Their CAMA system transitions to "True Prodigy" on March 3, 2026 — beds/baths *may* become available after that.

---

## Is Beds/Baths Truly Unavailable — Or Just Not in Our Data?

### Houston (Harris County)
**Confirmed: NOT in any HCAD public data file.** We checked every file HCAD distributes:
- `building_res.txt` — has sqft, year built, quality code. **No beds/baths columns.**
- `structural_elem1.txt` / `structural_elem2.txt` — has wall type, foundation, HVAC, condition, grade. **No beds/baths codes.**
- `exterior.txt` — has area breakdowns (base area, garage, porch). **No beds/baths.**
- `extra_features.txt` — has feature codes (carport, shed, pool). **No beds/baths.**

HCAD simply doesn't track or export bedroom/bathroom counts. This is a data collection decision by Harris County — they don't consider it necessary for mass appraisal.

### Tarrant County
**Confirmed: Fields exist but permanently zeroed.** TAD's documentation explicitly says "No longer Used" for both `Num_Bedrooms` and `Num_Bathrooms`. The columns exist in the file format but every value is 0.

### Austin (Travis County)
**Available but incomplete.** TCAD tracks beds (34%), baths (91%). The bedroom gap is because TCAD's IMP_DET.TXT encodes rooms as area components — bedrooms are only recorded when individually sketched, which many older appraisals skip.

### Collin County
**Available in the full MDB database export** (93-98%), just not in the simplified Socrata API view. Fixable with dual-source ETL.

---

## Expert Panel: Do We Need Beds/Baths for Excellence?

### 🏛️ The Government Appraiser's Perspective
*"What does the ARB panel actually look at?"*

The Appraisal Review Board evaluates protests under Texas Tax Code §42.26 — the "uniform and equal" standard. The legal test is:

> **"The appraised value of the property exceeds the median appraised value of a reasonable number of comparable properties appropriately adjusted."**

Key word: **"appropriately adjusted."** The statute doesn't define what "comparable" means — it's judgment. But in practice, ARB panels and SOAH judges consistently weight:

1. **Location** (same neighborhood or subdivision)
2. **Size** (similar sqft — typically ±15-20%)
3. **Age** (similar year built — typically ±10 years)
4. **Condition/quality** (similar grade)
5. **Property type** (SFR vs condo vs townhome)

Bedroom and bathroom counts are considered **secondary adjusters** — they help refine, but they don't make or break the case.

**Verdict**: An ARB panel will NOT reject a protest because it lacks bed/bath data. They WILL reject it if the comps aren't in the same neighborhood or are wildly different in size.

### ⚖️ The Property Tax Attorney's Perspective
*"What do professionals like Ownwell, NTPTS, and O'Connor file?"*

Professional property tax firms file **thousands** of protests per year in Harris County — where beds/baths aren't available to anyone. Their filings focus on:

- **$/sqft analysis** across the neighborhood (the core of §42.26)
- **Equity grids** showing similarly-valued properties assessed lower
- **Sales comps** with time adjustments
- **Data corrections** (wrong sqft, wrong year built)

Ownwell filed **137,649 DFW protests in 2025** — a 106% increase YoY. They charge ~25% contingency and succeed at scale. Their entire model works on automated $/sqft analysis.

**Verdict**: Beds/baths make a packet *look* more thorough, but the legal argument doesn't depend on them. The $/sqft variance IS the argument.

### 📋 Deji's Real Protest (2906 Newington Ln, Houston)
*"What did an actual successful protest look like?"*

Deji's evidence letter used THREE arguments:

**1. Data Error (Square Footage)**
- HCAD had 1,942 sqft but the builder model is 1,779 sqft
- This is the strongest argument — factual correction

**2. Market Sales ($/sqft)**
- 3 comps in same subdivision: $138-$154/sqft
- Average: $144/sqft
- His assessment was at $172/sqft — way above market

**3. Uniform & Equal (§42.26)**
- 4 identical models on adjacent streets assessed $4-10K lower
- Peer median: $326,780
- His request ($312K) safely below that

**Did he use beds/baths?** He mentioned sqft (1,779), the builder model name ("Denver"), and quality grade (C+). **He did NOT list bedroom or bathroom counts anywhere in his evidence.** His case was entirely built on $/sqft, sales data, and equity comparisons.

**Verdict**: Real-world successful protest without beds/baths. The case was strong because of precise $/sqft analysis and data corrections.

### 👤 The Customer's Perspective
*"What does a homeowner expect to see?"*

When a homeowner pays $49 for a protest packet, they expect it to feel **comprehensive and professional**. If they see their property details and it says "Bedrooms: N/A" while Zillow shows 4 bedrooms — that feels incomplete, even if it doesn't affect the legal argument.

**Options:**
1. **Omit the field entirely** for markets that don't have it (Houston, Tarrant) — don't show "N/A", just don't display the row
2. **Source from a third party** (Zillow, Realtor.com, MLS) to supplement — adds complexity
3. **Show what we have** and frame it around what matters: "Your home's $/sqft vs neighborhood median"

**Verdict**: The customer wants to feel confident. The best approach is probably (1) — omit rather than show gaps — combined with strong framing around what DOES matter. Our packet should educate them that $/sqft is the legal standard, not bedroom count.

---

## What's Needed for Excellence

Based on all four perspectives, here's what actually matters ranked by impact:

| Priority | What | Why | Do We Have It? |
|:---:|-------|-----|:---:|
| 🔴 1 | Neighborhood-level $/sqft analysis | THE core of §42.26 | ✅ All markets |
| 🔴 2 | Accurate sqft | Denominator of the whole argument | ✅ All markets (93-100%) |
| 🔴 3 | Current appraised value | The number being protested | ✅ All markets |
| 🟠 4 | Comparable properties in same neighborhood | "Similarly situated" requirement | ✅ All markets |
| 🟠 5 | Year built matching | Age-adjusts comps | ✅ All markets (93-100%) |
| 🟡 6 | Quality/condition grade | Refines comp similarity | ✅ Tarrant, partial others |
| 🟡 7 | Stories matching | Refines comp similarity | ✅ Most markets |
| 🟢 8 | Bedrooms / Bathrooms | Nice-to-have, not legally required | ⚠️ Varies by market |
| 🟢 9 | Pool / fireplaces / ext wall | Minor value adjustments | ⚠️ Varies by market |
| ⚪ 10 | Sales data / MLS comps | Strongest for market value argument | ❌ Not available (public record varies) |

### The Real Gap: Sales Data
Honestly, beds/baths is a minor gap. The **bigger gap** for maximum excellence would be recent sales data (MLS comps). That's what Deji used most effectively — showing what houses actually SOLD for. This is harder to get (MLS access, public deed records) but would dramatically strengthen the product across ALL markets.

---

## DFW Mega-Market Progress

**Goal**: Cover all of DFW — marketable as "We cover the entire Dallas-Fort Worth metro"

| County | Properties | Status | Remaining Work |
|--------|:---:|:---:|-----|
| Dallas | 632K | ✅ Live | Done |
| Collin | 377K | 📊 Researched | Precompute (dual-source ETL), frontend |
| Tarrant | 662K | 📊 Researched | Precompute (join 2 files), frontend |
| Denton | ~350-400K | ❓ Not sourced | Find data, precompute, frontend |
| **Total** | **~2M+** | | |

**All 4 counties = complete DFW coverage.**

---

## Total Properties If All Planned Markets Launch

| Market | Properties |
|--------|:---:|
| Cook County (Chicago) | 971,738 |
| Harris County (Houston) | 1,165,980 |
| Dallas County | 631,846 |
| Travis County (Austin) | 382,088 |
| Collin County | 377,599 |
| Tarrant County (Fort Worth) | 662,396 |
| Denton County (est.) | ~375,000 |
| **Total** | **~4.57M** |

At 0.1% conversion = ~$224K revenue
At 0.5% conversion = ~$1.12M revenue
At 1.0% conversion = ~$2.24M revenue
