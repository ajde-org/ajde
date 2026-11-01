const legacy = {
  "Check your message and try again.": "booking.invalid",
  "This ride is no longer available.": "booking.unavailable",
  "This imported ride needs a driver before it can accept bookings.": "booking.noDriver",
  "You cannot request a seat on your own ride.": "booking.ownRide",
  "This ride has already departed.": "booking.departed",
  "This ride is not accepting seat requests.": "booking.closed",
  "There are not enough seats available.": "booking.noSeats",
  "This driver accepts requests only from students of the same gender.": "booking.sameGender",
  "You already have an active request for this ride.": "booking.duplicate",
  "Your request could not be sent. Please try again.": "booking.failed",
  "Seat request sent to the driver.": "booking.sent"
} as const;
export type BookingNoticeKey = typeof legacy[keyof typeof legacy];
const keys: ReadonlySet<string> = new Set(Object.values(legacy));
export function bookingNoticeKey(value: string): BookingNoticeKey {
  if (keys.has(value)) return value as BookingNoticeKey;
  return Object.hasOwn(legacy, value) ? legacy[value as keyof typeof legacy] : "booking.failed";
}
