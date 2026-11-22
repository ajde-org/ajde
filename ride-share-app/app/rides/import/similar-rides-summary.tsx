"use client";
import type { CheckTraceEntry } from "@/lib/ai/ride-check-contract";
import { useI18n } from "@/lib/i18n/provider";
import { formatDateTime, formatMoney, formatNumber, plural } from "@/lib/i18n/format";

export type ImportCity = { id: number; name_en: string; name_mk?: string };
export function importCityName(cities: ImportCity[], id: number, locale: "en" | "mk") {
  const city = cities.find(city => city.id === id);
  return locale === "mk" ? city?.name_mk ?? city?.name_en : city?.name_en;
}

export function SimilarRidesSummary({ entry, cities }: { entry: CheckTraceEntry; cities: ImportCity[] }) {
  const { locale, t } = useI18n();
  if (!("rides" in entry.result) || !entry.args || !("departureAt" in entry.args)) return <li>{t("check.similarUnavailable")}</li>;
  const args = entry.args;
  const origin = importCityName(cities, args.originCityId, locale) ?? t("check.origin");
  const destination = importCityName(cities, args.destinationCityId, locale) ?? t("check.destination");
  if (!entry.result.rides.length) return <li>{t("check.noMatches", { origin, destination })}</li>;
  return <li>
    <p>{t("check.matches", { origin, destination })}</p>
    <ul className="mt-1 space-y-1 pl-4">
      {entry.result.rides.map(ride => <li key={ride.id}>
        <a className="underline" href={`/rides/${ride.id}`} target="_blank" rel="noreferrer">
          {t(`check.match.${plural(locale, ride.seatsAvailable)}`, { departure: formatDateTime(locale, ride.departureAt), price: ride.pricePerSeatMkd === null ? t("check.priceUnknown") : t("check.seatPrice", { price: formatMoney(locale, ride.pricePerSeatMkd) }), seats: formatNumber(locale, ride.seatsAvailable) })}
        </a>
      </li>)}
    </ul>
    <p className="mt-1">{t("check.matchCaveat")}</p>
  </li>;
}
