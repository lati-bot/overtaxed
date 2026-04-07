# Next Texas Counties for Overtaxed Expansion — Research Report

**Date:** February 12, 2026  
**Researcher:** Subagent (automated research)  
**Current Coverage:** Cook County IL, Harris (Houston), Dallas (DCAD), Travis (Austin), Collin, Tarrant

---

## Executive Summary

Denton County is the clear #1 priority — it completes the DFW mega-market and has **excellent, freely downloadable bulk data** including a nightly CSV export. Williamson County (WCAD) is #2 with a **Socrata API** providing structured data. Fort Bend (FBCAD) is #3 with outstanding **direct download data files**. Bexar, Montgomery, and El Paso follow with varying data accessibility.

---

## 1. Priority Ranking

| Rank | County | Est. Residential | Strategic Value | Data Ease | Recommendation |
|------|--------|-----------------|-----------------|-----------|----------------|
| **1** | **Denton** | ~350-400K | 🔥 Completes DFW quad | ⭐⭐⭐⭐⭐ | **Do first** |
| **2** | **Williamson** | ~200-250K | Completes Austin metro | ⭐⭐⭐⭐⭐ | **Do second** |
| **3** | **Fort Bend** | ~200-250K | Expands Houston metro | ⭐⭐⭐⭐⭐ | **Do third** |
| **4** | **Bexar** | ~600-700K | New metro (San Antonio) | ⭐⭐⭐ | Medium effort |
| **5** | **Montgomery** | ~200K | Expands Houston metro | ⭐⭐ | Higher effort |
| **6** | **El Paso** | ~200K | Standalone market | ⭐⭐⭐⭐ | Lower priority |

---

## 2. County-by-County Research

### 🥇 Denton County (DCAD — Denton Central Appraisal District)

**Why #1:** Completes the DFW mega-market (Dallas + Collin + Tarrant + Denton). This is a *must-have*.

#### Data Sources

| Source | URL | Format | Notes |
|--------|-----|--------|-------|
| **Nightly CSV Export** | `https://dentoncad.net/data/_uploaded/files/datafiles/gis/nightly_appraisals.csv` | CSV (231MB) | ⭐ BEST SOURCE — updated nightly, direct download |
| **Nightly CSV (compressed)** | `https://dentoncad.net/data/_uploaded/files/datafiles/gis/nightly_appraisals.zip` | ZIP (61MB) | Same data, compressed |
| **Certified Data (annual)** | `https://dentoncad.net/data/_uploaded/files/datafiles/2025/CertifiedDataAllProperty/Denton_AppraisalDataExtracts_ALL(CERTIFIED).zip` | ZIP (413MB) | Annual certified roll, all properties |
| **GIS Geodatabase** | `https://dentoncad.net/data/_uploaded/files/datafiles/gis/nightly_geodatabase.gdb.zip` | GDB (313MB) | With spatial data (parcels) |
| **Parcels with CAMA** | `https://dentoncad.net/data/_uploaded/files/datafiles/gis/Parcels_with_CAMA_Data.gdb/` | File GDB | CAMA data joined to parcels |
| **Schema Documentation** | `https://dentoncad.net/data/_uploaded/files/datafiles/gis/schema.ini` | INI file | Full field layout |
| **Reference Files** | `https://dentoncad.net/data/_uploaded/files/datafiles/gis/LandTypeCodes.pdf`, `StateCodeDesc.pdf`, `entity_codes.xlsx` | PDF/XLSX | Lookup tables |
| **File Index** | `https://dentoncad.net/data/_uploaded/files/datafiles/` | Directory listing | Browse all years (2019-2025) |

#### Available Fields (from schema.ini — nightly_appraisals.csv)

