# Overtaxed Architecture Analysis: Unified vs Per-County Routes

**Date:** February 17, 2026  
**Context:** Currently 10 counties (9 TX + Cook County IL), expanding to all available TX + IL counties

---

## Current State

**40 route files** across 10 counties, each with 4 routes (autocomplete, lookup, comps, generate-appeal).

After diffing every county's routes, there are **three distinct patterns**:

### Pattern A: TX Counties with Full Data (Dallas, Austin, Fort Bend, Collin)
- Cosmos DB query with beds, baths, pool, fireplaces, year built, sqft
- PDF shows full property characteristics table
- Comps table includes beds/baths columns

### Pattern B: TX Counties with Limited Data (Houston, Tarrant, Denton, Williamson, Rockwall)
- Cosmos DB query, same structure but missing some fields
- Houston/Tarrant: no beds/baths
- Rockwall: no sqft at all (comps by appraised value only)
- Denton/Williamson: no beds/baths/year_built
- PDFs adapted per available fields

### Pattern C: Cook County (IL)
- **No Cosmos DB** — queries Cook County's external Socrata API directly
- Different data model (PIN instead of acct, township instead of neighborhood)
- 1,054-line generate-appeal with IL-specific legal citations (35 ILCS 200/16-70)
- Completely different appeal process (Board of Review, not ARB)

---

## Diff Summary: What Actually Varies

### Autocomplete (trivially different)
| What changes | Example |
|---|---|
| Container name | `houston-properties` vs `dallas-properties` |
| City cleanup list | Houston cities vs Dallas cities |
| Default city | `HOUSTON` vs `DALLAS` |
| Error log prefix | `[houston/autocomplete]` vs `[dallas/autocomplete]` |

**Verdict: 100% unifiable via config**

### Lookup (minor differences)
| What changes | Example |
|---|---|
| Container name | varies |
| Fields returned | beds/baths/pool/stories when available, omitted when not |
| Neighborhood stats | $/sqft for most, median value for Rockwall (no sqft) |
| Default city + jurisdiction | varies |

**Verdict: 95% unifiable. Need a "available fields" config per county.**

### Comps (minor differences)
| What changes | Example |
|---|---|
| Container name | varies |
| SELECT fields | beds/baths included when available |
| Response mapping | extra fields when present |

**Verdict: 95% unifiable. Same "available fields" config.**

### Generate-Appeal (substantially different)
| What changes | Example |
|---|---|
| Container name | varies |
| Property interface | different fields per county |
| PDF HTML template | entirely different per state (TX vs IL) |
| Legal citations | §42.26 (TX) vs 35 ILCS (IL) |
| Filing instructions | different protest portal, process, deadlines |
| Comp table columns | varies by available data |

**Verdict: Data-fetch portion unifiable. PDF template must stay per-county (or per-state with county config).**

---

## Architecture Options

### Option 1: Full Unification (everything in `[county]` dynamic routes)
- 4 dynamic routes handle all counties
- Config map defines everything per county
- Generate-appeal dispatches to state-specific PDF templates

**Pros:** Minimum code, maximum DRY  
**Cons:** Cook County doesn't fit (external API, not Cosmos). Dynamic routes catch all paths, harder to debug. One bug breaks everything.

### Option 2: Two Tiers — Cosmos Counties (unified) + External API Counties (separate)
- Unified dynamic routes for all Cosmos-based counties (all TX + future IL)
- Cook County keeps its current standalone routes
- Generate-appeal has per-state PDF templates called from the unified route

**Pros:** Clean separation between data sources. Cosmos counties are genuinely identical in structure. Cook County's uniqueness is preserved.  
**Cons:** Still need to handle field availability (beds/baths/sqft) in the unified routes.

### Option 3: Per-State Unification
- `api/tx/[county]/...` — unified routes for all TX counties
- `api/il/[county]/...` — unified routes for all IL Cosmos counties  
- `api/cook/...` — stays as-is (external API)

**Pros:** State-level grouping is natural (same legal framework, same deadline, same protest process within a state). IL counties will share a lot too.  
**Cons:** Need URL migration or redirects. More complex routing structure.

