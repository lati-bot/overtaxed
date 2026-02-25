# Precompute Script Audit — Comparable Property Selection Quality

**Date:** February 18, 2026  
**Auditor:** Automation (subagent)  
**Deadline context:** May 15, 2026 protest filing deadline  
**Purpose:** Evaluate whether our precomputed comps would survive scrutiny at an ARB hearing

---

## Executive Summary

**Overall Grade: C+**

Our comp selection is *functional but fragile*. The core approach — same neighborhood, similar size, sorted by lowest $/sqft — is the right skeleton for a §42.26 equity protest. But there are enough gaps that a prepared ARB panel or district appraiser could pick apart our evidence. The biggest risks:

1. **±25% sqft filter is too loose** (industry standard is ±20%)
2. **Zero age/year-built filtering** — a 1960 ranch vs. 2022 new construction would match
3. **Cherry-picking the 5 lowest $/sqft** — obvious advocacy bias an ARB will spot
4. **No fallback strategy** when neighborhoods have few properties
5. **Rockwall has no sqft data at all** — comps are based solely on value proximity

None of these are fatal for an automated mass-protest tool, but they limit our credibility for borderline cases where the ARB is looking for reasons to deny.

---

## 1. Houston (Harris County — HCAD)

**Script:** `property-tax-appeal/houston/precompute_houston.py`

### Current Methodology Summary
Groups properties by HCAD `Neighborhood_Code`. Filters comps to ±25% sqft within the same neighborhood. Selects the 5 lowest $/sqft properties as comps. Calculates fair value as neighborhood median $/sqft × subject sqft.

### Comp Selection Criteria

| Criterion | Value | Notes |
|-----------|-------|-------|
| Area grouping | `Neighborhood_Code` | HCAD's own neighborhood delineation |
| Size filter | ±25% sqft | Looser than standard |
| Age filter | **None** | ❌ Critical gap |
| Value filter | None | Implicit via neighborhood |
| Comp count | 5 | Reasonable |
| Sort/rank | Lowest $/sqft first | Cherry-picking bias |

### Strengths
- Uses HCAD's official neighborhood codes, which are the same groupings the district uses internally — good alignment with how HCAD appraisers think
- Median $/sqft is a defensible metric for equity protests under Texas Property Tax Code §42.26
- Residential filter (`state_class` starting with A or B) correctly excludes commercial/industrial
- Simple, fast, reliable — processes hundreds of thousands of properties

### Weaknesses
- **No year-built filter.** A 1955 home will be compared to a 2023 home if they're in the same neighborhood and similar sqft. An appraiser will dismiss this immediately.
- **±25% sqft is wide.** A 2,000 sqft subject matches 1,500–2,500 sqft comps. That's a 1,000 sqft spread. Professional appraisals use ±15-20%.
- **Cherry-picks lowest 5 comps.** This is the #1 thing ARB panelists are trained to spot. Taking the bottom 5 is advocacy, not analysis. A more credible approach: take comps around the median or lower quartile.
- **No fallback.** If a neighborhood has only 3 properties in range, we return 3 comps with no attempt to widen the search to adjacent neighborhoods or `Neighborhood_Grp`.
- **Fair value uses floor-median** (`values[len(values) // 2]`), not true median. For even-length arrays, should average the two middle values. Minor but technically incorrect.
- **Houston comps don't include year_built, beds, baths** in comp output — less useful for evidence packets.
- **No quality code matching.** HCAD has a `qa_cd` (quality code) field that's parsed but never used for filtering.

### Recommended Improvements

1. **Add year-built filter** (±15 years):
```python
year_min = year_built - 15 if year_built > 0 else 0
year_max = year_built + 15 if year_built > 0 else 9999
# Add to comp candidate filter
```

2. **Tighten sqft to ±20%:**
```python
sqft_min = sqft * 0.80
sqft_max = sqft * 1.20
```

3. **Select comps at lower quartile, not absolute bottom:**
```python
# Instead of comps[:limit], take from the 25th percentile range
quartile_idx = len(comps) // 4
comps = comps[max(0, quartile_idx-2):quartile_idx+3]
```

4. **Add fallback to `Neighborhood_Grp`** when <5 comps found in `Neighborhood_Code`.

5. **Include year_built, beds, baths, quality** in comp output for evidence packet generation.

### Priority: **HIGH**
Houston is our largest market. Weak comps here affect the most users.

---

## 2. Dallas (Dallas County — DCAD)

