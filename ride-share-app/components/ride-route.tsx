"use client";

import { useI18n } from "@/lib/i18n/provider";
export function RideRoute({ origin, destination, pickup, dropoff }: { origin: string; destination: string; pickup?: string | null; dropoff?: string | null }) {
  const { t } = useI18n();
  return <dl className="route-stops">
    <div className="route-stop"><dt className="text-xs font-medium text-slate-500">{t("ride.departure")}</dt><dd className="mt-0.5 text-lg font-medium text-slate-950">{origin}</dd><dd className="mt-0.5 text-sm text-slate-600">{pickup ?? t("ride.agreePickup")}</dd></div>
    <div className="route-stop"><dt className="text-xs font-medium text-slate-500">{t("ride.destination")}</dt><dd className="mt-0.5 text-lg font-medium text-slate-950">{destination}</dd><dd className="mt-0.5 text-sm text-slate-600">{dropoff ?? t("ride.agreeDropoff")}</dd></div>
  </dl>;
}
