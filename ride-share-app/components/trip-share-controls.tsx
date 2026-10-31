"use client";

import { useI18n } from "@/lib/i18n/provider";
import { intlLocale } from "@/lib/i18n/config";
import { useState, useTransition } from "react";
import { createTripShare, revokeTripShare } from "@/lib/sharing/actions";
import type { OwnedTripShare } from "@/lib/sharing/types";

export function TripShareControls({ bookingId, expiresAt, expired }: { bookingId: string; expiresAt: string; expired: boolean }) {
  const { locale, t, notice } = useI18n();
  const [share, setShare] = useState<OwnedTripShare | null>(null);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function create() {
    setMessage("");
    setError("");
    startTransition(async () => {
      try {
        const result = await createTripShare(bookingId);
        if (!result.ok) { setError(result.error); return; }
        setShare(result.share);
        setUrl(`${window.location.origin}/trip/${result.share.token}`);
        setMessage("share.ready");
      } catch { setError("share.createFailed"); }
    });
  }

  async function copy() {
    setMessage("");
    setError("");
    try {
      await navigator.clipboard.writeText(url);
      setMessage("share.copied");
    } catch { setError("share.copyFailed"); }
  }

  function revoke() {
    if (!share) return;
    setMessage("");
    setError("");
    startTransition(async () => {
      try {
        const result = await revokeTripShare(bookingId, share.id);
        if (!result.ok) { setError(result.error); return; }
        setShare(null);
        setUrl("");
        setMessage("share.revoked");
      } catch { setError("share.revokeFailed"); }
    });
  }

  return <section className="mt-4" aria-label={t("share.label")}>
    <h2 className="font-semibold">{t("share.title")}</h2>
    <p className="mt-3 text-sm text-slate-600">{t("share.privacy")}</p>
    <p className="mt-1 text-sm text-slate-600">{expired ? t("share.expired") : t("share.expires", { date: new Date(expiresAt).toLocaleString(intlLocale(locale), { timeZone: "Europe/Skopje" }) })}</p>
    <div className="mt-3 flex flex-wrap gap-3">
      {!share ? <button type="button" disabled={pending || expired} onClick={create} className="btn-primary disabled:opacity-50">{pending ? t("share.creating") : t("share.create")}</button> : <>
        <button type="button" disabled={pending || expired} onClick={copy} className="btn-primary disabled:opacity-50">{t("share.copy")}</button>
        <button type="button" disabled={pending} onClick={revoke} className="min-h-11 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-50">{pending ? t("share.revoking") : t("share.revoke")}</button>
      </>}
    </div>
    {url ? <label className="mt-3 block text-sm">{t("share.link")}<input aria-label={t("share.link")} readOnly value={url} onFocus={event => event.target.select()} className="mt-1 block min-h-11 w-full min-w-0 rounded-lg border border-slate-300 p-2 text-sm" /></label> : null}
    {message ? <p role="status" className="mt-2 text-sm text-emerald-800">{notice(message, "share.ready")}</p> : null}
    {error ? <p role="alert" className="mt-2 text-sm text-red-700">{notice(error, "share.createFailed")}</p> : null}
  </section>;
}
