"use client";
import { useEffect, useRef, useState } from "react";
import { aiRetryInformation } from "@/lib/ai/retry";
import { useI18n } from "@/lib/i18n/provider";
import { formatDateTime } from "@/lib/i18n/format";

/** Keeps input in its owning form and never retries automatically. */
export function useAiRecovery() {
  const busy = useRef(false);
  const eligibleAt = useRef(0);
  const [retryAt, setRetryAt] = useState<string | null>(null);
  const [fullAt, setFullAt] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    if (!blocked) return;
    const timer = window.setTimeout(() => setBlocked(false), Math.max(0, eligibleAt.current - Date.now()));
    return () => window.clearTimeout(timer);
  }, [blocked, retryAt]);
  useEffect(() => {
    if (!fullAt) return;
    const timer = window.setTimeout(() => setFullAt(null), Math.max(0, Date.parse(fullAt) - Date.now()));
    return () => window.clearTimeout(timer);
  }, [fullAt]);
  return {
    retryAt, blocked, fullAt,
    observe(response: Response) {
      const nextAt = response.headers?.get("X-AI-Next-Action-At");
      if (nextAt && Date.parse(nextAt) > Date.now()) {
        eligibleAt.current = Date.parse(nextAt);
        setRetryAt(nextAt);
        setBlocked(true);
      }
      const value = response.headers?.get("X-AI-Allowance-Full-At");
      setFullAt(value && Number.isFinite(Date.parse(value)) ? value : null);
    },
    start() {
      if (busy.current || Date.now() < eligibleAt.current) return null;
      busy.current = true;
      setRetryAt(null);
      return crypto.randomUUID();
    },
    finish() { busy.current = false; },
    accept(input: unknown) {
      const retry = aiRetryInformation(input);
      if (!retry) return false;
      eligibleAt.current = Date.now() + retry.retryAfterSeconds * 1000;
      setRetryAt(retry.retryAt); setBlocked(true);
      return true;
    },
  };
}
const skopjeDay = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Skopje", year: "numeric", month: "2-digit", day: "2-digit" });

const recoveryMessages = {
  generic: { wait: "ai.retryAt", ready: "ai.retryReady" },
  screenshot: { wait: "ai.screenshotRetryAt", ready: "ai.screenshotReady" },
  draft: { wait: "ai.draftRetryAt", ready: "ai.draftReady" },
} as const;

export function AiRetryNotice({ recovery, action = "generic" }: { action?: "generic" | "screenshot" | "draft"; recovery: Pick<ReturnType<typeof useAiRecovery>, "retryAt" | "blocked" | "fullAt"> }) {
  const { locale, t } = useI18n();
  function refillTime(value: string) {
    // Pad the displayed estimate only; the recovery timer uses server eligibility.
    const instant = new Date(Date.parse(value) + 30_000);
    const today = skopjeDay.format(new Date());
    const target = skopjeDay.format(instant);
    const time = formatDateTime(locale, instant, { hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
    if (target === today) return t("ai.timeToday", { time });
    if (Date.parse(target) - Date.parse(today) === 86_400_000) return t("ai.timeTomorrow", { time });
    return formatDateTime(locale, instant, { dateStyle: "short", timeStyle: "short" });
  }
  const messages = recoveryMessages[action];
  let message: string;
  if (recovery.retryAt && recovery.blocked) {
    message = t(messages.wait, { time: refillTime(recovery.retryAt) });
  } else if (recovery.retryAt) {
    message = t(messages.ready);
  } else if (recovery.fullAt) {
    message = t("ai.allowanceLow", { time: refillTime(recovery.fullAt) });
  } else return null;
  return <p role="status" className="mt-3 break-words rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-950">
    {message}
  </p>;
}
