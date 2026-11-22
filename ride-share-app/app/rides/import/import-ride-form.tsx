"use client";

import { translateDraftWarning } from "@/lib/i18n/draft-warning";
import { useI18n } from "@/lib/i18n/provider";
import { formatMoney, formatNumber } from "@/lib/i18n/format";
import Link from "next/link";
import { useState, type FormEvent } from "react";

import { parsedRidePostSchema, type ParsedRidePost } from "@/lib/ai/parsed-ride-post";
import { rideCheckMetadataSchema, type RideCheckMetadata } from "@/lib/ai/ride-check-contract";
import { formatDeparture } from "@/lib/rides/ride-presentation";
import { RideCheckSummary } from "./ride-check-summary";
import { ScreenshotImport } from "./screenshot-import";
import { isFreeRide } from "@/lib/rides/ride-price";

type ParseResponse = {
  importId: string;
  parsed: ParsedRidePost;
  check?: RideCheckMetadata;
};

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

export function ImportRideForm({ cities, pipelineEnabled = false }: { cities: { id: number; name_en: string; name_mk?: string }[]; pipelineEnabled?: boolean }) {
  const { t, notice } = useI18n();
  const [text, setText] = useState("");
  const [mode, setMode] = useState<"facebook" | "viber">("viber");
  const [screenshotText, setScreenshotText] = useState("");
  const [result, setResult] = useState<ParseResponse | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [readingScreenshot, setReadingScreenshot] = useState(false);
  const screenshotMode = pipelineEnabled && mode === "facebook";
  const postText = screenshotMode ? screenshotText : text;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || readingScreenshot || postText.trim().length < 10) return;
    setPending(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: postText, sourceHint: screenshotMode ? "facebook" : "viber" }),
      });
      const payload: unknown = await response.json();

      if (!response.ok) {
        setError("import.parseFailed");
        return;
      }

      const parsedResponse = parsedRidePostSchema.safeParse(
        typeof payload === "object" && payload !== null && "parsed" in payload
          ? payload.parsed
          : null,
      );
      const importId =
        typeof payload === "object" &&
        payload !== null &&
        "importId" in payload &&
        typeof payload.importId === "string"
          ? payload.importId
          : null;

      if (!parsedResponse.success || !importId) {
        setError("import.invalidDraft");
        return;
      }

      const check = rideCheckMetadataSchema.safeParse(
        typeof payload === "object" && payload !== null && "check" in payload ? payload.check : undefined,
      );
      setResult({ importId, parsed: parsedResponse.data, ...(check.success ? { check: check.data } : {}) });
    } catch {
      setError("import.offline");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-7">
      <form className="space-y-5" onSubmit={submit} aria-busy={pending || readingScreenshot}>
        {pipelineEnabled ? <div role="group" aria-label={t("import.method")} className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
          {(["facebook", "viber"] as const).map(method => <button key={method} type="button"
            aria-pressed={mode === method} disabled={pending || readingScreenshot}
            onClick={() => { setMode(method); setResult(null); setError(""); }}
            className={`rounded-lg px-3 py-3 text-sm font-semibold transition disabled:opacity-60 ${mode === method ? "bg-white text-slate-950 shadow-sm" : "text-slate-600 hover:text-slate-900"}`}>
            {method === "facebook" ? t("import.facebook") : t("import.viber")}
          </button>)}
        </div> : null}
        {pipelineEnabled ? <div hidden={!screenshotMode}>
          <ScreenshotImport disabled={pending} onBusyChange={setReadingScreenshot}
            onClearSelection={() => { setScreenshotText(""); setResult(null); setError(""); }}
            onSelect={post => { setScreenshotText(post.text); setResult(null); setError(""); }} />
        </div> : null}
        {!screenshotMode ? <label className="block text-sm font-medium text-slate-700">
          {t("import.text")}<textarea
            aria-label={t("import.text")}
            className={`${inputClass} min-h-56 resize-y text-sm leading-relaxed disabled:opacity-60`}
            maxLength={5_000}
            minLength={10}
            disabled={pending}
            onChange={(event) => { setText(event.target.value); setResult(null); setError(""); }}
            placeholder={t("import.placeholder")}
            required
            value={text}
          />
          <span className="mt-1 block text-right text-xs text-slate-500">{text.length}/5000</span>
        </label> : null}
        <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[.8125rem] text-slate-500">
            {t("import.noPost")}{" "}<Link href="/rides/new" className="font-semibold text-brand-700 hover:underline">{t("import.manual")}</Link>
          </p>
          <button
            className="btn-primary disabled:opacity-50"
            disabled={pending || readingScreenshot || postText.trim().length < 10}
            type="submit"
          >
            {pending ? t("import.parsing") : t("import.reviewDraft")}
          </button>
        </div>
      </form>

      {error ? (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900">
          {notice(error, "import.parseFailed")}
          <Link href="/rides/new" className="mt-2 block font-semibold underline">{t("import.enterManually")}</Link>
        </p>
      ) : null}

      {result ? <ParsedReview result={result} cities={cities} pipelineEnabled={pipelineEnabled} /> : null}
    </div>
  );
}

