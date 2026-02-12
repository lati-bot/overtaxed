# Overtaxed Expansion Analysis
*Generated February 12, 2026*

## Current Coverage
| Market | Properties | Status |
|--------|-----------|--------|
| Cook County, IL | ~971K | ✅ Live |
| Harris County, TX (Houston) | ~1.17M | ✅ Live |
| Dallas County, TX (Dallas) | ~632K | ✅ Built (deploying) |

**Total addressable properties: ~2.77M**

---

## Texas Markets

### 1. Tarrant County, TX (Fort Worth / Arlington)
- **Population**: ~2.23M (3rd largest TX county)
- **Est. residential properties**: ~700K–800K
- **Median home value**: ~$330K–$350K
- **Data source**: TAD (Tarrant Appraisal District) — tad.org
  - **GIS/parcel data**: Free downloads at tad.org/resources/data-downloads (ParcelView shapefile with database table, updated Jan 2026)
  - **Open Data Portal**: gis-tad.opendata.arcgis.com (ArcGIS Hub)
  - **Property search**: Online search available
  - No direct bulk CSV/JSON export found — may need to convert shapefile or request via Open Records
- **Data quality**: Parcel polygons with DB table available. Need to verify if improvement details (sqft, beds, baths, year built) are included in the ParcelView download. Likely available via the database join.
- **Filing process**: Same Texas protest process (§42.26 uniform & equal). File via TAD's online protest portal. Deadline: May 15 or 30 days after notice.
- **Competition**: Ownwell operates in TX broadly. Texas Tax Protest, O'Connor & Associates also active. Fort Worth is a major market for all competitors.
- **Ease of integration**: HIGH — same Texas code path. Need to download/process TAD data into Cosmos, create `tarrant-properties` container. Frontend: clone Dallas pattern, swap DCAD→TAD references.
- **Notes**: "Tarrant County has the highest number of property tax accounts in the State of Texas" per county website. Massive market.

### 2. Travis County, TX (Austin)
- **Population**: ~1.36M
- **Est. residential properties**: ~440K (TCAD: ~443K real estate accounts in 2024, growing ~8K/year)
- **Median home value**: ~$512K–$525K (highest in TX)
- **Data source**: TCAD (Travis Central Appraisal District) — traviscad.org
  - Full database searchable online at traviscad.org/propertysearch
  - New property search via travis.prodigycad.com (Prodigy CAD)
  - Travis County Open Data Portal: traviscountytx.gov/open-data-portal
  - data.texas.gov may have Travis CAD data (Harris, Montgomery, Collin, Denton, Travis all listed)
- **Data quality**: Need to verify bulk download availability. TCAD uses Prodigy CAD system — may have API or require scraping.
- **Filing process**: Same Texas protest. Online filing available.
- **Competition**: Heavy — Austin is Ownwell's home market. Five Stone Tax Advisors also prominent. Very competitive.
- **Ease of integration**: MEDIUM — same TX code path but data acquisition may be harder. High property values = high revenue per conversion.
- **Notes**: Highest median home values in TX = best revenue potential per sale. But most competitive market.

### 3. Collin County, TX (Plano, McKinney, Frisco)
- **Population**: ~1.15M (one of fastest-growing US counties)
- **Est. residential properties**: ~400K–450K
- **Median home value**: ~$420K
- **Data source**: CCAD (Collin Central Appraisal District) — collincad.org
  - **Open Data Portal**: collincad.org/open-data-portal
  - **Texas.gov**: data.texas.gov has CCAD appraisal data (multiple years, including preliminary)
  - **ArcGIS Hub**: open-data-ccad.hub.arcgis.com for GIS parcel data
  - Appraisal data exports available (marked "retiring soon" — migrating to Texas.gov portal)
- **Data quality**: EXCELLENT — data.texas.gov has structured appraisal data with API access (Socrata). Can filter, sort, query, and export. This is the easiest bulk data source.
- **Filing process**: Same Texas protest. CCAD offers online protest filing.
- **Competition**: Ownwell active. Growing market = lots of protest activity.
- **Ease of integration**: HIGH — best data availability of any new market (Socrata API on data.texas.gov). Clone TX code, point at CCAD data.
- **Notes**: Rapidly growing, affluent suburbs. Very high appeal potential — new construction + rapid appreciation = frequent over-appraisals.

