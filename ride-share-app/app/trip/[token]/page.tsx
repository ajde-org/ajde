import { getI18n } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n/config";
import type { Metadata } from "next";
import Link from "next/link";
import { getSharedItinerary } from "@/lib/sharing/queries";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
  title: t("shared.title"),
  robots: { index: false, follow: false, noarchive: true },
  referrer: "no-referrer",
  };
}

export default async function SharedTripPage({ params }: { params: Promise<{ token: string }> }) {
  const { locale, t } = await getI18n();
  const { token } = await params;
  const itinerary = await getSharedItinerary(token, locale);
  if (!itinerary) return <main id="main-content" className="mx-auto w-full max-w-xl px-4 py-12">
    <h1 className="font-display text-3xl font-extrabold tracking-[-.035em]">{t("shared.unavailable")}</h1>
    <p className="mt-3 text-slate-600">{t("shared.unavailableBody")}</p>
    <Link href="/" className="btn-secondary mt-6">{t("shared.home")}</Link>
  </main>;

  return <main id="main-content" className="mx-auto w-full max-w-xl px-4 py-12 text-slate-950">
    <h1 className="font-display text-4xl font-extrabold tracking-[-.04em]">{t("shared.title")}</h1>
    <p className="mt-3 text-slate-600">{t("shared.disclaimer")}</p>
    <section className="mt-6 surface-card p-6">
      <h2 className="font-display text-2xl font-bold tracking-tight">{itinerary.origin} <span className="text-slate-400">{t("shared.to")}</span> {itinerary.destination}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div><dt className="font-semibold">{t("shared.departure")}</dt><dd>{new Date(itinerary.departureAt).toLocaleString(intlLocale(locale), { timeZone: "Europe/Skopje", dateStyle: "full", timeStyle: "short" })}</dd></div>
        <div><dt className="font-semibold">{t("shared.pickup")}</dt><dd>{itinerary.pickup ?? t("shared.unspecified")}</dd></div>
        <div><dt className="font-semibold">{t("shared.dropoff")}</dt><dd>{itinerary.dropoff ?? t("shared.unspecified")}</dd></div>
      </dl>
      {itinerary.driver ? <div className="mt-5 flex items-center gap-3">
        {/* A plain image carries an explicit policy so the bearer URL never becomes an image referrer. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={itinerary.driver.photoUrl} alt={t("shared.driver")} referrerPolicy="no-referrer" width={48} height={48} className="h-12 w-12 rounded-full object-cover" />
        <div><p className="text-sm text-slate-600">{t("shared.driver")}</p><p className="font-semibold">{itinerary.driver.name}</p></div>
      </div> : <p className="mt-5 text-sm">{t("shared.driverUnavailable")}</p>}
      <p className="mt-4 text-sm"><span className="font-semibold">{t("shared.car")}</span>{" "}{itinerary.car ? [itinerary.car.make, itinerary.car.model, itinerary.car.color].filter(Boolean).join(" · ") : t("shared.unspecified")}</p>
    </section>
    <p className="mt-4 text-sm text-slate-600">{t("shared.expiry")}</p>
  </main>;
}
