"use client";
import { useEffect } from "react";
import type { OfferTab } from "@/lib/rides/offer-tabs";

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
    apply(previous => ({ ...previous, distanceMessage: "Estimating city-to-city driving time and distance…" }));
    async function request(attempt: number) {
      try {
        const response = await fetch("/api/rides/distance", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ originCity: origin, destinationCity: destination }), signal: controller.signal });
        const result = await response.json();
        if (response.status === 429 && attempt < 30 && current) {
          timer = setTimeout(() => { void request(attempt + 1); }, 1300 + Math.random() * 300); return;
        }
        if (!response.ok || !Number.isFinite(result.distanceKm) || result.distanceKm <= 0 || !Number.isInteger(result.durationMinutes) || result.durationMinutes < 1 || result.durationMinutes > 1440) throw new Error("No valid route");
        apply(previous => ({ ...previous, values: { ...previous.values, distanceKm: previous.distanceMode === "manual" ? previous.values.distanceKm : String(result.distanceKm) }, estimatedDurationMinutes: result.durationMinutes, distanceMode: previous.distanceMode === "manual" ? "manual" : "resolved", distanceMessage: "City-to-city driving time estimated." }));
      } catch {
        apply(previous => ({ ...previous, estimatedDurationMinutes: null, distanceMode: previous.distanceMode === "manual" ? "manual" : "error", distanceMessage: "Arrival estimate unavailable. Retry or publish without an estimate." }));
      }
    }
    void request(0);
    return () => { current = false; controller.abort(); if (timer) clearTimeout(timer); };
  }, [id, origin, destination, distanceEpoch, publishedId, update]);
  return null;
}
