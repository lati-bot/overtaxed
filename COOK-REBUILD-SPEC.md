# Cook County Data Rebuild — What We Need

## Available Data Sources (All Free, All Socrata API)

### 1. Property Characteristics (`bcnq-qi2z`)
**What it has** (70+ fields per property):
- **Address & Location**: addr, centroid_x, centroid_y, town_code, nbhd, tractce
- **Size**: bldg_sf, total_bldg_sf, hd_sf (lot), rooms, apts, total_units
- **Details**: beds, fbath, hbath, age, class, type_resd
- **Construction**: ext_wall, roof_cnst, cnst_qlty, repair_cnd, bsmt, bsmt_fin, attic_type, attic_fnsh
- **Features**: frpl (fireplace), air (AC), heat, oheat, porch, garage_indicator, gar1_size, gar1_att
- **Modeling**: modeling_group, multi_family_ind, location_factor, pure_market_filter
- **Assessor's estimates**: pri_est_bldg, pri_est_land (the assessor's own market value estimate!)

**Limitation**: Only goes to tax_year 2019. Need to check if newer data exists elsewhere.

### 2. Assessments (`uzyt-m557`)
**What it has**: Multi-year assessment values
- mailed_bldg, mailed_land, mailed_tot
- certified_bldg, certified_land, certified_tot  
- board_bldg, board_land, board_tot
- class, year/tax_year

**This is critical**: Shows whether the Board of Review reduced the assessment (proof that appeals work in this area).

### 3. Sales (`5pge-nu6u`)
**What it has**: Actual sale transactions
- sale_date, sale_price, sale_year, sale_quarter
- All property characteristics at time of sale
- pure_market_filter (flags arm's-length transactions)
- doc_no (document number for verification)

**This is a game-changer**: Real comparable SALES, not just comparable assessments. 
- We could show: "Your neighbor at 123 Oak sold for $350K — that's $XX/sqft. The county says YOUR home is worth $400K ($YY/sqft)."
- Way more compelling than assessment-based comps

### 4. Property Locations / Addresses
- Need to find the right dataset ID (c49d-89sn returned 404)
- May be embedded in characteristics data already (addr + centroid)

---

## What We Currently Have in Cosmos

- ~971K properties (70% of residential)
- Fields: pin, address, city, zip, township, neighborhood, lat/lng, characteristics (sqft, beds, baths, year_built, class), assessment (mailed/certified/board), assessmentHistory
- Comps: pre-computed by neighborhood, ±30% sqft, ±1 bed, min 3 comps
- **Missing**: 360 neighborhoods, no sales data, no appeal success rates

---

## What the Ideal Product Looks Like

### For the Results Page (free, pre-purchase)
1. ✅ Property details (address, sqft, beds, baths, year, features)
2. ✅ Current assessment + assessment history
3. ✅ $/sqft comparison vs neighborhood (how over-assessed they are)
4. 🆕 **Neighborhood appeal success rate** — "67% of appeals in your area resulted in a reduction"
5. 🆕 **Recent sales in neighborhood** — "5 homes near you sold for avg $X/sqft" (blurred until purchase)
6. ✅ Estimated savings

### For the PDF (paid, post-purchase)
1. ✅ Evidence brief with comparable assessments
2. 🆕 **Comparable SALES** — actual transactions, not just assessments. This is what the Board of Review wants to see.
3. ✅ Filing guide (Assessor + Board of Review two-bite strategy)
4. ✅ Cover letter / hearing script
5. 🆕 **Construction quality comparison** — show that comparable properties have same/better quality grade but lower assessments
6. 🆕 **Assessor's own market estimate vs assessment** — if pri_est_bldg + pri_est_land < mailed_tot, the assessor's OWN model says the property is over-assessed. This is devastating evidence.

---

## Key Improvements Over Current

### A. Sales-Based Comps (Biggest Win)
Right now we compare assessment-to-assessment. The Board of Review cares about **market value**. Showing actual sales proves market value directly.

Example argument: "The county assesses my home at $460,000. But 5 comparable homes within 0.5 miles sold for an average of $380,000 in the past 2 years. My assessment should be reduced to reflect actual market value."

### B. Appeal Success Rates (Trust Signal)
If we can find historical appeal outcomes by neighborhood, we can show: "In your area, X% of homeowners who appealed got a reduction averaging $Y."

### C. Assessor's Own Estimate (Killer Feature)
The characteristics data includes `pri_est_bldg` and `pri_est_land` — the assessor's model estimate. If this is LOWER than the mailed assessment, it means **the assessor's own algorithm disagrees with the assessment**. This is incredibly powerful evidence.

For our test PIN: pri_est_bldg=$340,330 + pri_est_land=$66,960 = **$407,290 estimated market value**. Assessed at $68,700 (which at 10% assessment level = $687,000 market value). The assessor's own model says the property is worth ~$407K but they assessed it as if it's worth $687K.

### D. Better Comp Matching
Current: ±30% sqft, ±1 bed, same neighborhood
Better: Add construction quality (cnst_qlty), condition (repair_cnd), property type (type_resd), basement (bsmt), and proximity (using centroids for distance calculation)

---

## Precompute Strategy

### Option A: Full Rebuild (Recommended)
1. Download ALL residential properties from characteristics API (filter class 2xx, bldg_sf > 0)
2. Download ALL assessments from uzyt-m557 (multi-year)
3. Download ALL residential sales from 5pge-nu6u (last 3-5 years)
4. Join on PIN
5. Compute comps using enhanced matching (sqft + quality + condition + distance)
6. Compute neighborhood-level stats (appeal rates, median values, % over-assessed)
7. Upload to Cosmos with enriched schema

### Option B: Incremental Fix
1. Re-download characteristics to fill the 360 missing neighborhoods
2. Keep existing assessment data
3. Add sales as a separate lookup

**Recommendation**: Option A. We're rebuilding anyway, and the sales data + assessor estimates are too valuable to skip. This makes our $49 product genuinely better than what a tax attorney would prepare for $500.

---

## Data Volume Estimates
- Characteristics: ~1.4M residential rows
- Assessments: ~1.4M × 4 years = ~5.6M rows  
- Sales: probably 200-400K rows (last 5 years of residential transactions)
- Cosmos storage: ~2-3GB (well within limits)
- Precompute time: 4-8 hours

---

## Questions for Tomi
1. **Sales comps** — do we show these on the free results page (blurred) or only in the paid PDF?
2. **Assessor's own estimate** — is this too technical, or is "the county's own model says your home is worth less" compelling enough?
3. **Timeline** — this is a 1-2 day project. Worth doing now or after TX data refresh?
4. **Cosmos cost** — are we OK with ~3GB storage for richer Cook County data?
