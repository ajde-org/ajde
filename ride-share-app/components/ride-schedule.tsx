"use client";

import { useI18n } from "@/lib/i18n/provider";
import { rideTiming } from "@/lib/rides/ride-timing";
import { formatDeparture } from "@/lib/rides/ride-presentation";

export function RideSchedule({ departureAt, durationMinutes }: { departureAt: string; durationMinutes?: number | null }) {
  const { locale, t } = useI18n();
  const timing = rideTiming(departureAt, durationMinutes, locale);
  return <div className="min-w-0 flex-1">
    <time dateTime={departureAt} className="block text-[1.375rem] font-bold leading-7 text-brand-800">{timing.date}</time>
    <dl className="grid w-1/2 grid-cols-[minmax(0,1fr)_auto] gap-y-1">
      <div><dd className="flex h-8 items-center">
        <time dateTime={departureAt} aria-label={t("timing.departureLabel", { date: formatDeparture(departureAt, locale) })} className="shrink-0 text-xl font-bold tabular-nums text-brand-800">{timing.departure}</time>
        <span aria-hidden="true" className="relative min-w-0 flex-1 text-brand-700">
          <span className="absolute inset-x-2 top-0 flex h-7 -translate-y-1/2 items-center justify-center">
            <span className="absolute inset-x-0 top-1/2 h-px bg-brand-700/30" />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="relative shrink-0 bg-white">
            <path d="m5 11 2-5h9l3 5m-14 0h14a2 2 0 0 1 2 2v3H3v-3a2 2 0 0 1 2-2Z" />
            <circle cx="7" cy="17" r="2" fill="white" />
            <circle cx="17" cy="17" r="2" fill="white" />
            <path d="M12 6v5M4 13h2m12 0h2" />
            </svg>
          </span>
        </span>
      </dd></div>
      <div><dd>
        {timing.arrivalAt ? <time dateTime={timing.arrivalAt} aria-label={t("timing.arrivalLabel", { date: formatDeparture(timing.arrivalAt, locale) })} className="inline-flex h-8 items-center text-xl font-bold tabular-nums text-brand-800">{timing.arrival}</time> : <span className="inline-flex h-8 items-center text-sm text-slate-500">{t("timing.unavailable")}</span>}
      </dd></div>
    </dl>
    {timing.dayLabel && <p className="w-1/2 text-right text-xs text-slate-600">{timing.dayLabel}</p>}
  </div>;
}
