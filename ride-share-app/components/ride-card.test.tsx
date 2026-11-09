import { createElement } from "react";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { RideCard } from "./ride-card";
import { RideRoute } from "./ride-route";
import { I18nProvider } from "@/lib/i18n/provider";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
import type { RideView } from "@/lib/rides/ride-view";

const ride: RideView = {
  id: "example", car_id: null, claimed_by: null, created_at: "2026-11-05T00:00:00Z",
  departure_at: "2026-11-05T22:30:00Z", duration_minutes: 170,
  estimated_duration_minutes: 150, duration_estimated_at: "2026-11-05T00:00:00Z",
  origin_city_id: 1, dest_city_id: 2, origin_pickup_id: null, dest_pickup_id: null,
  details: {}, driver_id: "driver", gender_preference: "any", import_id: null, notes: null,
  price_per_seat_mkd: 500, seats_available: 2, seats_total: 4, source: "native",
  status: "published", tags: ["luggage_space", "no_smoking"], updated_at: "2026-11-05T00:00:00Z",
  originCity: { id: 1, name_en: "Skopje", name_mk: "Скопје" },
  destinationCity: { id: 2, name_en: "Ohrid", name_mk: "Охрид" },
  originPickup: null, destinationPickup: null,
  driver: { id: "driver", full_name: "Ana Petrova", photo_url: "/avatar.png", university: "UKIM", verified_at: null },
  car: null,
};

const render = (overrides: Partial<RideView> = {}, locale: "en" | "mk" = "en") => {
  const html = renderToStaticMarkup(<I18nProvider locale={locale} messages={locale === "mk" ? mk : en}>{createElement(RideCard, {
    ride: { ...ride, ...overrides }, explanation: "Matches your route",
  })}</I18nProvider>);
  if (process.env.I18N_FIXTURE_DIR && !Object.keys(overrides).length) {
    mkdirSync(process.env.I18N_FIXTURE_DIR, { recursive: true });
    writeFileSync(path.join(process.env.I18N_FIXTURE_DIR, `ride-card-${locale}.html`), `<!doctype html><html lang="${locale}"><head><meta charset="utf-8"></head><body><main class="mx-auto max-w-xl p-4">${html}</main></body></html>`);
  }
  return html;
};

it("keeps detail-page arrival times without the journey disclaimer", () => {
  const html = renderToStaticMarkup(<I18nProvider locale="en" messages={en}>{createElement(RideRoute, {
    origin: "Skopje", destination: "Ohrid", departureAt: ride.departure_at, durationMinutes: 128,
  })}</I18nProvider>);
  expect(html).toContain("Estimated arrival");
  expect(html).toContain("01:38");
  expect(html).not.toContain("City-to-city estimate");
  expect(html).not.toContain("About 2 h 8 min");
});

describe("RideCard integration", () => {
  it("localizes the redesigned card, next-day arrival, features and reservation link", () => {
    const html = render({}, "mk");
    for (const text of ["Скопје", "Охрид", "23:30", "02:20", "пет., 6 ноем.", mk["tag.no_smoking"], mk["timing.pickRide"], "500 ден."]) {
      expect(html).toContain(text);
    }
    expect(html).toContain('dateTime="2026-11-06T01:20:00.000Z"');
    expect(html).toContain('aria-label="Избери превоз од Скопје до Охрид"');
  });
  it("shows the departure date in Skopje time even without an arrival estimate", () => {
    const html = render({ departure_at: "2026-11-05T23:30:00Z", duration_minutes: null });
    expect(html).toContain('dateTime="2026-11-05T23:30:00Z" class="block text-[1.375rem] font-bold leading-7 text-brand-800">Fri 6 Nov</time>');
    expect(html).toContain("00:30");
    expect(html).toContain("Unavailable");
  });

  it("combines the new card details with adjusted next-day arrival times", () => {
    const html = render();
    for (const text of ["Thu 5 Nov", "23:30", "02:20", "Fri 6 Nov", "Luggage space", "No smoking", "500 MKD", "Pick ride", "Matches your route"]) {
      expect(html).toContain(text);
    }
    expect(html).toContain('dateTime="2026-11-06T01:20:00.000Z"');
    expect(html).toContain('href="/profile/driver"');
    expect(html).toContain('href="/rides/example"');
    expect(html.match(/500 MKD/g)).toHaveLength(1);
    expect(html.indexOf("2 seats left")).toBeGreaterThan(html.indexOf('href="/profile/driver"'));
    expect(html.indexOf("500 MKD")).toBeGreaterThan(html.indexOf("Pick ride"));
    expect(html.match(/2 seats left/g)).toHaveLength(1);
  });

  it("keeps imported rides usable without timing, driver, price or features", () => {
    const html = render({ duration_minutes: null, driver: null, price_per_seat_mkd: null, tags: [] });
    expect(html).toContain("Unavailable");
    expect(html).toContain("Imported ride");
    expect(html).toContain("Free");
    expect(html.indexOf("Free")).toBeGreaterThan(html.indexOf("Pick ride"));
    expect(html).toContain("Pick ride");
    expect(html).not.toContain("Ride features");
    expect(html).toContain("No special requests");
    expect(html).not.toContain('href="/profile/');
    expect(html).not.toContain("Invalid Date");
  });
});
