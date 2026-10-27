# CLAUDE.md

Ajde is a ride-sharing app for everyone in Macedonia. The Next.js app lives in `ride-share-app/`; Supabase is the database and auth, Vercel hosts it.

@CONTRIBUTING.md
@ride-share-app/AGENTS.md

## Git

- Follow `CONTRIBUTING.md`. Never push to `main` or `dev`; work on a ticket branch.
- Committing locally is fine, but always ask for approval before pushing or opening/editing a PR, every time.
- Small related tickets (docs, config, a few lines each) can share one branch and PR. List every ticket in the title, e.g. `docs: [AJDE-14, AJDE-48] add CLAUDE.md and ticket templates`, and cover each one in the description.

## Frontend

- Every UI change must be responsive. Build mobile-first and check it at phone width (~375px) and on desktop.
- Style with Tailwind utilities; only add CSS to `globals.css` when utilities can't express it.
- Accessibility basics: semantic elements, a label for every input, `alt` text on images, everything usable by keyboard.
- UI localization uses `en` (default) and `mk` with the `ajde_locale` cookie. Use typed messages in `ride-share-app/lib/i18n/`, `getI18n()` on the server, and `useI18n()` in client components; do not concatenate sentence fragments. The AJDE-29 migration is ongoing: see `docs/plans/AJDE-29-macedonian-language-support.md` and `docs/I18N.md` for coverage and workflow. Every Macedonian message needs recorded human review before a PR.

## Data and security

- Change the database only through migration files in `ride-share-app/supabase/migrations/`, never the Supabase SQL editor.
- Every new table enables RLS and gets its policies in the same migration.
- Server-side modules import `server-only`. Secrets never go in `NEXT_PUBLIC_*` variables.
- Validate input with zod in every server action and API route.
- Preview deployments use the production database: don't test destructive actions on previews.

## Code and tests

- Tests sit next to the code (`*.test.ts`). New logic comes with tests.
- Before opening a PR, run from `ride-share-app/`: `npm test`, `npm run lint`, `npx tsc --noEmit`.
- Mock OpenAI in tests. Live evals (`npm run eval:*`, `npm run test:live`) cost credits: run them only when changing prompts or AI behaviour, and put the results in the PR.

## Keeping this file current

- When a change adds something that affects the whole codebase (e.g. i18n, a new auth flow, a design system, a shared data-fetching pattern), update this file in the same PR so later work follows it.
