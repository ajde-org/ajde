// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { I18nProvider } from "@/lib/i18n/provider";
import { en } from "@/lib/i18n/messages/en";
import { mk } from "@/lib/i18n/messages/mk";
import type { RideView } from "@/lib/rides/ride-view";
import type { SearchQueryResult } from "@/lib/ai/search-query-schema";
import { RideResults } from "./ride-results";

vi.mock("@/components/ride-card", () => ({ RideCard: ({ explanation }: { explanation?: string }) => <p>{explanation ?? "Ride facts remain available"}</p> }));
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
it("invalidates old-language explanations and ignores their late response after switching", async () => {
  const id = "94000000-0000-4000-8000-000000000001";
  const rides = [{ id }] as RideView[];
  const context: SearchQueryResult = { originId: 1, destinationId: 2, departureAfter: null, departureBefore: null, requestedSeats: null, confidence: 1, warnings: [] };
  let finishEnglish!: (response: Response) => void;
  const fetcher = vi.fn().mockImplementationOnce(() => new Promise<Response>(resolve => { finishEnglish = resolve; }))
    .mockResolvedValueOnce(Response.json({ explanations: [{ rideId: id, explanation: "Одговара на рутата Скопје до Битола." }] }));
  vi.stubGlobal("fetch", fetcher);
  const content = <RideResults rides={rides} searchContext={context} />;
  const view = render(<I18nProvider locale="en" messages={en}>{content}</I18nProvider>);
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(1));
  view.rerender(<I18nProvider locale="mk" messages={mk}>{content}</I18nProvider>);
  await screen.findByText("Одговара на рутата Скопје до Битола.");
  expect(fetcher.mock.calls[0][1].signal.aborted).toBe(true);
  await act(async () => finishEnglish(Response.json({ explanations: [{ rideId: id, explanation: "Old English explanation for Skopje." }] })));
  expect(screen.queryByText("Old English explanation for Skopje.")).toBeNull();
  expect(fetcher).toHaveBeenCalledTimes(2);
});
