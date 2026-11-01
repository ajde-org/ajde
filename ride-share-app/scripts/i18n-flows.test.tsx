// @vitest-environment jsdom
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { I18nProvider } from "@/lib/i18n/provider";
import { createTranslator } from "@/lib/i18n/translate";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
import type { RideView } from "@/lib/rides/ride-view";
vi.mock("@/lib/rides/translate-notes-action", () => ({ translateRideNotes: vi.fn() }));

const state = vi.hoisted(() => ({ locale: "en" as "en" | "mk", empty: false }));
vi.mock("@/lib/i18n/server", () => ({
  getI18n: async () => ({
    locale: state.locale,
    t: createTranslator(state.locale === "mk" ? mk : en),
  }),
}));
vi.mock("@/lib/auth/session", () => ({
  requireUser: async () => ({ id: "passenger" }),
  requireCompleteProfile: async () => ({ id: "passenger" }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), refresh: vi.fn() }),
  notFound: () => {
    throw new Error("not found");
  },
}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    rpc: async (_name: string, args: { profile_ids: string[] }) => ({ data: args.profile_ids.map(id => ({ id, phone: "+38970123456", social_url: null })), error: null }),
    from: (table: string) => {
      const query = {
        select: () => query,
        eq: () => query,
        in: () => query,
        order: async () => ({
          data: [ride.originCity, ride.destinationCity],
          error: null,
        }),
        maybeSingle: async () => ({
          data:
            table === "bookings"
              ? null
              : {
                  full_name: "Test Student",
                  university: "UKIM",
                  photo_url: "https://example.invalid/photo.png",
                  bio: "Original profile text",
                  gender: "woman",
                  phone: "+38970123456",
                  social_url: null,
                },
          error: null,
        }),
      };
      return query;
    },
  }),
}));
vi.mock("@/lib/rides/ride-view", () => ({
  getRide: async () => ride,
  getRideFeed: async () => (state.empty ? [] : [ride]),
  formatDeparture: (value: string, locale: "en" | "mk") =>
    new Intl.DateTimeFormat(locale === "mk" ? "mk-MK" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Europe/Skopje",
    }).format(new Date(value)),
}));
vi.mock("@/app/onboarding/actions", () => ({ saveProfile: vi.fn() }));
vi.mock("@/app/rides/[id]/actions", () => ({ requestBooking: vi.fn() }));
import OnboardingPage from "@/app/onboarding/page";
import RideFeedPage from "@/app/rides/(feed)/page";
import RideDetailPage from "@/app/rides/[id]/(detail)/page";

const ride = {
  id: "92000000-0000-4000-8000-000000000001",
  driver_id: "driver",
  departure_at: "2027-03-29T10:00:00Z",
  status: "published",
  price_per_seat_mkd: 250,
  seats_available: 3,
  seats_total: 4,
  notes: "Original driver text",
  tags: ["no_smoking", "Original custom tag"],
  gender_preference: "any",
  originCity: { id: 1, name_en: "Skopje", name_mk: "Скопје" },
  destinationCity: { id: 8, name_en: "Ohrid", name_mk: "Охрид" },
  originPickup: null,
  destinationPickup: null,
  driver: {
    id: "driver",
    full_name: "Test Driver",
    photo_url: "https://example.invalid/photo.png",
    university: "UKIM",
    verified_at: "2026-01-01",
  },
  car: null,
} as unknown as RideView;
beforeEach(() => {
  state.locale = "en";
  state.empty = false;
});

function renderPage(element: React.ReactNode, name: string) {
  const markup = renderToStaticMarkup(
    <I18nProvider
      locale={state.locale}
      messages={state.locale === "mk" ? mk : en}
    >
      {element}
    </I18nProvider>,
  );
  if (process.env.I18N_FIXTURE_DIR) {
    mkdirSync(process.env.I18N_FIXTURE_DIR, { recursive: true });
    writeFileSync(
      path.join(process.env.I18N_FIXTURE_DIR, `${name}-${state.locale}.html`),
      `<!doctype html><html lang="${state.locale}"><head><meta charset="utf-8"></head><body>${markup}</body></html>`,
    );
  }
  return markup;
}

it.each(["en", "mk"] as const)(
  "renders onboarding labels and preserves authored fields in %s",
  async (locale) => {
    state.locale = locale;
    const html = renderPage(await OnboardingPage(), "onboarding");
    const messages = locale === "mk" ? mk : en;
    expect(html).toContain(messages["onboarding.heading"]);
    expect(html).toContain(messages["onboarding.phone"]);
    expect(html).toContain("Original profile text");
  },
);

it.each(["en", "mk"] as const)(
  "renders discovery cities, prices and seat counts in %s",
  async (locale) => {
    state.locale = locale;
    const html = renderPage(
      await RideFeedPage({ searchParams: Promise.resolve({ manual: "1" }) }),
      "discovery",
    );
    expect(html).toContain(locale === "mk" ? "Скопје" : "Skopje");
    expect(html).toContain(
      locale === "mk" ? "Уште 3 слободни места" : "3 seats left",
    );
    expect(html).toContain(locale === "mk" ? "по место" : "per seat");
    expect(html).toContain("Test Driver");
  },
);

it.each(["en", "mk"] as const)(
  "renders booking notices in %s and preserves driver text",
  async (locale) => {
    state.locale = locale;
    const html = renderPage(
      await RideDetailPage({
        params: Promise.resolve({ id: ride.id }),
        searchParams: Promise.resolve({
          success: "Seat request sent to the driver.",
        }),
      }),
      "detail",
    );
    expect(html).toContain(
      locale === "mk"
        ? "Барањето за место е испратено до возачот."
        : "Seat request sent to the driver.",
    );
    expect(html).toContain("Original driver text");
    expect(html).toContain("Original custom tag");
    expect(html).toContain(locale === "mk" ? "Забрането пушење" : "No smoking");
    expect(html).toContain(
      locale === "mk" ? "Побарај место" : "Request a seat",
    );
  },
);

it("localizes the empty feed and never displays arbitrary query-string errors", async () => {
  state.locale = "mk";
  state.empty = true;
  expect(
    renderPage(
      await RideFeedPage({ searchParams: Promise.resolve({}) }),
      "discovery-empty",
    ),
  ).toContain(mk["discovery.empty"]);
  const html = renderPage(
    await RideDetailPage({
      params: Promise.resolve({ id: ride.id }),
      searchParams: Promise.resolve({ error: "arbitrary untrusted notice" }),
    }),
    "detail-error",
  );
  expect(html).not.toContain("arbitrary untrusted notice");
  expect(html).toContain(mk["booking.failed"]);
});
vi.mock("@/lib/rides/publish-draft", () => ({ publishDraft: vi.fn() }));
