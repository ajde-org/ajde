import { getI18n } from "@/lib/i18n/server";
import { localizedName } from "@/lib/i18n/locations";
import { localizedCarColor } from "@/lib/i18n/car-color";
import { formatMoney } from "@/lib/i18n/format";
import { bookingNoticeKey } from "@/lib/bookings/messages";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TravelDescriptors } from '@/components/profile-personality';
import { getPublicProfile } from '@/lib/profiles/public-profile';
import { memberSince } from '@/lib/profiles/personality';
import { getProfileRatingSummary } from '@/lib/ratings/queries';
import { SeatAvailability } from "@/components/seat-availability";
import { PublishDraftButton } from "@/components/publish-draft-button";
import { RideRoute } from "@/components/ride-route";
import { RideFeatures } from "@/components/ride-features";
import { SubmitButton } from "@/components/submit-button";
import { ChatIcon } from "@/components/chat-icon";
import { requireCompleteProfile } from "@/lib/auth/session";
import { canViewRideDetail } from "@/lib/rides/ride-detail-access";
import { formatDeparture, getRide } from "@/lib/rides/ride-view";
import { createClient } from "@/lib/supabase/server";

import { requestBooking } from "../actions";
import { formatSeatPrice, isFreeRide } from "@/lib/rides/ride-price";
import { profilePhotoSrc } from "@/lib/profiles/photo";

export async function generateMetadata() { return { title: (await getI18n()).t("detail.title") }; }

type RideDetailProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ success?: string; error?: string }>;
};

