import { afterEach, beforeEach, expect, it, vi } from "vitest";
const parse = vi.hoisted(() => vi.fn());
vi.mock("openai", () => ({ default: class { responses = { parse }; } }));
import { parseOfferDescription } from "./parse-offer-description";
import { parseRidePost } from "./parse-ride-post";
import { emptyOfferDraft } from "@/lib/rides/offer-interpretation";
import { rideDraftWarningSchema } from "@/lib/rides/ride-draft";
import { translateDraftWarning } from "@/lib/i18n/draft-warning";
import { createTranslator } from "@/lib/i18n/translate";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";

const warning = { field: "departureAt", code: "ambiguous", message: "Around 11:00; exact time unspecified.", messageMk: "Околу 11:00; точното време не е наведено." };
const draft = () => ({ ...emptyOfferDraft(), warnings: [warning] });
const trip = () => ({ draft: draft(), mentioned: [], dateLocal: null, timeLocal: null, weekday: null, dateEvidence: null, timeEvidence: null, carText: null });
beforeEach(() => { parse.mockReset(); vi.stubEnv("OPENAI_API_KEY", "test-key"); });
afterEach(() => vi.unstubAllEnvs());

it.each(["offer", "import"])("gets both languages in the original %s call and switches without another request", async kind => {
  parse.mockResolvedValue({ output_parsed: kind === "offer" ? { recurring: false, trips: [trip(), trip()] }
    : { classification: "offer", sourceLanguage: "mk", draft: { ...draft(), source: "imported" } } });
  const warnings = kind === "offer"
    ? (await parseOfferDescription({ text: "Skopje Veles tomorrow around 11:00", mode: "create" }, { cities: [], pickupPoints: [], cars: [], carModels: [] })).trips.flatMap(trip => trip.draft.warnings)
    : (await parseRidePost("Skopje Veles tomorrow around 11:00", { cities: [], pickupPoints: [] })).draft.warnings;
  for (const item of warnings.filter(item => item.translationMk)) {
    const saved = rideDraftWarningSchema.parse(JSON.parse(JSON.stringify(item)));
    expect(translateDraftWarning(saved, "mk", createTranslator(mk))).toBe(warning.messageMk);
    expect(translateDraftWarning(saved, "en", createTranslator(en))).toBe(warning.message);
    expect(saved).not.toHaveProperty("messageMk");
  }
  expect(warnings[0].translationMk).toEqual({ source: warning.message, text: warning.messageMk });
  expect(parse).toHaveBeenCalledTimes(1);
  const request = parse.mock.calls[0][0];
  expect(kind === "offer" ? request.instructions : request.input[0].content).toContain("messageMk in Macedonian Cyrillic");
  expect(JSON.stringify(request.text.format)).toContain('"messageMk"');
});

it.each([undefined, ""])("rejects incomplete bilingual provider warnings (%s)", async messageMk => {
  const raw = trip(); raw.draft.warnings = [{ ...warning, messageMk: messageMk as string }];
  parse.mockResolvedValue({ output_parsed: { recurring: false, trips: [raw] } });
  await expect(parseOfferDescription({ text: "Skopje Veles", mode: "create" }, { cities: [], pickupPoints: [], cars: [], carModels: [] })).rejects.toThrow();
  parse.mockResolvedValue({ output_parsed: { classification: "offer", sourceLanguage: "mk", draft: { ...raw.draft, source: "imported" } } });
  await expect(parseRidePost("Skopje Veles", { cities: [], pickupPoints: [] })).rejects.toMatchObject({ code: "invalid_output" });
});
