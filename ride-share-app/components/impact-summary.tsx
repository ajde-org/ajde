import { getI18n } from "@/lib/i18n/server";
import { formatNumber, plural } from "@/lib/i18n/format";
import { getImpactSummary, type ImpactSummary, type ImpactTotal } from "@/lib/impact/queries";



export async function ImpactCounter({ title, description, total, highlight = false }: { title: string; description: string; total: ImpactTotal; highlight?: boolean }) {
  const { locale, t } = await getI18n();
  return <div className={`surface-card flex flex-col p-6 sm:p-7 ${highlight ? "!border-brand-200 bg-brand-50" : ""}`}>
    <div className="flex items-start gap-3">
      <span aria-hidden="true" className={`grid size-9 shrink-0 place-items-center rounded-full ${highlight ? "bg-brand-600 text-white" : "bg-slate-100 text-brand-700"}`}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M20 4c-9 0-15 4-15 11 0 1.6.5 3 1.3 4.2C8 15 11 12 15 10c-3.4 2.6-6 5.9-7.3 9.6.9.3 1.8.4 2.8.4C17 20 20 14 20 4Z" /></svg>
      </span>
      <div><h3 className="font-semibold leading-tight text-slate-900">{title}</h3><p className="mt-0.5 text-sm text-slate-500">{description}</p></div>
    </div>
    <p className="mt-6 flex items-baseline gap-1.5 font-display text-slate-950">
      <span className="text-5xl font-extrabold tracking-[-.045em]" style={{ fontVariantNumeric: "tabular-nums" }}>{formatNumber(locale, total.savedCo2Kg, { maximumFractionDigits: 1 })}</span>
      <span className="text-xl font-bold text-slate-500">kg</span>
    </p>
    <p className="mt-1 text-sm font-medium text-brand-700">{t("impact.air")}</p>
    <p className="mt-6 border-t border-slate-900/8 pt-4 text-sm text-slate-500">
      {total.eligibleTrips === 0 ? t("impact.none")
        : total.includedTrips === 0 ? t("impact.noData")
        : t(`impact.counted.${plural(locale, total.eligibleTrips)}`, { included: formatNumber(locale, total.includedTrips), eligible: formatNumber(locale, total.eligibleTrips), excluded: formatNumber(locale, total.excludedTrips) })}
    </p>
  </div>;
}

export async function ImpactSummarySkeleton() {
  const { t } = await getI18n();
  return <div aria-busy="true" className="mt-14">
    <p role="status" className="sr-only">{t("impact.loading")}</p>
    <div aria-hidden="true"><div className="skeleton h-8 w-64" /><div className="skeleton mt-2 h-4 w-80 max-w-full" /><div className="mt-6 grid gap-6 sm:grid-cols-2"><div className="skeleton h-[16.75rem] rounded-3xl" /><div className="skeleton h-[16.75rem] rounded-3xl" /></div></div>
  </div>;
}

export async function ImpactSummaryPanel() {
  const { t } = await getI18n();
  let summary: ImpactSummary;
  try {
    summary = await getImpactSummary();
  } catch {
    return <section aria-labelledby="impact-heading" className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <h2 id="impact-heading" className="text-xl font-bold">{t("impact.title")}</h2>
      <p role="status" className="mt-2 text-sm text-amber-900">{t("impact.unavailable")}</p>
    </section>;
  }
  return <section aria-labelledby="impact-heading" className="mt-14">
    <h2 id="impact-heading" className="font-display text-2xl font-bold tracking-[-.03em]">{t("impact.title")}</h2>
    <p className="mt-1 text-slate-500">{t("impact.intro")}</p>
    <div className="mt-6 grid gap-6 sm:grid-cols-2">
      <ImpactCounter highlight title={t("impact.yours")} description={t("impact.passenger")} total={summary.personal} />
      <ImpactCounter title={t("impact.platform")} description={t("impact.allRides")} total={summary.platform} />
    </div>
    <details className="mt-4 text-sm text-slate-600">
      <summary className="cursor-pointer font-semibold">{t("impact.how")}</summary>
      <div className="mt-3 space-y-2">{(["impact.assumption1", "impact.assumption2", "impact.assumption3", "impact.assumption4"] as const).map(key => <p key={key}>{t(key)}</p>)}</div>
    </details>
  </section>;
}
