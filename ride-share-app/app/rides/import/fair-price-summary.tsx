"use client";
import type { CheckTraceEntry } from "@/lib/ai/ride-check-contract";
import { useI18n } from "@/lib/i18n/provider";
import { formatMoney, formatNumber, plural } from "@/lib/i18n/format";

export function FairPriceSummary({ entry }: { entry: CheckTraceEntry }) {
  const { locale, t } = useI18n();
  if (!("pricePerSeatMkd" in entry.result)) return <li>{t("check.priceUnavailable")}</li>;
  const { pricePerSeatMkd, totalTripCostMkd, assumptions: a } = entry.result;
  return <li>
    <p>{t("check.price", { seat: formatMoney(locale, pricePerSeatMkd), total: formatMoney(locale, totalTripCostMkd) })}</p>
    <p>{t(`check.basis.${plural(locale, a.availableSeats)}`, { distance: formatNumber(locale, a.distanceKm), seats: formatNumber(locale, a.availableSeats), fuelPrice: formatNumber(locale, a.fuelPriceMkdL) })}</p>
    <p>{t("check.fuel", { fuel: t(`fuel.${a.fuelType}`), consumption: formatNumber(locale, a.consumptionL100Km) })}</p>
    {a.defaultFuelType && <p>{t("check.defaultFuel")}</p>}
    {a.defaultConsumption && <p>{t("check.defaultConsumption")}</p>}
    <p>{t("check.noTolls")}</p>
  </li>;
}
