# Cook County Data Sources — Complete Audit (March 2026)

## Executive Summary

We were using **ARCHIVED (2019-frozen) datasets**. Cook County has actively maintained datasets with data through **2026**. Switching to these gives us 7 more years of data, better fields, and way richer product.

---

## Active Datasets (USE THESE)

### 1. `x54s-btds` — Single & Multi-Family Improvement Characteristics ⭐ NEW
- **Replaces**: `bcnq-qi2z` (archived, frozen at 2019)
- **Rows**: 1,103,022 for 2026 alone (1999-2026, ~27 years × ~1M)
- **Updated**: Feb 3, 2026
- **Key fields**: pin, year, card, class, char_yrblt, char_bldg_sf, char_land_sf, char_beds, char_rooms, char_fbath, char_hbath, char_frpl, char_type_resd, char_cnst_qlty, char_apts, char_ext_wall, char_bsmt, char_bsmt_fin, char_heat, char_air, char_repair_cnd, char_gar1_size, char_gar1_att, char_roof_cnst, char_renovation, char_porch, char_use, pin_is_multicard, pin_num_cards
- **Multi-building**: Uses "cards" — your PIN has card 1 (main 2-flat, 2547sf) + card 2 (coach house, 696sf)
- **Values are human-readable**: "Average" not "2", "Full" not "1", "Central A/C" not "1"
- **NOTE**: Does NOT include condos (class 207-209) — those are in `3r7i-mrz4`

### 2. `3r7i-mrz4` — Residential Condo Unit Characteristics
- For condos (class 207, 208, 209, 299)
- Needed to cover the full residential market

### 3. `wvhk-k5uv` — Parcel Sales ⭐ GAME CHANGER
- **Replaces**: `5pge-nu6u` (archived, frozen at 2019)
- **Rows**: 2,637,363 (1971-2025)
- **Updated**: Feb 4, 2026
- **Key fields**: pin, sale_date, sale_price, class, nbhd, deed_type, is_multisale, num_parcels_sale, buyer_name, seller_name
- **Tomi's property**: Shows 2024 sale at $849K (!) + 2017 purchase at $475K + 2005 at $559K
- **Has outlier filter fields**: sale_filter_deed_type, sale_filter_less_than_10k, sale_filter_same_sale_within_365

### 4. `uzyt-m557` — Assessed Values (SAME as before, still good)
- **Rows**: ~1.86M per year, 1999-2026
- **Updated**: Feb 1, 2026
- **Key fields**: pin, year, class, mailed_bldg, mailed_land, mailed_tot, certified_bldg, certified_land, certified_tot, board_bldg, board_land, board_tot
- **2026 data exists** but values are NULL for most PINs (not yet mailed)
- **Board column** shows appeal outcomes — if board_tot < mailed_tot, appeal succeeded

### 5. `y282-6ig3` — Appeals ⭐ NEW
- **Updated**: Mar 1, 2026 (daily!)
- **Key fields**: pin, year, class, case_no, hearing_type, appeal_type, status, mailed_tot, certified_tot, change, reason_code1, reason_desc1, agent_code, agent_name
- **NOTE**: "Appeals for many years are currently missing as we repopulate" — data is incomplete
- **Tomi's PIN returns empty** — missing years being repopulated
- **When available**: Shows appeal success rates, reason codes, which agents file most appeals
- **Killer feature potential**: "In your neighborhood, X% of appeals resulted in reductions"

### 6. `pabr-t5kh` — Parcel Universe (Current Year)
- **Rows**: 1 per PIN for current year
- **Key fields**: pin, year, class, township_name, nbhd_code, tax_code, lat, lon, census data, school districts, municipality, ward, community area, flood data, walkability score
- **This is the JOIN table** — connects PINs to geography, neighborhoods, and political boundaries

### 7. `3723-97qp` — Parcel Addresses
- **Key fields**: pin, year, prop_address_full, prop_address_city_name, prop_address_state, prop_address_zipcode_1, mail_address_*
- Multi-year history

---

## Archived/Skip

| Dataset | Reason to Skip |
|---------|---------------|
| `bcnq-qi2z` | Frozen at 2019, replaced by `x54s-btds` |
| `5pge-nu6u` | Frozen at 2019, replaced by `wvhk-k5uv` |
| `c49d-89sn` | Archived, data in `pabr-t5kh` now |
| `ydue-e5u3` | Proximity data from 2011 — way too old |
| `tnes-dgyi` | Archived assessments, use `uzyt-m557` |

---

## Key Findings

### Multi-Record Properties (Coach Houses etc.)
- New dataset uses **"cards"** — each building on a PIN gets a card number
- Your PIN: card 1 = main 2-flat (2,547sf, 4bed/2bath), card 2 = coach house (696sf, 2bed/1bath)
- `pin_is_multicard: true`, `pin_num_cards: 2`
- ~15,604 properties in old dataset had total_bldg_sf != bldg_sf (similar concept)
- **Handling**: Sum building SFs for total. Use card 1 (largest building) as primary for comp matching. Store all cards.

