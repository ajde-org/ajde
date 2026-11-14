# feat: [AJDE-34] limit AI actions and record usage

Target: `dev`

## Ticket

[AJDE-34](https://linear.app/ajde-app/issue/AJDE-34/rate-limiting): A user can repeatedly import screenshots or trigger AI search without shared admission limits.

## Solution

- Enforce atomic per-user rolling limits across all seven AI entry points: 30 explicit actions/hour, including at most 10 screenshots, a four-permit burst with ten-second refill, and two concurrent operations. Automatic explanations have a separate configurable 60/hour and two concurrent operations.
- Bound nested provider calls with deadlines, output caps and no automatic retries. Use expiring leases and request-key claims to prevent duplicate paid execution across instances.
- Preserve input and uploads on denial, display the server's retry time, and quietly re-enable deliberate retry. Manual flows and complete ride cards remain available.
- Capture content-free usage and versioned cost estimates, keep unknown costs unknown, and generate a local aggregate report with a preserved review log. Add daily authenticated metadata cleanup, a kill switch, and optional protective spend thresholds.

## Validation

- Local Supabase CLI 3.1.0 start/reset, database smoke tests, privileges/RLS, and separate-connection admission/duplicate-key races passed.
- All 1,163 mocked tests (111 files), lint, TypeScript and production build passed, including the cleanup endpoint and reviewed copy.
- Both languages checked at 375px and 1440px, including blocked controls, keyboard access and retained input. Timer expiry quietly re-enables controls without a notice or automatic request.
- The report was generated from local Supabase, regenerated without losing review notes, and retained unchanged after an intentional query failure. Local measurements are explicitly labeled as local validation.
- No live AI calls or production database writes.

## Rollout

Human wording review is recorded in `docs/AI_RATE_LIMITING.md`; the repository owner supplied the Macedonian message and requested quiet re-enabling. Monetary alert/cutoff values intentionally remain unset at the owner's request. The cutoff is a protective threshold with possible overshoot, not a hard billing ceiling.

Apply production migrations only after merge. Configure `CRON_SECRET`, use the kill switch during rollout, and enable enforcement/accounting together after verification. Record telemetry start time and perform the documented tuning review after 1–2 weeks of production data. See `docs/AI_RATE_LIMITING.md` and the implementation-plan handoff.
