# AJDE-29: Macedonian language support

Status: implementation in progress. Phase 2 application UI is implemented, including offer/import, trips/profile/ratings, chat/sharing and safe error fallbacks. Match explanations and chat answers now follow the selected locale. The final code/contract audit and controlled cross-flow verification are complete. Real authenticated lifecycle verification, external auth-email scope and human review remain open.
Updated: 2026-10-31.
Ticket: [AJDE-29](https://linear.app/ajde-app/issue/AJDE-29/i18n-add-macedonian-mk-language-support).
Branch: `feat/AJDE-29-macedonian-language-support`.
Base: freshly fetched `origin/dev`, commit `71a804e85d172bef744d1fbd193038bc91d03665`.

## Resume instructions

1. Read root `AGENTS.md` if present, `CLAUDE.md`, `CONTRIBUTING.md`, and `ride-share-app/AGENTS.md` explicitly. Paths in this plan are relative to the repository root unless stated otherwise.
2. Read this plan and the session log below. Check `git status`, branch, and recent commits before editing. Resume this ticket branch; do not recreate it or overwrite unrelated work.
3. Implementation was authorized on 2026-10-27. Continue unchecked work from the latest session log; do not ask for implementation approval again. Human translation review and push/PR approvals remain separate requirements.
4. Work through the phases in order. Tick a box only when its outcome has been verified. Record changed files, relevant commits, commands/results, remaining work, and blockers in the session log at every handoff.
5. Keep partially completed items unchecked and explain their progress in the log. Never mark human translation review complete on an agent's behalf.

## Outcome and scope

Users can use the app in English or Macedonian, switch language, and keep their choice across navigation and reloads. Macedonian uses natural Cyrillic wording, including accessible labels, validation, errors, empty states, and formatting.

The ticket requires every sentence to be manually reviewed by at least one human before a PR is opened. Avoid literal translations and unnecessary anglicisms; its explicit example is **Posts → Објави**, not **Постови**. Translation review is a release prerequisite, not an optional follow-up.

Keep user-written ride descriptions, messages, names, and reviews as authored. Keep stored enum values, IDs, API field names, and date representations stable. No database migration is expected. Auth email templates managed outside this repository are a separate integration question: inventory them and record any agreed exclusion before claiming complete coverage.

## Implementation decisions

- Support `en` and `mk`; keep English as the default when no preference exists. Do not automatically switch based on browser language in this first iteration.
- Keep current URLs, auth callbacks, API routes, and shared trip links. Store an explicit selection in a validated `ajde_locale` cookie (one year, path `/`, SameSite Lax, Secure in production). No account-level preference or locale route segment is planned.
- Use typed dictionaries grouped by feature under `ride-share-app/lib/i18n/`, a server-only request locale reader, and a small client provider receiving the selected locale and serializable messages. Start with native `Intl` formatting and typed complete-message functions/templates; avoid building a custom ICU parser. If richer message needs justify a library, record the decision and verify its current Next.js compatibility first.
- Make English and Macedonian catalog keys and interpolation parameters match. Use complete messages and locale-aware plural selection, never concatenated sentence fragments. English fallback is defensive behavior; missing Macedonian keys must fail verification before completion.
- Resolve locale once per request; never store the current user's locale in mutable module-global state. Ensure cached localized results include locale in their key. Cookie-based rendering may make currently static pages dynamic; inspect and document that build tradeoff.
- Keep `Europe/Skopje` for ride times and MKD for money. Change presentation locale, not scheduling calculations, ISO values, input parsing, amounts, or currency conversion.
- Localize application-authored AI status/fallback text. Audit generated explanations and warnings separately, then explicitly pass locale where generated UI prose must follow the selection. Human reviewers approve prompt instructions and fixed messages and review representative generated output; arbitrary future model output cannot be pre-approved sentence by sentence.

## Initial repository findings (before implementation)

These describe the starting state, not the current implementation. See the current checkpoint and session log below for changes already made.

- Next.js `16.3.5`, React `19.2.8`; no i18n dependency is installed in `package.json`.
- `app/layout.tsx` hardcodes `lang="en"`, English metadata, and fonts configured with Latin subsets. Verify Cyrillic font coverage and loading.
- `components/app-navigation.tsx` owns desktop/mobile navigation; `components/site-header.tsx` streams auth-dependent slots.
- `proxy.ts` refreshes Supabase cookies and protects unprefixed paths. Preserve its auth behavior and redirect cookies.
- English copy appears in `app/`, `components/`, server actions, Zod validation, and API errors. `app/login/actions.ts` also forwards some provider error messages to the UI.
- `components/date-picker.tsx` and `lib/rides/ride-presentation.ts` hardcode `en-GB`. `lib/rides/skopje-time.ts` uses `en-CA` for date calculations; that internal formatter should not be mechanically localized.
- AI surfaces include search, offer interpretation, screenshot/post imports, ride checks, match explanations, and chat assistance. See `docs/AI.md` and `lib/ai/README.md` before changing them.
- Installed Next.js guides inspected: `node_modules/next/dist/docs/01-app/02-guides/internationalization.md` and the `cookies.md` function reference (under `ride-share-app/`). Re-read relevant sections before implementation, including server/client boundaries and metadata as needed.
- The prior branch `docs/AJDE-14-codex-instructions` has a separate root instructions commit. It was not mixed into this ticket branch. Follow the supplied repository instructions even if root `AGENTS.md` is absent on this base.

## Phase 0 — Preparation and review

- [x] Read repository workflow and application instructions.
- [x] Read AJDE-29 requirements and blocking relations (none recorded when inspected).
- [x] Inspect representative routes, navigation, auth, formatting, API errors, dependencies, and local Next.js guidance.
- [x] Fetch `origin/dev` and create the feature branch from it with a clean working tree.
- [x] Save this resumable plan under `docs/plans/`.
- [x] User reviews the plan and requests implementation; record changes to the proposed decisions.
- [x] Recheck the ticket for changed requirements and blocking relations; repeated at the second checkpoint, with no requirement changes.
- [x] Create the initial coverage inventory with candidate files, proposed namespaces/areas and migration status; 162 original candidate source files enumerated.
- [x] Finish the detailed full-string-surface audit, including embedded image text, metadata, loading/error/not-found files, tooltips, placeholders, aria labels and live regions. File enumeration alone does not complete this audit.

## Phase 1 — Localization foundation

- [x] Add supported-locale validation, default locale, typed dictionaries, interpolation/plural helpers, and formatting helpers. Test unsupported/missing cookie values, matching keys and parameters, and plural/formatting behavior.
- [x] Add the server-only cookie reader and a server action to change language; validate its input with Zod. Keep cookie mutation out of render functions.
- [x] Add the client provider and server helpers. Keep server-only imports out of client bundles and avoid loading both full catalogs in clients unnecessarily.
- [x] Wire root layout language and translated metadata. Ensure server output and client hydration use the same locale, including loading/error/not-found behavior.
- [x] Add an accessible circular flag selector to desktop and mobile navigation, with “Switch language” / “Промени јазик” labels, keyboard focus and pending/error states. Preserve scroll, current path, query filters and in-progress form values when switching.
- [x] Verify cookie persistence through reload, independent browser sessions, invalid auth callbacks and protected-route redirects; inspect and document dynamic rendering/build implications.
- [ ] Verify cookie persistence through real sign-in, sign-out and successful auth callbacks in an isolated test environment.

## Phase 2 — Translate by user flow

For each item: migrate all visible and assistive text, supply both catalogs, verify EN/MK rendering, and update the coverage inventory. Translation drafting is distinct from human approval in phase 5.

- [x] Shared shell and landing: `app/page.tsx`, layout metadata, navigation, header/footer, brand accessibility text, `components/landing/*`, shared buttons/panels/skeletons.
- [x] Login UI, status messages, stable action message codes and invalid-domain validation.
- [x] Onboarding: `app/onboarding/*` UI/metadata, field/help text, photo/contact validation and stable profile-action message keys. Controlled EN/MK tests verify existing-error translation and unsaved-field preservation.
- [ ] Complete the authentication lifecycle audit, including successful callbacks and sign-out. Inventory external Supabase auth-email text and record its localization or an agreed exclusion.
- [x] Discovery's fixed UI: feed metadata/headings, filters, localized cities, ride cards/routes/seats/prices, interpretation criteria and deterministic warning labels, natural-language-search controls/failures, welcome and empty states.
- [x] Complete discovery's generated match explanations, locale propagation/cache keys and API error audit. Explanations use the request cookie, localized city facts, locale-aware fallback templates and locale-specific client request keys; failed API responses remain optional and never replace ride results.
- [x] Offer and import: `app/rides/new/*`, `app/rides/import/*`, ride forms, car selection, screenshot controls, price/distance/ride-check summaries, recovery and publish messages.

  Verified with form/action/component tests and controlled EN/MK phone/desktop fixtures. Saved car errors retranslate while unsaved fields remain intact. No real ride publication was performed.
- [x] Ride-detail and seat-request UI: `app/rides/[id]/(detail)/*`, booking action notices, localized statuses/tags/routes/prices/seats, availability/permission text and ride not-found state. Controlled EN/MK fixtures and notice-compatibility tests pass.
- [x] Finish shared contact details and ride completion/cancellation controls with the trips/profile migration. State-changing behavior is tested with mocks; real authenticated lifecycle validation remains separate.
- [x] Trips and profiles: `app/dashboard/*`, `app/profile/[id]/*`, status filters, driver/passenger views, impact summaries, rating forms and summaries.
- [x] Chat and sharing: `app/rides/[id]/chat/*`, `components/chat/*`, `app/trip/[token]/*`, `components/trip-share-controls.tsx`, copy/share feedback, unavailable/expired states.
- [x] Audit all route-level loading/error/not-found text and unmounted error fallbacks; verify they do not fail when a translation provider is unavailable.

  Error boundaries use a small bilingual fallback catalog when the provider is absent. `/rides` no longer renders English heading/subtitle in its Macedonian loading state; server-render tests cover the pre-hydration output. Offer/import/chat/profile/shared metadata and loading states were audited.

## Phase 3 — Errors, formatting, domain labels, and AI

- [x] Audit server actions and `app/api/*` for user-facing messages; map known failures to translation keys/codes and parameters while preserving response status and machine contracts. Replace displayed raw provider/database errors with appropriate localized user messages; retain useful server diagnostics.
- [x] Localize Zod and other validation at the presentation boundary. Test failures and successful action results in both languages, including locale changes with an existing validation error.
- [x] Localize date picker weekdays/months/aria labels, departures, relative dates, counts, seats, distances, ratings, CO2, and money. Verify zero/one/multiple counts and `Europe/Skopje` DST boundaries; preserve current scheduling semantics.
- [x] Audit city/pickup names and other database-backed labels. Read `supabase/DATABASE_MODELS.md` before changing those features; use existing localized display data if available and preserve canonical IDs/search aliases. Record gaps rather than renaming stored data opportunistically.
- [x] Audit generated vs deterministic AI text in each flow. Thread validated locale through relevant calls and cache keys; preserve structured schemas, IDs, source text, and multilingual input support. Define how previously saved generated text displays after a language change. See `docs/AI.md` and `docs/I18N.md` for the implemented policy.
- [x] Add mocked AI tests for locale propagation and localized failure/fallback output. Relevant paid locale evaluation passed: two locale cases, four synthetic-data provider calls for match explanations and cited chat answers. Exact provider cost was not reported. Original parser/offer/checker prompts were not changed.

## Phase 4 — Regression and visual verification

- [x] Add colocated tests for new logic and adapt meaningful existing component/action tests to both locales. Check catalog completeness without relying solely on snapshots or a hardcoded-text scan.
- [x] Exercise EN → MK → reload → EN locally for logged-out journeys, direct links, query filters, invalid callbacks and unsaved forms; verify authenticated/shared-token contracts with mocks and controlled fixtures.
- [ ] Repeat successful authenticated and shared-token browser journeys in an isolated environment with test access.
- [x] Check landing, auth, discovery, offer/import, detail/booking, trips, profile/ratings, chat, and sharing at approximately 375px and desktop in both languages. Record tested routes, screenshots/evidence, and any unavailable flows.
- [x] Verify Cyrillic fonts, long-label wrapping, navigation, calendars, keyboard use, focus, accessible names, contrast, and screen-reader/live status text. Keep UI changes mobile-first and use Tailwind utilities where possible.
- [x] Run the second-checkpoint checks from `ride-share-app/`: test runner (907/907 tests across 74 files), repository lint, TypeScript and production build all pass. Direct Node entry points were used for the equivalent package commands because of sandbox access restrictions.
- [x] Re-run required checks after the remaining implementation and record final ticket-wide results. Checkpoint passes do not complete final regression verification.
- [x] Audit remaining English literals and classify intentional exceptions (user content, brands, internal logs, protocol values). Confirm no missing keys or unintended English fallback in completed Macedonian flows.
- [x] Keep preview testing non-destructive because previews use the production database. Use controlled local/test fixtures for state-changing regression checks.

## Phase 5 — Human language review (required before PR)

- [x] Create `docs/plans/AJDE-29-translation-review.md` with a glossary and review rows keyed to every catalog message, including variants, placeholders, context, reviewer, date, and approved revision. Include any app-authored prose outside catalogs.
- [ ] A human reviews every Macedonian sentence and wording variant in context. Record natural terminology, consistency, spelling, grammar, and unnecessary anglicisms; include the ticket's Објави example in the glossary.
- [ ] Resolve feedback and obtain recorded human approval for every row. Any wording changed after approval reopens its review row.
- [ ] Human-review generated-output samples and locale prompt wording, and record the distinction between fixed approved messages and runtime generated text. Resolve any scope disagreement before claiming ticket acceptance.
- [ ] Recheck visual layout and relevant tests after language corrections; record reviewer name/date and the exact catalog commit or revision reviewed.

## Phase 6 — Documentation and delivery

- [x] Update the existing `CLAUDE.md` English-only rule with the implemented locale/message workflow, default, and instructions for adding reviewed text. Keep shared rules in their existing source file.
- [x] Document locale persistence, formatting, catalog organization, and translation review in an appropriate existing app/developer document. Update `docs/AI.md` if locale affects AI behavior.
- [x] Review the final diff for ticket scope, complete the coverage inventory, and update this checklist and handoff log.
- [x] Commit the first implementation checkpoint, including the saved plan: `8651610 feat(i18n): add AJDE-29 locale foundation and initial translations`.
- [x] Commit the second implementation checkpoint as scoped Conventional Commits: `a40fe7c` (responsive UI/language switching) and `db4b0ce` (onboarding/discovery/ride-detail localization).
- [x] Commit the remaining implementation as scoped Conventional Commits as its unchecked tasks are completed.
- [x] Prepare local PR text (not published; see [PR draft](AJDE-29-pr-draft.md)) targeting `dev`: `feat: [AJDE-29] add Macedonian language support`, using the repository PR template and Ticket/Solution convention, with validation and human review evidence.
- [ ] Ask for approval before pushing or opening/editing the PR, as required by `CLAUDE.md`. Human translation review must already be complete before opening it. Require one reviewer approval and squash merge into `dev`.

## Acceptance checklist

- [ ] English and Macedonian are selectable and persist across navigation/reload without breaking auth or shared links.
- [ ] Every inventoried application UI flow, validation message, accessible label, and failure state is covered; exceptions are explicitly documented and agreed.
- [x] Locale-specific formatting is correct while underlying ride times, prices, IDs, and user content remain intact.
- [x] Both languages work at phone and desktop widths with accessible navigation and controls in controlled fixtures and the logged-out browser smoke; real authenticated validation remains separately open.
- [ ] Required checks pass, relevant AI changes have evaluation evidence, and every fixed translated sentence has recorded human approval before PR creation.

## Current checkpoint and evidence

- [x] 907 draft catalog message pairs implemented; matching keys/placeholders checked. See [translation review](AJDE-29-translation-review.md).
- [x] [Coverage inventory](AJDE-29-coverage.md) created for 162 candidate source files. Detailed string/contract audit is complete; see [final audit](AJDE-29-final-audit.md) for presentation boundaries and intentional exceptions.
- [x] Final local verification: 942 tests across 81 files pass; lint, type checking and production build pass. Two additional paid live locale evaluations pass. These results do not replace real authenticated journey checks or human review. Earlier checkpoint results remain in the historical log.
- [x] Read-only local browser smoke test passes: cookie persistence, English default, independent sessions, scroll/URL/query preservation, unsaved form values, translated existing errors, invalid callback/protected-route redirects, mobile menu/calendar and EN/MK navbar/savings layouts at 375/768/1024/1280/1440px. Signed-in navbar checks use DOM fixtures.
- [x] Screenshot review of landing/login and controlled onboarding/discovery/ride-detail fixtures in English/Macedonian at phone/desktop sizes; Cyrillic fonts load and labels wrap. Evidence is in ignored `.scratch/ajde-29/` and `.scratch/ajde-29/flows/`. Rerun `node scripts/verify-i18n.cjs` for landing/login/navbar checks; `scripts/i18n-flows.test.tsx` generates controlled feature-page HTML when `I18N_FIXTURE_DIR` is set.
- [ ] Real authenticated sign-in/sign-out lifecycle and state-changing cross-flow browser checks in an isolated test environment. Initial smoke tests do not create accounts, send emails, or modify production data.
- [ ] Human wording approval: none recorded. All review rows remain Pending; existing user copy edits are preserved but are not treated as approval of the entire register.

## Session log

### 2026-10-27 — Planning

- Completed: repository and ticket review, representative app audit, local Next.js docs review, remote dev fetch, branch creation, this plan.
- Base commit: `71a804e85d172bef744d1fbd193038bc91d03665`. Previous branch retained unchanged.
- Changed files: this plan only. No implementation, translation, migration, or Linear status changes.
- Validation: planning-only; application tests not run. See final working-tree/diff checks for this session.
- Next action: user reviews this file; on a later implementation request, start with the unchecked phase 0 inventory and decisions, then phase 1.
- Pending decisions: proposed default/cookie approach, external auth email scope, and generated AI language behavior. No human translation reviewer has been recorded yet.


### 2026-10-27 — First implementation checkpoint

- User authorized implementation; continuing on `feat/AJDE-29-macedonian-language-support` without changing the base or mixing other tickets.
- Added request-scoped locale resolution, validated cookie action, typed catalogs/interpolation, native Intl formatting/plurals, and a selected-catalog client provider. Default remains English; no URL or database schema changes.
- Migrated navigation/footer/brand, root metadata and page fallbacks, landing hero/search/about/map, date controls, shared skeleton statuses/default submit status, and login UI/action errors. Original social screenshots are preserved with translated alt text.
- Added the human review register, coverage inventory, developer workflow, and read-only browser smoke test. Updated the shared rule in CLAUDE.md.
- Fixed a pre-existing time-dependent offer-workspace test by freezing Date to its September fixture date. It failed because the real date had moved past the hardcoded departure; business date logic is unchanged.
- Verification: 893/893 unit/component tests; `npm run lint`; `npx tsc --noEmit`; `npm run build`. Build reports dynamic UI routes due to root cookie access. Playwright smoke checks pass using installed Chrome (bundled Playwright Chromium was absent).
- Browser limitations: no authenticated fixture was created against the configured database, no live AI evaluation was run, and no human has approved translations. Those checkboxes remain open.
- Next action: continue phase 2 with onboarding UI and its validation/action codes, then discovery and ride detail/booking. Extend the catalogs and review rows as each flow migrates; do not rework the established locale foundation or repeat permission questions. Re-run affected tests and final checks after new changes.
- Remaining decisions: external Supabase email-template scope and handling generated/persisted AI prose. Existing generated output and all unported feature text remain unchanged.
- Delivery: local checkpoint commit `feat(i18n): add AJDE-29 locale foundation and initial translations`; no push, PR, or Linear mutation. The remaining ticket work is not complete.

### 2026-10-27 — Responsive fixes and second implementation checkpoint

- User requested navbar/landing corrections, a circular flag selector, scroll preservation and the accessible labels “Switch language” / “Промени јазик”, then authorized continuing the implementation plan. Re-read AJDE-29; its requirements and human-review prerequisite are unchanged. Continued on the existing feature branch.
- Fixed navbar overlap by keeping the brand, links and account controls in normal flex layout, allowing enough width for signed-in Macedonian links, and retaining the mobile menu. The circular flag button includes keyboard focus, pending state and status/error announcements. Restored scroll coordinates after the locale transition commits. Landing formula labels and descriptions use a responsive grid instead of a fixed 4rem label width.
- Implemented onboarding catalogs, metadata, field/help text, photo/contact errors and stable profile-action error keys. Added runtime Zod input-shape validation. Existing validation errors retranslate on locale changes and unsaved fields remain intact. Database schema, ownership checks and storage behavior are unchanged.
- Implemented discovery's fixed UI: welcome/empty states, filters, natural-language search controls/failures and interpretation criteria. Localized city names/sort order, dates, money, seat counts, ride cards/routes, known preference tags and statuses. Unknown tags, driver notes, profile values and names remain as authored. Fixed the ride-card footer at phone widths after reviewing the longer Macedonian labels.
- Implemented ride details, seat-request labels/help/notices and profile/ride/chat error/not-found screens. Booking redirects now use allowlisted message keys with compatibility for existing English notice URLs. Arbitrary query-string notices use a fixed localized fallback. Search warnings display deterministic catalog messages based on validated warning codes, including saved interpretations; no prompts, AI schemas or scheduling calculations changed.
- Added onboarding state/error tests, booking-notice compatibility/fallback tests, Macedonian interpretation/date checks and seven controlled server-page fixture tests. Expanded the read-only browser check for scroll preservation and signed-in navigation fixtures at 375/768/1024/1280/1440px in EN/MK. Onboarding/discovery/booking fixture layouts were reviewed at 375/1024/1440px; HTML/PNG evidence lives in ignored `.scratch/ajde-29/flows/`.
- Validation: 907/907 tests across 74 files; repository lint; TypeScript; production build; read-only browser smoke checks. Authenticated screen visuals use controlled fixtures, not a real live session; no accounts, emails, bookings or database records were created. No paid AI evaluations ran because prompts and model behavior are unchanged.
- Updated coverage and developer documentation. The review register now contains 354 draft message pairs; the sync script retains approvals only for unchanged hashes. Existing user edits to the Macedonian catalogs were preserved, and changed wording was rehashed as Pending. No human approvals have been recorded.
- Remaining implementation: offer/import forms and recovery/errors, trips/profile/ratings/contact/impact, chat/sharing, API and generated-AI localization, remaining loading/metadata text, full-surface audit, authenticated lifecycle checks in an isolated environment and final cross-flow QA. External Supabase auth-email scope and persisted/generated-AI presentation still need decisions. Phase 2 and overall ticket acceptance remain incomplete.
- Next action: continue phase 2 with offer/import UI and stable action/field error codes, then trips/profile/ratings and chat/sharing. Keep machine values, drafts, dates and user content stable. Continue the API/AI audit separately and run the relevant evals if prompts or behavior change.
- Delivery: local working-tree changes only; no commit, push, PR or Linear mutation in this checkpoint.

### 2026-10-27 — Plan consistency audit

- User asked whether the checkpoints were current. The second-checkpoint session log was current, but the status summary, current-evidence counts and several broad checkboxes still reflected the first checkpoint.
- Updated the current summary to 354 message pairs and 907 passing tests across 74 files; updated selector wording, responsive/scroll evidence and fixture limitations. Split completed onboarding, fixed discovery UI and ride-detail/seat-request UI from the outstanding auth lifecycle, generated explanations, shared contacts and completion/cancellation work.
- Split completed checkpoint validation from final ticket-wide validation. Confirmed the first implementation commit in Git; second-checkpoint changes remain uncommitted. Marked initial repository findings as historical so they are not mistaken for current defects.
- Overall phases 0–6 still have outstanding items; no whole phase or ticket acceptance is newly claimed complete. Human review remains pending for all 354 message pairs. Next implementation work remains offer/import.
- Validation: documentation cross-check against source, Git history and the 354-row review register; Markdown diff/whitespace check. Application tests were not rerun for this documentation-only correction; the recorded 907-test/lint/type/build/browser results are from the preceding implementation checkpoint.

### 2026-10-27 — Local checkpoint commits

- User authorized appropriate commits following repository conventions. Reviewed the diff and split the work into scoped Conventional Commits on the existing feature branch.
- `a40fe7c fix(ui): restore responsive navigation and language switching` contains the navbar/landing responsiveness fixes, flag selector, localized switch labels, scroll preservation and browser regression checks.
- `db4b0ce feat(i18n): localize onboarding and ride discovery flows` contains onboarding, fixed discovery UI, ride details/booking notices, localized error screens, catalog additions/copy refinements and their tests. Existing user edits to Macedonian copy were preserved and included.
- Documentation and the translation-review synchronization script are grouped in `docs(i18n): record AJDE-29 checkpoint and review coverage`. Updated the live checklist to record the implementation commits; earlier session-log references to uncommitted changes describe their state at those earlier checkpoints.
- Validation: staged diff/whitespace checks pass. This commit-only task changes no application behavior; prior checkpoint validation remains 907 tests, lint, TypeScript, production build and browser checks. Human review and remaining implementation stay pending.
- Delivery: local commits only; no push, PR or Linear mutation.

### 2026-10-27 — Offer-composition workspace checkpoint

- Continued on the existing `feat/AJDE-29-macedonian-language-support` branch with a clean starting tree. Chose the offer-composition workspace as the next coherent part of phase 2; the wider offer/import checkbox remains open.
- Added paired `offer-en.ts` and `offer-mk.ts` catalogs, localized the new-ride and loading headings, description and import controls, draft tabs, recovery/storage notices, distance feedback, map attribution and accessible labels. Draft tab labels use localized city names while distance requests keep canonical English city names. Recovery keeps the existing storage schema and maps older English distance/warning values for display.
- Replaced displayed raw interpretation API errors with a fixed localized failure notice. Macedonian generated-warning presentation uses validated warning codes; known recovery warnings retain more specific translations. English keeps the generated warning detail. AI prompts and response schemas did not change, so paid evals were not run.
- Added a Macedonian workspace test covering generated warning text, a provider error, retry and preservation of the driver's typed description. Adjusted one existing discovery test to use the runtime's `Intl` Macedonian date format instead of a hardcoded numeric format; its prior expectation differed from this runtime's output.
- Changed files: `app/rides/new/offer-heading.tsx`, `offer-distance.tsx`, `offer-workspace.tsx` and its test; `components/discovery/search-interpretation.test.tsx`; `lib/i18n/messages/{offer-en,offer-mk,en,mk}.ts`; this plan, coverage inventory and translation review register.
- Verification: 908/908 tests across 74 files, repository ESLint, TypeScript and production Next.js build pass. The focused offer workspace test (14/14) also passes after its last assertion update. `git diff --check` passes. No authenticated browser session or offer publication was performed; preview data remains untouched.
- Review register synchronized to 410 draft message pairs; all remain Pending human review. No human translation approval is claimed. Remaining work: ride form/car selection and publish action errors, price/estimate UI, import, AI locale propagation, full authenticated/visual regression, human review and delivery gates.
- Delivery: local working-tree changes in this checkpoint; no push, PR or Linear mutation.

### 2026-10-28 — Phase 2 continuation (in progress)

- User requested the remaining Phase 2 implementation and continuation into Phase 3 where human review or environment access blocks verification.
- Confirmed the reported `/rides` English flash comes from the hardcoded feed loading heading/subtitle. The skeleton now uses the selected catalog before hydration; an immediate server-render regression test covers both languages.
- Offer/car forms, import/screenshot controls and review summaries, dashboard views/status filters, profile/ratings and ride lifecycle controls are being migrated. Validation and action notices use catalog codes so existing errors can retranslate. Implementation and verification are still in progress; these broad checkboxes remain unchecked until the affected flows are verified.
- Preserving the earlier local checkpoint changes. No push, PR, production mutation or human translation approval.

### 2026-10-30 — Phase 2 UI completion and Phase 3 AI/notice implementation

- Continued the existing branch and preserved the user's latest Macedonian wording edits. Completed offer/car forms, import/screenshot controls and evidence summaries, trip filters and driver/passenger views, profile/contact/impact/rating UI, completion/cancellation controls, private chat and shared itineraries. New/import/profile/chat/shared route metadata is localized. Feature catalogs are separated by area; the review register now has 907 matching EN/MK pairs.
- Fixed `/rides` loading heading/subtitle using the request's selected catalog before hydration. Added server-render regression coverage. Error boundaries now work without the normal provider using a small bilingual fallback catalog; tests cover EN/MK recovery controls without leaking error details.
- Added stable action/validation notice keys and render-time translation, including safe fallback for unknown or parameterized messages. Car-form tests verify an existing error retranslates while typed details survive switching. Known chat API codes drive localized messages; import/evidence failures never display raw provider/database text. Machine response fields and statuses remain compatible.
- Localized city/pickup display queries for shared itineraries without changing bearer-token authorization or returned private data. Other route names, fuel/gender/status labels, dates, money, seats, ratings, impact numbers and plural variants use the existing locale helpers. Numeric input serialization and Skopje scheduling calculations are unchanged.
- Implemented request-cookie locale propagation for match explanations and chat answers. Explanations have localized factual fallbacks, private/no-store responses and a client request key containing locale; a regression test rejects late old-language results. Chat switches hide old generated text behind an explicit refresh notice and preserve questions without issuing an automatic paid request. Original excerpts and IDs are unchanged. Stored interpretations/drafts keep their schemas and use deterministic warning-code presentation in Macedonian; no saved content is rewritten.
- Verification: 928/928 tests across 79 files; ESLint; TypeScript; production Next.js build. Relevant live evaluation passed 2/2 locale cases with four synthetic-data provider calls (EN/MK explanations and cited chat answers); exact provider cost was not reported. Logs are in ignored `.scratch/ajde-29/verified-{tests,lint,build}.log` and `live-i18n.log`.
- Read-only responsive fixtures cover offer form, import, driver/passenger trips, chat, rating/lifecycle/share controls and shared itinerary at 375/1024/1440px in both languages. HTML and screenshots are under `.scratch/ajde-29/remaining-flows/`; generated by `scripts/i18n-remaining-flows.test.tsx`. No horizontal page overflow was found. Fixed small inline spacing defects found during screenshot review. Missing fixture avatars are synthetic image placeholders, not production image requests.
- Auth audit: mocked successful code/token callbacks and sign-out preserve the locale cookie and expected redirects. Real session verification remains blocked on an isolated test environment/account; preview data is production. No account, email, ride, booking, rating, cancellation or sharing record was created. Supabase-managed signup/magic-link/invite/recovery/email-change templates have no source in this repository; their wording and localization require owner inspection or an explicitly agreed exclusion. Neither is claimed complete.
- Remaining work: finish the Phase 3 API/action and validation/domain audit, final whole-app English-literal/accessibility and authenticated journey verification, human review of all fixed wording and generated-output samples, then checkpoint commits and approved PR delivery. Do not replay the ignored migration scripts: catalogs have since been split and user copy edits must be preserved. No new commit, push, PR or Linear mutation in this checkpoint.

### 2026-10-31 — Complete unblocked implementation and verification

- Completed the Phase 0 string-surface audit and Phase 3 action/API/validation/format/domain-label audit. The coverage inventory now classifies all candidate files; no generic Pending audit rows remain. See [final audit](AJDE-29-final-audit.md) for producer/consumer mappings, intentional English literals and data gaps.
- Added validation-path tests and sharing success/revocation/error-switch tests. Unknown provider errors remain hidden, and existing notices retranslate without repeating actions. Preserved all existing user Macedonian edits; the review register remains 907 Pending pairs.
- Extended controlled fixtures to full profile and zero/one/multiple-trip impact counters. Added reusable `scripts/verify-i18n-fixtures.cjs`: 52 EN/MK layouts at 375/1440px, exposed control names, image alternatives, focus observations and 896 opaque-background contrast measurements. Fixed four measured contrast classes using Tailwind utilities; final measured failures: zero. Profile ratings are exercised separately from the profile page's nested async summary.
- Final checks: 942/942 tests across 81 files; ESLint; TypeScript; production build; diff whitespace check. Read-only browser smoke passes including EN→MK→reload→EN, cookies, independent sessions, URL/query/scroll/form state, existing validation, invalid callbacks/protected redirects, mobile navigation, calendar Enter/Escape and visible focus. No account, email, booking, ride or production database mutations.
- AI prompts are unchanged from the October 30 live evaluation (two cases, four synthetic-data calls); no additional paid calls were needed. Generated output and fixed translations still need human review.
- Local commits: `434e16d` application flows/safe notices/loading-flash fix and `50e87f5` locale-aware AI behavior. Final verification scripts, coverage, review register and this handoff are saved in the following documentation/test commit. No push or PR was made.
- Prepared [local PR text](AJDE-29-pr-draft.md) using Ticket/Solution/Screenshots, targeting dev. Publication is blocked on recorded wording approval and explicit permission, per CLAUDE.md.
- Remaining work requires external access or human review: real successful auth and state-changing browser journeys in an isolated test environment; Supabase-managed email-template inspection/localization or agreed exclusion; contextual approval of every translation and AI prompt/sample; revalidation after resulting copy edits; push/PR approval. Phase 3 and locally executable Phase 4 work are complete. The broader acceptance items that depend on these requirements remain unchecked.