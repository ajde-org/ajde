import type { ReactElement } from "react";
import { render as testingRender, type RenderOptions } from "@testing-library/react";
import { I18nProvider } from "./provider";
import { en } from "./messages/en";
import { mk } from "./messages/mk";
import type { Locale } from "./config";

export * from "@testing-library/react";

export function render(ui: ReactElement, options?: RenderOptions & { locale?: Locale }) {
  const { locale = "en", ...renderOptions } = options ?? {};
  return testingRender(ui, {
    wrapper: ({ children }) => <I18nProvider locale={locale} messages={locale === "mk" ? mk : en}>{children}</I18nProvider>,
    ...renderOptions,
  });
}
