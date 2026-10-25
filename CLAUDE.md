# CLAUDE.md

Ajde is a student ride-sharing app. The Next.js app lives in `ride-share-app/`; Supabase is the database and auth, Vercel hosts it.

@CONTRIBUTING.md
@ride-share-app/AGENTS.md

## Git

- Follow `CONTRIBUTING.md`. Never push to `main` or `dev`; work on a ticket branch and open a PR.
- Small related tickets (docs, config, a few lines each) can share one branch and PR. List every ticket in the title, e.g. `docs: [AJDE-14, AJDE-48] add CLAUDE.md and ticket templates`, and cover each one in the description.

## Frontend

- Every UI change must be responsive. Build mobile-first and check it at phone width (~375px) and on desktop.
- Style with Tailwind utilities; only add CSS to `globals.css` when utilities can't express it.
- Accessibility basics: semantic elements, a label for every input, `alt` text on images, everything usable by keyboard.
- UI text is English for now. Macedonian support (i18n) is planned, so don't build sentences by concatenating strings.

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
- Use the domain vocabulary in `docs/CONTEXT.md` (e.g. "ride offer", not "ride request").

## Keeping this file current

- When a change adds something that affects the whole codebase (e.g. i18n, a new auth flow, a design system, a shared data-fetching pattern), update this file in the same PR so later work follows it.
