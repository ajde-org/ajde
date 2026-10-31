"use client";

import { useI18n } from "@/lib/i18n/provider";
import type { SubmittedRating } from "@/lib/ratings/types";
import { StarDisplay } from "./star-rating";

export function SubmittedRatingDetail({ rating }: { rating: SubmittedRating }) {
  const { t } = useI18n();
  return <div className="rounded-2xl bg-brand-50 p-5 text-sm text-slate-900">
    <p className="flex flex-wrap items-center gap-2 font-medium">{t("rating.yours")}<StarDisplay score={rating.score} /></p>
    {rating.note ? <><p className="mt-2 font-medium">{t("rating.private")}</p><p className="mt-1 whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{rating.note}</p></> : null}
    <p className="mt-3 text-slate-600">{t("rating.immutable")}</p>
  </div>;
}
