# Site Review — Overtaxed (getovertaxed.com)
**Date:** February 12, 2026  
**Reviewer:** Automated code review  
**Commit:** `5322431` (main/dev branch)

---

## Executive Summary

The site is a functional MVP with a solid design foundation. Houston and Cook County flows are both operational. However, there are several bugs, edge cases, inconsistencies, and missing error handling that could cause production issues. The biggest risks are: Stripe webhook has a completely different (stale) `getPropertyData` implementation, the success page doesn't respect dark theme, magic link fallback logic is fragile, and several API routes lack input sanitization.

---

## Critical Issues 🔴

### 1. Stripe Webhook Has Stale Code — Duplicate & Divergent `getPropertyData`
**File:** `src/app/api/webhook/stripe/route.ts`

The webhook route contains its own complete `getPropertyData` and `generatePdfHtml` implementations that are **completely different** from the one in `src/app/api/generate-appeal/route.ts`. The webhook version:
- Uses different field names (`char_bldg_sf` vs `bldg_sf`)
- Uses a different Browserless URL (`chrome.browserless.io` vs `production-sfo.browserless.io`)
- Generates a much simpler 3-page PDF vs the full BOR appeal package
- Doesn't use Cosmos analysis data properly
- Sends a simpler email without magic link access
- Has extensive console.log debugging left in

**Impact:** If a customer's email delivery is triggered via webhook (race condition with the success page), they get a different, lower-quality PDF than if triggered via the success page GET handler. The PDF from the webhook is the old 3-page "simple" version, not the comprehensive BOR appeal package.

**Fix:** The webhook should either: (a) call the same `getPropertyData` from generate-appeal, or (b) be disabled in favor of the success page's email sending, or (c) be completely rewritten to share the same code.

### 2. Webhook Doesn't Handle Houston Properties
**File:** `src/app/api/webhook/stripe/route.ts`

The webhook blindly passes `session.client_reference_id` as a Cook County PIN. For Houston properties (format `houston:ACCT`), it tries to look up `"houston:1234567"` as a Cook County PIN, fails silently, and returns a 404. The customer gets no email from the webhook path.

**Impact:** If the success page's email fails for a Houston customer, the webhook backup also fails. No redundancy.

**Fix:** Add Houston routing in the webhook: check if `pin.startsWith("houston:")`, extract the account number, and use the Houston data/PDF pipeline.

### 3. SQL Injection via Autocomplete
**File:** `src/app/api/autocomplete/route.ts`

```typescript
const whereClause = encodeURIComponent(`upper(property_address) like upper('${cleaned}%')`);
```

The `cleaned` variable is user input (uppercased but **not sanitized for SQL**). An input like `') OR 1=1 --` would inject into the Socrata SoQL query. While Socrata likely has protections, this is still dangerous.

**Impact:** Potential data exfiltration from Cook County's public API (which is public anyway, but it's still bad practice and could cause unexpected errors).

**Fix:** Escape single quotes in the input: `cleaned.replace(/'/g, "''")`.

### 4. Same SQL Injection in Lookup Route
**File:** `src/app/api/lookup/route.ts`

```typescript
const query = `${houseNum}%${street}%`;
const whereClause = encodeURIComponent(`upper(property_address) like upper('${query}')`);
```

Same issue — `houseNum` and `street` are derived from user input without escaping quotes.

---

## Major Issues 🟠

### 5. Success Page Doesn't Respect Dark/Light Theme
**File:** `src/app/success/page.tsx`

The success page uses hardcoded light theme (`bg-[#faf9f7]`, `text-gray-900`, etc.) with no dark mode support. Every other page in the app respects the user's theme preference from localStorage. A user in dark mode will get a jarring white flash when redirected to the success page.

**Fix:** Add the same theme state management as results-content.tsx.

### 6. Appeal/[token] Page Doesn't Respect Dark/Light Theme
**File:** `src/app/appeal/[token]/page.tsx`

Same issue — hardcoded light theme with `bg-[#faf9f7]`.

### 7. Success Page Magic Link Fallback is Fragile
**File:** `src/app/success/page.tsx`

