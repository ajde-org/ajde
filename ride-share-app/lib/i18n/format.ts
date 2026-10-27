import { intlLocale, type Locale } from "./config";

export function formatNumber(locale: Locale, value: number, options?: Intl.NumberFormatOptions) {
  return new Intl.NumberFormat(intlLocale(locale), options).format(value);
}

export function formatMoney(locale: Locale, value: number) {
  return formatNumber(locale, value, { style: "currency", currency: "MKD", maximumFractionDigits: 0 });
}

export function formatDateTime(locale: Locale, value: string | Date, options?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    ...(options ?? { dateStyle: "medium", timeStyle: "short" }), timeZone: "Europe/Skopje",
  }).format(new Date(value));
}

export function plural(locale: Locale, count: number): "one" | "other" {
  return new Intl.PluralRules(intlLocale(locale)).select(count) === "one" ? "one" : "other";
}
