import { rideTiming } from "@/lib/rides/ride-timing";
import { formatDeparture } from "@/lib/rides/ride-presentation";

export function RideSchedule({ departureAt, durationMinutes }: { departureAt: string; durationMinutes?: number | null }) {
  const timing = rideTiming(departureAt, durationMinutes);
  return <div className="min-w-0">
    <p className="mb-2 text-sm font-medium text-slate-600">{timing.date}</p>
    <dl className="grid grid-cols-[auto_minmax(1.5rem,1fr)_auto] gap-x-2 gap-y-1">
      <div><dt className="text-xs text-slate-500">Departure</dt><dd>
        <time dateTime={departureAt} aria-label={`Departure: ${formatDeparture(departureAt)}, Skopje time`} className="text-xl font-bold tabular-nums text-brand-800">{timing.departure}</time>
      </dd></div>
      <div aria-hidden="true" className="pt-4 text-brand-700">
        <dt className="sr-only">Journey</dt>
        <dd className="relative flex h-7 items-center justify-center">
          <span className="absolute inset-x-0 top-1/2 h-px bg-brand-700/30" />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="relative shrink-0 bg-white">
            <path d="m5 11 2-5h9l3 5m-14 0h14a2 2 0 0 1 2 2v3H3v-3a2 2 0 0 1 2-2Z" />
            <circle cx="7" cy="17" r="2" fill="white" />
            <circle cx="17" cy="17" r="2" fill="white" />
            <path d="M12 6v5M4 13h2m12 0h2" />
          </svg>
        </dd>
      </div>
      <div><dt className="text-xs text-slate-500">Est. arrival</dt><dd>
        {timing.arrivalAt ? <time dateTime={timing.arrivalAt} aria-label={`Estimated arrival: ${formatDeparture(timing.arrivalAt)}, Skopje time`} className="text-xl font-bold tabular-nums text-brand-800">{timing.arrival}</time> : <span className="text-sm text-slate-500">Unavailable</span>}
        {timing.dayLabel && <span className="block text-xs text-slate-600">{timing.dayLabel}</span>}
      </dd></div>
    </dl>
  </div>;
}
