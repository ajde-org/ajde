# AI admission controls

AJDE-34 protects all seven AI entry points with shared admission and bounded operations.
Usage accounting, recovery UI, local reporting and cleanup scheduling are implemented.
Production deployment and the post-launch tuning review remain explicit rollout steps.
Chat now uses shared admission; its legacy database RPC remains for old deployments until cleanup.

## Policy configuration

`public.ai_admission_policies` is the single executable policy configuration. Only migrations
may change it. Keep `effective_at` current when tuning values; browsers cannot read or write
policy rows or provide thresholds to the RPC. Reviewed updates automatically receive a database
effective timestamp and are retained in `ai_policy_versions`. Defaults introduced by the AJDE-34 migration:

| Setting | Explicit actions | Automatic explanations | Valid range |
| --- | --- | --- | --- |
| Rolling-hour admissions | 30 | 60 (starting proposal) | 1–10,000 |
| Screenshot subset of that hour | 10 | none | 1–hourly limit, or null |
| Burst capacity | 4 | none | 1–100, or null |
| Seconds to refill one permit | 10 | none | 1–3,600, or null |
| Concurrent operations | 2 | 2 | 1–20 |
| Operation deadline, seconds | 120 | 120 | 1–300 |
| Lease lifetime, seconds | 180 | 180 | deadline + 30 through 600 |

Burst capacity and refill must both be set or both null. Fractions of a permit survive refill;
idle time cannot accumulate more than bucket capacity. No scheduled refill is needed.
`ai_admission_features` maps `search`, `parse`, `screenshot`, `interpret`, `chat_assist`, and
`translate_notes` to `explicit`; `explain` has its separate `explanation` group.
TypeScript callers use `AiFeature` from `lib/ai/admission.ts`.

## Admission and release contract

Call `admitAiOperation()` with the user's authenticated Supabase client and an endpoint-owned
constant feature after authentication, authorization, input validation, and required configuration
checks, immediately before paid work. Each user action receives one admission across all nested
model calls. Screenshot reading and subsequent text import are separate actions.

Application entry points use `runAiOperation()` rather than calling admission directly. It verifies
provider/release configuration first, propagates context through AsyncLocalStorage, aborts at the
database deadline, and releases in `finally` after the callback settles. Its monotonic timer uses
the database's admitted/deadline duration minus the whole admission round trip, so clock skew or
lock waiting cannot extend legal paid work. `aiProviderFetch` covers
both SDK and direct HTTP fallback work; it rejects closed/expired contexts before paid requests.
All SDK clients disable automatic retries. Per-operation provider-round caps are search 3, parse 8
(parser + two fallbacks + up to five checker rounds), and 1 for each other feature. The checker
executes at most six tools across five rounds and accepts at most 32 call records per round.
Serialized provider inputs are capped at 256 KiB (6 MiB for a screenshot data URL); screenshot
uploads remain one PNG/JPEG/WebP of at most 4 MiB. Output token caps are parser 4,000, search 1,800,
checker 3,000, screenshot 6,000, interpreter 8,000 (at most four trips), chat 3,000, translation 2,000,
and explanations 4,000 for at most 24 rides. Direct location fallback uses 1,500 output tokens.
These caps include reasoning tokens. `AI_KILL_SWITCH=true` stops new operations and provider calls.

`Idempotency-Key` is an optional UUID per intentional HTTP action; the translation action accepts
`requestId`. Browser clients provide one for their submission. The server fingerprints normalized
input using HMAC-SHA256 with its service key. Claims are atomic per authenticated user and key;
feature or input mismatch returns 409. An in-flight duplicate returns 202 without provider calls
or a second admission. Completed requests return 409 rather than replaying private generated data.
A deliberate retry uses a new key. Each claim has a generation UUID; binding and completion must
match it, preventing a late callback from altering a reused key. Keys start with ten-minute
retention, extended on binding to at least one minute after lease expiry.
Release/binding/completion are service-only. Failure to claim or bind fails closed; completion
failure is observable and does not rerun a provider. No response cache exists to bypass fresh access
checks. All endpoint authorization checks occur before claiming a key.

