// @vitest-environment jsdom
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n/provider";
import { createTranslator, createNoticeTranslator } from "@/lib/i18n/translate";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
vi.mock("server-only", () => ({}));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: async () => ({ id: "profile" }) }));
vi.mock("@/lib/profiles/public-profile", () => ({ getPublicProfile: async () => ({ id: "profile", fullName: "Original Profile Name", photoUrl: "/fixture.png", university: "Универзитет Св. Кирил и Методиј", bio: "Original authored biography", gender: "non_binary" }) }));
vi.mock("@/lib/impact/queries", () => ({ getImpactSummary: vi.fn() }));
vi.mock("@/components/ratings/profile-rating-summary", async importOriginal => ({
  ...await importOriginal<typeof import("@/components/ratings/profile-rating-summary")>(),
  ProfileRatingSummary: () => null, // Actual summary variants are rendered separately below.
}));

const state = vi.hoisted(() => ({ locale: "en" as "en" | "mk" }));
vi.mock("@/lib/i18n/server", () => ({ getI18n: async () => {
  const messages = state.locale === "mk" ? mk : en;
  return { locale: state.locale, t: createTranslator(messages), notice: createNoticeTranslator(messages) };
} }));
vi.mock("@/app/rides/new/actions", () => ({ saveCar: vi.fn(), createRide: vi.fn() }));
vi.mock("@/lib/ratings/actions", () => ({ submitRating: vi.fn() }));
vi.mock("@/lib/ratings/queries", () => ({ getProfileRatingSummary: vi.fn(), getRatingControls: async () => new Map() }));
vi.mock("@/app/dashboard/actions", () => ({ decideBooking: vi.fn(), cancelBooking: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ createClient: async () => ({ from: (table: string) => {
  const data = table === "rides" ? [{ id, driver_id: "driver", departure_at: "2027-03-29T10:00:00Z", status: "published", seats_total: 3, seats_available: 2, origin_city_id: 1, dest_city_id: 2, price_per_seat_mkd: 300 }]
    : table === "bookings" ? [{ id: "booking", ride_id: id, passenger_id: "passenger", status: "accepted", seats: 1, message: "Original booking message", created_at: "2026-10-01T10:00:00Z" }]
    : table === "cities" ? cities : [{ id: "passenger", full_name: "Original Passenger", photo_url: "/fixture.png", university: "UKIM", phone: "+38970123456" }, { id: "driver", full_name: "Original Driver", phone: "+38970123456" }];
  const query = { select: () => query, eq: () => query, in: () => query, order: () => query,
    then: (resolve: (value: { data: unknown[]; error: null }) => unknown) => Promise.resolve({ data, error: null }).then(resolve) };
  return query;
} }) }));
vi.mock("@/lib/ride-completion/actions", () => ({ completeRide: vi.fn(), cancelRide: vi.fn() }));
vi.mock("@/lib/sharing/actions", () => ({ createTripShare: vi.fn(), revokeTripShare: vi.fn() }));
vi.mock("@/lib/chat/actions", () => ({ loadRoom: vi.fn(), sendRoomMessage: vi.fn() }));
vi.mock("@/lib/supabase/client", () => ({ createClient: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("@/lib/sharing/queries", () => ({ getSharedItinerary: async () => ({
  origin: state.locale === "mk" ? "Скопје" : "Skopje", destination: state.locale === "mk" ? "Битола" : "Bitola",
  pickup: null, dropoff: null, departureAt: "2027-03-29T10:00:00Z", driver: { name: "Original Driver", photoUrl: "/fixture.png" }, car: { make: "Toyota", model: "Yaris", color: "Blue" },
}) }));
import { RideForm } from "@/app/rides/new/ride-form";
import { emptyOfferDraft } from "@/lib/rides/offer-interpretation";
import { createOfferTab } from "@/lib/rides/offer-tabs";
import { ImportRideForm } from "@/app/rides/import/import-ride-form";
import { RideRoom } from "@/components/chat/room";
import { RatingForm } from "@/components/ratings/rating-form";
import { RatingSummaryView } from "@/components/ratings/profile-rating-summary";
import { CancelRideControl } from "@/components/ride-completion/cancel-ride-control";
import { CompleteRideButton } from "@/components/ride-completion/complete-ride-button";
import { TripShareControls } from "@/components/trip-share-controls";
import SharedTripPage from "@/app/trip/[token]/page";
import { DriverRides } from "@/app/dashboard/trips/driver-trips";
import { PassengerTrips } from "@/app/dashboard/trips/passenger-trips";
import ProfilePage from "@/app/profile/[id]/page";
import { ImpactCounter } from "@/components/impact-summary";

const cities = [{ id: 1, name_en: "Skopje", name_mk: "Скопје" }, { id: 2, name_en: "Bitola", name_mk: "Битола" }];
const id = "94000000-0000-4000-8000-000000000001";
function fixture(name: string, element: React.ReactNode) {
  const messages = state.locale === "mk" ? mk : en;
  const markup = renderToStaticMarkup(<I18nProvider locale={state.locale} messages={messages}>{element}</I18nProvider>);
  expect(markup).not.toMatch(/\{(?:count|name|date|price|origin)\}/);
  if (process.env.I18N_FIXTURE_DIR) {
    mkdirSync(process.env.I18N_FIXTURE_DIR, { recursive: true });
    writeFileSync(path.join(process.env.I18N_FIXTURE_DIR, `${name}-${state.locale}.html`), `<!doctype html><html lang="${state.locale}"><head><meta charset="utf-8"></head><body><main class="mx-auto max-w-6xl p-4">${markup}</main></body></html>`);
  }
  return markup;
}

it.each(["en", "mk"] as const)("renders remaining flow fixtures and preserves authored text in %s", async locale => {
  state.locale = locale;
  const messages = locale === "mk" ? mk : en;
  const draft = emptyOfferDraft();
  const tab = createOfferTab(draft, id);
  const form = fixture("offer-form", <RideForm cars={[]} carModels={[]} cities={cities} pickupPoints={[]} fuelPrices={{ petrol: 80, diesel: 70 }} initialDraft={draft} submissionId={id} isImportedDraft={false}
    values={tab.values} onChange={() => {}} onSubmit={() => {}} onCarSaved={() => {}} onCarSaving={() => {}} pending={false}
    state={{ status: "error", message: "form.reviewFields", fieldErrors: { departureAt: ["validation.departure"] } }} />);
  expect(form).toContain(messages["validation.departure"]);
  expect(form).toContain(locale === "mk" ? "Скопје" : "Skopje");
  const imported = fixture("import", <ImportRideForm cities={cities} pipelineEnabled />);
  expect(imported).toContain(messages["import.viber"]);
  const chat = fixture("chat", <RideRoom rideId={id} aiEnabled initial={{ viewerId: id, messages: [{ id, ride_id: id, recipient_id: null, sender_id: id, body: "Original user message", created_at: "2027-03-29T10:00:00Z", sender: { full_name: "Ana", photo_url: "/fixture.png" } }], members: [{ id, full_name: "Ana", photo_url: "/fixture.png", phone: "+38970123456", social_url: null, instagram: null, facebook: null, isDriver: true }], membership: { role: "driver", canSend: true, closesAt: "2027-03-31T10:00:00Z" }, nextCursor: null }} />);
  expect(chat).toContain(messages["chat.send"]);
  expect(chat).toContain("Original user message");
  const profile = fixture("ratings-lifecycle", <div className="mx-auto max-w-xl space-y-6">
    {await RatingSummaryView({ summary: { count: 21, average: 4.5 } })}
    <RatingForm rideId={id} rateeId={id} targetName="Original Driver" />
    <CompleteRideButton rideId={id} /><CancelRideControl rideId={id} isFull confirmedSeats={3} />
    <TripShareControls bookingId={id} expiresAt="2027-03-30T10:00:00Z" expired={false} />
  </div>);
  expect(profile).toContain("Original Driver");
  expect(profile).toContain(messages["share.title"]);
  const fullProfile = fixture("profile", await ProfilePage({ params: Promise.resolve({ id: "profile" }), searchParams: Promise.resolve({}) }));
  expect(fullProfile).toContain("Original authored biography");
  expect(fullProfile).toContain(messages["profile.gender.non_binary"]);
  const counters = await Promise.all([0, 1, 21].map(count => ImpactCounter({ title: messages["impact.yours"], description: messages["impact.passenger"], total: { savedCo2Kg: count * 12.5, eligibleTrips: count, includedTrips: count, excludedTrips: 0 } })));
  fixture("impact", <div className="grid gap-6 sm:grid-cols-2">{counters.map((counter, index) => <div key={index}>{counter}</div>)}</div>);
  const shared = fixture("shared", await SharedTripPage({ params: Promise.resolve({ token: "a".repeat(48) }) }));
  expect(shared).toContain(messages["shared.disclaimer"]);
  expect(shared).toContain("Blue");
  const driver = fixture("driver-trips", await DriverRides({ userId: "driver", filter: "active" }));
  expect(driver).toContain("Original booking message");
  expect(driver).toContain(messages["trips.openChat"]);
  const passenger = fixture("passenger-trips", await PassengerTrips({ userId: "passenger", filter: "active" }));
  expect(passenger).toContain("Original Driver");
  expect(passenger).toContain(locale === "mk" ? "Битола" : "Bitola");
});
