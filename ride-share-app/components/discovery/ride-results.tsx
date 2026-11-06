"use client";

import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, plural } from "@/lib/i18n/format";
import { useEffect, useState } from "react";
import Link from "next/link";

import { RideCard } from "@/components/ride-card";
import {
  matchExplanationResponseSchema,
  MAX_EXPLAINED_RIDES,
} from "@/lib/ai/explain-match-schema";
import type { SearchQueryResult } from "@/lib/ai/search-query-schema";
import type { RideView } from "@/lib/rides/ride-view";

export function RideFeedResultsHeading({ count }: { count: number }) {
  const { locale, t } = useI18n();
  return <div className="mt-8 flex items-center justify-between">
    <div><h2 className="font-display text-2xl font-bold tracking-tight">{t("discovery.next")}</h2><p className="mt-2 text-[.8125rem] text-slate-500">{t(`discovery.matches.${plural(locale, count)}`, { count: formatNumber(locale, count) })}</p></div>
  </div>;
}

export function EmptyRideFeed() {
  const { t } = useI18n();
  return <div className="mt-4 rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
    <h2 className="font-display text-2xl font-bold tracking-[-.03em]">{t("discovery.empty")}</h2>
    <p className="mt-2 text-slate-600">{t("discovery.emptyBody")}</p>
    <div className="mt-5 flex flex-wrap justify-center gap-3"><Link href="/rides" className="btn-primary">{t("discovery.all")}</Link></div>
  </div>;
}

export function RideResults({
  rides,
  searchContext,
}: {
  rides: RideView[];
  searchContext: SearchQueryResult | null;
}) {
  const { locale } = useI18n();
  const [loaded, setLoaded] = useState<{
    requestKey: string;
    explanations: Record<string, string>;
  }>({ requestKey: "", explanations: {} });
  const requestKey = JSON.stringify({
    locale,
    rideIds: rides.slice(0, MAX_EXPLAINED_RIDES).map((ride) => ride.id),
    searchContext,
  });
  const explanations = loaded.requestKey === requestKey ? loaded.explanations : {};

  useEffect(() => {
    if (!searchContext || rides.length === 0) return;

    const controller = new AbortController();
    let active = true;
    const rideIds = rides.slice(0, MAX_EXPLAINED_RIDES).map((ride) => ride.id);

    async function load() {
      try {
        const response = await fetch("/api/explain", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ rideIds, context: searchContext }),
          signal: controller.signal,
        });
        if (!response.ok) return;
        const parsed = matchExplanationResponseSchema.safeParse(await response.json());
        if (!parsed.success || !active) return;
        setLoaded({
          requestKey,
          explanations: Object.fromEntries(
            parsed.data.explanations.map((item) => [item.rideId, item.explanation]),
          ),
        });
      } catch {
        // Explanations are optional; cards remain complete without them.
      }
    }

    void load();
    return () => {
      active = false;
      controller.abort();
    };
  }, [requestKey, rides, searchContext]);

  return (
    <div className="mt-3 grid gap-4 lg:grid-cols-2">
      {rides.map((ride) => (
        <RideCard key={ride.id} ride={ride} explanation={explanations[ride.id]} />
      ))}
    </div>
  );
}
