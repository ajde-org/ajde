import { expect, it } from "vitest";
import { z } from "zod";
import { issueMessageKeys } from "./ride-form";
import { createNoticeTranslator } from "@/lib/i18n/translate";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";

it.each([
  ["origin.cityId", "validation.city"], ["destination.pickupPointId", "validation.city"],
  ["departureAt", "validation.departure"], ["car.seatsTotal", "validation.seats"],
  ["pricePerSeatMkd", "validation.price"], ["distanceKm", "validation.distance"],
  ["consumptionL100Km", "validation.consumption"], ["plateLast3", "validation.plate"],
  ["notes", "validation.notes"], ["carModelId", "validation.car"], ["submissionId", "validation.generic"],
])("maps %s validation to a complete notice in both languages", (path, key) => {
  const issue: z.core.$ZodIssue = { code: "custom", path: path.split("."), message: "Raw validation details" };
  const errors = issueMessageKeys([issue]);
  expect(errors[path]).toEqual([key]);
  for (const messages of [en, mk]) {
    const rendered = createNoticeTranslator(messages)(errors[path][0], "validation.generic");
    expect(rendered).not.toContain("Raw validation");
    expect(rendered).not.toMatch(/\{\w+\}/);
    expect(Object.values(messages)).toContain(rendered);
  }
});
