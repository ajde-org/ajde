"use client";

import { useI18n } from "@/lib/i18n/provider";
import { formatDateTime, formatNumber } from "@/lib/i18n/format";
import type { SearchQueryResult } from "@/lib/ai/search-query-schema";

export function SearchInterpretation({
  result,
  cityNames,
  manualOverride,
}: {
  result: SearchQueryResult;
  cityNames: ReadonlyMap<number, string>;
  manualOverride: boolean;
}) {
  const { locale, t } = useI18n();
  const displayDate = (value: string) => formatDateTime(locale, `${value}T12:00:00Z`, { dateStyle: "medium" });
  const bounds = result.departureAfter && result.departureBefore
    ? `${formatDateTime(locale, result.departureAfter)} – ${formatDateTime(locale, result.departureBefore)}`
    : result.departureAfter ? t("search.after", { date: formatDateTime(locale, result.departureAfter) })
    : result.departureBefore ? t("search.before", { date: formatDateTime(locale, result.departureBefore) }) : t("search.anyDate");
  const criteria = [
    result.originId ? t("search.from", { city: cityNames.get(result.originId) ?? t("search.unknownCity") }) : null,
    result.destinationId ? t("search.to", { city: cityNames.get(result.destinationId) ?? t("search.unknownCity") }) : null,
    result.dateFrom || result.dateTo
      ? [result.dateFrom ? displayDate(result.dateFrom) : t("date.today"), result.dateTo && result.dateTo !== result.dateFrom ? displayDate(result.dateTo) : null].filter(Boolean).join(" – ")
      : bounds,
    result.timeAfter && result.timeBefore
      ? t(result.timeAfter > result.timeBefore ? "search.overnight" : "search.window", { after: result.timeAfter, before: result.timeBefore })
      : result.timeAfter ? t("search.afterTime", { time: result.timeAfter })
      : result.timeBefore ? t("search.beforeTime", { time: result.timeBefore }) : null,
  ].filter((value): value is string => Boolean(value));

  return (
    <section className="mt-3 rounded-3xl border border-white bg-white p-4" aria-label={t("search.interpretation")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold text-slate-950">
          {criteria.length ? criteria.join(" · ") : t("search.noFilters")}
        </p>
        <span className="text-xs font-medium text-slate-500">
          {t("search.confidence", { percent: formatNumber(locale, Math.round(result.confidence * 100)) })}
        </span>
      </div>
      {manualOverride ? (
        <p className="mt-2 text-xs text-emerald-800">{t("search.manual")}</p>
      ) : null}
      {result.warnings.length ? (
        <ul className="mt-3 space-y-1 text-sm text-amber-900">
          {result.warnings.map((warning, index) => (
            <li key={`${warning.code}-${index}`}>• {t(`search.warning.${warning.code}`)}</li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
