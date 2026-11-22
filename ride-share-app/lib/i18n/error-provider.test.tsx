// @vitest-environment jsdom
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import PageError from "@/app/error";
import ProfileError from "@/app/profile/[id]/error";
import ChatError from "@/app/rides/[id]/chat/error";
import { I18nProvider } from "./provider";
import { mk } from "./messages/mk";
import { errorsEn } from "./messages/errors-en";
import { errorsMk } from "./messages/errors-mk";

afterEach(() => { cleanup(); document.documentElement.lang = "en"; });
it.each(["en", "mk"] as const)("keeps every error boundary usable without a provider in %s", locale => {
  document.documentElement.lang = locale;
  const reset = vi.fn();
  const messages = locale === "mk" ? errorsMk : errorsEn;
  for (const Boundary of [PageError, ProfileError, ChatError]) {
    render(<Boundary error={new Error("Private diagnostics")} reset={reset} />);
    fireEvent.click(screen.getByRole("button", { name: messages["common.retry"] }));
    expect(screen.queryByText("Private diagnostics")).toBeNull();
    cleanup();
  }
  expect(reset).toHaveBeenCalledTimes(3);
});
it("prefers the request provider over a stale document language", () => {
  document.documentElement.lang = "en";
  render(<I18nProvider locale="mk" messages={mk}><PageError error={new Error()} reset={() => {}} /></I18nProvider>);
  expect(screen.getByRole("heading", { name: mk["common.loadFailed"] })).toBeTruthy();
});