| Field | Column Name | Available? |
|-------|-------------|------------|
| **Address** | `situsStreetNumb`, `situsStreetPrefix`, `situsStreetName`, `situsStreetSuff`, `situsCity`, `situsState`, `situsZip`, `situs_street_address`, `situs_full_address` | ✅ Full address components |
| **SqFt (Living Area)** | `imprvMainArea` | ✅ |
| **Total Improvement Area** | `imprvTotalArea` | ✅ |
| **Year Built** | `imprvActualYearBuilt` | ✅ |
| **Effective Year Built** | `imprvEffYearBuilt` | ✅ |
| **Market Value** | `ownerMarketValue` | ✅ |
| **Appraised Value** | `ownerAppraisedValue` | ✅ |
| **Net Appraised Value** | `ownerNetAppraisedValue` | ✅ |
| **Improvement Value** | `improvementValue` | ✅ |
| **Land SqFt** | `land_sqft`, `landTotalSqft` | ✅ |
| **Acreage** | `legalAcreage`, `effectiveSizeAcres` | ✅ |
| **Improvement Classes** | `imprvClasses` | ✅ (class code) |
| **Property Type** | `propType` | ✅ |
| **Exemptions** | `exemptions` | ✅ |
| **Neighborhood Code** | Not explicit in nightly CSV (may be in certified export) | ⚠️ Check certified data |
| **Beds/Baths** | Not in nightly CSV | ❌ (may be in certified data) |
| **Pool** | Not in nightly CSV | ❌ (may be in certified data) |
| **Owner Name** | `name`, `nameSecondary` | ✅ |
| **Owner Address** | `addrDeliveryLine`, `addrCity`, `addrState`, `addrZip` | ✅ |
| **Legal Description** | `legalDescription` | ✅ |
| **Deed Info** | `deedID`, `volume`, `page`, `deedDt`, `instrumentNum`, `deedType` | ✅ |
| **Taxing Units** | `taxingUnits`, `schoolTaxingUnitCode`, `cityTaxingUnitCode` | ✅ |
| **Zoning** | `cad_zoning` | ✅ |
| **Land Type** | `landType` | ✅ |
| **State Codes** | `stateCodes` | ✅ |

#### Access & Restrictions
- **Login required?** No
- **Fee?** No
- **Terms?** Standard disclaimer
- **Data freshness:** Nightly updates (CSV dated 2026-02-05), GDB updated 2026-02-12
- **data.texas.gov?** ❌ Not available on Socrata

#### Estimated Effort: LOW
- CSV format, nightly updates, no authentication
- Direct download via HTTP, well-documented schema
- Similar to existing Texas CAD integrations
- **Est. 3-5 days to build pipeline**

---

### 🥈 Williamson County (WCAD)

**Why #2:** Completes Austin metro (Travis + Williamson). Has its own **Socrata open data portal** — easiest possible integration.

#### Data Sources

| Source | URL | Format | Notes |
|--------|-----|--------|-------|
| **Property - Certified (Socrata)** | `https://data.wcad.org/d/ai3c-c9pf` | Socrata API (JSON/CSV) | ⭐ BEST SOURCE — structured API, monthly updates |
| **Property - Preliminary (Socrata)** | `https://data.wcad.org/d/553d-hn26` | Socrata API (JSON/CSV) | Preliminary values, weekly updates |
| **Parcels (Socrata GIS)** | `https://data.wcad.org/d/an3x-cnmw` | Socrata API (GeoJSON) | Parcel boundaries + attributes, daily updates |
| **Data Downloads Page** | `https://www.wcad.org/data-downloads/` | Multiple formats | Certified, Preliminary, Historical, GIS, Owners |
| **WCAD Open Data Portal** | `https://data.wcad.org/` | Socrata | Full catalog |

#### Available Fields (Property - Certified, Socrata dataset ai3c-c9pf)

