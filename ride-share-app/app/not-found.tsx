import Link from "next/link";
import { StatusPanel } from "@/components/status-panel";
import { getI18n } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getI18n();
  return <StatusPanel eyebrow="404" title={t("common.notFound")} actions={<Link href="/" className="btn-primary">{t("common.home")}</Link>}>
    <p>{t("common.notFoundBody")}</p>
  </StatusPanel>;
}
