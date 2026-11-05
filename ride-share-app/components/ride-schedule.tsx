import { rideTiming } from "@/lib/rides/ride-timing";
import { formatDeparture } from "@/lib/rides/ride-presentation";

export function RideSchedule({ departureAt, durationMinutes }: { departureAt: string; durationMinutes?: number | null }) {
  const timing = rideTiming(departureAt, durationMinutes);
  return <div className="min-w-0 flex-1">
    <p className="mb-2 text-sm font-medium text-slate-600">{timing.date}</p>
    <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
      <div><dt className="text-xs text-slate-500">Departure</dt><dd>
        <time dateTime={departureAt} aria-label={`Departure: ${formatDeparture(departureAt)}, Skopje time`} className="text-xl font-bold tabular-nums text-brand-800">{timing.departure}</time>
      </dd></div>
      <div><dt className="text-xs text-slate-500">Est. arrival</dt><dd>
        {timing.arrivalAt ? <time dateTime={timing.arrivalAt} aria-label={`Estimated arrival: ${formatDeparture(timing.arrivalAt)}, Skopje time`} className="text-xl font-bold tabular-nums text-brand-800">{timing.arrival}</time> : <span className="text-sm text-slate-500">Unavailable</span>}
        {timing.dayLabel && <span className="block text-xs text-slate-600">{timing.dayLabel}</span>}
      </dd></div>
    </dl>
    <p className="mt-1 text-xs text-slate-500">{timing.duration ? `About ${timing.duration} · Skopje time` : "Skopje time"}</p>
  </div>;
}
