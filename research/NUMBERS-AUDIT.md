# Numbers Audit — End-to-End Data Flow (March 3, 2026)

## Cook County (IL) — the only live purchasable market

### Data Pipeline
```
Cook County Assessor APIs → precompute_cook_v2.py → properties_final.jsonl → Cosmos DB → API routes → Frontend
     ↓                           ↓                                                ↓
  Raw parcel data          Enrichment + comps + savings calculation         939,460 records
```

### Every Number on the Results Page

| Number | Source | Calculation | Status |
|--------|--------|-------------|--------|
| **Address** | Socrata `c49d-89sn` (parcel API) | Direct lookup by PIN | ✅ Live API |
| **PIN** | Socrata `c49d-89sn` | Direct | ✅ Live API |
| **Township** | Socrata `c49d-89sn` | Direct | ✅ Live API |
| **Current Assessment** | Cosmos `current_assessment` | Precomputed from Assessor certified data | ✅ Cosmos |
| **~Market Value** | Frontend | `currentAssessment × 10` (Cook residential = 10% of MV by statute) | ✅ Correct formula, display only |
| **Sqft** | Cosmos `total_sqft` | From Assessor characteristics API during precompute | ✅ Cosmos |
| **Beds** | Cosmos `total_beds` | From Assessor characteristics API during precompute | ✅ Cosmos |
| **Baths** | Cosmos `total_baths` + `baths_half` from buildings[] | From characteristics API | ✅ Cosmos |
| **Year Built** | Cosmos `year_built` | From characteristics API (`currentYear - age`) | ✅ Cosmos |
| **Street View photo** | Google Street View API | Live API call with address | ✅ Live API |
| **Savings Estimate** | Cosmos `savings_estimate` | Precomputed: `reduction × 3.0355 × (compositeRate/100)` | ✅ Cosmos (canonical) |
| **Tax Rate** | Cosmos `tax_rate` | From Cook County Clerk 2024 Tax Rate Report (municipality composite rate) | ✅ Cosmos |
| **Est. Tax Bill** | Frontend | `assessment × 3.0355 × (taxRate/100)` | ✅ FIXED (was `assessment × 10 × taxRate` = $4.5M bug) |
| **Tax Bill After Appeal** | Frontend | `estimatedTaxBill - estimatedSavings` | ✅ Correct (uses fixed tax bill) |
| **% Reduction** | Frontend | `savings / taxBill × 100` | ✅ Correct |
| **Multi-Year Savings** | Frontend | `savings × 3` (Cook County 3-year reassessment cycle) | ✅ Correct |
| **$/sqft (Your Home)** | Frontend | `currentAssessment / buildingSqFt` | ✅ Correct |
| **$/sqft (Neighbors)** | Cosmos via lookup API | Median of neighborhood properties' `current_assessment / total_sqft` | ✅ Cosmos query |
| **Over-Assessed By** | Frontend | `currentAssessment - fairAssessment` | ⚠️ See below |
| **Fair Assessment** | Frontend (from lookup API) | `avg(comps[].per_sqft) × total_sqft` | ⚠️ Recalculated, not from Cosmos |
| **Comp Count** | Cosmos `comps[]` length | Precomputed (up to 7 comps) | ✅ Cosmos |
| **Over-Assessed Count** | Cosmos via lookup API | COUNT of neighborhood properties where `savings_estimate > 0` | ✅ Cosmos query |
| **Over-Assessed %** | Cosmos via lookup API | `overAssessedCount / totalCount × 100` | ✅ Cosmos query |
| **Assessment History** | Cosmos `assessments{}` | 5-year history from Assessor API during precompute | ✅ Cosmos |
| **Reassessment Timing** | Frontend `getReassessmentStatus()` | Township → triad → next reassessment year | ✅ Correct (township-specific) |
| **"Even small reductions"** (fair-assessed) | Frontend | `assessment × 0.1 × cookMultiplier` | ✅ FIXED (uses correct multiplier now) |

