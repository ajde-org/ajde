# AJDE-35: travel-time research

Researched 2026-11-05. Primary sources only. Recommendations below are product judgments, not claims about competitors' private implementations.

## What other services actually document

- **BlaBlaCar:** its publisher-authored Google Play release notes (Icelandic locale snapshot) say drivers can manually change departure or arrival times for any stop. This establishes editable schedules, but does not establish which routing supplier or duration formula BlaBlaCar uses. No reliable first-party explanation of its duration algorithm was found. [Publisher release notes](https://play.google.com/store/apps/details?hl=is&id=com.comuto).
- **Uber:** GPS observations are matched to road segments; predicted segment traversal times feed route selection, and their sum forms an initial arrival estimate. This is a road-network and traffic prediction problem, not straight-line distance divided by a universal speed. Its rider help distinguishes pickup ETA from destination ETA, says destination estimates update during trips, and makes clear they are not guarantees. [Engineering explanation](https://www.uber.com/au/en/blog/scaling-real-time-traffic/), [rider help](https://help.uber.com/riders/article/how-do-etas-work?nodeId=6a4dbe13-0a86-4d11-a0ab-cc88f8171fb8).

## Available routing approaches

| Approach | Documented behavior | Fit for Ajde |
| --- | --- | --- |
| Existing OSRM routing | Route service finds a fastest route; route objects supply distance in metres and duration in seconds. Routing profile is prepared statically. Standard route API has no scheduled-departure parameter. | Smallest implementation; retain duration from the call already made for distance. Present as approximate driving time, never as live traffic ETA. |
| HERE Routing v8 | Explicit departure time enables time-dependent routing. `duration` uses available dynamic, historical and free-flow data; `typicalDuration` uses historical and free-flow data. `departureTime=any` ignores current/predicted traffic and is usually more optimistic. | Future upgrade for date/time-aware estimates; requires provider integration and evaluation on Macedonian routes. |
| Google Routes | Traffic-aware modes accept departure time; historical conditions matter more for distant departures, live traffic more near now. `TRAFFIC_AWARE_OPTIMAL` uses the Google Maps routing mode, with greater latency. | Another future provider option; extra integration is unnecessary merely to expose a basic estimate now. |

Sources: [OSRM API](https://project-osrm.org/docs/v5.24.0/api/), [HERE time-dependent routing](https://docs.here.com/routing/docs/routing-v8-time-dependent-routing), [HERE duration fields](https://docs.here.com/routing/docs/routing-v8-duration), [Google traffic preferences](https://developers.google.com/maps/documentation/routes/config_trade_offs).

## Recommendation grounded in this repository

`ride-share-app/lib/rides/road-distance.ts` already calls OSRM's public demo endpoint, validates distance, and discards duration. Extend that integration rather than add a second provider or infer time from kilometres. Keep the authenticated routing permit and timeout. Persist the accepted estimate so cards and detail pages never make routing requests. Reuse a directional city-pair estimate where practical, with explicit freshness/provider metadata and bounded cache lifetime.

The existing [city-to-city distance decision](adr/0001-city-to-city-road-distance.md) deliberately uses canonical city reference coordinates, not pickup landmarks. Keep that distinction visible in the estimate's semantics: driving time is approximate city-to-city time and does not model individual pickups, rest breaks or border queues. Do not silently reinterpret stored distance or prices when adding duration.

Compute estimated arrival from the departure instant plus stored duration; format in the app's intended timezone, including next-day arrival. Display scheduled departure and estimated arrival together, with a short duration label and explicit “estimated” wording. Missing duration should remain unknown rather than become zero or a distance/speed guess. Driver editing of duration could be a later feature; it needs provenance and must remain consistent across cards and details.

Use representative Macedonian routes to assess whether OSRM is useful enough before choosing a paid provider. This research does not establish local traffic coverage, current commercial pricing, or production suitability of the public demo server. The current endpoint and User-Agent explicitly describe a demo, so a production provider decision remains separate from displaying its returned duration.
