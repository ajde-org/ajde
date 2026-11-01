import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { translateRideNotesText } from "@/lib/ai/translate-ride-notes";

it.each(["en", "mk"] as const)("translates synthetic driver conditions faithfully into %s", async locale => {
  const source = locale === "mk" ? "Small luggage is welcome. Please be on time at 18:30. No smoking." : "Мал багаж е добредојден. Ве молам бидете навреме во 18:30. Пушењето не е дозволено.";
  const translation = await translateRideNotesText(source, locale);
  expect(translation).toContain("18:30");
  expect(translation).toMatch(locale === "mk" ? /багаж/i : /luggage|baggage/i);
  expect(translation).toMatch(locale === "mk" ? /не|забрането|без/i : /no smoking|not allowed|prohibited/i);
  console.log(JSON.stringify({ locale, source, translation }));
});
