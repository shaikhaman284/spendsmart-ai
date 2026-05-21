# Round 2 Reflection

## 1. Most uncomfortable trade-off

The most uncomfortable trade-off was cutting the Vercel Cron schedule in favor of a manual endpoint. In production, you'd want automated daily checks for pricing changes, not manual triggers. But implementing cron properly means:
- Setting up `vercel.json` cron config
- Testing cron locally (requires Vercel CLI simulation)
- Handling cron authentication (secret tokens to prevent abuse)
- Debugging cron failures (logs are harder to access than API endpoint logs)

For a 36-hour build, this adds 4-6 hours of work with minimal demo value. The manual endpoint delivers the same core functionality — it detects changes, sends emails, and proves the system works. You can trigger it via Postman, curl, or a simple cron job on any server. The trade-off was time vs. production-readiness, and I chose time. If I had 24 more hours, cron would be the first thing I'd add.

## 2. If 24 more hours

If I had 24 more hours, the first thing I'd build is a proper job queue for email sending. Right now, if 1000 users are affected by a pricing change, the `/api/detect-changes` endpoint sends 1000 emails synchronously. This works for demo purposes but would timeout in production (Vercel functions have a 10-second timeout on Hobby plan, 60 seconds on Pro).

I'd use Inngest or BullMQ to queue email jobs. The detection endpoint would enqueue jobs, and a separate worker would process them in batches. This also enables retry logic for failed emails, rate limiting to avoid Resend throttling, and better observability (you can see how many jobs are pending, failed, etc.).

Second priority would be adding Vercel Cron to trigger detection daily. Third would be an admin dashboard showing notification stats (how many audits checked, how many affected, email open rates, etc.). These three features would make the system production-ready.

## 3. What Round 1 made harder

Round 1's `pricingData.ts` had no versioning or snapshot capability. It was just a static object exported for the audit engine to consume. I had to retrofit versioning by adding `PRICING_VERSION`, `PRICING_LAST_UPDATED`, and a `getPricingSnapshot()` function. This wasn't hard, but it's the kind of thing you'd design upfront if you knew re-audit was coming.

More significantly, the audit result wasn't being persisted to Supabase on creation — it was only used for the shareable URL feature, and even then, it was stored in the generic `audit_data` JSONB blob. I had to backfill the logic to store `input_stack`, `output_result`, and `pricing_snapshot` as separate columns. This required careful migration planning to ensure audits kept working even if the migration hadn't been applied yet (graceful degradation).

If Round 1 had been designed with re-audit in mind, I would have:
- Versioned pricing data from day one
- Stored input/output as separate columns, not nested in `audit_data`
- Added `user_email` to audits table upfront (instead of backfilling from leads)

That said, the Round 1 architecture was clean enough that extending it wasn't painful. The audit engine being pure functions (no side effects) made it easy to re-run audits with different pricing data. The Supabase schema was flexible enough to add columns without breaking existing code. Overall, Round 1 made Round 2 harder than it needed to be, but not prohibitively so.