| Field | Column Name | Available? |
|-------|-------------|------------|
| **Address** | `SitusAddress`, `StreetNumber`, `StreetName`, `StreetSuffix`, `City`, `Zip` | ✅ |
| **SqFt (Living Area)** | `TotalSqFtLivingArea` | ✅ |
| **Building Area** | `SquareFeet` (parcels: `BLDGAREA`, `RESFLRAREA`) | ✅ |
| **Year Built** | `RESYRBLT` (in Parcels dataset) | ✅ |
| **Market Value** | `TotalPropMktValue` | ✅ |
| **Land Value** | `TotalLandMktValue` (parcels: `LNDVALUE`) | ✅ |
| **Improvement Value** | `TotalImpMktValue` | ✅ |
| **Assessed Value** | `TotalAssessedValue` | ✅ |
| **Ag Use Value** | `TotalAgUseValue` | ✅ |
| **Neighborhood Code** | `NeighborhoodCode`, `NeighborhoodDesc`, `NeighborhoodID` | ✅ |
| **Property Type** | `PropertyTypeCode`, `PropertyTypeDesc` | ✅ |
| **Acres** | `Acres`, `AssessedAcres` | ✅ |
| **Structure Class** | `CLASSCD`, `CLASSDSCRP`, `STRCLASS` (Parcels) | ✅ |
| **Structure Type** | `RESSTRTYP` (Parcels) | ✅ |
| **Floor Count** | `FLOORCOUNT` (Parcels) | ✅ |
| **School District** | `SchoolTaxingUnits` | ✅ |
| **Taxing Unit Group** | `TaxingUnitGroupCode`, `TaxingUnitGroupDesc` | ✅ |
| **Owner** | `OWNERNME1`, `OWNERNME2` (Parcels) | ✅ |
| **Beds/Baths** | Not in main dataset | ❌ |
| **Pool** | Not in main dataset | ❌ |

#### API Access
```
# Socrata SODA API — no auth required, rate limited
# Certified data:
https://data.wcad.org/resource/ai3c-c9pf.json?$limit=50000&$offset=0

# Preliminary data:
https://data.wcad.org/resource/553d-hn26.json?$limit=50000&$offset=0

# Parcels (with geometry):
https://data.wcad.org/resource/an3x-cnmw.json?$limit=50000&$offset=0

# CSV export:
https://data.wcad.org/resource/ai3c-c9pf.csv?$limit=50000
```

#### Access & Restrictions
- **Login required?** No
- **Fee?** No
- **Terms?** Standard Socrata terms
- **Rate limit:** Standard Socrata (unauthenticated: 1000 req/hour; with app token: higher)
- **Data freshness:** Property-Certified updated monthly; Preliminary updated weekly; Parcels updated daily
- **data.texas.gov?** ❌ Not on state portal, but has own Socrata portal

#### Estimated Effort: VERY LOW
- Socrata API is the same tech as Collin County on data.texas.gov
- Can reuse existing Socrata integration code
- **Est. 2-3 days to build pipeline**

---

### 🥉 Fort Bend County (FBCAD)

**Why #3:** Expands Houston metro (adjacent to Harris). Excellent data availability with direct downloads.

#### Data Sources

| Source | URL | Format | Notes |
|--------|-----|--------|-------|
| **Data Files Page** | `https://www.fbcad.org/data-files/` | Multiple (ZIP) | ⭐ Main hub — Certified, Preliminary, Supplemental data |
| **Property Data Export (Certified 2024)** | `https://www.fbcad.org/wp-content/uploads/2024/07/PropertyDataExport_7-30-2024.zip` | ZIP | Property data |
| **Certified Data Export (Orion)** | `https://www.fbcad.org/wp-content/uploads/2024/07/2024_07_29_2001-Orion-2024-Certified-Export-REDACTED.zip` | ZIP | Full Orion export |
| **Residential Segments** | `https://www.fbcad.org/wp-content/uploads/2024/08/2024-PostCert_WebsiteResidentialSegs.xlsx` | XLSX | Residential detail data |
| **Commercial Segments** | `https://www.fbcad.org/wp-content/uploads/2024/08/2024-PostCert_WebsiteCommercialSegs.xlsx` | XLSX | Commercial detail data |
| **GIS Data (Certified 2025)** | `https://www.fbcad.org/wp-content/uploads/2025/07/FBCAD-2025-Certified-GIS-Data-Parcels-and-Shapefiles.zip` | ZIP (SHP) | Parcels with attributes |
| **File Layout** | `https://www.fbcad.org/wp-content/uploads/2020/01/Property-Data-File-Fixed-Length-Layout-.pdf` | PDF (12 pages) | Fixed-length format documentation |
| **Open Data Hub** | `https://fbcad-open-data-hub-fortbend.hub.arcgis.com/` | ArcGIS Hub | GIS data and tools |
| **GIS Data Page** | `https://www.fbcad.org/gis-data/` | Multiple years | Historical GIS data (2017-2025) |

#### Available Fields (from data files + file layout)
Based on the Orion export system (ACAD fixed-length format — 12 pages of field definitions):

