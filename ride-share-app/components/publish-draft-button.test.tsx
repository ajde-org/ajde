// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@/lib/i18n/testing";
import { afterEach, expect, it, vi } from "vitest";
import { PublishDraftButton } from "./publish-draft-button";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
import { renderToStaticMarkup } from "react-dom/server";
import { I18nProvider } from "@/lib/i18n/provider";
import { mkdirSync, writeFileSync } from "node:fs";
const publish = vi.hoisted(() => vi.fn());
vi.mock("@/lib/rides/publish-draft", () => ({ publishDraft: publish }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });
it.each(["en", "mk"] as const)("publishes on click with localized feedback in %s", async locale => {
  const messages = locale === "mk" ? mk : en;
  publish.mockResolvedValue({ success: true, message: "form.published" });
  render(<PublishDraftButton rideId="saved-ride" />, { locale });
  expect(publish).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: messages["form.publish"] }));
  await screen.findByText(messages["form.published"]);
  expect(publish).toHaveBeenCalledWith("saved-ride");
  expect(screen.getByRole("button")).toHaveProperty("disabled", true);
  if (process.env.I18N_FIXTURE_DIR) {
    mkdirSync(process.env.I18N_FIXTURE_DIR, { recursive: true });
    writeFileSync(`${process.env.I18N_FIXTURE_DIR}/publish-${locale}.html`, renderToStaticMarkup(
      <I18nProvider locale={locale} messages={messages}><main className="mx-auto max-w-2xl p-6"><section className="journey-card"><h2>{messages["status.draft"]}</h2><PublishDraftButton rideId="saved-ride" /></section></main></I18nProvider>));
  }
});
it("shows failure and allows retry", async () => {
  publish.mockRejectedValue(new Error("Unavailable"));
  render(<PublishDraftButton rideId="saved-ride" />, { locale: "mk" });
  fireEvent.click(screen.getByRole("button"));
  expect((await screen.findByRole("alert")).textContent).toBe(mk["draftPublish.failed"]);
  expect(screen.getByRole("button")).toHaveProperty("disabled", false);
});
