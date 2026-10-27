"use client";
import Link from "next/link";
import { StatusPanel } from "@/components/status-panel";
import { useI18n } from "@/lib/i18n/provider";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useI18n();
  return <StatusPanel tone="error" eyebrow={t("common.error")} title={t("common.loadFailed")}
    actions={<><button type="button" onClick={reset} className="btn-primary">{t("common.retry")}</button><Link href="/" className="btn-secondary">{t("common.home")}</Link></>}>
    <p>{t("common.connection")}</p>
  </StatusPanel>;
}
