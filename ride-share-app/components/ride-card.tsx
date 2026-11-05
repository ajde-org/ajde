import Link from "next/link";

import { RideSchedule } from "@/components/ride-schedule";
import { SeatAvailability } from "@/components/seat-availability";
import { ReserveSeatLink } from "@/components/reserve-seat-link";
import { RideFeatures } from "@/components/ride-features";
import type { RideView } from "@/lib/rides/ride-view";
import { formatSeatPrice, seatPriceCaption } from "@/lib/rides/ride-price";

export function RideCard({ ride, explanation }: { ride: RideView; explanation?: string }) {
  return (
    <article className="ride-choice-card surface-card flex min-w-0 flex-col gap-3 p-4 text-slate-950">
      <h2 className="journey-card-route">
        <Link href={`/rides/${ride.id}`} className="rounded-sm hover:text-brand-700 hover:underline underline-offset-4">
          {ride.originCity.name_en}{" "}<span className="font-medium">to</span>{" "}{ride.destinationCity.name_en}
        </Link>
      </h2>
      <RideSchedule departureAt={ride.departure_at} durationMinutes={ride.duration_minutes} />
      {explanation ? <p className="text-[.8125rem] leading-snug text-slate-600">{explanation}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        {ride.driver ? (
          /* Profile-photo hosts depend on the user's project. */
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={ride.driver.photo_url} alt="" loading="lazy" width={32} height={32} className="size-8 shrink-0 rounded-full bg-slate-50 object-cover" />
        ) : <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full bg-slate-100 text-xs font-semibold">SR</span>}
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1 text-[.8125rem] font-semibold">
            <span className="truncate">{ride.driver ? <Link href={`/profile/${ride.driver.id}`} className="hover:text-brand-700 hover:underline">{ride.driver.full_name}</Link> : "Imported ride"}</span>
            {ride.driver?.verified_at ? (
              <svg width="16" height="16" viewBox="0 0 24 24" role="img" aria-label="Verified driver" className="shrink-0 text-brand-600">
                <title>Verified driver</title>
                <path d="m12 3.7 3.3-1.4 1.8 2.9 3.4.8-.3 3.4 2.3 2.6-2.3 2.6.3 3.4-3.4.8-1.8 2.9-3.3-1.4-3.3 1.4-1.8-2.9-3.4-.8.3-3.4L1.5 12l2.3-2.6-.3-3.4 3.4-.8 1.8-2.9Z" fill="currentColor" />
                <path d="m7.5 12 3 3 6-6" fill="none" stroke="white" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </p>
          <p className="truncate text-[.6875rem] text-slate-500">{ride.car ? `${ride.car.color ? `${ride.car.color} ` : ""}${ride.car.make} ${ride.car.model}` : ride.driver?.university ?? "Driver details coming soon"}</p>
        </div>
        <p className="shrink-0 text-right">
          <span className="block text-2xl font-bold leading-7 tracking-tight text-black">{formatSeatPrice(ride.price_per_seat_mkd)}</span>
          <span className="block text-[.6875rem] font-normal leading-4 text-slate-500">{seatPriceCaption(ride.price_per_seat_mkd)}</span>
        </p>
      </div>
      <RideFeatures tags={ride.tags} />
      <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
        <ReserveSeatLink href={`/rides/${ride.id}`} route={`from ${ride.originCity.name_en} to ${ride.destinationCity.name_en}`} />
        <div className="shrink-0 [&_p]:text-base [&_p]:font-semibold [&_p]:leading-6">
          <SeatAvailability available={ride.seats_available} total={ride.seats_total} compact />
        </div>
      </div>
    </article>
  );
}
