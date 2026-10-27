"use client";
import { StatusPanel } from "@/components/status-panel";
import { useI18n } from "@/lib/i18n/provider";

export default function RoomError({ reset }: { reset: () => void }) {
  const { t } = useI18n();
  return <StatusPanel tone="error" eyebrow={t("chat.room")} title={t("chat.loadFailed")} actions={<button type="button" onClick={reset} className="btn-primary">{t("common.retry")}</button>}>
    <p role="alert">{t("common.connection")}</p>
  </StatusPanel>;
}
