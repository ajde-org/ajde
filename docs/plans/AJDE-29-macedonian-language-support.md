# AJDE-29: Macedonian language support

Status: implementation in progress, through the second checkpoint. Localization infrastructure, shared shell/date controls, landing/login, onboarding, discovery's fixed UI and ride-detail/seat-request UI are implemented. Remaining flows, API/AI localization, authenticated lifecycle verification and human review are pending.
Updated: 2026-10-27.
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
- [ ] Finish the detailed full-string-surface audit, including embedded image text, metadata, loading/error/not-found files, tooltips, placeholders, aria labels and live regions. File enumeration alone does not complete this audit.

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
- [ ] Complete discovery's generated match explanations, locale propagation/cache keys and API error audit. The discovery flow as a whole is not complete.
- [ ] Offer and import: `app/rides/new/*`, `app/rides/import/*`, ride forms, car selection, screenshot controls, price/distance/ride-check summaries, recovery and publish messages.
- [x] Ride-detail and seat-request UI: `app/rides/[id]/(detail)/*`, booking action notices, localized statuses/tags/routes/prices/seats, availability/permission text and ride not-found state. Controlled EN/MK fixtures and notice-compatibility tests pass.
- [ ] Finish shared contact details and ride completion/cancellation controls with the trips/profile migration. The broader booking lifecycle remains incomplete.
- [ ] Trips and profiles: `app/dashboard/*`, `app/profile/[id]/*`, status filters, driver/passenger views, impact summaries, rating forms and summaries.
- [ ] Chat and sharing: `app/rides/[id]/chat/*`, `components/chat/*`, `app/trip/[token]/*`, `components/trip-share-controls.tsx`, copy/share feedback, unavailable/expired states.
- [ ] Audit all route-level loading/error/not-found text and unmounted error fallbacks; verify they do not fail when a translation provider is unavailable.

  Implemented so far: root error/not-found, ride not-found, profile error/not-found and ride-chat error screens. Offer/import loading headings and provider-unavailable behavior remain pending.

## Phase 3 — Errors, formatting, domain labels, and AI

- [ ] Audit server actions and `app/api/*` for user-facing messages; map known failures to translation keys/codes and parameters while preserving response status and machine contracts. Replace displayed raw provider/database errors with appropriate localized user messages; retain useful server diagnostics.
- [ ] Localize Zod and other validation at the presentation boundary. Test failures and successful action results in both languages, including locale changes with an existing validation error.
- [ ] Localize date picker weekdays/months/aria labels, departures, relative dates, counts, seats, distances, ratings, CO2, and money. Verify zero/one/multiple counts and `Europe/Skopje` DST boundaries; preserve current scheduling semantics.
- [ ] Audit city/pickup names and other database-backed labels. Read `supabase/DATABASE_MODELS.md` before changing those features; use existing localized display data if available and preserve canonical IDs/search aliases. Record gaps rather than renaming stored data opportunistically.
- [ ] Audit generated vs deterministic AI text in each flow. Thread validated locale through relevant calls and cache keys; preserve structured schemas, IDs, source text, and multilingual input support. Define how previously saved generated text displays after a language change.
- [ ] Add mocked AI tests for locale propagation and localized failure/fallback output. If prompts or AI behavior change, run the relevant documented live evals, record costs/results where available, and include results in the eventual PR. Do not run paid evals just for dictionary changes.

## Phase 4 — Regression and visual verification

- [ ] Add colocated tests for new logic and adapt meaningful existing component/action tests to both locales. Check catalog completeness without relying solely on snapshots or a hardcoded-text scan.
- [ ] Exercise EN → MK → reload → EN for logged-out and authenticated journeys, including direct links, query filters, auth callbacks, shared trip tokens, and unsaved forms.
- [ ] Check landing, auth, discovery, offer/import, detail/booking, trips, profile/ratings, chat, and sharing at approximately 375px and desktop in both languages. Record tested routes, screenshots/evidence, and any unavailable flows.
- [ ] Verify Cyrillic fonts, long-label wrapping, navigation, calendars, keyboard use, focus, accessible names, contrast, and screen-reader/live status text. Keep UI changes mobile-first and use Tailwind utilities where possible.
- [x] Run the second-checkpoint checks from `ride-share-app/`: test runner (907/907 tests across 74 files), repository lint, TypeScript and production build all pass. Direct Node entry points were used for the equivalent package commands because of sandbox access restrictions.
- [ ] Re-run required checks after the remaining implementation and record final ticket-wide results. Checkpoint passes do not complete final regression verification.
- [ ] Audit remaining English literals and classify intentional exceptions (user content, brands, internal logs, protocol values). Confirm no missing keys or unintended English fallback in completed Macedonian flows.
- [ ] Keep preview testing non-destructive because previews use the production database. Use controlled local/test fixtures for state-changing regression checks.

