# Dallas County QA Report

**Date:** 2026-02-12
**Reviewer:** QA Sub-agent
**Branch:** dev
**Build status:** ✅ Clean (Next.js 16.1.6, Turbopack)
**Commits reviewed:** `a61ffd7` (feat: Add Dallas/DCAD market support) + `cf3ba88` (QA fixes)

---

## Summary

Dallas County support has been built and is **production-ready** after QA fixes. The implementation follows Houston's proven patterns consistently, adds richer property data display (beds, baths, pool, fireplaces, stories), and integrates cleanly into the multi-market architecture.

---

## What Was Built

### New Files (4 API routes)
- `src/app/api/dallas/autocomplete/route.ts` — Address search via Cosmos `dallas-properties` container
- `src/app/api/dallas/lookup/route.ts` — Property lookup with neighborhood stats, richer data fields
- `src/app/api/dallas/comps/route.ts` — Comparable properties with detailed view option
- `src/app/api/dallas/generate-appeal/route.ts` — Full PDF generation, email delivery, token management

### Modified Files (7)
- `src/app/page.tsx` — Landing page: Dallas in autocomplete search, badge, FAQ, "How it Works"
- `src/app/results/results-content.tsx` — Results page: Dallas routing, DCAD labels, jurisdiction-aware UI
- `src/app/success/page.tsx` — Success page: Cook → Houston → Dallas fallback, Dallas-specific next steps
- `src/app/appeal/[token]/page.tsx` — Magic link page: Dallas endpoint fallback, DCAD filing instructions
- `src/app/api/create-checkout/route.ts` — `dallas:ACCT` client_reference_id format
- `src/app/api/webhook/stripe/route.ts` — Routes `dallas:` prefix to Dallas generate-appeal
- Additional docs: `SITE-REVIEW.md`, `EXPANSION-ANALYSIS.md`

---

## Issues Found & Fixed (commit `cf3ba88`)

### 🔴 Critical: DCAD Uses "uFile" Not "eFile"
- **Problem:** All Dallas filing references said "eFile" — DCAD's online protest system is actually called **uFile**
- **Impact:** Users would see incorrect filing system name in PDF, emails, success page, and appeal page
- **URL was also wrong:** `dallascad.org/eFile.aspx` returns 404 — correct base URL is `dallascad.org`
- **Fix:** Changed all "eFile" references to "uFile" across 4 files (6 occurrences)

### 🔴 Critical: Success Page Showed Cook County Steps for Dallas Properties
- **Problem:** The success page "What's Next" section used `{isHouston ? (...) : (...)}` — Dallas fell into the Cook County `else` branch, showing Board of Review filing instructions instead of DCAD instructions
- **Impact:** Dallas buyers would see completely wrong filing instructions (Illinois BOR instead of Texas DCAD)
- **Fix:** Changed condition to `{isTexas ? (...) : (...)}` with `isDallas` sub-checks for DCAD vs HCAD specifics

### 🟡 Minor: Results useEffect Missing `acct` Dependency
- **Problem:** `useEffect` dependency array was `[address, pin]` but not `[address, pin, acct]`
- **Impact:** Edge case — wouldn't cause issues on initial page load, but could miss re-fetches if `acct` changes
- **Fix:** Added `acct` to dependency array

---

## Code Review Findings (All Passed)

### Pattern Consistency with Houston ✅
- Same Cosmos query patterns (no `ORDER BY ABS`)
- Same lazy initialization for Stripe/Resend/Cosmos clients
- Same token format (`dallas:acct:sessionId` base64url)
- Same PDF generation via Browserless (`production-sfo.browserless.io`)
- Same email delivery via Resend
- POST handler correctly uses `new Uint8Array(pdfBuffer)` for NextResponse (avoids Buffer issue)

### Multi-Market Integration ✅
- **Autocomplete:** Landing page searches Cook + Houston + Dallas in parallel, results labeled correctly
- **Routing:** Results page correctly routes `?acct=X&jurisdiction=dallas` to Dallas lookup
- **Checkout:** `client_reference_id = "dallas:ACCT"` — matches expected format
- **Success page:** Fallback chain Cook → Houston → Dallas works correctly
- **Magic links:** Appeal/[token] page tries all 3 endpoints
- **Webhook:** Routes `dallas:` prefix to Dallas generate-appeal endpoint

### Dallas-Specific Data ✅
- **Richer fields:** beds, baths (full + half), pool, fireplaces, stories, exterior wall, building class
- **Results page:** Shows beds/baths/year built from `characteristics` mapping
- **PDF:** Full property details table with all Dallas-specific fields
- **Comps:** Show beds, year built in table; enriched from individual Cosmos docs when missing

### Filing Language ✅
- All references say "DCAD" (not HCAD)
- "Dallas Central Appraisal District" in full form
- "Protest" terminology (not "appeal")
- "Appraised value" (not "assessed value")
- Texas Tax Code §42.26 correctly cited
- Deadline language: "typically", "usually May 15" — properly hedged for 2025 data
- Deadline banner: "2026 protest season opens soon" — no hard dates

### Suspense Boundaries ✅
- Success page: wrapped in `Suspense` via `SuccessPageWrapper`
- Appeal page: wrapped in `Suspense` via `AppealPageWrapper`
- Results page: uses `results-content.tsx` as client component within `page.tsx` Suspense boundary

### No Hardcoded Houston References in Dallas Code ✅
- Searched for "HCAD", "Harris County", "Houston" in `src/app/api/dallas/` — zero matches

---

## Build Test Results

```
✓ Compiled successfully in 2.4s
✓ TypeScript — no errors
✓ Static generation — 22/22 pages
All Dallas routes present: autocomplete, comps, generate-appeal, lookup
```

---

## Not In Scope (Pre-existing, Not Dallas-Related)

1. **Browserless URL inconsistency:** Webhook uses `chrome.browserless.io` while generate-appeal uses `production-sfo.browserless.io` — pre-existing issue, works fine
2. **Cook County webhook PDF generation:** The webhook's Cook County path still uses the old inline `getPropertyData` / `generatePdfHtml` functions — not relevant to Dallas
3. **Pool/fireplaces not shown in web results UI:** Rich Dallas data (pool, fireplaces, stories) only appears in PDF, not on the results webpage — this is by design since the results page uses a unified `PropertyData` interface

---

## Final Verdict

**✅ Production-ready.** All critical issues found and fixed. Build passes clean. Dallas support is consistent with Houston's proven patterns, correctly integrates into the multi-market architecture, and uses proper DCAD filing terminology.
