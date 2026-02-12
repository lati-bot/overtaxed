# Collin County (CCAD) Data Quality Analysis for Overtaxed

**Date:** February 12, 2026  
**Analyst:** Automated analysis via data.texas.gov Socrata API + CCAD MDB export  
**Verdict:** ✅ **PROCEED WITH CAVEATS** — Data is strong but requires dual-source approach

---

## Executive Summary

Collin County data is **suitable for Overtaxed** but requires pulling from **two sources**:
1. **Socrata API** (data.texas.gov) — for neighborhood codes, property IDs, and values
2. **CCAD MDB Database Export** (collincad.org) — for beds, baths, stories (not in Socrata)

The Socrata API alone is missing bedrooms, bathrooms, stories, exterior wall, and fireplaces. The MDB export fills beds/baths/stories but still lacks exterior wall and fireplaces. Despite these gaps, the data is comparable to Dallas and sufficient for meaningful comp analysis.

---

## 1. Field Mapping Table

| Need | Socrata Field | MDB Field | Status | Notes |
|------|--------------|-----------|--------|-------|
| Account/ID | `propid` | `prop_id` | ✅ Available | Same ID, perfect join key |
| GeoID | `geoid` | `geo_id` | ✅ Available | |
| Street address | `situsconcatshort` | `situs_display` | ✅ Available | Socrata cleaner (single line) |
| City | `situscity` | `situs_city` | ✅ Available | |
| Zip | `situszip` | `situs_zip` | ✅ Available | |
| Neighborhood code | `nbhdcode` | ❌ not in MDB | ✅ Socrata only | Critical — must come from Socrata |
| Sqft (building) | `imprvmainarea` | `living_area` | ✅ Available | Both sources |
| Year built | `imprvyearbuilt` | `yr_blt` | ✅ Available | Both sources |
| **Bedrooms** | ❌ not in Socrata | `beds` | ⚠️ MDB only | 93.4% populated |
| **Bathrooms** | ❌ not in Socrata | `baths` | ⚠️ MDB only | 94.3% populated |
| **Stories** | ❌ not in Socrata | `stories` | ⚠️ MDB only | 98.3% populated |
| Exterior wall | ❌ | ❌ | ❌ Missing | Not in either source |
| Pool | `imprvpoolflag` | `pool` (Y/N) | ✅ Available | Both sources |
| Fireplaces | ❌ | ❌ | ❌ Missing | Not in either source |
| Building class | `imprvclasscd` | `class_cd` | ✅ Available | Both sources |
| Market value | `prevvalmarket` (2025) | `cert_market` (2025) | ✅ Available | Same values, verified |
| Land value | `prevvalland` | `cert_land_*` | ✅ Available | |
| Improvement value | `prevvalimprv` | `cert_imprv_*` | ✅ Available | |
| Appraised value | `prevvalappraised` | `cert_appraised_val` | ✅ Available | |
| Homestead exempt | `exempthmstdflag` | `exemptions` contains "HS" | ✅ Available | |

---

## 2. Data Completeness (Residential Properties)

**Total residential: ~377,599 (Socrata) / ~380,530 (varies by filter)**

### Socrata API (2026 Preliminary Dataset)

| Field | Count | Percentage |
|-------|-------|-----------|
| Address (`situsconcatshort`) | 377,443 | **99.96%** |
| Sqft (`imprvmainarea > 0`) | 360,110 | **95.4%** |
| Year built (`imprvyearbuilt > 0`) | 360,094 | **95.4%** |
| Market value (`prevvalmarket > 0`) | 377,650 | **~100%** |
| Land value (`prevvalland > 0`) | 372,071 | **98.5%** |
| Improvement value (`prevvalimprv > 0`) | 354,182 | **93.8%** |
| Pool flag = true | 62,656 | **16.6%** |
| Neighborhood code (present) | ~380,530 | **~100%** |
| Current year values (`currvalmarket`) | 0 | **0%** ⚠️ |

### MDB Export (from collincad.org)

