"use client";

import type { ReactNode } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, plural } from "@/lib/i18n/format";

export type PublicImpact = {
  savedCo2Kg: number;
  savedFuelLitres: number;
  uniqueParticipants: number;
  completedSharedTrips: number;
  excludedEstimateTrips: number;
};

export function LandingSavings({ summary, status }: { summary: PublicImpact | null; status?: "loading" | "unavailable" }) {
  const { locale, t } = useI18n();
  const number = (value: number) => formatNumber(locale, value, { maximumFractionDigits: 1 });
  const savings: { icon: ReactNode; value: string; label: string }[] = [
    { icon: <path d="M4 17a4 4 0 0 1 1-7.9A6 6 0 0 1 16.7 8 4.5 4.5 0 0 1 19 17H4Z" />, value: summary ? `${number(summary.savedCo2Kg)} kg` : "—", label: t("landing.co2") },
    { icon: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />, value: summary ? `${number(summary.savedFuelLitres)} L` : "—", label: t("landing.fuel") },
    { icon: <><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 0 1 0 6m2 3c2 .8 3 2.8 3 6" /></>, value: summary ? number(summary.uniqueParticipants) : "—", label: t("landing.participants") },
    { icon: <path d="m5 12 4 4L19 6" />, value: summary ? number(summary.completedSharedTrips) : "—", label: t("landing.completed") },
  ];
  const message = status === "loading" ? t("landing.statisticsLoading") : status === "unavailable" ? t("landing.statisticsUnavailable") : null;
  return <section aria-label={t("landing.statistics")} className="shrink-0 px-5 py-7 text-white sm:px-10 lg:py-6">
    <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-5 lg:flex lg:flex-nowrap lg:items-center lg:justify-center lg:gap-x-[clamp(2rem,4vw,4.5rem)]">
      {savings.map((s, index) => <li key={index} className="flex items-center gap-3.5">
        <svg className="shrink-0" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#86efac" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{s.icon}</svg>
        <span className="flex min-w-0 flex-col">
          <span className="font-display text-[clamp(1.4rem,2.2vw,1.9rem)] font-extrabold leading-tight tracking-[-0.03em]" style={{ fontVariantNumeric: "tabular-nums" }}>{s.value}</span>
          <span className="text-xs font-medium text-[#a3b8aa] sm:text-sm">{s.label}</span>
        </span>
      </li>)}
    </ul>
    {message || (summary && summary.excludedEstimateTrips > 0) ? <p className="mx-auto mt-4 max-w-4xl text-center text-xs leading-relaxed text-[#a3b8aa]">
      {message}
      {summary && summary.excludedEstimateTrips > 0 ? t(`landing.excluded.${plural(locale, summary.excludedEstimateTrips)}`, { count: number(summary.excludedEstimateTrips) }) : null}
    </p> : null}
  </section>;
}
