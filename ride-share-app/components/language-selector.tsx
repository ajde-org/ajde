"use client";

import { useId, useLayoutEffect, useRef, useState, useTransition } from "react";
import { changeLocale } from "@/lib/i18n/actions";
import { useI18n } from "@/lib/i18n/provider";

export function LanguageSelector() {
  const { locale, t } = useI18n();
  const id = useId();
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const scrollPosition = useRef<{ x: number; y: number } | null>(null);
  const nextLocale = locale === "en" ? "mk" : "en";
  const label = t("locale.switch");

  // Cookie mutations refresh server content. Restore after the transition commits,
  // when translated content and any router scroll effects have been applied.
  useLayoutEffect(() => {
    if (pending || !scrollPosition.current) return;
    const { x, y } = scrollPosition.current;
    window.scrollTo({ left: x, top: y, behavior: "instant" });
    scrollPosition.current = null;
  }, [pending]);

  return <div className="relative flex shrink-0 items-center">
    <button type="button" disabled={pending} aria-label={label} title={label}
      aria-busy={pending} aria-describedby={pending || failed ? `${id}-status` : undefined}
      className="flex size-11 min-h-11 shrink-0 items-center justify-center rounded-full hover:bg-white/75 disabled:opacity-50"
      onClick={() => {
        scrollPosition.current = { x: window.scrollX, y: window.scrollY };
        setFailed(false);
        startTransition(async () => {
          try { setFailed(!(await changeLocale(nextLocale)).ok); }
          catch { setFailed(true); }
        });
      }}>
      <svg aria-hidden="true" viewBox="0 0 60 60" className="size-8 overflow-hidden rounded-full ring-1 ring-black/15">
        {locale === "mk" ? <>
          <path fill="#d20000" d="M0 0h60v60H0z" />
          <path fill="#ffe600" d="m0 0 30 25L60 0 35 30l25 30-30-25L0 60l25-30ZM25 0h10l-5 30Zm35 25v10l-30-5ZM35 60H25l5-30ZM0 35V25l30 5Z" />
          <circle cx="30" cy="30" r="9" fill="#ffe600" stroke="#d20000" strokeWidth="2" />
        </> : <>
          <path fill="#012169" d="M0 0h60v60H0z" />
          <path stroke="#fff" strokeWidth="12" d="m0 0 60 60M60 0 0 60" />
          <path stroke="#c8102e" strokeWidth="5" d="m0 0 60 60M60 0 0 60" />
          <path stroke="#fff" strokeWidth="20" d="M30 0v60M0 30h60" />
          <path stroke="#c8102e" strokeWidth="12" d="M30 0v60M0 30h60" />
        </>}
      </svg>
    </button>
    <span id={`${id}-status`} role="status" className={failed ? "absolute right-0 top-full z-10 mt-2 w-48 rounded-xl bg-white p-3 text-xs text-red-700 shadow-md" : "sr-only"}>
      {pending ? t("locale.saving") : failed ? t("locale.failed") : ""}
    </span>
  </div>;
}