`admit_ai_operation(text)` derives identity from `auth.uid()`. A user-scoped transaction lock
serializes all checks, including the first admission. It counts timestamps strictly newer than
database time minus one hour. Successful admission inserts an operation, consumes a burst permit,
and starts its lease atomically. Denial changes neither admission nor bucket state. Its reason
identifies the constraint with the longest wait; `retryAt` and the rounded-up `retryAfterSeconds`
come from the same database clock. These are eligibility hints, since other requests may arrive.
Concurrency retries conservatively use lease expiry rather than guessing when work will finish.
Lowered limits account for all admissions/leases that must expire before the new limit allows work.

Database/RPC errors and malformed replies become `storage_unavailable`, distinct from quota denial.
They must prevent paid work and become retryable service errors during endpoint integration.

Successful results contain a unique `operationId`, `deadlineAt`, and `leaseExpiresAt`. Integration
must bound all model rounds, fallbacks, automatic retries, and paid calls to the operation deadline,
and release in `finally` only after work has stopped. The database deadline alone does not cancel
running JavaScript. No paid work may legally continue beyond the deadline or start using an expired
operation. Count admissions even on provider failure, refusal, timeout, or cancellation; release
concurrency separately, without refunds.

`release_ai_operation(operation_id, user_id)` is an idempotent, service-role-only RPC. Server code
must pass the verified user's ID from its operation context. A mismatched user cannot release the
operation. Authenticated clients cannot release leases, even their own: doing so during paid work
would manufacture capacity. This narrow server use of the admin client is necessary because the
normal user client is intentionally denied release. Expired leases stop blocking new admissions
without a cleanup job. Never return a service-role client or key to the browser.

## Retention and maintenance

Operations contain identifiers, feature, group, and lifecycle timestamps only; no prompts, images,
transcripts, or generated content. RLS and revoked table privileges deny all direct API access.
Auth account deletion cascades to operations and burst state.

`cleanup_ai_operations()` deletes operations older than 35 days whose leases have expired,
old usage and request events, expired execution keys, and inactive old bucket rows with no retained
operations. The daily Vercel job in `ride-share-app/vercel.json` calls `/api/internal/ai-cleanup`
at 03:15 UTC. Configure a 32–200-character random server-only `CRON_SECRET` before deployment;
missing configuration and invalid Bearer headers fail closed. No database cron extension is needed.
Enforcement does not depend on cleanup. Retention supports a report and preceding equal period
of up to 17 days each, with a one-day buffer. Policy history contains no user data and is retained.

Every SDK/direct HTTP response is inspected for usage before SDK parsing. Persisted metadata
contains actual/requested model, input/cached-input/output tokens, duration, outcome, operation,
user, feature, price version, and estimated cost. No raw request or output is persisted. All rounds
belong to their originating operation. Output tokens already include reasoning tokens. Unknown
usage, unknown models, missing cache counts and nonstandard service tiers retain null costs.
Accounting errors produce content-free server logs and never trigger another provider execution.
Admission and error metadata use `ai_request_events`; API clients cannot read or write it.

