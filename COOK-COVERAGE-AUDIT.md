# Cook County Coverage Audit

**Date:** March 1, 2026  
**Cosmos DB:** 971,738 properties in `properties` container  
**Socrata (residential, class 2xx, bldg_sf > 0):** 1,393,053 properties  
**Overall Coverage:** 69.8% (421,315 missing)

---

## Executive Summary

We're missing ~30% of Cook County residential properties that have square footage data. The biggest cause is **entire 5-digit PIN-prefix neighborhoods missing from Cosmos** (360 neighborhoods, 109,764 properties). The second biggest is **partial coverage within neighborhoods we do have** (313,575 properties short across 2,342 neighborhoods).

**The customer at 7131 S Michigan Ave (PIN 20271020110000) is a textbook example:** their neighborhood `20271` has 624 properties on Socrata with sqft data, but **0 in Cosmos**. This is not a comp-matching problem — we never ingested their neighborhood at all.

---

## Key Finding: PIN Prefix ≠ Township Code

**Important:** The first 2 digits of a Cook County PIN are the **volume number**, not the township code. For example:
- PIN `20271020110000` → volume `20`, but `town_code = 70` (Hyde Park)
- This means any analysis mapping PIN prefix to township requires a lookup table

The precompute script groups by PIN prefix (first 5 digits), which works fine for comp matching — properties with similar PIN prefixes are geographically close. But we can't directly compare Socrata `town_code` counts against Cosmos PIN prefix counts.

---

## Coverage Gap Breakdown

### By 5-Digit PIN-Prefix Neighborhood

| Metric | Count |
|--------|-------|
| Total neighborhoods on Socrata | 3,073 |
| In Cosmos | 2,714 |
| **Entirely missing from Cosmos** | **360 (109,764 properties)** |
| Partially covered | 2,342 (313,575 properties short) |
| Too small for 3 comps (<3 total props) | 78 (119 properties) |
| Single-property neighborhoods | 37 |

### Top Missing Neighborhoods (0 in Cosmos)

| Neighborhood | Properties on Socrata |
|-------------|----------------------|
| 05283 | 1,175 |
| 05331 | 1,175 |
| 05182 | 1,132 |
| 13262 | 1,115 |
| 05313 | 1,095 |
| 13241 | 1,029 |
| 06061 | 1,026 |
| 06071 | 1,012 |
| 13261 | 998 |
| 20274 | 998 |
| 15134 | 961 |
| 20254 | 931 |

These are large, data-rich neighborhoods that should be easy to support — they have hundreds of properties for comps.

### Why 20271 (Customer's Neighborhood) Is Missing

- **Socrata:** 624 residential properties with sqft in neighborhood `20271`
- **Cosmos:** 0 properties
- **Customer's property:** class=203 (split-level), 1,438 sqft, 3 beds, town_code=70 (Hyde Park)
- **Root cause:** The bulk precompute didn't ingest this neighborhood. This isn't a comp filtering issue — the data never made it in.

---

## WHY Properties Are Missing

### Cause 1: Not Ingested (360 neighborhoods, ~110K properties)
The bulk precompute either skipped these neighborhoods entirely or the data wasn't in the bulk download files. This is the **most fixable** gap — the data exists on Socrata.

### Cause 2: Partial Ingestion (~314K properties in covered neighborhoods)
Even in neighborhoods we cover, we're missing roughly 30% of properties. Possible causes:
- Assessment data filtering (board_tot=0 or board_bldg=0)
- Multi-card PIN deduplication losing some records
- Stale bulk download files missing recent records

### Cause 3: No Square Footage (~602K properties)
602,055 residential properties on Socrata have `bldg_sf = 0`. These are excluded from the universe entirely. Most are condos (class 299) or vacant land incorrectly classified as residential.

### Cause 4: Too Few Comps (78 neighborhoods, 119 properties)
Only 119 properties are in neighborhoods too small for 3 comps. **This is negligible.**

### Summary of Exclusion Impact

| Filter | Properties Excluded | % of Universe |
|--------|-------------------|---------------|
| No sqft (bldg_sf=0) | 602,055 | 30.2% of all residential |
| Not ingested (missing neighborhoods) | 109,764 | 7.9% of sqft universe |
| Partially ingested | 313,575 | 22.5% of sqft universe |
| <3 comps (neighborhood too small) | 119 | 0.009% |

---

## Recommended Fixes

### Fix 1: Re-run Bulk Download + Precompute (HIGH PRIORITY)
**Impact:** Could recover most of the 421,315 missing properties  
**Effort:** Re-download `bulk_chars_2024.json` and `bulk_assess_2024.json` from Socrata, verify they include all neighborhoods, re-run `bulk_precompute.py`

The 360 missing neighborhoods suggest the original bulk download was incomplete or the precompute hit an error and stopped partway. A fresh full download should capture everything.

### Fix 2: Lower Min Comps from 3 to 2
**Impact:** ~12 additional properties (neighborhoods with exactly 2 in Cosmos)  
**Verdict:** **Not worth it.** The tiny gain doesn't justify reduced statistical confidence. The real problem is missing data, not tight comp requirements.

### Fix 3: Expand Comp Matching from ±30% to ±40% sqft
**Impact:** Marginal — helps properties at the edges of size distributions within their neighborhood. Estimated ~5-10% more properties finding comps within already-covered neighborhoods.  
**Verdict:** **Worth testing** but secondary to Fix 1. Run the precompute with ±40% on a sample neighborhood and check if results stay reasonable.

### Fix 4: Cross PIN-Prefix Boundaries for Comps
**Impact:** Could recover ~82,004 properties in missing neighborhoods that share a 2-digit volume prefix with well-covered neighborhoods  
**Verdict:** **Worth exploring** as a fallback. If a neighborhood has <3 comps, expand search to the same `town_code` (township) or adjacent PIN prefixes. This requires a PIN-to-township mapping table (available from Socrata's `town_code` field).

**Implementation approach:**
1. For each property, first try comps within same 5-digit neighborhood
2. If <3 comps found, expand to same township (using Socrata `town_code`)
3. Socrata provides `town_code` per PIN — build a lookup during bulk download

### Fix 5: Investigate Assessment Data Gaps
**Impact:** Could explain part of the 314K partial-coverage gap  
**Effort:** Query the assessment dataset (`https://datacatalog.cookcountyil.gov/resource/uzyt-m557.json`) grouped by year, check if many PINs lack 2024 assessments. Some properties may only have mailed assessments (no board/certified yet).

---

## Priority Order

1. **🔴 Re-run full bulk download + precompute** — biggest bang for buck, recovers 360 missing neighborhoods
2. **🟡 Cross PIN-prefix comp matching** — fallback for sparse neighborhoods  
3. **🟢 Expand to ±40% sqft** — minor improvement, easy to test
4. **⚪ Lower min comps to 2** — negligible impact, skip

---

## Customer Fix (7131 S Michigan Ave)

The customer's neighborhood `20271` has 624 properties on Socrata. After a fresh bulk precompute that includes this neighborhood, they should get plenty of comps (3-bed, ~1,438 sqft split-level in Hyde Park township).

**Quick fix:** Run a targeted precompute for just neighborhood `20271` using the Socrata API directly, and upload those ~600 properties to Cosmos. This can be done immediately while the full re-run is planned.
