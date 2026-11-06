"use client";


import { useI18n } from "@/lib/i18n/provider";
import { useActionState, useId } from "react";

import { submitRating } from "@/lib/ratings/actions";
import { StarRatingInput } from "./star-rating";
import { SubmittedRatingDetail } from "./submitted-rating";

export function RatingForm({ rideId, rateeId, targetName }: { rideId: string; rateeId: string; targetName: string }) {
  const { t, notice } = useI18n();
  const id = useId();
  const [state, action, pending] = useActionState(submitRating, null);
  if (state?.status === "submitted") return <div role="status"><p className="mb-3 text-sm font-medium text-slate-700">{notice(state.message, "rating.saveFailed")}</p><SubmittedRatingDetail rating={state.rating} /></div>;
  if (state?.status === "already_rated") return <p role="status" className="text-sm text-slate-700">{notice(state.message, "rating.saveFailed")}</p>;

  return <form action={action} className="space-y-5" aria-label={t("rating.rate", { name: targetName })}>
    <input type="hidden" name="rideId" value={rideId} />
    <input type="hidden" name="rateeId" value={rateeId} />
    <fieldset disabled={pending} aria-describedby={`${id}-privacy`} className="min-w-0">
      <legend className="font-display text-xl font-bold tracking-tight">{t("rating.with", { name: targetName })}</legend>
      <div className="mt-3"><StarRatingInput name="score" label={t("rating.scoreFor", { name: targetName })} /></div>
      <label htmlFor={`${id}-note`} className="mt-5 block text-sm font-medium">{t("rating.note")}</label>
      <textarea id={`${id}-note`} name="note" maxLength={1000} rows={3} className="field mt-2 resize-y" />
      <p id={`${id}-privacy`} className="mt-3 text-sm text-slate-500">{t("rating.privacy")}</p>
    </fieldset>
    {state?.status === "error" ? <p role="alert" className="text-sm font-medium text-red-700">{notice(state.message, "rating.saveFailed")}</p> : null}
    <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60 sm:w-auto">{pending ? t("rating.saving") : t("rating.submit")}</button>
    <span role="status" className="sr-only">{pending ? t("rating.savingStatus") : ""}</span>
  </form>;
}