### 4. Denton County, TX (Denton, Lewisville, Flower Mound)
- **Population**: ~1M (projected to hit 1M by 2027, may already be there)
- **Est. residential properties**: ~350K–400K
- **Median home value**: ~$435K
- **Data source**: Denton CAD — dentoncad.com
  - Property search at dentoncad.com/property-search-information
  - Denton County GIS Hub: data-dentoncounty.hub.arcgis.com
  - data.texas.gov lists Denton as having county data available
- **Data quality**: GIS data available. Need to verify bulk appraisal data download. May require open records request.
- **Filing process**: Same Texas protest.
- **Competition**: Ownwell active. Less saturated than Travis/Harris.
- **Ease of integration**: MEDIUM — data acquisition clarity needed. Same TX code path.

### 5. Bexar County, TX (San Antonio)
- **Population**: ~2.13M (4th largest TX county)
- **Est. residential properties**: ~600K–700K
- **Median home value**: ~$300K–$310K (lower than DFW/Austin)
- **Data source**: BCAD (Bexar Appraisal District) — bcad.org
  - Property search: esearch.bcad.org
  - Bexar County Open Data: gis-bexar.opendata.arcgis.com (ArcGIS Hub)
  - Online services: bcadonline.org
- **Data quality**: ArcGIS open data available. Need to verify parcel-level appraisal data with improvement details. Uses True Automation platform (same as many TX CADs).
- **Filing process**: Same Texas protest. BCAD has online appeals at bcadonline.org.
- **Competition**: Ownwell active but San Antonio is less competitive than Austin/DFW. Lower home values = smaller absolute savings per protest = fewer competitors.
- **Ease of integration**: MEDIUM — data acquisition needs verification. Same TX code.
- **Notes**: Large market by population but lower home values mean lower revenue per conversion ($49 flat fee still works, but advertising ROI may be lower).

### 6. Fort Bend County, TX (Sugar Land, Katy area)
- **Population**: ~850K
- **Est. residential properties**: ~250K–300K
- **Median home value**: ~$350K
- **Data source**: FBCAD — fbcad.org, esearch.fbcad.org
- **Filing process**: Same Texas protest.
- **Competition**: Overlaps with Houston market competitors.
- **Ease of integration**: HIGH — suburban Houston market, similar data patterns.
- **Notes**: Affluent suburban county. Good complement to Harris County.

### 7. Williamson County, TX (Round Rock, Cedar Park, Georgetown)
- **Population**: ~700K
- **Est. residential properties**: ~250K
- **Median home value**: ~$400K
- **Data source**: WCAD — wilcoad.org
- **Filing process**: Same Texas protest.
- **Competition**: Austin metro competitors overlap.
- **Ease of integration**: MEDIUM — data acquisition needs investigation.
- **Notes**: Fast-growing Austin suburb. Good complement to Travis County.

---

## Illinois Markets

### Key Difference from Cook County
Illinois counties outside Cook have a **different appeal process**:
- Appeals go to the **County Board of Review** (not Cook County Assessor/BOR)
- Then to **Illinois Property Tax Appeal Board (PTAB)** if denied
- SmartFile e-filing available in some counties (e.g., Lake County)
- Assessment cycle: quadrennial (every 4 years) in most counties, vs. Cook's triennial by township
- **Assessment level**: 33.33% of fair market value (same as Cook)

### 8. Lake County, IL
- **Population**: ~714K
- **Est. residential properties**: ~250K–280K
- **Median home value**: ~$374K–$385K
- **Data source**: 
  - Lake County Open Data: data-lakecountyil.opendata.arcgis.com
  - Tax inquiry: tax.lakecountyil.gov
  - SmartFile e-filing portal for appeals
- **Data quality**: ArcGIS open data portal exists. Need to verify if parcel-level assessment data is available for bulk download.
- **Filing process**: File with township assessor during assessment year, then Board of Review. SmartFile available for some townships. Different from Cook County's Assessor/BOR process.
- **Competition**: Tax Appeals Lake County (dedicated firm). O'Connor operates in IL suburbs. Ownwell is in IL.
- **Ease of integration**: MEDIUM — need to adapt Cook County code for different BOR process. Data acquisition needs work. Can potentially use Cook County's Socrata API pattern if similar data exists.
- **Notes**: Affluent county — higher home values than Cook County median. Good revenue potential.

