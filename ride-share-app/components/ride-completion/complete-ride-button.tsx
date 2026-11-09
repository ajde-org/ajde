"use client";


import { useI18n } from "@/lib/i18n/provider";
import { useState, useTransition } from "react";

import { completeRide } from "@/lib/ride-completion/actions";

export function CompleteRideButton({ rideId }: { rideId: string }) {
  const { t, notice } = useI18n();
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={pending || result?.success}
        onClick={() => startTransition(async () => {
          try {
            setResult(await completeRide(rideId));
          } catch {
            setResult({ success: false, message: "completion.failed" });
          }
        })}
        className="btn-primary disabled:opacity-60"
      >
        {pending ? t("completion.pending") : t("completion.mark")}
      </button>
      {result ? <p role={result.success ? "status" : "alert"} className="mt-2 text-sm text-brand-700">{notice(result.message, "completion.failed")}</p> : null}
    </div>
  );
}
