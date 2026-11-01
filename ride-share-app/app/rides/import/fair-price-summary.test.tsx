// @vitest-environment jsdom
import { cleanup, render, screen } from "@/lib/i18n/testing";
import { afterEach, describe, expect, it } from "vitest";
import { RideCheckSummary } from "./ride-check-summary";
import { calculateFairPrice } from "@/lib/ai/fair-price-tool";

afterEach(cleanup);
describe("fair-share review evidence", () => {
  it("shows calculated costs, fuel configuration, offered seats, and explicitly labelled defaults", () => {
    const args = { distanceKm: 100, availableSeats: 3, fuelType: null, consumptionL100Km: null };
    render(<RideCheckSummary cities={[]} check={{ status: "checked", trace: [{ callId: "price", tool: "fair_price", args, result: calculateFairPrice(args, { petrol: 80, diesel: null }) }] }} />);
    expect(screen.getByText(/Fair share: MKD\s*187 per seat/).textContent).toContain("MKD 560 total trip cost");
    expect(screen.getByText(/3 available seats/).textContent).toContain("80 MKD/L");
    expect(screen.getByText(/Petrol.*7 L\/100 km/)).toBeTruthy();
    expect(screen.getByText(/fuel type is a default approximation/)).toBeTruthy();
    expect(screen.getByText(/Consumption uses a default estimate/)).toBeTruthy();
    expect(screen.getByText(/Tolls are excluded/)).toBeTruthy();
  });
  it("labels missing fuel configuration as unavailable without showing a calculated cost", () => {
    render(<RideCheckSummary cities={[]} check={{ status: "unavailable", trace: [{ callId: "price", tool: "fair_price", args: null, result: { error: "Configured petrol fuel price is unavailable." } }] }} />);
    expect(screen.getByText(/Fair-share evidence is unavailable/)).toBeTruthy();
    expect(screen.queryByText(/MKD per seat/)).toBeNull();
  });
});