### Sales Data Quality
- `is_multisale` flag identifies multi-parcel transactions
- Filter flags identify outliers (non-arm's-length, < $10K, same-property-within-365-days)
- Your 2017 purchase: $475K arm's-length (single sale, not split like old dataset showed)
- Your 2024 sale: $849K (!!) — did you sell this property?

### Assessment History Power
- 2026 records exist but mailed values not yet set
- 2025: mailed=$68,700 (this is the REDUCED amount after 2024 board appeal)
- Board reductions visible: 2024 mailed $87K → board $68.7K, 2022 mailed $66K → board $49.9K
- This proves appeals work and quantifies the benefit

### Neighborhood Codes Changed
- Old dataset: `nbhd = "41"` (2-3 digit codes)
- New Parcel Universe: `nbhd_code = "71041"` (township_code + old nbhd)
- Sales dataset uses: `nbhd` = "71041" format
- Must align on the 5-digit code

---

## Proposed Data Model for Cosmos

```json
{
  "pin": "13014180090000",
  "address": "5737 N WASHTENAW AVE",
  "city": "CHICAGO",
  "zip": "60659",
  "lat": 41.9859857,
  "lon": -87.6964716,
  "class": "211",
  "township": "Jefferson",
  "nbhd": "71041",
  "municipality": "CITY OF CHICAGO",
  "ward": "40",
  "community_area": "WEST RIDGE",
  
  "buildings": [
    {
      "card": 1,
      "use": "Multi-Family",
      "sqft": 2547,
      "beds": 4,
      "baths_full": 2,
      "baths_half": 0,
      "rooms": 10,
      "year_built": 1924,
      "stories": "2 Story",
      "quality": "Average",
      "condition": "Average",
      "ext_wall": "Masonry",
      "basement": "Full",
      "basement_finish": "Unfinished",
      "heat": "Warm Air Furnace",
      "ac": "Central A/C",
      "fireplace": 0,
      "garage_size": "0 cars",
      "apartments": "Two",
      "renovation": false
    },
    {
      "card": 2,
      "use": "Single-Family",
      "sqft": 696,
      "beds": 2,
      "baths_full": 1,
      "baths_half": 0,
      "rooms": 3,
      "year_built": 1922,
      "stories": "1 Story",
      "quality": "Average",
      "condition": "Average",
      "ext_wall": "Frame",
      "basement": "Slab",
      "heat": "Warm Air Furnace",
      "ac": "Central A/C",
      "fireplace": 0,
      "garage_size": "3 cars",
      "apartments": "None",
      "renovation": true
    }
  ],
  
  "total_sqft": 3243,
  "land_sqft": 3720,
  
  "assessments": {
    "2025": { "mailed": 68700, "certified": 68700, "board": null },
    "2024": { "mailed": 87000, "certified": 87000, "board": 68700 },
    "2023": { "mailed": 53900, "certified": 53900, "board": 53900 },
    "2022": { "mailed": 66000, "certified": 66000, "board": 49904 },
    "2021": { "mailed": 66000, "certified": 66000, "board": 66000 }
  },
  
  "appeal_history": {
    "has_appealed": true,
    "times_reduced": 3,
    "avg_reduction_pct": 15.2
  },
  
  "recent_sales": [
    { "date": "2024-04-30", "price": 849000 },
    { "date": "2017-05-19", "price": 475000 }
  ],
  
  "comps": {
    "assessment_comps": [...],
    "sales_comps": [...]
  },
  
  "neighborhood_stats": {
    "median_assessed_per_sqft": 28.50,
    "appeal_success_rate": 0.67,
    "avg_reduction_when_appealed": 12500,
    "median_sale_price_per_sqft": 195,
    "num_sales_3yr": 42
  },
  
  "savings_estimate": {
    "amount": 4142,
    "method": "uniform_and_equal",
    "confidence": "high"
  }
}
```

---

## Precompute Plan

### Phase 1: Download (est. 2-4 hours)
1. **Characteristics** (`x54s-btds`): All residential (class 2xx), year=2026, paginate 50K/page
2. **Condo Characteristics** (`3r7i-mrz4`): All condos, year=2026
3. **Parcel Universe** (`pabr-t5kh`): All PINs (for lat/lon, address, nbhd, geography)
4. **Assessments** (`uzyt-m557`): Last 5 years (2021-2025) for each residential PIN
5. **Sales** (`wvhk-k5uv`): Last 5 years, residential only, non-outlier

### Phase 2: Transform (est. 1-2 hours)
1. Join characteristics + universe on PIN
2. Aggregate multi-card PINs (sum sqft, keep card 1 as primary)
3. Compute assessment history (mailed vs board across years)
4. Match sales to neighborhoods
5. Compute neighborhood-level stats

### Phase 3: Compute Comps (est. 2-3 hours)
1. Assessment comps: same nbhd, same class, ±30% sqft, ±1 bed (when available)
2. Sales comps: same nbhd, last 3 years, arm's-length, ±30% sqft
3. Neighborhood stats: median $/sqft, appeal success rates (when appeals data available)
4. Savings estimate using both equity AND market value arguments

### Phase 4: Upload to Cosmos (est. 1-2 hours)
1. Upload enriched documents to `properties` container
2. Partition by `nbhd` (5-digit code)
3. Verify autocomplete still works with new address format
4. Spot-check random PINs

**Total estimated time: 6-11 hours (can run overnight)**