### 9. DuPage County, IL
- **Population**: ~932K (2nd largest IL county)
- **Est. residential properties**: ~330K–360K
- **Median home value**: ~$410K
- **Data source**:
  - DuPage GIS: gisdata-dupage.opendata.arcgis.com
  - Supervisor of Assessments: dupagecounty.gov
  - Individual township assessors maintain their own databases
- **Data quality**: GIS data available. Property assessment data spread across individual township assessors. More fragmented than Cook County.
- **Filing process**: Board of Review appeal → PTAB if denied.
- **Competition**: O'Connor, Ownwell active. Multiple law firms specialize in DuPage property tax appeals.
- **Ease of integration**: MEDIUM-LOW — fragmented data across townships. Need to aggregate from multiple sources.
- **Notes**: Large, affluent suburban market. High home values but complex data landscape.

### 10. Will County, IL
- **Population**: ~696K
- **Est. residential properties**: ~230K–260K
- **Median home value**: ~$328K
- **Data source**:
  - Will County SOA: willcountysoa.com
  - Property search portal: willcountysoa.com/PropertySearchPortal
  - Tax inquiry: willtax.willcounty.gov
- **Data quality**: Online property search available but no obvious bulk download. May need to scrape or request via FOIA.
- **Filing process**: Board of Review → PTAB.
- **Competition**: Less competitive than DuPage/Lake. Some firms cover Will County as part of broader Chicago suburban coverage.
- **Ease of integration**: MEDIUM — data acquisition is the bottleneck.

### 11. Kane County, IL (Aurora, Elgin, Geneva)
- **Population**: ~516K
- **Est. residential properties**: ~180K–200K
- **Median home value**: ~$367K–$390K
- **Data source**:
  - Property tax inquiry: kaneil.devnetwedge.com
  - County website with assessor info
- **Data quality**: DevNet Wedge system for property search. No obvious bulk data portal.
- **Filing process**: Board of Review → PTAB.
- **Competition**: Low — fewer dedicated property tax firms.
- **Ease of integration**: LOW-MEDIUM — no clear bulk data source.

### 12. McHenry County, IL
- **Population**: ~310K
- **Est. residential properties**: ~120K
- **Median home value**: ~$310K
- **Data source**: County assessor website, no obvious open data portal
- **Filing process**: Board of Review → PTAB.
- **Ease of integration**: LOW — small market, unclear data.
- **Notes**: O'Connor covers McHenry County.

---

## Competition Landscape

### Major Competitors
| Competitor | Model | Markets | Pricing |
|-----------|-------|---------|---------|
| **Ownwell** | Full-service (they file for you) | TX, CA, WA, GA, FL, IL, NY | ~25% contingency on savings |
| **O'Connor & Associates** | Full-service | TX (all major markets), IL suburbs | Contingency (~30%) |
| **Texas Tax Protest** | Full-service | TX | Contingency |
| **Five Stone Tax Advisors** | Full-service | TX (Austin focus) | Contingency |
| **Various law firms** | Full-service | IL counties | Contingency or flat fee |

### Our Competitive Advantage (Overtaxed)
- **Flat $49 fee** vs. 25-30% contingency (on a $500 savings, competitors charge $125-$150; we charge $49)
- **Instant delivery** — no waiting for someone to file for you
- **DIY empowerment** — homeowner files themselves with our package
- **Low barrier** — no sign-up, no annual commitment, no sharing of personal info beyond email
- **Scales easily** — no humans needed per filing

### Competitive Risk
- Ownwell is well-funded and expanding rapidly (7 states)
- They handle the entire filing process — less effort for homeowner
- Some homeowners prefer "done for you" over "DIY with a guide"
- Our advantage: price. On a $500-800 savings (common range), $49 beats 25% contingency every time

---

## Prioritization Framework

### Scoring Criteria (1-5 scale)

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Market Size | 25% | Number of residential properties |
| Data Accessibility | 25% | Bulk download, API, open data |
| Revenue Potential | 20% | Home values × conversion rate |
| Implementation Effort | 15% | Code reuse, data processing |
| Competition | 15% | Less competition = better |

### Scoring Matrix

