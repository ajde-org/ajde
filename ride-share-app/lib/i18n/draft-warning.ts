import type { RideDraftWarning } from "@/lib/rides/ride-draft";
import type { Locale } from "./config";
import type { Translator, StaticMessageKey } from "./translate";
import { formatNumber } from "./format";

// Exact legacy messages are retained in existing imports/session drafts. Translate
// their known meaning without rewriting stored data or exposing arbitrary prose.
const messages: Record<string, StaticMessageKey> = {
  "A saved city is no longer available. Choose it again.": "offer.warning.savedCity",
  "Choose a currently available saved car.": "offer.warning.savedCar",
  "Choose a currently available car model.": "offer.warning.carModel",
  "The recovered departure has passed. Choose a future time.": "offer.warning.departurePassed",
  "No date or time provided.": "warning.noDeparture",
  "Specify the departure date.": "warning.departureDate",
  "Specify an unambiguous departure time, for example 16:00 or 4pm.": "warning.departureTime",
  "Departure is in the past. Choose a future date.": "warning.departurePast",
  "Choose a supported city or pickup point.": "warning.location",
  "Choose your car's exact variant, fuel and consumption; the description is incomplete or ambiguous.": "warning.carVariant",
  "Automatic plausibility check was unavailable.": "warning.checkUnavailable",
  "The post did not include a departure time; choose it manually.": "warning.postMissingTime",
  "The parser has low confidence in this result; review every field carefully.": "warning.parserConfidence",
  "The stub could not identify both cities; confirm the route manually.": "warning.stubRoute",
  "Relative dates require the live parser; choose the exact departure time.": "warning.stubDate",
  "The post says the price is negotiable; enter a per-seat amount.": "warning.negotiablePrice",
  "The post gives a whole-car price; enter the intended per-seat amount.": "warning.wholeCarPrice",
};

export function translateDraftWarning(warning: RideDraftWarning, locale: Locale, t: Translator): string {
  if (Object.hasOwn(messages, warning.message)) return t(messages[warning.message]);
  for (const field of ["origin", "destination"] as const) {
    const parameters = { field: t(`warning.${field}`) };
    if (warning.message === `The ${field} did not match a canonical city; choose it manually.`) return t("warning.canonicalCity", parameters);
    if (warning.message === `The ${field} pickup did not belong to its city; choose it manually.`) return t("warning.pickupCity", parameters);
    if (warning.message === `The ${field} place could not be resolved; choose it manually.`) return t("warning.unresolvedPlace", parameters);
    if (warning.message === `The ${field} pickup could not be linked to a city; choose it manually.`) return t("warning.unlinkedPickup", parameters);
  }
  const duplicates = warning.message.match(/^Found (\d+) ride offers? on the same route within three hours\. These are possible duplicates; review the matches before publishing\.$/);
  if (duplicates && locale === "mk") return t("warning.duplicates", { count: formatNumber(locale, Number(duplicates[1])) });
  const distance = warning.field === "distanceKm" && warning.message.match(/^Routing supplied an editable city-to-city estimate of (\d+(?:\.\d+)?) km; it is not exact pickup-to-drop-off travel\.$/);
  if (distance) return t("warning.routingEstimate", { distance: formatNumber(locale, Number(distance[1])) });
  const checked = warning.field === "distanceKm" && warning.message.match(/^The checked city-to-city road distance is (\d+(?:\.\d+)?) km\. Review the editable estimate for your actual route\.$/);
  if (checked) return t("warning.checkedDistance", { distance: formatNumber(locale, Number(checked[1])) });
  if (locale === "en") return warning.message;
  if (warning.translationMk?.source === warning.message) return warning.translationMk.text;
  // The model may omit the field or classify this as low confidence. The
  // recognized message itself supplies the weekday and missing-time meaning.
  const weekday = warning.message.match(/^Weekday mentioned as "([^"\r\n]+)" \((Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\), but no time was provided\.$/);
  if (weekday) {
    return t("warning.weekdayWithoutTime", { source: weekday[1], weekday: t(`warning.weekday.${weekday[2]}` as StaticMessageKey) });
  }
  // A translation outage or legacy draft must not replace specific evidence
  // with a different, generic meaning. Keep the original until reinterpreted.
  return warning.message;
}
