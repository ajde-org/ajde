import type { Locale } from "@/lib/i18n/config";
import { formatLocalizedDate } from "@/lib/i18n/date-format";
import { timingEn } from "@/lib/i18n/messages/timing-en";
import { timingMk } from "@/lib/i18n/messages/timing-mk";
import { formatNumber } from "@/lib/i18n/format";

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

export function formatDuration(minutes: number, locale: Locale = "en") {
  const hours = Math.floor(minutes / 60), remainder = minutes % 60;
  const messages = locale === "mk" ? timingMk : timingEn;
  const unit = (key: "timing.hours" | "timing.minutes", count: number) => messages[key].replace("{count}", formatNumber(locale, count));
  return [hours ? unit("timing.hours", hours) : "", remainder ? unit("timing.minutes", remainder) : ""].filter(Boolean).join(" ");
}

export function rideTiming(departureAt: string, durationMinutes: number | null | undefined, locale: Locale = "en") {
  const start = new Date(departureAt);
  const valid = Number.isInteger(durationMinutes) && durationMinutes! > 0 && durationMinutes! <= 1440;
  const end = valid ? new Date(start.getTime() + durationMinutes! * 60_000) : null;
  const time = (date: Date) => formatLocalizedDate(locale, date, { timeZone: "Europe/Skopje", hour: "2-digit", minute: "2-digit" });
  const calendar = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Skopje", year: "numeric", month: "2-digit", day: "2-digit" });
  const date = (value: Date) => formatLocalizedDate(locale, value, { timeZone: "Europe/Skopje", day: "numeric", month: "short", weekday: "short" });
  return {
    date: date(start), departure: time(start), arrival: end ? time(end) : null,
    arrivalAt: end?.toISOString() ?? null,
    dayLabel: end && calendar.format(end) !== calendar.format(start) ? date(end) : null,
    duration: valid ? formatDuration(durationMinutes!, locale) : null,
  };
}
