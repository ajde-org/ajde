"use client";

import { useId, useState, useTransition } from "react";
import { changeLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/provider";

export function LanguageSelector() {
  const { locale, t } = useI18n();
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);

  return <div className="flex min-w-0 flex-col gap-1">
    <label htmlFor={id} className="sr-only">{t("locale.label")}</label>
    <select id={id} value={locale} disabled={pending} aria-describedby={pending || failed ? `${id}-status` : undefined}
      className="min-h-11 max-w-full rounded-full border border-current/20 bg-transparent px-3 text-sm"
      onChange={(event) => {
        const next = event.target.value;
        setFailed(false);
        startTransition(async () => {
          try { setFailed(!(await changeLocale(next)).ok); }
          catch { setFailed(true); }
        });
      }}>
      <option value="en" lang="en">English</option>
      <option value="mk" lang="mk">Македонски</option>
    </select>
    <span id={`${id}-status`} role="status" className={failed ? "max-w-48 text-xs text-red-700" : "sr-only"}>
      {pending ? t("locale.saving") : failed ? t("locale.failed") : ""}
    </span>
  </div>;
}
