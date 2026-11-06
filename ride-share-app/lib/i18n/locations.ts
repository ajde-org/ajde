import type { Locale } from "./config";

export function localizedName(value: { name_en: string; name_mk: string }, locale: Locale) {
  return locale === "mk" ? value.name_mk : value.name_en;
}
