import { getI18n } from "@/lib/i18n/server";

/** Page title block; shared with the route's loading state so the swap is seamless. */
export async function OfferRideHeading() {
  const { t } = await getI18n();
  return <div>
    <h1 className="page-heading">{t("offer.title")}</h1>
    <p className="mt-4 text-slate-500">{t("offer.intro")}</p>
  </div>;
}
