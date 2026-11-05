# Repo structure cleanup: agent handoff plan

Goal: make this repo predictable for coding agents. An agent should know where a file lives (or
where a new one goes) without grepping, and the docs it reads should be current.

This is a **pure restructure**: no behaviour, UI, schema or API changes. Every step is moves, renames,
import updates, doc edits, new npm scripts, one component split and deleting one dead file. Anything
that would change behaviour is listed under "Follow-up tickets" at the end. Don't do those here,
even when they're one line away.

This plan was cross-checked by a second, independent agent review. Where the two reviews disagreed,
the outcome is recorded in the section concerned.

All decisions below are already made, so don't reopen them. If a step turns out to be wrong once you
see the code (for example the files have changed since this plan was written), make the smallest
change that keeps the stated rule, and note it in the PR description.

## 0. Before you start

1. **Preconditions.** PRs #13 (AJDE-29 i18n), #15 (AJDE-28/35 cards and arrival times) and the
   AJDE-50 audit fixes (branch `fix/AJDE-50-audit-fixes`) are merged into `dev`. AJDE-50 overlaps
   sections 2, 3 and 5. It changes:
   - `app/dashboard/actions.ts` and `app/login/actions.ts`
   - `passenger-trips(.test).tsx`
   - the eval scripts in `package.json`, and `docs/TESTING.md`
   - adds `import "server-only"` to four `lib/ai` parsers
   - adds `app/dashboard/actions.test.ts`

   Run `gh pr list` and make sure no other open PR touches many of the files moved below. If one
   does, wait for it or coordinate with its author.
2. **Re-baseline.** Those PRs add files this plan doesn't list: new components (`ride-features`,
   `ride-schedule`, `reserve-seat-link`, `driver-notes`, `language-selector`,
   `publish-draft-button`), `lib/rides/ride-timing.ts`, `lib/rides/route-estimate-cache.ts`,
   `scripts/backfill-ride-timing.ts`, `docs/I18N.md`, `docs/AJDE-35-*.md`, and possibly an i18n
   messages folder. Regenerate the inventory with the script in the appendix, then put every new
   file into the same buckets using the rules below.
3. **Ticket, branch and PR.** Create one Linear ticket in team AJDE: type `Improvement`, labels
   `frontend`, `backend` and `database`, priority Low. Cut one branch from `dev`
   (e.g. `refactor/AJDE-NN-repo-structure-cleanup`) and open **one PR** for all of it. That breaks
   the usual "small PRs" convention, and the team has agreed to it for this change, so don't split
   it. Ask the user before pushing or opening the PR.
4. **How to move files.** Use `git mv` so history follows. Keep filenames distinctive: don't rename
   `offer-tabs.ts` to `tabs.ts`, since unique names make file search work. The one exception is a
   real name collision, which gets renamed (see section 8). After each move, fix
   imports (`npx tsc --noEmit` lists the broken ones), including `vi.mock("./x")` paths in tests,
   which `tsc` doesn't check.

### Order of work and commits

One PR, but **one commit per section** (Conventional Commits, e.g.
`refactor(lib): move server actions into lib domains`), so a reviewer can follow it commit by
commit and a bad step can be reverted on its own. Order:

1. Sections 2, 3, 4: scripts, fixtures, docs, manual SQL (almost no app code)
2. Sections 5, 6, 7: lib boundaries (many imports)
3. Sections 8, 9: components and the `ride-form.tsx` split (UI)
4. Section 1, last: write the `AGENTS.md` map against the final layout so it describes what
   actually exists

Run the full verification below after each group, not only at the end. That way a broken import
is traced to the group that caused it.

The PR description lists every section with a one-line summary of what changed, and the stale
claims fixed in section 3.

### Verification

From `ride-share-app/`, after each group and before opening the PR:

```sh
npm test && npm run lint && npx tsc --noEmit && npx next build
```

Plus:
- `git grep` every old path you moved (with and without the `@/` prefix and the extension). It must
  return nothing outside `docs/plans/`.
- Run the appendix script and compare with the target layout.
- Don't run live evals or `verify:*` scripts. Nothing behavioural changed, and they cost credits or
  write to the hosted database.

---

## 1. AGENTS.md: add a codebase map

**Problem.** The instructions say *how* to work (git, RLS, tests) but not *where* things live. The
unwritten rules (where actions go, where AI code goes, which test goes where) only show up by
grepping, and agents copy whichever example they find first.

**Decision.** Add the map to `ride-share-app/AGENTS.md`, below the
`<!-- END:nextjs-agent-rules -->` marker. `next dev` only rewrites the text between the markers
(see `node_modules/next/dist/server/lib/generate-agent-files.js`), so content below it is safe. Both
Claude (via `@ride-share-app/AGENTS.md` in `CLAUDE.md`) and Codex (via the root `AGENTS.md`) already
load this file. Don't touch the root `AGENTS.md`, which is just the entry point.

Add these sections, written against the final layout (this section is done last). If you
changed anything in sections 2–9 from what's planned, the map must describe what you actually did.