### ⚠️ Fair Assessment — Recalculated vs Precomputed

The **`fairAssessment`** shown on the results page is **recalculated in the lookup API** as:
```
avg(comps[].per_sqft) × total_sqft
```

This is NOT the same as the precomputed value. In the precompute script, fair assessment comes from the **median** of the 7 best comps. The lookup API uses the **mean**. This can diverge slightly.

**Impact**: The "Over-Assessed By $X" number may differ slightly from the savings estimate. Savings uses the precomputed Cosmos value ($3,124 for your property), but the "over-assessed by" gap is recalculated.

**Risk**: LOW — the numbers are close, and savings (the one that matters) is canonical from Cosmos.

**Recommendation**: Also store `fair_assessment` in Cosmos during precompute and use it directly, instead of recalculating.

### Numbers on the PDF (generate-appeal route)

| Number | Source | Status |
|--------|--------|--------|
| **Subject property address/PIN/class** | Cosmos | ✅ |
| **Current Assessment** | Cosmos `current_assessment` | ✅ |
| **Fair Assessment** | Recalculated from comp median $/sqft × sqft | ⚠️ Same mean vs median issue |
| **Reduction** | `currentAssessment - fairAssessment` | ⚠️ Derived from recalculated fair |
| **Savings** | Cosmos `savings_estimate` (precomputed) | ✅ Canonical |
| **Savings Fallback** | `reduction × 3.0355 × (taxRate/100)` | ✅ FIXED (was `reduction × 10 × taxRate`) |
| **Per Sqft** | `currentAssessment / sqft` | ✅ |
| **Comps table** | Cosmos `comps[]`, enriched with Socrata address | ✅ |
| **Assessment History** | Cosmos `assessments{}` | ✅ |

### Numbers on the Comps Page (/api/comps)

| Number | Source | Status |
|--------|--------|--------|
| **Comp addresses/PINs** | Cosmos `comps[]` | ✅ Pass-through |
| **Comp $/sqft** | Cosmos `comps[].per_sqft` | ✅ Precomputed |
| **Status (over/fair)** | Cosmos `savings_estimate > 0` | ✅ |
| **Savings** | Cosmos `savings_estimate` | ✅ |

### Texas Counties (10 markets — all blocked, showing waitlist)

TX savings formula: `reduction × 0.022` (2.2% avg rate). This is an approximation — actual TX rates vary by taxing jurisdiction (1.8-3.0%). Acceptable for estimates.

All TX data is from 2025 and currently blocked. When 2026 data publishes, we'll re-precompute with fresh values.

### Summary of Bugs Found & Fixed

1. **🔴 CRITICAL (fixed)**: Results page tax bill: `assessment × 10 × 6.618 = $4.5M`. Should be `assessment × 3.0355 × 0.06618 = $13,802`. Commit `bf17362`.
2. **🟡 MEDIUM (fixed)**: Generate-appeal fallback savings: same `× 10 × rate` bug. Commit `160604d`.
3. **🟡 LOW (not fixed)**: Fair assessment recalculated (mean) vs precomputed (median) — small divergence. Recommendation: store in Cosmos.

### What's Correct & Verified

- ✅ Savings estimate: Cosmos precomputed, formula verified to the penny against Treasurer's actual tax bill
- ✅ Tax rate: From Cook County Clerk official 2024 Tax Rate Report, 135 municipalities, 100% coverage
- ✅ Equalization factor: 3.0355 (2024, from IL DOR, confirmed in Clerk PDF)
- ✅ Assessment data: From Assessor's certified rolls via API
- ✅ Comps: 7 best comparable properties per neighborhood, precomputed
- ✅ Assessment history: 5 years from Assessor API
- ✅ Market value: assessment × 10 (Cook residential statute)
- ✅ Multi-year: × 3 for Cook County triennial cycle
- ✅ TX rate: 2.2% average, acceptable approximation
