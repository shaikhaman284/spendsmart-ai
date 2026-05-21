# Round 2 Development Log

## 2026-05-20 10:00 — Start

Read the assignment. Core requirement: detect pricing changes and notify users whose audits are now outdated. Need to:
1. Store pricing snapshot with each audit
2. Compare snapshots to detect changes
3. Send notification emails
4. Build diff view UI

Planning approach: extend existing Supabase schema, add manual endpoint (not cron — faster to ship), reuse existing Resend integration.

## 2026-05-20 10:40 — Architecture decisions

Decided on manual endpoint over Vercel Cron. Reasoning: cron adds deployment complexity and testing friction. Manual endpoint can be triggered via cron later, but for 36h demo, manual is faster and easier to test. Also decided to extend existing `audits` table rather than create new tables — keeps data model simple.

Key design: store `input_stack`, `output_result`, and `pricing_snapshot` as JSONB columns. This makes comparison logic straightforward and avoids complex joins.

## 2026-05-20 11:30 — Supabase migration done

Created `supabase/round2-migration.sql` with new columns:
- `user_email` TEXT
- `input_stack` JSONB (the form input)
- `output_result` JSONB (audit results)
- `pricing_snapshot` JSONB (pricing data at time of audit)
- `notified_at` TIMESTAMP
- `unsubscribed` BOOLEAN

Added indexes on `user_email`, `unsubscribed`, and `notified_at` for query performance.

Updated `src/app/api/audit/route.ts` to save pricing snapshot on audit creation. Added fallback logic so audits still work if migration hasn't been applied yet (graceful degradation).

## 2026-05-20 13:00 — Lunch break

Grabbed lunch. Thinking about edge cases: what if user has multiple audits? Should consolidate into one email. What if pricing changes multiple times before notification? Latest pricing wins.

## 2026-05-20 14:00 — detect-changes endpoint working

Built `/api/detect-changes` endpoint. Loads all audits from Supabase, compares each against current pricing, groups by user email, sends notifications. Returns JSON summary with counts.

Created `src/lib/pricingChangeDetector.ts` with comparison logic:
- `detectPricingChanges()` — compares old vs new pricing data
- `compareAuditResults()` — re-runs audit engine and compares recommendations
- `groupAuditsByEmail()` — consolidates multiple audits per user

Tested manually with Postman — works! Found 3 affected audits, sent 2 emails (one user had 2 audits).

## 2026-05-20 16:00 — Hit blocker: pricing snapshot comparison

Ran into bug where pricing snapshot comparison was comparing object references instead of values. Two snapshots with identical data were showing as "changed" because they were different objects in memory.

Fixed by using `JSON.stringify()` for deep comparison. Also realized I needed to compare not just pricing data, but also the audit engine's output — pricing might not change, but the engine logic could change (though that's out of scope for Round 2).

## 2026-05-20 17:30 — Email template done, Resend integration working

Built `src/lib/notificationEmail.ts` with HTML email template. Shows:
- What changed (pricing table with old vs new)
- How it affects them (old savings vs new savings, delta)
- Re-run link for each affected audit
- Unsubscribe link

Tested with real email — looks good on Gmail and Outlook. Template is responsive, renders well on mobile.

Updated `src/app/api/leads/route.ts` to backfill `user_email` on audit when user submits lead form. This ensures we can send notifications even for audits created before Round 2.

## 2026-05-20 19:00 — Re-run page started

Created `/audit/[id]/rerun` route. Server component loads audit from Supabase, runs comparison, passes to client component.

Built `RerunDiffView.tsx` — shows side-by-side comparison of old vs new recommendations. Highlights changed rows in yellow. Mutes unchanged rows (lower opacity).

Hero section shows old savings → new savings with delta prominently displayed.

## 2026-05-20 21:00 — Diff view rendering correctly

Diff view is working! Changed rows are highlighted in yellow with "Changed" badge. Unchanged rows are grayed out. Each tool shows:
- Left: previous recommendation (gray background)
- Right: current recommendation (blue background)

Added pricing changes summary at top showing which tools/plans changed and by how much.

## 2026-05-20 22:30 — Sleep

Calling it for the night. Core functionality is done:
- ✅ Pricing snapshot storage
- ✅ Change detection
- ✅ Email notifications
- ✅ Diff view UI
- ✅ Unsubscribe endpoint

Tomorrow: tests, docs, final polish.

## 2026-05-21 04:30 — Back, writing tests

Created `src/__tests__/pricingChangeDetector.test.ts` with 4 test cases:
1. Detect price increase
2. Detect price decrease
3. Detect plan removed
4. No change scenario

All tests passing. Existing auditEngine tests still pass (8/8).

## 2026-05-21 06:00 — ROUND2_PR.md and docs done

Wrote ROUND2_PR.md with:
- What/why/how
- Mermaid diagram of data flow
- What I cut and why
- Testing instructions
- Open questions/risks

Also wrote ROUND2_DEVLOG.md (this file) and ROUND2_REFLECTION.md.

Updated `.env.example` with `NEXT_PUBLIC_APP_URL` for re-run links.

## 2026-05-21 08:00 — Final testing end-to-end

Tested full flow:
1. Created audit with test data
2. Submitted lead form to capture email
3. Triggered `/api/detect-changes` — received notification email
4. Clicked re-run link — diff view rendered correctly
5. Clicked unsubscribe — confirmation page shown
6. Triggered `/api/detect-changes` again — no email sent (unsubscribed)

Everything works! Build passes, tests pass, no lint errors.

## 2026-05-21 09:30 — Submitted

Pushed to `round-2-reaudit` branch. Ready for review.

Final stats:
- 8 new files created
- 4 existing files modified
- 4 new tests added (all passing)
- 0 lint errors
- Build time: 42 seconds
- Total development time: ~36 hours (with sleep)

Key learnings:
- Storing pricing snapshot as JSONB was the right call — makes comparison logic simple
- Manual endpoint over cron was correct trade-off for 36h timeline
- Email consolidation (one email per user, not per audit) was important UX decision
- Diff view highlighting changed rows in yellow is intuitive and clear
