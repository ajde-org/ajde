import { getI18n } from "@/lib/i18n/server";
import { plural, formatNumber } from "@/lib/i18n/format";
import { localizedName } from "@/lib/i18n/locations";
import Link from "next/link";

import { NaturalLanguageSearch } from "@/components/discovery/natural-language-search";
import { RideResults } from "@/components/discovery/ride-results";
import { SearchInterpretation } from "@/components/discovery/search-interpretation";
import { requireCompleteProfile } from "@/lib/auth/session";
import { usableDiscoveryGender } from "@/lib/rides/gender-discovery";
import { decodeSearchInterpretation, parseRideFilters } from "@/lib/rides/ride-filters";
import { getRideFeed } from "@/lib/rides/ride-view";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata() { const { t } = await getI18n(); return { title: t("discovery.title") }; }

type RideFeedPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RideFeedPage({ searchParams }: RideFeedPageProps) {
  const { locale, t } = await getI18n();
  const rawParams = await searchParams;
  const returnParams = serializeParams(rawParams);
  const user = await requireCompleteProfile(returnParams ? `/rides?${returnParams}` : "/rides");
  const filters = parseRideFilters(rawParams);
  const interpretation = decodeSearchInterpretation(rawParams.interpretation);
  const naturalQuery = firstParam(rawParams.q)?.slice(0, 300) ?? "";
  const currentParams = serializeParams(rawParams);
  const supabase = await createClient();
  const [{ data: cities, error }, { data: passengerProfile, error: profileError }] = await Promise.all([
    supabase.from("cities").select("id, name_en, name_mk").order(locale === "mk" ? "name_mk" : "name_en"),
    supabase.from("profiles").select("gender").eq("id", user.id).maybeSingle(),
  ]);
  if (error || profileError) throw new Error("Unable to load discovery filters.");

  const passengerGender = usableDiscoveryGender(passengerProfile?.gender);
  const rides = await getRideFeed(filters, { passengerGender });
  const genderUnavailable = filters.sameGenderOnly && !passengerGender;
  const cityNames = new Map((cities ?? []).map((city) => [city.id, localizedName(city, locale)]));
  // An AI search already shows its interpretation above, so its filters start collapsed and
  // can be expanded to refine. Manually applied or hand-entered filters stay visible.
  const hasFilters = Boolean(filters.origin || filters.destination || filters.date || filters.dateTo || filters.timeAfter || filters.timeBefore || filters.sameGenderOnly);
  const filtersOpen = firstParam(rawParams.manual) === "1" || (hasFilters && firstParam(rawParams.search) !== "1");

  return (
    <div className="text-slate-950">
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
        {firstParam(rawParams.welcome) === "1" ? <p role="status" className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{t("discovery.welcome")}</p> : null}
        <div>
          <h1 className="page-heading">{t("discovery.title")}</h1>
          <p className="mt-4 text-slate-500">{t("discovery.intro")}</p>
        </div>

        <NaturalLanguageSearch key={naturalQuery} currentParams={currentParams} initialQuery={naturalQuery} />
        {interpretation ? (
          <SearchInterpretation
            result={interpretation}
            cityNames={cityNames}
            manualOverride={firstParam(rawParams.manual) === "1"}
          />
        ) : null}

        <details className="filter-options mt-6 px-6 py-4" open={filtersOpen}>
        <summary>{t("discovery.filters")}</summary>
        <form key={currentParams} aria-label={t("discovery.filterLabel")} className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {naturalQuery ? <input type="hidden" name="q" value={naturalQuery} /> : null}
          {firstParam(rawParams.search) === "1" ? <input type="hidden" name="search" value="1" /> : null}
          {firstParam(rawParams.interpretation) ? (
            <input type="hidden" name="interpretation" value={firstParam(rawParams.interpretation)} />
          ) : null}
          <label className="text-sm font-semibold text-slate-600">{t("landing.from")}
            <select name="origin" defaultValue={filters.origin ?? ""} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-950">
              <option value="">{t("discovery.anywhere")}</option>
              {cities?.map((city) => <option key={city.id} value={city.id}>{localizedName(city, locale)}</option>)}
            </select>
          </label>
          <label className="text-sm font-semibold text-slate-600">{t("landing.to")}
            <select name="destination" defaultValue={filters.destination ?? ""} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 font-normal text-slate-950">
              <option value="">{t("discovery.anywhere")}</option>
              {cities?.map((city) => <option key={city.id} value={city.id}>{localizedName(city, locale)}</option>)}
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
            <input
              name="sameGender"
              type="checkbox"
              value="1"
              defaultChecked={filters.sameGenderOnly}
              className="size-4 accent-emerald-700"
            />
            {t("discovery.sameGender")}
          </label>
          <div className="flex flex-wrap items-center justify-end gap-3 self-end sm:col-span-2"><Link href="/rides" className="inline-flex min-h-11 items-center px-3 text-sm font-semibold text-slate-600 hover:text-slate-950">{t("discovery.reset")}</Link><button name="manual" value="1" className="btn-primary" type="submit">{t("discovery.apply")}</button></div>
        </form>
        </details>

        {genderUnavailable ? (
          <p role="status" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            {t("discovery.genderUnavailable")}
          </p>
        ) : null}

        <div className="mt-8 flex items-center justify-between">
          <div><h2 className="font-display text-2xl font-bold tracking-tight">{t("discovery.next")}</h2><p className="mt-2 text-[.8125rem] text-slate-500">{t(`discovery.matches.${plural(locale, rides.length)}`, { count: formatNumber(locale, rides.length) })}</p></div>
        </div>
        {rides.length ? (
          <RideResults rides={rides} searchContext={interpretation} />
        ) : (
          <div className="mt-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
            <h2 className="font-display text-2xl font-bold tracking-[-.03em]">{t("discovery.empty")}</h2>
            <p className="mt-2 text-slate-600">{t("discovery.emptyBody")}</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3"><Link href="/rides" className="btn-primary">{t("discovery.all")}</Link></div>
          </div>
        )}
      </main>
    </div>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function serializeParams(params: Record<string, string | string[] | undefined>) {
  const result = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) value.forEach((item) => result.append(key, item));
    else if (value !== undefined) result.set(key, value);
  }
  return result.toString();
}
