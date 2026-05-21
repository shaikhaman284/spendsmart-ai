# Round 2 Development Log

## 2026-05-20 10:00 — Start

Read the Round 2 assignment carefully. 36 hours, 4 required features. Planning before building.

## 2026-05-20 10:35 — Decided on approach

Supabase already set up from Round 1 — add new columns to audits table. Manual POST endpoint for detect-changes instead of Vercel Cron (faster, same result). Resend already integrated. Main risk: pricing snapshot comparison logic.

## 2026-05-20 11:15 — Supabase migration done

Added columns: `user_email`, `input_stack`, `output_result`, `pricing_snapshot`, `notified_at`, `unsubscribed` to audits table. Created `round2-migration.sql`.

## 2026-05-20 12:30 — Audit storage working

Updated `/api/audit/route.ts` to save all fields on audit creation. Verified in Supabase dashboard — rows appearing with correct data.

## 2026-05-20 13:15 — Lunch break

## 2026-05-20 14:00 — pricingChangeDetector.ts built

Wrote the comparison logic. First attempt used object reference comparison — always returned `affected: 0`. Switched to `JSON.stringify` for deep comparison. Still getting `affected: 0`.

## 2026-05-20 15:30 — Blocker: affected always 0

Added debug logging. Found two issues: tool names were case-mismatched ("cursor" vs "Cursor") and the snapshot structure was nested differently than expected. Fixed both. detect-changes now returns correct affected count.

## 2026-05-20 17:00 — Email sending broken

Resend returning 400. Checked the request — `from` field was `"SpendSmart AI <onboarding@>"` — missing domain after @. Fixed to use full verified domain. Emails now showing in Resend dashboard.

## 2026-05-20 17:45 — New issue: Resend test domain restriction

Was using `onboarding@resend.dev` — only sends to registered email. Verified custom domain on Resend. Email now delivers to any recipient.

## 2026-05-20 19:00 — Email content issues

Email was showing all cursor plans (hobby, pro, enterprise) instead of just the user's plan. Fixed by filtering "what changed" list against user's actual `input_stack`. Delta was showing $0 — fixed by re-running audit engine with old snapshot vs current pricing separately.

## 2026-05-20 21:00 — Rerun diff view built

Page loads old and new audit side by side. Added CHANGED/NO CHANGE badges and yellow highlighting for changed rows.

## 2026-05-20 22:00 — Tailwind CSS not rendering

All the yellow highlighting and opacity classes were not showing visually. Root cause: dynamic class name construction like `border-${color}-400` gets purged by Tailwind at build time. Fixed by replacing all dynamic classes with complete static strings and adding safelist to `tailwind.config.ts`.

## 2026-05-20 23:00 — Sleep

## 2026-05-21 05:00 — Back

All 4 features working end-to-end. Starting on documentation.

## 2026-05-21 06:30 — ROUND2_PR.md written

Structured PR description done. "What I cut" section was useful to think through explicitly.

## 2026-05-21 08:00 — Final end-to-end test

Submitted fresh audit → entered email → triggered detect-changes → received notification email → clicked rerun → saw diff view with correct highlighting. Full flow works.

## 2026-05-21 09:00 — Pushed branch and deployed

Pushed `round-2-reaudit` branch. Vercel preview deployment live. PR opened on GitHub — left open as required.

## 2026-05-21 09:30 — Submitted Google Form

---

**Built by Shaikh Aman Shaikh Akram**
