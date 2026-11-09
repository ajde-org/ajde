// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n/provider";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
import { TripShareControls } from "./trip-share-controls";
const actions = vi.hoisted(() => ({ createTripShare: vi.fn(), revokeTripShare: vi.fn() }));
vi.mock("@/lib/sharing/actions", () => actions);
afterEach(() => { cleanup(); vi.clearAllMocks(); });
it("retranslates an existing failure without exposing provider details", async () => {
  actions.createTripShare.mockResolvedValue({ ok: false, error: "private database details" });
  const controls = <TripShareControls bookingId="booking" expiresAt="2027-01-01T12:00:00Z" expired={false} />;
  const view = render(<I18nProvider locale="en" messages={en}>{controls}</I18nProvider>);
  fireEvent.click(screen.getByRole("button", { name: en["share.create"] }));
  expect((await screen.findByRole("alert")).textContent).toBe(en["share.createFailed"]);
  view.rerender(<I18nProvider locale="mk" messages={mk}>{controls}</I18nProvider>);
  expect(screen.getByRole("alert").textContent).toBe(mk["share.createFailed"]);
  expect(screen.queryByText("private database details")).toBeNull();
  expect(actions.createTripShare).toHaveBeenCalledTimes(1);
});
it.each(["en", "mk"] as const)("shows localized creation and revocation results in %s", async locale => {
  const messages = locale === "mk" ? mk : en;
  actions.createTripShare.mockResolvedValue({ ok: true, share: { id: "share", token: "synthetic", expiresAt: "2027-01-01T12:00:00Z" } });
  actions.revokeTripShare.mockResolvedValue({ ok: true });
  render(<I18nProvider locale={locale} messages={messages}><TripShareControls bookingId="booking" expiresAt="2027-01-01T12:00:00Z" expired={false} /></I18nProvider>);
  fireEvent.click(screen.getByRole("button", { name: messages["share.create"] }));
  await screen.findByText(messages["share.ready"]);
  expect(screen.getByLabelText(messages["share.link"])).toHaveProperty("value", `${window.location.origin}/trip/synthetic`);
  fireEvent.click(await screen.findByRole("button", { name: messages["share.revoke"] }));
  await screen.findByText(messages["share.revoked"]);
  expect(screen.queryByLabelText(messages["share.link"])).toBeNull();
});