### Option 4: Unify Only autocomplete/lookup/comps, Keep generate-appeal Per-County
- 3 unified dynamic routes + per-county PDF generation
- Best of both worlds?

**Pros:** Captures 80% of the duplication. PDF stays easy to customize.  
**Cons:** Still need per-county route files for generate-appeal. Routing mix of dynamic + static is awkward in Next.js.

---

## Recommendation: Option 2

**Unify all Cosmos-based counties under dynamic `[county]` routes. Keep Cook County separate.**

### Why:

1. **Data source is the real architectural boundary.** All TX counties and future IL Cosmos counties query Cosmos DB identically. Cook County queries an external API. This is a real technical split, not an arbitrary grouping.

2. **Field availability is config, not code.** Whether a county has beds/baths is a boolean in a config object. The query includes those fields when available, the response maps them when present, the PDF shows them when they exist. This is a config problem, not a code problem.

3. **PDF templates split by state, not county.** Within Texas, all PDFs reference §42.26, ARB protests, May 15 deadline. The only county-specific parts are: protest portal URL, county name, and which columns to show. That's template variables, not separate templates. Same will apply within IL — all share 35 ILCS, Board of Review process. We'd have `pdf-template-tx.ts` and `pdf-template-il.ts`, not 15 separate files.

4. **Cook County stays clean.** It's fundamentally different (external API, no Cosmos, different data model). Forcing it into the same dynamic route adds complexity for no benefit. It can stay as-is and nobody's confused about why.

5. **Future IL counties slot right in.** DuPage, Lake, Will — all will use Cosmos DB with bulk data downloads, same as TX counties. They just need a config entry + an IL PDF template. Two things instead of sixteen files.

### Config structure:
```typescript
const COUNTY_CONFIG: Record<string, CountyConfig> = {
  houston: {
    container: "houston-properties",
    state: "TX",
    defaultCity: "HOUSTON",
    jurisdiction: "harris_county_tx",
    taxRate: 0.022,
    protestPortal: "https://hcad.org",
    deadline: "May 15",
    cityCleanupPattern: /,?\s*(HOUSTON|KATY|SUGAR LAND|...)\b.*$/i,
    availableFields: { beds: false, baths: false, pool: false, sqft: true, yearBuilt: true },
  },
  dallas: {
    container: "dallas-properties",
    state: "TX",
    defaultCity: "DALLAS",
    jurisdiction: "dallas_county_tx",
    taxRate: 0.022,
    protestPortal: "https://dallascad.org",
    deadline: "May 15",
    cityCleanupPattern: /,?\s*(DALLAS|GARLAND|IRVING|...)\b.*$/i,
    availableFields: { beds: true, baths: true, pool: true, sqft: true, yearBuilt: true },
  },
  // ... same for all TX + future IL cosmos counties
};
```

### Migration plan:
1. Build the unified routes + config on `dev`
2. Test every county's full flow (search → results → appeal)
3. Delete old per-county route folders
4. Merge to main

### What about URLs?
`/api/houston/autocomplete` → `/api/houston/autocomplete` — URLs stay identical. Next.js `[county]` dynamic segment just matches `houston` at runtime instead of compile time. No user-facing change, no Stripe link breakage.

---

## Risk Mitigation

| Risk | Mitigation |
|---|---|
| One bug breaks all counties | Better than same bug silently existing in 10 copies. Add county-specific integration tests. |
| Field availability edge cases | Explicit `availableFields` config — code checks before including in query/response |
| Cook County confusion | Clear separation: Cosmos counties in `[county]`, Cook in `api/` root. Add code comments. |
| Rockwall no-sqft edge case | Handle in unified lookup/comps with `if (config.availableFields.sqft)` branching |
| URL regression | Existing URLs unchanged. Verify with curl tests post-migration. |

---

## Effort Estimate

- Config map + 3 unified routes (autocomplete, lookup, comps): **2-3 hours**
- PDF template per state (TX template, IL template): **1-2 hours**
- Unified generate-appeal with state dispatch: **1-2 hours**  
- Testing all counties: **1-2 hours**
- Total: **5-9 hours** (one-time)

vs. adding each new county at **1-2 hours** copy-paste. Break-even at ~4-5 more counties (which we'll easily exceed with IL expansion).