| Field | Available? | Notes |
|-------|------------|-------|
| **Address** | ✅ | Full situs address |
| **SqFt** | ✅ | Main area / living area |
| **Year Built** | ✅ | Actual and effective |
| **Market Value** | ✅ | Land + Improvement + Total |
| **Appraised Value** | ✅ | |
| **Neighborhood Code** | ✅ | |
| **Property Type** | ✅ | Residential/Commercial/etc |
| **Beds/Baths** | ⚠️ | Likely in Residential Segments XLSX |
| **Pool** | ⚠️ | Likely in Residential Segments XLSX |
| **Exemptions** | ✅ | |
| **Taxing Units** | ✅ | Up to 8 entities per property |

#### Data Formats
- **Orion Export:** Fixed-length text file (requires layout PDF to parse)
- **Property Data Export:** ZIP containing data files (format TBD — likely pipe-delimited or fixed-length)
- **Residential Segments:** XLSX spreadsheet
- **GIS Data:** Shapefiles (SHP)

#### Access & Restrictions
- **Login required?** No
- **Fee?** No
- **Terms?** Standard hold-harmless disclaimer
- **Data freshness:** Multiple exports per year (preliminary → certified → supplements)
- **Confidential owners:** Redacted per Texas Property Tax Code §25.025
- **data.texas.gov?** ❌ Not available on Socrata

#### Estimated Effort: LOW-MEDIUM
- Multiple data formats available — recommend using Residential Segments XLSX + Property Data Export
- Fixed-length Orion format needs parser (but layout documented)
- **Est. 4-6 days to build pipeline**

---

### #4 Bexar County (BCAD — San Antonio)

**Why #4:** Major metro (~600-700K residential), but data access requires more effort than top 3.

#### Data Sources

| Source | URL | Format | Notes |
|--------|-----|--------|-------|
| **ArcGIS MapServer** | `https://maps.bexar.org/arcgis/rest/services/Parcels/MapServer/0` | ArcGIS REST API | Queryable API with parcel data |
| **Open Data Portal** | `https://gis-bexar.opendata.arcgis.com/` | ArcGIS Hub | County open data (links to BCAD) |
| **Open Records / FTP** | Email: `OpenRecords@bcad.org` | FTP access | "Appraisal data export, property summary export, or GIS data" |
| **Property Search** | `https://esearch.bcad.org/` | Web scraping only | Individual property lookup |
| **PIA Request Form** | `https://bcad.org/wp-content/uploads/2023/10/Online-Public-Information-Request-Form-2023-02-1.pdf` | PDF form | For requesting bulk data |

#### Available Fields (from ArcGIS MapServer)

| Field | Column Name | Available? |
|-------|-------------|------------|
| **Address** | `Situs` | ✅ |
| **Land Value** | `LandVal` | ✅ |
| **Improvement Value** | `ImprVal` | ✅ |
| **Total Value** | `TotVal` | ✅ |
| **Neighborhood** | `Nbhd` | ✅ |
| **GBA (Gross Building Area)** | `GBA`, `TOT_GBA` | ✅ |
| **Year Built** | `YrBlt` | ✅ |
| **Stories** | `Stories` | ✅ |
| **Number of Rooms** | `NumRooms` | ✅ |
| **Owner** | `Owner` | ✅ |
| **Property Use** | `PropUse` | ✅ |
| **Exemptions** | `Exempts` | ✅ |
| **Legal Description** | `LglDesc` | ✅ |
| **Acres** | `LglAcres`, `Acres` | ✅ |
| **State Code** | `State_cd` | ✅ |
| **Taxing Units** | `TaxUnits` | ✅ |
| **Beds/Baths** | ❌ | Not in ArcGIS layer |
| **Pool** | ❌ | Not in ArcGIS layer |

#### Access Challenges
- **ArcGIS REST API:** Supports query operations but limited to 1000 records per request. Need to paginate with spatial or ID-based queries. ~600K+ records = significant API load.
- **FTP Access:** Available via open records request. May provide more complete data.
- **ArcGIS data age:** Layer metadata says "Last update: September 2019" — may be outdated. Need to verify current state.
- **data.texas.gov?** ❌ Not available on Socrata

