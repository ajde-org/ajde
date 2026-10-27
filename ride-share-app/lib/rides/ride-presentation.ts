import { intlLocale, type Locale } from "@/lib/i18n/config";

export function formatDeparture(value: string, locale: Locale = "en") {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Skopje",
  }).format(new Date(value));
}
