import { expect, it } from "vitest";
import { formatDuration, resolveDurationMinutes, rideTiming } from "./ride-timing";

it("lets a driver extend a 2 h 30 min estimate but never shorten it", () => {
  expect(resolveDurationMinutes(150, null)).toBe(150);
  expect(resolveDurationMinutes(150, 170)).toBe(170);
  expect(resolveDurationMinutes(150, 180)).toBe(180);
  expect(() => resolveDurationMinutes(150, 149)).toThrow();
});


it("shows next-day arrival using elapsed time and Skopje calendar dates", () => {
  expect(rideTiming("2026-11-05T22:30:00Z", 170)).toMatchObject({ departure: "23:30", arrival: "02:20", dayLabel: "Fri 6 Nov", duration: "2 h 50 min" });
  expect(rideTiming("2026-03-29T00:30:00Z", 120)).toMatchObject({ departure: "01:30", arrival: "04:30", duration: "2 h" });
  expect(rideTiming("2026-11-05T22:30:00Z", null).arrival).toBeNull();
});

it("localizes timing while keeping next-day and DST calculations unchanged", () => {
  expect(rideTiming("2026-11-05T22:30:00Z", 170, "mk")).toMatchObject({
    departure: "23:30", arrival: "02:20", dayLabel: "пет., 6 ноем.", duration: "2 ч 50 мин",
    arrivalAt: "2026-11-06T01:20:00.000Z",
  });
  expect(rideTiming("2026-03-29T00:30:00Z", 120, "mk").arrival).toBe("04:30");
  expect(formatDuration(150, "mk")).toBe("2 ч 30 мин");
});
