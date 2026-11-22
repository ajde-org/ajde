import { expect, it } from "vitest";
import { translateDraftWarning } from "./draft-warning";
import { createTranslator } from "./translate";
import { en } from "./messages/en";
import { mk } from "./messages/mk";
import type { RideDraftWarning } from "@/lib/rides/ride-draft";
import { calculateFairPrice, fairPriceWarning } from "@/lib/ai/fair-price-tool";

it.each([
  "The post did not include a departure time; choose it manually.",
  "The parser has low confidence in this result; review every field carefully.",
  "The stub could not identify both cities; confirm the route manually.",
  "Relative dates require the live parser; choose the exact departure time.",
  "The post says the price is negotiable; enter a per-seat amount.",
  "The post gives a whole-car price; enter the intended per-seat amount.",
  ...["origin", "destination"].flatMap(field => [
    `The ${field} did not match a canonical city; choose it manually.`,
    `The ${field} pickup did not belong to its city; choose it manually.`,
    `The ${field} place could not be resolved; choose it manually.`,
    `The ${field} pickup could not be linked to a city; choose it manually.`,
  ]),
  "Found 1 ride offer on the same route within three hours. These are possible duplicates; review the matches before publishing.",
  "Found 3 ride offers on the same route within three hours. These are possible duplicates; review the matches before publishing.",
])("localizes code-generated warning without a translation request: %s", message => {
  const warning: RideDraftWarning = { field: null, code: "needs_review", message };
  expect(translateDraftWarning(warning, "mk", createTranslator(mk))).toMatch(/[а-ш]/i);
  expect(translateDraftWarning(warning, "en", createTranslator(en))).toBe(message);
});

it.each([10, 1000])("preserves fair-price evidence and default assumptions in both languages for %s MKD", price => {
  const result = calculateFairPrice({ distanceKm: 100, availableSeats: 3, fuelType: null, consumptionL100Km: null }, { petrol: 80, diesel: 75 });
  if ("error" in result) throw new Error(result.error);
  const warning = fairPriceWarning(price, result)!;
  const translated = translateDraftWarning(warning, "mk", createTranslator(mk));
  expect(translated).toContain(price === 10 ? "ниска" : "висока");
  for (const evidence of ["187", "100 km", "3 слободни места", "7 L/100 km", "80 ден./L", "патарините не се вклучени", "бензин (стандардна вредност)"]) expect(translated).toContain(evidence);
  expect(translateDraftWarning(warning, "en", createTranslator(en))).toBe(warning.message);
});

it.each([["petok", "Friday", "петок"], ["ponedelnik", "Monday", "понеделник"]])("preserves weekday and missing time for %s even without a field", (source, weekday, translated) => {
  for (const field of [null, "departureAt"] as const) {
    const warning: RideDraftWarning = { field, code: "low_confidence", message: `Weekday mentioned as "${source}" (${weekday}), but no time was provided.` };
    expect(translateDraftWarning(warning, "mk", createTranslator(mk))).toBe(`Денот е наведен како „${source}“ (${translated}), но не е наведено време на поаѓање.`);
    expect(translateDraftWarning(warning, "en", createTranslator(en))).toBe(warning.message);
  }
});

it("preserves the exact missing-departure and routing meaning from the reported warnings", () => {
  const warnings: RideDraftWarning[] = [
    { field: "departureAt", code: "missing", message: "No date or time provided." },
    { field: "distanceKm", code: "ambiguous", message: "Routing supplied an editable city-to-city estimate of 172 km; it is not exact pickup-to-drop-off travel." },
  ];
  const t = createTranslator(mk);
  expect(translateDraftWarning(warnings[0], "mk", t)).toBe(mk["warning.noDeparture"]);
  expect(translateDraftWarning(warnings[1], "mk", t)).toBe(t("warning.routingEstimate", { distance: "172" }));
  for (const warning of warnings) expect(translateDraftWarning(warning, "en", createTranslator(en))).toBe(warning.message);
});
it("formats numeric distance evidence and identifies fields for unknown model warnings", () => {
  const t = createTranslator(mk);
  expect(translateDraftWarning({ field: "distanceKm", code: "needs_review", message: "The checked city-to-city road distance is 172.5 km. Review the editable estimate for your actual route." }, "mk", t)).toContain("172,5 km");
  const warning: RideDraftWarning = { field: "seatsTotal", code: "missing", message: "No passenger count was specified in this wording." };
  expect(translateDraftWarning(warning, "mk", t)).toBe(warning.message);
  expect(translateDraftWarning(warning, "en", createTranslator(en))).toBe(warning.message);
});
it("retains recovery translations and safely falls back for unknown fieldless messages", () => {
  const t = createTranslator(mk);
  expect(translateDraftWarning({ field: "car", code: "needs_review", message: "Choose a currently available saved car." }, "mk", t)).toBe(mk["offer.warning.savedCar"]);
  expect(translateDraftWarning({ field: null, code: "ambiguous", message: "toString" }, "mk", t)).toBe("toString");
});

it("uses dynamic translations only for the matching source and preserves English", () => {
  const warning: RideDraftWarning = { field: "departureAt", code: "ambiguous", message: '"okolu 11 casot" interpreted as around 11:00; exact time not specified.',
    translationMk: { source: '"okolu 11 casot" interpreted as around 11:00; exact time not specified.', text: '„okolu 11 casot“ е протолкувано како околу 11:00; точното време не е наведено.' } };
  expect(translateDraftWarning(warning, "mk", createTranslator(mk))).toBe(warning.translationMk!.text);
  expect(translateDraftWarning(warning, "en", createTranslator(en))).toBe(warning.message);
  expect(translateDraftWarning({ ...warning, message: "Changed warning" }, "mk", createTranslator(mk))).toBe("Changed warning");
});
