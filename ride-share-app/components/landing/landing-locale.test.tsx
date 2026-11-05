// @vitest-environment jsdom
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@/lib/i18n/testing";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
import { LanguageSelector } from "@/components/language-selector";
import { SiteFooter } from "@/components/site-footer";
import { AboutSections, ScrollHint } from "./about-sections";
import { LandingHeroCopy } from "./landing-hero-copy";
import { LandingMap } from "./landing-map";
import { LandingSavings } from "./landing-savings";

const { changeLocale } = vi.hoisted(() => ({ changeLocale: vi.fn() }));
vi.mock("@/lib/i18n/actions", () => ({ changeLocale }));
vi.mock("next/image", () => ({ default: ({ src, alt }: { src: string | { src: string }; alt: string }) =>
  // eslint-disable-next-line @next/next/no-img-element
  <img src={typeof src === "string" ? src : src.src} alt={alt} /> }));

afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.resetAllMocks(); });

it("updates all landing copy immediately while preserving impact values", async () => {
  let finish!: (result: { ok: boolean }) => void;
  changeLocale.mockImplementation(() => new Promise((resolve) => { finish = resolve; }));
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
  const summary = { savedCo2Kg: 21.4, savedFuelLitres: 9.2, uniqueParticipants: 3, completedSharedTrips: 2, excludedEstimateTrips: 0 };
  const { container } = render(<>
    <LanguageSelector />
    <LandingHeroCopy />
    <LandingMap />
    <LandingSavings summary={summary} />
    <ScrollHint />
    <AboutSections />
    <SiteFooter year={2026} />
  </>);
  expect(container.textContent).toContain(en["landing.intro"]);
  expect(container.textContent).toContain(en["about.visionHeading"]);
  fireEvent.click(screen.getByRole("button", { name: "Switch language" }));
  fireEvent.click(screen.getByRole("button", { name: "Македонски" }));
  await waitFor(() => expect(container.textContent).toContain(mk["landing.intro"]));
  expect(container.textContent).toContain(mk["landing.pickedUp"]);
  expect(container.textContent).toContain(mk["landing.co2"]);
  expect(container.textContent).toContain(mk["about.visionHeading"]);
  expect(screen.getByRole("navigation", { name: mk["nav.footer"] })).toBeDefined();
  expect(container.textContent).toContain("21,4 kg");
  finish({ ok: false });
  await waitFor(() => expect(container.textContent).toContain(en["landing.intro"]));
});