#### Estimated Effort: MEDIUM-HIGH
- ArcGIS API scraping for 600K+ records is feasible but slow
- FTP via open records request may be faster but requires manual process
- Recommend submitting PIA request first, fall back to ArcGIS scraping
- **Est. 5-8 days to build pipeline** (plus PIA wait time)

---

### #5 Montgomery County (MCAD)

**Why #5:** Houston metro expansion (The Woodlands, Conroe). Data access is the most challenging.

#### Data Sources

| Source | URL | Format | Notes |
|--------|-----|--------|-------|
| **GIS Data Page** | `https://mcad-tx.org/gis-data/` | JS-heavy (unreadable without browser) | Likely has download links |
| **Public Information Page** | `https://mcad-tx.org/public-information/` | JS-heavy | May have PIA request info |
| **ArcGIS Hub (County)** | `https://data-moco.opendata.arcgis.com/` | ArcGIS Hub | Montgomery County open data |
| **MCAD Tax Parcel View** | `https://hub.arcgis.com/datasets/MOCO::mcad-tax-parcel-view/` | ArcGIS Feature Layer | Tax parcels with MCAD attributes |
| **MCAD Subdivision** | `https://hub.arcgis.com/datasets/MOCO::mcad-subdivision/` | ArcGIS Feature Layer | Subdivision boundaries |
| **Property Search** | `https://www.esearch.mcad-tx.org/` | Web search only | Individual lookup |

#### Available Fields
- Full field list unavailable (JS-rendered site blocked extraction)
- ArcGIS tax parcel layer likely has: address, values, property type, owner
- May need PIA request for complete CAMA data (beds, baths, sqft, year built)

#### Access Challenges
- **Website:** Entirely JS-rendered (same platform as Denton CAD), cannot scrape with simple fetch
- **No known bulk download page:** Unlike Denton, no `dentoncad.net` equivalent found
- **ArcGIS data:** County-level (MOCO) dataset exists but fields unknown without browser access
- **PIA request likely required** for complete data
- **data.texas.gov?** ❌ Not available on Socrata

#### Estimated Effort: HIGH
- Need to either: (a) use browser automation to explore JS site, or (b) submit PIA request
- ArcGIS tax parcel layer may provide basic data
- **Est. 7-10 days to build pipeline** (plus PIA wait time if needed)

---

### #6 El Paso County (EPCAD)

**Why #6:** Standalone market, geographically isolated. Good data availability but lower strategic priority.

#### Data Sources

| Source | URL | Format | Notes |
|--------|-----|--------|-------|
| **Open Government Page** | `https://epcad.org/OpenGovernment` | Download links | ⭐ Has appraisal roll exports |
| **2025 Appraisal Roll** | Available from OpenGovernment page | Unknown format | Real estate + personal property |
| **2025 Real Estate** | Available from OpenGovernment page | Unknown format | Real estate specifically |
| **2025 Personal Property** | Available from OpenGovernment page | Unknown format | BPP data |
| **2025 Codes** | Available from OpenGovernment page | Unknown format | Code/lookup tables |
| **2025 Listings** | Available from OpenGovernment page | Unknown format | Listing data for development use |
| **Property Search** | `https://epcad.org/Search` | Web search | Individual lookup |

#### Available Fields
- Cannot confirm exact fields (Cloudflare blocked direct access to OpenGovernment page)
- Based on search snippet: "certified export files" with codes and listings
- Likely has standard Texas CAD fields: address, values, year built, sqft, neighborhood

#### Access & Restrictions
- **Login required?** No (public domain data per their statement)
- **Fee?** No
- **Terms:** "All information contained herein is considered in the public domain and is distributed without warranty"
- **Cloudflare protection:** May need browser to access download links
- **data.texas.gov?** ❌ Not available on Socrata

#### Estimated Effort: LOW-MEDIUM
- Data appears freely available, just need to use browser to get actual download URLs
- Standard export format likely similar to other Texas CADs
- **Est. 3-5 days to build pipeline** (once download URLs obtained)

---

## 3. Data Availability Matrix

