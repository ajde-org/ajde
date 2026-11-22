import { expect, it } from "vitest";
import { parseRidePost } from "@/lib/ai/parse-ride-post";
import { parseOfferDescription } from "@/lib/ai/parse-offer-description";
import { translateDraftWarning } from "@/lib/i18n/draft-warning";
import { createTranslator } from "@/lib/i18n/translate";
import { mk } from "@/lib/i18n/messages/mk";
import type { RideDraftWarning } from "@/lib/rides/ride-draft";

const now = new Date("2026-11-01T08:00:00Z");
const cities = [{ id: 1, name_en: "Skopje", name_mk: "Скопје", aliases: [] }, { id: 2, name_en: "Veles", name_mk: "Велес", aliases: [] }];
function checkWarnings(warnings: RideDraftWarning[]) {
  const generated = warnings.filter(warning => warning.translationMk);
  expect(generated.length).toBeGreaterThan(0);
  for (const warning of generated) {
    expect(warning.translationMk?.source).toBe(warning.message);
    expect(warning.message).toMatch(/[a-z]/i);
    expect(warning.translationMk?.text).toMatch(/[а-ш]/i);
    expect(`${warning.message} ${warning.translationMk?.text}`).not.toMatch(/dateLocal|departureAt|pricePerSeatMkd|\bnull\b/);
  }
  for (const warning of warnings) expect(translateDraftWarning(warning, "mk", createTranslator(mk))).toMatch(/[а-ш]/i);
  console.log(JSON.stringify(warnings));
}

it("generates bilingual import warnings without losing approximate time evidence", async () => {
  const result = await parseRidePost("Nudam prevoz Skopje do Veles utre okolu 11 casot, 3 mesta, cena po dogovor.", {
    cities: cities.map(city => ({ id: city.id, nameEn: city.name_en, nameMk: city.name_mk, aliases: [] })), pickupPoints: [], now,
  });
  expect(result.classification).toBe("offer");
  expect(result.draft.pricePerSeatMkd).toBeNull();
  checkWarnings(result.draft.warnings);
  const time = result.draft.warnings.filter(warning => warning.field === "departureAt" && warning.translationMk).map(warning => warning.translationMk!.text).join(" ");
  expect(time).toMatch(/11/);
  expect(time).toMatch(/околу|приближ/i);
  expect(result.draft.warnings).not.toContainEqual(expect.objectContaining({ message: "The post did not include a departure time; choose it manually." }));
  expect(result.draft.warnings.map(warning => warning.message).join(" ")).not.toMatch(/whole[- ](?:car|ride)/i);
});

it("generates bilingual offer warnings for a weekday with missing time", async () => {
  const result = await parseOfferDescription({ text: "Nudam prevoz Skopje do Veles petok, 3 mesta, cena po dogovor.", mode: "create" }, {
    cities, pickupPoints: [], cars: [], carModels: [], now,
  });
  expect(result.trips[0].draft.departureAt).toBeNull();
  expect(result.trips[0].draft.pricePerSeatMkd).toBeNull();
  checkWarnings(result.trips.flatMap(trip => trip.draft.warnings));
});