## Phase 5 — Human language review (required before PR)

- [x] Create `docs/plans/AJDE-29-translation-review.md` with a glossary and review rows keyed to every catalog message, including variants, placeholders, context, reviewer, date, and approved revision. Include any app-authored prose outside catalogs.
- [ ] A human reviews every Macedonian sentence and wording variant in context. Record natural terminology, consistency, spelling, grammar, and unnecessary anglicisms; include the ticket's Објави example in the glossary.
- [ ] Resolve feedback and obtain recorded human approval for every row. Any wording changed after approval reopens its review row.
- [ ] Human-review generated-output samples and locale prompt wording, and record the distinction between fixed approved messages and runtime generated text. Resolve any scope disagreement before claiming ticket acceptance.
- [ ] Recheck visual layout and relevant tests after language corrections; record reviewer name/date and the exact catalog commit or revision reviewed.

## Phase 6 — Documentation and delivery

- [x] Update the existing `CLAUDE.md` English-only rule with the implemented locale/message workflow, default, and instructions for adding reviewed text. Keep shared rules in their existing source file.
- [x] Document locale persistence, formatting, catalog organization, and translation review in an appropriate existing app/developer document. Update `docs/AI.md` if locale affects AI behavior.
- [ ] Review the final diff for ticket scope, complete the coverage inventory, and update this checklist and handoff log.
- [x] Commit the first implementation checkpoint, including the saved plan: `8651610 feat(i18n): add AJDE-29 locale foundation and initial translations`.
- [x] Commit the second implementation checkpoint as scoped Conventional Commits: `a40fe7c` (responsive UI/language switching) and `db4b0ce` (onboarding/discovery/ride-detail localization).
- [ ] Commit the remaining implementation as scoped Conventional Commits as its unchecked tasks are completed.
- [ ] Prepare a PR targeting `dev`: `feat: [AJDE-29] add Macedonian language support`, using the repository PR template and Ticket/Solution convention, with validation and human review evidence.
- [ ] Ask for approval before pushing or opening/editing the PR, as required by `CLAUDE.md`. Human translation review must already be complete before opening it. Require one reviewer approval and squash merge into `dev`.

## Acceptance checklist

- [ ] English and Macedonian are selectable and persist across navigation/reload without breaking auth or shared links.
- [ ] Every inventoried application UI flow, validation message, accessible label, and failure state is covered; exceptions are explicitly documented and agreed.
- [ ] Locale-specific formatting is correct while underlying ride times, prices, IDs, and user content remain intact.
- [ ] Both languages work at phone and desktop widths with accessible navigation and controls.
- [ ] Required checks pass, relevant AI changes have evaluation evidence, and every fixed translated sentence has recorded human approval before PR creation.

## Current checkpoint and evidence

- [x] 354 draft catalog message pairs implemented; matching keys/placeholders checked. See [translation review](AJDE-29-translation-review.md).
- [x] [Coverage inventory](AJDE-29-coverage.md) created for 162 candidate source files. File enumeration is complete; detailed migration/audit of remaining flows is still pending (phase 0's full-surface audit stays unchecked).
- [x] Latest implementation checkpoint: 907 tests across 74 files pass; lint, type checking and production build pass. These are second-checkpoint results, not final validation of the remaining ticket scope. The first checkpoint's 893-test result remains in its historical log.
- [x] Read-only local browser smoke test passes: cookie persistence, English default, independent sessions, scroll/URL/query preservation, unsaved form values, translated existing errors, invalid callback/protected-route redirects, mobile menu/calendar and EN/MK navbar/savings layouts at 375/768/1024/1280/1440px. Signed-in navbar checks use DOM fixtures.
- [x] Screenshot review of landing/login and controlled onboarding/discovery/ride-detail fixtures in English/Macedonian at phone/desktop sizes; Cyrillic fonts load and labels wrap. Evidence is in ignored `.scratch/ajde-29/` and `.scratch/ajde-29/flows/`. Rerun `node scripts/verify-i18n.cjs` for landing/login/navbar checks; `scripts/i18n-flows.test.tsx` generates controlled feature-page HTML when `I18N_FIXTURE_DIR` is set.
- [ ] Authenticated sign-in/sign-out lifecycle, all feature screens, and destructive flow regression checks in an isolated test environment. Initial smoke tests do not create accounts, send emails, or modify production data.
- [ ] Human wording approval: none yet. All 354 review rows remain Pending.

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
