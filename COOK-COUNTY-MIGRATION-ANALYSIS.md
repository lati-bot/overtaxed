# Cook County Migration Analysis: What It Would Take to Go Full Cosmos

**Date:** February 17, 2026

---

## Current State: What Cook County Uses

### API Calls Made at Runtime

| API | Endpoint | What It Provides | Used In |
|-----|----------|-----------------|---------|
| **Parcels** | `c49d-89sn.json` | Address ↔ PIN lookup, city, zip, township, lat/lng, neighborhood | autocomplete, lookup, generate-appeal |
| **Characteristics** | `bcnq-qi2z.json` | Property class code, sqft, total sqft, land sqft, age, beds, full baths, half baths, exterior wall, rooms | lookup, generate-appeal |
| **Assessments** | `uzyt-m557.json` | 5-year assessment history: mailed/certified/board values for building, land, total | lookup, generate-appeal |

### Cosmos DB (from `properties` container)

| Field | What It Provides |
|-------|-----------------|
| pin, nbhd, sqft, beds | Basic property info |
| current_assessment, fair_assessment, estimated_savings | Pre-computed analysis |
| comp_count, median_per_sqft | Neighborhood stats |

### The Gap: What's In APIs But NOT In Cosmos

| Missing Field | Source | Impact |
|---|---|---|
| **address** | Parcels API | Can't do autocomplete or display addresses |
| **city, zip, township** | Parcels API | Can't display location info |
| **lat/lng** | Parcels API | Not critical, but used in response |
| **property class code** | Characteristics API | Used in PDF to filter same-class comps, show class description |
| **total_bldg_sf, land sqft** | Characteristics API | Displayed in PDF property details |
| **full baths, half baths** | Characteristics API | Displayed in PDF and results |
| **exterior wall** | Characteristics API | Displayed in PDF property details |
| **rooms** | Characteristics API | Displayed in PDF |
| **age** (not year_built) | Characteristics API | Cook uses "age" not year_built — calculated as currentYear - age |
| **5-year assessment history** | Assessments API | mailed_bldg, mailed_land, mailed_tot + certified + board values, per year |

### The Generate-Appeal Comp Enrichment Problem

This is the biggest issue. Currently, `generate-appeal` does:

1. Gets comp PINs from Cosmos (up to 20 PINs by neighborhood)
2. **For each comp PIN, makes 3 parallel API calls** (characteristics + assessment + address)
3. That's up to **60 API calls** per PDF generation

If we move to full Cosmos, each comp's data needs to already be in Cosmos. This means the Cook County Cosmos documents need to be as rich as the TX county documents (address, sqft, beds, baths, year_built, assessment values, etc.).

---

## What Needs to Happen

### Step 1: Enrich Cook County Pre-compute Script

The existing Cook County `properties` container has minimal docs:
```json
{
  "id": "02141030040000",
  "pin": "02141030040000",
  "status": "over",
  "nbhd": "02141",
  "sqft": 1304,
  "beds": 3,
  "current_assessment": 30000,
  "fair_assessment": 26367,
  "estimated_savings": 726,
  "comp_count": 86,
  "median_per_sqft": 16.9
}
```

Needs to become:
```json
{
  "id": "02141030040000",
  "pin": "02141030040000",
  "address": "5737 N WASHTENAW AVE",
  "city": "CHICAGO",
  "state": "IL",
  "zipcode": "60659",
  "township": "WEST CHICAGO",
  "neighborhood_code": "02141",
  "sqft": 1304,
  "total_sqft": 1304,
  "land_sqft": 3750,
  "year_built": 1956,
  "beds": 3,
  "full_baths": 1,
  "half_baths": 0,
  "rooms": 6,
  "ext_wall": "Masonry",
  "property_class": "203",
  "current_assessment": 30000,
  "assessment_bldg": 22500,
  "assessment_land": 7500,
  "fair_assessment": 26367,
  "estimated_savings": 726,
  "assessment_history": [
    {"year": "2024", "mailed_tot": 30000, "certified_tot": 30000, "board_tot": 28500},
    {"year": "2023", "mailed_tot": 27000, "certified_tot": 27000, "board_tot": null},
    ...
  ],
  "comps": [
    {"acct": "02141030050000", "address": "5739 N WASHTENAW AVE", "sqft": 1280, "assessed_val": 25000, "psf": 19.53, "beds": 3, "baths": 1, "yearBuilt": 1952, "class": "203"}
  ],
  "jurisdiction": "cook_county_il",
  "updated_at": "2026-02-17T..."
}
```

