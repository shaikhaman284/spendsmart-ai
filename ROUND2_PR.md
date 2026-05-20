# Round 2 PR: Re-Audit Notifications with Pricing Change Detection

## What this PR does

This PR adds a persistent re-audit system to SpendSmart AI. When AI tool pricing changes, the system automatically detects which stored audits are now stale, emails affected users with a consolidated summary of what changed, and provides a side-by-side diff view comparing old vs new recommendations. No re-submission required — users click a link and see exactly how pricing shifts affect their spend.

## Why

Stale audits are worse than no audit at all. A user who ran an audit six weeks ago and implemented our recommendations may now be making suboptimal decisions because Cursor raised prices or OpenAI dropped a new plan tier. They don't know their recommendations have drifted — they're flying blind. Users deserve to know when market pricing changes affect their specific recommendations, and they deserve to see it in a way that makes the delta immediately actionable.

## How it works

Every audit now stores three new JSONB fields alongside the existing result: `input_stack` (the original form inputs), `output_result` (the audit results), and `pricing_snapshot` (a copy of `PRICING_DATA` at creation time). When the detect-changes endpoint is triggered, it loads all audits, compares each audit's snapshot against live pricing using value-based comparison (`JSON.stringify` — not reference equality), re-runs the audit engine to check if recommendations would differ, groups affected users by email, and sends one consolidated notification per user.

```mermaid
flowchart TD
    A[User submits audit] --> B[Audit saved to Supabase with pricing snapshot]
    B --> C[/api/detect-changes triggered]
    C --> D{Compare snapshot vs current pricing}
    D -->|Changed| E[Group by user email]
    E --> F[Send notification email via Resend]
    F --> G[User clicks re-run link]
    G --> H[Diff view: old vs new recommendations]
    D -->|No change| I[No action]
```

## What I cut

- **Vercel Cron scheduling**: Used a manual POST endpoint instead — faster to ship, same result for a demo/evaluation environment. A cron is just a scheduled POST anyway; the logic is identical.
- **Unsubscribe UI page**: Returns a clean inline HTML response rather than a dedicated Next.js page — functionally complete, saves a file.
- **Admin dashboard**: Bonus feature, deprioritized after the core 4 (storage, detection, email, diff view) were working.
- **Benchmark mode**: Round 1 bonus feature, not relevant to Round 2 scope.
- **PDF export of diff**: Nice-to-have, cut for time. The diff view in-browser is already readable.

## How to test it manually

1. Go to `[DEPLOYED_URL]`, fill in the spend form (e.g. Cursor Pro, 2 seats, $40/mo)
2. Submit — you'll get an audit result. Note the audit ID in the URL.
3. Enter your email in the lead capture form on the results page.
4. Trigger a pricing change: `POST /api/detect-changes` with body `{"tool": "cursor", "new_price": 25}`
5. Check your inbox — you should receive a re-audit notification email within 1 minute.
6. Click the re-run link in the email.
7. You'll see the diff view showing old vs new recommendations with the delta highlighted.

## What's tested

- **auditEngine**: existing 8 tests still pass (zero regressions — engine was not modified)
- **pricingChangeDetector**: 8 new tests covering price moved, plan removed, no change (version match + data match), simulated override, and recommendation drift detection
- **detect-changes API**: manually tested end-to-end with a real Supabase instance using the `{"tool": "cursor", "new_price": 25}` payload

## Open questions / risks

- If Supabase is down, detection silently fails — should add alerting (Sentry or Slack webhook)
- Email deliverability: Resend free tier has 100 emails/day limit — fine for demo, needs upgrade at scale
- No queue: if 1000 users are affected by one pricing change, emails sent synchronously — needs a job queue (BullMQ / Inngest) at real scale
- `user_email` is backfilled when a lead submits their email, not at audit creation — audits without a captured email won't receive notifications (by design, they opted out implicitly)
