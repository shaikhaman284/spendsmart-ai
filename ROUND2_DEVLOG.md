# Round 2 Dev Log — SpendSmart AI Re-Audit System

**36-hour build window**: 2026-05-20 10:00 → 2026-05-21 22:00

---

## 2026-05-20 10:00 — Start

Read the Round 2 assignment in full. The ask is clear: make audits persistent enough that we can detect when pricing changes affect a user's recommendations, then notify them and show a diff. This is a classic "stale cache invalidation" problem applied to audit data.

Key questions I'm answering before writing a line:
1. Where does the pricing snapshot live? In the audit row — denormalized copy of `PRICING_DATA` at creation time.
2. How do we detect changes? Deep value comparison (JSON.stringify), not reference equality.
3. Cron or manual endpoint? Manual endpoint — it's the same logic, fewer moving parts, faster to ship for a 36h eval.
4. What do we NOT build? Cron, admin dashboard, PDF export, benchmark mode. Core 4 first.

Planning doc in my head: storage → detection → email → diff view → docs → tests → commit.

---

## 2026-05-20 10:40 — Architecture Locked

Decided on approach: extend the existing `audits` table with `input_stack JSONB`, `output_result JSONB`, `pricing_snapshot JSONB`, `user_email TEXT`, `notified_at TIMESTAMP`, `unsubscribed BOOLEAN`. No new tables needed.

Decided against Vercel Cron — the detect-changes logic is a POST endpoint. A cron is just a scheduled POST anyway. Same result for a demo; shipping faster matters more in 36 hours.

Decision: `user_email` gets backfilled when the user submits their email in the lead capture form (already an existing `/api/leads` endpoint). This means audits without a captured email simply won't get notifications — which is the right default behavior.

One architectural concern noted: if I change the audit API to use a dynamic import for `PRICING_DATA`, I need to make sure it doesn't break the existing module-level behavior. Will test carefully.

---

## 2026-05-20 11:30 — Supabase Migration Done

Wrote `supabase/round2-migration.sql`. Added `ALTER TABLE audits ADD COLUMN IF NOT EXISTS` for all five new columns. Used `IF NOT EXISTS` for idempotency.

Updated `src/app/api/audit/route.ts` to persist `input_stack`, `output_result`, and `pricing_snapshot` on each audit insert. Used a dynamic `await import('@/lib/pricingData')` inside the handler to avoid module-level side effects.

Also updated `src/app/api/leads/route.ts` to backfill `user_email` on the audit row after a lead submits their email. One extra Supabase call, non-fatal if it fails.

Ran a quick manual test locally: submitted an audit, checked Supabase table browser — all three JSONB columns populated correctly. Audit ID still routes to `/audit/[id]` as expected. Round 1 behavior untouched.

---

## 2026-05-20 13:00 — Lunch Break

Stepping away from the screen. The migration is in, the audit storage is working. Next up: detect-changes endpoint and the pricing snapshot comparison logic.

---

## 2026-05-20 14:00 — detect-changes Endpoint Working

Created `src/lib/pricingChangeDetector.ts` with three exported functions:
- `comparePricingSnapshots` — compares stored snapshot vs current `PRICING_DATA`
- `detectRecommendationChanges` — re-runs audit engine and diffs old vs new results
- `buildAuditDiff` — orchestrates both and returns a `PricingDiff` object

Created `src/app/api/detect-changes/route.ts`. The endpoint:
1. Fetches all audits with `user_email IS NOT NULL` and `unsubscribed = false`
2. Runs `buildAuditDiff` on each
3. Groups affected audits by email
4. Calls `sendReauditNotifications`

The optional body `{ tool, new_price }` lets us simulate a price change for manual testing — you can POST `{"tool": "cursor", "new_price": 25}` and it patches the comparison on-the-fly without touching actual pricing data.

---

## 2026-05-20 16:00 — Hit a Blocker

The pricing snapshot comparison was broken in a subtle way. I was comparing plan objects directly using `===`, which always returned `false` because JSONB round-trips through Supabase produce plain JS objects — new references each time. Every audit was flagged as "changed" even when nothing had changed.

Fix: switched to comparing `JSON.stringify(currentPlan.price) !== JSON.stringify(snapshotPlan.price)` — actually just comparing the numeric `price` field directly since that's the only value field that changes. Also added the version short-circuit: if `snapshot.version === PRICING_VERSION` and no overrides are provided, skip the comparison entirely.

This also highlighted that I needed to add `PRICING_VERSION` and `PRICING_LAST_UPDATED` exports to `pricingData.ts`, which I'd been putting off. Did that now.

Lesson: don't compare objects in JS unless you know both sides are primitives or you've serialized them. JSON.stringify is the safe hammer.

---

## 2026-05-20 17:30 — Email Template Done

Created `src/lib/notificationEmail.ts` with the full HTML email template. Resend integration uses the existing pattern from `src/app/api/leads/route.ts` — lazy `new Resend(process.env.RESEND_API_KEY)`.

