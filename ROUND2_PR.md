# Round 2: Re-Audit Feature

## What this PR does

This PR adds a re-audit notification system that automatically detects when AI tool pricing changes and notifies users whose previous audit recommendations are now outdated. Users receive an email with a link to view a side-by-side diff of their old vs. new recommendations, making it easy to see how pricing changes affect their potential savings.

## Why

Stale audits are harmful. When pricing changes (which happens frequently in the AI tools space), users who ran an audit weeks ago are making decisions based on outdated data. They deserve to know when pricing changes affect their recommendations. This feature turns SpendSmart AI from a one-time calculator into an ongoing monitoring tool that keeps users informed.

## How it works

When a user submits an audit, we now store a snapshot of the pricing data at that moment, along with their input and output. A manual endpoint (`/api/detect-changes`) compares all stored audits against current pricing, identifies affected users, and sends consolidated notification emails. Users click a re-run link to see a diff view showing exactly what changed and how it affects their savings.

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

- **Vercel Cron scheduling** — used manual endpoint instead. Faster to ship, same result for demo. In production, you'd trigger this endpoint via Vercel Cron or a job queue.
- **Unsubscribe UI page** — just a plain confirmation response. Good enough for 36h, avoids building a full unsubscribe management UI.
- **Admin dashboard** — bonus feature, deprioritized after core 4 worked. Would show stats on how many audits were affected, email open rates, etc.
- **Benchmark mode** — Round 1 bonus feature, not relevant here.
- **PDF export of diff** — nice to have, cut for time. Users can screenshot or print the diff view.

## How to test it manually

1. Go to the deployed URL, fill in the spend form (e.g. Cursor Pro, 2 seats, $40/mo)
2. Submit — you'll get an audit result. Note the audit ID in the URL.
3. Enter your email in the lead capture form on the results page (this backfills `user_email` on the audit).
4. Trigger a pricing change: `POST /api/detect-changes` with body `{"tool": "cursor", "new_price": 25}` (simulated change for testing)
5. Check your inbox — you should receive a re-audit notification email within 1 minute.
6. Click the re-run link in the email.
7. You'll see the diff view showing old vs new recommendations with the delta highlighted.

## What's tested

- **auditEngine**: existing 8 tests still pass
- **pricingChangeDetector**: 3 new tests
  - Price moved (increase/decrease)
  - Plan removed
  - No change scenario
- **detect-changes API**: Manual testing with real Supabase data

## Open questions / risks

- **If Supabase is down**, detection silently fails — should add alerting or retry logic
- **Email deliverability**: Resend free tier has 100 emails/day limit. At scale, need paid plan or queue.
- **No queue**: if 1000 users are affected by one pricing change, emails sent synchronously. This works for demo but needs a job queue (BullMQ, Inngest, etc.) at scale.
- **Pricing snapshot size**: storing full PRICING_DATA in every audit row. Could optimize by storing only relevant tools, but premature optimization for now.
- **Migration timing**: if someone runs an audit before the migration is applied, they won't get re-audit notifications. Acceptable trade-off for a 36h build.

## Files changed

### New files
- `supabase/round2-migration.sql` — adds columns to audits table
- `src/lib/pricingChangeDetector.ts` — comparison logic
- `src/lib/notificationEmail.ts` — email template and sending
- `src/app/api/detect-changes/route.ts` — detection endpoint
- `src/app/api/unsubscribe/route.ts` — unsubscribe handler
- `src/app/audit/[id]/rerun/page.tsx` — diff view page
- `src/app/audit/[id]/rerun/RerunDiffView.tsx` — diff UI component
- `src/__tests__/pricingChangeDetector.test.ts` — tests

### Modified files
- `src/lib/pricingData.ts` — added version and snapshot function
- `src/app/api/audit/route.ts` — save pricing snapshot on audit creation
- `src/app/api/leads/route.ts` — backfill user_email on audit
- `.env.example` — added NEXT_PUBLIC_APP_URL

## Next steps (if this were production)

1. Add Vercel Cron to trigger `/api/detect-changes` daily
2. Implement proper job queue for email sending
3. Add admin dashboard to monitor notification stats
4. Add retry logic for failed emails
5. Optimize pricing snapshot storage (only store relevant tools)
6. Add email open tracking and click tracking
7. A/B test email subject lines and content
8. Add user preference for notification frequency (daily, weekly, never)
