import { getI18n } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n/config";
import facebookGroups from "@/public/landing/facebook-groups.png";
import postBitolaSchedule from "@/public/landing/post-bitola-schedule.png";
import postBitola from "@/public/landing/post-bitola.png";
import postKavadarci from "@/public/landing/post-kavadarci.png";
import postKocani from "@/public/landing/post-kocani.png";
import postOhrid from "@/public/landing/post-ohrid.png";
import postStrugaPrilep from "@/public/landing/post-struga-prilep.png";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./landing.module.css";
import { ScrollReveal } from "./scroll-reveal";

function Label({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return <p className={`text-sm font-semibold ${dark ? "text-[#86efac]" : "text-[#15803d]"}`}>{children}</p>;
}

function Heading({ id, children, className = "" }: { id: string; children: ReactNode; className?: string }) {
  return <h2 id={id} className={`mt-3 font-display text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold leading-[1.02] tracking-[-0.045em] ${className}`}>{children}</h2>;
}

/** Sits in the bottom-right corner of the first screen so visitors know there is more below. */
export async function ScrollHint() {
  const { t } = await getI18n();
  return <a href="#about" aria-label={t("about.scroll")} title={t("about.scroll")}
    className="absolute bottom-5 right-5 z-10 hidden size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-[#86efac] backdrop-blur-md transition-colors hover:bg-white/20 lg:grid">
    <svg className={styles.nudge} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14M6 13l6 6 6-6" /></svg>
  </a>;
}

function CarIcon() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
    <circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
  </svg>;
}

