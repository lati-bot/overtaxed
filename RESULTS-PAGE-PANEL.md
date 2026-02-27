# Results Page Expert Design Panel Report

**Date:** February 27, 2026  
**Pages evaluated:** Cook County IL (PIN 13014180090000) and Harris County TX (Acct 0030340000009)  
**Product:** Overtaxed — $49 property tax appeal package

## The Panel

1. **Maya Chen** — Conversion UX Designer (10+ yrs SaaS/fintech)
2. **Derek Washington** — Real Estate Consumer Product PM (shipped tax/mortgage/insurance products)
3. **Dr. Priya Kapoor** — Behavioral Economist (financial decision-making under uncertainty)
4. **Luis Ortega** — Information Designer (data-heavy financial/government tools)
5. **Karen Trujillo** — Property Tax Professional (former county assessor, now consultant)

---

## Question 1: Information Hierarchy

**What order should sections appear? Should it differ between jurisdictions?**

**Maya (UX):** The hero → your home vs neighbors → CTA is the critical above-the-fold sequence, and both pages mostly get this right. But Cook buries the CTA beneath assessment history and comps — that's a conversion killer. The first CTA should come immediately after the "your home vs neighbors" bar, before any deep-dive data. Assessment history and comps are *supporting evidence*, not the headline.

**Derek (PM):** Homeowners need three things fast: (1) am I overpaying, (2) how much, (3) what do I do about it. Both pages answer 1 and 2 in the hero, but the path to 3 diverges. Cook makes you scroll through a history table before you see comps or a real CTA. Houston's waitlist CTA is right after the hero, which is better positioning even though it's a waitlist.

**Dr. Kapoor (Behavioral Econ):** The hero stats create an anchoring effect — "you're overpaying $4,142/year" — that's strong. But the longer you make someone scroll before acting, the more "cooling off" occurs. Assessment history is analytically interesting but emotionally neutral. It should come *after* the CTA, not before. The progression should be: alarm → proof → action → more proof for the skeptical.

**Luis (Info Design):** Both pages follow a roughly linear scroll, which is fine for a one-time decision page. But Cook has too many sections between the emotional hook and the action. I'd recommend: Hero → Home vs Neighbors → First CTA → Comps (proof) → [Assessment History / Neighborhood Stats] → How It Works → Pricing Comparison → FAQ → Final CTA. This works for both jurisdictions with the bracketed section varying by data availability.

**Karen (Tax Pro):** Assessment history is gold for Cook County because it shows the pattern of reductions — that the system actually works. But showing it before comps puts the cart before the horse. Comps are the evidence that drives the appeal; history is the confidence builder. Lead with comps.

**Agreements:** All five agree the first CTA should come earlier on Cook County. All agree hero → home vs neighbors is the right opening.

**Disagreements:** Minor — Karen values assessment history higher than others do for Cook specifically.

**Panel Recommendation (High Confidence):**
Both pages should follow the same structural template:
1. Hero stats (value, overpayment, savings)
2. Your Home vs Neighbors bar
3. **First CTA** (buy or waitlist)
4. Comparable Properties (proof)
5. Neighborhood Stats (social proof — add to Cook)
6. Assessment History (if available)
7. How It Works
8. Pricing Comparison
9. FAQ
10. **Final CTA** (sticky or section)

Cook County needs to move assessment history below comps and add a CTA before comps.

---

## Question 2: Consistency vs. Customization

**Maya (UX):** Layout, visual hierarchy, brand, and CTA placement should be 100% consistent. The skeleton is the product — it's what scales. Customization should happen in three places: terminology (assessed vs appraised), jurisdiction-specific deadlines/process, and which data sections appear based on availability. The principle: structure is brand, content is local.

**Derek (PM):** Users won't compare the two pages, so perfect consistency isn't for the user — it's for the team's ability to maintain and iterate. Keep the component system identical. Swap in jurisdiction-specific language and data. The "How It Works" steps should reflect the actual process (Cook's two-level appeal vs TX's single protest), and deadlines obviously differ.

**Dr. Kapoor (Behavioral Econ):** Trust is built through pattern consistency. If someone in Cook County recommends Overtaxed to a friend in Houston, the friend should land on a recognizably similar experience. Inconsistency breeds suspicion — "is this the same product?" Consistent framing of the value prop matters more than consistent data sections.

