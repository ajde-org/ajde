// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@/lib/i18n/testing";
import { LanguageSelector } from "./language-selector";

const { changeLocale } = vi.hoisted(() => ({ changeLocale: vi.fn() }));
vi.mock("@/lib/i18n/actions", () => ({ changeLocale }));
afterEach(() => { cleanup(); vi.resetAllMocks(); });

it("labels the control in Macedonian and sends the selected language", async () => {
  changeLocale.mockResolvedValue({ ok: true });
  render(<LanguageSelector />, { locale: "mk" });
  const selector = screen.getByRole("combobox", { name: "Јазик" });
  expect((selector as HTMLSelectElement).value).toBe("mk");
  fireEvent.change(selector, { target: { value: "en" } });
  await waitFor(() => expect(changeLocale).toHaveBeenCalledWith("en"));
});

it("keeps the old locale and announces a failed save", async () => {
  changeLocale.mockRejectedValue(new Error("offline"));
  render(<LanguageSelector />);
  fireEvent.change(screen.getByRole("combobox"), { target: { value: "mk" } });
  await screen.findByText("Could not change language. Please try again.");
  expect((screen.getByRole("combobox") as HTMLSelectElement).value).toBe("en");
});
