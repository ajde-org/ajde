# Contributing Guide

How code is committed and merged in this repository. Applies to human and automated contributors.

## Commits

- [Conventional Commits](https://www.conventionalcommits.org): `<type>(<scope>): <description>`, imperative mood.
- Types: `feat`, `fix`, `refactor`, `style`, `docs`, `test`, `chore`, `perf`.
- Keep commits small and scoped to one logical change; describe the effect, not the diff.

## Branches

- `main` is production; `dev` is the integration branch and the default. Both are protected: no direct pushes, force-pushes or deletion.
- One ticket per branch, cut from `dev`, named `<type>/<ticket>-<short-description>` (e.g. `feat/AJDE-30-magic-link-auth`).

## Pull requests

- Every PR needs 1 approval. You can't approve your own.
- Feature PRs target `dev` and are **squash merged**, so each ticket lands on `dev` as one commit.
- Releases are a PR from `dev` to `main`, merged with a **merge commit** so every squash commit from `dev` ends up on `main`.
- Hotfixes: admins can merge a PR without approval when it's urgent. A fix merged straight into `main` must then be merged back into `dev`.
- Title: a Conventional Commit message with the ticket number, e.g. `feat(auth): add magic link sign in (AJDE-30)`.
- Description: first what the ticket was about, then what you did to solve it. Short is fine.

```markdown
## Ticket
AJDE-30: Sign in depends on Supabase sending emails, which hits its rate limit.

## Solution
- Send sign-in emails through our own SMTP provider
- Add a callback route that exchanges the magic link token for a session
```