The success page tries Cook County first, then falls back to Houston:
```typescript
const res = await fetch(url); // Cook County
let cookError = "Unknown error";
try {
  const data = await res.json();
  if (res.ok) { /* use Cook data */ return; }
  cookError = data.error;
} catch { cookError = "Cook County lookup failed"; }

// If Cook County failed, try Houston
const houstonRes = await fetch(houstonUrl);
```

**Problem:** This waterfall approach means Houston customers always wait for the Cook County request to fail first (extra latency). Worse, if Cook County returns a 200 with unexpected data (edge case), it might set property data from the wrong jurisdiction.

**Also:** When Dallas is added, this becomes Cook → Houston → Dallas — 3 sequential requests for Dallas users.

**Fix:** Use the `client_reference_id` format to route directly: if it starts with `houston:`, go to Houston. If it starts with `dallas:`, go to Dallas. Only fall back to Cook County for plain PINs.

### 8. Appeal/[token] Page Has Same Fragile Fallback
**File:** `src/app/appeal/[token]/page.tsx`

Same waterfall pattern: tries Cook County first, then Houston. The token format already encodes the jurisdiction (`houston:acct:sessionId`), but the client doesn't parse it — it just tries endpoints sequentially.

**Fix:** Parse the token prefix on the client to determine jurisdiction and call the correct endpoint directly.

### 9. Missing `acct` Dependency in useEffect
**File:** `src/app/results/results-content.tsx`

```typescript
useEffect(() => {
  if (!address && !pin && !acct) { router.push("/"); return; }
  fetchProperty();
}, [address, pin]); // ← missing `acct` in dependency array
```

The effect depends on `acct` but doesn't include it in the dependency array. If `acct` changes (e.g., via navigation), the effect won't re-run. The ESLint disable comment even acknowledges this.

### 10. Layout Metadata Says "Cook County" Only
**File:** `src/app/layout.tsx`

```typescript
description: "Get a professional property tax appeal package for Cook County. Fair assessment, guaranteed."
```

The meta description only mentions Cook County. Should mention all supported markets (Houston, and soon Dallas).

### 11. Cross-Partition Cosmos Queries Are Expensive
**File:** `src/app/api/houston/lookup/route.ts`

```typescript
const { resources } = await container.items.query({
  query: `SELECT * FROM c WHERE c.id = @acct`,
  parameters: [{ name: "@acct", value: acct.trim() }],
}).fetchAll();
```

Looking up by `id` with a cross-partition query when the container is partitioned by `neighborhood_code`. Should use a point read (`container.item(acct, partitionKey).read()`) instead. But since we may not know the partition key at lookup time, this requires either: (a) storing neighborhood_code alongside the account somewhere, or (b) using the id as partition key in the container design.

**Same issue in:** Houston generate-appeal, Houston comps route.

---

## Moderate Issues 🟡

### 12. No Rate Limiting on Any API Route
All API routes (`/api/autocomplete`, `/api/lookup`, `/api/houston/*`, `/api/create-checkout`, etc.) have zero rate limiting. A bot could:
- Hammer the autocomplete endpoint, causing excessive Cosmos RU consumption
- Trigger excessive Stripe checkout session creation
- Scrape all property data via lookup endpoint

**Fix:** Add Vercel's built-in rate limiting, or implement simple IP-based throttling.

### 13. Precomputed.json is Static/Stale
**File:** `src/data/precomputed.json`

This file is imported by `/api/comps/route.ts` and appears to contain data for a single neighborhood. It's not clear if this gets updated. If it's from the initial prototype, it may be stale.

**Impact:** The `/api/comps` endpoint may return outdated data. Though it's unclear if this endpoint is actually used in production (the results page uses `/api/lookup` and `/api/houston/lookup` instead).

### 14. Test/Debug Endpoints Are Deployed to Production
**Files:** `src/app/api/test-pdf/route.ts`, `src/app/api/debug-session/route.ts`

Both are accessible in production. The debug-session endpoint exposes Stripe session details. The test-pdf endpoint can trigger PDF generation and email sending.