**Luis (Info Design):** The principle should be: **consistent container, variable content.** Same card styles, same section headers, same CTA buttons. But if a jurisdiction doesn't have neighborhood stats, don't show an empty section — just omit it gracefully. Never fake data for consistency.

**Karen (Tax Pro):** Terminology *must* differ. "Assessment" (IL) vs "Appraised Value" (TX) isn't cosmetic — using the wrong term signals you don't know the jurisdiction. "Appeal" vs "Protest" similarly. The filing process steps in "How It Works" should be accurate to the jurisdiction. Getting this wrong destroys credibility instantly.

**Agreements:** Universal agreement on consistent layout + jurisdiction-specific content/terminology.

**Panel Recommendation (High Confidence):**
**Principle:** Same skeleton, local flesh. Consistent: brand, layout, component design, CTA placement, section ordering. Customized: terminology (appeal/protest, assessed/appraised), process steps, deadlines, available data sections. Never show a section with no data; never use wrong terminology.

---

## Question 3: Comp Presentation

**Houston shows "5 comparable homes" in hero but "136 comparable homes assessed lower" in body. Cook shows "396 comparable homes" everywhere.**

**Maya (UX):** The mismatch in Houston is confusing. "5 comparable homes" and "136 comparable homes assessed lower" sound like different things, and they probably are, but the user shouldn't have to figure that out. Pick one framing and stick with it. For Cook, 396 is a big impressive number but it might also seem imprecise — "did you really analyze 396 homes for me?"

**Derek (PM):** These are two different numbers answering two different questions. The hero "5 comparable homes" in Houston is likely the closest comps used in the analysis. The "136" is a broader neighborhood stat. Both are useful but they need clear labels. Something like "Based on 5 closely matched homes" in the hero and "136 of 273 homes in your neighborhood are assessed lower" in the neighborhood section.

**Dr. Kapoor (Behavioral Econ):** Larger numbers create social proof — "396 comparable homes" feels like overwhelming evidence in your favor. But if the number feels inflated, it backfires. The hero should use the tight, specific number (the actual comps in the analysis — 5 in Houston, whatever the real number is in Cook). The larger number belongs in a neighborhood/social proof context. Mixing them creates cognitive dissonance.

**Luis (Info Design):** The information architecture problem is clear: two different metrics are being presented as if they're the same thing. I'd define them crisply: **"X comparable homes in your analysis"** (the actual comps) vs **"Y homes in your neighborhood assessed lower"** (the broader stat). Use the small number in the hero and comp section. Use the large number in neighborhood stats only.

**Karen (Tax Pro):** In a real appeal, you'll present 5-8 comps, not 396. Claiming 396 comparable properties suggests a loose definition of "comparable." Assessors and hearing officers will scrutinize comps — quality over quantity matters. For credibility, lead with the tight number of real comps. The broader stat is useful as social proof but shouldn't be conflated with the evidence package.

**Agreements:** All five agree the two numbers serve different purposes and should be clearly distinguished. All agree the hero should use the smaller, tighter comp count.

**Disagreements:** None significant.

**Panel Recommendation (High Confidence):**
- **Hero:** Show only the number of comps actually used in the analysis (e.g., "Based on 5 comparable homes"). For Cook, if 396 isn't the real analysis comp count, find and show the actual number.
- **Body/Neighborhood section:** Use the larger number with clear context: "X of Y homes in your neighborhood are assessed lower than yours."
- **Never mix the two numbers** without clear labeling.
- Cook County's "396 comparable homes" needs investigation — is that the real comp set or a neighborhood stat being mislabeled?

---

## Question 4: $/sqft Formatting

**Cook rounds ($30/$21), Houston uses decimals ($257/$213.57).**

**Maya (UX):** Round numbers are easier to process and compare at a glance. $30 vs $21 is instantly clear. $257 vs $213.57 takes an extra beat. Since this is a persuasion page, not a data export, go with whole dollars. The precision of cents doesn't add trust — it adds friction.

**Derek (PM):** Consistency across markets matters. If Cook rounds and Houston doesn't, it looks like two different products. Round both. The cents don't change the decision.

