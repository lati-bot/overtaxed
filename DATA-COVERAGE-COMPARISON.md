# Overtaxed — Data Coverage by Market

*Updated: February 12, 2026*

## Field Availability Across All Markets

| Field | Cook County (IL) | Houston (TX) | Dallas (TX) | Austin (TX) | Tarrant (TX) | Collin (TX) |
|-------|:---:|:---:|:---:|:---:|:---:|:---:|
| **Properties** | 971K | 1.17M | 632K | 382K | 662K | 377K |
| **Status** | ✅ Live | ✅ Live | ✅ Live | 🟡 Dev | 📊 Researched | 📊 Researched |
| Address | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 99.96% |
| City | ✅ | ✅ | ✅ | ✅ | ✅ 100% | ✅ 100% |
| Zip | ✅ | ✅ | ✅ | ✅ | ✅ 100% | ✅ 100% |
| Sqft | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 93% | ✅ 95.4% |
| Year Built | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 100% | ✅ 93% | ✅ 95.4% |
| **Bedrooms** | ✅ 100% | ❌ None | ✅ ~100% | ⚠️ 34% | ❌ Permanently N/A | ⚠️ 93-98%* |
| **Bathrooms** | ✅ 100% | ❌ None | ✅ ~100% | ⚠️ 91% | ❌ Permanently N/A | ⚠️ 93-98%* |
| **Stories** | ✅ | ❌ None | ✅ ~100% | ✅ | ✅ 93% | ⚠️ 93-98%* |
| Pool | ✅ | ❌ None | ✅ | ⚠️ 24% | ✅ (flag) | ✅ |
| Fireplaces | ✅ | ❌ None | ✅ | ⚠️ 64% | ❌ N/A | ❌ N/A |
| Ext Wall | ✅ | ❌ None | ✅ | ✅ | ❌ N/A | ❌ N/A |
| Neighborhood Code | ✅ | ✅ | ✅ | ✅ | ✅ 100% | ✅ 100% |
| Market Value | ✅ | ✅ | ✅ | ✅ | ✅ 98% | ✅ 100% |
| Land Value | ✅ | ✅ | ✅ | ✅ | ✅ 96% | ✅ |
| Improvement Value | ✅ | ✅ | ✅ | ✅ | ✅ 92% | ✅ |
| Quality Grade | — | — | — | — | ✅ 93% | — |
| Condition | — | — | — | — | ✅ 93% | — |

*\*Collin beds/baths/stories: available from MDB export (collincad.org), NOT from the Socrata API. Requires dual-source ETL.*

---

## Key Takeaway

**Houston is our biggest TX market and ships with ZERO beds, baths, stories, pool, or ext wall.** It works because the §42.26 "uniform & equal" argument is fundamentally about **$/sqft variance within neighborhoods** — not bedroom count.

Tarrant has *more* comp signals than Houston (quality grade, condition, stories) despite missing beds/baths.

---

## What Matters Most for the Legal Argument (§42.26)

| Priority | Field | Why |
|:---:|-------|-----|
| 1 | Neighborhood code | Groups comparable properties geographically |
| 2 | Sqft | Core denominator for $/sqft calculation |
| 3 | Market/appraised value | The number being protested |
| 4 | Year built | Age-adjusts comparisons |
| 5 | Stories / quality / condition | Refines comp similarity |
| 6 | Beds / baths | Nice-to-have, not legally required |
| 7 | Pool / fireplaces / ext wall | Minor adjustments |
