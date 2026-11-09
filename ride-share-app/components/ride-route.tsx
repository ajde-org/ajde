"use client";

import { useI18n } from "@/lib/i18n/provider";
import { rideTiming } from "@/lib/rides/ride-timing";
import { formatDeparture } from "@/lib/rides/ride-presentation";

export function RideRoute({ origin, destination, pickup, dropoff, departureAt, durationMinutes }: {
  origin: string; destination: string; pickup?: string | null; dropoff?: string | null;
  departureAt?: string; durationMinutes?: number | null;
}) {
  const { locale, t } = useI18n();
  const timing = departureAt ? rideTiming(departureAt, durationMinutes, locale) : null;
  const stops = [
    { label: t("ride.departure"), city: origin, place: pickup, time: timing?.departure, instant: departureAt },
    { label: t("timing.arrival"), city: destination, place: dropoff, time: timing?.arrival, instant: timing?.arrivalAt },
  ];
  return <div>
    <dl className="route-stops">
      {stops.map((stop, index) => <div key={stop.label} className="route-stop">
        <dt className="text-xs font-medium text-slate-500">{stop.label}</dt>
        <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-lg font-medium text-slate-950">
          {stop.instant && stop.time ? <time dateTime={stop.instant} aria-label={t(index === 0 ? "timing.departureLabel" : "timing.arrivalLabel", { date: formatDeparture(stop.instant, locale) })} className="tabular-nums font-bold text-brand-800">{stop.time}</time> : index === 1 ? <span className="text-sm font-normal text-slate-500">{t("timing.timeUnavailable")}</span> : null}
          {index === 1 && timing?.dayLabel && <span className="text-sm text-slate-600">{timing.dayLabel}</span>}
          <span>{stop.city}</span>
        </dd>
        {stop.place ? <dd className="mt-0.5 text-sm text-slate-600">{stop.place}</dd> : null}
      </div>)}
    </dl>
  </div>;
}