function ParsedReview({ result, cities, pipelineEnabled }: { result: ParseResponse; cities: { id: number; name_en: string; name_mk?: string }[]; pipelineEnabled: boolean }) {
  const { locale, t } = useI18n();
  const cityName = (id: number | null) => { const city = cities.find(city => city.id === id); return locale === "mk" ? city?.name_mk ?? city?.name_en : city?.name_en; };
  const { parsed } = result;
  const fields = [
    [t("import.classification"), t(`import.kind.${parsed.classification}`)],
    [t("import.origin"), cityName(parsed.draft.origin.cityId) ?? parsed.draft.origin.rawText ?? t("import.needsReview")],
    [t("import.destination"), cityName(parsed.draft.destination.cityId) ?? parsed.draft.destination.rawText ?? t("import.needsReview")],
    [t("import.departure"), parsed.draft.departureAt ? formatDeparture(parsed.draft.departureAt, locale) : t("import.needsReview")],
    [t("import.seats"), parsed.draft.seatsTotal ?? t("import.needsReview")],
    [t("import.price"), parsed.draft.pricePerSeatMkd !== null ? isFreeRide(parsed.draft.pricePerSeatMkd) ? t("ride.free") : formatMoney(locale, parsed.draft.pricePerSeatMkd) : t("import.priceNotStated")],
  ];

  return (
    <section className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-emerald-950">{t("import.review")}</h2>
          <p className="mt-1 text-sm text-emerald-900/75">
            {t("import.confidence", { percent: formatNumber(locale, Math.round((parsed.draft.confidence ?? 0) * 100)) })}
          </p>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase text-emerald-800">
          {t(`import.language.${parsed.sourceLanguage}`)}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 sm:grid-cols-2">
        {fields.map(([label, value]) => (
          <div className="rounded-xl bg-white p-3" key={label}>
            <dt className="text-xs font-medium text-slate-500">{label}</dt>
            <dd className="mt-1 font-semibold text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>

      {parsed.draft.warnings.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm text-amber-900">
          {parsed.draft.warnings.map((warning, index) => (
            <li className="rounded-lg bg-amber-100 px-3 py-2" key={`${warning.code}-${index}`}>
              {translateDraftWarning(warning, locale, t)}
            </li>
          ))}
        </ul>
      ) : null}

      {pipelineEnabled && result.check ? <RideCheckSummary check={result.check} cities={cities} /> : null}

      {parsed.classification === "request" ? (
        <p className="mt-4 rounded-lg bg-amber-100 px-3 py-2 text-sm text-amber-950">
          {t("import.requestWarning")}</p>
      ) : null}

      <Link
        className="mt-5 inline-flex btn-primary"
        href={`/rides/new?import=${result.importId}`}
      >
        {t("import.continue")}</Link>
    </section>
  );
}