**Script:** `property-tax-appeal/dallas/precompute_dallas.py`

### Current Methodology Summary
Groups by DCAD `NBHD_CD` (neighborhood code). Filters comps to ±25% sqft within the same neighborhood. Takes the 5 lowest $/sqft. Fair value = neighborhood median $/sqft × subject sqft. Tax rate 2.2%.

### Comp Selection Criteria

| Criterion | Value | Notes |
|-----------|-------|-------|
| Area grouping | `NBHD_CD` | DCAD neighborhood code |
| Size filter | ±25% sqft | Looser than standard |
| Age filter | **None** | ❌ Data available but not used |
| Value filter | None | |
| Comp count | 5 | |
| Sort/rank | Lowest $/sqft first | Cherry-picking |

### Strengths
- **Richest data of all counties.** Has beds, baths, pool, fireplaces, exterior wall type, stories, building class — all parsed and stored in comps output.
- Excludes `UNASSIGNED` neighborhoods (good hygiene)
- Comp output includes `yearBuilt`, `beds`, `baths` — useful for evidence even though not filtered on
- Properly deduplicates (first building per account for main residence)
- Good rate limiting and progress tracking

### Weaknesses
- **Has year_built, beds, baths, pool, exterior data but DOESN'T FILTER on any of it.** This is the biggest missed opportunity. The data is RIGHT THERE.
- Same ±25% / cherry-pick-bottom-5 issues as Houston
- No fallback for thin neighborhoods
- `UNASSIGNED` properties get no comps at all and their fair_val = current_val (no reduction ever calculated)
- Mentions "city-level fallback" in a log message but **doesn't actually implement it**

### Recommended Improvements

1. **Use the data you have!** Filter on year_built ±15 years at minimum.
2. **Filter or note pool status.** Pool vs. no-pool is a major value difference ($20K-$50K). At minimum, prefer same pool status; at best, adjust.
3. **Building class matching.** Compare single-family to single-family, not single-family to duplex.
4. **Actually implement the city-level fallback** mentioned in the log message.
5. Same sqft tightening (±20%) and comp selection improvements as Houston.

### Priority: **HIGH**
Dallas has the best data and the weakest excuse for not using it.

---

## 3. Austin (Travis County — TCAD)

**Script:** `property-tax-appeal/austin/precompute_austin.py`

### Current Methodology Summary
Groups by TCAD `hood_cd` (neighborhood code) from PACS fixed-width PROP.TXT. Filters comps to ±25% sqft. Takes 5 lowest $/sqft. Fair value = neighborhood median $/sqft × subject sqft. Tax rate 1.8%.

### Comp Selection Criteria

| Criterion | Value | Notes |
|-----------|-------|-------|
| Area grouping | `hood_cd` | TCAD neighborhood code from PACS |
| Size filter | ±25% sqft | |
| Age filter | **None** | Data available in IMP_DET.TXT |
| Value filter | None | |
| Comp count | 5 | |
| Sort/rank | Lowest $/sqft first | |