### Step 2: Data Sources for Enrichment

The Cook County Data Portal has **bulk downloads** for all three datasets:
- Parcels: https://datacatalog.cookcountyil.gov/Property-Taxation/Assessor-Parcel-Universe/c49d-89sn (CSV/API)
- Characteristics: https://datacatalog.cookcountyil.gov/Property-Taxation/Assessor-Residential-Characteristics/bcnq-qi2z
- Assessments: https://datacatalog.cookcountyil.gov/Property-Taxation/Assessor-Assessments/uzyt-m557

All three support bulk CSV download. We can download all of them and join on PIN in a pre-compute script, exactly like we do for TX counties with fixed-width files.

### Step 3: Pre-compute Script Rewrite

Need a new `precompute_cook.py` that:
1. Downloads or reads the 3 bulk CSV files
2. Joins on PIN
3. For each residential property: address, characteristics, 5-year assessment history
4. Calculates fair assessment, finds comps (same as current)
5. **Pre-computes comp details** — each comp entry includes address, sqft, beds, baths, year_built, assessment (no runtime API calls needed)
6. Uploads enriched documents to Cosmos

### Effort Estimate

| Task | Time |
|---|---|
| Download 3 bulk CSVs | 30 min |
| Write new pre-compute script (join + enrich) | 2-3 hours |
| Run pre-compute (971K properties) | 1-2 hours |
| Verify data quality | 30 min |
| **Total** | **4-6 hours** |

---

## Complications

### 1. Assessment History is Multi-Year
TX counties don't have assessment history in their documents — we only store current year values. Cook County needs 5 years of history embedded per document. This makes docs bigger and the pre-compute more complex (need to join assessments grouped by PIN across years).

### 2. Property Class Codes
Cook County uses class codes (202-295) that affect comp filtering — comps should be same class. TX doesn't have this concept. The unified route's comp logic needs to handle "filter by class if available."

### 3. Cook County's "age" vs "year_built"
Characteristics API returns `age` (years old), not `year_built`. We calculate year_built = currentYear - age. During pre-compute, we'd store `year_built` directly so it matches TX counties.

### 4. Assessment Structure Differs
- **TX**: `appraised_val`, `assessed_val`, `market_val` (single year, single number each)
- **IL**: `mailed_bldg`, `mailed_land`, `mailed_tot`, `certified_tot`, `board_tot` (5 years, breakdown by component)

The unified doc schema needs to handle both. TX counties get `current_assessment` (one number). IL counties get `current_assessment` plus `assessment_bldg`, `assessment_land`, plus `assessment_history` array.

### 5. The 971K Property Rewrite
We'd be replacing all 971K docs in the `properties` container. Need to either:
- Delete and recreate (downtime risk)
- Upsert in place (safe, but the old docs don't have the new fields — risk of stale data)
- New container `cook-properties` (clean break, consistent naming with other counties)

**Recommendation: New `cook-properties` container.** Consistent with naming pattern, no risk to existing data, clean migration.

---

## Bottom Line

It's **not as simple as "just add the data"** — Cook County needs:
1. A new pre-compute script that joins 3 data sources
2. Assessment history embedded per document (TX doesn't need this)
3. Enriched comp entries with full details (address, sqft, class, etc.)
4. A new Cosmos container (`cook-properties`)
5. The unified route config to handle IL-specific fields (class codes, assessment breakdown, history)

But it's **absolutely doable** and worth doing. The result is:
- No runtime dependency on Cook County's Socrata API (faster, more reliable)
- Consistent data model across all counties
- Clean unified routes with zero special cases for Cook

**Total effort: ~4-6 hours for data migration + ~2-3 hours for unified routes = about 1 day of work.**