**Dr. Kapoor (Behavioral Econ):** There's a phenomenon called "precision bias" where precise numbers ($213.57) are perceived as more accurate/trustworthy than round numbers. However, this cuts both ways — on a page designed for quick comprehension, the cognitive load of decimals hurts more than the trust helps. For a stat that's already an average, false precision is worse. Round to whole dollars.

**Luis (Info Design):** Whole dollars. Always. For $/sqft comparisons the cents are noise. Both should use the same format: "$X/sqft" with no decimals. This is a dashboard metric, not a financial statement.

**Karen (Tax Pro):** In formal appeal documents, precision matters. But this is the marketing page, not the appeal packet. Round for readability. The packet itself can have the precise numbers.

**Agreements:** Unanimous — round to whole dollars on both pages.

**Panel Recommendation (High Confidence):**
Round $/sqft to whole dollars on both pages. $257 vs $214. $30 vs $21. Consistent formatting across all markets.

---

## Question 5: Neighborhood Stats

**Houston has 273 properties / 50% over-appraised / $87,680 avg reduction. Cook doesn't.**

**Maya (UX):** This section is excellent social proof. "50% of your neighbors are over-appraised" normalizes the action and reduces the feeling of "am I being paranoid?" Add it to Cook. Three big numbers in a row is scannable and persuasive.

**Derek (PM):** This is one of the most compelling sections on the Houston page. It shifts the framing from "your individual problem" to "a systemic issue." That's powerful for two reasons: it validates the homeowner's suspicion, and it implies the appeal has precedent. Cook County absolutely needs this.

**Dr. Kapoor (Behavioral Econ):** Social proof is one of the strongest persuasion levers. "50% of your neighbors are over-appraised" triggers both bandwagon effect ("everyone's doing this") and loss aversion ("I'm leaving money on the table while my neighbors aren't"). The avg reduction number anchors expectations. This section is doing heavy lifting on Houston — Cook should have it.

**Luis (Info Design):** The three-stat layout (properties / % over-appraised / avg reduction) is clean and scannable. It works as a visual break between dense sections. For Cook, the data likely exists since you're already running comps. Add it. If the data isn't available for some townships, omit the section gracefully rather than showing partial data.

**Karen (Tax Pro):** In Cook County, this would be even more powerful because the triennial reassessment means entire townships get hit at once. "60% of homes in Jefferson Township are over-assessed" would resonate deeply. The average reduction amount also sets expectations — important for a $49 purchase decision.

**Agreements:** Unanimous — add neighborhood stats to Cook County.

**Panel Recommendation (High Confidence):**
Add neighborhood stats to Cook County. Same three-metric format (properties analyzed / % over-assessed / avg reduction). This is one of the highest-impact additions possible for Cook County's conversion rate.

---

## Question 6: Assessment History

**Cook shows 4-year history table (initial/final/savings). Houston doesn't.**

**Maya (UX):** The assessment history table on Cook is interesting but it's currently placed too prominently — it's above comps and the CTA. It should exist, but lower on the page as supporting evidence. It's for the "convince me more" scrollers, not the primary conversion driver. For Houston, if the data exists, add it.

**Derek (PM):** This table shows something powerful for Cook County: the system works, reductions happen, and they happen regularly. The "-$16,200 (-27%)" in 2022 is a strong proof point. But it should come after the primary CTA, not before. For Houston, if appraisal history is available (it usually is from HCAD), showing it could demonstrate the pattern of rising appraisals — "they keep raising your value."

**Dr. Kapoor (Behavioral Econ):** The history table serves a different psychological function in each jurisdiction. In Cook, it shows *outcomes* (reductions achieved) — that's proof the system works. In TX, it could show *the problem escalating* (values rising year over year) — that's urgency. Both are valuable but should be framed differently. This is post-CTA content for skeptics.

**Luis (Info Design):** The table itself is well-designed — clean columns, clear before/after. But it's dense for a pre-purchase page. I'd suggest making it collapsible or placing it in a "Your Assessment History" expandable section below the main conversion flow. Keep it available but don't force everyone through it.

**Karen (Tax Pro):** Assessment history is genuinely useful for Cook County because it demonstrates that reductions reset — you can appeal every year. For Texas, showing the appraisal increase trend (e.g., $200K → $230K → $270K) would be compelling evidence of aggressive over-appraisal. Both should have it, but the framing should differ.

