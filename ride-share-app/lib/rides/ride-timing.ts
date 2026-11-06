export function resolveDurationMinutes(estimate: number | null, requested: number | null) {
  if (estimate === null) {
    if (requested !== null) throw new RangeError("Wait for a route estimate before adjusting duration.");
    return null;
  }
  const duration = requested ?? estimate;
  if (!Number.isInteger(estimate) || estimate <= 0 || !Number.isInteger(duration) || duration < estimate || duration > 1440) {
    throw new RangeError("Duration must be at least the route estimate and no more than 24 hours.");
  }
  return duration;
}

export function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60), remainder = minutes % 60;
  return [hours ? `${hours} h` : "", remainder ? `${remainder} min` : ""].filter(Boolean).join(" ");
}

export function rideTiming(departureAt: string, durationMinutes: number | null | undefined) {
  const start = new Date(departureAt);
  const valid = Number.isInteger(durationMinutes) && durationMinutes! > 0 && durationMinutes! <= 1440;
  const end = valid ? new Date(start.getTime() + durationMinutes! * 60_000) : null;
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Skopje", hour: "2-digit", minute: "2-digit" });
  const calendar = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Skopje", year: "numeric", month: "2-digit", day: "2-digit" });
  const date = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Skopje", day: "numeric", month: "short", weekday: "short" });
  return {
    date: date.format(start), departure: time.format(start), arrival: end ? time.format(end) : null,
    arrivalAt: end?.toISOString() ?? null,
    dayLabel: end && calendar.format(end) !== calendar.format(start) ? date.format(end) : null,
    duration: valid ? formatDuration(durationMinutes!) : null,
  };
}