```markdown
## Working directory

The repo root holds docs and CI only. Run every npm, npx and supabase command from `ride-share-app/`.

## Glossary

- **Ride**: a published trip with a driver, seats and a departure (`rides` table, `/rides/[id]`).
- **Offer**: the driver's flow for creating rides (`/rides/new`, `lib/offers/`). One offer can produce several rides.
- **Post / import**: a Facebook or Viber group post, pasted or screenshotted, parsed into a ride draft (`/rides/import`, `/api/parse`).
- **Draft** has two meanings, so say which one you mean:
  - **Draft ride**: a real `rides` row with `ride_status = 'draft'`, created by **Save draft**. It's private to the driver.
  - **Ride draft**: the form state (`RideDraft` / `ImportedRideDraft` in `lib/offers/ride-draft.ts`) that a manual entry, an import or an AI fill produces before publishing. Unpublished form tabs are kept only in `sessionStorage`.
- **Interpret vs parse**: `/api/rides/interpret` (`parse-offer-description.ts`) turns a *driver's own* description into ride drafts. `/api/parse` (`parse-ride-post.ts`) turns *someone else's group post* into a ride draft.
- **Booking**: a passenger's seat request on a ride (`bookings` table, `lib/bookings/`).
- **Trip** has two meanings:
  - **My trips** (`/dashboard/trips`): a user's rides, as driver or passenger.
  - **Trip share**: a public read-only link to one ride (`/trip/[token]`, `trip_shares` table, `lib/sharing/`).
- **Room**: the private chat for a ride's driver and accepted passengers (`/rides/[id]/chat`, `lib/chat/`).
- **Completion**: marking a ride done or cancelled (`lib/ride-completion/`).

## Where things go

| What | Where |
| --- | --- |
| Route UI (page, layout, loading, error, not-found) and components used only by that route | `app/<route>/` |
| API routes | `app/api/<area>/route.ts`. Validate with zod, then call into `lib/`. |
| Server actions (`"use server"`) | `lib/<domain>/actions.ts`, never in `app/` |
| Business logic, queries, validation | `lib/<domain>/`: `rides`, `offers`, `bookings`, `chat`, `ratings`, `ride-completion`, `sharing`, `profiles`, `impact`, `auth` |
| Model-facing code: prompts, OpenAI calls, model input/output schemas, model tools, AI feature flags | `lib/ai/` |
| A feature's orchestration around a model call (auth, rate limits, loading data) | `lib/<domain>/ai-*.ts`, which calls into `lib/ai/` |
| Import direction for `lib/ai` | `lib/ai` may import *pure* domain modules (types, schemas, calculators like `ride-draft`, `ride-estimate`), never actions, queries or Supabase clients. Domain code imports `lib/ai` only from `ai-*.ts` orchestration files or API routes, or to use a model I/O schema. |
| Browser-safe vs server-only | A `*-contract.ts` / `*-schema.ts` file is browser-safe: no secrets, no Supabase, no OpenAI. Anything that touches secrets, the admin client or OpenAI starts with `import "server-only"`. |
| Middleware | `proxy.ts` is this Next version's middleware (`middleware.ts` in older versions). |
| Route groups | `(feed)` and `(detail)` under `app/rides/` exist only to scope their `loading.tsx`. They don't affect URLs. |
| Supabase clients and generated types | `lib/supabase/` |
| Shared components | `components/ui/` (no domain knowledge), `components/layout/` (app shell), `components/<domain>/` (same domain names as `lib/`) |
| New component | Start next to its route. Move it to `components/<domain>/` once a second route uses it. |
| Database changes | `supabase/migrations/` only; hand-run SQL goes in `supabase/manual/` |
| Docs | `docs/` at the repo root (see `docs/README.md`) |

## Tests and checks

| Kind | Location | Command | Cost |
| --- | --- | --- | --- |
| Unit / component | `*.test.ts(x)` next to the code | `npm test` | free, mocked |
| Database (RLS, grants, schema) | `supabase/tests/*.sql` | `npm run test:db` (local Supabase) | free |
| Live model checks | `tests/live/*.live.test.ts` | `npm run test:live` | OpenAI credits |
| Model evals | `scripts/eval/*.ts`, data in `fixtures/<area>/*.json` | `npm run eval:<area>` | OpenAI credits |
| Browser / live-DB verification | `scripts/verify/*.cjs` | `npm run verify:<area>` | **writes to whatever database `.env` points at** (read the script's doc first) |

- `fixtures/` holds data only, never executable scripts.
- Test file naming: `<source>.test.ts`, or `<source>.<aspect>.test.ts` for a second file covering
  one part of the same source (e.g. `check-ride-draft.price.test.ts`). Don't rename existing tests
  to fit this.
- Regenerate Supabase types with `npm run db:types` (local database) after every migration that
  changes the model.

## Known exceptions to the CLAUDE.md rules

These are deliberate. Don't "fix" them as a side effect, and don't copy them elsewhere.

- `app/login/actions.ts` (after this PR, `lib/auth/actions.ts`) uses the admin client to mint
  sign-in links. That's a write, not a cross-user read. It's documented in
  `supabase/DATABASE_MODELS.md`.
- `proxy.ts` calls `rpc('profile_contacts')` directly to check profile completion, instead of
  `getContactDetails()`.

## Auth model (current)

Sign-in is limited to student email domains (`STUDENT_EMAIL_DOMAINS`, default
`students.finki.ukim.mk`, checked by `isAllowedStudentEmail` in `lib/auth/email-domain.ts`). The
UI still says "Student Ride Share". Opening the app to everyone in Macedonia is the product goal,
but it isn't built yet. Profile-completion checks are not yet centralised: see the existing
guards in `lib/auth/session.ts` before adding a new route.
```

Before writing the auth section, check it against the code at that point. A follow-up ticket may
have changed it.

**Also, in the root `CLAUDE.md`:**
- Add one line to "Keeping this file current": *"When a change adds a new domain folder, a new
  kind of test, or a new top-level directory, update 'Where things go' in
  `ride-share-app/AGENTS.md`."*
- The intro says "a ride-sharing app for everyone in Macedonia". Keep the goal, but add that it's
  currently limited to student email domains, pointing to "Auth model" in `ride-share-app/AGENTS.md`.
  Make the same change in the root `README.md` (section 3, step 5).
- Under "Data and security", add: *"Scripts under `scripts/verify/` write to whatever database
  `.env` points at. Never run them against the hosted project."*

**Done when:** an agent reading only `CLAUDE.md` and the two `AGENTS.md` files can say where each
of these goes: a new server action, a new OpenAI prompt, a new shared button, a new browser check,
a hand-run SQL script.

---

## 2. Tests, evals and verification scripts

**Problem.** Checks live in four places, and executable scripts are mixed with data in `fixtures/`.
`scripts/verify-*.cjs` and `fixtures/*/verify-*.cjs` do the same job in different places. Two of
the four evals have no npm script.

**Target layout** (all under `ride-share-app/`):

```
scripts/
  eval/      evaluate-chat.ts, evaluate-offers.ts, evaluate-parser.ts, evaluate-search.ts
  verify/    chat-live.cjs, chat-ai-browser.cjs, chat-modal.cjs, contacts-live.cjs,
             ratings-live.cjs, offers.cjs, ux.cjs, README.md
  (one-off maintenance scripts, e.g. backfill-ride-timing.ts from #15, stay in scripts/)
fixtures/
  chat/ai-cases.json   posts/posts.json   search/queries.json      (data only, no READMEs)
```

**Steps:**
1. Move `scripts/evaluate-*.ts` to `scripts/eval/`. Fix their relative fixture imports
   (`../fixtures/...` becomes `../../fixtures/...`).
2. Move the `.cjs` files:
   - `fixtures/chat/verify-live.cjs` → `scripts/verify/chat-live.cjs`
   - `fixtures/chat/verify-ai-browser.cjs` → `scripts/verify/chat-ai-browser.cjs` (update the two
     `require('./verify-ai-browser.cjs')` calls in `chat-live.cjs`)
   - `fixtures/chat/verify-modal.cjs` → `scripts/verify/chat-modal.cjs`
   - `fixtures/contacts/verify-live.cjs` → `scripts/verify/contacts-live.cjs`
   - `fixtures/ratings/verify-live.cjs` → `scripts/verify/ratings-live.cjs`
   - `scripts/verify-offers.cjs` → `scripts/verify/offers.cjs`
   - `scripts/verify-ux.cjs` → `scripts/verify/ux.cjs`

   Path fixes:
   - **`__dirname`-relative paths need one more `..`.** `verify-ux.cjs`
     (`repo = path.resolve(__dirname, '../..')`) becomes `'../../..'`, and `verify-offers.cjs:7`
     (`'../.env'`) becomes `'../../.env'`.
   - **cwd-relative paths don't need changing.** The chat, contacts, ratings and modal scripts use
     `'.env'`, `.test-dist/...` and `resolveDir: process.cwd()`, so they keep working as long as
     they're run from `ride-share-app/`, which the npm scripts guarantee.
   - **Don't change which env file any script reads.** They read `.env`, while the app uses
     `.env.local`. Changing that changes which database the script writes to, so it's a follow-up
     ticket.

   Then write `scripts/verify/README.md`. For each script, give: what it checks, its opt-in env var
   (if it has one), and a bold warning that it creates users and rides in whatever database `.env`
   points at. Of these scripts, only chat, contacts and ratings have an opt-in gate
   (`CHAT_LIVE_TESTS` / `RATINGS_LIVE_TESTS`). `offers.cjs` and `ux.cjs` start writing as soon as
   they run.

   `verify-modal.cjs` and `verify-ux.cjs` are referenced nowhere today. Move them anyway, and
   describe them in the README. `verify-modal` needs no database: it bundles `ai-panel` and needs a
   built `.next/static/css`.
3. Once `fixtures/contacts/` and `fixtures/ratings/` are empty (their READMEs move in step 3 of
   section 3), delete them.
4. Add npm scripts to `package.json`:
   - **All four evals** use `node --conditions=react-server --import tsx scripts/eval/<file>.ts`:
     `eval:parser`, `eval:search`, `eval:chat`, `eval:offers`. The flag is required because the
     `lib/ai` parsers import `server-only`, which throws in plain Node. A bare `tsx` command breaks.
   - **`verify:chat`, `verify:contacts`, `verify:ratings`** (these three have an opt-in gate) and
     **`verify:modal`** (no database), as `node scripts/verify/<x>.cjs`. Don't set the opt-in env
     vars inside the npm scripts: they have to stay a deliberate step.
   - **No npm script for `offers.cjs` or `ux.cjs`.** They have no gate, so a one-word `npm run`
     would write straight to whatever `.env` points at. They get npm scripts in the follow-up ticket
     that makes verify scripts local-only. Until then they're run with `node` directly, as
     documented in their README.
   - **`db:types`**: `supabase gen types typescript --local > lib/supabase/database.types.ts`.
     Add the script but **don't run it** in this PR. The output may differ in formatting from the
     committed file, which was generated another way (see the end of `DATABASE_MODELS.md`). Replace
     that hand-run note in `DATABASE_MODELS.md` with the npm script.
5. Update `lib/ai/parse-ride-post.test.ts`, which imports `../../fixtures/posts/posts.json`, only if
   that path changed (it shouldn't).
6. Check that `eslint.config.mjs` and both vitest configs don't glob the old locations. The `.cjs`
   files start with `eslint-disable` headers, so keep those.

**Done when:** `fixtures/` contains only `.json`, the npm scripts above exist, and `npm test` still
passes (it must not pick up anything under `scripts/`).

---

## 3. Docs: one place, current, no logs

**Problem.** Docs are spread over root `docs/`, `ride-share-app/RIDE_OFFERS.md`,
`ride-share-app/lib/ai/README.md` and four `fixtures/*/README.md`. The fixture READMEs mix feature
behaviour with dated verification logs ("Verified results — 2026-09-21", test counts, "Handoff for
Pero"). Some claims are stale and some links are broken. Agents trust what they read, so a stale doc
does more harm than a missing one.

**Decision.** All prose docs live in the root `docs/`, organised by purpose. Dated verification
results belong in PR descriptions (which `CLAUDE.md` already asks for), not in docs.

**Target:**

```
docs/
  README.md            index: one line per doc
  AI.md                (existing) + location-resolver section from lib/ai/README.md
  TESTING.md           (existing, updated)
  I18N.md              (from #13)
  features/
    chat.md            from fixtures/chat/README.md
    contacts.md        from fixtures/contacts/README.md
    ratings.md         from fixtures/ratings/README.md
    ride-offers.md     from ride-share-app/RIDE_OFFERS.md
    search.md          from fixtures/search/README.md
    post-import.md     from fixtures/posts/README.md
  adr/                 (existing)
  plans/               ticket plans and research, e.g. AJDE-35-*.md from #15, and this file
```

**Steps:**
1. `git mv` each file to its new path, then edit it:
   - Keep: what the feature does, its rules and limits, setup, and how to run its checks (with the
     new `npm run eval:*` / `verify:*` commands from section 2).
   - Delete: "Verified results — <date>" sections, test counts ("230 tests across 20 files"),
     "Round 1 result" tables, "Handoff for <person>", "review baseline was <sha>", and sentences
     about who owns what. Git history and PRs keep these.
   - Delete "apply migration X before running" setup steps. Migrations are applied in order
     automatically, so these are noise now.
2. Merge `lib/ai/README.md` into `docs/AI.md`, then delete it. Its screenshot and checker sections
   duplicate `docs/AI.md`; only "Location normalization" is new. **But that section's first
   paragraph recommends `resolveCanonicalLocation` from `lib/ai/location-candidates.ts`, which is
   dead code.** Nothing imports that file, and its pickup query omits `city_id`, which the live
   code needs.
   - Delete `lib/ai/location-candidates.ts` (and its test, if any). With no importers, this doesn't
     change behaviour.
   - Carry over only the `resolveLocation(raw, candidates, fallback?)` part: the
     `LocationResolution` return type and the alias table.
   - Note that the three routes that load candidates (`/api/parse`, `/api/rides/interpret`,
     `/api/search`) each do it inline. Consolidating them is a follow-up ticket.
   - Commit this as a separate commit (`refactor(ai): remove unused location-candidates
     helper`).
3. Fix every item in **"Outdated docs to fix"** below. Then re-read each moved doc end to end
   for anything else that contradicts the code, and fix that too. Check claims against the code
   and migrations; don't rephrase them from memory.
4. Update every cross-reference: `docs/AI.md` → `RIDE_OFFERS.md`, `docs/TESTING.md` → fixtures
   READMEs, links between the fixture READMEs (`../chat/README.md`), and
   `supabase/DATABASE_MODELS.md`. Use `git grep -n "README.md\|RIDE_OFFERS"` to find them.
5. Write `docs/README.md` as the index, and make the root `README.md` a short orientation: what Ajde
   is, "app is in `ride-share-app/`", and links to `docs/README.md` and `CONTRIBUTING.md`.
6. Move this plan to `docs/plans/` if it isn't there already, and `docs/AJDE-35-*.md` to
   `docs/plans/`.
7. `ride-share-app/README.md` (7 lines): fold it into the root README unless it holds something
   specific, then delete it.
8. Leave `supabase/DATABASE_MODELS.md` where it is. `AGENTS.md` points to it, and it belongs with
   the migrations.

### Outdated docs to fix

Line numbers are from `dev` at `4962b90`. #13 edits `docs/AI.md` and `RIDE_OFFERS.md`, so find each
item by its quoted text, not its line number.

**Wrong facts. An agent acting on these does the wrong thing.**

| Where | Says | Reality / fix |
| --- | --- | --- |
| `docs/TESTING.md:56` | "Row-level security only covers messages and ratings (see README known issues)." | False since AJDE-16 (#7, #9): every table has RLS (`20261031230000_enable_rls_on_all_tables.sql`). Remove it from "known gaps". |
| `fixtures/chat/README.md:47-49` | "Only `messages` and `ratings` have the new table RLS. Existing unrestricted application tables … remain a project-wide production limitation." | Same as above. Delete. |
| `fixtures/contacts/README.md:18` | "Existing project-wide profile/booking table RLS limitations still apply." | Same. Delete. Also check the contacts doc against the current model: contacts moved to private columns read only via `getContactDetails()` (#7, `20261031220000_profile_contacts.sql`). |
| `fixtures/ratings/README.md:34`, `:47` | Lists "Q&A" among the flows the chat fixture covers. | The chat README itself (`:151-152`) says the Q&A UI no longer exists and its assertions were removed. Drop Q&A. |
| `fixtures/chat/README.md:57` | "Booking, completion, impact, Q&A, and trip-share rules are unchanged." | Part of the Pero handoff. Delete the whole section (see below). |
| `fixtures/chat/README.md:73`, `:91`, `:159`; `fixtures/contacts/README.md:49`; `fixtures/ratings/README.md:3-24`, `:42`; `RIDE_OFFERS.md:73-79` | Run the live `verify` scripts "against the configured hosted database / development database". | There is one hosted project, and previews use the **production** database (`CLAUDE.md`). Docs can't make the scripts local-only: the scripts read `.env`, and fixing that is a follow-up ticket. So say plainly that each script writes to whatever `.env` points at, that `.env` must point at local Supabase (`supabase start`), and that pointing it at the hosted project creates synthetic accounts in production. Link to `scripts/verify/README.md`. |
| `RIDE_OFFERS.md:62` | `psql "$DATABASE_URL" -X -v ON_ERROR_STOP=1 -f supabase/tests/schema_smoke.sql` | `.env.example` points `DATABASE_URL` at the hosted pooler, so this runs DB tests against production. Replace it with `npm run test:db` (local Supabase). |
| `fixtures/chat/README.md:16` | "Validate the publication in the SQL editor" | `CLAUDE.md` forbids the SQL editor. Use `psql` against local Supabase, or drop the step. `schema_smoke.sql` already covers it. |
| Header of `scripts/rollback-remaining-macedonian-cities.sql` | "psql, or the Supabase SQL editor" | Drop "or the Supabase SQL editor" when you move it (section 4). |
| `docs/TESTING.md:49` | The student domain is checked on every API | False for `/api/parse` and `/api/parse/screenshot`, which only check that a user exists. Reword it to the truth, and list it under "Not tested / known gaps". |
| `docs/TESTING.md:13` | Lists "comments" among the tested areas | The Q&A/comments UI is gone. Drop it, after checking no comment tests remain. |
| `ride-share-app/README.md:1-5` | Titled "Student Ride Share application", and says setup, architecture, feature status and known issues "live in the repository-root README" | They don't, any more. Fold it into the root README (step 7) and remove the pointer. |
| `CLAUDE.md` intro, root `README.md` | "for everyone in Macedonia" | Currently students only. See section 1, "Also, in the root `CLAUDE.md`". |
| All moved docs | PowerShell blocks (`$env:X = '1'`) | The team is on macOS. Rewrite them as `sh` (`X=1 npm run verify:chat`). |
| `RIDE_OFFERS.md:49-52`, `fixtures/chat/README.md:8-14`, `fixtures/ratings/README.md:3-5` | "Apply these migrations before running …" | Obsolete. Migrations apply in order via `supabase db reset` / `db push`. Delete. |
| `docs/TESTING.md:26` | `npx tsx scripts/evaluate-offers.ts` (AJDE-50 changes it to a `node --conditions=react-server` command) | Becomes `npm run eval:offers` (section 2). Update every command in `TESTING.md`, `RIDE_OFFERS.md` (`node scripts/verify-offers.cjs`, `:64-66`) and the fixture READMEs (`node fixtures/*/verify-live.cjs`, `scripts/evaluate-chat.ts`) to the new npm scripts. |
| `supabase/DATABASE_MODELS.md:120` | `scripts/rollback-remaining-macedonian-cities.sql` | Becomes `supabase/manual/…` (section 4). |

**Broken links**

| Where | Points to | Fix |
| --- | --- | --- |
| `docs/AI.md:3` | `../README.md#how-the-ai-works` | The root README is 3 lines, with no such section. Drop the sentence; `AI.md` is the full doc. |
| `docs/TESTING.md:56` | "README known issues" | Doesn't exist (removed with the RLS line anyway). |
| `lib/ai/README.md:11`, `:22` | "See root README for privacy limits … / loop limits, evidence guards …" | Doesn't exist. That content is in `docs/AI.md` ("Screenshot reader and tool-using checker"). The file is merged into `AI.md` in step 2 anyway. |
| `docs/AI.md:70`, `docs/TESTING.md:23-24`, `fixtures/ratings/README.md:35` | `RIDE_OFFERS.md`, `fixtures/*/README.md`, `../chat/README.md` | Update to the `docs/features/*` paths. |

**Logs and handoff notes. Not wrong, but noise that goes stale. Delete.**

- Test counts: `docs/TESTING.md:8` ("864 tests in 66 files"), `RIDE_OFFERS.md:57` (393),
  `fixtures/chat/README.md:89`, `:157` (230, 517), `fixtures/contacts/README.md:45` (387),
  `fixtures/ratings/README.md:40` (349).
- Dated results sections: `fixtures/chat/README.md` "Verified results — 2026-09-21" (`:87`) and
  "— 2026-09-22" (`:155`); `fixtures/ratings/README.md` "Verified on 2026-09-21" (`:38`) through
  the end; `fixtures/contacts/README.md:45-52`; `RIDE_OFFERS.md:72-76` ("All listed checks passed on
  21 September 2026 …"); `fixtures/posts/README.md` "Round 1 result" (`:32`), including the table;
  `fixtures/search/README.md` "Historical live results" (`:29`) and "Independent date/time
  regression run — 2026-09-22" (end of file).
- Person and handoff notes: `fixtures/chat/README.md` "Handoff for Pero" (`:51-57`). Keep the one
  real fact there (rating RLS and `profile_rating_summary` semantics) only if
  `DATABASE_MODELS.md` doesn't already cover it, and then put it there. Also delete
  `fixtures/ratings/README.md:50-51` ("review baseline was `a6ffbfc` … Dimi's deployed
  checkpoint"), the `lib/ai/README.md` title "Location resolver handoff", and
  `fixtures/search/README.md` "Integration handoff" (`:59`). Keep that section's facts (env vars,
  endpoints), retitled "Configuration".
- `fixtures/chat/README.md:92` mentions `live-results.json`. That isn't a broken reference:
  `verify-live.cjs` writes it to `.test-dist/chat/`. It disappears with the dated section anyway.
- Leave `docs/TESTING.md`'s "Last recorded result" column. It's a deliberate summary of eval
  quality, not a log. Just make sure the commands in it are current.

**Done when:** `git ls-files '*.md'` shows docs only in `docs/`, `supabase/`, and the
instruction files (`CLAUDE.md`, `AGENTS.md` x2, `CONTRIBUTING.md`, `README.md`, `.github/`), and
these return nothing:

```sh
git grep -nE "Verified (results|on) |Handoff|Pero|Dimi|tests (passed|across)|[0-9]{3} tests" -- docs
git grep -niE "only covers messages and ratings|RLS limitations|README known issues|root README|SQL editor|\\\$env:" -- docs ride-share-app/supabase
git grep -nE "scripts/verify-|fixtures/[a-z]+/verify|scripts/evaluate-|RIDE_OFFERS|lib/ai/README" -- docs ride-share-app
```

---

## 4. Hand-run SQL outside migrations

**Problem.** `scripts/rollback-remaining-macedonian-cities.sql` is SQL outside `migrations/`. It's
correct (its header explains it must never be a migration), but an agent following "database changes
only through migrations" either ignores it or wrongly turns it into a migration.

**Steps:**
1. `git mv` it to `ride-share-app/supabase/manual/rollback-remaining-macedonian-cities.sql`.
2. Update the usage line in its header (and drop "or the Supabase SQL editor"), and update the
   reference in `supabase/DATABASE_MODELS.md` (around line 120).
3. Add `supabase/manual/README.md` (3–4 lines): these scripts are run by hand, never by
   `supabase db push`; each one says in its header what it does and when to run it; never
   copy them into `migrations/`.
4. Check that the Supabase CLI ignores the directory. It only reads `migrations/` and the configured
   seed paths. Confirm with `supabase db reset --local`.

---

## 5. Server actions: one home

**Problem.** Five action files are in `app/` and four in `lib/`. The split isn't arbitrary: the
`lib/` ones are called from shared components and the `app/` ones from route-local components. But
that rule isn't written down, and it breaks as soon as a route-local component is promoted.

**Decision.** All server actions go in `lib/<domain>/actions.ts`, named by domain, not by page.
Reasons: domain logic is found by domain name, tests sit with their domain, and promoting a
component never forces an action to move.

**Moves** (keep each file's tests alongside it):

| From | Exports | To |
| --- | --- | --- |
| `app/dashboard/actions.ts` (+ `actions.test.ts`, added by AJDE-50) | `decideBooking`, `cancelBooking` | `lib/bookings/actions.ts` |
| `app/rides/[id]/actions.ts` (+ test) | `requestBooking` | `lib/bookings/actions.ts` (merge; one test file `lib/bookings/actions.test.ts`) |
| `app/login/actions.ts` | `requestMagicLink` | `lib/auth/actions.ts` |
| `app/onboarding/actions.ts` (+ test) | `saveProfile` | `lib/profiles/actions.ts` |
| `app/rides/new/actions.ts` (+ `actions.test.ts`, `save-car.test.ts`) | `saveCar`, `createRide` | `lib/offers/actions.ts` (create `lib/offers/` here if section 7 isn't done yet) |

**Steps:**
1. Merging the two booking files (and their two test files): keep a single `"use server"` at the
   top, and dedupe imports. A `"use server"` file may export **only async functions and types**.
   All current exports qualify (`LoginState`, `ProfileInput`, `CreateRideFormState` are types). Don't
   export a constant or a sync helper from a merged file; put it in a sibling module instead.
2. Update callers. The import graph shows them: dashboard trips components, the ride detail page,
   `login-form.tsx`, `onboarding-form.tsx`, `offer-workspace.tsx`, `ride-form.tsx`.
3. Update `vi.mock(...)` paths in moved tests and in tests that mock these modules. Relative mocks
   fail at runtime, not in `tsc`. Known ones:
   - `app/dashboard/trips/passenger-trips.test.tsx:14` has `vi.mock("../actions")`.
   - `app/rides/new/offer-workspace.test.tsx:10` and `ride-form.test.tsx:7` have
     `vi.mock("./actions")`.

   Change mock setup only, never assertions.
4. Check that `revalidatePath` / `redirect` calls in the actions still target the same routes.
   Moving the file doesn't change them, but don't "fix" them while you're there.
5. Read `node_modules/next/dist/docs/` on Server Actions before moving, per `AGENTS.md`. Nothing
   suggests this Next version needs actions next to routes, but confirm it.

**Review note.** The second reviewer first proposed keeping route-only actions in `app/<route>/`. It
conceded: one rule with no exceptions beats a rule an agent has to judge ("is this used by only one
route?"), and whose answer changes when a component is promoted.

**Done when:** `git grep -l '^"use server"' -- app` returns nothing.

---

## 6. AI code boundary

**Problem.** Chat's AI code is split across `lib/ai/chat-assistant.ts` and
`lib/chat/ai-{contract,feature,service}.ts`. Is chat AI code in `lib/ai` or `lib/chat`? Right now
it's both. Other features keep their model schemas and flags in `lib/ai/`
(`ride-check-contract.ts`, `screenshot-contract.ts`, `import-pipeline-config.ts`), so chat is the
odd one out.

**Rule** (already in the section 1 map): `lib/ai/` holds everything model-facing, including the
model's I/O schemas and AI feature flags, even when UI imports them. `lib/<domain>/ai-*.ts` holds
the orchestration around a model call.

**Moves:**
- `lib/chat/ai-contract.ts` (+ test if any) → `lib/ai/chat-contract.ts`. It holds `aiModelSchema`
  and the AI request/result types. It imports `cursorSchema` and message types from
  `lib/chat/contract.ts`. That's allowed under the import-direction rule, because `contract.ts` is
  pure. It also creates no cycle, since `contract.ts` imports nothing from `lib/ai`.
- `lib/chat/ai-feature.ts` (+ test) → `lib/ai/chat-config.ts`, mirroring `import-pipeline-config.ts`.
- `lib/chat/ai-service.ts` **stays**. It's orchestration (room access, transcript loading, rate
  limit) and fits the rule.
- `lib/ai/chat-assistant.ts` stays.

Callers to update: `app/api/chat/assist/route.ts`, `app/rides/[id]/chat/page.tsx`,
`components/chat/ai-panel.tsx` (+ `ai-panel.test.tsx:5`), `lib/chat/ai-service.ts`,
`lib/chat/transcript.ts`, `lib/ai/chat-assistant.ts`, `scripts/eval/evaluate-chat.ts`.

**Review note.** The second reviewer first proposed that `lib/ai` should never import domain code.
It withdrew that, because `lib/ai` already imports pure domain modules in 12 places. The rule in
the map, "pure modules only, never actions, queries or Supabase", is the workable version.
**Don't add lint enforcement in this PR.** An `import/no-cycle` or boundaries lint rule is a
follow-up ticket.

**Done when:** `ls lib/chat` shows no `ai-*` file except `ai-service.ts` (and its test).

---

## 7. Split `lib/rides/`

**Problem.** `lib/rides/` has 33 files (35+ after #15), and it mixes two features: browsing and
viewing rides, and creating them (the offer flow).

**Decision.** Create `lib/offers/` for the offer and draft flow. Keep filenames.

Move to `lib/offers/` (with tests):
`offer-interpretation`, `offer-recovery`, `offer-tabs`, `offer-values`,
`ride-draft`, `ride-form`, `ride-limits`, `car-selection`, and `actions.ts` from section 5.

`offer-api-auth.ts` **stays in `lib/rides/`** for now. It's an auth guard, and the guard follow-up
ticket will move it into `lib/auth/`. Moving it twice is churn.

Before moving `offer-values.ts`, move its two generic time helpers, `departureInstant` and
`skopjeLocal`, into `lib/rides/skopje-time.ts`, and update their importers. Otherwise
`lib/rides/skopje-time.test.ts:3` would have to import from `lib/offers`. This is a pure move of two
functions, and their tests go with them.

Stays in `lib/rides/`:
`ride-view`, `ride-filters`, `ride-presentation`, `ride-detail-access`, `gender-discovery`,
`ride-price`, `ride-estimate`, `fuel-price-config`, `road-distance`, `skopje-time`, `ride-feed.test`,
plus #15's `ride-timing` and `route-estimate-cache`.

`ride-estimate`, `fuel-price-config` and `road-distance` stay because they're used by the AI
checker and the impact page too, not just offers. After the move, `lib/ai` imports `lib/offers`
(`ride-draft`, `offer-interpretation`, `offer-values`). That's fine, since all three are pure. If the re-baseline shows a file used *only* by
the offer flow, move it as well.

Update the glossary paths in `AGENTS.md`.

---

## 8. Components layout

**Problem.** `components/` mixes 17 loose files with 6 feature folders, and the folder names don't
match `lib/`. Generic primitives (`submit-button`) sit next to domain components (`ride-card`).

**Target.** Folder names match `lib/` domains. Don't move components out of `components/` into
`app/`: that churn buys little, and the rule only applies to *new* components.

| Folder | Files (current; add #13/#15 files by the same logic) |
| --- | --- |
| `components/layout/` | `site-header`, `site-footer`, `app-navigation`, `brand`, `language-selector` (#13) |
| `components/ui/` | `submit-button`, `status-panel`, `ui-icon`, `chat-icon`, `date-picker`, `page-skeletons` |
| `components/rides/` | `ride-card`, `ride-route`, `seat-availability`, and from #15 `ride-features`, `ride-schedule`, `reserve-seat-link`; `driver-notes` (#13) |
| `components/discovery/` | unchanged (feed search). Optionally rename to `components/search/`; skip it if that causes noise |
| `components/profiles/` | `contact-details.tsx` **renamed** to `contact-links.tsx`, and its export `ContactDetails` to `ContactLinks` |
| `components/sharing/` | `trip-share-controls` |
| `components/impact/` | `impact-summary` |
| `components/offers/` | `date-time-field` (it imports `latestDeparture` and the Skopje-time helpers, so it isn't domain-free); `publish-draft-button` (#13), if it's offer-specific |
| `components/chat/`, `ratings/`, `ride-completion/`, `landing/` | unchanged |

**Why the one rename.** `components/contact-details.tsx` would otherwise sit at
`components/profiles/contact-details.tsx`, next to `lib/profiles/contact-details.ts`. Even their
exports collide: the component is `ContactDetails` and so is the lib type. That's a real collision
(both reviewers confused the two while grepping), and it's in the contact-privacy area, where
`CLAUDE.md` names `contact-details.ts` as the only allowed way to read contacts. Rename the
component and its test, and update its two importers (`driver-trips.tsx`, `chat/room.tsx`).

`landing/landing.module.css` stays. The `CLAUDE.md` rule is about `globals.css`, and the landing
page's animations are a reasonable exception. Add one line to the "Where things go" table: *CSS
modules only for the landing page; everything else is Tailwind.*

**Done when:** no `.tsx` sits directly in `components/`.

---

## 9. Split `app/rides/new/ride-form.tsx`

**Problem.** At 889 lines it's by far the largest component, and agents edit big files badly
(partial reads, missed context).

**Steps:**
1. Read it after #15, which changes it. Identify its visual sections (e.g. route and cities,
   departure, car, seats and price, distance and estimate, submit) and its state and effects.
2. Extract each section into a component in `app/rides/new/ride-form/` (e.g.
   `ride-form/route-fields.tsx`, `ride-form/car-fields.tsx`) and keep `ride-form.tsx` as the
   container that owns state and submission. Move pure helpers into `lib/offers/` with tests.
3. No behaviour change: same props, same DOM (labels, ids, order), same tests passing.
   `ride-form.test.tsx` and `offer-workspace.test.tsx` are the safety net, so don't modify their
   assertions.
4. Target: no file over ~300 lines. If a clean split doesn't get there, stop at natural boundaries
   rather than force it.
5. Check at 375px and desktop width in a browser, since `CLAUDE.md` requires this for UI changes.
   Use local dev with a local Supabase, not a preview deployment.

---

## Decided against

These were considered and rejected, so don't do them.

- **Moving `ride-share-app/` to the repo root.** It would change the Vercel project's Root
  Directory setting (a manual dashboard change), every doc path, and the Supabase CLI working dir,
  for a modest gain. The "Working directory" line in `AGENTS.md` covers the agent problem.
- **Renaming routes** (`/trip/[token]`, `/dashboard/trips`) to unify ride/trip naming. That
  changes public URLs and shared links. The glossary handles it.
- **Moving single-route components from `components/` into `app/`.** Lots of churn. The "new
  component" rule governs future work.
- **Dropping filename prefixes** (`offer-tabs.ts` → `offers/tabs.ts`). Unique filenames help
  agents' fuzzy search more than a tidy folder does. The only rename allowed is for a real
  collision (section 8).
- **Keeping route-only server actions in `app/`**, and **"`lib/ai` never imports domain code"**.
  The second reviewer proposed both and then withdrew them (see sections 5 and 6).
- **Renaming other similarly named pairs** (`lib/chat/server.ts` vs `lib/supabase/server.ts`,
  `app/rides/new/ride-form.tsx` vs `lib/offers/ride-form.ts`). They're distinguishable by folder
  and don't share export names. Not worth the churn.

## Follow-up tickets (not in this PR)

Create these Linear tickets (team AJDE, type `Improvement` unless noted) when you open the PR, and
link them from the PR description. Each one changes behaviour, so it doesn't belong in a pure
restructure.

| Ticket | Why | Labels / priority |
| --- | --- | --- |
| **Make verify scripts local-only and read `.env.local`** | Scripts read `.env`, while the app uses `.env.local` and `.env.example` points `.env` at the hosted pooler. `offers.cjs` and `ux.cjs` have no opt-in gate. Make every script refuse a non-local Supabase URL unless `ALLOW_REMOTE=1` is set. Then add `verify:offers` / `verify:ux` npm scripts. | `backend`, `infra` · **Medium** (safety) |
| **One auth and profile-completion guard** | About five ad-hoc guards disagree. Some count a phone number towards a complete profile (`lib/auth/session.ts`, `proxy.ts`), others don't (`/api/search`, `/api/explain`, `offer-api-auth`). `/api/parse` and `/api/parse/screenshot` skip the student-domain check entirely. Add one `lib/auth/guards.ts` and use it everywhere, moving `offer-api-auth` into it. Fix the `proxy.ts` header comment, which claims the file is self-contained. Then update "Auth model" in `AGENTS.md` and `docs/TESTING.md:49`. | Bug · `backend` · Medium |
| **Shared OpenAI client** | There are 8 `new OpenAI(...)` call sites, `"gpt-5.4-mini"` is repeated about 7 times, timeouts run from 10 to 30 s, and `maxRetries`/`store` differ. Add `lib/ai/client.ts` with `openaiClient()` and `modelFor(feature)`. Run the live evals before and after. | `ai` · Low |
| **One location-candidate loader** | `/api/parse`, `/api/rides/interpret` and `/api/search` each load city and pickup candidates inline. | `ai`, `backend` · Low |
| **Prettier + print width** | No formatter today. Some lines run up to 960 characters (prompts in `check-ride-draft.ts`, JSX ternary chains), and quote styles are mixed. Do it in its own PR, with `.git-blame-ignore-revs`, and move long prompts into constants there. | `frontend`, `backend` · Low |
| **CI for test, lint and tsc** | `.github/workflows` only has deployment alerts, so agents get no CI signal on PRs. | `infra` · Medium |
| **Drop dead `revalidatePath("/dashboard/driver")`** | `/dashboard/driver` is a redirect stub, but 7 calls still revalidate it. Also update `lib/ratings/actions.test.ts:60`. | `backend` · Low |
| **Add `server-only` to the remaining server modules** | About 40 `lib` files don't declare whether they're server-only. Adding it can break client imports, so check each one. | `backend` · Low |
| **zod on the login action** | `CLAUDE.md` requires zod validation in every server action, and `requestMagicLink` has none. | `backend` · Low |
| **Import-boundary lint** | Enforce the `lib/ai` import-direction rule with `import/no-cycle` or a boundaries rule. | `infra` · Low |
| **Move test stubs out of production code** | `stubParseRidePost` is exported from `lib/ai/parse-ride-post.ts:345`. | `ai` · Low |
| **Open the app beyond students** (product decision) | `CLAUDE.md` describes the goal as everyone in Macedonia, but auth enforces student domains and the UI says "Student Ride Share". | Feature · `frontend`, `backend` · priority set by the team |

## Out of scope

- **Demo data in migrations** (`20260920132000_seed_demo_rides.sql`,
  `20260922120000_seed_completed_trip_history.sql`). The team handles it separately before launch.
  Don't touch these migrations, don't add a cleanup migration, and don't open a ticket for it.
  Don't add a seed-data rule to "Where things go" either; it'll come with that work.

## Appendix: inventory and import-graph script

Run from `ride-share-app/` with `python3 -I <path>/imports.py . components/ lib/` (prefixes to
show). It lists, for each module, the non-test files that import it, which tells you where a file
is used before you move it.

```python
import os, re, sys, collections
root = sys.argv[1]
files = []
for d in ["app", "components", "lib", "scripts", "tests", "proxy.ts"]:
    p = os.path.join(root, d)
    if os.path.isfile(p):
        files.append(p); continue
    for dp, _, fs in os.walk(p):
        files += [os.path.join(dp, f) for f in fs if f.endswith((".ts", ".tsx"))]
def resolve(src, spec):
    if spec.startswith("@/"): base = os.path.join(root, spec[2:])
    elif spec.startswith("."): base = os.path.normpath(os.path.join(os.path.dirname(src), spec))
    else: return None
    for ext in ["", ".ts", ".tsx", "/index.ts", "/index.tsx"]:
        if os.path.isfile(base + ext): return os.path.relpath(base + ext, root)
users = collections.defaultdict(set)
pat = re.compile(r"""(?:from|import)\s*\(?\s*["']([^"']+)["']""")
for f in files:
    for m in pat.findall(open(f).read()):
        r = resolve(f, m)
        if r: users[r].add(os.path.relpath(f, root))
for t in sorted(users):
    if any(t.startswith(p) for p in sys.argv[2:]):
        u = sorted(x for x in users[t] if ".test." not in x)
        print(f"{t} <- {', '.join(u) or '(tests only)'}")
```