| Field | Denton | Williamson | Fort Bend | Bexar | Montgomery | El Paso |
|-------|--------|------------|-----------|-------|------------|---------|
| **Address** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (likely) |
| **SqFt/Living Area** | ✅ | ✅ | ✅ | ✅ (GBA) | ⚠️ | ✅ (likely) |
| **Year Built** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (likely) |
| **Market Value** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (likely) |
| **Appraised Value** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (likely) |
| **Neighborhood Code** | ⚠️ | ✅ | ✅ | ✅ | ⚠️ | ✅ (likely) |
| **Beds/Baths** | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❓ |
| **Pool** | ❌ | ❌ | ⚠️ | ❌ | ❌ | ❓ |
| **Property Type** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (likely) |
| **Exemptions** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (likely) |
| **Owner Name** | ✅ | ✅ | ✅* | ✅ | ⚠️ | ✅ (likely) |
| **Land Value** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (likely) |
| **Stories** | ❌ | ✅ | ❓ | ✅ | ⚠️ | ❓ |
| **Acreage** | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ (likely) |

**Legend:** ✅ Confirmed available | ⚠️ Likely available but unconfirmed | ❌ Not in primary dataset | ❓ Unknown | * Redacted for confidential owners

---

## 4. Recommended Implementation Order

### Phase 1: Complete DFW + Austin (Weeks 1-3)
1. **Denton County** — Nightly CSV, direct download, completes DFW quad
2. **Williamson County** — Socrata API, reuse Collin County code, completes Austin

### Phase 2: Expand Houston (Weeks 4-6)
3. **Fort Bend County** — Direct download ZIP files, multiple formats available

### Phase 3: New Metro (Weeks 6-10)
4. **Bexar County** — Submit PIA request NOW (during Phase 1), build when data arrives
5. **El Paso County** — Use browser to extract download URLs, then build pipeline

### Phase 4: Complete Houston (Weeks 10+)
6. **Montgomery County** — Most effort needed, submit PIA request early

### ⚡ Action Items (Do Now)
- [ ] Submit PIA request to BCAD (`OpenRecords@bcad.org`) for appraisal data export
- [ ] Submit PIA request to MCAD for bulk property data
- [ ] Use browser to visit `https://epcad.org/OpenGovernment` and document download links
- [ ] Use browser to visit `https://mcad-tx.org/gis-data/` and document download links

---

## 5. DFW Completion Strategy

### Current DFW Coverage
- ✅ Dallas County (DCAD) 
- ✅ Collin County (Collin CAD — via data.texas.gov Socrata)
- ✅ Tarrant County (TAD)
- ❌ **Denton County** — THE MISSING PIECE

### Denton Implementation Plan
1. **Data Source:** Use nightly CSV export from `dentoncad.net`
   - URL: `https://dentoncad.net/data/_uploaded/files/datafiles/gis/nightly_appraisals.zip`
   - 61MB compressed, 231MB uncompressed CSV
   - Updated daily (latest: Feb 5, 2026 for CSV, Feb 12, 2026 for GDB)

2. **Schema:** 71 columns (documented in `schema.ini`)
   - Key fields: `situs_full_address`, `imprvMainArea` (sqft), `imprvActualYearBuilt`, `ownerMarketValue`, `ownerAppraisedValue`, `imprvClasses`

3. **Integration approach:**
   - Download ZIP via HTTP (no auth needed)
   - Parse CSV (standard comma-delimited with headers)
   - Filter by `propType` for residential
   - Map fields to Overtaxed schema

4. **Also consider:** The certified annual export (413MB ZIP) may have additional fields like neighborhood codes and beds/baths that aren't in the nightly GIS export.

5. **For neighborhood codes:** Check the certified data extract (`Denton_AppraisalDataExtracts_ALL(CERTIFIED).zip`) which likely contains full CAMA data with neighborhood assignments.

### DFW Market Size (Combined)
| County | Est. Residential Properties |
|--------|---------------------------|
| Dallas | ~900K |
| Tarrant | ~600K |
| Collin | ~400K |
| **Denton** | **~350-400K** |
| **DFW Total** | **~2.25-2.3M** |

---

## 6. Estimated Effort Summary