| Field | Count (50K sample) | Percentage |
|-------|-------------------|-----------|
| Beds | 42,253 / 45,224 | **93.4%** |
| Baths | 42,648 / 45,224 | **94.3%** |
| Stories > 0 | 44,467 / 45,224 | **98.3%** |
| Living area > 0 | 44,887 / 45,224 | **99.3%** |
| Year built > 0 | 44,887 / 45,224 | **99.3%** |
| Address | 45,218 / 45,224 | **~100%** |
| Cert market > 0 (2025) | 45,224 / 45,224 | **100%** |
| Class code | 44,888 / 45,224 | **99.3%** |

---

## 3. Comparison to Dallas (Gold Standard)

| Field | Dallas | Collin | Gap? |
|-------|--------|--------|------|
| Address | 100% | 99.96% | ✅ Equivalent |
| Sqft | 100% | 95-99% | ✅ Close |
| Year built | 100% | 95-99% | ✅ Close |
| Bedrooms | ~100% | 93.4% (MDB) | ⚠️ Slightly lower, MDB needed |
| Bathrooms | ~100% | 94.3% (MDB) | ⚠️ Slightly lower, MDB needed |
| Stories | ~100% | 98.3% (MDB) | ✅ Close, MDB needed |
| Pool | ✅ | ✅ | ✅ Equivalent |
| Fireplaces | ✅ | ❌ | ⚠️ Missing entirely |
| Exterior wall | ✅ | ❌ | ⚠️ Missing entirely |
| Neighborhood code | ✅ | ✅ | ✅ Equivalent |
| Market value | ✅ | ✅ (via prevval) | ✅ Equivalent |
| Land/Imprv split | ✅ | ✅ | ✅ Equivalent |
| **Data source** | **Single API** | **Dual source required** | ⚠️ More complex |

---

## 4. Key Gaps and Impact

### Gap 1: No Bedrooms/Baths/Stories in Socrata API ⚠️
- **Impact:** Must download and parse the 940MB MDB file from collincad.org
- **Mitigation:** Join on `propid`/`prop_id`. Verified they match.
- **Severity:** Medium — adds ETL complexity but data is there

### Gap 2: No Exterior Wall Type ❌
- **Impact:** Cannot filter comps by exterior (brick vs siding vs stone)
- **Mitigation:** Building class code (`imprvclasscd`/`class_cd`) partially encodes quality
- **Severity:** Low-Medium — Dallas had this but it's not critical for value estimates

### Gap 3: No Fireplace Count ❌
- **Impact:** Cannot adjust comps for fireplace presence/count
- **Mitigation:** Fireplaces are minor value factors ($3-5K per fireplace typically)
- **Severity:** Low — acceptable to omit

### Gap 4: 2026 Values Not Yet Available ⚠️
- **Impact:** The "Preliminary" dataset has `currvalmarket = 0` for all properties
- **Mitigation:** Use `prevvalmarket` (= 2025 certified values). When 2026 values publish (typically April), the Socrata dataset will update with `currvalmarket`.
- **Severity:** Timing issue only — we can launch with 2025 values and update

### Gap 5: All Properties Currently "InProgress" ⚠️
- **Impact:** Confirms 2026 appraisal cycle hasn't completed
- **Mitigation:** Use 2025 certified values from `prevval*` fields
- **Severity:** None if we use prevval; just need to switch to currval when available

---

## 5. Neighborhood Analysis

| Metric | Value |
|--------|-------|
| Total unique neighborhoods | 2,619 |
| Avg properties per neighborhood | 145.3 |
| Median properties per neighborhood | 81 |
| Neighborhoods with ≥ 5 properties | 2,087 (covering 379,640 properties = 99.8%) |
| Neighborhoods with ≥ 10 properties | 1,994 (covering 379,010 properties = 99.6%) |
| Neighborhoods with ≥ 20 properties | 1,878 (covering 377,405 properties = 99.2%) |
| Neighborhoods with < 5 properties | 532 |

**Assessment:** Excellent for comp matching. 99.6% of properties are in neighborhoods with 10+ comps. The median neighborhood has 81 properties — plenty for statistical significance.

Top neighborhood codes: `HOA-COMMON` (7,298 — likely HOA common areas, should filter out), `N2232-PR`, `N11920`, `CMCWEST`, etc.

### Building Class Distribution (Top 10)

