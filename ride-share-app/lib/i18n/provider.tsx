"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Locale } from "./config";
import type { Messages } from "./messages/en";
import { createTranslator, createNoticeTranslator, type Translator } from "./translate";

const I18nContext = createContext<{ locale: Locale; t: Translator; notice: ReturnType<typeof createNoticeTranslator> } | null>(null);

export function I18nProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const value = useMemo(() => ({ locale, t: createTranslator(messages), notice: createNoticeTranslator(messages) }), [locale, messages]);
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
