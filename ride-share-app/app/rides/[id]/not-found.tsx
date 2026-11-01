import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { StatusPanel } from "@/components/status-panel";

export default async function RideNotFound() {
  const { t } = await getI18n();
  return <StatusPanel eyebrow={t("detail.ride")} title={t("detail.notFound")} actions={<Link href="/rides" className="btn-primary">{t("detail.browse")}</Link>}>
    <p>{t("detail.notFoundBody")}</p>
  </StatusPanel>;
}
