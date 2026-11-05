// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@/lib/i18n/testing";
import { LanguageSelector } from "./language-selector";
import { LocalizedPageHeading } from "./localized-page-heading";
import { RideFilters } from "./discovery/ride-filters";
import { parseRideFilters } from "@/lib/rides/ride-filters";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";

const { changeLocale } = vi.hoisted(() => ({ changeLocale: vi.fn() }));
vi.mock("@/lib/i18n/actions", () => ({ changeLocale }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.resetAllMocks(); });

it("labels the control in Macedonian and sends the selected language", async () => {
  changeLocale.mockResolvedValue({ ok: true });
  render(<LanguageSelector />, { locale: "mk" });
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const selector = screen.getByRole("button", { name: "Промени јазик" });
  fireEvent.click(selector);
  expect(selector.getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement).toBe(screen.getByRole("button", { name: "English" }));
  expect(screen.getByRole("button", { name: "English" }).parentElement?.parentElement?.parentElement).toBe(document.body);
  expect(screen.getByRole("button", { name: "Македонски" }).getAttribute("aria-current")).toBe("true");
  fireEvent.click(screen.getByRole("button", { name: "English" }));
  await waitFor(() => expect(changeLocale).toHaveBeenCalledWith("en"));
});

it("keeps the old locale and announces a failed save", async () => {
  changeLocale.mockRejectedValue(new Error("offline"));
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  render(<LanguageSelector />);
  fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
  fireEvent.click(screen.getByRole("button", { name: "Македонски" }));
  await screen.findByText("Could not change language. Please try again.");
  expect(screen.getByRole("button", { name: "Switch language" })).toBeDefined();
});

it("disables the selector while saving and restores scroll after the update", async () => {
  let finish!: (result: { ok: boolean }) => void;
  changeLocale.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  vi.spyOn(window, "scrollY", "get").mockReturnValue(1600);
  render(<LanguageSelector />);
  const button = screen.getByRole("button", { name: "Switch language" }) as HTMLButtonElement;
  fireEvent.click(button);
  fireEvent.click(screen.getByRole("button", { name: "Македонски" }));
  await waitFor(() => expect(button.disabled).toBe(true));
  expect(scrollTo).not.toHaveBeenCalled();
  finish({ ok: true });
  await waitFor(() => expect(button.disabled).toBe(false));
  expect(scrollTo).toHaveBeenCalledWith({ left: 0, top: 1600, behavior: "instant" });
});

it("shows the selected language immediately and rolls back when saving fails", async () => {
  let finish!: (result: { ok: boolean }) => void;
  changeLocale.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const { container } = render(<><LanguageSelector /><LocalizedPageHeading title="discovery.title" intro="discovery.intro" />
    <RideFilters cities={[]} filters={parseRideFilters({})} filtersOpen currentParams="" naturalQuery="" searched={false} genderUnavailable={false} /></>);
  const date = container.querySelector<HTMLInputElement>('input[name="date"]')!;
  fireEvent.change(date, { target: { value: "2026-11-10" } });
  const trigger = screen.getByRole("button", { name: "Switch language" });
  fireEvent.click(trigger);
  fireEvent.click(screen.getByRole("button", { name: "Македонски" }));
  await waitFor(() => expect(trigger.textContent).toContain("MK"));
  expect(screen.getByRole("heading", { name: "Најди превоз" })).toBeDefined();
  expect(screen.getByText(mk["discovery.filters"])).toBeDefined();
  expect(date.value).toBe("2026-11-10");
  finish({ ok: false });
  await waitFor(() => expect(trigger.textContent).toContain("EN"));
  expect(screen.getByRole("heading", { name: "Find a ride" })).toBeDefined();
  expect(screen.getByText(en["discovery.filters"])).toBeDefined();
  expect(date.value).toBe("2026-11-10");
  expect(screen.getByText("Could not change language. Please try again.")).toBeDefined();
});

it("closes on Escape and returns focus to the trigger", () => {
  render(<LanguageSelector />);
  const trigger = screen.getByRole("button", { name: "Switch language" });
  fireEvent.click(trigger);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger);
});

it("closes when clicking outside the dropdown", () => {
  render(<><LanguageSelector /><button type="button">Outside</button></>);
  const trigger = screen.getByRole("button", { name: "Switch language" });
  fireEvent.click(trigger);
  fireEvent.pointerDown(screen.getByRole("button", { name: "Outside" }));
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
});

it("highlights only the hovered language", () => {
  render(<LanguageSelector />);
  fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
  const macedonian = screen.getByRole("button", { name: "Македонски" });
  fireEvent.pointerEnter(macedonian);
  expect(macedonian.classList.contains("bg-brand-200")).toBe(true);
  expect(screen.getByRole("button", { name: "English" }).classList.contains("bg-brand-200")).toBe(false);
  fireEvent.pointerLeave(macedonian);
  expect(macedonian.classList.contains("bg-brand-200")).toBe(false);
});
