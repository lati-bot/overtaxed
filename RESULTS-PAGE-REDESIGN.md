# Results Page Redesign Proposal

## The Problem

Our results page is information-dense but not conversion-optimized. It's built like a data dashboard (analyst brain) instead of a product page (customer brain). The user journey should feel like:

> "Whoa, I'm overpaying" → "Here's proof" → "This is easy to fix" → **Buy**

Right now it's:
> Image → Assessment number → Small CTA banner → Over-assessed badge → Math → More math → $/sqft comparison → Reassessment info → Filing info → **CTA buried in dense section** → Assessment history table → How it works → Pricing comparison → FAQ → Final CTA

That's **13 sections** before the user even gets to FAQ. Way too much.

---

## Competitive Analysis

### AppealDesk ($49, same price point — our closest comp)
- **Hero**: Street View image → address + "✓ Analyzed" badge → County pill
- **Savings**: Big range ("$858–$1,717 every year") + breakdown ($2.35/day, $72/mo, $5,151 over 3 years)
- **Deadline warning**: Prominent, with urgency ("Miss it and you pay the full amount")
- **CTA**: Bright orange, full-width, appears TWICE above the fold
- **Below fold**: "The Math" ROI table → What's in the packet → Social proof → FAQ
- **Total sections**: ~6. Clean, linear, conversion-focused.
- **What they do better**: Urgency framing, simple math, CTA frequency
- **What they lack**: No actual property data, no comps preview — it's all generic

### Ownwell (25-35% contingency, $150-300 effective)
- **No public results page** — goes behind signup wall
- **Landing page**: Trust signals (88% success, $774 avg savings, 3K+ reviews)
- **What they do better**: Social proof, expert credibility
- **What they lack**: No transparency — you can't see anything before committing

### Zillow/Redfin (property listing pages)
- **Hero**: Full-bleed photo gallery (5+ images)
- **Below**: Big bold stats (3 beds · 2 baths · 1,550 sqft) + Zestimate
- **What they do better**: Visual-first, trust through data density
- **Not applicable**: They're showing, not selling

---

## Our Advantage

We show **real, personalized data** before the paywall:
- Actual assessment value
- Actual $/sqft vs neighborhood average  
- Actual comparable properties (blurred)
- Actual savings estimate

AppealDesk shows generic ranges. Ownwell shows nothing. We should lean INTO this — it's our killer differentiator.

---

## Proposed Redesign: "The Scroll"

The page should tell a story in 5 acts. Each screen-height is one act. The CTA appears in Acts 2, 4, and 5.

### Act 1: Your Property (above the fold)
```
┌─────────────────────────────────────┐
│  [Street View Image - full width]   │
│                                     │
│  ░░░░ gradient ░░░░░░░░░░░░░░░░░░░░ │
│  739 WILLOW WOOD DR                 │
│  Palatine, IL 60074                 │
│  1,550 sqft · 4 bed · 2 bath · 1977│
├─────────────────────────────────────┤
│  Current Assessment    $46,000      │
│  Market Value         ~$460,000     │
│  Source: Cook County Assessor 2025  │
└─────────────────────────────────────┘
```

**Design notes:**
- Hero image with gradient overlay (what we have now — keep it)
- Clean, confident. Just the facts. No CTA yet — let them orient.
- This is the "Zillow moment" — user thinks "yep, that's my house"

### Act 2: The Problem (first scroll)
```
┌─────────────────────────────────────┐
│  ⚠ OVER-ASSESSED                   │
│                                     │
│  You're paying $12,511 more than    │
│  your neighbors.                    │
│                                     │
│  ┌───────────┐  ┌───────────┐       │
│  │ Your home │  │ Neighbors │       │
│  │ $30/sqft  │  │ $22/sqft  │       │
│  │ ████████  │  │ █████     │       │
│  └───────────┘  └───────────┘       │
│                                     │
│  That's ~$2,502/year you're         │
│  overpaying — $7,506 over 3 years.  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Fix This Now — $49         │    │
│  │  100% money-back guarantee  │    │
│  └─────────────────────────────┘    │
└─────────────────────────────────────┘
```

**Design notes:**
- This is the emotional hook. Big numbers, visual comparison.
- First CTA appears here. Bold, teal, with guarantee underneath.
- No filing details yet — just the problem + the price.

