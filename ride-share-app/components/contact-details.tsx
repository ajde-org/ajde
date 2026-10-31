"use client";

import { useI18n } from "@/lib/i18n/provider";
import { phoneSchema, safeSocialUrl } from "@/lib/profiles/contact";

export function ContactDetails({ phone, socialUrl, instagram, facebook }: {
  phone?: string | null; socialUrl?: string | null; instagram?: string | null; facebook?: string | null;
}) {
  const { t } = useI18n();
  const number = phoneSchema.safeParse(phone);
  const links = [...new Set([socialUrl, instagram, facebook].map(safeSocialUrl).filter((url): url is string => !!url))];
  if (!number.success && !links.length) return <p className="mt-2 text-xs text-slate-500">{t("contact.missing")}</p>;
  return <div className="mt-2 flex flex-col items-start gap-1 text-sm">
    {number.success ? <a href={`tel:${number.data}`} className="break-all font-medium text-brand-700 underline-offset-4 hover:underline">{number.data}</a> : null}
    {links.map(url => <a key={url} href={url} target="_blank" rel="noopener noreferrer" className="break-all text-brand-700 underline-offset-4 hover:underline" aria-label={t("contact.social", { host: new URL(url).hostname })}>{new URL(url).hostname.replace(/^www\./, "")} ↗</a>)}
  </div>;
}
