import { expect, it } from "vitest";
import { formatLocalizedDate } from "./date-format";

it("formats Macedonian calendar headings and labels without locale-dependent ordering", () => {
  const date = new Date("2026-10-31T12:00:00Z");
  expect(formatLocalizedDate("mk", date, { month: "long", year: "numeric", timeZone: "UTC" })).toBe("октомври 2026");
  expect(formatLocalizedDate("mk", date, { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" })).toBe("сабота, 31 октомври");
  expect(formatLocalizedDate("mk", date, { weekday: "short", timeZone: "UTC" })).toBe("саб.");
});
it("preserves local calendar rollover, midnight and the repeated autumn hour", () => {
  const format = (value: string) => formatLocalizedDate("mk", new Date(value), { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Skopje" });
  expect(format("2026-10-30T23:00:00Z")).toBe("31.10.2026 г., во 00:00");
  expect(format("2026-10-25T00:30:00Z")).toBe("25.10.2026 г., во 02:30");
  expect(format("2026-10-25T01:30:00Z")).toBe("25.10.2026 г., во 02:30");
});
