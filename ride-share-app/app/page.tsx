import { getI18n } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { Suspense } from "react";
import { AboutSections, ScrollHint } from "@/components/landing/about-sections";
import { LandingHeroCopy } from "@/components/landing/landing-hero-copy";
import { LandingMap } from "@/components/landing/landing-map";
import { LandingSavings } from "@/components/landing/landing-savings";
import { WhereToForm } from "@/components/landing/where-to-form";
import { getPublicImpactSummary } from "@/lib/impact/queries";
import { createClient } from "@/lib/supabase/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("landing.title") };
}

async function HomepageImpact() {
  let summary: Awaited<ReturnType<typeof getPublicImpactSummary>>;
  try {
    summary = await getPublicImpactSummary();
  } catch {
    return <LandingSavings summary={null} status="unavailable" />;
  }
  return <LandingSavings summary={summary} />;
}

async function CitySearch() {
  const supabase = await createClient();
  const { data: cities } = await supabase.from("cities").select("id, name_en, name_mk").order((await getI18n()).locale === "mk" ? "name_mk" : "name_en");
  return <WhereToForm cities={cities ?? []} />;
}

export default async function Home() {
  // The hero slides up under the sticky glass navbar so the map fills the whole first screen.
  return <>
  <div className="relative -mt-[var(--header-h)] flex min-h-svh flex-col bg-[#0f1511] text-[#16201a] lg:h-svh lg:min-h-[44rem]">
    <section className="relative isolate flex flex-1 flex-col overflow-hidden rounded-b-[2rem] bg-[linear-gradient(180deg,#b9e3fb_0%,#d9f0f4_45%,#e7f6de_100%)] lg:min-h-0">
      <LandingMap />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-3/5 bg-[linear-gradient(0deg,#e7f6de_0%,rgb(231_246_222/0.85)_40%,transparent_100%)]" />

      <main id="main-content" className="relative mt-auto grid items-end gap-10 px-5 pb-10 pt-[calc(var(--header-h)+15rem)] sm:px-10 sm:pt-[calc(var(--header-h)+9rem)] lg:grid-cols-[1fr_auto] lg:pb-12 lg:pt-[calc(var(--header-h)+1.5rem)]">
        <LandingHeroCopy />
        <Suspense fallback={<WhereToForm cities={[]} loading />}>
          <CitySearch />
        </Suspense>
      </main>
    </section>

    <Suspense fallback={<LandingSavings summary={null} status="loading" />}>
      <HomepageImpact />
    </Suspense>
    <ScrollHint />
  </div>
  <AboutSections />
  </>;
}
