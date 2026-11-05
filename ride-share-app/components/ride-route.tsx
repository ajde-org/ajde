import { rideTiming } from "@/lib/rides/ride-timing";
import { formatDeparture } from "@/lib/rides/ride-presentation";

export function RideRoute({ origin, destination, pickup, dropoff, departureAt, durationMinutes }: {
  origin: string; destination: string; pickup?: string | null; dropoff?: string | null;
  departureAt?: string; durationMinutes?: number | null;
}) {
  const timing = departureAt ? rideTiming(departureAt, durationMinutes) : null;
  const stops = [
    { label: "Departure", city: origin, place: pickup ?? "Agree pickup with driver", time: timing?.departure, instant: departureAt },
    { label: "Estimated arrival", city: destination, place: dropoff ?? "Agree drop-off with driver", time: timing?.arrival, instant: timing?.arrivalAt },
  ];
  return <div>
    <dl className="route-stops">
      {stops.map((stop, index) => <div key={stop.label} className="route-stop">
        <dt className="text-xs font-medium text-slate-500">{stop.label}</dt>
        <dd className="mt-0.5 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-lg font-medium text-slate-950">
          {stop.instant && stop.time ? <time dateTime={stop.instant} aria-label={`${stop.label}: ${formatDeparture(stop.instant)}, Skopje time`} className="tabular-nums font-bold text-brand-800">{stop.time}</time> : index === 1 ? <span className="text-sm font-normal text-slate-500">Time unavailable</span> : null}
          {index === 1 && timing?.dayLabel && <span className="text-sm text-slate-600">{timing.dayLabel}</span>}
          <span>{stop.city}</span>
        </dd>
        <dd className="mt-0.5 text-sm text-slate-600">{stop.place}</dd>
      </div>)}
    </dl>
    {timing?.duration && <p className="mt-4 text-xs text-slate-600/70">About {timing.duration}. City-to-city estimate; traffic, stops and pickup arrangements may change arrival.</p>}
  </div>;
}
