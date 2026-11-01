// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@/lib/i18n/testing";
import { LanguageSelector } from "./language-selector";

const { changeLocale } = vi.hoisted(() => ({ changeLocale: vi.fn() }));
vi.mock("@/lib/i18n/actions", () => ({ changeLocale }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.resetAllMocks(); });

it("labels the control in Macedonian and sends the selected language", async () => {
  changeLocale.mockResolvedValue({ ok: true });
  render(<LanguageSelector />, { locale: "mk" });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const selector = screen.getByRole("button", { name: "Промени јазик" });
  fireEvent.click(selector);
  await waitFor(() => expect(changeLocale).toHaveBeenCalledWith("en"));
});

it("keeps the old locale and announces a failed save", async () => {
  changeLocale.mockRejectedValue(new Error("offline"));
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<LanguageSelector />);
  fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
  await screen.findByText("Could not change language. Please try again.");
  expect(screen.getByRole("button", { name: "Switch language" })).toBeDefined();
});

it("disables the flag while saving and restores scroll after the update", async () => {
  let finish!: (result: { ok: boolean }) => void;
  changeLocale.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(window, "scrollY", "get").mockReturnValue(1600);
  render(<LanguageSelector />);
  const button = screen.getByRole("button", { name: "Switch language" }) as HTMLButtonElement;
  fireEvent.click(button);
  await waitFor(() => expect(button.disabled).toBe(true));
  expect(scrollTo).not.toHaveBeenCalled();
  finish({ ok: true });
  await waitFor(() => expect(button.disabled).toBe(false));
  expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 1600, behavior: "instant" });
});
