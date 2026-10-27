# AJDE-29: Macedonian language support

Status: implementation in progress. First checkpoint implements localization infrastructure, shared shell/date controls, landing and login. Other feature flows and human review remain pending.
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

## Repository findings

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
- [ ] Recheck the ticket for changed requirements and inspect the full string surface before coding. Create a coverage inventory with file/feature, message namespace, and migration status; include embedded image text, metadata, loading/error/not-found files, tooltips, placeholders, aria labels, and live regions.

## Phase 1 — Localization foundation

- [x] Add supported-locale validation, default locale, typed dictionaries, interpolation/plural helpers, and formatting helpers. Test unsupported/missing cookie values, matching keys and parameters, and plural/formatting behavior.
- [x] Add the server-only cookie reader and a server action to change language; validate its input with Zod. Keep cookie mutation out of render functions.
- [x] Add the client provider and server helpers. Keep server-only imports out of client bundles and avoid loading both full catalogs in clients unnecessarily.
- [x] Wire root layout language and translated metadata. Ensure server output and client hydration use the same locale, including loading/error/not-found behavior.
- [x] Add an accessible `English` / `Македонски` selector to desktop and mobile navigation. Show pending/error states and preserve current path, query filters, and in-progress form values when switching.
- [ ] Verify cookie persistence through reload, sign-in, sign-out, and auth callbacks; check two independent browser sessions do not leak locale through caching. Inspect rendering/build implications.

## Phase 2 — Translate by user flow

For each item: migrate all visible and assistive text, supply both catalogs, verify EN/MK rendering, and update the coverage inventory. Translation drafting is distinct from human approval in phase 5.

- [x] Shared shell and landing: `app/page.tsx`, layout metadata, navigation, header/footer, brand accessibility text, `components/landing/*`, shared buttons/panels/skeletons.
- [x] Login UI, status messages, stable action message codes, and invalid-domain validation. Onboarding remains below.
- [ ] Authentication and onboarding: `app/login/*`, `app/onboarding/*`, auth status messages and redirects. Inventory external auth email text and document how it is handled.
- [ ] Discovery: `app/rides/(feed)/*`, `components/discovery/*`, ride cards/routes/seats, filters, interpretation summaries, empty/error states.
- [ ] Offer and import: `app/rides/new/*`, `app/rides/import/*`, ride forms, car selection, screenshot controls, price/distance/ride-check summaries, recovery and publish messages.
- [ ] Ride detail and booking: `app/rides/[id]/(detail)/*`, booking actions, contact details, completion/cancellation controls, availability and permissions messages.
- [ ] Trips and profiles: `app/dashboard/*`, `app/profile/[id]/*`, status filters, driver/passenger views, impact summaries, rating forms and summaries.
- [ ] Chat and sharing: `app/rides/[id]/chat/*`, `components/chat/*`, `app/trip/[token]/*`, `components/trip-share-controls.tsx`, copy/share feedback, unavailable/expired states.
- [ ] Audit all route-level loading/error/not-found text and unmounted error fallbacks; verify they do not fail when a translation provider is unavailable.

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
- [ ] Run from `ride-share-app/`: `npm test`, `npm run lint`, `npx tsc --noEmit`, and `npm run build`. Record pass/fail and any environment-related limitations; do not claim a skipped check passed.
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
- [ ] Make scoped Conventional Commits; suggested first commit: `docs(i18n): plan AJDE-29 Macedonian language support`.
- [ ] Prepare a PR targeting `dev`: `feat: [AJDE-29] add Macedonian language support`, using the repository PR template and Ticket/Solution convention, with validation and human review evidence.
- [ ] Ask for approval before pushing or opening/editing the PR, as required by `CLAUDE.md`. Human translation review must already be complete before opening it. Require one reviewer approval and squash merge into `dev`.

## Acceptance checklist

- [ ] English and Macedonian are selectable and persist across navigation/reload without breaking auth or shared links.
- [ ] Every inventoried application UI flow, validation message, accessible label, and failure state is covered; exceptions are explicitly documented and agreed.
- [ ] Locale-specific formatting is correct while underlying ride times, prices, IDs, and user content remain intact.
- [ ] Both languages work at phone and desktop widths with accessible navigation and controls.
- [ ] Required checks pass, relevant AI changes have evaluation evidence, and every fixed translated sentence has recorded human approval before PR creation.

## Current checkpoint and evidence

- [x] 174 draft catalog messages implemented; all keys/placeholders checked. See [translation review](AJDE-29-translation-review.md).
- [x] [Coverage inventory](AJDE-29-coverage.md) created for 162 candidate source files. File enumeration is complete; detailed migration/audit of remaining flows is still pending (phase 0's full-surface audit stays unchecked).
- [x] Initial implementation: 893 tests pass; lint, type checking, and production build pass. These are checkpoint results, not final validation of the remaining ticket scope.
- [x] Read-only local browser smoke test passes: cookie persistence, English default, independent sessions, URL/query preservation, unsaved form values, translated existing errors, invalid callback/protected-route redirects, mobile menu/calendar, and 375/1024/1440px overflow checks.
- [x] Screenshot review of landing and login in English/Macedonian at phone/desktop sizes; Cyrillic fonts load and labels wrap. Evidence is in ignored `.scratch/ajde-29/`; rerun `node scripts/verify-i18n.cjs` to reproduce.
- [ ] Authenticated sign-in/sign-out lifecycle, all feature screens, and destructive flow regression checks in an isolated test environment. Initial smoke tests do not create accounts, send emails, or modify production data.
- [ ] Human wording approval: none yet. All 174 review rows remain Pending.

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
