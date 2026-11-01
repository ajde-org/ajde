import { renderToString } from "react-dom/server";
import { expect, it } from "vitest";
import { I18nProvider } from "@/lib/i18n/provider";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
import { RideFeedSkeleton } from "./page-skeletons";

it.each(["en", "mk"] as const)("renders the ride loading screen in %s before hydration", locale => {
  const messages = locale === "mk" ? mk : en;
  const html = renderToString(<I18nProvider locale={locale} messages={messages}><RideFeedSkeleton /></I18nProvider>);
  expect(html).toContain(messages["discovery.title"]);
  expect(html).toContain(messages["discovery.intro"]);
  expect(html).toContain(messages["loading.rides"]);
  if (locale === "mk") expect(html).not.toContain(en["discovery.title"]);
});
