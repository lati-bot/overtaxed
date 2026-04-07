# How Exemptions Affect Property Tax Comparisons — Research Findings

## Executive Summary

**Exemptions do NOT change assessed values.** They are applied AFTER the assessed value is determined, at the EAV or taxable value stage. Our comps compare assessed values, so exemptions are irrelevant to the numbers we use.

However, Texas has a special case — the **homestead cap** — that DOES change the value used in §42.26 comparisons, and the statute explicitly accounts for it.

---

## Cook County, Illinois

### How the Tax Bill is Calculated (Order of Operations)

Source: [Cook County Assessor — Your Assessment Notice and Tax Bill](https://www.cookcountyassessoril.gov/your-assessment-notice-and-tax-bill)

1. **Fair Market Value** — determined by the Assessor
2. **Assessed Value** = 10% of Fair Market Value (for residential; 25% for commercial)
3. **Equalized Assessed Value (EAV)** = Assessed Value × State Equalizer (3.0355 for 2024)
4. **Exemptions subtracted from EAV** — Homeowner ($10,000), Senior ($8,000), Senior Freeze (freezes EAV at base year)
5. **Net EAV** = EAV − Exemptions
6. **Tax Bill** = Net EAV × Local Tax Rate

**Key takeaway:** Assessed Value (step 2) is determined BEFORE exemptions (step 4). A senior with a $10K homeowner exemption and a Senior Freeze has the **exact same assessed value** as a 30-year-old with no exemptions. Their tax bills differ, but that's step 4-6, not step 1-2.

### What the Board of Review Looks At

Source: [Cook County Board of Review — How to Present a Case Based on Lack of Uniformity](https://www.cookcountyboardofreview.com/how-present-case-based-lack-uniformity)

The BOR says comparable properties should be:
- "Preferably on your own block; may also be a block or two away, must be within your neighborhood"
- "Similar to yours in size, type of construction, age, construction materials, and general condition"
- Same property class (e.g., 2-03)

They ask for: **addresses, PINs, assessed values, and photos.**

They do NOT mention:
- Exemption status of comparables
- EAV or taxable value of comparables
- Whether the owner is a senior

The comparison is purely on **assessed values** — the assessor's opinion of value, not what anyone pays in taxes.

### Does the Assessor Lower Values for Senior Properties?

This is speculative. There is no official policy or documented practice of the Cook County Assessor deliberately under-assessing senior-owned properties. The assessment is supposed to be based on property characteristics (size, age, condition, location, class), not owner demographics.

**However:** The Senior Freeze exemption freezes the EAV, meaning even if the assessed value goes up, the tax bill doesn't change. This could theoretically reduce the incentive for the Assessor to maintain accurate assessments on frozen properties, since corrections wouldn't affect the tax bill anyway. **This is speculation, not documented policy.**

The large drops we saw (40-50% reductions in assessment for some comps) occurred during the 2025 south triad reassessment and could be explained by:
- Genuine market decline in that neighborhood
- Data corrections during reassessment
- Condition deterioration captured during reassessment
- The Assessor's mass appraisal model recalibrating for that neighborhood

We cannot determine which explanation is correct without more data.

---

## Texas

### The Three Values

Texas has three distinct values for homesteaded properties:

Source: [Williamson CAD — Market Value and the Homestead Cap](https://www.wcad.org/hs-cap/)

1. **Market Value** — What the CAD thinks the property is worth (100% of market value). Can go up or down any amount.
2. **Assessed Value (Capped Value)** — Cannot increase more than 10% per year from the prior year's assessed value (for homesteaded properties). This is the value used for taxation.
3. **Taxable Value** — Assessed Value minus exemptions (homestead $100K, over-65, disabled veteran, etc.)

Example from Williamson CAD:
- 2021: Market $318,138, Assessed $280,084
- 2022: Market $462,603, Assessed **$308,092** (capped at 10% above prior year)

### §42.26 — Which Value Does the Uniform & Equal Comparison Use?

Source: [Texas Tax Code §42.26(d)](https://texas.public.law/statutes/tex._tax_code_section_42.26)

The statute explicitly addresses this:

> **(d) For purposes of this section, the value of the property subject to the suit and the value of a comparable property or sample property that is used for comparison must be the market value determined by the appraisal district when the property is subject to the limitation on appraised value imposed by Section 23.23.**

**Translation:** When comparing properties under §42.26, you must use **MARKET VALUE** (the uncapped value), NOT the assessed/capped value, for any homesteaded property.

This means:
- A house with market value $400K but capped assessed value $300K → for §42.26 comparison purposes, use $400K
- The homestead cap is irrelevant to the uniformity argument
- Exemptions (homestead, over-65, disabled) reduce taxable value but not market value — also irrelevant

### What This Means for Our Data

**CRITICAL QUESTION:** Which value are our TX precompute scripts using?

| County | Field Used | Type | Risk |
|--------|-----------|------|------|
| Houston | `tot_appr_val` | Appraised (uncapped) | ✅ Safe |
| Dallas | `TOT_VAL` | Need to verify | ⚠️ Check |
| Collin | Need to verify | Need to verify | ⚠️ Check |
| Tarrant | Need to verify | Need to verify | ⚠️ Check |
| Denton | Need to verify | Need to verify | ⚠️ Check |
| Williamson | Need to verify | Need to verify | ⚠️ Check |
| Fort Bend | Need to verify | Need to verify | ⚠️ Check |
| Rockwall | Need to verify | Need to verify | ⚠️ Check |
| Bexar | Need to verify | Need to verify | ⚠️ Check |
| Austin | Need to verify | Need to verify | ⚠️ Check |

If any TX county uses assessed/capped values instead of appraised/market values, our comps could include properties with artificially low values due to the homestead cap — which would be legally incorrect per §42.26(d).

---

## Conclusions

### Cook County (Illinois)
1. **Assessed value is clean** — it does not include any exemption reductions. Confirmed by the Assessor's own documentation of the tax bill calculation order.
2. **The BOR evaluates comps on assessed values** — no mention of exemption status in their guidance.
3. **Exemptions are irrelevant to our comp selection** — we can use any property regardless of exemption status.
4. **The speculation about lazy assessment on senior properties is unproven** — assessment drops during reassessment years are normal and have many possible explanations.

### Texas
1. **§42.26(d) explicitly requires MARKET VALUE** for uniform & equal comparisons, even when properties have homestead caps.
2. **Exemptions (homestead $100K, over-65, disabled) don't affect market value** — they only reduce taxable value.
3. **The homestead cap DOES create a different "assessed value"** that is lower than market value — but the statute says to ignore it for comparison purposes.
4. **We MUST verify our TX precompute scripts use appraised/market value, NOT assessed/capped value.** Houston is confirmed safe. Other counties need audit.

### Action Items
1. ✅ No changes needed for Cook County comp selection regarding exemptions
2. ⚠️ Audit all TX precompute scripts to verify they use market/appraised value (not capped/assessed)
3. Proceed with comp algorithm improvements (year built, beds/baths scoring) as planned — exemptions do not need to be factored in

---

## Sources

1. Cook County Assessor — "Your Assessment Notice and Tax Bill": https://www.cookcountyassessoril.gov/your-assessment-notice-and-tax-bill
2. Cook County Assessor — "Exemptions": https://www.cookcountyassessoril.gov/exemptions
3. Cook County Board of Review — "How to Present a Case Based on Lack of Uniformity": https://www.cookcountyboardofreview.com/how-present-case-based-lack-uniformity
4. Cook County Assessor — "Residential Appeals": https://www.cookcountyassessoril.gov/residential-appeals
5. Texas Tax Code §42.26 — Remedy for Unequal Appraisal: https://texas.public.law/statutes/tex._tax_code_section_42.26
6. Williamson CAD — "Market Value and the Homestead Cap": https://www.wcad.org/hs-cap/
7. Texas Comptroller — "Valuing Property": https://comptroller.texas.gov/taxes/property-tax/valuing-property.php
8. SquareDeal Tax — "What does 'value is unequal compared with other properties' mean?": https://blog.squaredeal.tax/texas/value-is-unequal-compared-with-other-properties/
9. SquareDeal Tax — "Equalized Assessed Value (EAV) in Illinois": https://blog.squaredeal.tax/illinois/equalized-assessed-value-eav/
10. IL Chief County Assessment Officers — "How to Calculate a Tax Bill": http://www.il-ccao.org/what-is-assessment/how-to-calculate-a-tax-bill/
