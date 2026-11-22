"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { localizedName } from "@/lib/i18n/locations";
import type { RideFilters } from "@/lib/rides/ride-filters";

export function RideFilters({ cities, filters, filtersOpen, currentParams, naturalQuery, searched, interpretationParam, genderUnavailable }: {
  cities: { id: number; name_en: string; name_mk: string }[];
  filters: RideFilters;
  filtersOpen: boolean;
  currentParams: string;
  naturalQuery: string;
  searched: boolean;
  interpretationParam?: string;
  genderUnavailable: boolean;
}) {
  const { locale, t } = useI18n();
  return <>
    <details className="filter-options mt-6 px-6 py-4" open={filtersOpen}>
      <summary>{t("discovery.filters")}</summary>
      <form key={currentParams} aria-label={t("discovery.filterLabel")} className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {naturalQuery ? <input type="hidden" name="q" value={naturalQuery} /> : null}
        {searched ? <input type="hidden" name="search" value="1" /> : null}
        {interpretationParam ? <input type="hidden" name="interpretation" value={interpretationParam} /> : null}
        <label className="text-sm font-semibold text-slate-600">{t("landing.from")}
          <select name="origin" defaultValue={filters.origin ?? ""} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-950">
            <option value="">{t("discovery.anywhere")}</option>
            {cities.map((city) => <option key={city.id} value={city.id}>{localizedName(city, locale)}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-600">{t("landing.to")}
          <select name="destination" defaultValue={filters.destination ?? ""} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-950">
            <option value="">{t("discovery.anywhere")}</option>
            {cities.map((city) => <option key={city.id} value={city.id}>{localizedName(city, locale)}</option>)}
          </select>
        </label>
        <label className="text-sm font-semibold text-slate-600">{t("discovery.fromDate")} <span className="font-normal text-slate-500">{t("discovery.optional")}</span>
          <input name="date" type="date" defaultValue={filters.date ?? ""} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-950" />
        </label>
        <label className="text-sm font-semibold text-slate-600">{t("discovery.throughDate")} <span className="font-normal text-slate-500">{t("discovery.optional")}</span>
          <input name="dateTo" type="date" defaultValue={filters.dateTo ?? ""} min={filters.date ?? undefined} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-950" />
        </label>
        <label className="text-sm font-semibold text-slate-600">{t("discovery.afterTime")} <span className="font-normal text-slate-500">{t("discovery.optional")}</span>
          <input name="timeAfter" type="time" defaultValue={filters.timeAfter ?? ""} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-950" />
        </label>
        <label className="text-sm font-semibold text-slate-600">{t("discovery.beforeTime")} <span className="font-normal text-slate-500">{t("discovery.optional")}</span>
          <input name="timeBefore" type="time" defaultValue={filters.timeBefore ?? ""} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-950" />
        </label>
        <p className="text-xs text-slate-500 sm:col-span-2 lg:col-span-3">{t("discovery.filterHelp")}</p>
        <label className="flex items-center gap-2 self-end rounded-xl px-1 py-2.5 text-sm font-semibold text-slate-600">
          <input name="sameGender" type="checkbox" value="1" defaultChecked={filters.sameGenderOnly} className="size-4 accent-emerald-700" />
          {t("discovery.sameGender")}
        </label>
        <div className="flex flex-wrap items-center justify-end gap-3 self-end sm:col-span-2"><Link href="/rides" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-slate-600 hover:text-slate-950">{t("discovery.reset")}</Link><button name="manual" value="1" className="btn-primary" type="submit">{t("discovery.apply")}</button></div>
      </form>
    </details>
    {genderUnavailable ? <p role="status" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">{t("discovery.genderUnavailable")}</p> : null}
  </>;
}
