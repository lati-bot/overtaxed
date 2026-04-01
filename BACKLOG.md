# BACKLOG - Overtaxed Priority Tasks

## 🚨 URGENT - 2026 Data Drops (IN PROGRESS)

**Status: CRITICAL - New data found, purchases blocked**

### Immediate Actions (Next 2 hours)
- [x] **Houston & Dallas** - Found 2026 data drops (March 29 & 19)  
- [x] **Code Fix** - Unblock purchases by updating `has2026Data` to include Houston + Dallas
- [ ] **Download Data** - Grab HCAD 2026 Real_acct_owner.zip, Real_building_land.zip
- [ ] **Download Data** - Grab DCAD 2026 DCAD2026_CURRENT.ZIP  
- [ ] **Process Data** - Run precompute scripts for Harris County 2026
- [ ] **Process Data** - Run precompute scripts for Dallas County 2026
- [ ] **Upload to Azure** - Push processed data to Cosmos DB containers
- [ ] **QA Test** - Verify Houston/Dallas autocomplete, lookup, PDF generation
- [ ] **Ship to Prod** - Notify Tomi when ready to merge dev→main

### Also Check These Counties
- [ ] **Denton** - Verify 2026 data is current (nightly updates available)
- [ ] **Tarrant** - Check TAD for 2026 drops
- [ ] **Collin** - Check CCAD for 2026 drops  
- [ ] **Fort Bend** - Check FBCAD for 2026 drops

**Priority: P0 - Blocking revenue. May 15 deadline approaching.**

---

## High Priority (P1)

### QA & Testing
- [ ] Mobile autocomplete testing across all counties
- [ ] PDF generation edge cases (missing comps, etc.)
- [ ] Stripe checkout flow testing
- [ ] Email delivery verification

### Features & UX
- [ ] Improve PDF design/formatting
- [ ] Better evidence grades for marginal cases
- [ ] Faster autocomplete response times
- [ ] Social proof / testimonials integration

### New Markets
- [ ] Williamson County 2026 data research
- [ ] Bexar County 2026 data research  
- [ ] Rockwall County 2026 data research

---

## Medium Priority (P2)

### Content & SEO
- [ ] County-specific landing pages
- [ ] Blog content for deadline urgency
- [ ] FAQ updates for 2026 tax year
- [ ] Social media content for TX deadline

### Analytics & Optimization
- [ ] Conversion funnel analysis
- [ ] A/B testing framework
- [ ] Performance monitoring
- [ ] Customer feedback collection

---

## Completed ✅

### March 31, 2026
- ✅ **CRITICAL**: Found 2026 data drops for Houston & Dallas counties
- ✅ **CRITICAL**: Unblocked purchases by updating has2026Data code
- ✅ **Infrastructure**: Set up development environment and repos
- ✅ **Research**: Confirmed HCAD, DCAD, Denton have fresh 2026 data

---

## Notes

**Data Sources:**
- HCAD: https://hcad.org/pdata/pdata-property-downloads.html (updated March 29, 2026)
- DCAD: https://dallascad.org/dataproducts.aspx (2026 files available)  
- Denton: https://dentoncad.net/data/_uploaded/files/datafiles/gis/nightly_appraisals.csv

**Critical Dates:**
- **May 15, 2026**: Texas protest deadline  
- **Present**: 44 days remaining
- **April 15 target**: Most appraisal notices mailed

**Revenue Impact:**
- Houston & Dallas are largest TX markets
- Combined ~3M+ properties 
- Blocked purchases = lost revenue during peak season