**Fix:** Remove or protect these endpoints (e.g., require an admin API key).

### 15. Inconsistent Browserless URLs
- `generate-appeal/route.ts` uses `production-sfo.browserless.io`
- `webhook/stripe/route.ts` uses `chrome.browserless.io`
- `test-pdf/route.ts` uses `chrome.browserless.io`

The webhook and test routes are using the old Browserless URL. If the old URL is deprecated or has different behavior, PDFs from those routes could fail.

### 16. Cook County Generate-Appeal Calls Its Own API
**File:** `src/app/api/generate-appeal/route.ts`

```typescript
const lookupRes = await fetch(`${baseUrl}/api/lookup?pin=${pin}`);
```

The generate-appeal route makes an HTTP request to its own `/api/lookup` endpoint. This is a function calling another function on the same server, adding unnecessary network overhead and creating a circular dependency. Also `baseUrl` uses `process.env.VERCEL_URL` which may not always resolve correctly.

**Fix:** Extract the lookup logic into a shared utility function and call it directly.

### 17. No Loading States for Checkout Button
**File:** `src/app/results/results-content.tsx`

The "File My Protest — $49" button has no loading state. When clicked, it makes a POST to `/api/create-checkout`, but during that time the button looks like nothing happened. User might click it multiple times, creating multiple Stripe sessions.

**Fix:** Add a loading/disabled state to the checkout button while the request is in flight.

### 18. Hardcoded Tax Rates
Throughout the codebase:
- Houston: `0.022` (2.2%)
- Cook County: `0.20` (assessment multiplier)
- Dallas (in precompute): `0.022` (2.2%)

These are approximations. Real tax rates vary significantly by taxing district within each county. A property in one Houston ZIP code might pay 2.8% while another pays 1.9%.

**Not a bug per se** (the disclaimer covers this), but could lead to disappointed customers if the estimated savings are significantly off.

### 19. Email Error Handling Inconsistency
- **Houston generate-appeal:** Sends email synchronously, catches errors gracefully (best-effort)
- **Cook County generate-appeal:** Sends email asynchronously in background (fire-and-forget)
- **Webhook:** Sends email synchronously, returns 500 on failure

The Cook County approach means email failures are silently lost. The webhook approach means a failed email causes Stripe to retry the webhook (potentially sending duplicate orders).

### 20. No CSRF Protection on POST Endpoints
The `/api/create-checkout` endpoint accepts POST requests without any CSRF token validation. While Stripe's security mitigates most risks, it's still best practice.

---

## UX Issues 🟣

### 21. Mobile: Autocomplete Dropdown May Overflow
**File:** `src/app/page.tsx`

The autocomplete dropdown has `absolute` positioning with `top-full`. On small screens with the virtual keyboard open, the dropdown could extend below the visible viewport, making suggestions unreachable.

### 22. Mobile: Comparison Chart Doesn't Stack Well
**File:** `src/app/results/results-content.tsx`

The "Your Options" section uses `grid-cols-1 sm:grid-cols-3`. On mobile, 3 full comparison cards (DIY, Overtaxed, Tax Attorney) in a single column creates a very long scroll. The "Best Value" badge on the Overtaxed card may not be visible without scrolling.

### 23. No Back-to-Results Navigation from Checkout
If a user clicks "File My Appeal — $49", gets redirected to Stripe, then clicks "Cancel", they're sent to the results page via the `cancel_url`. But the cancel URL only has the PIN/acct — the page has to re-fetch all data, adding loading time and potentially losing context.

### 24. Neighborhood Stats Show "Over-Appraised" for Cook County
**File:** `src/app/results/results-content.tsx`

The Neighborhood Stats section uses `isHouston` guard but the text says "Over-Appraised" which is Houston terminology. The section only renders for Houston (`isHouston && property.neighborhoodStats`), so this is fine — but when Dallas is added, need to make sure it also shows for Dallas.

### 25. No Cookie/Privacy Banner
The site uses localStorage for theme preference. While this isn't cookie-based, GDPR/privacy compliance may still require disclosure depending on analytics tools used.