**Agreements:** All agree it belongs on the page but below the primary CTA. All agree Houston should have a version if data is available.

**Disagreements:** Minor — Luis prefers collapsible; others are okay with it visible but lower.

**Panel Recommendation (Medium-High Confidence):**
- Keep assessment history on Cook, but move it below comps and the first CTA.
- Add appraisal history to Houston showing the value trend over time (rising appraisals = urgency).
- Frame Cook's as "Past reductions in your assessments" (proof it works). Frame Houston's as "How your appraisal has changed" (the problem is getting worse).
- Consider making it collapsible/expandable to reduce page length.

---

## Question 7: Trust and Urgency Signals

**Maya (UX):** The money-back guarantee badge appears on both pages, which is good. But it's small and easy to miss. On a $49 impulse purchase, the guarantee should be near the CTA button, not buried. The deadline treatment is very different — Cook's "check cookcountyboardofreview.com" is weak. It sends people away! Houston's "May 15, 2026" is concrete and creates urgency. Data source attribution in the footer is fine but could be more prominent.

**Derek (PM):** The Cook County deadline handling is a major problem. "Appeals open by township on a rotating schedule" is true but useless — it doesn't tell me if I should buy NOW or later. If you know the township (you do — it's in the data), calculate and show the actual deadline. Houston's concrete date is much better. The money-back guarantee needs to be right next to the price, every time.

**Dr. Kapoor (Behavioral Econ):** Urgency without specificity is noise. "Check cookcountyboardofreview.com" is the opposite of urgency — it's a homework assignment. Houston's "May 15, 2026" creates a clear deadline anchor. For Cook, even "Appeals typically open in [month] for [township]" would be better. The money-back guarantee is critical for reducing risk aversion on a $49 decision — it should be visually coupled with every CTA, not floating separately.

**Luis (Info Design):** The yellow/amber deadline callout box on both pages is visually distinct, which is good. But Cook's content is vague. I'd show: "Jefferson Township appeals typically open [Month Year]. We'll email you when it's time to file." That's both urgent and helpful. Data source attribution ("Source: Cook County Assessor's Office") adds legitimacy — keep it, maybe make it slightly more prominent.

**Karen (Tax Pro):** The Cook County deadline situation is genuinely complex — townships open at different times throughout the year, and the Board of Review schedule changes. But Overtaxed knows the township from the PIN. You should be able to at least say "Jefferson Township typically appeals in [quarter]." For TX, May 15 is clear. One thing missing on both: "Thousands of homeowners win reductions every year" or similar evidence that appeals succeed.

**Agreements:** All agree Cook's deadline is too vague and needs specificity. All agree money-back guarantee should be closer to CTAs.

**Panel Recommendation (High Confidence):**
- **Cook:** Replace vague deadline with township-specific timing. Never link people away from your page.
- **Both:** Place money-back guarantee text directly adjacent to (or below) every CTA button.
- **Both:** Add a success rate or volume stat ("X% of appeals result in reductions" or "Thousands of homeowners save every year").
- **Houston:** Deadline treatment is good. Keep it.

---

## Question 8: CTA Repetition

**Maya (UX):** The rule of thumb for long-form conversion pages is: first CTA at the point of initial conviction (after the value prop), last CTA at the bottom, and one mid-page if the scroll is long. Houston's two waitlist forms are fine — one after hero, one in comps. Cook needs to add an earlier CTA; currently the first real one is too far down. Both should have a sticky mobile CTA or a final anchor section.

**Derek (PM):** Two CTAs is the minimum for a page this long. Three is ideal: post-hero, mid-page (after comps), and bottom. Cook's placement needs work — the first CTA box with "Fix This Now — $49" is okay but it's inside a box that competes visually with the assessment history table. It should be a standalone, prominent button. Houston's waitlist repetition makes sense given the "data coming soon" state.

**Dr. Kapoor (Behavioral Econ):** Repetition is fine as long as each CTA appearance follows a new piece of evidence. CTA after hero = emotional decision. CTA after comps = evidence-based decision. CTA at bottom = "I read everything, I'm convinced." Each serves a different buyer psychology. Cook's current placement misses the emotional buyer entirely.

