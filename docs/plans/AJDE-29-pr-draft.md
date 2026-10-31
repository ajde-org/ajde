# Local PR draft — not published

Title: `feat: [AJDE-29] add Macedonian language support`
Target: `dev`

## Ticket

AJDE-29 adds English/Macedonian language selection throughout Ajde. The preference persists in a cookie across navigation and reloads, including the `/rides` loading state that previously flashed English.

## Solution

- Add typed EN/MK catalogs, server/client locale helpers, a language switcher and localized metadata, loading states, forms, validation, notifications and accessible labels across all application flows.
- Format dates, numbers, money and plural counts for the selected language; use existing localized city/pickup names while preserving IDs, scheduling and authored content.
- Generate match explanations and chat answers in the selected locale. Ignore stale old-language explanations and require explicit chat regeneration after switching.
- Protect notices from raw external errors and fix responsive wrapping, navigation and measured text-contrast issues.

Validation: 942 tests across 81 files, ESLint, TypeScript and production build pass. Read-only browser smoke covers locale persistence, redirects, query/scroll/form state, keyboard calendar controls and navigation. Controlled EN/MK fixtures cover 52 phone/desktop layouts. Two live AI locale cases passed on October 30 (four synthetic-data calls); prompts have not changed since. See [final audit](AJDE-29-final-audit.md) for evidence and limitations.

**Not ready to publish:** all 907 translation pairs and AI prompt/sample review remain Pending human approval. Real successful authentication/state-changing browser journeys require an isolated test environment. Supabase-managed email templates require owner inspection or an agreed exclusion. No preview database mutations occurred. Obtain explicit push/PR permission only after review prerequisites are met.

## Screenshots

Local artifacts in `.scratch/ajde-29/`: landing/login/navigation; `flows/` onboarding/discovery/detail; `remaining-flows/` offer/import/trips/profile/ratings/impact/chat/sharing. Both languages have 375px and 1440px captures; selected earlier checks also include 1024px. Attach representative reviewed captures when publication is authorized. Fixture avatar paths are synthetic and intentionally do not fetch real users' photos.
