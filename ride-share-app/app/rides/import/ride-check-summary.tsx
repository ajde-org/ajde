"use client";
import type { RideCheckMetadata, CheckTraceEntry } from "@/lib/ai/ride-check-contract";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/i18n/format";
import { SimilarRidesSummary, importCityName, type ImportCity } from "./similar-rides-summary";
import { FairPriceSummary } from "./fair-price-summary";

type City = ImportCity;

function Evidence({ entry, cities }: { entry: CheckTraceEntry; cities: City[] }) {
  const { locale, t } = useI18n();
  if (entry.tool === "find_similar_rides") return <SimilarRidesSummary entry={entry} cities={cities} />;
  if (entry.tool === "fair_price") return <FairPriceSummary entry={entry} />;
  if (entry.tool === "road_distance" && "distanceKm" in entry.result && entry.args && "originCityId" in entry.args) {
    const args = entry.args;
    const origin = importCityName(cities, args.originCityId, locale) ?? t("check.origin");
    const destination = importCityName(cities, args.destinationCityId, locale) ?? t("check.destination");
    return <li>{t("check.distance", { origin, destination, distance: formatNumber(locale, entry.result.distanceKm) })}</li>;
  }
  return <li>{t(entry.tool === "road_distance" ? "check.roadUnavailable" : "check.unavailable")}</li>;
}

export function RideCheckSummary({ check, cities }: { check: RideCheckMetadata; cities: City[] }) {
  const { t } = useI18n();
  return <section className="mt-4 rounded-xl bg-white p-4 text-sm text-slate-800" aria-label={t("check.label")}>
    <h3 className="font-semibold">{t("check.title")}</h3>
    {check.status === "unavailable" ? <p className="mt-2">{t("check.failed")}</p> : null}
    {check.trace.length ? <ul className="mt-2 space-y-2 break-words">
      {check.trace.map((entry, index) => <Evidence key={`${entry.callId}-${index}`} entry={entry} cities={cities} />)}
    </ul> : <p className="mt-2">{t("check.empty")}</p>}
    <p className="mt-2 text-xs text-slate-500">{t("check.caveat")}</p>
  </section>;
}
