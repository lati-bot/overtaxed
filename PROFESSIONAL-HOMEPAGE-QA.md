# Professional homepage preview QA — September 19, 2026

## Scope
- Professional research homepage at `/`; consumer UI moved to `/homeowners`.
- Existing API, checkout, results, success, and paid appeal routes remain in place.
- Homeowner UI/search implementation preserved; the copied Product offer URL now correctly points to `/homeowners` (not literally byte-identical after that intentional change).
- Consumer navigation, referral share URL, and return/search links now target `/homeowners`.
- Source-backed 2024 Cook case includes adverse evidence, exclusions, unresolved HIE treatment, historical-outcome limitations and a public-data-case-not-established conclusion.
- Published screening method now discloses the non-multiland control needed to reproduce the 162 eligible candidates.

## Verification
- `npm run build`: passed.
- `npx tsc --noEmit`: passed.
- `git diff --check`: passed.
- New professional page, metadata/layout, OG image, blog and calendar files: targeted ESLint passed.
- Broader affected-file lint is **not clean**: 20 existing errors (8 copied homeowner, 4 metro, 2 results, 6 success) and warnings. Programmatic ESLint comparison against committed originals produced identical diagnostics for each preserved consumer file. No new lint diagnostics introduced; this is not a claim of a clean repository-wide lint.
- Browser measured `/` and `/homeowners` at 320, 390, 600, 768, 1024 and 1440px. Document width equals viewport at all sizes. No out-of-bounds main content outside deliberately horizontally scrollable tables. Root global overflow hiding removed.
- Tablet workflow stacks before narrow columns become cramped. Mobile contact target measured 44px high.
- Method disclosure opens; mobile evidence table scrolls horizontally.
- Actual browser homeowner search `9725 s lasalle` returned Cook results and selecting a suggestion navigated to `/results?pin=25092210460000`.
- Rendered homeowner head verified: correct homeowner title/copy, canonical `/homeowners`, consumer OG image with actual 1200×1200 dimensions (not inherited professional image), Twitter metadata.
- Official dataset pages/query links returned valid records. BOR guidance returned 200. CCAO residential guidance returned 403 to command-line fetch on this pass; it was verified in the September 18 source research. Do not claim all guidance links returned 200 today.
- After Tomi found the direct API presentation confusing, all six cited assessment links and the decision link were routed through a readable source-record page. The seven raw Cook County API rows remain available as clearly labeled secondary audit links. The new page passed targeted ESLint, TypeScript/build, and 320/390/600/768/1024/1440px browser checks with no document overflow.
- No real payment, customer email or valid paid magic-link access exercised. Only navigation/error paths and unchanged fulfillment implementation reviewed.

## Before production approval
- Preview only; no production merge authorized.
- Tomi explicitly approved keeping the homeowner product de-emphasized at `/homeowners` and shipping the professional root on September 19. `/homeowners` deliberately remains `noindex, follow`, excluded from the sitemap, and self-canonicalized. Revisit only if consumer acquisition becomes strategic again.
- Existing consumer metro/blog/comparison copy still needs a separate positioning audit; preserving those pages does not resolve all professional-versus-DIY messaging tension.
- The contact CTA opens email; no upload, live filing, client-data collection, or validated professional product is claimed.