export default async function RideDetailPage({ params, searchParams }: RideDetailProps) {
  const { locale, t } = await getI18n();
  const { id } = await params;
  const user = await requireCompleteProfile(`/rides/${id}`);
  const ride = await getRide(id);
  if (!ride) notFound();

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, seats, status, message")
    .eq("ride_id", id)
    .eq("passenger_id", user.id)
    .in("status", ["requested", "accepted"])
    .maybeSingle();
  if (!canViewRideDetail({
    rideStatus: ride.status,
    isDriver: ride.driver_id === user.id,
    bookingStatus: booking?.status,
  })) notFound();
  const [driverProfile, driverRating] = ride.driver_id ? await Promise.all([
    getPublicProfile(ride.driver_id), getProfileRatingSummary(ride.driver_id),
  ]) : [null, null];
  const notice = await searchParams;
  const requestAction = requestBooking.bind(null, id);
  const canChat = Boolean(ride.driver_id) && (ride.driver_id === user.id || booking?.status === "accepted");
  const route = t("ride.route", { origin: localizedName(ride.originCity, locale), destination: localizedName(ride.destinationCity, locale) });
  const canRequest = ride.driver_id !== user.id && ride.status === "published" && ride.seats_available > 0 && !booking;

  return (
    <div className="text-slate-950">
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <Link href="/rides" className="text-sm font-semibold text-brand-700 hover:underline">{t("detail.back")}</Link>
        {notice.success ? <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">{t(bookingNoticeKey(notice.success))}</p> : null}
        {notice.error ? <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-800">{t(bookingNoticeKey(notice.error))}</p> : null}

        <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_350px]">
          <section className={`surface-card flex min-w-0 flex-col overflow-hidden ${ride.tags.length ? "justify-between" : "self-start"}`} aria-labelledby="ride-title">
            <header className="p-6 sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-slate-600">{t("ride.departureTime", { date: formatDeparture(ride.departure_at, locale) })}</p>
                <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">{t(`status.${ride.status}`)}</span>
              </div>
              <h1 id="ride-title" className="mt-4 break-words font-display text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{route}</h1>
            </header>

            <div className="px-6 pb-6 sm:px-8 sm:pb-8">
              <RideRoute departureAt={ride.departure_at} durationMinutes={ride.duration_minutes} origin={localizedName(ride.originCity, locale)} destination={localizedName(ride.destinationCity, locale)} pickup={ride.originPickup ? localizedName(ride.originPickup, locale) : null} dropoff={ride.destinationPickup ? localizedName(ride.destinationPickup, locale) : null} />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-5 bg-slate-50 px-6 py-5 sm:px-8">
              <SeatAvailability available={ride.seats_available} total={ride.seats_total} />
              <div className="text-right"><p className="font-display text-2xl font-extrabold tracking-tight tabular-nums">{isFreeRide(ride.price_per_seat_mkd) ? t("ride.free") : locale === "en" ? formatSeatPrice(ride.price_per_seat_mkd) : formatMoney(locale, ride.price_per_seat_mkd!)}</p></div>
            </div>

            <div className="space-y-6 p-6 sm:p-8">
              <div>
                <h2 className="text-sm font-semibold">{t("timing.features")}</h2>
                <div className="mt-2 [&_li]:rounded-full [&_li]:bg-emerald-50 [&_li]:px-3 [&_li]:py-1 [&_li]:font-medium [&_li]:text-emerald-800 [&_ul]:gap-2"><RideFeatures tags={ride.tags} /></div>
              </div>
              <div><h2 className="text-sm font-semibold">{t("detail.notes")}</h2>{ride.notes?.trim() ? <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">{ride.notes}</p> : <p className="mt-2 text-xs text-slate-500">{t("timing.noNotes")}</p>}</div>
              {ride.status === "draft" && ride.driver_id === user.id ? <PublishDraftButton rideId={id} /> : null}
            </div>
          </section>

          <aside className="space-y-5">
            {canChat ? <section aria-labelledby="ride-chat-heading" className="surface-card border-brand-200! bg-brand-50 p-5">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-600 text-white"><ChatIcon /></span>
                <div><h2 id="ride-chat-heading" className="font-display text-xl font-bold tracking-tight">{t("detail.chat")}</h2><p className="text-sm text-slate-600">{t(ride.driver_id === user.id ? "detail.planDriver" : "detail.planPassenger")}</p></div>
              </div>
              <Link href={`/rides/${id}/chat`} className="btn-primary mt-4 w-full" aria-label={t("detail.openChatLabel", { route })}><ChatIcon /> {t("detail.openChat")}</Link>
            </section> : null}
            <section className="surface-card overflow-hidden p-6 text-slate-950">
              {ride.driver ? <>
                <div className="flex items-center gap-4">
                  {/* User/project-specific hosts cannot use a fixed Next Image allowlist. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={profilePhotoSrc(ride.driver.photo_url)} alt="" width={64} height={64} className="size-16 shrink-0 rounded-full bg-blue-50 object-cover" />
                  <div><p className="text-sm font-medium text-slate-500">{t("detail.driver")}</p>{ride.driver.verified_at ? <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">{t("ride.verified")}</span> : null}</div>
                </div>
                <Link href={`/profile/${ride.driver.id}?returnTo=${encodeURIComponent(`/rides/${id}`)}`} className="mt-4 block font-display text-xl font-bold tracking-tight hover:text-brand-700">{ride.driver.full_name}</Link><p className="mt-1 text-sm text-slate-600">{ride.driver.university}</p>{ride.car ? <p className="mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600">{ride.car.color ? `${localizedCarColor(ride.car.color, t)} ` : ""}{ride.car.make} {ride.car.model}</p> : null}
                {driverProfile ? <div className="mt-4 border-t border-slate-100 pt-4">
                  <p className="text-xs leading-6 text-slate-500">Member since {memberSince(driverProfile.createdAt)}</p>
                  {driverProfile.completedRides !== null ? <p className="text-sm font-semibold text-slate-700">{driverProfile.completedRides} completed rides</p> : null}
                  {driverRating && driverRating.count > 0 ? <p className="mt-2 text-sm font-semibold text-slate-700">★ {driverRating.average!.toFixed(1)}/5 · {driverRating.count} ratings</p> : null}
                  <TravelDescriptors personality={driverProfile.personality} compact />
                  <Link href={`/profile/${ride.driver.id}?returnTo=${encodeURIComponent(`/rides/${id}`)}`} className="mt-4 inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 hover:underline">Meet your driver →</Link>
                </div> : null}
              </> : <p className="p-5 text-sm text-slate-600">Imported ride awaiting a driver.</p>}
            </section>

            <section className="surface-card p-5">
              <h2 className="font-display text-xl font-bold tracking-tight">{t("detail.request")}</h2>
              {booking ? <div className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><p className="font-semibold capitalize">{t(`status.${booking.status}`)}</p><p className="mt-1">{t("detail.withDriver")}</p><Link className="mt-2 inline-block font-semibold underline" href="/dashboard/trips">{t("detail.manageTrips")}</Link></div> : null}
              {canRequest ? <form action={requestAction} className="mt-4 space-y-4">
                <label className="block text-sm font-semibold">{t("detail.message")}<textarea name="message" maxLength={1000} rows={3} className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 px-3 py-2.5 text-xs text-slate-500 font-normal" placeholder={t("detail.messagePlaceholder")} /></label>
                <p className="text-xs text-slate-500">{t("detail.phoneNotice")}</p>
                <SubmitButton pendingLabel={t("detail.sending")} className="btn-primary w-full disabled:opacity-60">{t("detail.submit")}</SubmitButton>
                {ride.gender_preference === "same_as_driver" ? <p className="text-xs text-slate-500">{t("detail.sameGender")}</p> : null}
              </form> : null}
              {!booking && !canRequest ? <p className="mt-3 text-sm text-slate-600">{ride.driver_id === user.id ? t("detail.ownRide") : t("detail.closed")}</p> : null}
              {ride.driver_id === user.id ? <Link href="/dashboard/trips?view=driver" className="btn-primary mt-4 w-full">{t("detail.manage")}</Link> : !booking && !canRequest ? <Link href="/rides" className="btn-secondary mt-4 w-full">{t("detail.another")}</Link> : null}
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}
