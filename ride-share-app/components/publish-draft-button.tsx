"use client";

import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n/provider";
import { publishDraft } from "@/lib/rides/publish-draft";

export function PublishDraftButton({ rideId }: { rideId: string }) {
  const { t, notice } = useI18n();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  return <div className="mt-4 min-w-0">
    <button type="button" disabled={pending || result?.success} className="btn-primary w-full sm:w-auto disabled:opacity-60"
      onClick={() => startTransition(async () => {
        try { setResult(await publishDraft(rideId)); }
        catch { setResult({ success: false, message: "draftPublish.failed" }); }
      })}>{t(pending ? "form.publishing" : "form.publish")}</button>
    {result ? <p role={result.success ? "status" : "alert"} className="mt-2 text-sm">{notice(result.message, "draftPublish.failed")}</p> : null}
  </div>;
}
