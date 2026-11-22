"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { StaticMessageKey } from "@/lib/i18n/translate";

export function LocalizedPageHeading({ title, intro, introClassName = "mt-4 text-slate-500" }: {
  title: StaticMessageKey;
  intro?: StaticMessageKey;
  introClassName?: string;
}) {
  const { t } = useI18n();
  return <div>
    <h1 className="page-heading">{t(title)}</h1>
    {intro ? <p className={introClassName}>{t(intro)}</p> : null}
  </div>;
}
