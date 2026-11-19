import type { Locale } from "@/lib/i18n/config";
import { formatDateTime } from "@/lib/i18n/format";

export function formatDeparture(value: string, locale: Locale = "en") {
  if (locale === "mk") {
    const parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Skopje", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).formatToParts(new Date(value));
    const get = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)!.value;
    return `${get("day")}.${get("month")}.${get("year")}, ${get("hour")}:${get("minute")}`;
  }
  return formatDateTime(locale, value);
}
