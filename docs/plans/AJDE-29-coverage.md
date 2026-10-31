# AJDE-29 coverage inventory

Initial file inventory: 2026-10-27. This is a migration checklist, not a claim that every file contains translatable text. Review literals, template strings, validation results and their consumers before changing a file. Integrated means an explicit i18n dependency exists; it does not prove complete translation coverage.

## Flow checklist

- [x] Locale infrastructure, shared navigation/footer/brand, landing hero/search/about/map, shared date controls, and login UI/action codes implemented with draft catalogs.
- [x] Shared skeleton labels, default submit pending label, and root page error messages migrated.
- [x] Onboarding UI, metadata, photo/contact validation and stable action result keys implemented with draft catalogs; EN/MK state-preservation tests and responsive fixture review complete.
- [x] Discovery/feed, filters, cards, interpretation and details/booking UI; generated match explanations now use the request locale.
- [x] Offer/import forms, distance/price checks and persisted draft presentation.
- [x] Dashboard/trips, public profiles, contacts, ratings and impact UI.
- [x] Chat and shared itinerary UI, fixed failure messages, locale-aware explanations and chat answers.
- [x] Complete the final API/action contract audit; see [final audit](AJDE-29-final-audit.md).
- [ ] Real authenticated cross-flow verification in an isolated environment (access dependency).
- [x] Route-specific errors/not-found/metadata and loading headings, including provider-unavailable fallbacks.
- [x] Final literal scan and controlled visual/accessibility checks; see final audit for scope and evidence.
- [ ] Human wording review.

### Final local audit — 2026-10-31

The detailed file/string/API audit is complete; see [final audit](AJDE-29-final-audit.md). Final validation: 942 tests across 81 files, lint, TypeScript and build pass. Browser smoke and 52 bilingual fixture layouts pass; 896 measured text/background pairs have no remaining contrast failures after the documented fixes. Real authenticated access, external email templates and human wording approval remain open. The following October 30 checkpoint is retained as historical context.

### Implementation checkpoint — 2026-10-30

- Phase 2 UI migrations are implemented and tested. Separate feature catalogs cover offer, ride form, import evidence, trips, profiles/ratings/lifecycle, chat, sharing and explanations. The review register contains 907 pairs, all Pending human approval.
- The `/rides` skeleton uses the selected request catalog before hydration. Error boundaries can render without the provider. New/import/profile/chat/shared metadata and all existing loading/error/not-found files were inspected.
- Offer/car, ratings, cancellation/completion, booking decisions and sharing actions return stable notices, translated at render time. Chat uses existing machine error codes. Import, search, interpretation and distance consumers use fixed localized failures; raw provider messages are not shown. API status codes and diagnostic response shapes are retained. `/api/health/supabase` is an operational diagnostic endpoint, not an application translation surface.
- Shared itinerary queries fetch `name_mk` as well as `name_en`; canonical IDs and share authorization remain intact. User names, notes, messages, car descriptions and source posts remain authored content.
- Match explanations and chat generated text follow the cookie locale. Client explanation request keys include locale. Chat retains the question and asks for explicit regeneration after switching. Source parser/checker schemas and stored drafts are unchanged; Macedonian warnings use validated catalog codes. See `docs/AI.md` for details.
- Verification: 928 unit/component tests, lint, TypeScript and production build pass. Two additional live locale evaluations pass (four paid synthetic-data calls). Controlled EN/MK fixtures cover offer/import, driver/passenger trips, chat, ratings/lifecycle and sharing at 375/1024/1440px. The file inventory below records integration, not a substitute for the final full-string/accessibility audit.
- Remaining external scope: successful real Supabase auth sessions and email templates. Mocked successful callbacks/sign-out are covered, but no real account was used. No destructive preview testing or production data mutations occurred.

### Offer-composition checkpoint — 2026-10-27

