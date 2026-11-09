"use client";

import { useI18n } from "@/lib/i18n/provider";

export function DriverNotes({ notes }: { notes: string }) {
  const { t } = useI18n();
  return <section className="mt-6">
    <h2 className="font-bold">{t("detail.notes")}</h2>
    <p className="mt-2 whitespace-pre-wrap break-words text-slate-600">{notes}</p>
  </section>;
}