| Market | Size (25%) | Data (25%) | Revenue (20%) | Effort (15%) | Competition (15%) | **Weighted Score** |
|--------|-----------|-----------|---------------|-------------|-------------------|-------------------|
| **Tarrant County, TX** | 5 | 4 | 4 | 5 | 3 | **4.20** |
| **Collin County, TX** | 3 | 5 | 5 | 5 | 3 | **4.10** |
| **Travis County, TX** | 3 | 3 | 5 | 5 | 2 | **3.50** |
| **DuPage County, IL** | 3 | 3 | 4 | 3 | 3 | **3.20** |
| **Lake County, IL** | 3 | 3 | 4 | 3 | 3 | **3.20** |
| **Denton County, TX** | 3 | 3 | 4 | 5 | 3 | **3.55** |
| **Bexar County, TX** | 4 | 3 | 3 | 5 | 3 | **3.50** |
| **Fort Bend County, TX** | 2 | 3 | 4 | 5 | 3 | **3.25** |
| **Will County, IL** | 2 | 2 | 3 | 3 | 4 | **2.70** |
| **Kane County, IL** | 2 | 2 | 3 | 3 | 4 | **2.70** |
| **Williamson County, TX** | 2 | 2 | 4 | 4 | 3 | **2.90** |
| **McHenry County, IL** | 1 | 1 | 3 | 3 | 4 | **2.20** |

---

## Top 5 Recommended Markets (in priority order)

### 🥇 1. Tarrant County, TX (Fort Worth / Arlington)
**Score: 4.20 — BUILD NEXT**

- **Why**: Largest property tax market in Texas by account count. ~700K-800K residential properties. Same TX code path — clone Dallas, swap references. Parcel data with DB table available for download. Fort Worth + Arlington = massive population base.
- **Revenue estimate**: At 0.1% conversion = 700 customers × $49 = $34K. At 0.5% = $171K.
- **Effort**: 2-3 days. Download TAD ParcelView data, process into Cosmos `tarrant-properties`, clone Dallas routes → `tarrant/` endpoints, update frontend.
- **Timeline**: Could ship by end of week if data processing goes smoothly.

### 🥈 2. Collin County, TX (Plano, McKinney, Frisco)  
**Score: 4.10 — BUILD SECOND**

- **Why**: Best data accessibility of any new market — Collin CAD data is on data.texas.gov (Socrata API). High home values ($420K median) in one of the fastest-growing US counties. Residents are affluent and tech-savvy = good conversion potential.
- **Revenue estimate**: At 0.1% = ~400 × $49 = $19.6K. At 0.5% = $98K.
- **Effort**: 2-3 days. Socrata API similar to Cook County pattern. Possibly the easiest data integration.
- **Timeline**: Could build immediately after Tarrant.

### 🥉 3. Denton County, TX (Denton, Lewisville, Flower Mound)
**Score: 3.55 — BUILD THIRD**

- **Why**: Part of the DFW metro (overlaps with both Dallas and Collin County in marketing). High home values ($435K). data.texas.gov mentions Denton data availability. Same TX code path. Building Tarrant + Collin + Denton = complete DFW metro coverage alongside Dallas.
- **Revenue estimate**: At 0.1% = ~350 × $49 = $17K.
- **Effort**: 2-3 days, depends on data source. If available via data.texas.gov like Collin, very easy.
- **Rationale**: Completing the DFW metro (Dallas + Tarrant + Collin + Denton) gives us ~2M+ properties in one metro area. Powerful for marketing: "We cover all of DFW."

### 4. Travis County, TX (Austin)
**Score: 3.50 — BUILD FOURTH**

- **Why**: Highest home values in TX ($512K median). Despite heavy competition from Ownwell, our $49 flat fee is a compelling alternative. TCAD data may be available via data.texas.gov or Prodigy CAD system.
- **Revenue estimate**: At 0.1% = ~440 × $49 = $21.6K. Higher home values mean larger savings per property = better conversion.
- **Effort**: 3-5 days. Data acquisition may require more investigation.
- **Risk**: Most competitive market. Ownwell is headquartered in Austin.

### 5. Bexar County, TX (San Antonio)
**Score: 3.50 — BUILD FIFTH**

- **Why**: 2nd largest TX county by population. ~600K-700K residential properties. Lower competition than Austin/DFW. Same TX code. ArcGIS open data available.
- **Revenue estimate**: At 0.1% = ~600 × $49 = $29.4K.
- **Effort**: 3-5 days. Data processing from ArcGIS may require more work than Socrata/CSV.
- **Note**: Lower home values ($300K) but massive volume.

