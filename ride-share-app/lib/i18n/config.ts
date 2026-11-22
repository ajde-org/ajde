export const locales = ["en", "mk"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";
export const localeCookie = "ajde_locale";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "mk";
}

export function resolveLocale(value: unknown): Locale {
  return isLocale(value) ? value : defaultLocale;
}

export function intlLocale(locale: Locale) {
  return locale === "mk" ? "mk-MK" : "en-GB";
}
