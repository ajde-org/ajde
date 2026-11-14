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
  const [blocked, setBlocked] = useState(false);
  useEffect(() => {
    if (!blocked) return;
    const timer = window.setTimeout(() => setBlocked(false), Math.max(0, eligibleAt.current - Date.now()));
    return () => window.clearTimeout(timer);
  }, [blocked, retryAt]);
  return {
    retryAt, blocked,
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
export function AiRetryNotice({ recovery }: { recovery: Pick<ReturnType<typeof useAiRecovery>, "retryAt" | "blocked"> }) {
  const { locale, t } = useI18n();
  if (!recovery.retryAt || !recovery.blocked) return null;
  return <p role="status" className="mt-3 break-words rounded-xl bg-amber-50 p-3 text-sm leading-relaxed text-amber-950">
    {t("ai.retryAt", { time: formatDateTime(locale, recovery.retryAt) })}
  </p>;
}