| County | Data Format | Pipeline Effort | Calendar Days |
|--------|------------|-----------------|---------------|
| Denton | CSV (nightly) | 3-5 days | Week 1-2 |
| Williamson | Socrata API | 2-3 days | Week 2-3 |
| Fort Bend | ZIP (XLSX/fixed-length) | 4-6 days | Week 4-5 |
| Bexar | ArcGIS API / PIA | 5-8 days + PIA wait | Week 6-8 |
| El Paso | Download files (TBD format) | 3-5 days | Week 8-9 |
| Montgomery | PIA / ArcGIS | 7-10 days + PIA wait | Week 10+ |

**Total new properties (all 6 counties): ~1.75-2.05M residential**

---

## 7. data.texas.gov (Socrata) Status

| County | On data.texas.gov? | Own Socrata Portal? |
|--------|-------------------|-------------------|
| Collin (existing) | ✅ `nne4-8riu` (Prelim), `6dqt-e958` (2024) | No |
| Denton | ❌ | No |
| Williamson | ❌ | ✅ `data.wcad.org` |
| Fort Bend | ❌ | No |
| Bexar | ❌ | No |
| Montgomery | ❌ | No |
| El Paso | ❌ | No |

**Key finding:** None of the 6 target counties publish to data.texas.gov. Only Collin County (already integrated) uses the state Socrata portal. Williamson has its own Socrata portal (`data.wcad.org`).

---

## 8. Data Quality Concerns

| County | Concern | Impact |
|--------|---------|--------|
| **All counties** | Confidential owners redacted per TX Property Tax Code §25.025 | Some addresses hidden |
| **Denton** | Nightly CSV may not include all CAMA fields (beds/baths/pool) | May need certified export supplement |
| **Bexar** | ArcGIS MapServer metadata says "Last update: September 2019" | ⚠️ May be stale — verify with PIA |
| **Fort Bend** | Multiple file formats (fixed-length, XLSX, ZIP) | Need to pick best source per use case |
| **Montgomery** | JS-rendered website prevents easy data discovery | Need browser or PIA to confirm availability |
| **All Texas** | Values are preliminary until certified (usually July) | Use certified data for production |

---

## Appendix: Key URLs

### Denton County
- Main site: `https://www.dentoncad.com/`
- Data portal: `https://dentoncad.net/`
- Data files: `https://dentoncad.net/data/_uploaded/files/datafiles/`
- Nightly CSV: `https://dentoncad.net/data/_uploaded/files/datafiles/gis/nightly_appraisals.zip`
- Schema: `https://dentoncad.net/data/_uploaded/files/datafiles/gis/schema.ini`
- Property search: `https://esearch.dentoncad.com/`

### Williamson County
- Main site: `https://www.wcad.org/`
- Socrata portal: `https://data.wcad.org/`
- Certified API: `https://data.wcad.org/resource/ai3c-c9pf.json`
- Preliminary API: `https://data.wcad.org/resource/553d-hn26.json`
- Data downloads: `https://www.wcad.org/data-downloads/`

### Fort Bend County
- Main site: `https://www.fbcad.org/`
- Data files: `https://www.fbcad.org/data-files/`
- GIS data: `https://www.fbcad.org/gis-data/`
- Open Data Hub: `https://fbcad-open-data-hub-fortbend.hub.arcgis.com/`
- File layout: `https://www.fbcad.org/wp-content/uploads/2020/01/Property-Data-File-Fixed-Length-Layout-.pdf`

### Bexar County
- Main site: `https://bcad.org/`
- ArcGIS: `https://maps.bexar.org/arcgis/rest/services/Parcels/MapServer/0`
- Open Data: `https://gis-bexar.opendata.arcgis.com/`
- PIA form: `https://bcad.org/wp-content/uploads/2023/10/Online-Public-Information-Request-Form-2023-02-1.pdf`
- Open Records email: `OpenRecords@bcad.org`

### Montgomery County
- Main site: `https://mcad-tx.org/`
- GIS data: `https://mcad-tx.org/gis-data/`
- County ArcGIS: `https://data-moco.opendata.arcgis.com/`
- Tax Parcel Hub: `https://hub.arcgis.com/datasets/MOCO::mcad-tax-parcel-view/`
- Property search: `https://www.esearch.mcad-tx.org/`

### El Paso County
- Main site: `https://epcad.org/`
- Open Government: `https://epcad.org/OpenGovernment`
- Property search: `https://epcad.org/Search`
