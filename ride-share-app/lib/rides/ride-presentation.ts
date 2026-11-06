import type { Locale } from "@/lib/i18n/config";
import { formatDateTime } from "@/lib/i18n/format";

export function formatDeparture(value: string, locale: Locale = "en") {
  return formatDateTime(locale, value);
}
