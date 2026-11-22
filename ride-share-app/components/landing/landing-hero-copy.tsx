"use client";

import { useI18n } from "@/lib/i18n/provider";

export function LandingHeroCopy() {
  const { t } = useI18n();
  return <div>
    <h1 className="font-display text-[clamp(2.75rem,min(5.75vw,9vh),5.25rem)] font-extrabold leading-[0.95] tracking-[-0.055em]">
      {t("landing.quickerCheaper")} <span className="text-[var(--accent)]">{t("landing.greener")}</span><br /><span className="underline decoration-[0.07em] underline-offset-[0.12em]">{t("landing.rideHome")}</span>
    </h1>
    <p className="mt-6 max-w-lg text-lg leading-relaxed text-[#3c4a41]">{t("landing.intro")}</p>
  </div>;
}