export async function AboutSections() {
  const { locale, t } = await getI18n();
  // Shown beside the groups screenshot on desktop; offsets and tilts make the stack feel hand-placed.
  const posts = [
    { src: postBitola, className: "mr-8 -rotate-1", alt: t("about.bitolaAlt") },
    { src: postOhrid, className: "ml-8 rotate-1", alt: t("about.ohridAlt") },
    { src: postKavadarci, className: "mr-4", alt: t("about.kavadarciAlt") },
    { src: postStrugaPrilep, className: "ml-4 rotate-1", alt: t("about.strugaAlt") },
    { src: postKocani, className: "ml-12 -rotate-1", alt: t("about.kocaniAlt") },
    { src: postBitolaSchedule, className: "mr-2 rotate-1", alt: t("about.scheduleAlt") },
  ];

  // Worked example shown in the savings section; the arithmetic mirrors lib/rides/ride-estimate.ts.
  const example = { km: 170, consumption: 6, passengers: 3, co2PerLitre: 2.31 };
  const exampleLitres = (example.km * example.consumption) / 100;
  const exampleCo2 = exampleLitres * example.co2PerLitre;
  const one = new Intl.NumberFormat(intlLocale(locale), { maximumFractionDigits: 1, minimumFractionDigits: 1 });

  const problems = [
    { title: t("about.scattered"), body: t("about.scatteredBody") },
    { title: t("about.price"), body: t("about.priceBody") },
    { title: t("about.empty"), body: t("about.emptyBody") },
  ];

  const steps = [
    { title: t("about.post"), body: t("about.postBody") },
    { title: t("about.find"), body: t("about.findBody") },
    { title: t("about.ride"), body: t("about.rideBody") },
  ];

  const reasons = [
    { value: t("about.oneCar"), label: t("about.insteadFour"), body: t("about.oneCarBody") },
    { value: "¼", label: t("about.emissions"), body: t("about.emissionsBody") },
    { value: t("about.real"), label: t("about.data"), body: t("about.dataBody") },
  ];

  return <ScrollReveal className="bg-[#0f1511]">
    <section id="about" aria-labelledby="vision-heading" className={`${styles.reveal} mx-auto max-w-5xl px-5 pb-24 pt-20 text-center text-white sm:px-10 lg:pb-32 lg:pt-28`}>
      <Label dark>{t("about.vision")}</Label>
      <h2 id="vision-heading" className="mx-auto mt-4 max-w-4xl font-display text-[clamp(2.3rem,5.4vw,4.4rem)] font-extrabold leading-[1] tracking-[-0.05em]">
        {t("about.visionHeading")}
      </h2>
      <p className="mx-auto mt-7 max-w-2xl text-lg leading-relaxed text-[#a3b8aa]">{t("about.visionBody")}</p>
    </section>

    <div className="rounded-[2rem] bg-[#f4f7f3] text-[#16201a]">
      <section aria-labelledby="problem-heading" className={`${styles.reveal} mx-auto max-w-6xl px-5 pb-20 pt-20 sm:px-10 lg:pt-28`}>
        <Label>{t("about.problem")}</Label>
        <Heading id="problem-heading" className="max-w-3xl">{t("about.problemHeading")}</Heading>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {problems.map((item) => <li key={item.title} className="rounded-3xl border border-[#16201a]/6 bg-white p-7 shadow-sm">
            <h3 className="font-display text-xl font-bold tracking-[-0.02em]">{item.title}</h3>
            <p className="mt-3 text-[#4f5b4f]">{item.body}</p>
          </li>)}
        </ul>
      </section>

      <section aria-labelledby="familiar-heading" className={`${styles.reveal} mx-auto max-w-6xl px-5 py-20 sm:px-10`}>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start lg:gap-16">
          <div>
            <Label>{t("about.familiar")}</Label>
            <Heading id="familiar-heading">{t("about.familiarHeading")}</Heading>
          </div>
          <div>
            <p className="text-[#4f5b4f]">{t("about.familiarBody")}</p>
            <ul className="mt-6 grid grid-cols-3 gap-4 border-t border-[#16201a]/10 pt-5" style={{ fontVariantNumeric: "tabular-nums" }}>
              {[["100K+", t("about.members")], ["200+", t("about.postsDaily")], ["6", t("about.groups")]].map(([value, label]) => <li key={label}>
                <p className="font-display text-3xl font-extrabold tracking-[-0.04em]">{value}</p>
                <p className="mt-1 text-sm text-[#647063]">{label}</p>
              </li>)}
            </ul>
          </div>
        </div>
        <div className="mt-12 grid items-start gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
          <figure className="rounded-[1.75rem] bg-[#242526] p-3 shadow-xl sm:p-4">
            <Image src={facebookGroups} alt={t("about.groupsAlt")} sizes="(min-width: 1024px) 36rem, 100vw" className="h-auto w-full rounded-2xl" />
          </figure>
          <figure className="hidden lg:block">
            <ul aria-label={t("about.posts")} className="grid gap-4">
              {posts.map((post) => <li key={post.alt} className={`overflow-hidden rounded-2xl bg-[#252728] px-3 py-2 shadow-lg ring-1 ring-black/5 ${post.className}`}>
                <Image src={post.src} alt={post.alt} sizes="26rem" className="h-auto w-full" />
              </li>)}
            </ul>
            <figcaption className="mt-5 text-center text-sm text-[#647063]">{t("about.realPosts")}</figcaption>
          </figure>
        </div>
      </section>

      <section aria-labelledby="how-heading" className={`${styles.reveal} mx-auto max-w-6xl px-5 py-20 sm:px-10`}>
        <Label>{t("about.how")}</Label>
        <Heading id="how-heading" className="max-w-3xl">{t("about.howHeading")}</Heading>
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map((step, index) => <li key={step.title} className="relative flex gap-5 md:flex-col md:gap-0">
            {index < steps.length - 1 ? <span aria-hidden="true" className="absolute left-6 top-14 h-[calc(100%_-_1.5rem)] border-l-2 border-dashed border-[#16a34a]/35 md:left-16 md:top-6 md:h-0 md:w-[calc(100%_-_3rem)] md:border-l-0 md:border-t-2" /> : null}
            <span aria-hidden="true" className={`relative grid size-12 shrink-0 place-items-center rounded-full border-2 border-[#16a34a] ${index === steps.length - 1 ? "bg-[#16a34a] text-white" : "bg-white text-[#15803d]"}`}>
              <CarIcon />
            </span>
            <div className="min-w-0 md:mt-6">
              <p className="text-sm font-semibold text-[#15803d]">{t("about.step", { count: index + 1 })}</p>
              <h3 className="mt-1 font-display text-2xl font-bold tracking-[-0.03em]">{step.title}</h3>
              <p className="mt-3 text-[#4f5b4f]">{step.body}</p>
            </div>
          </li>)}
        </ol>
      </section>

      <section aria-labelledby="savings-heading" className={`${styles.reveal} mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 sm:px-10 lg:grid-cols-[1fr_1.05fr] lg:gap-16`}>
        <div>
          <Label>{t("about.calculation")}</Label>
          <Heading id="savings-heading">{t("about.calculationHeading")}</Heading>
          <p className="mt-6 max-w-md text-[#4f5b4f]">{t("about.calculationBody")}</p>
          <dl className="mt-8 space-y-5">
            {[
              [t("about.fuel"), t("about.fuelFormula")],
              ["CO₂", t("about.co2Formula")],
              [t("about.saved"), t("about.savedFormula")],
            ].map(([term, formula]) => <div key={term} className="flex gap-5 border-b border-[#16201a]/10 pb-5">
              <dt className="w-16 shrink-0 font-semibold">{term}</dt>
              <dd className="text-[#4f5b4f]">{formula}</dd>
            </div>)}
          </dl>
          <p className="mt-6 max-w-md text-sm text-[#647063]">{t("about.completedOnly")}</p>
        </div>

        <figure className="rounded-[1.75rem] bg-[#0f1511] p-8 text-white shadow-xl sm:p-10">
          <figcaption className="text-sm font-semibold text-[#86efac]">{t("about.example")}</figcaption>
          <p className="mt-3 font-display text-3xl font-extrabold tracking-[-0.04em]">{t("about.route")}</p>
          <p className="mt-2 text-[#a3b8aa]">{t("about.exampleDetails", { distance: example.km, consumption: example.consumption, passengers: example.passengers })}</p>
          <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-white/10" style={{ fontVariantNumeric: "tabular-nums" }}>
            {[
              [t("about.tripFuel"), `${one.format(exampleLitres)} L`],
              [t("about.tripCo2"), `${one.format(exampleCo2)} kg`],
              [t("about.savedFuel"), `${one.format(exampleLitres * example.passengers)} L`],
              [t("about.savedCo2"), `${one.format(exampleCo2 * example.passengers)} kg`],
            ].map(([label, value], index) => <div key={label} className="bg-[#16201a] p-5">
              <dt className="text-sm text-[#a3b8aa]">{label}</dt>
              <dd className={`mt-1 font-display text-2xl font-extrabold tracking-[-0.03em] ${index > 1 ? "text-[#86efac]" : ""}`}>{value}</dd>
            </div>)}
          </dl>
          <p className="mt-6 text-sm text-[#a3b8aa]">{t("about.costBody")}</p>
        </figure>
      </section>

      <section aria-labelledby="green-heading" className={`${styles.reveal} mx-auto max-w-6xl px-5 pb-28 pt-20 sm:px-10`}>
        <Label>{t("about.whyGreen")}</Label>
        <Heading id="green-heading" className="max-w-3xl">{t("about.greenHeading")}</Heading>
        <ul className="mt-12 grid gap-4 md:grid-cols-3">
          {reasons.map((item) => <li key={item.label} className="rounded-3xl bg-[#e3f1df] p-7">
            <p className="font-display text-5xl font-extrabold tracking-[-0.05em] text-[#166534]">{item.value}</p>
            <p className="mt-1 font-semibold">{item.label}</p>
            <p className="mt-3 text-[#4f5b4f]">{item.body}</p>
          </li>)}
        </ul>
      </section>
    </div>

    <section aria-labelledby="cta-heading" className={`${styles.reveal} mx-auto max-w-4xl px-5 py-24 text-center text-white sm:px-10 lg:py-32`}>
      <h2 id="cta-heading" className="font-display text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[1] tracking-[-0.05em]">{t("about.cta")}</h2>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/rides" className="inline-flex min-h-[52px] items-center rounded-[.9rem] bg-white px-6 font-semibold text-[#16201a] hover:bg-[#e7f6de]">{t("nav.find")}</Link>
        <Link href="/rides/new" className="inline-flex min-h-[52px] items-center rounded-[.9rem] border border-white/25 px-6 font-semibold text-white hover:bg-white/10">{t("nav.offer")}</Link>
      </div>
    </section>

    <div className="mx-auto max-w-6xl px-5 pb-8 sm:px-10">
      <p className="border-t border-white/10 pt-6 text-xs leading-relaxed text-[#a3b8aa]">{t("about.methodology")}</p>
    </div>
  </ScrollReveal>;
}
