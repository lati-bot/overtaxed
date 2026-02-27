# Email Delivery Debug Report

**Date:** 2026-02-27  
**Issue:** Cook County customer did not receive email with PDFs after $0 promo checkout

## Root Cause Analysis

### Primary Issue: Fire-and-Forget Email Sending (FIXED)

The `generate-appeal` GET route was sending emails in a **detached Promise** (fire-and-forget):

```js
Promise.all([...PDFs...]).then(([pdfs]) => {
  sendEmail(...).catch(console.error);  // ← errors swallowed silently
}).catch(console.error);  // ← PDF generation errors also swallowed
```

**Problems with this pattern:**
1. Errors in PDF generation or email sending are caught and logged to `console.error`, but in Vercel's serverless environment, the function may **terminate before the detached promise completes**. The response is returned immediately, the serverless function shuts down, and the background work is killed.
2. No visibility into whether email actually sent — the success page gets `{success: true}` regardless.
3. Vercel serverless functions do NOT guarantee execution of detached promises after the response is sent.

**This is almost certainly the bug.** Vercel kills the serverless function after returning the response, so the fire-and-forget PDF generation + email never completes.

### Fix Applied

Changed the route to **await** the entire PDF generation + email pipeline before returning the response. The response now includes `emailStatus` ("sent" | "skipped" | "error") and `emailError` if applicable.

### Secondary Concern: Race Condition with "processed" Flag

The `processed` flag is only set in the POST handler (PDF download), NOT in the GET handler. So:
- Webhook fires → calls GET → email sends (or tries to)
- Success page loads → calls GET → email sends again (duplicate)
- Both calls succeed because `processed` is never set by GET

This means customers may get **duplicate emails** but shouldn't miss them. This is a separate issue to fix later.

### Other Potential Issues

1. **Browserless token** — could be expired or rate-limited. The debug endpoint tests this.
2. **Resend API key** — could be invalid or domain not verified. The debug endpoint tests this.
3. **Cook County API timeouts** — `getPropertyData()` calls multiple external APIs. If any hang, the whole request times out (Vercel default 10s for hobby, 60s for Pro).

## Files Changed

- `src/app/api/generate-appeal/route.ts` — Made email sending await-based instead of fire-and-forget. Added structured logging.
- `src/app/api/debug-email/route.ts` — **TEMPORARY** diagnostic endpoint. Tests Browserless PDF gen, Resend email delivery, and env var presence. **DELETE after debugging.**

## What Tomi Needs to Check

1. **Deploy to Vercel** (merge or push to trigger deploy)
2. **Hit the debug endpoint:** `https://www.getovertaxed.com/api/debug-email`
   - If `browserless.ok === false` → token is expired/invalid, check Browserless dashboard
   - If `resend.ok === false` → API key issue or domain verification problem, check Resend dashboard
   - If both are `true` → the fire-and-forget fix should resolve the issue
3. **Check Vercel function logs** for `[generate-appeal]` entries to see if any recent requests show errors
4. **Test a purchase** with the promo code and verify email arrives
5. **Delete `src/app/api/debug-email/route.ts`** once issue is confirmed fixed

## Build Status

✅ `npm run build` passes
