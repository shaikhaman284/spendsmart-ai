# Round 2 Reflection

## 1. Most uncomfortable trade-off

The most uncomfortable trade-off was choosing a manual POST endpoint over Vercel Cron. The uncomfortable part: it means pricing changes are only detected when someone manually triggers it — the "live" in "live audits" is not actually live. A real user would never know their audit went stale unless an admin remembered to run the endpoint. I named the trade-off specifically: convenience of shipping vs integrity of the feature promise.

For a 36-hour build, implementing Vercel Cron properly means setting up `vercel.json` config, testing cron locally with Vercel CLI, handling authentication to prevent abuse, and debugging cron failures (logs are harder to access than API endpoint logs). This adds 4-6 hours with minimal demo value. The manual endpoint delivers the same core functionality — it detects changes, sends emails, and proves the system works.

I would have used GitHub Actions scheduled workflow calling the endpoint as a middle ground if given another 4 hours. That's free, doesn't require Vercel Pro, and gives you the automation without the complexity of Vercel Cron.

## 2. First thing with 24 more hours

NOT a wish list. Single first thing: persist price overrides to Supabase so the entire app reads current prices dynamically instead of `pricingData.ts` being the source of truth. Right now the detect-changes endpoint accepts a new price for detection but doesn't update what the audit form, results page, or rerun page shows. That inconsistency is the biggest integrity gap in the current implementation.

I'd create a `pricing_overrides` table with columns: `tool`, `plan`, `new_price`, `effective_date`, `created_by`. The audit engine would check this table first before falling back to `pricingData.ts`. The detect-changes endpoint would write to this table instead of accepting a temporary override. This makes pricing changes persistent and visible across the entire app, not just in the detection logic.

Second priority would be a job queue for email sending (Inngest or BullMQ) to handle 1000+ affected users without timing out. Third would be Vercel Cron to trigger detection daily. But the pricing persistence is the most critical fix.

## 3. What Round 1 made harder for Round 2

`pricingData.ts` had no versioning, no snapshot capability, no export of a "current version" identifier. When Round 2 required storing a pricing snapshot with each audit, I had to retrofit a deep copy of the entire pricing object at audit creation time. If Round 1 had exported a versioned pricing object like `{ version: "2026-05-09", data: {...} }` the snapshot comparison would have been trivial.

Also: the audit result was not being persisted to Supabase in Round 1 — the shareable URL fetched from Supabase but the save logic was incomplete. I had to fix that before Round 2 storage could work. The `audit_data` JSONB blob was being used for the shareable URL feature, but it didn't include the actual audit results, just the input. I had to add separate columns for `input_stack`, `output_result`, and `pricing_snapshot` and backfill the save logic.

If Round 1 had been designed with re-audit in mind, I would have versioned pricing data from day one, stored input/output as separate columns, and added `user_email` to audits table upfront instead of backfilling from leads. That said, the Round 1 architecture was clean enough that extending it wasn't painful — the audit engine being pure functions made it easy to re-run audits with different pricing data.

---

**Built by Shaikh Aman Shaikh Akram**