- The new-ride heading/loading heading, AI description controls, draft tabs, recovery/storage notices, distance lookup feedback, import link, warning summary, map attribution and related accessible labels use paired EN/MK catalog messages. Tab labels use localized city names; route requests still use canonical English city names.
- Draft storage keeps language-neutral notice keys. Previously stored English distance notices and recovery warnings remain readable through a compatibility mapping. Generated warnings use the validated warning code in Macedonian; English keeps their original detail until the AI warning audit is complete.
- The ride form, car selection, price/estimate UI, publish action and field errors, and the import flow still need migration. The offer/import flow checkbox remains open.

### Second implementation checkpoint — 2026-10-27

- Discovery's fixed UI is localized: filters, empty states, natural-language search controls and failures, interpretation criteria, city names, date/number/money formatting and ride cards. Generated match explanations and API error contracts remain in the AI/API audit; the overall discovery checkbox stays open.
- Search interpretation warnings now render deterministic catalog text from their validated warning code, including interpretations saved in URLs. Generated English warning prose is not displayed. The original query remains editable. No model prompts or structured schemas changed.
- Ride details and seat requests use localized statuses, route/pickup names, prices, preferences, notices and accessibility text. Known tags are translated; unknown custom tags and driver notes remain as authored. Booking URLs now carry validated notice keys; older English notices remain compatible, and arbitrary query-string notices use a catalog fallback.
- Profile and ride-chat error states and profile/ride not-found states are localized. Other profile/chat screens and offer/import loading headings remain pending.
- Navbar uses a circular flag button with “Switch language” / “Промени јазик” labels, preserves scroll during locale refresh, and keeps signed-in slots from overlapping. Landing savings formulas wrap independently of label length. Browser checks cover both languages at 375/768/1024/1280/1440px.
- Onboarding, discovery and booking pages have controlled fixtures for read-only visual review at 375/1024/1440px. These fixtures do not establish a real authenticated session or modify database records.

## Special surfaces and exceptions

| Surface | Decision / follow-up |
| --- | --- |
| Landing screenshots under public/landing | Preserve original social posts as quoted source content; localized alt descriptions supplied. Embedded platform UI remains part of the source screenshot. |
| Brand artwork | Preserve ajde wordmark; home-link accessible label is translated. |
| City and pickup catalogs | Existing name_mk/name_en columns used by presentation queries, including shared itineraries. Search/model normalization keeps canonical names/aliases and IDs. No schema changes. |
| Currency, units, time zones | Keep MKD and Europe/Skopje. Unit symbols kg, L, km, CO₂ are intentional; do not localize internal ISO/date calculations. |
| Auth email templates | Supabase-managed signup/magic-link/invite/recovery/email-change templates are not in this repository. Owner inspection/localization or an explicitly agreed exclusion remains required. |
| User text | Preserve names, messages, descriptions and reviews as authored. |
| AI output | Locale-aware generated explanations/chat; deterministic localized warning presentation for structured parsers and stored drafts. Live synthetic EN/MK samples passed; human prompt/sample review remains pending. |
| Technical symbols and examples | SR avatar initials, AI badge, platform names, kg/L/km/KB/CO₂, model names, example email/URL and number-input constraints are intentional. Application labels and accessible descriptions use catalogs. |
| Browser-native form validation/file picker | Browser/OS controls its own language. Application validation is separately inventoried. |

## File inventory

