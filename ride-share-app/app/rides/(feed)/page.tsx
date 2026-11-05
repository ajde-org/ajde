import { getI18n } from "@/lib/i18n/server";
import { Suspense } from "react";
import { localizedName } from "@/lib/i18n/locations";

import { NaturalLanguageSearch } from "@/components/discovery/natural-language-search";
import { RideFilters } from "@/components/discovery/ride-filters";
import { LocalizedPageHeading } from "@/components/localized-page-heading";
import { EmptyRideFeed, RideFeedResultsHeading, RideResults } from "@/components/discovery/ride-results";
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
  const { t } = await getI18n();
  const rawParams = await searchParams;
  return <div className="text-slate-950">
    <main id="main-content" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
      {firstParam(rawParams.welcome) === "1" ? <p role="status" className="mb-6 whitespace-pre-line rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{t("discovery.welcome")}</p> : null}
      <LocalizedPageHeading title="discovery.title" intro="discovery.intro" />
      <Suspense fallback={<p role="status" className="mt-8 text-sm text-slate-500">{t("loading.rides")}</p>}>
        <RideFeedContent rawParams={rawParams} />
      </Suspense>
    </main>
  </div>;
}

async function RideFeedContent({ rawParams }: { rawParams: Record<string, string | string[] | undefined> }) {
  const { locale, t } = await getI18n();
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
  const genderUnavailable = filters.sameGenderOnly && !passengerGender;
  const cityNames = new Map((cities ?? []).map((city) => [city.id, localizedName(city, locale)]));
  // An AI search already shows its interpretation above, so its filters start collapsed and
  // can be expanded to refine. Manually applied or hand-entered filters stay visible.
  const hasFilters = Boolean(filters.origin || filters.destination || filters.date || filters.dateTo || filters.timeAfter || filters.timeBefore || filters.sameGenderOnly);
  const filtersOpen = firstParam(rawParams.manual) === "1" || (hasFilters && firstParam(rawParams.search) !== "1");

  return (
    <>
        <NaturalLanguageSearch key={naturalQuery} currentParams={currentParams} initialQuery={naturalQuery} />
        {interpretation ? (
          <SearchInterpretation
            result={interpretation}
            cityNames={cityNames}
            manualOverride={firstParam(rawParams.manual) === "1"}
          />
        ) : null}

        <RideFilters cities={cities ?? []} filters={filters} filtersOpen={filtersOpen}
          currentParams={currentParams} naturalQuery={naturalQuery}
          searched={firstParam(rawParams.search) === "1"}
          interpretationParam={firstParam(rawParams.interpretation)}
          genderUnavailable={genderUnavailable} />

        <Suspense fallback={<p role="status" className="mt-8 text-sm text-slate-500">{t("loading.rides")}</p>}>
          <RideFeedResults filters={filters} passengerGender={passengerGender} interpretation={interpretation} />
        </Suspense>
    </>
  );
}

async function RideFeedResults({ filters, passengerGender, interpretation }: {
  filters: ReturnType<typeof parseRideFilters>;
  passengerGender: ReturnType<typeof usableDiscoveryGender>;
  interpretation: ReturnType<typeof decodeSearchInterpretation>;
}) {
  const rides = await getRideFeed(filters, { passengerGender });
  return <>
    <RideFeedResultsHeading count={rides.length} />
    {rides.length ? (
      <RideResults rides={rides} searchContext={interpretation} />
    ) : (
      <EmptyRideFeed />
    )}
  </>;
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
