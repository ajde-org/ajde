"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { changeLocale } from "@/lib/i18n/actions";
import { locales, type Locale } from "@/lib/i18n/config";
import { useI18n } from "@/lib/i18n/provider";

const languageNames: Record<Locale, string> = { en: "English", mk: "Македонски" };

export function LanguageSelector() {
  const { locale, t, previewLocale } = useI18n();
  const id = useId();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [failed, setFailed] = useState(false);
  const [hoveredLocale, setHoveredLocale] = useState<Locale | null>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const scrollPosition = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    panel.current?.querySelector("button")?.focus();
    const closeOutside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node) && !panel.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const navigation = root.current?.closest(".site-nav");
      if (navigation && window.getComputedStyle(navigation).display === "none") {
        setOpen(false);
        return;
      }
      const bounds = trigger.current?.getBoundingClientRect();
      if (!bounds?.width || !bounds.height) return;
      const viewportWidth = document.documentElement.clientWidth;
      const panelWidth = panel.current?.getBoundingClientRect().width ?? (viewportWidth >= 1024 ? 208 : 192);
      const preferredLeft = viewportWidth >= 1024 ? bounds.right - panelWidth : bounds.left;
      const next = {
        top: bounds.bottom + 8,
        left: Math.max(8, Math.min(preferredLeft, viewportWidth - panelWidth - 8)),
      };
      setPanelPosition((previous) => previous.top === next.top && previous.left === next.left ? previous : next);
    };
    updatePosition();
    const headerBar = root.current?.closest(".site-header-bar");
    const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updatePosition);
    if (headerBar) observer?.observe(headerBar);
    if (trigger.current) observer?.observe(trigger.current);
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    window.visualViewport?.addEventListener("resize", updatePosition);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
      window.visualViewport?.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  // Cookie mutations refresh server content. Restore after translated content commits.
  useLayoutEffect(() => {
    if (pending || !scrollPosition.current) return;
    const { x, y } = scrollPosition.current;
    window.scrollTo({ left: x, top: y, behavior: "instant" });
    scrollPosition.current = null;
  }, [pending]);

  function selectLanguage(selected: Locale) {
    setOpen(false);
    trigger.current?.focus();
    if (selected === locale) return;
    scrollPosition.current = { x: window.scrollX, y: window.scrollY };
    setFailed(false);
    startTransition(async () => {
      previewLocale(selected);
      try { setFailed(!(await changeLocale(selected)).ok); }
      catch { setFailed(true); }
    });
  }

  function toggleMenu() {
    setHoveredLocale(null);
    setOpen(!open);
  }

  return <div ref={root} className="relative flex w-[90px] shrink-0 items-center max-lg:w-[72px]">
    <button ref={trigger} type="button" disabled={pending} aria-label={t("locale.switch")}
      aria-expanded={open} aria-controls={`${id}-options`} aria-busy={pending}
      aria-describedby={pending || failed ? `${id}-status` : undefined}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-2.5 text-sm font-semibold text-slate-800 hover:bg-white/75 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-50 max-lg:gap-1 max-lg:px-1.5"
      onClick={toggleMenu}>
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4.5">
        <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9S9.5 5.5 12 3Z" />
      </svg>
      <span>{locale.toUpperCase()}</span>
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className={`size-3.5 transition-transform ${open ? "rotate-180" : ""}`}><path d="m5 7 5 5 5-5" /></svg>
    </button>
    {open && createPortal(<div ref={panel} id={`${id}-options`} style={panelPosition} className="fixed z-[60] w-48 max-w-[calc(100vw-1rem)] rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl lg:w-52 lg:p-2">
      <p className="hidden px-2.5 pb-1 pt-1 text-xs font-medium text-slate-500 lg:block">{t("locale.label")}</p>
      <div className="grid gap-0.5">
        {locales.map((option) => <button key={option} type="button" disabled={pending}
          aria-current={locale === option ? "true" : undefined}
          className={`flex min-h-11 w-full min-w-0 items-center gap-1.5 rounded-xl px-2 text-left text-[13px] font-medium outline-none transition-colors focus-visible:bg-brand-200 active:bg-brand-200 lg:gap-2.5 lg:px-2.5 lg:text-sm ${hoveredLocale === option ? "bg-brand-200 text-brand-800 ring-1 ring-inset ring-brand-200" : locale === option ? "bg-brand-50 text-brand-800" : "text-slate-800"}`}
          onPointerEnter={() => setHoveredLocale(option)}
          onPointerLeave={() => setHoveredLocale((current) => current === option ? null : current)}
          onClick={() => selectLanguage(option)}>
          <span aria-hidden="true" className={`flex h-6 min-w-7 shrink-0 items-center justify-center rounded-lg border text-[11px] font-bold lg:min-w-8 ${locale === option ? "border-brand-200 bg-white text-brand-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>{option.toUpperCase()}</span>
          <span className="min-w-0 flex-1 whitespace-nowrap">{languageNames[option]}</span>
          {locale === option && <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" className="size-4 shrink-0 text-brand-700"><path d="m4 10 4 4 8-8" /></svg>}
        </button>)}
      </div>
    </div>, document.body)}
    <span id={`${id}-status`} role="status" className={failed ? "absolute right-0 top-full z-30 mt-2 w-48 rounded-xl bg-white p-3 text-xs text-red-700 shadow-md" : "sr-only"}>
      {pending ? t("locale.saving") : failed ? t("locale.failed") : ""}
    </span>
  </div>;
}