| File | Proposed namespace / area | Status |
| --- | --- | --- |
| ride-share-app/app/api/chat/assist/route.ts | api errors / AI | Request locale propagated; machine contracts retained |
| ride-share-app/app/api/explain/route.ts | api errors / AI | Request locale propagated; machine contracts retained |
| ride-share-app/app/api/health/supabase/route.ts | api errors / AI | Operational diagnostics; not displayed as application UI |
| ride-share-app/app/api/parse/route.ts | api errors / AI | Localized by UI consumer; machine response text retained |
| ride-share-app/app/api/parse/screenshot/route.ts | api errors / AI | Localized by UI consumer; machine response text retained |
| ride-share-app/app/api/rides/distance/route.ts | api errors / AI | Localized by UI consumer; machine response text retained |
| ride-share-app/app/api/rides/interpret/route.ts | api errors / AI | Localized by UI consumer; machine response text retained |
| ride-share-app/app/api/search/route.ts | api errors / AI | Localized by UI consumer; machine response text retained |
| ride-share-app/app/auth/callback/route.ts | auth | Audited redirects; mocked lifecycle verified; real-session validation pending |
| ride-share-app/app/auth/signout/route.ts | auth | Audited redirects; mocked lifecycle verified; real-session validation pending |
| ride-share-app/app/dashboard/actions.ts | trips | Stable notice keys; translated by consuming UI |
| ride-share-app/app/dashboard/driver/page.tsx | trips | Audited layout/icon/redirect wrapper; copy supplied by localized children |
| ride-share-app/app/dashboard/loading.tsx | trips | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/dashboard/trips/driver-trips.tsx | trips | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/dashboard/trips/page.tsx | trips | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/dashboard/trips/passenger-trip-status.ts | trips | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/dashboard/trips/passenger-trips.tsx | trips | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/dashboard/trips/trip-status-filter-nav.tsx | trips | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/dashboard/trips/trip-tabs.ts | trips | Catalog keys plus stable filter/URL values |
| ride-share-app/app/dashboard/trips/trip-views.tsx | trips | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/dashboard/trips/trips-skeleton.tsx | trips | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/error.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/layout.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/login/actions.ts | auth | Integrated via stable message codes; human review pending |
| ride-share-app/app/login/loading.tsx | auth | Delegates to catalog-backed skeleton; no independent copy |
| ride-share-app/app/login/login-form.tsx | auth | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/login/page.tsx | auth | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/not-found.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/onboarding/actions.ts | onboarding / profile | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/onboarding/loading.tsx | onboarding / profile | Delegates to catalog-backed skeleton; no independent copy |
| ride-share-app/app/onboarding/onboarding-form.tsx | onboarding / profile | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/onboarding/page.tsx | onboarding / profile | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/page.tsx | landing / about | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/profile/[id]/error.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/profile/[id]/loading.tsx | shared / discovery / details | Delegates to catalog-backed skeleton; no independent copy |
| ride-share-app/app/profile/[id]/not-found.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/profile/[id]/page.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/(feed)/loading.tsx | shared / discovery / details | Delegates to catalog-backed skeleton; no independent copy |
| ride-share-app/app/rides/(feed)/page.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/[id]/(detail)/loading.tsx | shared / discovery / details | Delegates to catalog-backed skeleton; no independent copy |
| ride-share-app/app/rides/[id]/(detail)/page.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/[id]/actions.ts | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/rides/[id]/chat/error.tsx | chat / AI | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/[id]/chat/loading.tsx | chat / AI | Delegates to catalog-backed skeleton; no independent copy |
| ride-share-app/app/rides/[id]/chat/page.tsx | chat / AI | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/[id]/not-found.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/import/fair-price-summary.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/import/import-ride-form.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/import/loading.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/import/page.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/import/ride-check-summary.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/import/screenshot-import.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/import/similar-rides-summary.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/new/actions.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/app/rides/new/loading.tsx | offer / import / ride presentation | Integrated via localized heading; final flow verification pending |
| ride-share-app/app/rides/new/offer-distance.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/new/offer-heading.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/new/offer-workspace.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/new/page.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/rides/new/ride-form.tsx | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/app/trip/[token]/loading.tsx | sharing | Delegates to catalog-backed skeleton; no independent copy |
| ride-share-app/app/trip/[token]/page.tsx | sharing | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/app-navigation.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/brand.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/chat-icon.tsx | chat / AI | Audited layout/icon/redirect wrapper; copy supplied by localized children |
| ride-share-app/components/chat/ai-panel.tsx | chat / AI | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/chat/room.tsx | chat / AI | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/contact-details.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/date-picker.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/date-time-field.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/discovery/natural-language-search.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/discovery/ride-results.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/discovery/search-interpretation.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/impact-summary.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/landing/about-sections.tsx | landing / about | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/landing/date-pill.tsx | landing / about | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/landing/landing-map.tsx | landing / about | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/landing/scroll-reveal.tsx | landing / about | Audited layout/icon/redirect wrapper; copy supplied by localized children |
| ride-share-app/components/landing/where-to-form.tsx | landing / about | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/language-selector.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/page-skeletons.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/ratings/profile-rating-summary.tsx | ratings | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/ratings/rating-control.tsx | ratings | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/ratings/rating-form.tsx | ratings | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/ratings/star-rating.tsx | ratings | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/ratings/submitted-rating.tsx | ratings | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/ride-card.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/ride-completion/cancel-ride-control.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/ride-completion/complete-ride-button.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/ride-route.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/seat-availability.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/site-footer.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/site-header.tsx | shared / discovery / details | Audited layout/icon/redirect wrapper; copy supplied by localized children |
| ride-share-app/components/status-panel.tsx | shared / discovery / details | Audited layout/icon/redirect wrapper; copy supplied by localized children |
| ride-share-app/components/submit-button.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/trip-share-controls.tsx | shared / discovery / details | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/components/ui-icon.tsx | shared / discovery / details | Audited layout/icon/redirect wrapper; copy supplied by localized children |
| ride-share-app/lib/ai/chat-assistant.ts | chat / AI | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/lib/ai/check-ride-draft.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/explain-match-schema.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/explain-match.ts | chat / AI | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/lib/ai/fair-price-tool.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/import-pipeline-config.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/location-candidates.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/openai-location-contract.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/openai-location-fallback.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/parse-offer-description.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/parse-ride-post.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/parse-search-query.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/parsed-ride-post.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/read-screenshot.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/resolve-location.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/ride-check-contract.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/ride-check-tools.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/screenshot-contract.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/search-query-schema.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ai/similar-rides-tool.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/auth/email-domain.ts | auth | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/auth/session.ts | auth | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/bookings/validation.ts | shared / discovery / details | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/chat/actions.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/chat/ai-contract.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/chat/ai-feature.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/chat/ai-service.ts | chat / AI | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/lib/chat/contract.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/chat/server.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/chat/transcript.ts | chat / AI | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/impact/queries.ts | shared / discovery / details | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/profiles/contact.ts | onboarding / profile | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/profiles/public-profile.ts | onboarding / profile | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ratings/actions.ts | ratings | Stable notice keys; translated by consuming UI |
| ride-share-app/lib/ratings/eligibility.ts | ratings | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ratings/queries.ts | ratings | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ratings/types.ts | ratings | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ratings/validation.ts | ratings | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/ride-completion/actions.ts | shared / discovery / details | Stable notice keys; translated by consuming UI |
| ride-share-app/lib/rides/car-selection.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/fuel-price-config.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/gender-discovery.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/offer-api-auth.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/offer-interpretation.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/offer-recovery.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/offer-tabs.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/offer-values.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/ride-detail-access.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/ride-draft.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/ride-estimate.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/ride-filters.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/ride-form.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/ride-limits.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/ride-presentation.ts | offer / import / ride presentation | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/lib/rides/ride-price.ts | offer / import / ride presentation | Legacy English formatters unused by UI; consumers localize prices |
| ride-share-app/lib/rides/ride-view.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/road-distance.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/rides/skopje-time.ts | offer / import / ride presentation | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/sharing/actions.ts | sharing | Stable notice keys; translated by consuming UI |
| ride-share-app/lib/sharing/queries.ts | sharing | Catalog-backed UI/helper; flow verification recorded in current checkpoint |
| ride-share-app/lib/sharing/types.ts | sharing | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/supabase/admin.ts | shared / discovery / details | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/supabase/client.ts | shared / discovery / details | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/supabase/env.ts | shared / discovery / details | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
| ride-share-app/lib/supabase/server.ts | shared / discovery / details | Audited contracts/data/diagnostics; UI translation boundary recorded in final audit |
