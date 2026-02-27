# EMAIL-DEBUG-REPORT-V2.md

## Root Cause: Vercel Function Timeout

The email pipeline is crashing because the `generate-appeal` GET handler **exceeds Vercel's function timeout**.

### Timeline of What Happened

1. **Yesterday (Feb 26)**: Emails worked fine because the old code used **fire-and-forget** — the GET handler returned property data immediately, and PDF generation + email sending ran as detached promises.

2. **Today (Feb 27) at 14:04**: Commit `8bd6d53` changed the code to **`await` the full pipeline** (correct fix — Vercel kills background work after response). But now the single request must:
   - Fetch Stripe session (~200ms)
   - Call `/api/lookup` which calls Cook County APIs (~2-5s)
   - Enrich 20 comp PINs × 3 API calls each = 60 external fetches (~10-20s)
   - Generate 3 PDFs via Browserless (~5-15s)
   - Send email via Resend (~1-2s)
   
   **Total: 20-45+ seconds** — well beyond Vercel's default 10s timeout.

3. The function gets killed at 10s. No email is sent. No error is logged (Vercel just kills the process). The success page gets a 504 or hangs.

### Why It Appeared to "Crash Silently"

Vercel's serverless timeout doesn't throw a catchable error — it terminates the process. The `try/catch` in the code never fires. Resend dashboard shows nothing because the code never reaches the Resend API call.

### Fixes Applied

1. **`export const maxDuration = 60`** — Added to `generate-appeal/route.ts` to extend the function timeout to 60 seconds. This requires Vercel Pro plan (which should be in use for a production app).

2. **Granular error logging** — Each step (data building, HTML generation, PDF generation, email) is now individually wrapped with `try/catch` and `console.log`. If any step fails, we'll know exactly which one.

3. **Test endpoint** `/api/test-full-email` — Runs the exact same pipeline without Stripe, returns detailed timing for each step. Usage:
   ```
   GET /api/test-full-email?pin=02142070370000&email=chatwithtiobot@gmail.com
   GET /api/test-full-email?pin=02142070370000&skip_pdf=true  (just test HTML generation)
   GET /api/test-full-email?pin=02142070370000&skip_email=true (test HTML + PDF, no email)
   ```

### If maxDuration Doesn't Work (Hobby Plan)

If on Vercel Hobby plan (hard limit of 10s), the options are:
1. **Upgrade to Vercel Pro** ($20/mo) — allows up to 300s maxDuration
2. **Move email to a webhook/queue** — Use Stripe webhook to trigger email asynchronously
3. **Pre-compute comps** — Store enriched comp data in Cosmos instead of fetching from Cook County APIs at email time. This would cut the function time from ~40s to ~10s.

### Code Quality Issues Found (Not Crash-Causing)

- Cover letter uses "Dear Appraisal Review Board" and "comparable sales" language — should say "Board of Review" and "comparable assessments" for Cook County IL
- `getPropertyData` makes a self-referential fetch to `https://www.getovertaxed.com/api/lookup` — adds unnecessary latency. Could inline the lookup logic.
- Success page doesn't display `emailStatus` / `emailError` from the API response

### Next Steps

1. Deploy this to Vercel (push to dev → merge to main)
2. Test with the test endpoint: `GET /api/test-full-email?pin=02142070370000&email=chatwithtiobot@gmail.com`
3. Check Vercel function logs for the detailed step-by-step output
4. If still timing out, check Vercel plan and consider pre-computing comp data