### Act 3: The Evidence (proof)
```
┌─────────────────────────────────────┐
│  YOUR EVIDENCE PREVIEW              │
│                                     │
│  148 comparable properties found    │
│  in your neighborhood               │
│                                     │
│  ┌─────────────────────────────┐    │
│  │ [Blurred comp table - 5 rows]│   │
│  │  ████ Ave    $22/sqft  1,480│    │
│  │  ████ Dr     $21/sqft  1,620│    │
│  │  ████ Ln     $23/sqft  1,550│    │
│  │  ... and 145 more           │    │
│  └─────────────────────────────┘    │
│                                     │
│  + Assessment History               │
│  2025: $46,000 → 2024: $44,000...  │
│                                     │
│  This is the data that wins appeals.│
└─────────────────────────────────────┘
```

**Design notes:**
- Show enough to prove we have real data, but blur/limit to create purchase motivation
- Assessment history collapsed by default (expandable)
- No CTA in this section — it's about building confidence

### Act 4: What You Get (the offer)
```
┌─────────────────────────────────────┐
│  YOUR APPEAL PACKAGE — $49          │
│                                     │
│  📋 Custom Evidence Brief           │
│     Written for 739 WILLOW WOOD DR  │
│                                     │
│  📊 148 Comparable Properties       │
│     With detailed analysis          │
│                                     │
│  📝 Step-by-Step Filing Guide       │
│     Cook County specific            │
│                                     │
│  ⏱ Ready in 5 minutes              │
│  📧 Delivered to your email         │
│  🔒 100% money-back guarantee       │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  File My Appeal — $49       │    │
│  └─────────────────────────────┘    │
│                                     │
│  ⚡ Deadline: Check Assessor's      │
│     filing calendar for dates       │
└─────────────────────────────────────┘
```

**Design notes:**
- This replaces the current "Your Options" (Free / $49 / Attorney) comparison
- Focus on WHAT they get, not on comparing with alternatives
- Deadline urgency at the bottom
- Second CTA

### Act 5: Trust + FAQ + Final CTA
```
┌─────────────────────────────────────┐
│  HOW IT WORKS                       │
│  1. Buy → 2. Get Package → 3. File │
│                                     │
│  COMMON QUESTIONS                   │
│  [Accordion FAQ - 5 questions]      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Don't overpay $7,506 over 3 years  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  File My Appeal — $49       │    │
│  └─────────────────────────────┘    │
│  🔒 Money-back · Instant delivery   │
└─────────────────────────────────────┘
```

---

## What We're Removing

1. **"Your Options" comparison table** (Free / $49 / Attorney) — Too much cognitive load. People who searched their address are already interested. Don't make them comparison-shop on our page.
2. **Duplicate savings breakdowns** — Currently savings appear in 3 places (CTA banner, overpaying card, bottom CTA). Consolidate to Act 2 + Act 5.
3. **Reassessment paragraph** — Move to FAQ
4. **Filing calendar link in the middle** — Move to Act 4 (what you get section)

## What We're Adding

1. **Sticky mobile CTA** — Fixed bottom bar on mobile: "Fix This → $49" always visible after Act 1
2. **Better urgency** — AppealDesk nails this with "Miss it and you pay the full amount." We should too.
3. **Social proof** — Even one testimonial or "X homeowners in your area" would help

## What We're Keeping

1. **Street View hero** — Premium, builds trust
2. **$/sqft comparison bar** — Our best visual
3. **Blurred comps teaser** — Proves real data
4. **Assessment history** — Valuable but collapsible
5. **FAQ accordion** — Already done, just reposition

---

## Mobile Considerations

The page is ~13 scrolls on mobile currently. Target: **5-6 scrolls max**.

- Street View hero: 200px (shorter on mobile)
- Sticky bottom CTA: always visible after first scroll
- Collapse assessment history by default
- Remove comparison table entirely on mobile

---

## Implementation Priority

1. **P0**: Reorder sections into 5-act structure + sticky mobile CTA
2. **P1**: Remove comparison table, consolidate duplicate info
3. **P2**: Add social proof / urgency messaging
4. **P3**: Animate savings counter (nice-to-have)

---

## Decision Needed

Tomi — read through this and let me know:
1. Do you like the 5-act structure?
2. OK to remove the Free/Overtaxed/Attorney comparison table?
3. Want social proof (testimonials) on the results page?
4. Sticky mobile CTA — yes or no?