**Luis (Info Design):** The key is that CTAs should punctuate the argument, not interrupt it. Post-hero summary → CTA. After comps evidence → CTA. After pricing comparison → CTA. Three total, each in a natural "pause point." Houston gets this roughly right. Cook needs restructuring.

**Karen (Tax Pro):** From a practical standpoint, the CTA should follow the proof that matters most — the comps and the savings estimate. "You're overpaying $4,142/year. Here's the proof. Get your appeal package for $49." That's the conversion moment.

**Agreements:** All agree on 2-3 CTAs. All agree Cook's first CTA is too late.

**Panel Recommendation (High Confidence):**
- **3 CTAs per page:** (1) After hero/home-vs-neighbors, (2) after comps section, (3) bottom of page.
- Cook County needs to add CTA #1 immediately after the "Your Home vs Neighbors" section.
- Each CTA should include the price ($49) and money-back guarantee micro-text.
- For long pages, consider a sticky mobile CTA bar.

---

## Question 9: The (-21%) and (-24%) on Cook County Comp Cards

**Maya (UX):** I see those percentages near the comp property cards. Without a label, they're ambiguous. Is it 21% less than my home? 21% lower per sqft? The negative sign implies "less" but doesn't say less of what. These need a micro-label: "21% lower $/sqft" or similar. Unlabeled numbers on a data page create anxiety, not confidence.

**Derek (PM):** These seem to be showing how much lower the comp's assessment is compared to the subject property. That's exactly the right data — "this similar home is assessed 21% lower than yours." But the presentation assumes the user understands the comparison. Add a brief label and these become powerful proof points.

**Dr. Kapoor (Behavioral Econ):** Negative percentages trigger loss aversion — but only if people understand what they mean. An unlabeled "(-21%)" could be interpreted as "this comp lost 21% of value" which is the opposite of what you want. The framing needs to be positive from the user's perspective: "Assessed 21% lower than your home" makes the inequity clear.

**Luis (Info Design):** This is a classic data labeling problem. The percentage is useful data but needs context. I'd show it as a badge or tag: "21% lower" with a subtle color (green) to indicate this comp is evidence in your favor. Remove the parentheses and negative sign — use directional language instead. "(-21%)" reads like a stock loss.

**Karen (Tax Pro):** The percentage difference is exactly what a hearing officer looks at — "comparable properties are assessed X% lower." So the data is right. But presenting it as "(-21%)" looks like a spreadsheet artifact. Reframe as "Assessed 21% lower" and it becomes a compelling evidence preview.

**Agreements:** Unanimous — the data is right, the presentation needs labeling.

**Panel Recommendation (High Confidence):**
Replace "(-21%)" with a labeled badge: **"21% lower"** or **"Assessed 21% lower"** with green color coding. Remove parentheses and negative sign. Apply to both jurisdictions' comp cards.

---

## Question 10: Overall — The 60-Second Test

**Maya (UX):** **Cook:** The value prop is clear in the hero — $4,142/year savings is compelling. But the page is too long before the first clean CTA. A homeowner who just got their tax notice might scroll past the history table and lose momentum. **Biggest improvement:** Move the first CTA up, right after "Your Home vs Neighbors." **Houston:** Cleaner flow, the waitlist CTA is well-placed. The neighborhood stats section is doing great work. **Biggest improvement:** Resolve the confusing comp count mismatch (5 vs 136).

**Derek (PM):** **Cook:** I'd understand the value prop in 60 seconds — yes. Would I feel confident paying $49? Maybe. The "396 comparable homes" feels like a lot of evidence but the page doesn't let me see it before asking for money. Show 2-3 comps unblurred, then blur the rest. **Biggest improvement:** Show more evidence upfront, less gating. **Houston:** The waitlist friction is inherently lower-commitment, so the page works well for email capture. **Biggest improvement:** Make it clearer what "2026 data" means and when they'll get their package.

**Dr. Kapoor (Behavioral Econ):** **Cook:** The $4,142/year + $12,426 over 3 years anchoring is excellent. The 30% reduction feels aggressive — some users might think "that can't be right" and leave. Adding a qualifier or success rate would help. **Biggest improvement:** Add social proof (success rates, number of appeals filed). **Houston:** The $1,007/year is less dramatic, but the "50% of your neighbors are over-appraised" normalizes it beautifully. **Biggest improvement:** Same — add success rates.