### 26. FAQ Says "Cook County, IL and Houston, TX" — Needs Dallas
**File:** `src/app/page.tsx`

Multiple places on the landing page reference only Cook County and Houston. These need to be updated when Dallas launches.

### 27. Home Page Hero Badge Says "Serving Cook County, IL & Houston, TX"
**File:** `src/app/page.tsx`

Same issue — needs updating for Dallas.

---

## Inconsistencies Between Markets 🔄

### 28. Houston Results Show Neighborhood Stats; Cook County Doesn't
The Houston flow shows neighborhood-level statistics (total properties, % over-assessed, avg reduction). Cook County results don't show this even though the data exists in Cosmos. This makes the Cook County results feel less compelling.

### 29. Different Token Formats
- Cook County: `base64url(pin:sessionId).hash` 
- Houston: `base64url(houston:acct:sessionId).hash`

This works but makes the fallback logic in success/appeal pages unnecessarily complex. A unified format like `jurisdiction:id:sessionId` would be cleaner.

### 30. Assessment History Only Shows for Cook County
Cook County results show a 5-year assessment history table. Houston doesn't show any history (the data isn't available in Cosmos). This is a data limitation, not a bug, but creates an inconsistent experience.

### 31. Cook County "Analysis Not Available" State vs Houston
Cook County has a graceful "analysis not available" state with an email notification signup. Houston doesn't have this — if a Houston property isn't in Cosmos, the lookup returns 404 and shows the error page. Should have a similar "we're still processing" state for Houston.

### 32. Different PDF Styles
The Cook County PDF (from generate-appeal) is a comprehensive multi-page BOR appeal package. The Houston PDF is similar but tailored for HCAD. However, the webhook version of the Cook County PDF is a completely different, simpler style. See Issue #1.

---

## Code Quality Notes 📝

### 33. No TypeScript Strict Mode
`tsconfig.json` should enable `strict: true` and `noUncheckedIndexedAccess` for better type safety.

### 34. Large Component Files
`results-content.tsx` is ~990 lines. Should be split into smaller components:
- `PropertyHeader`
- `OverAssessedHero`
- `FairlyAssessedBanner`
- `ComparisonChart`
- `HowItWorks`
- `FAQ`

### 35. Duplicated Theme/Navigation Code
Every page (home, results, success, appeal) re-implements the theme toggle and navigation bar. Should extract to a shared `<Navbar />` component.

### 36. No Error Boundary
No React error boundaries anywhere. If a component throws, users see a white screen.

### 37. Console.log Statements in Production
Multiple console.error and console.log statements throughout API routes. Should use a proper logging solution or at least structured logging.

### 38. Environment Variable Validation
No startup validation of required environment variables (COSMOS_CONNECTION_STRING, STRIPE_SECRET_KEY, RESEND_API_KEY, BROWSERLESS_TOKEN). Missing any of these causes runtime errors rather than clear startup failures.

---

## Summary: Priority Order

| Priority | Issue | Effort |
|----------|-------|--------|
| 🔴 P0 | #1 Webhook stale code | Medium |
| 🔴 P0 | #2 Webhook doesn't handle Houston | Medium |
| 🔴 P0 | #3-4 SQL injection in autocomplete/lookup | Low |
| 🟠 P1 | #5-6 Success/Appeal pages not themed | Low |
| 🟠 P1 | #7-8 Fragile magic link fallback | Medium |
| 🟠 P1 | #14 Debug endpoints in production | Low |
| 🟠 P1 | #10 Metadata only mentions Cook County | Low |
| 🟡 P2 | #12 No rate limiting | Medium |
| 🟡 P2 | #16 Self-calling API | Medium |
| 🟡 P2 | #17 No checkout button loading state | Low |
| 🟡 P2 | #19 Email handling inconsistency | Medium |
| 🟡 P2 | #15 Inconsistent Browserless URLs | Low |
| 🟣 P3 | #34-35 Component refactoring | High |
| 🟣 P3 | #21-22 Mobile UX polish | Medium |

---

*End of review. All findings are based on static code analysis without running the application.*
