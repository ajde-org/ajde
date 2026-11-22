import { intlLocale, type Locale } from "./config";
import { formatLocalizedDate } from "./date-format";

type NumberOptions = Pick<Intl.NumberFormatOptions, "minimumFractionDigits" | "maximumFractionDigits" | "minimumSignificantDigits" | "maximumSignificantDigits" | "minimumIntegerDigits" | "useGrouping">;

export function formatNumber(locale: Locale, value: number, options?: NumberOptions) {
  if (locale !== "mk") return new Intl.NumberFormat(intlLocale(locale), options).format(value);
  // Do not depend on browser Macedonian ICU data: it may silently fall back to English.
  return new Intl.NumberFormat("en-US", options).formatToParts(value)
    .map(part => part.type === "group" ? "." : part.type === "decimal" ? "," : part.value).join("");
}

export function formatMoney(locale: Locale, value: number) {
  if (locale === "mk") return `${formatNumber(locale, value, { maximumFractionDigits: 0 })}\u00a0ден.`;
  return new Intl.NumberFormat(intlLocale(locale), { style: "currency", currency: "MKD", maximumFractionDigits: 0 }).format(value);
}

export function formatDateTime(locale: Locale, value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return formatLocalizedDate(locale, new Date(value), {
    ...(options ?? { dateStyle: "medium", timeStyle: "short" }), timeZone: "Europe/Skopje",
  });
}

export function plural(locale: Locale, count: number): "one" | "other" {
  if (locale === "mk") {
    // Match cardinal rules after the default three-fraction-digit rounding.
    const parts = new Intl.NumberFormat("en-US", { useGrouping: false, maximumFractionDigits: 3 }).formatToParts(Math.abs(count));
    const digits = parts.find(part => part.type === "fraction")?.value ?? parts.find(part => part.type === "integer")?.value;
    return digits?.endsWith("1") && !digits.endsWith("11") ? "one" : "other";
  }
  return new Intl.PluralRules(intlLocale(locale)).select(count) === "one" ? "one" : "other";
}