**Luis (Info Design):** **Cook:** Data-rich but poorly sequenced. The information is all there; the order is wrong. **Biggest improvement:** Restructure section order per our Q1 recommendation. **Houston:** Better structured but the dual-number comp issue undermines credibility. **Biggest improvement:** Unify comp count messaging.

**Karen (Tax Pro):** **Cook:** As a tax professional, the data shown is legitimate and the savings estimate is reasonable for that assessment level. The history table showing past reductions is powerful but buried. **Biggest improvement:** Surface one stat like "Chicago homeowners saved an average of $X last year" for instant credibility. **Houston:** The $49 for a protest package is a no-brainer at that savings level. The page communicates this well. **Biggest improvement:** Add expected timeline — "file by May 15, hear back by [month]" so homeowners know what to expect.

**Agreements:** All agree both pages communicate the core value prop within 60 seconds. All agree Cook needs structural reordering more urgently than Houston.

**Panel Recommendation:**
- **Cook's single biggest improvement:** Move the first CTA up to immediately after "Your Home vs Neighbors" and add neighborhood stats.
- **Houston's single biggest improvement:** Fix the comp count inconsistency (5 vs 136) and add a timeline expectation.
- **Both:** Add social proof / success rate stats.

---

## Priority-Ordered Action Items

### P0 — Must Fix

| # | Item | Applies To |
|---|------|-----------|
| 1 | **Move first CTA to immediately after "Your Home vs Neighbors" section** — currently buried below assessment history and comps on Cook. | Cook |
| 2 | **Fix comp count inconsistency** — hero says "5 comparable homes," body says "136 comparable homes assessed lower." Define and label each number clearly. | TX (Houston) |
| 3 | **Replace vague Cook County deadline with township-specific timing** — "Check cookcountyboardofreview.com" sends users away and provides no urgency. Show "Jefferson Township appeals typically open [Month Year]" or similar. | Cook |
| 4 | **Label the percentage badges on comp cards** — change "(-21%)" to "Assessed 21% lower" with green styling. Unlabeled negative percentages confuse users. | Cook (verify TX too) |

### P1 — Should Fix

| # | Item | Applies To |
|---|------|-----------|
| 5 | **Add neighborhood stats section to Cook County** — "X properties analyzed, Y% over-assessed, $Z avg reduction." This is one of Houston's strongest sections. | Cook |
| 6 | **Standardize $/sqft to whole dollars** — round $213.57 to $214. No decimals on a persuasion page. | TX (Houston) |
| 7 | **Place money-back guarantee text adjacent to every CTA button** — currently floating separately from purchase action. | Both |
| 8 | **Add 3rd CTA at bottom of page** (before FAQ or as a closing section) — ensure the "Don't overpay" footer section has a prominent, styled CTA. | Both |
| 9 | **Add social proof / success rate stat** — "X% of appeals result in reductions" or "Thousands of homeowners save every year" near the hero or first CTA. | Both |
| 10 | **Move assessment history below comps section** — it's supporting evidence, not the primary conversion driver. | Cook |

### P2 — Nice to Have

| # | Item | Applies To |
|---|------|-----------|
| 11 | **Add appraisal history to Houston** — show rising values over time to create urgency ("your value went from $200K to $270K in 3 years"). | TX |
| 12 | **Make assessment history collapsible/expandable** — reduces page length for fast deciders while preserving data for skeptics. | Cook |
| 13 | **Unblur 2-3 comps** instead of just 1 — more free evidence builds trust before the paywall. | Both |
| 14 | **Add expected timeline** — "File by May 15, typically hear back by [month]" so homeowners know the full journey. | TX |
| 15 | **Investigate Cook County's "396 comparable homes" claim** — if this isn't the actual analysis comp count, show the real number in the hero and move 396 to neighborhood stats context. | Cook |
| 16 | **Consider sticky mobile CTA bar** for long scroll pages. | Both |
| 17 | **Add qualifier for large reduction percentages** — "30% reduction" may seem too good to be true. Consider "up to 30%" or showing a range. | Cook |

---

*Panel convened February 27, 2026. All recommendations based on live page screenshots and task brief.*
