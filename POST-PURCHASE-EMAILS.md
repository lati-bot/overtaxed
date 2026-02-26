# Post-Purchase Email Drip — Draft Copy

All emails sent from: **Overtaxed <hello@getovertaxed.com>**
Triggered by: Stripe webhook or cron checking purchase dates

---

## Email 1: Day 7 — "Hearing Prep Reminder"

**Subject:** Your protest deadline is coming up — here's your game plan

**Body:**

Hi {first_name},

Your protest package for **{address}** is ready to go. Here's a quick checklist to make sure you're set:

**Before your hearing:**
☐ File your protest online at **{cad_portal_url}** (if you haven't already)
☐ Select "Unequal Appraisal" as your protest reason
☐ Upload your **Evidence Packet** and **Cover Letter** when prompted
☐ Review the **Quick Start Guide** we sent — it has your hearing script

**At your hearing:**
☐ Stick to the facts: your $/sqft vs. your neighbors' $/sqft
☐ If the appraiser offers a number, you can negotiate — see your guide for tips
☐ You don't need a lawyer. Thousands of homeowners do this every year.

**Need your files again?** [Access Your Package →]({magic_link})

You've got this. The data is on your side.

— Team Overtaxed

*Estimated savings for {address}: **${savings}/year***

---

## Email 2: Day 21 — "Follow Up / Encouragement"

**Subject:** How's your protest going?

**Body:**

Hi {first_name},

Just checking in on your property tax protest for **{address}**.

**If you haven't filed yet** — there's still time! The deadline is **{deadline}**. It takes about 10 minutes online:
1. Go to **{cad_portal_url}**
2. Upload your Evidence Packet and Cover Letter
3. That's it — you'll get a hearing date by mail

**If you've already filed** — nice work! 💪 Your hearing will be scheduled in the coming weeks. Review your Quick Start Guide before you go in.

**Need your files?** [Access Your Package →]({magic_link})

Reply to this email if you have any questions. We're here to help.

— Team Overtaxed

---

## Email 3: Day 45 — "Outcome Survey"

**Subject:** Did you save on your property taxes?

**Body:**

Hi {first_name},

By now you've likely had your hearing (or received a settlement offer) for **{address}**. We'd love to hear how it went!

**Quick 3-question survey** (takes 30 seconds):

1. Did you get a reduction? **[Yes]** / **[No]** / **[Still waiting]**
2. How much did they reduce your value by? **$___**
3. Would you recommend Overtaxed? **[Yes, definitely]** / **[Maybe]** / **[No]**

[Share Your Results →]({survey_link})

If you saved money, we'd really appreciate a quick Google review — it helps other homeowners find us:
⭐ [Leave a Review →]({google_review_link})

Thanks for trusting Overtaxed with your protest. Whether you saved $500 or $5,000, you stood up for fair taxation — and that matters.

— Team Overtaxed

---

## Implementation Notes

### Trigger Mechanism
**Option A (Simpler — Recommended for now):** Cron job runs daily, queries Stripe for completed purchases, calculates days since purchase, sends appropriate email. Resend handles deduplication via idempotency key.

**Option B (Future):** Stripe webhook → store purchase date in Cosmos → cron reads Cosmos.

### Variables per jurisdiction
| Variable | TX Counties | Cook County |
|---|---|---|
| deadline | May 15 (or 30 days after notice) | Varies by township (Aug-Nov) |
| cad_portal_url | County-specific (hcad.org, dcad.org, etc.) | cookcountyassessor.com |
| protest_type | Uniform & Equal | Market Value |

### Magic Links
Already implemented — 30-day validity. For Day 45 email, may need to extend or regenerate.

### Unsubscribe
Resend handles unsubscribe automatically via their managed link. Required for CAN-SPAM compliance.
