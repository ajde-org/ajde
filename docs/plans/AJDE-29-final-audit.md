# AJDE-29 implementation audit — 2026-10-31

This records the code audit and controlled verification. It does not approve Macedonian wording or claim a real authenticated end-to-end run.

## Error and validation boundaries

| Producer | Presentation boundary | Result |
| --- | --- | --- |
| Login/onboarding actions | Login and onboarding forms | Stable catalog notices; existing errors retranslate without losing typed values. |
| Ride creation/car saving and Zod issues | Ride form and offer workspace | Field paths map to catalog keys through `issueMessageKeys`; provider messages are not rendered. Unknown paths use the generic validation message. |
| Booking eligibility and request action | `bookingNoticeKey`, detail page | Legacy English notices map to allowlisted keys; arbitrary URL notices use a localized fallback. |
| Dashboard booking decisions | Trips page | Catalog notices with legacy compatibility; authored booking messages remain intact. |
| Rating, completion, cancellation and sharing actions | Corresponding controls | Known static notices are translated at render time. Unknown/parameterized/prototype keys fall back safely. Sharing success, revocation and existing-error language changes have component tests. |
| `/api/search` | Natural-language search | Validated error codes or localized generic failure; warnings use catalog codes. Status and JSON contracts retained. |
| `/api/explain` | Ride results | Errors produce localized fallback/status; generated explanations use request locale. Locale is part of request identity, so late old-language results cannot replace current ones. |
| `/api/parse`, `/api/parse/screenshot` | Import form/screenshot importer | Fixed localized failures and code-based warnings; source text is preserved. Raw tool evidence and provider errors are not shown as notices. |
| `/api/rides/interpret`, `/api/rides/distance` | Offer workspace/distance controller | Localized failure/retry notices. Canonical request city names, retry timing, status codes and machine response text remain unchanged. |
| `/api/chat/assist`, chat actions | Chat AI panel/room | Validated codes map to localized notices; language switch hides old generated answers until explicit regeneration. |
| Query exceptions (profiles, rides, ratings, impact) | Route error boundaries or unavailable states | Fixed localized error text, including provider-unavailable boundaries. Internal errors retain diagnostic detail. |
| `/api/health/supabase`, Supabase configuration | Operational endpoint/server diagnostics | Intentionally retains diagnostic English; not consumed as application UI. |

The remaining English strings in schemas, routing errors, AI tool contracts and booking eligibility are internal contracts. Their UI consumers were traced rather than replacing machine values. The unused legacy `formatSeatPrice`/`seatPriceCaption` exports still return English; application consumers only import `isFreeRide` and format presentation with the locale catalog.

## Formatting and domain data

- Number, money, date and plural helpers use EN/MK locale data. Tests cover 0/1/2/11/21 and Skopje spring/autumn DST boundaries. Scheduling and ISO input values remain unchanged.
- Date controls localize weekdays, months, summaries and accessible labels. Expiry dates use Europe/Skopje. Counts for seats, chat, ratings, import evidence and impact use plural variants; impact fixtures include 0, 1 and 21 trips.
- City/pickup presentation uses existing `name_mk`/`name_en`, including shared itineraries. IDs, aliases and canonical AI/routing inputs remain unchanged. Offer queries retain their existing ordering; this does not change displayed language.
- City names are required by the database model; optional imported display data may fall back to existing English when missing. No new Macedonian place names or translations of authored data were invented. Owner data corrections, if required, are separate from code localization.
- Fuel, gender, status and known preference labels are catalog-backed. Unknown custom tags, names, notes, biographies, reviews and messages remain authored content.

## String surfaces and exceptions

Inspected application JSX text, dynamic notices, metadata, loading/error/not-found routes, placeholders, tooltip/title attributes, image alternatives, accessible names and live regions. Loading wrappers delegate to catalog-backed skeletons; redirects and icon/layout wrappers contain no independent copy.

The remaining literal JSX/attribute scan yields avatar initials `SR`, `AI`, units `KB`, `kg`, `kg CO₂`, the car-model example `Golf, Astra, Clio…`, example email/Instagram addresses and the numeric distance constraint `1–600 km`. These are intentional symbols, brands or examples. Browser-native file pickers and native validity UI follow browser/OS locale. Original social-post screenshots preserve quoted source content and have localized alternative descriptions. No application sentence remains in image assets.

## Visual and accessibility verification

- Live local browser smoke: English default, EN→MK→reload→EN, separate-session isolation, cookie, URL/query/scroll and unsaved login-field preservation, existing validation errors, invalid callback and protected-route redirect, mobile menu/calendar, missing page and synthetic signed-in navigation slots. Widths: 375/768/1024/1280/1440px.
- Controlled fixtures: onboarding, discovery, detail/booking, offer, import, driver/passenger trips, profile, ratings/lifecycle, impact, chat and shared itinerary. EN/MK at 375 and 1440px; previous checks also cover 1024px. Public profile ratings are rendered separately using the actual summary component; the profile fixture mocks the nested async summary only.
- `scripts/verify-i18n-fixtures.cjs` checks overflow, names on exposed controls and image alternatives, records keyboard focus and measures text contrast against opaque backgrounds. It deliberately skips gradients/translucent backgrounds, disabled controls and hidden content; this is not a full accessibility certification.
- Fixed measured contrast failures with Tailwind utilities: car-mode tabs use brand-700, inactive import tabs slate-600, required markers rose-700, trip-filter counts slate-500. No wording changed for these fixes.
- Final measurement: 896 text/background observations across 52 layouts, with zero remaining failures in the measured subset. Calendar activation by Enter, Escape dismissal and visible keyboard focus also pass in the live local browser.
- Inter and Inter Tight include Cyrillic subsets. Existing focus-visible outlines, calendar Escape handling, error focus, chat polite live announcements and status/alert regions were inspected. Static fixtures cannot test real screen-reader announcements; final human contextual language review remains required.

Evidence is local and ignored: `.scratch/ajde-29/final-{tests,lint,build,browser,fixtures}.log`, `fixture-accessibility.json`, and `flows/` + `remaining-flows/` screenshots. Reproduction: build/start locally, generate fixtures with the two `scripts/i18n-*-flows.test.tsx` files and `I18N_FIXTURE_DIR`, then run the two `verify-i18n*.cjs` scripts with `I18N_BASE_URL` and optionally `PLAYWRIGHT_CHROMIUM_EXECUTABLE`.

## Genuine remaining dependencies

1. Real successful sign-in/callback/sign-out and state-changing cross-flow browser checks require an isolated Supabase environment and test account. Mocked auth/action tests cover the code contracts; preview uses production data and was not mutated.
2. Supabase-managed auth-email templates are absent from this repository. Owner access is required to inventory/localize them or explicitly agree on exclusion.
3. All 907 catalog pairs and generated-output prompt/sample review remain Pending human approval. Existing user edits were preserved and are not treated as blanket approval.
4. Local PR text may be prepared; publishing needs recorded wording approval and explicit push/PR permission under `CLAUDE.md`.