`lib/ai/pricing.ts` versions standard USD rates and verified snapshots for the existing configured
models. Rates were checked against the official [GPT-5.4 mini](https://developers.openai.com/api/docs/models/gpt-5.4-mini)
and [GPT-5 mini](https://developers.openai.com/api/docs/models/gpt-5-mini) pages. Review pricing when
models or service tiers change; adding an unrecognized model must leave cost unknown until priced.

## Local aggregate report

From `ride-share-app/`, run `npm run report:ai -- --days 7`. It reads Supabase metadata using local
server credentials (`NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SECRET_KEY` or
`SUPABASE_SERVICE_ROLE_KEY`, loaded from the local environment). Queries are read-only; no reports
or credentials are stored in deployed server files. The output is the ignored root
`.reports/ai-usage.md`, generated atomically only after every paginated query succeeds.

The report includes generation/period/timezone, separate explicit/explanation actions, costs and
unknown usage, costs per feature/action, denials and distinct affected-user counts, latency,
high-usage sessions, per-user percentiles, historical policies/effective dates, and equal-period
comparison. User identifiers are used only to calculate aggregates and never appear in output.
It supports 1–17 days, flags unverified/incomplete coverage, and refuses truncated queries.
Set `AI_TELEMETRY_ENABLED_AT` only after real enforcement and accounting are enabled; activity
timestamps alone cannot prove that an empty period was fully measured.

Record tuning reviews only between `AI_REVIEW_LOG_START` and `AI_REVIEW_LOG_END`. Regeneration
preserves this block exactly. Include review date, findings, changed limits and rationale (or an
explicit no-change decision), and next review date. Missing/ambiguous markers or failed queries
leave the previous report untouched. Regenerate before each review, after relevant fixes, and after
a policy change has accumulated sufficient data. The ignored local report is not shared in Git;
tracked policy migrations remain the enforcement source.

## Recovery wording and behavior

Inputs and uploaded files stay in their owning forms. A denial displays the server-provided retry
time; paid controls remain disabled until eligible, then quietly re-enable. There is no availability
message, remaining-quota counter, or automatic retry. Manual filters, ride forms and ordinary chat
remain usable. Optional explanations share pending work across rerenders/Strict Mode and cache
denied results without retrying; complete cards remain visible.

Human review recorded 2026-11-15: the repository owner supplied the Macedonian `ai.retryAt` message:
“Ги искористивте достапните ВИ барања. Обидете се повторно по {time}”. They explicitly requested no
message when AI becomes available again. That instruction is implemented and tested.

## Spend controls and rollout

`AI_KILL_SWITCH=true` stops new operations and provider calls without blocking manual workflows.
Optional `AI_SPEND_ALERT_USD` and `AI_SPEND_CUTOFF_USD` use known cost over the rolling prior
24 hours. Set `AI_SPEND_POLICY_EFFECTIVE_AT` when configuring either threshold; values must be
positive and the alert must precede the cutoff. Invalid configuration or spend-store errors fail
closed. The protective cutoff is checked before admission and before each paid round. It produces
temporary AI unavailability, never an individual quota error. Alerts are structured server warnings;
connect operational notifications to those logs as part of deployment.

The owner chose to leave monetary thresholds unset on 2026-11-15. No launch budget is invented and
monetary enforcement remains disabled. This cutoff is a protective threshold, not an exact billing
ceiling: it has no atomic in-flight cost reservations, so concurrent calls, accounting failures,
unknown prices/usage and in-flight work may overshoot it. Use provider billing alerts as well.

Before rollout, merge the approved PR, set the kill switch, apply production migrations through
the repository workflow only after merge, configure server credentials and `CRON_SECRET`, and
deploy the code. Verify a controlled flow, then enable enforcement and telemetry together by
clearing the kill switch and recording `AI_TELEMETRY_ENABLED_AT`. Check cleanup execution and
accounting/error logs. Existing chat-budget tables/functions stay for older deployments; the new
application no longer calls that guard.

After 1–2 weeks, regenerate the report from the production metadata and review legitimate users
hitting limits, actual feature actions/costs, screenshot usage and aggregate spend. Record findings,
an explicit tuning/no-change decision, effective dates for reviewed policy migrations, and the
next review date in the preserved log. Consider cost-weighted per-user budgets only if data warrants.

## Local verification

Use a compatible Supabase CLI and Docker for `supabase start`, `supabase db reset --local`,
and `npm run test:db`. Never apply branch migrations to production.
CLI 3 targets local by default and removes `--local`: use `supabase db reset` and
`supabase gen types --schema public` without any `--remote` argument. This change was verified
with CLI 3.1.0 and Supabase PostgreSQL 17. The installed global CLI 2.26.9 is too old for this config.
`supabase/tests/ai_admission.sql` runs with the database smoke suite and rolls back its fixtures.
`rls_policies.sql` and `api_privileges.sql` pin the access restrictions.

Run `npm run test:db:ai-concurrency` separately for real parallel connections. It uses `psql` and
the local database URL from `TEST_DATABASE_URL` (default port 54322), accepts only loopback hosts,
and removes its temporary Auth users in `finally`. Set `PSQL_BIN` when `psql` is outside PATH.
It checks simultaneous first admissions, competing requests at 29/30, cross-user isolation,
and simultaneous duplicate execution claims. `npm run test:db` is now a cross-platform Node wrapper;
both database commands reject non-loopback hosts.

Then run `npm test`, `npm run lint`, and `npx tsc --noEmit`. Providers stay mocked.
Also run `npm run build`. For controlled visual checks, set `AI_RECOVERY_FIXTURE_DIR` to the
root `.scratch/ajde34-recovery` directory and run `vitest run components/ai-recovery.test.tsx`.
Start a local production server on port 3134 and run `node scripts/verify-ai-recovery.mjs` (or set
`AI_RECOVERY_BASE_URL` to another localhost port). It uses production CSS and checks both languages
at 375/1440px, overflow, preserved keyboard input, named controls and disabled actions. Timer and
deliberate-retry behavior are covered by component tests. No visual check calls live AI.
