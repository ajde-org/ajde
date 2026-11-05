"use client";

import { ContactDetails } from "@/components/contact-details";
import { PublishDraftButton } from "@/components/publish-draft-button";
import { useI18n } from "@/lib/i18n/provider";
import { formatNumber } from "@/lib/i18n/format";
import Link from "next/link";

import { SubmitButton } from "@/components/submit-button";
import { SeatAvailability } from "@/components/seat-availability";
import { ChatIcon } from "@/components/chat-icon";
import { CompleteRideButton } from "@/components/ride-completion/complete-ride-button";
import { CancelRideControl } from "@/components/ride-completion/cancel-ride-control";
import { RatingControl } from "@/components/ratings/rating-control";
import { formatDeparture } from "@/lib/rides/ride-presentation";

import { decideBooking } from "../actions";
import { TripStatusFilterNav } from "./trip-status-filter-nav";
import { type TripStatusFilter } from "./trip-tabs";
import type { DriverTripsData } from "./driver-trips";

export function DriverTripsView({ rides, bookings, counts, cities, passengerMap, contactMap, ratingControls, now, filter, hasRides }: DriverTripsData) {
  const { locale, t } = useI18n();
  const emptyStates: Record<TripStatusFilter, { title: string; body: string }> = {
  active: { title: t("trips.noActiveRides"), body: t("trips.spareSeat") },
  completed: { title: t("trips.noCompletedRides"), body: t("trips.finishedHere") },
  cancelled: { title: t("trips.noCancelledRides"), body: t("trips.cancelledHere") },
  all: { title: t("trips.noOffers"), body: t("trips.spareSeat") },
};
  const cityMap = new Map(cities.map((city) => [city.id, locale === "mk" ? city.name_mk : city.name_en]));

  return <TripStatusFilterNav view="driver" filter={filter} counts={counts}>
    <div className="dashboard-grid mt-6">
        {rides.map((ride) => {
          const rideBookings = (bookings ?? []).filter((booking) => booking.ride_id === ride.id);
          const isOpen = ["published", "full"].includes(ride.status);
          const hasDeparted = Date.parse(ride.departure_at) < now;
          const canDecide = isOpen && Date.parse(ride.departure_at) > now;
          const confirmedSeats = rideBookings.filter((booking) => booking.status === "accepted").reduce((total, booking) => total + booking.seats, 0);
          const pendingRequests = rideBookings.filter((booking) => booking.status === "requested").length;
          const isFull = ride.status === "full" || ride.seats_available === 0;
          return <section key={ride.id} className="journey-card">
            <div className="journey-card-top"><p className="journey-card-date">{formatDeparture(ride.departure_at, locale)}</p><span className={`status-pill ${ride.status === "cancelled" ? "bg-red-50 text-red-800" : isOpen ? "bg-blue-50 text-blue-800" : ""}`}>{t(`status.${ride.status}`)}</span></div>
            <h2><Link href={`/rides/${ride.id}`} className="journey-card-route hover:text-brand-700">{cityMap.get(ride.origin_city_id)} <span>{t("ride.to")}</span> {cityMap.get(ride.dest_city_id)}</Link></h2>
            <div className="journey-card-meta"><SeatAvailability available={ride.seats_available} total={ride.seats_total} /><p className="text-slate-500">{t("trips.confirmed", { count: formatNumber(locale, confirmedSeats) })}</p></div>
            <nav aria-label={t("trips.rideActions")} className="mt-6 flex flex-wrap gap-3">
              <Link href={`/rides/${ride.id}`} className="btn-secondary flex-1">{t("trips.viewRide")}</Link>
              {confirmedSeats > 0 ? <Link href={`/rides/${ride.id}/chat`} className="btn-primary flex-1" aria-label={t("detail.openChatLabel", { route: t("ride.route", { origin: cityMap.get(ride.origin_city_id) ?? "", destination: cityMap.get(ride.dest_city_id) ?? "" }) })}><ChatIcon /> {t("trips.openChat")}</Link> : null}
            </nav>
            {isOpen && hasDeparted ? <CompleteRideButton rideId={ride.id} /> : null}
            {ride.status === "draft" ? <PublishDraftButton rideId={ride.id} /> : null}
            <details className="card-options" open={(canDecide && pendingRequests > 0) || ratingControls.has(ride.id)}>
              <summary>{ride.status === "completed" ? t("trips.feedback") : t("trips.manage")}{canDecide && pendingRequests > 0 ? <span className="ml-3 rounded-full bg-brand-50 px-3 py-1 text-sm text-brand-700">{t("trips.pending", { count: formatNumber(locale, pendingRequests) })}</span> : null}</summary>
              <h3 className="text-xl font-medium">{t("trips.requests")}</h3>
              {rideBookings.length ? <div className="mt-5 space-y-5">{rideBookings.map((booking) => {
                const passenger = passengerMap.get(booking.passenger_id);
                const contact = contactMap.get(booking.passenger_id);
                return <article key={booking.id} className="border-b border-slate-100 pb-5 last:border-0">
                  <div className="flex min-w-0 items-start gap-3">
                    {passenger ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={passenger.photo_url} alt="" className="size-12 shrink-0 rounded-full bg-slate-50 object-cover" />
                    ) : <span className="grid size-12 shrink-0 place-items-center rounded-full bg-slate-100 text-sm">SR</span>}
                    <div className="min-w-0">
                      <p className="font-medium">{passenger ? <Link href={`/profile/${passenger.id}`} className="hover:text-brand-700">{passenger.full_name}</Link> : t("trips.student")}</p>
                      <p className="text-sm text-slate-500">{passenger?.university}</p>
                    </div>
                  </div>
                  {booking.message ? <p className="mt-3 text-slate-600">“{booking.message}”</p> : null}
                  {["requested", "accepted"].includes(booking.status) ? <ContactDetails phone={contact?.phone} /> : null}
                  <div className="mt-4 flex flex-wrap gap-3">{booking.status === "requested" && canDecide ? <>
                    <form action={decideBooking.bind(null, booking.id, "accepted")}><SubmitButton pendingLabel={t("trips.accepting")} className="btn-primary disabled:opacity-60">{t("trips.accept")}</SubmitButton></form>
                    <form action={decideBooking.bind(null, booking.id, "declined")}><SubmitButton pendingLabel={t("trips.declining")} className="btn-secondary disabled:opacity-60">{t("trips.decline")}</SubmitButton></form>
                  </> : <span className="status-pill">{t(`status.${booking.status}`)}</span>}</div>
                  {booking.status === "accepted" ? <RatingControl state={ratingControls.get(ride.id)?.get(booking.passenger_id)} rideId={ride.id} rateeId={booking.passenger_id} targetName={passenger?.full_name ?? t("trips.yourPassenger")} /> : null}
                </article>;
              })}</div> : <p className="mt-3 text-slate-500">{t("trips.noRequests")}</p>}
              {canDecide ? <CancelRideControl rideId={ride.id} isFull={isFull} confirmedSeats={confirmedSeats} /> : null}
            </details>
          </section>;
        })}
        {!rides.length ? <div className="journey-card dashboard-empty"><h2>{hasRides ? emptyStates[filter].title : t("trips.noOffers")}</h2><p>{hasRides ? emptyStates[filter].body : emptyStates.all.body}</p><Link href="/rides/new" className="btn-primary">{hasRides ? t("trips.offer") : t("trips.firstOffer")}</Link></div> : null}
      </div>
    </TripStatusFilterNav>;
}
