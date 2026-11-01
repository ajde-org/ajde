import { getProfileRatingSummary } from "@/lib/ratings/queries";
import { getI18n } from "@/lib/i18n/server";
import { formatNumber, plural } from "@/lib/i18n/format";
import type { RatingSummary } from "@/lib/ratings/types";
import { StarDisplay } from "./star-rating";

export async function ProfileRatingSummary({ profileId }: { profileId: string }) {
  return <RatingSummaryView summary={await getProfileRatingSummary(profileId)} />;
}

export async function RatingSummaryView({ summary }: { summary: RatingSummary | null }) {
  const { locale, t } = await getI18n();
  return <section className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-6" aria-labelledby="rating-heading">
    <h2 id="rating-heading" className="font-display text-lg font-bold tracking-tight text-slate-950">{t("rating.title")}</h2>
    {!summary ? <p className="mt-3 text-sm leading-6 text-slate-600">{t("rating.unavailable")}</p>
      : summary.count === 0 ? <div className="mt-4">
        <StarDisplay score={0} size={22} label={t("rating.none")} />
        <p className="mt-3 font-semibold text-slate-900">{t("rating.none")}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{t("rating.afterCompleted")}</p>
      </div>
        : <div className="mt-4">
          <p className="flex items-baseline gap-2"><span className="font-display text-5xl font-extrabold leading-none tracking-[-.045em] text-slate-950">{formatNumber(locale, summary.average!, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</span><span className="text-sm text-slate-500">/ 5</span></p>
          <div className="mt-4">
            <StarDisplay score={summary.average!} size={22} label={t("rating.stars", { score: formatNumber(locale, summary.average!, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) })} />
            <p className="mt-3 text-sm leading-6 text-slate-600">{t(`rating.based.${plural(locale, summary.count)}`, { count: formatNumber(locale, summary.count) })}</p>
          </div>
        </div>}
  </section>;
}
