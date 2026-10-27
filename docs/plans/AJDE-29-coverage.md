# AJDE-29 coverage inventory

Initial file inventory: 2026-10-27. This is a migration checklist, not a claim that every file contains translatable text. Review literals, template strings, validation results and their consumers before changing a file. Integrated means an explicit i18n dependency exists; it does not prove complete translation coverage.

## Flow checklist

- [x] Locale infrastructure, shared navigation/footer/brand, landing hero/search/about/map, shared date controls, and login UI/action codes implemented with draft catalogs.
- [x] Shared skeleton labels, default submit pending label, and root page error messages migrated.
- [x] Onboarding UI, metadata, photo/contact validation and stable action result keys implemented with draft catalogs; EN/MK state-preservation tests and responsive fixture review complete.
- [ ] Discovery/feed, filters, cards, interpretation and details/booking.
- [ ] Offer/import forms, distance/price checks and persisted drafts.
- [ ] Dashboard/trips, public profiles, contacts, ratings and impact.
- [ ] Chat, shared itineraries, generated AI text and all API/action errors.
- [ ] Route-specific errors/not-found/metadata and remaining loading headings.
- [ ] Final literal scan, visual QA for every flow, and human wording review.

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
| City and pickup catalogs | Existing name_mk/name_en columns; landing search now selects both. Audit other queries and consumers. No schema changes needed. |
| Currency, units, time zones | Keep MKD and Europe/Skopje. Unit symbols kg, L, km, CO₂ are intentional; do not localize internal ISO/date calculations. |
| Auth email templates | Supabase-managed templates not found in this repository. Delivery text has not been localized; scope remains open. |
| User text | Preserve names, messages, descriptions and reviews as authored. |
| AI output | Not yet migrated; review prompts/contracts and persisted-output behavior before edits. No live evals have been run for dictionary work. |
| Browser-native form validation/file picker | Browser/OS controls its own language. Application validation is separately inventoried. |

## File inventory

