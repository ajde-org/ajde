import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { localeCookie, resolveLocale, type Locale } from "./config";
import { createTranslator } from "./translate";

export const getLocale = cache(async () => resolveLocale((await cookies()).get(localeCookie)?.value));

export async function getMessages(locale: Locale) {
  return locale === "mk" ? (await import("./messages/mk")).mk : (await import("./messages/en")).en;
}

export const getI18n = cache(async () => {
  const locale = await getLocale();
  const messages = await getMessages(locale);
  return { locale, messages, t: createTranslator(messages) };
});
