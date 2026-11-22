// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { DriverNotes } from "./driver-notes";
import { I18nProvider } from "@/lib/i18n/provider";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";

afterEach(cleanup);
it.each(["en", "mk"] as const)("shows original driver notes without translation controls in %s", locale => {
  const notes = "Small luggage is welcome. Please be on time.";
  const messages = locale === "mk" ? mk : en;
  render(<I18nProvider locale={locale} messages={messages}><DriverNotes notes={notes} /></I18nProvider>);
  expect(screen.getByRole("heading", { name: messages["detail.notes"] })).toBeTruthy();
  expect(screen.getByText(notes)).toBeTruthy();
  expect(screen.queryByRole("button")).toBeNull();
});
