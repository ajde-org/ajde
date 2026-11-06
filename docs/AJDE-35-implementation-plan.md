# AJDE-35: departure and estimated arrival

Implementation plan followed by the AJDE-35 branch; driver duration extensions were subsequently included. Based on the Linear description and its two reference screenshots, inspected on 2026-11-05.

## Recommendation

Reuse the existing OSRM driving-route response to calculate a city-to-city estimated duration. Show scheduled departure and explicitly estimated arrival. Do not invent a speed formula, add an arbitrary buffer, or describe the result as live traffic prediction. Competitor/provider findings are in [AJDE-35-research.md](AJDE-35-research.md).

The current `lib/rides/road-distance.ts` requests OSRM routes but validates and returns distance only. `/api/rides/distance` and `OfferDistance` already handle authentication, an application-wide routing permit, retries and stale responses. `RideCard` displays departure; `RideRoute` displays two stops without times. `RideView` hydrates ride records without routing requests.

Keep the city-centre basis established by `docs/adr/0001-city-to-city-road-distance.md`. Pickup landmarks must not imply door-to-door precision. Initial copy: “Estimated city-to-city drive. Traffic, stops and pickup arrangements may change arrival.”

## Data and calculation

1. Extend the routing result with finite positive `durationSeconds` from the same selected route as distance. Preserve existing distance rounding, manual distance overrides and price calculations. Internally name the shared operation a route estimate; retain the endpoint path initially to avoid unnecessary API churn.
2. Add a server-owned route-estimate cache keyed by ordered origin/destination city IDs, coordinate version and driving profile/provider version. Proposed TTL: 30 days for this static estimate; this is a product choice, not a provider requirement. Check cache before acquiring the existing global routing permit. Bound cache-miss retries and keep provider failures nonfatal. Do not call the provider per feed card.
3. Persist nullable `estimated_duration_seconds`, `duration_source` and `duration_estimated_at` on rides as a snapshot. Use a positive integer constraint. Derive arrival instead of storing a second timestamp that can become inconsistent. Update `create_ride_offer` to resolve duration from trusted cache data for the submitted city pair; never trust a hidden browser duration field. Keep cache writes restricted to the server. Document RLS/RPC permissions and cover direct RPC callers.
4. On publication, attempt a cache fill if needed, within a bounded timeout. Publishing remains possible without duration. Apply this to manual offers and imported offers. Existing future rides get a throttled backfill, deduplicated by ordered city pair; old/completed rides need not trigger routing. Missing estimates remain null until filled, rather than becoming zero.
5. Route changes invalidate the snapshot; departure changes reuse static duration and recalculate arrival. A manual distance override must neither manufacture duration nor cancel duration lookup for an otherwise unchanged route. Separate duration availability from the existing distance-mode state. Preserve abort/epoch protection against late responses and tab changes; check recovered drafts against their current route.
6. Round duration up to a whole minute once, then use that same duration for both visible duration and arrival. Add elapsed minutes to the UTC departure instant and format both in `Europe/Skopje`. Compute day offsets from local calendar dates, including DST; show “next day” or the arrival date when appropriate. No browser-local timezone arithmetic.

Schema changes must include migration, regenerated `lib/supabase/database.types.ts`, and `supabase/DATABASE_MODELS.md`, as required by AGENTS.md. If a private cache needs privileged writes, isolate the existing server credential mechanism; never expose credentials to the browser.

## UI direction

Keep Ajde's existing fonts, green brand tokens, white rounded cards, spacing and route markers. The reference supplies information hierarchy, not a design to copy. No new badge palette, shadow treatment or card redesign.

The feed card keeps its route title first. Separate the date into a quiet line, then show two aligned time groups: “Departure 08:30” and “Est. arrival 11:05”, with “About 2 h 35 min” beneath. These are illustrative values, not a researched route duration. Keep price, driver, features, seats and the existing action in their current hierarchy. Avoid duplicating city names in both the title and time row. On narrow cards, wrap labels without squeezing times or clipping long city names.

On the detail page, add a narrow tabular-number time column beside the existing vertical `RideRoute` stops. Keep pickup/drop-off text and green markers. Label arrival “Estimated arrival”; show duration and the explanation once below the route. The date/header must not repeat the full departure timestamp unnecessarily.

In the offer form, show a read-only arrival preview near departure after duration resolves. Departure edits update it immediately. Pending estimates use quiet inline text; unavailable estimates say “Arrival estimate unavailable.” Do not require drivers to enter an arrival time in this iteration.

Use semantic `time` elements, visible estimate labels, and screen-reader descriptions including date and timezone. Do not rely on an approximation symbol, colour, or tooltip alone. Unknown arrival remains explicitly unknown while departure and booking stay usable.

## Delivery order and verification

1. Routing parser/cache and schema/RPC changes, including trusted publication and null fallback.
2. Shared pure presentation helper in `lib/rides/ride-presentation.ts`; feed and detail use identical arithmetic.
3. Offer preview and invalidation across `offer-tabs`, recovery, `offer-distance` and publication.
4. Update `components/ride-card.tsx`, `components/ride-route.tsx`, detail page and only the necessary scoped CSS. All consumers of RideCard receive the same display.
5. Backfill upcoming rides with bounded routing requests; verify sample Macedonian city pairs against a second routing service before accepting estimate quality.

Tests should cover invalid/missing provider duration, route direction, cache expiry, provider outage/rate limits, forged client duration, route changes, manual distance mode, publication without an estimate, and stale responses. Presentation tests cover midnight/month/year rollover, DST changes, non-Skopje browser timezones and missing estimates. Check import and manual publication plus feed/detail consistency end to end.

During implementation, capture before/after screenshots at 390, 768 and 1440px (also check 320px overflow), including long names, next-day arrival, unknown duration and full cards with feature tags. Verify keyboard access and screen-reader labels. Run project-required tests, typecheck and production build. No visual validation or application tests have been run for this planning-only change.

## Scope and operational decision

The current public OSRM demo has an application-wide 1.2-second permit and no production service guarantee. Cache plus backfill reduces demand but does not provide an SLA. Before production rollout, select a production OSRM deployment or supported routing provider and validate local route quality; keep provider handling behind the same route-estimate interface. Exact pickup routing, stops, driver duration overrides and traffic forecasts are later features. Traffic-aware routing would also require departure-sensitive caching and a deliberate refresh policy.

## Implemented driver adjustment

Drivers can enter whole-minute journey durations from the route estimate up to 24 hours. The database preserves the trusted route baseline and rejects shorter durations. Arrival dates are explicit when a trip crosses a local date boundary. Run `npx tsx scripts/backfill-ride-timing.ts` after applying the migration to populate upcoming rides; this command has not been run against production.
