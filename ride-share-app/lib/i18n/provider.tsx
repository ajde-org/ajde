"use client";

import { createContext, useContext, useMemo, useOptimistic, type ReactNode } from "react";
import type { Locale } from "./config";
import { en } from "./messages/en";
import { mk } from "./messages/mk";
import type { Messages } from "./messages/en";
import { createTranslator, createNoticeTranslator, type Translator } from "./translate";

const I18nContext = createContext<{ locale: Locale; t: Translator; notice: ReturnType<typeof createNoticeTranslator>; previewLocale: (locale: Locale) => void } | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const [visibleLocale, previewLocale] = useOptimistic(locale, (_current, next: Locale) => next);
  const visibleMessages = visibleLocale === locale ? messages : visibleLocale === "mk" ? mk : en;
  const value = useMemo(() => ({ locale: visibleLocale, t: createTranslator(visibleMessages), notice: createNoticeTranslator(visibleMessages), previewLocale }), [visibleLocale, visibleMessages, previewLocale]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useOptionalI18n() {
  return useContext(I18nContext);
}

export function useI18n() {
  const context = useOptionalI18n();
  if (!context) throw new Error("I18nProvider is required");
  return context;
}
