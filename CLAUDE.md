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
- UI text is English for now. Macedonian support (i18n) is planned, so don't build sentences by concatenating strings.

## Data and security

- Change the database only through migration files in `ride-share-app/supabase/migrations/`, never the Supabase SQL editor. Apply them to production with `supabase db push` only after the PR is merged, and never push migrations from an unmerged branch.
- Every table has RLS. A new table enables it and gets its policies in the same migration, with cases in `supabase/tests/rls_policies.sql`. The access model is in `supabase/DATABASE_MODELS.md`.
- New tables and sequences start with no API access: grant `anon`/`authenticated` exactly what they need in the same migration. Every new function revokes execute from `public, anon, authenticated` and grants only what it needs; a function meant to be called through the API goes on the allowlist in `supabase/tests/api_privileges.sql`.
- Test migrations locally (`supabase start`, `supabase db reset --local`, `npm run test:db`), never against production.
- Contact details (`phone`, `instagram`, `facebook`, `social_url`) are private: read them only through `getContactDetails()` (`lib/profiles/contact-details.ts`), and write them with a plain update or insert, not an upsert. A new public `profiles` column needs a SELECT grant in its migration.
- Use the user's Supabase client so RLS applies. The admin client (`lib/supabase/admin.ts`) is only for server code that must read across users, and returns only what the caller may see.
- Server-side modules import `server-only`. Secrets never go in `NEXT_PUBLIC_*` variables.
- Validate input with zod in every server action and API route.
- Preview deployments use the production database: don't test destructive actions on previews.

## Code and tests

- Tests sit next to the code (`*.test.ts`). New logic comes with tests.
- Before opening a PR, run from `ride-share-app/`: `npm test`, `npm run lint`, `npx tsc --noEmit`.
- Mock OpenAI in tests. Live evals (`npm run eval:*`, `npm run test:live`) cost credits: run them only when changing prompts or AI behaviour, and put the results in the PR.

## Keeping this file current

- When a change adds something that affects the whole codebase (e.g. i18n, a new auth flow, a design system, a shared data-fetching pattern), update this file in the same PR so later work follows it.