| Class | Count | Description (inferred) |
|-------|-------|----------------------|
| R04 | 148,918 | Standard residential |
| R03 | 67,519 | Lower-end residential |
| R05 | 66,349 | Upper-standard residential |
| (blank) | 20,400 | Vacant lots / no improvement |
| R06 | 14,996 | Custom/higher quality |
| R04+ | 7,846 | Above-average standard |
| R04TDE | 5,639 | Standard with TD extension |
| NVCURR | 4,815 | No value current year |
| R07 | 4,806 | Premium quality |
| R06+ | 4,333 | Above-average custom |

---

## 6. Data Sources Summary

### Source A: Socrata API (Primary)
- **Endpoint:** `https://data.texas.gov/resource/nne4-8riu.json`
- **Provides:** propid, address, city, zip, neighborhood code, sqft, year built, pool, building class, market/land/improvement values, homestead status
- **Missing:** beds, baths, stories, ext wall, fireplaces

### Source B: CCAD MDB Export (Supplementary)
- **URL:** `https://link.collincad.org/public/folder/1j1vp-rhx06rqkh3vz2ipw/AppraisalData/LiteDatabaseCurrent.zip`
- **Format:** Microsoft Access .mdb (940MB uncompressed, 80MB zipped)
- **Provides:** beds, baths, stories, units, pool, plus all basic property data
- **Missing:** neighborhood code (!), fireplaces, exterior wall

### Source C: 2024 Certified Socrata (Historical reference)
- **Endpoint:** `https://data.texas.gov/resource/6dqt-e958.json`
- **Properties:** 372,196 residential with certified values
- **Same schema** as 2026 preliminary (no extra fields)

---

## 7. Recommendation: ✅ PROCEED WITH CAVEATS

Collin County data is **good enough for Overtaxed**. The gaps (ext wall, fireplaces) are minor and the critical fields (address, sqft, year built, beds, baths, value, neighborhood code) are all available with 93%+ completeness.

### Caveats

1. **Dual-source ETL required** — Must download MDB (~80MB) for beds/baths/stories, then join with Socrata data for neighborhood codes
2. **No exterior wall or fireplaces** — Comp matching should rely on neighborhood + sqft + year built + class + beds/baths/stories + pool
3. **Timing** — 2026 values will become available ~April 2026 when appraisal notices go out. Until then, use 2025 certified values.
4. **MDB refresh** — The MDB export updates periodically. Need to monitor for freshness.

---

## 8. Precompute Script Differences vs Dallas

| Aspect | Dallas | Collin |
|--------|--------|--------|
| Data source | Single Socrata API | Socrata API + MDB file |
| Beds/baths field | In API directly | Must parse from MDB, join on propid |
| Value field | `tot_val` or similar | `prevvalmarket` (until 2026 currvalmarket available) |
| Land value | In API | `prevvalland` |
| Improvement value | In API | `prevvalimprv` |
| Pool field | Boolean or flag | `imprvpoolflag` (boolean) |
| Ext wall | Available | ❌ Omit from comp matching |
| Fireplaces | Available | ❌ Omit from comp matching |
| Neighborhood | In API | `nbhdcode` from Socrata |
| Address format | `situsconcat` | `situsconcatshort` (street only), `situscity`, `situszip` separate |
| Building class | Available | `imprvclasscd` — R02 through R08+ scale |
| Homestead | In API | `exempthmstdflag` |
| Filter for residential | property type | `propsubtype='Residential'` |
| Vacant lot filtering | ? | Filter out rows where `imprvmainarea = 0` or `imprvclasscd` is blank/NVCURR |

### ETL Pipeline for Collin:

```
1. Download MDB from collincad.org (weekly/monthly cron)
2. Export beds/baths/stories/pool by prop_id from MDB
3. Pull all residential records from Socrata API (paginated, 377K records)
4. Join Socrata data with MDB data on propid = prop_id
5. Use prevvalmarket as the market value (switch to currvalmarket when available)
6. Filter: propsubtype='Residential', imprvmainarea > 0, prevvalmarket > 0
7. Compute neighborhood median $/sqft using nbhdcode
8. Generate appeal scores
```

### Special handling:
- **HOA-COMMON** neighborhood (7,298 records) — likely common areas, may need filtering
- **SPN.MH.SUB** (1,361 records) — manufactured homes subdivision, handle separately
- **Properties with blank class_cd** (~20K) — vacant lots, exclude from comps
- **MDB situs_display** has newline in address — parse carefully if using MDB addresses