| File | Proposed namespace / area | Status |
| --- | --- | --- |
| ride-share-app/app/api/chat/assist/route.ts | api errors / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/api/explain/route.ts | api errors / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/api/health/supabase/route.ts | api errors / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/api/parse/route.ts | api errors / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/api/parse/screenshot/route.ts | api errors / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/api/rides/distance/route.ts | api errors / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/api/rides/interpret/route.ts | api errors / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/api/search/route.ts | api errors / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/auth/callback/route.ts | auth | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/auth/signout/route.ts | auth | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/actions.ts | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/driver/page.tsx | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/loading.tsx | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/trips/driver-trips.tsx | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/trips/page.tsx | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/trips/passenger-trip-status.ts | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/trips/passenger-trips.tsx | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/trips/trip-status-filter-nav.tsx | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/trips/trip-tabs.ts | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/trips/trip-views.tsx | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/dashboard/trips/trips-skeleton.tsx | trips | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/error.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/app/layout.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/app/login/actions.ts | auth | Integrated via stable message codes; human review pending |
| ride-share-app/app/login/loading.tsx | auth | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/login/login-form.tsx | auth | Integrated; verify coverage / human review pending |
| ride-share-app/app/login/page.tsx | auth | Integrated; verify coverage / human review pending |
| ride-share-app/app/not-found.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/app/onboarding/actions.ts | onboarding / profile | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/onboarding/loading.tsx | onboarding / profile | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/onboarding/onboarding-form.tsx | onboarding / profile | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/onboarding/page.tsx | onboarding / profile | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/page.tsx | landing / about | Integrated; verify coverage / human review pending |
| ride-share-app/app/profile/[id]/error.tsx | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/profile/[id]/loading.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/profile/[id]/not-found.tsx | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/profile/[id]/page.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/(feed)/loading.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/(feed)/page.tsx | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/rides/[id]/(detail)/loading.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/[id]/(detail)/page.tsx | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/rides/[id]/actions.ts | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/rides/[id]/chat/error.tsx | chat / AI | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/rides/[id]/chat/loading.tsx | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/[id]/chat/page.tsx | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/[id]/not-found.tsx | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/app/rides/import/fair-price-summary.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/import/import-ride-form.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/import/loading.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/import/page.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/import/ride-check-summary.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/import/screenshot-import.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/import/similar-rides-summary.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/new/actions.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/new/loading.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/new/offer-distance.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/new/offer-heading.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/new/offer-workspace.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/new/page.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/rides/new/ride-form.tsx | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/trip/[token]/loading.tsx | sharing | Pending audit/migration (may contain no UI text) |
| ride-share-app/app/trip/[token]/page.tsx | sharing | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/app-navigation.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/components/brand.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/components/chat-icon.tsx | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/chat/ai-panel.tsx | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/chat/room.tsx | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/contact-details.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/date-picker.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/components/date-time-field.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/components/discovery/natural-language-search.tsx | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/components/discovery/ride-results.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/discovery/search-interpretation.tsx | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/components/impact-summary.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/landing/about-sections.tsx | landing / about | Integrated; verify coverage / human review pending |
| ride-share-app/components/landing/date-pill.tsx | landing / about | Integrated; verify coverage / human review pending |
| ride-share-app/components/landing/landing-map.tsx | landing / about | Integrated; verify coverage / human review pending |
| ride-share-app/components/landing/scroll-reveal.tsx | landing / about | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/landing/where-to-form.tsx | landing / about | Integrated; verify coverage / human review pending |
| ride-share-app/components/language-selector.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/components/page-skeletons.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/components/ratings/profile-rating-summary.tsx | ratings | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/ratings/rating-control.tsx | ratings | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/ratings/rating-form.tsx | ratings | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/ratings/star-rating.tsx | ratings | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/ratings/submitted-rating.tsx | ratings | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/ride-card.tsx | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/components/ride-completion/cancel-ride-control.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/ride-completion/complete-ride-button.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/ride-route.tsx | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/components/seat-availability.tsx | shared / discovery / details | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/components/site-footer.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/components/site-header.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/status-panel.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/submit-button.tsx | shared / discovery / details | Integrated; verify coverage / human review pending |
| ride-share-app/components/trip-share-controls.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/components/ui-icon.tsx | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/chat-assistant.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/check-ride-draft.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/explain-match-schema.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/explain-match.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/fair-price-tool.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/import-pipeline-config.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/location-candidates.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/openai-location-contract.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/openai-location-fallback.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/parse-offer-description.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/parse-ride-post.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/parse-search-query.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/parsed-ride-post.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/read-screenshot.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/resolve-location.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/ride-check-contract.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/ride-check-tools.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/screenshot-contract.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/search-query-schema.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ai/similar-rides-tool.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/auth/email-domain.ts | auth | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/auth/session.ts | auth | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/bookings/validation.ts | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/chat/actions.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/chat/ai-contract.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/chat/ai-feature.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/chat/ai-service.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/chat/contract.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/chat/server.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/chat/transcript.ts | chat / AI | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/impact/queries.ts | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/profiles/contact.ts | onboarding / profile | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/profiles/public-profile.ts | onboarding / profile | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ratings/actions.ts | ratings | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ratings/eligibility.ts | ratings | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ratings/queries.ts | ratings | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ratings/types.ts | ratings | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ratings/validation.ts | ratings | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/ride-completion/actions.ts | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/car-selection.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/fuel-price-config.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/gender-discovery.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/offer-api-auth.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/offer-interpretation.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/offer-recovery.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/offer-tabs.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/offer-values.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/ride-detail-access.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/ride-draft.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/ride-estimate.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/ride-filters.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/ride-form.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/ride-limits.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/ride-presentation.ts | offer / import / ride presentation | Integrated; verified in controlled EN/MK fixtures; human review pending |
| ride-share-app/lib/rides/ride-price.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/ride-view.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/road-distance.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/rides/skopje-time.ts | offer / import / ride presentation | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/sharing/actions.ts | sharing | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/sharing/queries.ts | sharing | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/sharing/types.ts | sharing | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/supabase/admin.ts | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/supabase/client.ts | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/supabase/env.ts | shared / discovery / details | Pending audit/migration (may contain no UI text) |
| ride-share-app/lib/supabase/server.ts | shared / discovery / details | Pending audit/migration (may contain no UI text) |