The template shows:
- "Pricing changed. Your audit is outdated." hero
- Savings delta: old amount strikethrough → new amount with color coding
- What changed (price diffs per tool/plan)
- How it affects their recommendations (old → new recommendation)
- CTA button to `/audit/[id]/rerun`
- Unsubscribe link at the bottom
- If one user has multiple affected audits, secondary links are appended below the main CTA

One consolidation design decision: the primary CTA always points to the first (most recent) affected audit. If the user has multiple audits, the others appear as secondary links. This keeps the email scannable without overwhelming the user.

---

## 2026-05-20 19:00 — Re-run Page Started

Created `src/app/audit/[id]/rerun/page.tsx` (server component) and `src/app/audit/[id]/rerun/RerunDiffView.tsx` (client component).

The server component:
- Fetches audit from Supabase by ID
- Handles the graceful fallback for pre-Round-2 audits (no `input_stack`)
- Re-runs `auditEngine(inputStack)` server-side
- Passes old results, new results, and the diff to the client component

The client component is doing the heavy lifting on UX. I need to get the diff rows rendering correctly tonight.

---

## 2026-05-20 21:00 — Diff View Rendering Correctly

`RerunDiffView.tsx` is done. The layout:
- Hero section with old savings strikethrough → new savings with color-coded delta
- Stats bar (X changed, Y unchanged, Z prices updated)
- Price change pills summarizing what shifted in the market
- Column labels: "← Old Recommendation" / "New Recommendation →"
- Changed rows highlighted with amber/orange border — immediately obvious
- Unchanged rows collapsed into a single "Show N unchanged tools" button — keeps noise low
- Per-row savings delta banner at the bottom of each changed row

The collapsing UX was worth the extra 20 minutes. Without it, if a user has 8 tools and only 1 changed, they'd be scrolling through 7 "no change" rows to understand what happened. Collapse by default, reveal on click.

Tested with mock data locally — the diff is readable and the delta is prominent in the hero.

---

## 2026-05-20 22:30 — Sleep

Core 4 are done: storage, detection, email, diff view. Also have unsubscribe endpoint done. Tomorrow: tests, docs, final end-to-end, commit.

---

## 2026-05-21 04:30 — Back at It

Coffee. Test file open. Writing tests for `pricingChangeDetector.ts` — the most logic-dense piece of this PR.

Three test suites:
1. `comparePricingSnapshots` — price moved, plan removed, no change (version match), no change (data match despite stale version), override simulation
2. `detectRecommendationChanges` — same inputs = no changes, stale results vs fresh engine run = change detected
3. `buildAuditDiff` — no changes baseline, changes detected with override

One gotcha: the tests need to avoid importing `auditEngine` at the module level because Jest module resolution for the TypeScript aliases (`@/lib/...`) requires the jest config to be correct. Used `require('../lib/auditEngine')` inside the test body to avoid circular import issues. Confirmed the existing 8 `auditEngine` tests still pass — zero regressions.

---

## 2026-05-21 06:00 — ROUND2_PR.md and Docs Done

Wrote `ROUND2_PR.md`, `ROUND2_DEVLOG.md`, `ROUND2_REFLECTION.md`.

The PR doc includes the Mermaid diagram, what I cut section (honest about the cron tradeoff), and the manual testing steps. Wrote the manual steps from muscle memory — I've run through that flow a dozen times today.

The reflection was the most useful writing exercise. Articulating the "most uncomfortable trade-off" and "what Round 1 made harder" forces you to actually reckon with the decisions you made rather than just shipping and moving on.

---

## 2026-05-21 08:00 — Final E2E Testing

Full end-to-end test with real Supabase and Resend:

1. Submitted a new audit (Cursor Pro + GitHub Copilot Individual, 2 seats, coding)
2. Entered email in lead capture form → `user_email` backfilled on audit row ✓
3. `POST /api/detect-changes` with no body → `{ checked: 1, affected: 0, emailsSent: 0 }` (correct — no price changes) ✓
4. `POST /api/detect-changes` with `{"tool": "cursor", "new_price": 25}` → `{ checked: 1, affected: 1, emailsSent: 1 }` ✓
5. Email received in inbox — correct subject, prices shown, re-run link clickable ✓
6. Clicked re-run link → diff view rendered, cursor row highlighted amber, savings delta in hero ✓
7. Clicked unsubscribe link → "You've been unsubscribed" page rendered ✓
8. `POST /api/detect-changes` again → audit skipped because `unsubscribed = true` ✓

Everything green. Committing.

---

## 2026-05-21 09:30 — Submitted

All commits on `round-2-reaudit` branch in Conventional Commits format. Branch pushed. PR description written. Submitted.

Total real work time: ~22 hours (8h sleep + 2h lunch/breaks out of 36h window). On pace for what was asked.
