"use client";

import { useI18n } from "@/lib/i18n/provider";
import { formatNumber, plural } from "@/lib/i18n/format";
import { useRef, useState } from "react";
import { isSupportedScreenshot, screenshotResponseSchema, type ScreenshotPost } from "@/lib/ai/screenshot-contract";

type Props = {
  disabled: boolean;
  onBusyChange: (busy: boolean) => void;
  onSelect: (post: ScreenshotPost) => void;
  onClearSelection: () => void;
};

export function ScreenshotImport({ disabled, onBusyChange, onSelect, onClearSelection }: Props) {
  const { locale, t, notice } = useI18n();
  const [posts, setPosts] = useState<ScreenshotPost[]>([]);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const busy = useRef(false);

  async function read(image: File) {
    if (disabled || busy.current) return;
    if (!isSupportedScreenshot(image.type, image.size)) {
      setError("screenshot.fileInvalid");
      return;
    }
    busy.current = true;
    setFile(image);
    setPosts([]);
    setSelected(null);
    onClearSelection();
    setError("");
    setPending(true);
    onBusyChange(true);
    try {
      const form = new FormData();
      form.append("image", image);
      const response = await fetch("/api/parse/screenshot", { method: "POST", body: form });
      const payload: unknown = await response.json();
      if (!response.ok) {
        setError("screenshot.unreadable");
        return;
      }
      const result = screenshotResponseSchema.safeParse(payload);
      if (!result.success || !result.data.posts.length) {
        setError("screenshot.unreadable");
        return;
      }
      setPosts(result.data.posts);
    } catch {
      setError("screenshot.offline");
    } finally {
      busy.current = false;
      setPending(false);
      onBusyChange(false);
    }
  }

  return <section className="min-w-0 space-y-4" aria-label={t("screenshot.read")} aria-busy={pending}>
    <section aria-label={t("screenshot.upload")}
      onDragOver={event => { event.preventDefault(); if (!disabled && !pending) setDragging(true); }}
      onDragLeave={event => { if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
      onDrop={event => {
        event.preventDefault(); setDragging(false);
        if (disabled || pending) return;
        if (event.dataTransfer.files.length !== 1) { setError("screenshot.oneFile"); return; }
        void read(event.dataTransfer.files[0]);
      }}
      className={`relative rounded-xl border-2 border-dashed px-5 py-8 text-center transition focus-within:ring-2 focus-within:ring-brand-500 focus-within:ring-offset-2 ${dragging ? "border-brand-500 bg-brand-50" : "border-slate-200 bg-slate-50/70 hover:border-brand-500"} ${disabled || pending ? "opacity-60" : ""}`}>
      <svg className="mx-auto mb-3 text-brand-600" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="4" /><circle cx="8" cy="8" r="1.5" /><path d="m4 17 5-5 4 4 3-3 5 5" /></svg>
      <p className="text-sm font-semibold text-slate-800">{file ? t("screenshot.chooseAnother") : t("screenshot.choose")}</p>
      <p className="mt-1 text-xs text-slate-500">{t("screenshot.drop")}</p>
      <p className="mt-3 text-xs text-slate-500">{t("screenshot.formats")}</p>
      <input className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-wait"
        aria-label={t("screenshot.orUpload")} type="file" accept="image/png,image/jpeg,image/webp" disabled={disabled || pending}
        onChange={event => { const image = event.target.files?.[0]; event.target.value = ""; if (image) void read(image); }} />
    </section>
    {file ? <div className="flex min-w-0 items-center gap-3 rounded-lg bg-slate-50 px-3 py-2 text-xs">
      <span className="min-w-0 flex-1 truncate font-medium text-slate-700" title={file.name}>{file.name}</span>
      <span className="shrink-0 text-slate-500">{Math.max(1, Math.round(file.size / 1024))} KB</span>
      <button type="button" className="shrink-0 rounded-md px-2 py-2 text-slate-500 hover:bg-slate-200 hover:text-slate-900 disabled:opacity-50"
        aria-label={t("screenshot.removeLabel")} disabled={disabled || pending} onClick={() => { setFile(null); setPosts([]); setSelected(null); setError(""); onClearSelection(); }}>{t("screenshot.remove")}</button>
    </div> : null}
    {pending ? <p role="status" className="flex items-center gap-2 text-sm text-brand-700"><span aria-hidden="true" className="size-4 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 motion-reduce:animate-none" />{t("screenshot.reading")}</p> : null}
    {error ? <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-950"><p role="alert">{notice(error, "screenshot.unreadable")}</p>
      {file ? <button className="mt-2 font-semibold underline disabled:opacity-50" type="button" disabled={disabled || pending} onClick={() => { void read(file); }}>{t("screenshot.retry")}</button> : null}
    </div> : null}
    {posts.length ? <div className="space-y-3" aria-label={t("screenshot.detected")}>
      <div className="flex items-center justify-between gap-2"><h3 className="text-sm font-semibold text-slate-900">{t("screenshot.choosePost")}</h3><span className="text-xs text-slate-500">{t(`screenshot.found.${plural(locale, posts.length)}`, { count: formatNumber(locale, posts.length) })}</span></div>
      <div className="max-h-96 space-y-2 overflow-y-auto overscroll-contain p-0.5">
        {posts.map((post, index) => <article key={index} className={`min-w-0 rounded-xl border p-3 ${selected === index ? "border-brand-500 bg-brand-50/60" : "border-slate-200 bg-white"}`}>
          <div className="flex items-center justify-between"><span className={`rounded-full px-2 py-0.5 text-[.6875rem] font-semibold uppercase ${post.kind === "offer" ? "bg-brand-100 text-brand-800" : "bg-slate-100 text-slate-500"}`}>{t(`import.kind.${post.kind}`)}</span><span className="text-xs text-slate-500">{t("screenshot.post", { number: formatNumber(locale, index + 1) })}</span></div>
          <p className="my-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">{post.text}</p>
          <button className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:opacity-50" type="button"
            aria-pressed={selected === index} disabled={disabled || pending} onClick={() => { setSelected(index); onSelect(post); }}>{selected === index ? t("screenshot.selected") : t("screenshot.use")}</button>
        </article>)}
      </div>
    </div> : null}
    <p className="text-xs leading-relaxed text-slate-500">{t("screenshot.privacy")}</p>
  </section>;
}
