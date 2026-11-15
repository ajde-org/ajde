import { expect, it } from "vitest";
import { formatDeparture } from "./ride-presentation";

it("uses compact Macedonian departure dates in Skopje time", () => {
  expect(formatDeparture("2026-11-30T07:00:00Z", "mk")).toBe("30.11.2026, 08:00");
  expect(formatDeparture("2026-11-30T23:00:00Z", "mk")).toBe("01.12.2026, 00:00");
  expect(formatDeparture("2026-07-01T06:00:00Z", "mk")).toBe("01.07.2026, 08:00");
});