---

## Strategic Recommendations

### Phase 1: Complete DFW Metro (February/March 2026)
1. **Tarrant County** → 2-3 days
2. **Collin County** → 2-3 days  
3. **Denton County** → 2-3 days

**Result**: Dallas + Tarrant + Collin + Denton = **~2M+ properties** in the DFW metro. This is a marketable milestone: "We cover all of DFW." Combined with Harris County, that's **~3.2M Texas properties**.

### Phase 2: Austin + San Antonio (March/April 2026)
4. **Travis County** → 3-5 days
5. **Bexar County** → 3-5 days

**Result**: All 5 major Texas metros covered. **~4.3M Texas properties**.

### Phase 3: Illinois Suburbs (Post-protest season)
6. **DuPage County** → 1-2 weeks (different process, data challenges)
7. **Lake County** → 1-2 weeks

**Rationale**: Illinois suburbs have complex, fragmented data and a different appeal process. Better to nail Texas first (same code, same process, high volume) before investing in IL suburbs. Illinois suburbs don't have a hard May 15 deadline like Texas — appeal windows vary by township/year.

### Why Texas First?
1. **Same code path** — every new TX county is a 2-3 day build
2. **Same filing process** — §42.26 uniform & equal, same PDF template with minor tweaks
3. **Hard deadline approaching** — protest season opens late March 2026
4. **Massive volume** — Texas has the most property tax protests of any state
5. **Higher urgency** — we need to be ready before notices mail in March

### Data Acquisition Strategy
For each new TX county, the process is:
1. Find bulk data download (CSV, shapefile, or API)
2. Run through `process-{county}.js` script (adapt from Houston/Dallas patterns)
3. Upload to Cosmos `{county}-properties` container
4. Clone API routes and frontend components
5. Test, commit, deploy

**Key insight**: The data.texas.gov portal (Socrata) may have multiple counties' data in a standardized format. If so, we could build a generic Texas county processor that works for any county on the platform.

### Revenue Projections (Conservative: 0.1% conversion)

| Market | Properties | Revenue (0.1%) | Cumulative |
|--------|-----------|----------------|------------|
| Cook County | 971K | $47.6K | $47.6K |
| Harris County | 1.17M | $57.3K | $104.9K |
| Dallas County | 632K | $31.0K | $135.9K |
| Tarrant County | 750K | $36.8K | $172.6K |
| Collin County | 425K | $20.8K | $193.4K |
| Denton County | 375K | $18.4K | $211.8K |
| Travis County | 443K | $21.7K | $233.5K |
| Bexar County | 650K | $31.9K | $265.3K |
| **Total** | **~5.4M** | **$265K** | |

At 0.5% conversion: **$1.33M**. At 1% conversion: **$2.65M**.

---

## Appendix: data.texas.gov Investigation

The Texas Open Data Portal (data.texas.gov, powered by Socrata) appears to host appraisal data for multiple counties including:
- ✅ Collin County (confirmed — multiple years of appraisal data)
- 📋 Harris County (listed)
- 📋 Montgomery County (listed)
- 📋 Denton County (listed)
- 📋 Travis County (listed)
- 📋 Comal County (listed)

**Priority action item**: Investigate data.texas.gov for each target county. If standardized Socrata APIs exist, we can build a generic Texas data processor that dramatically reduces per-county effort to <1 day.

Endpoint pattern: `https://data.texas.gov/resource/{dataset-id}.json?$where=...`

This could be a game-changer for scaling across Texas counties rapidly.

---

## Appendix: Illinois Collar Counties — Why They're Lower Priority

1. **Different appeal process** — Board of Review (not Assessor), different filing portals, different deadlines
2. **Fragmented data** — each township assessor maintains separate records (DuPage has 9 townships, Lake has 18)
3. **No single hard deadline** — deadlines vary by township and assessment year
4. **Smaller markets** — each IL suburban county is ~250K-350K properties vs. 400K-800K for TX counties
5. **Data acquisition difficulty** — no Socrata APIs, limited open data, may need FOIA requests
6. **Different PDF template needed** — IL appeal process (BOR filing) vs. TX protest (hearing script + ARB)

However, they're still worth building eventually — the Chicago suburbs represent a $1.5M+ annual opportunity across Lake + DuPage + Will + Kane at moderate conversion rates.
