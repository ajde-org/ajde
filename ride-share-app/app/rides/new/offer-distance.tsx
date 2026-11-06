"use client";
import { useEffect } from "react";
import type { OfferTab } from "@/lib/rides/offer-tabs";
import { useI18n } from "@/lib/i18n/provider";

export function offerDistanceMessage(message: string, t: ReturnType<typeof useI18n>["t"]) {
  switch (message) {
    case "offer.distanceCalculating":
    case "Estimating city-to-city driving time and distance…": return t("timing.calculating");
    case "Calculating city-to-city road distance…": return t("offer.distanceCalculating");
    case "offer.distanceFilled":
    case "City-to-city driving time estimated.": return t("timing.filled");
    case "Estimated city-to-city driving distance filled.": return t("offer.distanceFilled");
    case "offer.distanceUnavailable":
    case "Arrival estimate unavailable. Retry or publish without an estimate.": return t("timing.failed");
    case "Distance unavailable. Enter km manually or retry.": return t("offer.distanceUnavailable");
    default: return "";
  }
}

export type UpdateOfferTab = (id: string, update: (current: OfferTab) => OfferTab) => void;

export function OfferDistance({ tab, origin, destination, update }: {
  tab: OfferTab; origin: string | undefined; destination: string | undefined; update: UpdateOfferTab;
}) {
  const { id, distanceEpoch, publishedId } = tab;
  useEffect(() => {
    if (!origin || !destination || origin === destination || publishedId) return;
    const controller = new AbortController();
    let current = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const apply = (transform: (tab: OfferTab) => OfferTab) => {
      if (current) update(id, previous => previous.distanceEpoch === distanceEpoch && !previous.publishedId ? transform(previous) : previous);
    };
    apply(previous => ({ ...previous, distanceMessage: "offer.distanceCalculating" }));
    async function request(attempt: number) {
      try {
        const response = await fetch("/api/rides/distance", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ originCity: origin, destinationCity: destination }), signal: controller.signal });
        const result = await response.json();
        if (response.status === 429 && attempt < 30 && current) {
          timer = setTimeout(() => { void request(attempt + 1); }, 1300 + Math.random() * 300); return;
        }
        if (!response.ok || !Number.isFinite(result.distanceKm) || result.distanceKm <= 0 || !Number.isInteger(result.durationMinutes) || result.durationMinutes < 1 || result.durationMinutes > 1440) throw new Error("No valid route");
        apply(previous => ({ ...previous, values: { ...previous.values, distanceKm: previous.distanceMode === "manual" ? previous.values.distanceKm : String(result.distanceKm) }, estimatedDurationMinutes: result.durationMinutes, distanceMode: previous.distanceMode === "manual" ? "manual" : "resolved", distanceMessage: "offer.distanceFilled" }));
      } catch {
        apply(previous => ({ ...previous, estimatedDurationMinutes: null, distanceMode: previous.distanceMode === "manual" ? "manual" : "error", distanceMessage: "offer.distanceUnavailable" }));
      }
    }
    void request(0);
    return () => { current = false; controller.abort(); if (timer) clearTimeout(timer); };
  }, [id, origin, destination, distanceEpoch, publishedId, update]);
  return null;
}