### Strengths
- Thorough parsing of PACS fixed-width format with well-documented byte positions
- Extracts beds, baths, pool, fireplace from IMP_DET.TXT floor/feature records
- Correctly accumulates sqft from multiple floor records (1st Floor + 2nd Floor, etc.)
- Takes earliest year_built across multiple improvements (conservative/correct)
- Parallel upload with ThreadPoolExecutor (faster than Houston's sequential approach)
- Uses appraised_val as primary, falls back to assessed_val

### Weaknesses
- Same core issues: no age filter, loose sqft, cherry-picked lowest comps
- Has pool/fireplace/bed/bath data but doesn't filter on any of it
- **Tax rate of 1.8% may be low.** Travis County effective rates for many jurisdictions (city of Austin + AISD) are closer to 1.9-2.1%. Using 1.8% understates savings, which is conservative but could undersell the product.
- No fallback for thin neighborhoods
- Large file parsing (4.2GB PROP.TXT) — no streaming or chunking concern, but memory usage could be significant

### Recommended Improvements

1. **Year-built filter** from IMP_DET data (already parsed, just not used in `find_comps`)
2. **Review tax rate.** 1.8% is on the low end. Consider using 1.95% as a more representative average, or better yet, calculate per-ISD rates.
3. Same ±20% sqft tightening and comp selection improvements
4. Consider filtering out condos/townhomes from single-family comps (or matching property type)

### Priority: **MEDIUM**
Austin methodology is identical to Houston/Dallas but data is good. Lower priority because Travis County tax rates mean smaller dollar savings per property.

---

## 4. Bexar County (BCAD)

**Script:** `property-tax-appeal/bexar/precompute_bexar.py`

### Current Methodology Summary
Groups by `hood_cd` from PACS data (identical format to Travis/Austin). Filters comps to ±25% sqft. Takes 5 lowest $/sqft. Fair value = median $/sqft × subject sqft. Tax rate 2.1%. Handles supplemental records by keeping highest `sup_num`.

### Comp Selection Criteria

| Criterion | Value | Notes |
|-----------|-------|-------|
| Area grouping | `hood_cd` | PACS neighborhood code |
| Size filter | ±25% sqft | |
| Age filter | **None** | |
| Value filter | None | |
| Comp count | 5 | |
| Sort/rank | Lowest $/sqft first | |

### Strengths
- **Handles supplemental appraisals correctly.** Takes highest `sup_num` per property — this is a real-world data quality issue that Houston/Dallas don't face but Bexar does. Good.
- Same PACS parsing as Austin with broader `FLOOR_DESCS` set including `'Living Area'`, `'Living Area 2nd Level'`, `'Additional Living Area'`, `'Detached Living Area 1'`, `'MULTIPLE RESIDENCE'` — catches more Bexar-specific floor type descriptions
- Tracks and reports count of properties with savings ≥ $250/yr (useful business metric)
- Pool detection includes spa/hot tub (broader than Austin's)

### Weaknesses
- **Fair value calculated inline** (not in a separate `calculate_fair_assessment` function like other counties) — inconsistency but not a quality issue
- Same core methodology weaknesses as all others
- No age filter despite having year_built data
- `MULTIPLE RESIDENCE` in FLOOR_DESCS could inadvertently include multi-family living area in sqft — might inflate sqft for some properties

### Recommended Improvements

1. **Verify `MULTIPLE RESIDENCE` floor type.** This could be counting guest houses or second dwelling units, inflating the sqft and making the property appear more "similar" to larger homes than it actually is.
2. Same standard improvements: ±20% sqft, year-built filter, less aggressive comp selection
3. Consider extracting `calculate_fair_assessment` into a shared function for consistency

### Priority: **MEDIUM**
Bexar works but has the same gaps. The supplemental handling is a nice touch.

---

## 5. Rockwall County (RCAD)

**Script:** `property-tax-appeal/rockwall/precompute_rockwall.py`

### Current Methodology Summary
Parses GIS shapefile (DBF). Groups by `marketarea`. **Has no sqft or year_built data.** Comps are matched by ±25% of market value within the same market area. Fair value = neighborhood **median market value** (not $/sqft). Tax rate 2.19%, with 5-year savings multiplier.

### Comp Selection Criteria

| Criterion | Value | Notes |
|-----------|-------|-------|
| Area grouping | `marketarea` | From GIS shapefile |
| Size filter | **None** | ❌ No sqft data available |
| Age filter | **None** | ❌ No year_built data available |
| Value filter | ±25% of market value | Only filter used |
| Comp count | 5 | |
| Sort/rank | Lowest assessed value first | |

### Strengths
- **Honest about limitations.** Script documents that sqft/year_built are unavailable from the shapefile source.
- Proper deduplication (keeps higher value on duplicate prop_ids)
- Filters out exempt market areas and properties with no improvements (land-only)
- Minimum $50K value threshold removes noise
- 429/rate-limit retry logic with exponential backoff — most robust upload of all scripts
- 5-year savings multiplier (only county that calculates this — and it's correct for Texas)

### Weaknesses
- **THIS IS THE WEAKEST SCRIPT BY FAR.** Without sqft, comps are meaningless for a serious protest. A 1,200 sqft starter home and a 3,500 sqft custom home in the same market area at similar values would be "comparable." No appraiser would accept this.
- **Fair value = neighborhood median value.** This means EVERY property above the median gets flagged for a reduction, and every property below gets fair_val = current_val. This is statistically guaranteed to flag ~50% of properties regardless of whether they're actually overassessed. It's not wrong for equity theory, but it's crude.
- No $/sqft calculation possible — can't generate the strongest equity argument
- Comps have `sqft: 0` and `psf: 0` — looks broken in the output
- Cannot generate a proper §42.26 evidence packet without sqft

### Recommended Improvements

1. **CRITICAL: Get sqft data.** Options:
   - Scrape RCAD property detail pages (they show sqft online)
   - File a PIA request specifically for the improvement detail file
   - Cross-reference with Zillow/Redfin APIs for sqft estimates
   - Use the RCAD PACS system if they have one (they might use the same PACS as Bexar/Travis)
2. **Until sqft is available,** add more filters:
   - Match by subdivision (`ascode`) as a secondary grouping
   - Use improvement_val / market_val ratio as a proxy for property type similarity
   - Consider land_val as a proxy for lot size similarity
3. **Fair value should NOT be raw median.** Even without sqft, use improvement value ratios or land-to-improvement ratios for a more nuanced assessment.
4. **5-year multiplier is good** — consider adding this to other counties.

### Priority: **CRITICAL**
Rockwall comps are essentially unusable for a real protest. Either get sqft data or remove Rockwall from the product until we can do it right.

---

## Cross-County Comparison

### Methodology Consistency

| Feature | Houston | Dallas | Austin | Bexar | Rockwall |
|---------|---------|--------|--------|-------|----------|
| Neighborhood grouping | ✅ HCAD code | ✅ DCAD code | ✅ PACS hood_cd | ✅ PACS hood_cd | ✅ market area |
| Sqft filter | ±25% | ±25% | ±25% | ±25% | ❌ None |
| Year-built filter | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pool/feature filter | ❌ | ❌ | ❌ | ❌ | ❌ |
| Comp count | 5 | 5 | 5 | 5 | 5 |
| Sort method | Lowest $/sqft | Lowest $/sqft | Lowest $/sqft | Lowest $/sqft | Lowest value |
| Fair value method | Median $/sqft × sqft | Median $/sqft × sqft | Median $/sqft × sqft | Median $/sqft × sqft | Median value |
| Tax rate | 2.2% | 2.2% | 1.8% | 2.1% | 2.19% |
| Multi-year savings | ❌ | ❌ | ❌ | ❌ | ✅ 5yr |
| Fallback strategy | ❌ | ❌ | ❌ | ❌ | ❌ |
| Beds/baths in output | ❌ | ✅ | ✅ | ✅ | ❌ |
| Pool in output | ❌ | ✅ | ✅ | ✅ | ❌ |
| Year built in output | ❌ | ✅ | ✅ | ✅ | ❌ |
| Parallel upload | ❌ | ❌ | ✅ | ✅ | ✅ |
| Retry logic | ❌ | ❌ | ❌ | ❌ | ✅ |

### Key Divergences

1. **Houston is the least detailed.** Doesn't output year_built, beds, baths, or pool for comps — even though building_res.txt likely has this data.

2. **Dallas has the richest data but doesn't use it.** Has pool, fireplace, exterior wall, stories, building class — none of it feeds into comp selection.

3. **Austin and Bexar are near-identical** (both PACS format). Bexar has slightly broader floor type recognition and supplemental record handling.

4. **Rockwall is fundamentally different** — no sqft means a completely different (and much weaker) methodology.

5. **Tax rates are inconsistent in approach.** Four counties use hardcoded rates. Only Rockwall defines it as a named constant. None calculate per-jurisdiction rates (city vs. unincorporated, different ISDs).

6. **Multi-year savings only in Rockwall.** The 5-year multiplier is correct for Texas (you can claim savings for the current year plus 4 prior years if overassessed). This should be in ALL counties.

---

## Missing Adjustments — Are Unadjusted Comps Acceptable?

### For §42.26 Equity Protests: YES, with caveats

Texas Property Tax Code §42.26(a)(3) allows protest based on "the appraised value of other properties in the same appraisal district that are comparable to the subject property and are equitably appraised." The statute doesn't require adjustments — you're comparing appraised values, not market values.

**However:**
- The stronger the similarity between comps, the less need for adjustments
- If comps differ significantly in size, age, or features, an ARB panel CAN and WILL ask "but did you adjust for the pool?" or "this comp is 20 years newer"
- Adjusted comps are always stronger than unadjusted
- For an automated tool at scale, unadjusted is acceptable but limits the "hit rate" on borderline cases

### Adjustments We Should Consider (in priority order)

1. **Size adjustment** — $/sqft naturally handles this if comps are tight enough. At ±20%, the implicit adjustment is acceptable.
2. **Age/condition adjustment** — $2-5/sqft per decade of age difference is a common rule of thumb. This would strengthen cases significantly.
3. **Pool adjustment** — $15,000-$30,000 flat adjustment. Important in Dallas/Bexar where we have the data.
4. **Quality grade adjustment** — Houston has `qa_cd`, could adjust for quality differences.

### Recommendation
For V1, keep unadjusted but **tighten filters** to make adjustments unnecessary. For V2, add simple rule-of-thumb adjustments for age and pool.

---

## Tax Rate Accuracy

| County | Script Rate | Actual Range (2024-2025) | Assessment |
|--------|------------|--------------------------|------------|
| Harris | 2.2% | 1.8% – 2.8% | ⚠️ Reasonable average, but varies by jurisdiction |
| Dallas | 2.2% | 1.9% – 2.7% | ⚠️ Same concern |
| Travis | 1.8% | 1.7% – 2.2% | ⚠️ Low end; City of Austin + AISD is ~2.0% |
| Bexar | 2.1% | 1.8% – 2.5% | ⚠️ Reasonable |
| Rockwall | 2.19% | 2.0% – 2.4% | ✅ Most accurate |

**Recommendation:** Use ISD + city code data (available in most datasets) to calculate jurisdiction-specific tax rates instead of county-wide averages. This would make savings estimates significantly more accurate and credible.

---

## Edge Cases Analysis

### Very Large Homes (>5,000 sqft)
- ±25% filter means a 5,000 sqft home matches 3,750–6,250 sqft. In most neighborhoods, there are very few properties in this range.
- Likely returns 0-2 comps with no fallback.
- **Fix:** For homes >4,000 sqft, widen to ±30% or fall back to broader area.

### Very Small Homes (<800 sqft)
- ±25% means 600–1,000 sqft. Small range, small pool of candidates.
- These are often unusual properties (efficiency apartments, tiny homes, converted garages).
- **Fix:** Floor at minimum 200 sqft range (e.g., 600 sqft home matches 500–800, not 450–750).

### Huge Lots / Multiple Structures
- Houston only takes first building per account. Multi-structure properties get incomplete sqft.
- Land value differences not accounted for (a 0.5 acre lot vs. 5 acre lot in same neighborhood are treated identically).
- **Fix:** Consider land_val/sqft ratio as a secondary filter, or flag large lot properties for manual review.

### <5 Comps in Neighborhood
- Currently returns whatever is available (could be 0-4 comps).
- No warning flag on the output document.
- **Fix:** Add a `comp_confidence` field: "high" (5+ comps), "medium" (3-4), "low" (1-2), "none" (0). Fall back to adjacent neighborhoods for "low"/"none".

### New Construction
- A 2024-built home in a neighborhood of 1980s homes will match on sqft but the comps will be much older.
- New construction is often appraised higher (rightfully so) — our median $/sqft approach would suggest reducing their value to the neighborhood median, which is incorrect.
- **Fix:** Age filter would solve this. Also consider flagging properties where year_built is within 2 years of current year as "new construction — comps may not apply."

---

## Priority Action Items

### Critical (Before May 15)
1. **Get sqft data for Rockwall** or remove it from the product
2. **Add year-built filter (±15 years)** to Houston, Dallas, Austin, Bexar
3. **Tighten sqft to ±20%** across all counties

### High (Before May 15 if possible)
4. **Stop cherry-picking bottom 5 comps.** Use lower quartile or median-anchored selection.
5. **Add `comp_confidence` score** based on number of qualified comps found
6. **Add multi-year savings (5yr)** to Houston, Dallas, Austin, Bexar
7. **Include year_built, beds, baths** in Houston comp output

### Medium (V2)
8. **Implement neighborhood fallback** (expand to neighborhood group / adjacent area)
9. **Per-jurisdiction tax rates** instead of county averages
10. **Pool adjustment** for Dallas and Bexar (where we have the data)
11. **Building class / property type matching** (single-family vs. townhome vs. condo)

### Low (V2+)
12. **Age-based $/sqft adjustments** ($2-5/sqft per decade)
13. **Quality grade matching** (Houston `qa_cd`)
14. **Land value ratio as secondary filter**
15. **Shared comp-finding module** to reduce code duplication across 5 scripts

---

## Bottom Line

Our comps are **good enough to generate leads** and show homeowners they're likely overtaxed. They are **NOT good enough to be the sole evidence at a contested ARB hearing** without a human reviewing them first.

For a self-service tool where most users settle informally (which is the vast majority of Texas protests), this works. For generating formal evidence packets that go to panel hearings, we need the Critical and High items above.

The good news: the infrastructure is solid, the data is mostly there (except Rockwall sqft), and the fixes are straightforward filter additions — not architectural changes. Two days of focused work could address all Critical and High items.
