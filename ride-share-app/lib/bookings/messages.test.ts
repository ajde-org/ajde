import { expect, it } from "vitest";
import { bookingNoticeKey } from "./messages";

it("accepts stable notice codes and translates existing shared-link messages", () => {
  expect(bookingNoticeKey("booking.sent")).toBe("booking.sent");
  expect(bookingNoticeKey("Seat request sent to the driver.")).toBe("booking.sent");
  expect(bookingNoticeKey("This ride has already departed.")).toBe("booking.departed");
});

it("replaces arbitrary query-string notices with a safe localized fallback", () => {
  expect(bookingNoticeKey("arbitrary text")).toBe("booking.failed");
  expect(bookingNoticeKey("__proto__")).toBe("booking.failed");
});
