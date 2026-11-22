// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@/lib/i18n/testing";
import { I18nProvider } from "@/lib/i18n/provider";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
import { OnboardingForm } from "./onboarding-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }) }));
vi.mock("./actions", () => ({ saveProfile: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
afterEach(cleanup);
const initial = { full_name: "Test Student", university: "UKIM", photo_url: "https://example.com/photo.png", bio: "", gender: null, phone: "+38970123456", social_url: null };

it("translates an existing contact error while preserving unsaved fields", () => {
  const view = render(<I18nProvider locale="en" messages={en}><OnboardingForm userId="fixture" initial={initial} /></I18nProvider>);
  fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: "Unsaved name" } });
  fireEvent.change(screen.getByLabelText(/Phone number/), { target: { value: "bad" } });
  fireEvent.submit(screen.getByRole("button", { name: "Complete profile & find a ride" }).closest("form")!);
  expect(screen.getByRole("alert").textContent).toBe(en["contact.invalidPhone"]);
  view.rerender(<I18nProvider locale="mk" messages={mk}><OnboardingForm userId="fixture" initial={initial} /></I18nProvider>);
  expect(screen.getByRole("alert").textContent).toBe(mk["contact.invalidPhone"]);
  expect((screen.getByLabelText(/Име и презиме/) as HTMLInputElement).value).toBe("Unsaved name");
  expect((screen.getByLabelText(/Телефонски број/) as HTMLInputElement).value).toBe("bad");
});

it("rejects an unsupported photo with a localized error before uploading", () => {
  render(<OnboardingForm userId="fixture" initial={null} />, { locale: "mk" });
  fireEvent.change(screen.getByLabelText(/Профилна фотографија/), { target: { files: [new File(["text"], "bad.txt", { type: "text/plain" })] } });
  expect(screen.getByRole("alert").textContent).toBe(mk["onboarding.photoType"]);
});
